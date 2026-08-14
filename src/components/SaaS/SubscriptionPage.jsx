import React, { useState } from 'react';
import RegionSelector from './components/RegionSelector';
import PromoCodeInput from './components/PromoCodeInput';
import PlanCard from './components/PlanCard';
import PaymentSection from './PaymentSection';
import { supabase } from '@/lib/supabase';

export default function SubscriptionPage({ isRTL = true }) {
  const [region, setRegion] = useState('egypt');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // الأسعار والعملات حسب المنطقة المحددة
  const pricingData = {
    egypt: { currency: 'ج.م', monthly: 750, yearly: 6000 },
    gcc: { currency: 'ر.س', monthly: 95, yearly: 750 },
    global: { currency: 'USD', monthly: 25, yearly: 200 }
  };

  const currentPricing = pricingData[region] || pricingData.egypt;

  const plans = [
    {
      id: 'monthly',
      title: isRTL ? 'الاشتراك الشهري' : 'Monthly Plan',
      description: isRTL ? 'مثالي للمراكز والحلقات الناشئة' : 'Ideal for small or starting academies',
      period: 'monthly',
      basePrice: currentPricing.monthly,
      features: [
        isRTL ? 'إدارة حتى 100 طالب' : 'Up to 100 Students',
        isRTL ? 'متابعة وتسميع مباشر' : 'Live Quran Recitation Tracking',
        isRTL ? 'إصدار الشهادات الرقمية' : 'Digital Verification Certificates',
        isRTL ? 'دعم فني وتحديثات مستمرة' : 'Direct Technical Support'
      ]
    },
    {
      id: 'yearly',
      title: isRTL ? 'الاشتراك السنوي' : 'Yearly Plan',
      badge: isRTL ? 'الأكثر توفيراً (توفير 33%)' : 'Best Value (Save 33%)',
      description: isRTL ? 'للمؤسسات والمقارئ المتكاملة' : 'For full academies & large organizations',
      period: 'yearly',
      basePrice: currentPricing.yearly,
      features: [
        isRTL ? 'عدد طلاب غير محدود' : 'Unlimited Students',
        isRTL ? 'جميع مميزات الخطة الشهرية' : 'All Monthly Plan Features',
        isRTL ? 'نظام التقارير المتقدمة للوالدين' : 'Advanced Parent Report System',
        isRTL ? 'دعم أولوية على مدار 24 ساعة' : '24/7 Priority Support'
      ]
    }
  ];

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.trim() === 'HALAQA20') {
      setAppliedDiscount(20);
    } else if (promoCode.trim() === 'PROMO50') {
      setAppliedDiscount(50);
    } else {
      setAppliedDiscount(0);
      setPromoError(isRTL ? 'كود الخصم غير صحيح أو منتهي الصلاحية' : 'Invalid or expired promo code');
    }
  };

  const handleSubmitSubscription = async (methodId, isManual, receiptFile) => {
    setLoading(true);
    try {
      let receiptUrl = null;

      // رفع صورة الإشعار إلى Supabase Storage إن وجدت
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

      // إدراج الطلب في جدول الاشتراكات
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
      className="py-12 px-4 text-[#F8FAFC]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* الهيدر بدون لوجو */}
        <div className="flex flex-col items-center text-center mb-10 pt-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mb-2">
            {isRTL ? 'اختر الخطة المناسبة لمنظومتك' : 'Choose Your Academy Plan'}
          </h1>
          <p className="text-[#D97706] text-xs font-bold tracking-wider uppercase">
            {isRTL ? 'احصل على كامل أدوات إدارة المقارئ والشهادات الرقمية' : 'ACADEMY MANAGEMENT & DIGITAL CERTIFICATES'}
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

        {/* كروت الخطط والأسعار */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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
