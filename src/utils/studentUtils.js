/**
 * أدوات مساعدة خاصة ببيانات الطلاب
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

/**
 * دالة مساعدة لتبسيط استخراج النصوص المترجمة
 */
const getText = (t, key, defaultAr, defaultEn, lang = 'ar') => {
  if (t && key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return lang.startsWith('ar') ? defaultAr : defaultEn;
};

/**
 * 1. حساب عمر الطالب استناداً إلى تاريخ الميلاد
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
};

/**
 * 2. تحديد ألوان ونصوص شارة حالة الطالب
 */
export const getStatusStyle = (status, t = null, lang = 'ar') => {
  switch (status) {
    case 'paused':
      return { 
        bg: 'rgba(245, 158, 11, 0.15)', 
        text: '#F59E0B', 
        label: getText(t, 'status_paused', 'موقوف مؤقتاً', 'Paused', lang)
      };
    case 'inactive':
      return { 
        bg: 'rgba(239, 68, 68, 0.15)', 
        text: '#EF4444', 
        label: getText(t, 'status_inactive', 'غير نشط', 'Inactive', lang)
      };
    default:
      return { 
        bg: 'rgba(16, 185, 129, 0.15)', 
        text: '#10B981', 
        label: getText(t, 'status_active', 'نشط', 'Active', lang)
      };
  }
};

/**
 * 3. خيارات الحالات الموحدة للقوائم المنسدلة
 */
export const getStatusOptions = (t = null, lang = 'ar') => [
  { value: "active", label: getText(t, 'status_active', 'نشط', 'Active', lang) },
  { value: "paused", label: getText(t, 'status_paused', 'موقوف', 'Paused', lang) },
  { value: "inactive", label: getText(t, 'status_inactive', 'غير نشط', 'Inactive', lang) }
];

/**
 * 4. خيارات الجنس الموحدة
 */
export const getGenderOptions = (t = null, lang = 'ar') => [
  { value: "male", label: getText(t, 'gender_male', 'ذكر', 'Male', lang) },
  { value: "female", label: getText(t, 'gender_female', 'أنثى', 'Female', lang) }
];

/**
 * 5. خيارات أنظمة الاشتراك الموحدة
 */
export const getPaymentOptions = (t = null, lang = 'ar') => [
  { value: "monthly", label: getText(t, 'plan_monthly', 'اشتراك شهري', 'Monthly Subscription', lang) },
  { value: "per_hour", label: getText(t, 'plan_per_hour', 'بالساعة', 'Per Hour', lang) },
  { value: "free", label: getText(t, 'plan_free', 'مجاني / منحة', 'Free / Scholarship', lang) }
];
