import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2, Clock, LogOut, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import { ROLES } from '@/constants/roles';
import { C } from '@/theme/colors';

import ProtectedRoute from './ProtectedRoute';
import InlineUpgradeModal from './InlineUpgradeModal';

const LoginPage = lazy(() => import('@/components/Auth/LoginPage'));
const SignUpPage = lazy(() => import('@/components/Auth/SignUpPage'));
const ForgotPassword = lazy(() => import('@/components/Auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/components/Auth/UpdatePassword'));
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

const FullPageLoader = ({ label }) => (
  <div style={{ background: C.dark?.bg || '#050811', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.amber?.DEFAULT || '#D97706', gap: '12px' }}>
    <Loader2 className="animate-spin" size={32} />
    <span style={{ fontSize: '0.85rem', color: C.text?.muted || '#94A3B8', fontFamily: "'Cairo', system-ui, sans-serif" }}>
      {label}
    </span>
  </div>
);

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

  // علاج استدعاء المزامنة بشكل آمن داخل useEffect
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

  return (
    <Suspense fallback={<FullPageLoader label={getText(t, 'system.loading', 'جاري تحميل المنظومة...')} />}>
      {/* 1. Update Password View */}
      {authView === 'update_password' && (
        <UpdatePassword 
          onSuccess={() => {
            setAuthView('login');
            refreshStatus?.();
          }} 
        />
      )}

      {/* 2. Loading State */}
      {(appState === 'LOADING' || !appState) && authView !== 'update_password' && (
        <FullPageLoader label={getText(t, 'system.loading', 'جاري تحميل المنظومة...')} />
      )}

      {/* 3. Unauthenticated State */}
      {appState === 'UNAUTHENTICATED' && authView !== 'update_password' && (
        <div style={{ background: C.dark?.bg || '#050811', minHeight: '100vh' }}>
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

      {/* 4. Pending Approval State */}
      {appState === 'PENDING_APPROVAL' && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.dark?.bg || '#050811', padding: '20px', fontFamily: "'Cairo', system-ui, sans-serif" }}>
          <div style={{ width: '100%', maxWidth: '500px', background: C.dark?.card || 'rgba(15, 23, 42, 0.85)', padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'}` }}>
            <Clock size={40} style={{ color: C.amber?.DEFAULT || '#D97706', marginBlockEnd: '20px' }} />
            <h2 style={{ color: C.text?.title || '#FFFFFF', marginBlockEnd: '15px' }}>
              {getText(t, 'approval.pending_title', 'طلبك قيد المراجعة')}
            </h2>
            <p style={{ color: C.text?.muted || '#94A3B8', marginBlockEnd: '25px', lineHeight: '1.6' }}>
              {getText(t, 'approval.pending_desc', 'حسابك وأكاديميتك قيد التدقيق والموافقة من قبل الإدارة العامة للمنصة.')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleManualRefresh} 
                disabled={isRefreshing}
                aria-label={getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
                title={getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
                style={{ padding: '10px 20px', minHeight: '44px', background: C.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)', color: C.text?.title || '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? getText(t, 'common.checking', 'جاري الفحص...') : getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
              </button>

              <button 
                onClick={logout} 
                aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
                title={getText(t, 'common.logout', 'تسجيل الخروج')}
                style={{ padding: '10px 20px', minHeight: '44px', background: 'transparent', color: C.error?.DEFAULT || '#EF4444', border: `1px solid ${C.error?.DEFAULT || '#EF4444'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LogOut size={16} />
                {getText(t, 'common.logout', 'تسجيل الخروج')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Suspended State */}
      {appState === 'SUSPENDED' && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.dark?.bg || '#050811', padding: '20px', fontFamily: "'Cairo', system-ui, sans-serif" }}>
          <div style={{ width: '100%', maxWidth: '500px', background: C.dark?.card || 'rgba(15, 23, 42, 0.85)', padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'}` }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: C.error?.DEFAULT || '#EF4444' }}>
              <ShieldAlert size={36} />
            </div>
            <h2 style={{ color: C.text?.title || '#FFFFFF', marginBlockEnd: '12px', fontSize: '1.4rem', fontWeight: 'bold' }}>
              {getText(t, 'suspension.title', 'تم إيقاف حساب الأكاديمية')}
            </h2>
            <div style={{ background: C.dark?.surface || '#0A0F1C', padding: '16px', borderRadius: '12px', border: `1px solid ${C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'}`, marginBlockEnd: '24px', textAlign: 'start' }}>
              <span style={{ fontSize: '0.8rem', color: C.text?.muted || '#94A3B8', display: 'block', marginBlockEnd: '4px' }}>
                {getText(t, 'suspension.reason_label', 'سبب الإيقاف:')}
              </span>
              <p style={{ color: '#FCA5A5', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                {getSuspensionReason()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleManualRefresh} 
                disabled={isRefreshing}
                aria-label={getText(t, 'common.refresh', 'إعادة التحديث')}
                title={getText(t, 'common.refresh', 'إعادة التحديث')}
                style={{ padding: '10px 20px', minHeight: '44px', background: C.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)', color: C.text?.title || '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? getText(t, 'common.checking', 'جاري التحقق...') : getText(t, 'common.refresh', 'إعادة التحديث')}
              </button>

              <button 
                onClick={logout} 
                aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
                title={getText(t, 'common.logout', 'تسجيل الخروج')}
                style={{ padding: '10px 20px', minHeight: '44px', background: 'transparent', color: C.error?.DEFAULT || '#EF4444', border: `1px solid ${C.error?.DEFAULT || '#EF4444'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LogOut size={16} />
                {getText(t, 'common.logout', 'تسجيل الخروج')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Super Admin State */}
      {appState === 'SUPER_ADMIN' && (
        <ProtectedRoute allowedRoles={[ROLES?.SUPER_ADMIN || 'super_admin']}>
          <AdminDashboard session={{ user }} onLogout={logout} />
        </ProtectedRoute>
      )}

      {/* 7. No Academy State */}
      {(appState === 'NO_ACADEMY' || (appState === 'FULLY_ACTIVE' && !profile?.academy_id && userRole !== 'super_admin')) && appState !== 'SUPER_ADMIN' && (
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

      {/* 8. Fully Active State */}
      {appState === 'FULLY_ACTIVE' && profile?.academy_id && (
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

      {/* 9. Unknown/Fallback State */}
      {!['LOADING', 'UNAUTHENTICATED', 'PENDING_APPROVAL', 'SUSPENDED', 'SUPER_ADMIN', 'NO_ACADEMY', 'FULLY_ACTIVE'].includes(appState) && (
        <div style={{
          background: C.dark?.bg || '#050811', minHeight: '100vh', display: 'flex', flexDirection:
          'column', justifyContent: 'center', alignItems: 'center', color: C.text?.title || '#FFFFFF',
          fontFamily: "'Cairo', system-ui, sans-serif", padding: '20px',
          textAlign: 'center' }}>
          <AlertTriangle size={40} style={{ color: C.error?.DEFAULT || '#EF4444', marginBlockEnd: '15px' }} />
          <h2 style={{ marginBlockEnd: '10px' }}>{getText(t, 'system.unknown_state_title', 'عذراً، حالة النظام غير معرفة')}</h2>
          <p style={{ color: C.text?.muted || '#94A3B8', marginBlockEnd: '5px' }}>App State: <strong style={{ color: C.amber?.DEFAULT || '#D97706' }}>{appState || 'NULL'}</strong></p>
          <button 
            onClick={logout} 
            aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
            title={getText(t, 'common.logout', 'تسجيل الخروج')}
            style={{
              background: C.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)', color: C.text?.title || '#FFFFFF', padding: '10px 25px',
              minHeight: '44px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 'bold' }}
          >
            {getText(t, 'common.logout', 'تسجيل الخروج')}
          </button>
        </div>
      )}
    </Suspense>
  );
}
