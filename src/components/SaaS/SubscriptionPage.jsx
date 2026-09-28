import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RegionSelector from './components/RegionSelector';
import PromoCodeInput from './components/PromoCodeInput';
import PlanCard from './components/PlanCard';
import PaymentSection from './PaymentSection';
import { supabase } from '@/lib/supabase';
import { UI } from '@/theme/styles';
import { ArrowLeft, CheckCircle2, Receipt, Tag, ShieldCheck } from 'lucide-react';
import { 
  SUBSCRIPTION_PLANS, 
  validateCoupon, 
  calculateFinalPrice,
  detectUserCurrencyRegion
} from '@/constants/subscriptionData';

export default function SubscriptionPage({ onBack }) {
  const { t, i18n } = useTranslation();
  
  const isRTL = i18n.dir ? i18n.dir() === 'rtl' : i18n.language === 'ar';

  const [region, setRegion] = useState(() => detectUserCurrencyRegion());
  // الخطة السنوية مختارة افتراضياً كأفضل ممارسة في أنظمة SaaS
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentRegionData = useMemo(() => {
    return SUBSCRIPTION_PLANS[region] || SUBSCRIPTION_PLANS.USD;
  }, [region]);

  const currencyLabel = useMemo(() => {
    return t(currentRegionData.currencyKey, currentRegionData.defaultCurrency);
  }, [t, currentRegionData]);

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
      },
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
      }
    ];
  }, [currentRegionData, i18n.language, t]);

  // حساب الحسابات المالية الحالية لملخص الطلب
  const activePlanObj = useMemo(() => {
    return plans.find(p => p.id === selectedPlan) || plans[0];
  }, [plans, selectedPlan]);

  const basePrice = activePlanObj.basePrice;
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return (basePrice * appliedDiscount) / 100;
  }, [basePrice, appliedDiscount]);

  const finalPrice = useMemo(() => {
    return calculateFinalPrice(basePrice, appliedDiscount);
  }, [basePrice, appliedDiscount]);

  const handleApplyPromo = useCallback((code) => {
    setPromoError('');
    const normalizedCode = typeof code === 'string' ? code.trim() : promoCode.trim();
    const couponResult = validateCoupon(normalizedCode);

    if (couponResult.valid) {
      setAppliedDiscount(couponResult.discountPercent);
    } else {
      setAppliedDiscount(0);
      setPromoError(t('subscription.errors.invalidPromo', 'كود الخصم غير صحيح أو غير سارٍ'));
    }
  }, [promoCode, t]);

  const handleRemovePromo = useCallback(() => {
    setPromoCode('');
    setAppliedDiscount(0);
    setPromoError('');
  }, []);

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
              discount_applied: appliedDiscount,
              final_price_paid: finalPrice,
              currency: currencyLabel
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
  }, [selectedPlan, region, txId, appliedDiscount, finalPrice, currencyLabel]);

  return (
    <div 
      className="min-h-screen bg-semantic-bgMain text-semantic-textPrimary py-10 px-4 transition-colors duration-200 font-cairo"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* زر العودة */}
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

        {/* الهيدر والعنوان */}
        <div className="flex flex-col items-center text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight text-semantic-actionPrimary">
            {t('subscription.headerTitle', 'امتلاك ترخيص المنظومة - منصة الحلقة الذكية')}
          </h1>
          <p className={`${UI.subtitle} text-xs sm:text-sm max-w-xl leading-relaxed`}>
            {t('subscription.headerSubtitle', 'اختر خطة الاستثمار الأكاديمي الأنسب لمؤسستك، وانضم إلى كبرى المراكز والجهات التعليمية حول العالم.')}
          </p>
        </div>

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
            {/* 1. اختيار العملة والمنطقة */}
            <RegionSelector 
              region={region} 
              setRegion={setRegion} 
              isRTL={isRTL} 
            />

            {/* 2. بطاقات خطط الأسعار */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((p) => {
                const itemFinalPrice = calculateFinalPrice(p.basePrice, appliedDiscount);
                return (
                  <PlanCard 
                    key={p.id}
                    plan={p}
                    isSelected={selectedPlan === p.id}
                    onSelect={() => setSelectedPlan(p.id)}
                    finalPrice={itemFinalPrice}
                    currency={currencyLabel}
                    isRTL={isRTL}
                  />
                );
              })}
            </div>

            {/* 3. كود الخصم (مدمج قبل الفاتورة والدفع) */}
            <PromoCodeInput 
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              onApply={handleApplyPromo}
              onRemove={handleRemovePromo}
              appliedDiscount={appliedDiscount}
              error={promoError}
              isRTL={isRTL}
            />

            {/* 4. ملخص الطلب الشفاف (Order Summary) */}
            <div className={`${UI.card} max-w-xl mx-auto p-5 rounded-2xl space-y-3 border border-semantic-borderCard shadow-lg`}>
              <div className="flex items-center gap-2 pb-3 border-b border-semantic-borderCard text-semantic-textPrimary font-bold text-sm">
                <Receipt size={18} className="text-semantic-actionPrimary" />
                <span>{t('subscription.summaryTitle', 'ملخص الحساب والفاتورة')}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-semantic-textSecondary">
                  <span>{t('subscription.summaryPlan', 'الخطة المختارة:')}</span>
                  <span className="font-bold text-semantic-textPrimary">{activePlanObj.title}</span>
                </div>

                <div className="flex justify-between text-semantic-textSecondary">
                  <span>{t('subscription.summaryBasePrice', 'السعر الأساسي:')}</span>
                  <span className="font-mono font-bold text-semantic-textPrimary">{basePrice.toLocaleString()} {currencyLabel}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-semantic-success font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag size={13} />
                      {t('subscription.summaryDiscount', 'خصم كود التخفيض:')} ({appliedDiscount}%)
                    </span>
                    <span className="font-mono">- {discountAmount.toLocaleString()} {currencyLabel}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-semantic-borderCard flex justify-between items-center text-sm sm:text-base font-extrabold text-semantic-actionPrimary">
                  <span>{t('subscription.summaryTotal', 'الإجمالي النهائي للدفع:')}</span>
                  <span className="font-mono text-lg">{finalPrice.toLocaleString()} {currencyLabel}</span>
                </div>
              </div>
            </div>

            {/* 5. قسم وسيلة الدفع */}
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
