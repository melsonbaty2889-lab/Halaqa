// src/utils/studentUtils.js
import React from 'react';
import { UserCheck, UserX, AlertCircle, Archive } from 'lucide-react';

/**
 * 1. دالة مساعدة لتبسيط استخراج النصوص المترجمة
 */
const getText = (t, key, defaultAr, defaultEn, lang = 'ar') => {
  if (t && key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return lang.startsWith('ar') ? defaultAr : defaultEn;
};

/**
 * 2. حساب عمر الطالب استناداً إلى تاريخ الميلاد
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
 * 3. تحديد ألوان ونصوص شارة حالة الطالب
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
 * 4. توحيد وتصنيف حالات الطالب المعتمدة
 */
export const getStudentStatusCategory = (student) => {
  if (student.is_archived || student.status === 'graduated') return 'archived';
  if (student.status === 'inactive' || student.status === 'paused') return 'inactive';
  return 'active';
};

/**
 * 5. رسم وسم الحالة لبطاقات الطلاب
 */
export const renderStatusBadge = (student, t) => {
  const category = getStudentStatusCategory(student);

  if (category === 'archived') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
        <Archive className="w-3.5 h-3.5" />
        <span>{student.status === 'graduated' ? t('common.graduated', 'متخرج') : t('common.archived', 'مؤرشف')}</span>
      </span>
    );
  }

  if (category === 'active') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <UserCheck className="w-3.5 h-3.5" />
        <span>{t('status_active', 'نشط')}</span>
      </span>
    );
  }

  if (category === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <UserX className="w-3.5 h-3.5" />
        <span>{student.status === 'paused' ? t('common.paused', 'موقوف') : t('status_inactive', 'غير نشط')}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dark-input text-appText-sub border border-appBorder-input">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{t('common.unspecified', 'غير محدد')}</span>
    </span>
  );
};
