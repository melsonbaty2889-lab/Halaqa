// src/constants/colors.js - الهوية الرسمية لمنصة الحلقة الذكية

export const colors = {
  // اللون البرتقالي العنبري (الأزرار والروابط المفعلة)
  primary: {
    DEFAULT: '#D97706',
    hover: '#B45309',
    light: '#F59E0B',
    focusRing: 'rgba(217, 119, 6, 0.2)',
    shadow: 'rgba(217, 119, 6, 0.25)',
  },

  // الأخضر الزمردي (الأيقونات ورموز الأمان والنجاح)
  success: {
    DEFAULT: '#10B981',
    light: '#34D399',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.25)',
  },

  // الأحمر للتنبيهات والأخطاء
  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
  },

  // الألوان الداكنة والخلفيات
  dark: {
    pageBgStart: 'rgba(15, 118, 110, 0.18)', // مركز التدرج الزمردي
    pageBgEnd: '#070C12',                    // أطراف الشاشة الداكنة
    cardBg: '#0F172A',                       // خلفية البطاقة الكبيرة
    inputBg: '#090F16',                      // خلفية حقول الإدخال
    buttonBg: '#1E293B',                     // زر Google وزر اللغة
  },

  // درجات النصوص
  text: {
    title: '#F8FAFC',       // العناوين البيضاء
    heading: '#E2E8F0',     // الفرعية
    body: '#CBD5E1',        // النصوص العادية
    muted: '#94A3B8',       // النصوص التوضيحية
    placeholder: '#64748B', // نصوص الحقول التوضيحية
  },

  // الحدود والفواصل
  border: {
    card: '#1E293B',
    input: '#223147',
    divider: '#334155',
    logoBorder: 'rgba(45, 212, 191, 0.35)',
  },

  // التدرجات
  gradients: {
    background: 'radial-gradient(circle at 50% 25%, rgba(15, 118, 110, 0.18) 0%, #070C12 70%)',
    logoRadial: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
  }
};

// 🔄 تصدير المتغيرات لضمان التوافق مع كافة الاستيرادات في المشروع
export const C = colors;
export const g = colors.gradients;
export default colors;
