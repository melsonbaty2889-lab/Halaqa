import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { useSubscription } from '@/hooks/useSubscription';

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
  const location = useLocation();

  // 1. جلب حالة الاشتراك للأكاديمية الحالية
  const { isActive, isPending, loading: subLoading } = useSubscription(academy?.id);

  // حالة التحميل أثناء فحص الجلسة أو الاشتراك
  if (appState === 'LOADING' || (subLoading && academy?.id)) {
    return (
      <div className="bg-semantic-bgPage min-h-screen flex justify-center items-center text-semantic-actionPrimary">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  // 2. استخراج دور المستخدم
  const rawRole = userRole || profile?.role;
  
  // إذا لم يكن هناك دور محدد للمستخدم المسجل -> تحويله لصفحة تحديد الدور
  if (profile && !rawRole) {
    return <Navigate to="/select-role" replace />;
  }

  const currentRole = rawRole ? rawRole.toString().toLowerCase().trim() : 'guest';

  // إذا لم يكن مسجلاً للدخول مطلقاً
  if (currentRole === 'guest') {
    return <Navigate to="/login" replace />;
  }

  // 3. التحقق من الصلاحيات للأدوار المسموحة
  const normalizedAllowed = allowedRoles.map(r => (r || '').toString().toLowerCase().trim());
  const isAllowed = 
    normalizedAllowed.length === 0 || 
    normalizedAllowed.includes(currentRole) || 
    currentRole === 'admin' || 
    currentRole === 'super_admin';

  // 4. التحقق من رابط الأكاديمية (Slug)
  const currentSlug = academy?.slug || (typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : null);
  const isCorrectAcademy = 
    !slug || 
    !currentSlug || 
    slug === currentSlug || 
    academy?.id === 'default' ||
    currentRole === 'super_admin' || 
    currentRole === 'admin';

  // واجهة الرفض الموحدة في حال عدم امتلاك صلاحية الوصول للمسار الحالي
  if (!isAllowed || !isCorrectAcademy) {
    return (
      <div className="bg-semantic-bgPage min-h-screen flex flex-col items-center justify-center text-semantic-textPrimary p-5 text-center font-['Cairo',system-ui,sans-serif]">
        <div className="bg-semantic-dangerBg p-5 rounded-full mb-4 text-semantic-danger">
          <Lock size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-semantic-textPrimary">
          {getText(t, 'auth.unauthorized_title', 'غير مصرح لك بالوصول لهذه الشاشة')}
        </h2>
        <p className="text-semantic-textSecondary text-sm max-w-sm mb-6">
          {getText(t, 'auth.unauthorized_desc', 'دور حسابك الحالي غير مجاز لاستخدام هذه الصفحة.')}
        </p>
        <button
          onClick={logout}
          aria-label={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          title={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          className="px-5 min-h-[44px] bg-gradient-to-b from-[#E67E00] to-[#D97706] text-white border-none rounded-lg font-bold cursor-pointer transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-actionPrimary/50"
        >
          {getText(t, 'common.logout_return', 'العودة لتسجيل الدخول')}
        </button>
      </div>
    );
  }

  // 5. 🛡️ فحص صلاحية الاشتراك (Subscription Check)
  // ينطبق الفحص فقط على مسارات لوحة التحكم الإدارية للأكاديمية وتستثنى صفحة الاشتراك والـ Super Admin
  const isSubscriptionPage = location.pathname.includes('/subscription') || location.pathname.includes('/billing');
  const isSuperAdmin = currentRole === 'super_admin';

  if (!isSuperAdmin && !isSubscriptionPage && academy?.id && academy?.id !== 'default') {
    // إذا كان الاشتراك غير نشط وليس في انتظار المراجعة
    if (!isActive && !isPending) {
      return (
        <div className="bg-semantic-bgPage min-h-screen flex flex-col items-center justify-center text-semantic-textPrimary p-5 text-center font-['Cairo',system-ui,sans-serif]">
          <div className="bg-amber-500/10 p-5 rounded-full mb-4 text-amber-500">
            <CreditCard size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2 text-semantic-textPrimary">
            {getText(t, 'subscription.expired_title', 'اشتراك المنظومة غير مفعّل أو منتهي')}
          </h2>
          <p className="text-semantic-textSecondary text-sm max-w-md mb-6 leading-relaxed">
            {getText(t, 'subscription.expired_desc', 'لتتمكن من الاستمرار في استخدام لوحة التحكم وخدمات المنظومة، يرجى اختيار خطة الاشتراك وتفعيل الترخيص.')}
          </p>
          <a
            href="/subscription"
            className="px-6 py-3 min-h-[44px] bg-semantic-actionPrimary text-white rounded-xl font-bold transition-all hover:opacity-90 shadow-lg"
          >
            {getText(t, 'subscription.renew_now', 'ترقية / تجديد الاشتراك الآن')}
          </a>
        </div>
      );
    }
  }

  // السماح بالمرور إذا اجتاز جميع الفحوصات
  return children;
}
