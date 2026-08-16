export const CURRENCIES = [
  // العملات الرئيسية والأكثر استخداماً
  { code: 'EGP', symbol: 'ج.م', labelAr: 'جنيه مصري (EGP)', labelEn: 'Egyptian Pound' },
  { code: 'SAR', symbol: 'ر.س', labelAr: 'ريال سعودي (SAR)', labelEn: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', labelAr: 'درهم إماراتي (AED)', labelEn: 'UAE Dirham' },
  { code: 'KWD', symbol: 'د.ك', labelAr: 'دينار كويتي (KWD)', labelEn: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'ر.ق', labelAr: 'ريال قطري (QAR)', labelEn: 'Qatari Riyal' },
  { code: 'OMR', symbol: 'ر.ع.', labelAr: 'ريال عماني (OMR)', labelEn: 'Omani Rial' },
  { code: 'BHD', symbol: 'د.ب.', labelAr: 'دينار بحريني (BHD)', labelEn: 'Bahraini Dinar' },
  { code: 'JOD', symbol: 'د.أ', labelAr: 'دينار أردني (JOD)', labelEn: 'Jordanian Dinar' },
  { code: 'MAD', symbol: 'د.م.', labelAr: 'درهم مغربي (MAD)', labelEn: 'Moroccan Dirham' },
  
  // العملات العالمية الرئيسية
  { code: 'USD', symbol: '$', labelAr: 'دولار أمريكي (USD)', labelEn: 'US Dollar' },
  { code: 'EUR', symbol: '€', labelAr: 'يورو (EUR)', labelEn: 'Euro' },
  { code: 'GBP', symbol: '£', labelAr: 'جنيه إسترليني (GBP)', labelEn: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', labelAr: 'دولار كندي (CAD)', labelEn: 'Canadian Dollar' },
  { code: 'TRY', symbol: '₺', labelAr: 'ليرة تركية (TRY)', labelEn: 'Turkish Lira' },
  { code: 'AUD', symbol: 'A$', labelAr: 'دولار أسترالي (AUD)', labelEn: 'Australian Dollar' },
];

export const notifyCurrencyChange = (newCurrency) => {
  localStorage.setItem('app_currency', newCurrency);
  window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
};
