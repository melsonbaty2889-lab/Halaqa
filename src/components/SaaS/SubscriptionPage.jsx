import React, { useState } from 'react';
import RegionSelector from './components/RegionSelector';
import PromoCodeInput from './components/PromoCodeInput';
import PlanCard from './components/PlanCard';
import PaymentSection from './PaymentSection';
import { supabase } from '@/lib/supabase';
import { colors, UI } from '@/theme';
import { ArrowLeft, Globe } from 'lucide-react';

export default function SubscriptionPage({ isRTL = true, onBack }) {
  const [region, setRegion] = useState('egypt');
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // السنوي افتراضي
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // الأسعار الأصلية الكاملة بالجمهوريات والعملات
  const pricingData = {
    egypt: { currency: 'جنيه مصري', monthly: 150, yearly: 1500, lifetime: 3500 },
    gcc: { currency: 'ريال سعودي', monthly: 95, yearly: 750, lifetime: 1800 },
    global: { currency: 'دولار', monthly: 25, yearly: 200, lifetime: 500 }
  };

  const currentPricing = pricingData[region] || pricingData.egypt;

  // الخطط الثلاث كاملة الأصلية
  const plans = [
    {
      id: 'monthly',
      title: isRTL ? 'الوصول المرن (اشتراك شهري)' : 'Flexible Monthly Plan',
      description: isRTL ? 'مثالي للمراكز والحلقات الناشئة' : 'Ideal for small academies',
      periodText: isRTL ? 'شهرياً' : 'month',
      basePrice: currentPricing.monthly,
      features: [
        isRTL ? 'تفعيل فوري لكامل النظام' : 'Instant full access',
        isRTL ? 'إدارة الطلاب والدورات' : 'Student & Course Management',
        isRTL ? 'دعم فني قياسي' : 'Standard Support'
      ]
    },
    {
      id: 'yearly',
      title: isRTL ? 'الكفاءة المستدامة (ترخيص سنوي)' : 'Sustainable Yearly Plan',
      badge: isRTL ? 'توفير شهرين مجاناً 🔥' : '2 Months Free 🔥',
      badgeBg: 'bg-[#10B981]',
      description: isRTL ? 'للمؤسسات والمقارئ المتكاملة' : 'For full academies',
      periodText: isRTL ? 'سنوياً' : 'year',
      basePrice: currentPricing.yearly,
      features: [
        isRTL ? 'كل مميزات الاشتراك الشهري' : 'All Monthly Plan features',
        isRTL ? 'توفير قيمة شهرين كاملين' : 'Save 2 full months value',
        isRTL ? 'أولوية في الدعم الفني' : 'Priority Technical Support'
      ]
    },
    {
      id: 'lifetime',
      title: isRTL ? 'الترخيص الأبدي للمؤسسين (مدى الحياة)' : 'Lifetime Founder License',
      badge: isRTL ? 'فرصة حصرية للمؤسسين ⚡' : 'Exclusive Founder Offer ⚡',
      badgeBg: 'bg-[#EF4444]',
      description: isRTL ? 'ادفع مرة واحدة واحصل على الوصول الدائم' : 'Pay once, access forever',
      periodText: isRTL ? 'مدى الحياة' : 'lifetime',
      basePrice: currentPricing.lifetime,
      features: [
        isRTL ? 'ترخيص دائم بدون أي رسوم تجديد' : 'Permanent license with no renewal fees',
        isRTL ? 'جميع التحديثات المستقبلية مجاناً' : 'All future updates included for free',
        isRTL ? 'دعم VIP خاص وحصري' : 'Exclusive VIP Support'
      ]
    }
  ];

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.trim() === 'S20' || promoCode.trim() === 'HALAQA20') {
      setAppliedDiscount(20);
    } else if (promoCode.trim() === 'PROMO50') {
      setAppliedDiscount(50);
    } else {
      setAppliedDiscount(0);
      setPromoError(isRTL ? 'كود الخصم غير صحيح أو منتهي الصلاحية' : 'Invalid promo code');
    }
  };

  const handleSubmitSubscription = async (methodId, isManual, receiptFile) => {
    setLoading(true);
    try {
      let receiptUrl = null;

      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('saas-receipts')
          .upload(fileName, receiptFile);

        if (!uploadError) {
          const { data } = supabase.storage.from('saas-receipts').getPublicUrl(fileName);
          receiptUrl = data?.publicUrl;
        }
      }

      await supabase.from('subscriptions').insert([
        {
          plan_type: selectedPlan,
          region: region,
          payment_method: methodId,
          transaction_ref: txId,
          receipt_url: receiptUrl,
          discount_percentage: appliedDiscount,
          status: 'pending'
        }
      ]);

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 25%, rgba(15, 118, 110, 0.18) 0%, #070C12 70%)',
        fontFamily: "'Cairo', sans-serif"
      }}
      className="py-10 px-4 text-[#F8FAFC]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* أزرار العودة واللغة بالأعلى (مطابقة للصورة الأصلية) */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1E293B]">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] px-4 py-2.5 rounded-xl text-xs font-bold text-[#CBD5E1] transition-all"
          >
            <ArrowLeft size={16} />
            <span>{isRTL ? 'العودة إلى مركز التحكم والتحليلات' : 'Back to Dashboard'}</span>
          </button>

          <button className="flex items-center gap-2 bg-[#0F172A] border border-[#1E293B] px-4 py-2.5 rounded-xl text-xs font-bold text-[#F59E0B]">
            <Globe size={16} />
            <span>English</span>
          </button>
        </div>

        {/* الهيدر الأصلي بكلماته النصية بالكامل */}
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F59E0B] mb-3 leading-tight">
            {isRTL ? 'امتلاك ترخيص المنظومة - منصة الحلقة الذكية' : 'Get License - Smart Halaqa Platform'}
          </h1>
          <p className="text-[#CBD5E1] text-xs sm:text-sm max-w-xl leading-relaxed">
            {isRTL 
              ? 'اختر خطة الاستثمار الأكاديمي الأنسب لك، وانضم إلى كبرى الأكاديميات والمراكز التعليمية حول العالم.' 
              : 'Choose the best academic investment plan for your institution.'}
          </p>
        </div>

        {/* محدد المنطقة والعملة */}
        <RegionSelector 
          region={region} 
          setRegion={setRegion} 
          isRTL={isRTL} 
        />

        {/* أدخل كود الخصم */}
        <PromoCodeInput 
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          onApply={handleApplyPromo}
          appliedDiscount={appliedDiscount}
          error={promoError}
          isRTL={isRTL}
        />

        {/* كروت الخطط الثلاث كاملة (شهري / سنوي / مدى الحياة) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((p) => {
            const finalPrice = Math.round(p.basePrice * (1 - appliedDiscount / 100));
            return (
              <PlanCard 
                key={p.id}
                plan={p}
                isSelected={selectedPlan === p.id}
                onSelect={() => setSelectedPlan(p.id)}
                finalPrice={finalPrice}
                currency={currentPricing.currency}
                isRTL={isRTL}
              />
            );
          })}
        </div>

        {/* قسم الدفع والتأكيد */}
        <PaymentSection 
          region={region}
          txId={txId}
          setTxId={setTxId}
          isSubmitted={isSubmitted}
          loading={loading}
          onSubmit={handleSubmitSubscription}
          isRTL={isRTL}
        />

      </div>
    </div>
  );
}
