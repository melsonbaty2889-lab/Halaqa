// src/constants/subscriptionData.js

/**
 * 1. البيانات الأساسية للباقات والأسعار محايدة وعالمية بنظام ISO
 * تدعم التغيير والتبديل المرن بين كافة العملات والخيارات لأي مستخدم عالمياً أو خليجياً.
 */
export const SUBSCRIPTION_PLANS = {
  EGP: {
    code: 'EGP',
    currencyKey: 'subscription.currencies.egp',
    defaultCurrency: 'ج.م',
    currencyCode: 'EGP',
    plans: {
      monthly: { price: 195, periodDays: 30 },
      yearly: { 
        price: 1800, 
        periodDays: 365, 
        badgeAr: 'توفير شهرين مجاناً 🔥', 
        badgeEn: 'Save 2 Months 🔥',
        badgeFr: '2 mois gratuits 🔥',
        badgeTr: '2 Ay Ücretsiz 🔥',
        badgeUr: '2 ماہ مفت حاصل کریں 🔥',
        badgeId: 'Hemat 2 Bulan 🔥'
      }
    }
  },
  SAR: {
    code: 'SAR',
    currencyKey: 'subscription.currencies.sar',
    defaultCurrency: 'ر.س',
    currencyCode: 'SAR',
    plans: {
      monthly: { price: 75, periodDays: 30 },
      yearly: { 
        price: 750, 
        periodDays: 365, 
        badgeAr: 'توفير شهرين مجاناً 🔥', 
        badgeEn: 'Save 2 Months 🔥',
        badgeFr: '2 mois gratuits 🔥',
        badgeTr: '2 Ay Ücretsiz 🔥',
        badgeUr: '2 ماہ مفت حاصل کریں 🔥',
        badgeId: 'Hemat 2 Bulan 🔥'
      }
    }
  },
  USD: {
    code: 'USD',
    currencyKey: 'subscription.currencies.usd',
    defaultCurrency: '$',
    currencyCode: 'USD',
    plans: {
      monthly: { price: 15, periodDays: 30 },
      yearly: { 
        price: 140, 
        periodDays: 365, 
        badgeAr: 'توفير شهرين مجاناً 🔥', 
        badgeEn: 'Save 2 Months 🔥',
        badgeFr: '2 mois gratuits 🔥',
        badgeTr: '2 Ay Ücretsiz 🔥',
        badgeUr: '2 ماہ مفت حاصل کریں 🔥',
        badgeId: 'Hemat 2 Bulan 🔥'
      }
    }
  }
};

// 🔄 خريطة التوافق الخلفي للرموز القديمة (تمنع كسر أي مكونات استدعت egypt أو gcc أو global)
SUBSCRIPTION_PLANS.egypt = SUBSCRIPTION_PLANS.EGP;
SUBSCRIPTION_PLANS.gcc = SUBSCRIPTION_PLANS.SAR;
SUBSCRIPTION_PLANS.global = SUBSCRIPTION_PLANS.USD;

/**
 * 2. جدول أكواد الخصم المعتمدة
 */
export const COUPON_CODES = {
  'HALAQA10': 10,
  'SAVE10': 10,
  'FOUNDERS20': 20,
  'WELCOME20': 20
};

/**
 * 3. دالة كشف النطاق المالي والعملة الافتراضية المبدئية
 * توفر اقتراحاً مبدئياً فقط، مع إمكانية تغيير العميل للعملة إلى USD في أي وقت من الواجهة.
 */
export const detectUserCurrencyRegion = (userLoc = '', currentLang = 'ar') => {
  try {
    const locUpper = String(userLoc || '').toUpperCase();
    const gccCountryCodes = ['SA', 'KW', 'AE', 'QA', 'BH', 'OM'];

    // 1. فحص دولة العميل المسجلة صراحة عبر كود الدولة ISO
    if (locUpper) {
      if (locUpper.includes('EG')) return 'EGP';
      if (gccCountryCodes.some(code => locUpper.includes(code))) return 'SAR';
      if (locUpper !== 'GLOBAL') return 'USD';
    }

    // 2. فحص إقليم المتصفح (Browser Locale)
    if (typeof navigator !== 'undefined') {
      const userLocale = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (userLocale.includes('-eg')) return 'EGP';
      if (
        userLocale.includes('-sa') || userLocale.includes('-ae') || 
        userLocale.includes('-kw') || userLocale.includes('-qa') || 
        userLocale.includes('-bh') || userLocale.includes('-om')
      ) {
        return 'SAR';
      }
    }

    // 3. فحص المنطقة الزمنية للمتصفح (Timezone) لكافة عواصم ومناطق الخليج ومصر
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (timeZone.includes('Cairo') || timeZone.includes('Africa/Cairo')) {
        return 'EGP';
      }
      if (
        timeZone.includes('Riyadh') || timeZone.includes('Dubai') || 
        timeZone.includes('Kuwait') || timeZone.includes('Qatar') || 
        timeZone.includes('Bahrain') || timeZone.includes('Muscat')
      ) {
        return 'SAR';
      }
    }

    // 4. الخيار العالمي الافتراضي لجميع أنحاء العالم
    return 'USD';
  } catch (err) {
    console.error('🚨 Error detecting user currency region:', err);
    return 'USD';
  }
};

// توافق خلفي مع اسم الدالة القديم
export const detectUserRegion = detectUserCurrencyRegion;

/**
 * 4. دالة جلب كائن الأسعار المتوافق مع مكونات الواجهة (مؤمنة 100%)
 */
export const getPrices = (t = (key) => key) => {
  const result = {};
  const activeKeys = ['EGP', 'SAR', 'USD'];
  
  activeKeys.forEach((region) => {
    const regData = SUBSCRIPTION_PLANS[region];
    result[region] = {
      monthly: regData.plans.monthly.price,
      yearly: regData.plans.yearly.price,
      curr: t(regData.currencyKey) || regData.defaultCurrency
    };
  });

  // إضافة التوافق للرموز القديمة في الكائن الناتج
  result.egypt = result.EGP;
  result.gcc = result.SAR;
  result.global = result.USD;

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
  return Math.max(0, Math.round(discounted));
};
