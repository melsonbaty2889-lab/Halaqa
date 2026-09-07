import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RegionSelector from './components/RegionSelector';
import PromoCodeInput from './components/PromoCodeInput';
import PlanCard from './components/PlanCard';
import PaymentSection from './PaymentSection';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme';
import { ArrowLeft, Globe } from 'lucide-react';
import { 
  SUBSCRIPTION_PLANS, 
  validateCoupon, 
  calculateFinalPrice 
} from '@/constants/subscriptionData';

// 🌐 دالة الاكتشاف التلقائي لإقليم العميل بناءً على المنطقة الزمنية للمتصفح
const detectUserRegion = () => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Cairo') || timeZone.includes('Africa/Cairo')) {
      return 'egypt';
    } 
    if (
      timeZone.includes('Riyadh') || timeZone.includes('Dubai') || 
      timeZone.includes('Kuwait') || timeZone.includes('Qatar') || 
      timeZone.includes('Bahrain') || timeZone.includes('Muscat')
    ) {
      return 'gcc';
    }
    return 'global'; // الافتراضي للدول الدولية (أوروبا، أمريكا، باقي آسيا)
  } catch (e) {
    return 'global';
  }
};

export default function SubscriptionPage({ isRTL = true, onBack }) {
  const { t, i18n } = useTranslation();

  // 🌍 ضبط الإقليم الافتراضي ديناميكياً بدلاً من القيمة الصلبة 'egypt'
  const [region, setRegion] = useState(() => detectUserRegion());
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // السنوي افتراضي
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // جلب ألوان الثيم آمنة مع دعم الأوضاع الداكنة
  const themeColors = useMemo(() => {
    return colors || {
      dark: { card: '#0F172A', border: '#1E293B', text: '#F8FAFC', textMuted: '#CBD5E1' },
      accent: { primary: '#0F766E', gold: '#F59E0B' }
    };
  }, []);

  // جلب الأسعار والعملة ديناميكياً من ملف الثوابت الموحد
  const currentRegionData = useMemo(() => {
    return SUBSCRIPTION_PLANS[region] || SUBSCRIPTION_PLANS.egypt;
  }, [region]);

  const currencyLabel = useMemo(() => {
    return t(currentRegionData.currencyKey, currentRegionData.defaultCurrency);
  }, [t, currentRegionData]);

  // تجهيز خطتي (الشهري والسنوي) فقط
  const plans = useMemo(() => {
    const monthlyPrice = currentRegionData.plans.monthly.price;
    const yearlyPrice = currentRegionData.plans.yearly.price;

    return [
      {
        id: 'monthly',
        title: t('subscription.plans.monthlyTitle', 'الوصول المرن (اشتراك شهري)'),
        description: t('subscription.plans.monthlyDesc', 'مثالي للمراكز والحلقات الناشئة'),
        periodText: t('subscription.periods.monthly', 'شهرياً'),
        basePrice: monthlyPrice,
        features: [
          t('subscription.features.instantAccess', 'تفعيل فوري لكامل النظام'),
          t('subscription.features.management', 'إدارة الطلاب والدورات والحلقات'),
          t('subscription.features.standardSupport', 'دعم فني قياسي ومستمر')
        ]
      },
      {
        id: 'yearly',
        title: t('subscription.plans.yearlyTitle', 'الكفاءة المستدامة (ترخيص سنوي)'),
        badge: isRTL 
          ? (currentRegionData.plans.yearly.badgeAr || 'توفير شهرين مجاناً 🔥')
          : (currentRegionData.plans.yearly.badgeEn || 'Save 2 Months 🔥'),
        badgeBg: 'bg-[#10B981]',
        description: t('subscription.plans.yearlyDesc', 'للمؤسسات والمقارئ المتكاملة'),
        periodText: t('subscription.periods.yearly', 'سنوياً'),
        basePrice: yearlyPrice,
        features: [
          t('subscription.features.allMonthly', 'كل مميزات الاشتراك الشهري'),
          t('subscription.features.saveMonths', 'توفير قيمة شهرين كاملين'),
          t('subscription.features.prioritySupport', 'أولوية في الدعم الفني والتحديثات')
        ]
      }
    ];
  }, [currentRegionData, isRTL, t]);

  // تطبيق كود الخصم باستخدام دالة validateCoupon
  const handleApplyPromo = useCallback(() => {
    setPromoError('');
    const couponResult = validateCoupon(promoCode);

    if (couponResult.valid) {
      setAppliedDiscount(couponResult.discountPercent);
    } else {
      setAppliedDiscount(0);
      setPromoError(t('subscription.errors.invalidPromo', 'كود الخصم غير صحيح أو منتهي الصلاحية'));
    }
  }, [promoCode, t]);

  // إرسال طلب الاشتراك والتأكيد
  const handleSubmitSubscription = useCallback(async (methodId, isManual, receiptFile) => {
    setLoading(true);
    try {
      let receiptUrl = null;

      // رفع صورة الإشعار أو الإيصال بكتلة محامية بـ Supabase
      if (receiptFile && supabase?.storage) {
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

      if (supabase?.from) {
        const { error: insertError } = await supabase.from('subscriptions').insert([
          {
            plan_type: selectedPlan,
            region: region,
            payment_method: methodId,
            transaction_ref: txId,
            receipt_url: receiptUrl,
            discount_percentage: appliedDiscount,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

        if (insertError) throw insertError;
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('🚨 Error submitting subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, region, txId, appliedDiscount]);

  // تبديل لغة الواجهة
  const toggleLanguage = useCallback(() => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  }, [i18n]);

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
        
        {/* أزرار العودة واللغة بالأعلى */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1E293B]">
          <button 
            onClick={onBack} 
            aria-label={t('subscription.backToDashboard', 'العودة إلى مركز التحكم والتحليلات')}
            className="flex items-center gap-2 bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-[#CBD5E1] transition-all cursor-pointer"
          >
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            <span>{t('subscription.backToDashboard', 'العودة إلى مركز التحكم والتحليلات')}</span>
          </button>

          <button 
            onClick={toggleLanguage}
            aria-label={t('common.switchLanguage', 'تغيير اللغة')}
            className="flex items-center gap-2 bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-[#F59E0B] transition-all cursor-pointer"
          >
            <Globe size={16} />
            <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>

        {/* الهيدر الرئيسي */}
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F59E0B] mb-3 leading-tight">
            {t('subscription.headerTitle', 'امتلاك ترخيص المنظومة - منصة الحلقة الذكية')}
          </h1>
          <p className="text-[#CBD5E1] text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('subscription.headerSubtitle', 'اختر خطة الاستثمار الأكاديمي الأنسب لك، وانضم إلى كبرى الأكاديميات والمراكز التعليمية حول العالم.')}
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

        {/* كروت الخطط (شهري / سنوي) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {plans.map((p) => {
            const finalPrice = calculateFinalPrice(p.basePrice, appliedDiscount);
            return (
              <PlanCard 
                key={p.id}
                plan={p}
                isSelected={selectedPlan === p.id}
                onSelect={() => setSelectedPlan(p.id)}
                finalPrice={finalPrice}
                currency={currencyLabel}
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
