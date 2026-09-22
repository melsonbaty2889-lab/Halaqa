import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';

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

  if (appState === 'LOADING') {
    return (
      <div className="bg-semantic-bgPage min-h-screen flex justify-center items-center text-semantic-actionPrimary">
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
      <div className="bg-semantic-bgPage min-h-screen flex flex-col items-center justify-center text-semantic-textPrimary p-5 text-center font-['Cairo',system-ui,sans-serif]">
        <div className="bg-semantic-dangerBg p-5 rounded-full mb-4 text-semantic-danger">
          <Lock size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">
          {getText(t, 'auth.unauthorized_title', 'غير مصرح لك بالوصول لهذه الشاشة')}
        </h2>
        <p className="text-semantic-textSecondary text-sm max-w-sm mb-6">
          {currentRole === 'guest' 
            ? getText(t, 'auth.must_login_desc', 'يرجى تسجيل الدخول أولاً للوصول إلى هذه الصفحة.')
            : getText(t, 'auth.unauthorized_desc', 'دور حسابك الحالي غير مجاز لاستخدام هذه الصفحة.')}
        </p>
        <button
          onClick={logout}
          aria-label={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          title={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          className="px-5 min-h-[44px] bg-gradient-to-b from-[#E67E00] to-[#D97706] text-semantic-textPrimary border-none rounded-lg font-bold cursor-pointer transition-all active:scale-[0.99]"
        >
          {getText(t, 'common.logout_return', 'العودة لتسجيل الدخول')}
        </button>
      </div>
    );
  }

  // السماح بالمرور إذا اجتاز الفحوصات
  return children;
}
