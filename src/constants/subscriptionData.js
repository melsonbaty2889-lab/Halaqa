// src/constants/subscriptionData.js

/**
 * 1. البيانات الأساسية للباقات والأسعار لكل منطقة
 */
export const SUBSCRIPTION_PLANS = {
  egypt: {
    code: 'egypt',
    currencyKey: 'subscription.currencyEg',
    defaultCurrency: 'ج.م',
    plans: {
      monthly: { price: 150, periodDays: 30 },
      yearly: { price: 1500, periodDays: 365, badgeAr: 'توفير شهرين مجاناً 🔥', badgeEn: 'Save 2 Months 🔥' },
      lifetime: { price: 3500, periodDays: 36500, badgeAr: 'فرصة حصرية للمؤسسين ⚡', badgeEn: 'Founders Deal ⚡' }
    }
  },
  gcc: {
    code: 'gcc',
    currencyKey: 'subscription.currencyGcc',
    defaultCurrency: 'ر.س',
    plans: {
      monthly: { price: 50, periodDays: 30 },
      yearly: { price: 500, periodDays: 365, badgeAr: 'توفير شهرين مجاناً 🔥', badgeEn: 'Save 2 Months 🔥' },
      lifetime: { price: 1200, periodDays: 36500, badgeAr: 'فرصة حصرية للمؤسسين ⚡', badgeEn: 'Founders Deal ⚡' }
    }
  },
  global: {
    code: 'global',
    currencyKey: 'subscription.currencyGlobal',
    defaultCurrency: '$',
    plans: {
      monthly: { price: 15, periodDays: 30 },
      yearly: { price: 150, periodDays: 365, badgeAr: 'توفير شهرين مجاناً 🔥', badgeEn: 'Save 2 Months 🔥' },
      lifetime: { price: 300, periodDays: 36500, badgeAr: 'فرصة حصرية للمؤسسين ⚡', badgeEn: 'Founders Deal ⚡' }
    }
  }
};

/**
 * 2. جدول أكواد الخصم المعتمدة
 */
export const COUPON_CODES = {
  'HALAQA10': 10,
  'SAVE10': 10,
  'FOUNDERS20': 20
};

/**
 * 3. دالة التعرف التلقائي على دولة/منطقة المستخدم مع معالجة الأخطاء
 */
export const detectUserRegion = (userLoc = '', currentLang = 'ar') => {
  const locUpper = String(userLoc || '').toUpperCase();
  const gccCodes = ['SA', 'KW', 'AE', 'QA', 'BH', 'OM'];

  if (gccCodes.some(code => locUpper.includes(code))) {
    return 'gcc';
  }
  if (locUpper.includes('EG')) {
    return 'egypt';
  }
  return currentLang === 'en' ? 'global' : 'egypt';
};

/**
 * 4. دالة جلب كائن الأسعار المتوافق مع مكونات الواجهة
 */
export const getPrices = (t = (key) => key) => {
  const result = {};
  Object.keys(SUBSCRIPTION_PLANS).forEach((region) => {
    const regData = SUBSCRIPTION_PLANS[region];
    result[region] = {
      monthly: regData.plans.monthly.price,
      yearly: regData.plans.yearly.price,
      lifetime: regData.plans.lifetime.price,
      curr: t(regData.currencyKey) || regData.defaultCurrency
    };
  });
  return result;
};

/**
 * 5. دالة التحقق من كود الخصم واسترجاع نسبة الخصم
 */
export const validateCoupon = (code) => {
  const formattedCode = String(code || '').trim().toUpperCase();
  if (COUPON_CODES[formattedCode]) {
    return { valid: true, discountPercent: COUPON_CODES[formattedCode], code: formattedCode };
  }
  return { valid: false, discountPercent: 0, code: null };
};

/**
 * 6. دالة حساب السعر النهائي الآمن
 */
export const calculateFinalPrice = (basePrice, discountPercent = 0) => {
  const numericPrice = Number(basePrice) || 0;
  if (discountPercent <= 0) return numericPrice;
  const discounted = numericPrice * (1 - discountPercent / 100);
  return Math.round(discounted);
};
