import React from 'react';
import { FaUserGraduate } from 'react-icons/fa';

/**
 * حساب عمر الطالب استناداً إلى تاريخ الميلاد
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) return null;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * تحديد ألوان ونصوص شارة حالة الطالب
 */
export const getStatusStyle = (status, t = null, isRtl = true) => {
  switch (status) {
    case 'paused':
      return { 
        bg: 'rgba(245, 158, 11, 0.15)', 
        text: '#F59E0B', 
        label: t ? (t('status_paused') || (isRtl ? 'موقوف مؤقتاً' : 'Paused')) : (isRtl ? 'موقوف مؤقتاً' : 'Paused') 
      };
    case 'inactive':
      return { 
        bg: 'rgba(239, 68, 68, 0.15)', 
        text: '#EF4444', 
        label: t ? (t('status_inactive') || (isRtl ? 'غير نشط' : 'Inactive')) : (isRtl ? 'غير نشط' : 'Inactive') 
      };
    default:
      return { 
        bg: 'rgba(16, 185, 129, 0.15)', 
        text: '#10B981', 
        label: t ? (t('status_active') || (isRtl ? 'نشط' : 'Active')) : (isRtl ? 'نشط' : 'Active') 
      };
  }
};

/**
 * تنقية رقم الهاتف وتجهيز رابط الواتساب مباشر
 */
export const getWhatsAppLink = (phone) => {
  if (!phone) return null;
  const cleanPhone = String(phone).replace(/\D/g, '');
  return cleanPhone ? `https://wa.me/${cleanPhone}` : null;
};

/**
 * اختيار أيقونة / إيموجي الطالب بحسب الجنس وسياسة الخصوصية
 */
export const renderStudentAvatar = (gender, genderPolicy = 'mixed') => {
  if (genderPolicy === 'separated' && gender === 'female') {
    return <FaUserGraduate style={{ color: '#EC4899', fontSize: '20px' }} />;
  }
  return gender === 'female' ? '🧕' : '👨‍🎓';
};

/**
 * خيارات الحالات الموحدة للقوائم المنسدلة
 */
export const getStatusOptions = (t = null, isRtl = true) => [
  { value: "active", label: t ? (t('status_active') || (isRtl ? 'نشط' : 'Active')) : (isRtl ? 'نشط' : 'Active') },
  { value: "paused", label: t ? (t('status_paused') || (isRtl ? 'موقوف' : 'Paused')) : (isRtl ? 'موقوف' : 'Paused') },
  { value: "inactive", label: t ? (t('status_inactive') || (isRtl ? 'غير نشط' : 'Inactive')) : (isRtl ? 'غير نشط' : 'Inactive') }
];

/**
 * خيارات الجنس الموحدة
 */
export const getGenderOptions = (t = null, isRtl = true) => [
  { value: "male", label: t ? (t('gender_male') || (isRtl ? 'ذكر' : 'Male')) : (isRtl ? 'ذكر' : 'Male') },
  { value: "female", label: t ? (t('gender_female') || (isRtl ? 'أنثى' : 'Female')) : (isRtl ? 'أنثى' : 'Female') }
];

/**
 * خيارات أنظمة الاشتراك الموحدة
 */
export const getPaymentOptions = (t = null, isRtl = true) => [
  { value: "monthly", label: t ? (t('plan_monthly') || (isRtl ? 'اشتراك شهري' : 'Monthly Subscription')) : (isRtl ? 'اشتراك شهري' : 'Monthly Subscription') },
  { value: "per_hour", label: t ? (t('plan_per_hour') || (isRtl ? 'بالساعة' : 'Per Hour')) : (isRtl ? 'بالساعة' : 'Per Hour') },
  { value: "free", label: t ? (t('plan_free') || (isRtl ? 'مجاني / منحة' : 'Free / Scholarship')) : (isRtl ? 'مجاني / منحة' : 'Free / Scholarship') }
];
