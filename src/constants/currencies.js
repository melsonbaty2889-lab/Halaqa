/* src/constants/currencies.js */

export const getCurrencies = (t) => [
  // العملات العربية والشرق الأوسط
  { code: 'EGP', symbol: 'ج.م', name: t('currencies.egp', 'جنيه مصري'), decimals: 2, countryCode: 'EG' },
  { code: 'SAR', symbol: 'ر.س', name: t('currencies.sar', 'ريال سعودي'), decimals: 2, countryCode: 'SA' },
  { code: 'AED', symbol: 'د.إ', name: t('currencies.aed', 'درهم إماراتي'), decimals: 2, countryCode: 'AE' },
  { code: 'KWD', symbol: 'د.ك', name: t('currencies.kwd', 'دينار كويتي'), decimals: 3, countryCode: 'KW' },
  { code: 'QAR', symbol: 'ر.ق', name: t('currencies.qar', 'ريال قطري'), decimals: 2, countryCode: 'QA' },
  { code: 'OMR', symbol: 'ر.ع.', name: t('currencies.omr', 'ريال عماني'), decimals: 3, countryCode: 'OM' },
  { code: 'BHD', symbol: 'د.ب.', name: t('currencies.bhd', 'دينار بحريني'), decimals: 3, countryCode: 'BH' },
  { code: 'JOD', symbol: 'د.أ', name: t('currencies.jod', 'دينار أردني'), decimals: 3, countryCode: 'JO' },
  { code: 'MAD', symbol: 'د.م.', name: t('currencies.mad', 'درهم مغربي'), decimals: 2, countryCode: 'MA' },
  { code: 'DZD', symbol: 'د.ج', name: t('currencies.dzd', 'دينار جزائري'), decimals: 2, countryCode: 'DZ' },
  { code: 'TND', symbol: 'د.ت', name: t('currencies.tnd', 'دينار تونسي'), decimals: 3, countryCode: 'TN' },
  { code: 'IQD', symbol: 'ع.د', name: t('currencies.iqd', 'دينار عراقي'), decimals: 3, countryCode: 'IQ' },
  { code: 'LYD', symbol: 'د.ل', name: t('currencies.lyd', 'دينار ليبي'), decimals: 3, countryCode: 'LY' },
  { code: 'SDG', symbol: 'ج.س', name: t('currencies.sdg', 'جنيه سوداني'), decimals: 2, countryCode: 'SD' },
  { code: 'YER', symbol: 'ر.ي', name: t('currencies.yer', 'ريال يمني'), decimals: 2, countryCode: 'YE' },

  // العملات العالمية الرئيسية
  { code: 'USD', symbol: '$', name: t('currencies.usd', 'دولار أمريكي'), decimals: 2, countryCode: 'US' },
  { code: 'EUR', symbol: '€', name: t('currencies.eur', 'يورو'), decimals: 2, countryCode: 'EU' },
  { code: 'GBP', symbol: '£', name: t('currencies.gbp', 'جنيه إسترليني'), decimals: 2, countryCode: 'GB' },
  { code: 'CAD', symbol: 'CA$', name: t('currencies.cad', 'دولار كندي'), decimals: 2, countryCode: 'CA' },
  { code: 'TRY', symbol: '₺', name: t('currencies.try', 'ليرة تركية'), decimals: 2, countryCode: 'TR' },
  { code: 'AUD', symbol: 'A$', name: t('currencies.aud', 'دولار أسترالي'), decimals: 2, countryCode: 'AU' },
  { code: 'CHF', symbol: 'CHF', name: t('currencies.chf', 'فرنك سويسري'), decimals: 2, countryCode: 'CH' },
  { code: 'MYR', symbol: 'RM', name: t('currencies.myr', 'رينغيت ماليزي'), decimals: 2, countryCode: 'MY' },
  { code: 'INR', symbol: '₹', name: t('currencies.inr', 'روبية هندية'), decimals: 2, countryCode: 'IN' }
];

export const getCurrenciesMap = (t) => {
  return getCurrencies(t).reduce((acc, curr) => {
    acc[curr.code] = curr;
    return acc;
  }, {});
};

export const notifyCurrencyChange = (newCurrency) => {
  localStorage.setItem('app_currency', newCurrency);
  window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
};
