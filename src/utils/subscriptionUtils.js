// src/utils/subscriptionUtils.js

/**
 * 💱 دالة مساعدة لتنسيق المبالغ المالية والعملات (EGP, SAR, USD)
 */
export function formatCurrencyAmount(amount, currencyCode = 'EGP', t = (k) => k) {
  const num = Number(amount || 0);
  const formattedNumber = num.toLocaleString('ar-EG');
  const cleanCode = (currencyCode || 'EGP').trim().toUpperCase();

  const symbols = {
    EGP: t('currency.egp') !== 'currency.egp' ? t('currency.egp') : 'ج.م',
    SAR: t('currency.sar') !== 'currency.sar' ? t('currency.sar') : 'ر.س',
    USD: t('currency.usd') !== 'currency.usd' ? t('currency.usd') : '$',
  };

  const symbol = symbols[cleanCode] || cleanCode;
  return `${formattedNumber} ${symbol}`;
}

/**
 * 📊 دالة موحدة لاستخراج وحساب حالة الاشتراك بناءً على بيانات المنظومة الحقيقية
 */
export function getAcademySubscriptionInfo(academy, t = (k) => k) {
  if (!academy) {
    return {
      isTrial: true,
      planTier: 'monthly',
      planDuration: 'monthly',
      statusText: t('subscription.status.trial') || 'تجريبي',
      expiryDate: null,
      daysLeft: 0,
      currency: 'EGP',
      priceFormatted: formatCurrencyAmount(0, 'EGP', t),
    };
  }

  const rawSub = academy?.saas_subscriptions;
  const sub = Array.isArray(rawSub) ? rawSub[0] : rawSub;

  const isSubActive = sub && sub.status === 'active';
  const now = new Date();

  // تحديد تاريخ الانتهاء
  const targetExpiry = isSubActive
    ? sub?.expires_at
    : (sub?.trial_ends_at || academy?.trial_ends_at);

  // حساب الأيام المتبقية
  let daysLeft = 0;
  if (targetExpiry) {
    const diff = new Date(targetExpiry).getTime() - now.getTime();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // تحديد نص الحالة والمسمى بناءً على نوع الاشتراك والمدة
  let statusText = t('subscription.status.trial') || 'تجريبي';
  
  if (isSubActive) {
    if (sub?.plan_duration === 'yearly' || sub?.plan_tier === 'yearly') {
      statusText = t('subscription.plans.yearly.title') || 'الاستقرار الأكاديمي (سنوي)';
    } else {
      statusText = t('subscription.plans.monthly.title') || 'الوصول المرن (شهري)';
    }
  }

  const currency = sub?.currency || 'EGP';
  const price = sub?.price || 0;

  return {
    isTrial: !isSubActive,
    planTier: sub?.plan_tier || 'monthly',
    planDuration: sub?.plan_duration || 'monthly',
    statusText,
    expiryDate: targetExpiry,
    daysLeft,
    currency,
    price,
    priceFormatted: formatCurrencyAmount(price, currency, t),
  };
}
