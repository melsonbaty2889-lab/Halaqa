// src/constants/subscriptionData.js

// دالة تجلب الأسعار والعملات بناءً على دالة الترجمة t
export const getPrices = (t) => ({
  egypt: { monthly: "150", yearly: "1500", lifetime: "3500", curr: t('subscription.currencyEg') },
  gcc: { monthly: "50", yearly: "500", lifetime: "1200", curr: t('subscription.currencyGcc') },
  global: { monthly: "15", yearly: "150", lifetime: "300", curr: t('subscription.currencyGlobal') }
});

// دالة التعرف التلقائي على دولة المستخدم
export const detectUserRegion = (userLoc, currentLang) => {
  if (['SA', 'KW', 'AE', 'QA', 'BH', 'OM'].some(code => userLoc.includes(code))) {
    return 'gcc';
  }
  if (userLoc.includes('EG')) {
    return 'egypt';
  }
  return currentLang === 'en' ? 'global' : 'egypt';
};
