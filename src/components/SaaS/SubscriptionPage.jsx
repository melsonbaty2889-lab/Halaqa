import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RegionSelector from './components/RegionSelector';
import PromoCodeInput from './components/PromoCodeInput';
import PlanCard from './components/PlanCard';
import PaymentSection from './PaymentSection';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { 
  SUBSCRIPTION_PLANS, 
  validateCoupon, 
  calculateFinalPrice 
} from '@/constants/subscriptionData';

// 🌐 اكتشاف إقليم العميل تلقائياً بناءً على المنطقة الزمنية لمتصفح المستخدم
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
    return 'global';
  } catch (e) {
    return 'global';
  }
};

export default function SubscriptionPage({ onBack }) {
  const { t, i18n } = useTranslation();
  
  // 🌍 تحديد اتجاه الصفحة ولغة النظام بناءً على المحول العام للموقع
  const isRTL = i18n.dir ? i18n.dir() === 'rtl' : i18n.language === 'ar';

  // 🌍 ضبط الإقليم والخيارات الافتراضية
  const [region, setRegion] = useState(() => detectUserRegion());
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // الاشتراك السنوي افتراضي
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // جلب ألوان النظام الموحدة
  const theme = useMemo(() => ({
    bg: colors?.dark?.bg,
    cardBg: colors?.dark?.card,
    borderColor: colors?.dark?.cardBorder,
    accent: colors?.emerald?.light,
    textPrimary: colors?.dark?.text,
    textMuted: colors?.dark?.textMuted,
    textSubtle: colors?.dark?.textSubtle,
  }), []);

  // جلب الأسعار والعملة ديناميكياً من ملف الثوابت الموحد
  const currentRegionData = useMemo(() => {
    return SUBSCRIPTION_PLANS[region] || SUBSCRIPTION_PLANS.egypt;
  }, [region]);

  const currencyLabel = useMemo(() => {
    return t(currentRegionData.currencyKey, currentRegionData.defaultCurrency);
  }, [t, currentRegionData]);

  // بناء خطط الاشتراك (الشهري والسنوي) بصياغة حيدة وعالمية
  const plans = useMemo(() => {
    const monthlyPrice = currentRegionData.plans.monthly.price;
    const yearlyPrice = currentRegionData.plans.yearly.price;

    return [
      {
        id: 'monthly',
        title: t('subscription.plans.monthlyTitle', 'الوصول المرن (اشتراك شهري)'),
        description: t('subscription.plans.monthlyDesc', 'مناسب للمراكز والمؤسسات الناشئة لمرونة السداد'),
        periodText: t('subscription.periods.monthly', 'شهرياً'),
        basePrice: monthlyPrice,
        features: [
          t('subscription.features.instantAccess', 'تفعيل فوري ووصول لكافة الخصائص والأدوات'),
          t('subscription.features.management', 'إدارة الحلقات والطلاب والمعلمين بدون قيود'),
          t('subscription.features.standardSupport', 'دعم فني وتحديثات نظام دورية مستمرة')
        ]
      },
      {
        id: 'yearly',
        title: t('subscription.plans.yearlyTitle', 'الاستقرار الأكاديمي (اشتراك سنوي)'),
        badge: isRTL 
          ? (currentRegionData.plans.yearly.badgeAr || 'توفير شهرين مجاناً 🔥')
          : (currentRegionData.plans.yearly.badgeEn || 'Save 2 Months 🔥'),
        badgeBg: theme.accent,
        description: t('subscription.plans.yearlyDesc', 'خيار مستدام للمؤسسات والمجمعات التعليمية المتكاملة'),
        periodText: t('subscription.periods.yearly', 'سنوياً'),
        basePrice: yearlyPrice,
        features: [
          t('subscription.features.allMonthly', 'جميع المميزات المتوفرة في الاشتراك الشهري'),
          t('subscription.features.saveMonths', 'توفير تكلفة شهرين كاملين عند السداد السنوي'),
          t('subscription.features.prioritySupport', 'أولوية في الدعم الفني المباشر والتطوير المخصص')
        ]
      }
    ];
  }, [currentRegionData, isRTL, t, theme.accent]);

  // معالجة وتطبيق كود الخصم
  const handleApplyPromo = useCallback(() => {
    setPromoError('');
    const couponResult = validateCoupon(promoCode);

    if (couponResult.valid) {
      setAppliedDiscount(couponResult.discountPercent);
    } else {
      setAppliedDiscount(0);
      setPromoError(t('subscription.errors.invalidPromo', 'كود الخصم غير صحيح أو غير سارٍ'));
    }
  }, [promoCode, t]);

  // إرسال وإدراج الاشتراك في قاعدة البيانات الموحدة
  const handleSubmitSubscription = useCallback(async (methodId, isManual, receiptFile) => {
    setLoading(true);
    try {
      let receiptUrl = null;

      // رفع إشعار التحويل المالي إن وجد
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

      // الحفظ في جدول saas_subscriptions
      if (supabase?.from) {
        const { error: insertError } = await supabase.from('saas_subscriptions').insert([
          {
            plan_duration: selectedPlan,
            payment_gateway: methodId,
            status: 'pending_verification',
            metadata: {
              region: region,
              transaction_ref: txId,
              receipt_url: receiptUrl,
              discount_applied: appliedDiscount
            },
            created_at: new Date().toISOString()
          }
        ]);

        if (insertError) throw insertError;
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('🚨 الخطأ عند معالجة طلب الاشتراك:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, region, txId, appliedDiscount]);

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: theme.bg,
        color: theme.textPrimary,
        fontFamily: "'Cairo', sans-serif"
      }}
      className="py-10 px-4 transition-colors duration-200"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* زر العودة العلوي فقط بدون محول لغات محلي */}
        <div 
          className="flex items-center justify-start pb-4 border-b"
          style={{ borderColor: theme.borderColor }}
        >
          <button 
            onClick={onBack} 
            aria-label={t('subscription.backToDashboard', 'العودة إلى لوحة التحكم')}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer border hover:opacity-90"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.borderColor,
              color: theme.textMuted 
            }}
          >
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            <span>{t('subscription.backToDashboard', 'العودة إلى لوحة التحكم')}</span>
          </button>
        </div>

        {/* العنوان الرئيسي والتعريفي */}
        <div className="flex flex-col items-center text-center space-y-3">
          <h1 
            className="text-2xl sm:text-4xl font-extrabold leading-tight"
            style={{ color: theme.accent }}
          >
            {t('subscription.headerTitle', 'خطط اشتراك منصة الحلقة الذكية')}
          </h1>
          <p className="text-xs sm:text-sm max-w-xl leading-relaxed" style={{ color: theme.textMuted }}>
            {t('subscription.headerSubtitle', 'اختر خطة الاستثمار الأكاديمي الأنسب لمؤسستك، وانضم إلى كبرى المراكز والجهات التعليمية حول العالم.')}
          </p>
        </div>

        {/* في حالة إتمام الطلب بنجاح */}
        {isSubmitted ? (
          <div 
            className="p-8 rounded-2xl border text-center space-y-4 max-w-lg mx-auto"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
          >
            <CheckCircle2 size={48} className="mx-auto" style={{ color: theme.accent }} />
            <h2 className="text-xl font-extrabold" style={{ color: theme.textPrimary }}>
              {t('subscription.successTitle', 'تم استلام طلب الاشتراك بنجاح')}
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
              {t('subscription.successDesc', 'جاري مراجعة إشعار التحويل وتفعيل خطة الاشتراك الخاصة بأكاديميتك في أقرب وقت.')}
            </p>
            <button
              onClick={onBack}
              className="mt-4 px-6 py-3 rounded-xl text-xs font-bold w-full transition-all cursor-pointer"
              style={{ backgroundColor: theme.accent, color: theme.bg }}
            >
              {t('subscription.backToDashboard', 'العودة إلى لوحة التحكم')}
            </button>
          </div>
        ) : (
          <>
            {/* محدد المنطقة والعملة */}
            <RegionSelector 
              region={region} 
              setRegion={setRegion} 
              isRTL={isRTL} 
            />

            {/* إدخال كود الخصم */}
            <PromoCodeInput 
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              onApply={handleApplyPromo}
              appliedDiscount={appliedDiscount}
              error={promoError}
              isRTL={isRTL}
            />

            {/* عرض بطاقات الخطط المتاحة (شهري / سنوي) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* قسم وسيلة الدفع والتأكيد */}
            <PaymentSection 
              region={region}
              txId={txId}
              setTxId={setTxId}
              isSubmitted={isSubmitted}
              loading={loading}
              onSubmit={handleSubmitSubscription}
              isRTL={isRTL}
            />
          </>
        )}

      </div>
    </div>
  );
}
