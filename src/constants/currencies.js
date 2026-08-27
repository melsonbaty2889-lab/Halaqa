// src/constants/currencies.js

export const CURRENCIES = [
  // العملات العربية والشرق الأوسط
  { code: 'EGP', symbol: 'ج.م', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound', decimals: 2, countryCode: 'EG' },
  { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', decimals: 2, countryCode: 'SA' },
  { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', decimals: 2, countryCode: 'AE' },
  { code: 'KWD', symbol: 'د.ك', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', decimals: 3, countryCode: 'KW' },
  { code: 'QAR', symbol: 'ر.ق', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', decimals: 2, countryCode: 'QA' },
  { code: 'OMR', symbol: 'ر.ع.', nameAr: 'ريال عماني', nameEn: 'Omani Rial', decimals: 3, countryCode: 'OM' },
  { code: 'BHD', symbol: 'د.ب.', nameAr: 'دينار بحريني', nameEn: 'Bahraini Dinar', decimals: 3, countryCode: 'BH' },
  { code: 'JOD', symbol: 'د.أ', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar', decimals: 3, countryCode: 'JO' },
  { code: 'MAD', symbol: 'د.م.', nameAr: 'درهم مغربي', nameEn: 'Moroccan Dirham', decimals: 2, countryCode: 'MA' },
  { code: 'DZD', symbol: 'د.ج', nameAr: 'دينار جزائري', nameEn: 'Algerian Dinar', decimals: 2, countryCode: 'DZ' },
  { code: 'TND', symbol: 'د.ت', nameAr: 'دينار تونسي', nameEn: 'Tunisian Dinar', decimals: 3, countryCode: 'TN' },
  { code: 'IQD', symbol: 'ع.د', nameAr: 'دينار عراقي', nameEn: 'Iraqi Dinar', decimals: 3, countryCode: 'IQ' },
  { code: 'LYD', symbol: 'د.ل', nameAr: 'دينار ليبي', nameEn: 'Libyan Dinar', decimals: 3, countryCode: 'LY' },
  { code: 'SDG', symbol: 'ج.س', nameAr: 'جنيه سوداني', nameEn: 'Sudanese Pound', decimals: 2, countryCode: 'SD' },
  { code: 'YER', symbol: 'ر.ي', nameAr: 'ريال يمني', nameEn: 'Yemeni Rial', decimals: 2, countryCode: 'YE' },

  // العملات العالمية الرئيسية
  { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', decimals: 2, countryCode: 'US' },
  { code: 'EUR', symbol: '€', nameAr: 'يورو', nameEn: 'Euro', decimals: 2, countryCode: 'EU' },
  { code: 'GBP', symbol: '£', nameAr: 'جنيه إسترليني', nameEn: 'British Pound', decimals: 2, countryCode: 'GB' },
  { code: 'CAD', symbol: 'CA$', nameAr: 'دولار كندي', nameEn: 'Canadian Dollar', decimals: 2, countryCode: 'CA' },
  { code: 'TRY', symbol: '₺', nameAr: 'ليرة تركية', nameEn: 'Turkish Lira', decimals: 2, countryCode: 'TR' },
  { code: 'AUD', symbol: 'A$', nameAr: 'دولار أسترالي', nameEn: 'Australian Dollar', decimals: 2, countryCode: 'AU' },
  { code: 'CHF', symbol: 'CHF', nameAr: 'فرنك سويسري', nameEn: 'Swiss Franc', decimals: 2, countryCode: 'CH' },
  { code: 'MYR', symbol: 'RM', nameAr: 'رينغيت ماليزي', nameEn: 'Malaysian Ringgit', decimals: 2, countryCode: 'MY' },
  { code: 'INR', symbol: '₹', nameAr: 'روبية هندية', nameEn: 'Indian Rupee', decimals: 2, countryCode: 'IN' }
];

export const CURRENCIES_MAP = CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {});

export const notifyCurrencyChange = (newCurrency) => {
  localStorage.setItem('app_currency', newCurrency);
  window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
};

export default CURRENCIES;
