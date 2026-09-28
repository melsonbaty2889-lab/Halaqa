import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RegionSelector from './components/RegionSelector';
import PromoCodeInput from './components/PromoCodeInput';
import PlanCard from './components/PlanCard';
import PaymentSection from './PaymentSection';
import { supabase } from '@/lib/supabase';
import { UI } from '@/theme/styles';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { 
  SUBSCRIPTION_PLANS, 
  validateCoupon, 
  calculateFinalPrice,
  detectUserCurrencyRegion
} from '@/constants/subscriptionData';

export default function SubscriptionPage({ onBack }) {
  const { t, i18n } = useTranslation();
  
  // 🌍 تحديد اتجاه الصفحة ولغة النظام بناءً على المحول العام للموقع
  const isRTL = i18n.dir ? i18n.dir() === 'rtl' : i18n.language === 'ar';

  // 🌍 ضبط العملة والنطاق المالي الافتراضي ديناميكياً بحيادية
  const [region, setRegion] = useState(() => detectUserCurrencyRegion());
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // الاشتراك السنوي افتراضي
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // جلب الأسعار والعملة ديناميكياً من ملف الثوابت الموحد
  const currentRegionData = useMemo(() => {
    return SUBSCRIPTION_PLANS[region] || SUBSCRIPTION_PLANS.USD;
  }, [region]);

  const currencyLabel = useMemo(() => {
    return t(currentRegionData.currencyKey, currentRegionData.defaultCurrency);
  }, [t, currentRegionData]);

  // بناء خطط الاشتراك (الشهري والسنوي) بصياغة محايدة وعالمية
  const plans = useMemo(() => {
    const monthlyPrice = currentRegionData.plans.monthly.price;
    const yearlyPrice = currentRegionData.plans.yearly.price;

    const getBadgeText = () => {
      const lang = (i18n.language || 'ar').toLowerCase();
      if (lang.startsWith('en')) return currentRegionData.plans.yearly.badgeEn;
      if (lang.startsWith('fr')) return currentRegionData.plans.yearly.badgeFr || currentRegionData.plans.yearly.badgeEn;
      if (lang.startsWith('tr')) return currentRegionData.plans.yearly.badgeTr || currentRegionData.plans.yearly.badgeEn;
      if (lang.startsWith('ur')) return currentRegionData.plans.yearly.badgeUr || currentRegionData.plans.yearly.badgeAr;
      if (lang.startsWith('id')) return currentRegionData.plans.yearly.badgeId || currentRegionData.plans.yearly.badgeEn;
      return currentRegionData.plans.yearly.badgeAr;
    };

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
        badge: getBadgeText(),
        badgeBg: 'bg-semantic-success',
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
  }, [currentRegionData, i18n.language, t]);

  // معالجة وتطبيق كود الخصم
  const handleApplyPromo = useCallback((codeToApply) => {
    setPromoError('');
    const code = (typeof codeToApply === 'string' ? codeToApply : promoCode).trim();
    const couponResult = validateCoupon(code);

    if (couponResult.valid) {
      setAppliedDiscount(couponResult.discountPercent);
    } else {
      setAppliedDiscount(0);
      setPromoError(t('subscription.errors.invalidPromo', 'كود الخصم غير صحيح أو غير سارٍ'));
    }
  }, [promoCode, t]);

  // دالة الإلغاء الصريحة المضافة في المكوّن الأب
  const handleRemovePromo = useCallback(() => {
    setAppliedDiscount(0);
    setPromoCode('');
    setPromoError('');
  }, []);

  // إرسال وإدراج الاشتراك في قاعدة البيانات الموحدة
  const handleSubmitSubscription = useCallback(async (methodId, isManual, receiptFile) => {
    setLoading(true);
    try {
      let receiptUrl = null;

      if (receiptFile && supabase?.storage) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('saas-receipts')
          .upload(fileName, receiptFile);

        if (!uploadError) {
          const { data } = supabase.storage.from('saas-receipts').getPublicUrl(fileName);
          receiptUrl = data?.publicUrl;
        }
      }

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
      className="min-h-screen bg-semantic-bgMain text-semantic-textPrimary py-10 px-4 transition-colors duration-200 font-cairo"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* زر العودة العلوي فقط */}
        <div className="flex items-center justify-start pb-4 border-b border-semantic-borderCard">
          <button 
            onClick={onBack} 
            aria-label={t('subscription.backToDashboard', 'العودة إلى لوحة التحكم')}
            className={`${UI.card} flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer border hover:opacity-90 text-semantic-textSecondary`}
          >
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            <span>{t('subscription.backToDashboard', 'العودة إلى لوحة التحكم')}</span>
          </button>
        </div>

        {/* العنوان الرئيسي والتعريفي */}
        <div className="flex flex-col items-center text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight text-semantic-actionPrimary">
            {t('subscription.headerTitle', 'خطط اشتراك منصة الحلقة الذكية')}
          </h1>
          <p className={`${UI.subtitle} text-xs sm:text-sm max-w-xl leading-relaxed`}>
            {t('subscription.headerSubtitle', 'اختر خطة الاستثمار الأكاديمي الأنسب لمؤسستك، وانضم إلى كبرى المراكز والجهات التعليمية حول العالم.')}
          </p>
        </div>

        {/* شاشة إتمام الطلب بنجاح */}
        {isSubmitted ? (
          <div className={`${UI.card} p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto`}>
            <CheckCircle2 size={48} className="mx-auto text-semantic-actionPrimary" />
            <h2 className="text-xl font-extrabold text-semantic-textPrimary">
              {t('subscription.successTitle', 'تم استلام طلب الاشتراك بنجاح')}
            </h2>
            <p className={`${UI.subtitle} text-xs leading-relaxed`}>
              {t('subscription.successDesc', 'جاري مراجعة إشعار التحويل وتفعيل خطة الاشتراك الخاصة بأكاديميتك في أقرب وقت.')}
            </p>
            <button
              onClick={onBack}
              className={`${UI.btnEmerald} mt-4 px-6 py-3 rounded-xl text-xs font-bold w-full transition-all cursor-pointer`}
            >
              {t('subscription.backToDashboard', 'العودة إلى لوحة التحكم')}
            </button>
          </div>
        ) : (
          <>
            {/* محدد العملة والمنطقة */}
            <RegionSelector 
              region={region} 
              setRegion={setRegion} 
              isRTL={isRTL} 
            />

            {/* إدخال كود الخصم مع الربط بـ onRemove الصريحة */}
            <PromoCodeInput 
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              onApply={handleApplyPromo}
              onRemove={handleRemovePromo}
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
