import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2, Clock, LogOut, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import { ROLES } from '@/constants/roles';

import ProtectedRoute from './ProtectedRoute';
import InlineUpgradeModal from './InlineUpgradeModal';

const LoginPage = lazy(() => import('@/components/Auth/LoginPage'));
const SignUpPage = lazy(() => import('@/components/Auth/SignUpPage'));
const ForgotPassword = lazy(() => import('@/components/Auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/components/Auth/UpdatePassword'));
const RoleSelectionPage = lazy(() => import('@/components/Auth/RoleSelectionPage'));
const MainApp = lazy(() => import('@/components/Main/MainApp'));
const CreateAcademy = lazy(() => import('@/components/Auth/CreateAcademy'));
const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));

const getText = (tFunc, key, fallback) => {
  if (typeof tFunc === 'function') {
    const res = tFunc(key, fallback);
    if (res && res !== key) return res;
  }
  return fallback;
};

const FullPageLoader = ({ label }) => {
  return (
    <div className="bg-semantic-bgPage min-h-screen flex flex-col items-center justify-center text-semantic-actionPrimary gap-3">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-xs text-semantic-textSecondary font-['Cairo',system-ui,sans-serif]">
        {label}
      </span>
    </div>
  );
};

export default function MainContent() {
  useDocumentTitle();

  const { appState, user, profile, academy, logout, refreshStatus, userRole, t } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  const cachedSlug = typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : null;

  useEffect(() => {
    let subscription = null;
    try {
      if (supabase?.auth) {
        const res = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
        });
        subscription = res?.data?.subscription;
      }
    } catch (err) {
      console.error("Supabase Auth listener error:", err);
    }
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if ((appState === 'NO_ACADEMY' || appState === 'FULLY_ACTIVE') && cachedSlug && profile?.academy_id) {
      refreshStatus?.();
    }
  }, [appState, cachedSlug, profile?.academy_id, refreshStatus]);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (refreshStatus) await refreshStatus();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refreshStatus]);

  const getSuspensionReason = useCallback(() => {
    const reason = academy?.suspension_reason || academy?.status_reason;
    if (!reason) return getText(t, 'suspension.default_reason', 'تم إيقاف هذه الأكاديمية مؤقتاً من قبل إدارة المنصة.');

    if (typeof reason === 'object' && reason !== null) {
      return reason.ar || reason.en || Object.values(reason)[0] || JSON.stringify(reason);
    }
    return String(reason);
  }, [academy, t]);

  // فحص ما إذا كان المستخدم مسجلاً ولكنه بدون دور معتمد بعد
  const rawRole = userRole || profile?.role;
  const isNeedsRoleSelection = appState !== 'LOADING' && appState !== 'UNAUTHENTICATED' && user && !rawRole;

  return (
    <Suspense fallback={<FullPageLoader label={getText(t, 'system.loading', 'جاري تحميل المنظومة...')} />}>
      {authView === 'update_password' && (
        <UpdatePassword 
          onSuccess={() => {
            setAuthView('login');
            refreshStatus?.();
          }} 
        />
      )}

      {(appState === 'LOADING' || !appState) && authView !== 'update_password' && (
        <FullPageLoader label={getText(t, 'system.loading', 'جاري تحميل المنظومة...')} />
      )}

      {appState === 'UNAUTHENTICATED' && authView !== 'update_password' && (
        <div className="bg-semantic-bgPage min-h-screen">
          {authView === 'login' && (
            <LoginPage 
              onSwitchToSignUp={() => setAuthView('signup')} 
              onForgotPassword={() => setAuthView('forgot')}
              onLoginSuccess={() => refreshStatus?.()}
            />
          )}
          {authView === 'signup' && (
            <SignUpPage onSwitchToLogin={() => setAuthView('login')} />
          )}
          {authView === 'forgot' && (
            <ForgotPassword onBackToLogin={() => setAuthView('login')} />
          )}
        </div>
      )}

      {/* شاشة اختيار الدور: تظهر فقط عند وجود حساب بدون Role */}
      {isNeedsRoleSelection && authView !== 'update_password' && (
        <RoleSelectionPage onRoleSelected={() => refreshStatus?.()} />
      )}

      {appState === 'PENDING_APPROVAL' && !isNeedsRoleSelection && (
        <div className="min-h-screen flex items-center justify-center bg-semantic-bgPage p-5 font-['Cairo',system-ui,sans-serif]">
          <div className="w-full max-w-lg bg-semantic-surfaceCard p-10 rounded-[20px] text-center border border-semantic-borderCard">
            <Clock size={40} className="text-semantic-actionPrimary mx-auto mb-5" />
            <h2 className="text-semantic-textPrimary text-xl font-bold mb-4">
              {getText(t, 'approval.pending_title', 'طلبك قيد المراجعة')}
            </h2>
            <p className="text-semantic-textSecondary mb-6 leading-relaxed">
              {getText(t, 'approval.pending_desc', 'حسابك وأكاديميتك قيد التدقيق والموافقة من قبل الإدارة العامة للمنصة.')}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button 
                onClick={handleManualRefresh} 
                disabled={isRefreshing}
                aria-label={getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
                title={getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
                className="px-5 min-h-[44px] bg-gradient-to-b from-[#E67E00] to-[#D97706] text-semantic-textPrimary rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? getText(t, 'common.checking', 'جاري الفحص...') : getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
              </button>

              <button 
                onClick={logout} 
                aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
                title={getText(t, 'common.logout', 'تسجيل الخروج')}
                className="px-5 min-h-[44px] bg-transparent text-semantic-danger border border-semantic-danger rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <LogOut size={16} />
                {getText(t, 'common.logout', 'تسجيل الخروج')}
              </button>
            </div>
          </div>
        </div>
      )}

      {appState === 'SUSPENDED' && !isNeedsRoleSelection && (
        <div className="min-h-screen flex items-center justify-center bg-semantic-bgPage p-5 font-['Cairo',system-ui,sans-serif]">
          <div className="w-full max-w-lg bg-semantic-surfaceCard p-10 rounded-[20px] text-center border border-semantic-borderCard">
            <div className="bg-semantic-dangerBg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-semantic-danger">
              <ShieldAlert size={36} />
            </div>
            <h2 className="text-semantic-textPrimary mb-3 text-2xl font-bold">
              {getText(t, 'suspension.title', 'تم إيقاف حساب الأكاديمية')}
            </h2>
            <div className="bg-semantic-surfaceInput p-4 rounded-xl border border-semantic-borderCard mb-6 text-start">
              <span className="text-xs text-semantic-textSecondary block mb-1">
                {getText(t, 'suspension.reason_label', 'سبب الإيقاف:')}
              </span>
              <p className="text-[#FCA5A5] m-0 text-sm leading-relaxed">
                {getSuspensionReason()}
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button 
                onClick={handleManualRefresh} 
                disabled={isRefreshing}
                aria-label={getText(t, 'common.refresh', 'إعادة التحديث')}
                title={getText(t, 'common.refresh', 'إعادة التحديث')}
                className="px-5 min-h-[44px] bg-gradient-to-b from-[#E67E00] to-[#D97706] text-semantic-textPrimary rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? getText(t, 'common.checking', 'جاري التحقق...') : getText(t, 'common.refresh', 'إعادة التحديث')}
              </button>

              <button 
                onClick={logout} 
                aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
                title={getText(t, 'common.logout', 'تسجيل الخروج')}
                className="px-5 min-h-[44px] bg-transparent text-semantic-danger border border-semantic-danger rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <LogOut size={16} />
                {getText(t, 'common.logout', 'تسجيل الخروج')}
              </button>
            </div>
          </div>
        </div>
      )}

      {appState === 'SUPER_ADMIN' && !isNeedsRoleSelection && (
        <ProtectedRoute allowedRoles={[ROLES?.SUPER_ADMIN || 'super_admin']}>
          <AdminDashboard session={{ user }} onLogout={logout} />
        </ProtectedRoute>
      )}

      {(appState === 'NO_ACADEMY' || (appState === 'FULLY_ACTIVE' && !profile?.academy_id && userRole !== 'super_admin')) && appState !== 'SUPER_ADMIN' && !isNeedsRoleSelection && (
        !profile?.academy_id && cachedSlug ? (
          <FullPageLoader label={getText(t, 'academy.syncing', 'جاري مزامنة بيانات الأكاديمية...')} />
        ) : (
          <CreateAcademy 
            onLogout={logout} 
            onSubmitAcademy={async (createdAcademyData) => {
              if (createdAcademyData?.slug) {
                localStorage.setItem('current_academy_slug', createdAcademyData.slug);
              }
              if (refreshStatus) await refreshStatus();
            }} 
          />
        )
      )}

      {appState === 'FULLY_ACTIVE' && profile?.academy_id && !isNeedsRoleSelection && (
        <Routes>
          <Route 
            path="/:slug/*" 
            element={
              <ProtectedRoute allowedRoles={Object.values(ROLES || {})}>
                <MainApp 
                  session={user ? { user } : null} 
                  userRole={(userRole || profile?.role || 'student').toString().toLowerCase().trim()} 
                  setShowEarlyUpgrade={setShowEarlyUpgrade}
                />
                <InlineUpgradeModal 
                  isOpen={showEarlyUpgrade} 
                  onClose={() => setShowEarlyUpgrade(false)} 
                  academyName={academy?.name}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/*" 
            element={
              (academy?.slug || cachedSlug) ? (
                <Navigate to={`/${academy?.slug || cachedSlug}/${
                  ['admin', 'super_admin'].includes((userRole || profile?.role || '').toLowerCase()) ? 'dashboard' :
                  (userRole || profile?.role || '').toLowerCase() === 'teacher' ? 'teacher' :
                  (userRole || profile?.role || '').toLowerCase() === 'student' ? 'student' :
                  (userRole || profile?.role || '').toLowerCase() === 'parent' ? 'parent' : 'dashboard'
                }`} replace />
              ) : (
                <ProtectedRoute allowedRoles={Object.values(ROLES || {})}>
                  <MainApp 
                    session={user ? { user } : null} 
                    userRole={(userRole || profile?.role || 'student').toString().toLowerCase().trim()} 
                    setShowEarlyUpgrade={setShowEarlyUpgrade}
                  />
                </ProtectedRoute>
              )
            } 
          />
        </Routes>
      )}

      {!['LOADING', 'UNAUTHENTICATED', 'PENDING_APPROVAL', 'SUSPENDED', 'SUPER_ADMIN', 'NO_ACADEMY', 'FULLY_ACTIVE'].includes(appState) && !isNeedsRoleSelection && (
        <div className="bg-semantic-bgPage min-h-screen flex flex-col justify-center items-center text-semantic-textPrimary font-['Cairo',system-ui,sans-serif] p-5 text-center">
          <AlertTriangle size={40} className="text-semantic-danger mb-4" />
          <h2 className="mb-2 text-xl font-bold">{getText(t, 'system.unknown_state_title', 'عذراً، حالة النظام غير معرفة')}</h2>
          <p className="text-semantic-textSecondary mb-2">App State: <strong className="text-semantic-actionPrimary">{appState || 'NULL'}</strong></p>
          <button 
            onClick={logout} 
            aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
            title={getText(t, 'common.logout', 'تسجيل الخروج')}
            className="bg-gradient-to-b from-[#E67E00] to-[#D97706] text-semantic-textPrimary px-6 min-h-[44px] border-none rounded-md cursor-pointer font-bold transition-all active:scale-[0.99]"
          >
            {getText(t, 'common.logout', 'تسجيل الخروج')}
          </button>
        </div>
      )}
    </Suspense>
  );
}
