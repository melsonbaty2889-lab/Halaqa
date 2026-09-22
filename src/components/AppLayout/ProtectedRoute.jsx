import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { C } from '@/theme/colors';

const getText = (tFunc, key, fallback) => {
  if (typeof tFunc === 'function') {
    const res = tFunc(key, fallback);
    if (res && res !== key) return res;
  }
  return fallback;
};

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { profile, appState, academy, userRole, logout, t } = useAcademy();
  const { slug } = useParams();

  // متغيرات الألوان الدلالية
  const bgColor = C.semantic?.background || C.dark?.bg;
  const textPrimaryColor = C.semantic?.textPrimary || C.text?.title;
  const textSecondaryColor = C.semantic?.textSecondary || C.text?.muted;
  const dangerColor = C.semantic?.danger || C.error?.DEFAULT;
  const actionPrimaryColor = C.semantic?.actionPrimary || C.amber?.DEFAULT;
  const primaryGradient = C.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)';

  if (appState === 'LOADING') {
    return (
      <div style={{ background: bgColor, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: actionPrimaryColor }}>
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  // 1. التحقق من وجود دور فعلي (ترقيع الثغرة الأمنية)
  const rawRole = userRole || profile?.role;
  const currentRole = rawRole ? rawRole.toString().toLowerCase().trim() : 'guest';

  // 2. التحقق من الصلاحيات
  const normalizedAllowed = allowedRoles.map(r => (r || '').toString().toLowerCase().trim());
  const isAllowed = 
    currentRole !== 'guest' && ( // يجب أن يكون مسجلاً للدخول
      normalizedAllowed.length === 0 || 
      normalizedAllowed.includes(currentRole) || 
      currentRole === 'admin' || 
      currentRole === 'super_admin'
    );

  // 3. التحقق من رابط الأكاديمية (Slug)
  const currentSlug = academy?.slug || (typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : null);
  const isCorrectAcademy = 
    !slug || 
    !currentSlug || 
    slug === currentSlug || 
    academy?.id === 'default' ||
    currentRole === 'super_admin' || 
    currentRole === 'admin';

  // واجهة الرفض الموحدة
  if (!isAllowed || !isCorrectAcademy) {
    return (
      <div style={{
        background: bgColor,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: textPrimaryColor,
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Cairo', system-ui, sans-serif"
      }}>
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          padding: '20px', 
          borderRadius: '50%', 
          marginBlockEnd: '16px', 
          color: dangerColor 
        }}>
          <Lock size={40} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBlockEnd: '8px' }}>
          {getText(t, 'auth.unauthorized_title', 'غير مصرح لك بالوصول لهذه الشاشة')}
        </h2>
        <p style={{ color: textSecondaryColor, fontSize: '14px', maxWidth: '400px', marginBlockEnd: '24px' }}>
          {currentRole === 'guest' 
            ? getText(t, 'auth.must_login_desc', 'يرجى تسجيل الدخول أولاً للوصول إلى هذه الصفحة.')
            : getText(t, 'auth.unauthorized_desc', 'دور حسابك الحالي غير مجاز لاستخدام هذه الصفحة.')}
        </p>
        <button
          onClick={logout}
          aria-label={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          title={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          style={{
            padding: '10px 20px',
            minHeight: '44px',
            background: primaryGradient,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {getText(t, 'common.logout_return', 'العودة لتسجيل الدخول')}
        </button>
      </div>
    );
  }

  // السماح بالمرور إذا اجتاز الفحوصات
  return children;
}
