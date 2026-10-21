// src/components/AppLayout/ProtectedRoute.jsx

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

  if (appState === 'LOADING' || (subLoading && academy?.id)) {
    return (
      <div className="bg-semantic-bgPage min-h-screen flex justify-center items-center text-semantic-actionPrimary">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  // 2. استخراج دور المستخدم
  const rawRole = userRole || profile?.role;
  
  if (profile && !rawRole) {
    return <Navigate to="/select-role" replace />;
  }

  const currentRole = rawRole ? rawRole.toString().toLowerCase().trim() : 'guest';

  if (currentRole === 'guest') {
    return <Navigate to="/login" replace />;
  }

  // 3. التوجيه الذكي للأكاديمية (Onboarding)
  const isOnboardingPage = 
    location.pathname.includes('/select-role') || 
    location.pathname.includes('/create-academy') || 
    location.pathname.includes('/join-academy');

  const hasAcademy = academy?.id && academy?.id !== 'default';

  if (!hasAcademy && !isOnboardingPage && currentRole !== 'super_admin') {
    if (currentRole === 'admin') {
      return <Navigate to="/create-academy" replace />;
    } else {
      return <Navigate to="/join-academy" replace />;
    }
  }

  // 4. خريطة التوجيه الافتراضية لكل دور
  const roleDefaultRoutes = {
    teacher: '/teacher-dashboard',
    student: '/student-dashboard',
    parent: '/parent-dashboard',
    admin: '/dashboard',
    academy_admin: '/dashboard',
    super_admin: '/admin-dashboard'
  };

  // 5. التحقق من الصلاحيات
  const normalizedAllowed = allowedRoles.map(r => (r || '').toString().toLowerCase().trim());
  const isAllowed = 
    normalizedAllowed.length === 0 || 
    normalizedAllowed.includes(currentRole) || 
    currentRole === 'admin' || 
    currentRole === 'super_admin';

  // إذا لم يكن مصرحاً له، إعادة توجيه فورية للوحة المخصصة لدوره دون إظهار شاشة الحظر
  if (!isAllowed) {
    const targetRoute = roleDefaultRoutes[currentRole] || '/dashboard';
    if (location.pathname !== targetRoute) {
      return <Navigate to={targetRoute} replace />;
    }
  }

  // 6. التحقق من رابط الأكاديمية (Slug) مع السماح للمعلمين والمديرين بالمرور
  const currentSlug = academy?.slug || (typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : null);
  const isCorrectAcademy = 
    !slug || 
    !currentSlug || 
    slug === currentSlug || 
    academy?.id === 'default' ||
    currentRole === 'super_admin' || 
    currentRole === 'admin' ||
    currentRole === 'teacher';

  if (!isCorrectAcademy) {
    const targetRoute = roleDefaultRoutes[currentRole] || '/dashboard';
    return <Navigate to={targetRoute} replace />;
  }

  // 7. فحص صلاحية الاشتراك (Subscription Check)
  const isSubscriptionPage = location.pathname.includes('/subscription') || location.pathname.includes('/billing');
  const isSuperAdmin = currentRole === 'super_admin';

  if (!isSuperAdmin && !isSubscriptionPage && hasAcademy) {
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

  return children;
}
