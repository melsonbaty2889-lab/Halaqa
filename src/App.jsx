import TestHooks from '@/components/TestHooks';
import React, { useState, useEffect, Component, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { 
  Loader2, Clock, LogOut, Wifi, WifiOff,
  AlertTriangle, RefreshCw, Zap, CheckCircle, X, Lock, ShieldAlert 
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import { ROLES } from '@/constants/roles';
import rawColors from '@/theme/colors.js';
import { getText } from '@/utils/textUtils';

// 🚀 Dynamic Imports (Lazy Loading)
const SplashScreen = lazy(() => import('@/components/UI/SplashScreen'));
const LoginPage = lazy(() => import('@/components/Auth/LoginPage'));
const SignUpPage = lazy(() => import('@/components/Auth/SignUpPage'));
const ForgotPassword = lazy(() => import('@/components/Auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/components/Auth/UpdatePassword'));
const MainApp = lazy(() => import('@/components/Main/MainApp'));
const CreateAcademy = lazy(() => import('@/components/Auth/CreateAcademy'));
const CertificateVerify = lazy(() => import('@/components/Certificates/CertificateVerify'));
const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));

const DevPlayground = lazy(() => {
  if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.search.includes('view=test'))) {
    return import('@/components/Dev/DevPlayground');
  }
  return Promise.resolve({ default: () => null });
});

// 🎨 كائن الألوان الديناميكي المطور وفقاً لنظام الألوان v2.5
const C = {
  ...rawColors,
  dark: {
    main: rawColors?.dark?.bg || '#070B11',
    card: rawColors?.dark?.card || 'rgba(15, 23, 42, 0.85)',
    border: rawColors?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)',
    surface: rawColors?.dark?.surface || '#0A0F1C',
  },
  primary: {
    DEFAULT: rawColors?.amber?.DEFAULT || rawColors?.primary?.DEFAULT || '#D97706',
    hover: rawColors?.primary?.hover || '#B45309',
    gradient: rawColors?.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)',
  },
  brandEmerald: {
    DEFAULT: rawColors?.emerald?.DEFAULT || rawColors?.brandEmerald?.DEFAULT || '#10B981',
    dark: rawColors?.emerald?.dark || '#059669',
    light: rawColors?.emerald?.light || '#34D399',
    bgGlow: rawColors?.emerald?.radialGlow || 'rgba(16, 185, 129, 0.14)',
    logoGlow: rawColors?.emerald?.logoGlow || 'rgba(16, 185, 129, 0.35)',
    bg: rawColors?.brandEmerald?.bg || '#09332C',
    border: rawColors?.brandEmerald?.border || '#0D5C4D',
  },
  text: {
    title: rawColors?.text?.title || '#FFFFFF',
    subtitle: rawColors?.text?.subtitle || '#D97706',
    body: rawColors?.text?.body || '#E2E8F0',
    muted: rawColors?.text?.muted || '#94A3B8',
    placeholder: rawColors?.text?.placeholder || '#64748B',
  },
  inputs: {
    bg: rawColors?.inputs?.bg || 'rgba(10, 15, 28, 0.8)',
    border: rawColors?.inputs?.border || 'rgba(255, 255, 255, 0.12)',
    borderFocus: rawColors?.inputs?.borderFocus || '#D97706',
    icon: rawColors?.inputs?.icon || '#64748B',
  },
  gradients: {
    starsBg: rawColors?.gradients?.starsBg || `
      radial-gradient(circle at 50% 28%, rgba(16, 185, 129, 0.14) 0%, transparent 45%),
      radial-gradient(rgba(255, 255, 255, 0.15) 1.2px, transparent 1.2px)
    `,
    primaryBtn: rawColors?.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)',
    logoBox: rawColors?.gradients?.logoBox || 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    progressBar: rawColors?.gradients?.progressBar || 'linear-gradient(90deg, #10B981 0%, #F59E0B 100%)',
  },
  error: {
    DEFAULT: rawColors?.error?.DEFAULT || '#EF4444',
    bgGlow: 'rgba(239, 68, 68, 0.15)',
    light: '#FCA5A5',
  }
};

function OfflineAndUpdateBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [needRefresh, setNeedRefresh] = useState(false);
  const { t } = useAcademy();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNeedRefresh(true);
              }
            };
          }
        };
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      {!isOnline && (
        <div style={{
          background: C.error?.DEFAULT,
          color: C.text?.title,
          textAlign: 'center',
          padding: '8px 16px',
          position: 'fixed',
          insetBlockStart: 0,
          insetInlineStart: 0,
          insetInlineEnd: 0,
          zIndex: 99999,
          fontWeight: 'bold',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          fontFamily: "'Cairo', system-ui, sans-serif"
        }}>
          <WifiOff size={18} />
          <span>{getText(t, 'system.offline_notice', 'أنت تعمل حالياً بدون اتصال بالإنترنت (وضع الأوفلاين)')}</span>
        </div>
      )}

      {needRefresh && (
        <div style={{
          background: C.brandEmerald?.DEFAULT,
          color: C.dark?.surface,
          textAlign: 'center',
          padding: '8px 16px',
          position: 'fixed',
          insetBlockEnd: '16px',
          insetInlineEnd: '16px',
          zIndex: 99999,
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          fontFamily: "'Cairo', system-ui, sans-serif"
        }}>
          <span>{getText(t, 'system.update_available', 'يتوفر تحديث جديد للمنظومة!')}</span>
          <button
            onClick={handleReload}
            aria-label={getText(t, 'system.update_now', 'تحديث الآن')}
            title={getText(t, 'system.update_now', 'تحديث الآن')}
            style={{
              background: C.dark?.main,
              color: C.brandEmerald?.DEFAULT,
              border: 'none',
              padding: '6px 12px',
              minHeight: '44px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem'
            }}
          >
            <RefreshCw size={14} />
            {getText(t, 'system.update_now', 'تحديث الآن')}
          </button>
        </div>
      )}
    </>
  );
}

// 🛡️ ProtectedRoute المصححة والمضمونة
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { profile, appState, academy, userRole, logout, t } = useAcademy();
  const { slug } = useParams();

  if (appState === 'LOADING') {
    return (
      <div style={{ background: C.dark?.main, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.primary?.DEFAULT }}>
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  // 1. تحديد الدور الحالي وتنظيفه
  const currentRole = (userRole || profile?.role || 'admin').toString().toLowerCase().trim();
  const normalizedAllowed = allowedRoles.map(r => (r || '').toString().toLowerCase().trim());

  // 2. فحص الصلاحيات (الأدمن والسوبر أدمن مجازين دائماً)
  const isAllowed = normalizedAllowed.length === 0 || 
                    normalizedAllowed.includes(currentRole) || 
                    currentRole === 'admin' || 
                    currentRole === 'super_admin';

  // 3. فحص الأكاديمية بدون إغلاق الوصول في حالة التطابق أو الحسابات الافتراضية
  const currentSlug = academy?.slug || (typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : null);
  const isCorrectAcademy = !slug || 
                          !currentSlug || 
                          slug === currentSlug || 
                          academy?.id === 'default' ||
                          currentRole === 'super_admin' || 
                          currentRole === 'admin';

  if (!isAllowed || !isCorrectAcademy) {
    return (
      <div style={{
        background: C.dark?.main,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.text?.title,
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Cairo', system-ui, sans-serif"
      }}>
        <div style={{ background: C.error?.bgGlow, padding: '20px', borderRadius: '50%', marginBlockEnd: '16px', color: C.error?.DEFAULT }}>
          <Lock size={40} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBlockEnd: '8px' }}>
          {getText(t, 'auth.unauthorized_title', 'غير مصرح لك بالوصول لهذه الشاشة')}
        </h2>
        <p style={{ color: C.text?.muted, fontSize: '14px', maxWidth: '400px', marginBlockEnd: '24px' }}>
          {getText(t, 'auth.unauthorized_desc', 'دور حسابك الحالي غير مجاز لاستخدام هذه الصفحة.')}
        </p>
        <button
          onClick={logout}
          aria-label={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          title={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          style={{
            padding: '10px 20px',
            minHeight: '44px',
            background: C.primary?.gradient,
            color: C.text?.title,
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
        </button>
      </div>
    );
  }

  return children;
};
if (typeof window !== 'undefined') {
  const handleChunkError = (error) => {
    const errorMsg = error?.message || error?.toString() || '';
    if (/Failed to fetch dynamically imported module|chunk load error|loading chunk|Unexpected token/i.test(errorMsg)) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (let name of names) caches.delete(name);
        });
      }
      window.location.reload();
    }
  };
  window.addEventListener('unhandledrejection', (event) => handleChunkError(event.reason));
  window.addEventListener('error', (event) => handleChunkError(event.error), true);
}

function InlineUpgradeModal({ isOpen, onClose, academyName }) {
  const { t } = useAcademy();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        background: C.dark?.card,
        border: `1px solid ${C.dark?.border}`,
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          aria-label={getText(t, 'common.close', 'إغلاق')}
          title={getText(t, 'common.close', 'إغلاق')}
          style={{
            position: 'absolute',
            insetBlockStart: '16px',
            insetInlineStart: '16px',
            background: 'none',
            border: 'none',
            color: C.text?.muted,
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBlockEnd: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: C.brandEmerald?.bgGlow,
            color: C.brandEmerald?.DEFAULT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Zap size={24} />
          </div>
          <h2 style={{ color: C.text?.title, fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: 'bold' }}>
            {getText(t, 'upgrade.title', 'ترقية حساب الأكاديمية')}
          </h2>
          <p style={{ color: C.text?.muted, fontSize: '0.85rem', margin: 0 }}>
            {getText(t, 'upgrade.subtitle', 'احصل على كافة مميزات المنظومة الاحترافية لأكاديميتك')} ({academyName || ''})
          </p>
        </div>

        <div style={{
          background: C.dark?.surface,
          borderRadius: '10px',
          padding: '14px',
          marginBlockEnd: '20px',
          border: `1px solid ${C.dark?.border}`
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: C.text?.body, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald?.DEFAULT }} />
              <span>{getText(t, 'upgrade.feat1', 'إدارة عدد غير محدود من الطلاب والحلقات')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald?.DEFAULT }} />
              <span>{getText(t, 'upgrade.feat2', 'تقارير وأداء لحظي وتنبيهات مستمرة')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald?.DEFAULT }} />
              <span>{getText(t, 'upgrade.feat3', 'دعم فني وتحديثات مستمرة للباقة الاحترافية')}</span>
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              alert(getText(t, 'upgrade.success_msg', 'تم إرسال طلب الترقية إلى إدارة المنصة بنجاح، سيتم التواصل معكم فوراً.'));
              onClose();
            }}
            aria-label={getText(t, 'upgrade.confirm', 'تأكيد طلب الترقية')}
            title={getText(t, 'upgrade.confirm', 'تأكيد طلب الترقية')}
            style={{
              flex: 1,
              padding: '12px',
              minHeight: '44px',
              background: C.primary?.gradient,
              color: C.text?.title,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {getText(t, 'upgrade.confirm', 'تأكيد طلب الترقية')}
          </button>
          <button
            onClick={onClose}
            aria-label={getText(t, 'common.cancel', 'إلغاء')}
            title={getText(t, 'common.cancel', 'إلغاء')}
            style={{
              padding: '12px 18px',
              minHeight: '44px',
              background: 'transparent',
              color: C.text?.muted,
              border: `1px solid ${C.dark?.border}`,
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {getText(t, 'common.cancel', 'إلغاء')}
          </button>
        </div>
      </div>
    </div>
  );
}

class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Global App Crash:", error, errorInfo);
  }

  handleReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      });
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.toString() || 'حدث خطأ غير متوقع في النظام';

      return (
        <div style={{
          minHeight: '100vh',
          background: C.dark?.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Cairo', system-ui, sans-serif",
          color: C.text?.title
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: C.dark?.card,
            border: `1px solid ${C.dark?.border}`,
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              insetBlockStart: '-60px',
              insetInlineStart: '50%',
              transform: 'translateX(-50%)',
              width: '180px',
              height: '180px',
              background: C.error?.DEFAULT,
              filter: 'blur(90px)',
              opacity: 0.25,
              pointerEvents: 'none'
            }} />

            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: C.error?.bgGlow,
              border: `1px solid ${C.error?.DEFAULT}`,
              color: C.error?.DEFAULT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <AlertTriangle size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBlockEnd: '8px', color: C.text?.title }}>
              عذراً، حدث خطأ تقني غير متوقع
            </h2>
            <p style={{ fontSize: '0.875rem', color: C.text?.muted, marginBlockEnd: '24px', lineHeight: '1.6' }}>
              واجه النظام مشكلة أثناء تحميل هذه الصفحة. حاول تفريغ الذاكرة المؤقتة وإعادة التحديث.
            </p>

            <div style={{
              background: C.dark?.surface,
              border: `1px solid ${C.dark?.border}`,
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'start',
              marginBlockEnd: '28px'
            }}>
              <div style={{ fontSize: '0.75rem', color: C.text?.muted, marginBlockEnd: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>تفاصيل الخطأ:</span>
                <span style={{ color: C.error?.light }}>CRASH_REPORT</span>
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: C.error?.light,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '110px',
                overflowY: 'auto'
              }}>
                {errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReload}
              aria-label="إعادة تحميل الصفحة"
              title="إعادة تحميل الصفحة"
              style={{
                width: '100%',
                padding: '12px 20px',
                minHeight: '44px',
                background: C.primary?.gradient,
                color: C.text?.title,
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={18} />
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainContent() {
  const { appState, user, profile, academy, logout, refreshStatus, userRole, t } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

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

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (refreshStatus) await refreshStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refreshStatus]);

  const getSuspensionReason = useCallback(() => {
    const reason = academy?.suspension_reason || academy?.status_reason;
    if (!reason) return getText(t, 'suspension.default_reason', 'تم إيقاف هذه الأكاديمية مؤقتاً من قبل إدارة المنصة.');
    
    if (typeof reason === 'object' && reason !== null) {
      return reason.ar || reason.en || Object.values(reason)[0] || JSON.stringify(reason);
    }
    return String(reason);
  }, [academy, t]);

  if (authView === 'update_password') {
    return (
      <UpdatePassword 
        onSuccess={() => {
          setAuthView('login');
          if (refreshStatus) refreshStatus();
        }} 
      />
    );
  }

  if (appState === 'LOADING' || !appState) {
    return (
      <div style={{ background: C.dark?.main, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.primary?.DEFAULT, gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} />
        <span style={{ fontSize: '0.85rem', color: C.text?.muted, fontFamily: "'Cairo', system-ui, sans-serif" }}>
          {getText(t, 'system.loading', 'جاري تحميل المنظومة...')}
        </span>
      </div>
    );
  }

  if (appState === 'UNAUTHENTICATED') {
    return (
      <div style={{ background: C.dark?.main, minHeight: '100vh' }}>
        {authView === 'login' && (
          <LoginPage 
            onSwitchToSignUp={() => setAuthView('signup')} 
            onForgotPassword={() => setAuthView('forgot')}
            onLoginSuccess={() => refreshStatus && refreshStatus()}
          />
        )}
        {authView === 'signup' && (
          <SignUpPage onSwitchToLogin={() => setAuthView('login')} />
        )}
        {authView === 'forgot' && (
          <ForgotPassword onBackToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  if (appState === 'PENDING_APPROVAL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.dark?.main, padding: '20px', fontFamily: "'Cairo', system-ui, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '500px', background: C.dark?.card, padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${C.dark?.border}` }}>
          <Clock size={40} style={{ color: C.primary?.DEFAULT, marginBlockEnd: '20px' }} />
          <h2 style={{ color: C.text?.title, marginBlockEnd: '15px' }}>
            {getText(t, 'approval.pending_title', 'طلبك قيد المراجعة')}
          </h2>
          <p style={{ color: C.text?.muted, marginBlockEnd: '25px', lineHeight: '1.6' }}>
            {getText(t, 'approval.pending_desc', 'حسابك وأكاديميتك قيد التدقيق والموافقة من قبل الإدارة العامة للمنصة.')}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              aria-label={getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
              title={getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
              style={{ padding: '10px 20px', minHeight: '44px', background: C.primary?.gradient, color: C.text?.title, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? getText(t, 'common.checking', 'جاري الفحص...') : getText(t, 'approval.refresh_status', 'تحديث حالة الطلب')}
            </button>
            
            <button 
              onClick={logout} 
              aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
              title={getText(t, 'common.logout', 'تسجيل الخروج')}
              style={{ padding: '10px 20px', minHeight: '44px', background: 'transparent', color: C.error?.DEFAULT, border: `1px solid ${C.error?.DEFAULT}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              {getText(t, 'common.logout', 'تسجيل الخروج')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'SUSPENDED') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.dark?.main, padding: '20px', fontFamily: "'Cairo', system-ui, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '500px', background: C.dark?.card, padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${C.dark?.border}` }}>
          <div style={{ background: C.error?.bgGlow, width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: C.error?.DEFAULT }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ color: C.text?.title, marginBlockEnd: '12px', fontSize: '1.4rem', fontWeight: 'bold' }}>
            {getText(t, 'suspension.title', 'تم إيقاف حساب الأكاديمية')}
          </h2>
          <div style={{ background: C.dark?.surface, padding: '16px', borderRadius: '12px', border: `1px solid ${C.dark?.border}`, marginBlockEnd: '24px', textAlign: 'start' }}>
            <span style={{ fontSize: '0.8rem', color: C.text?.muted, display: 'block', marginBlockEnd: '4px' }}>
              {getText(t, 'suspension.reason_label', 'سبب الإيقاف:')}
            </span>
            <p style={{ color: C.error?.light, margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              {getSuspensionReason()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              aria-label={getText(t, 'common.refresh', 'إعادة التحديث')}
              title={getText(t, 'common.refresh', 'إعادة التحديث')}
              style={{ padding: '10px 20px', minHeight: '44px', background: C.primary?.gradient, color: C.text?.title, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? getText(t, 'common.checking', 'جاري التحقق...') : getText(t, 'common.refresh', 'إعادة التحديث')}
            </button>
            
            <button 
              onClick={logout} 
              aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
              title={getText(t, 'common.logout', 'تسجيل الخروج')}
              style={{ padding: '10px 20px', minHeight: '44px', background: 'transparent', color: C.error?.DEFAULT, border: `1px solid ${C.error?.DEFAULT}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              {getText(t, 'common.logout', 'تسجيل الخروج')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'SUPER_ADMIN') {
    return (
      <ProtectedRoute allowedRoles={[ROLES?.SUPER_ADMIN || 'super_admin']}>
        <AdminDashboard session={{ user }} onLogout={logout} />
      </ProtectedRoute>
    );
  }

  if (appState === 'NO_ACADEMY' || (appState === 'FULLY_ACTIVE' && !profile?.academy_id && userRole !== 'super_admin')) {
    const cachedSlug = typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : null;

    // 1. تنظيف الـ Cache القديم إذا كان الحساب الحالي غير مرتبط بأكاديمية في قاعدة البيانات
    if (!profile?.academy_id && cachedSlug) {
      localStorage.removeItem('current_academy_slug');
    }

    // 2. إذا وجد slug ومسجل بالفعل بالبروفايل، نقوم بالتزامن
    if (cachedSlug && profile?.academy_id) {
      if (refreshStatus) refreshStatus();
      return (
        <div style={{ background: C.dark?.main, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.primary?.DEFAULT, gap: '12px' }}>
          <Loader2 className="animate-spin" size={32} />
          <span style={{ fontSize: '0.85rem', color: C.text?.muted, fontFamily: "'Cairo', system-ui, sans-serif" }}>
            {getText(t, 'academy.syncing', 'جاري مزامنة بيانات الأكاديمية...')}
          </span>
        </div>
      );
    }

    // 3. عرض شاشة التأسيس/اختيار الدور بدلاً من الشاشات الافتراضية
    return (
      <CreateAcademy 
        onLogout={logout} 
        onSubmitAcademy={async (createdAcademyData) => {
          if (createdAcademyData?.slug) {
            localStorage.setItem('current_academy_slug', createdAcademyData.slug);
          }
          if (refreshStatus) await refreshStatus();
        }} 
      />
    );
  }

  if (appState === 'FULLY_ACTIVE') {
    const formattedSession = user ? { user } : null;
    const resolvedRole = (userRole || profile?.role || 'student').toString().toLowerCase().trim();
    const activeSlug = academy?.slug || localStorage.getItem('current_academy_slug');

    // تحديد مسار البداية المناسب لكل دور بدقة
    const getRoleDefaultSubPath = (role) => {
      switch (role) {
        case 'admin':
        case 'super_admin':
          return 'dashboard';
        case 'teacher':
          return 'teacher';
        case 'student':
          return 'student';
        case 'parent':
          return 'parent';
        default:
          return 'dashboard';
      }
    };

    return (
      <Routes>
        {/* 1. المسار المباشر مع الـ slug */}
        <Route 
          path="/:slug/*" 
          element={
            <ProtectedRoute allowedRoles={Object.values(ROLES || {})}>
              <MainApp 
                session={formattedSession} 
                userRole={resolvedRole} 
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

        {/* 2. إعادة التوجيه التلقائية الصريحة فور دخول المستخدم دون slug */}
        <Route 
          path="/*" 
          element={
            activeSlug ? (
              <Navigate to={`/${activeSlug}/${getRoleDefaultSubPath(resolvedRole)}`} replace />
            ) : (
              <ProtectedRoute allowedRoles={Object.values(ROLES || {})}>
                <MainApp 
                  session={formattedSession} 
                  userRole={resolvedRole} 
                  setShowEarlyUpgrade={setShowEarlyUpgrade}
                />
              </ProtectedRoute>
            )
          } 
        />
      </Routes>
    );
  }
  return (
    <div style={{
      background: C.dark?.main, minHeight: '100vh', display: 'flex', flexDirection:
      'column', justifyContent: 'center', alignItems: 'center', color: C.text?.title,
      fontFamily: "'Cairo', system-ui, sans-serif", padding: '20px',
      textAlign: 'center' }}>
      <AlertTriangle size={40} style={{ color: C.error?.DEFAULT, marginBlockEnd: '15px' }} />
      <h2 style={{ marginBlockEnd: '10px' }}>{getText(t, 'system.unknown_state_title', 'عذراً، حالة النظام غير معرفة')}</h2>
      <p style={{ color: C.text?.muted, marginBlockEnd: '5px' }}>App State: <strong style={{ color: C.primary?.DEFAULT }}>{appState || 'NULL'}</strong></p>
      <button 
        onClick={logout} 
        aria-label={getText(t, 'common.logout', 'تسجيل الخروج')}
        title={getText(t, 'common.logout', 'تسجيل الخروج')}
        style={{
          background: C.primary?.gradient, color: C.text?.title, padding: '10px 25px',
          minHeight: '44px', border: 'none', borderRadius: '6px', cursor: 'pointer',
          fontWeight: 'bold' }}
      >
        {getText(t, 'common.logout', 'تسجيل الخروج')}
      </button>
    </div>
  );
}

export default function App() {
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const view = urlParams.get('view');

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem('app_splash_seen');
    } catch {
      return false;
    }
  });

  const handleSplashFinish = useCallback(() => {
    try {
      sessionStorage.setItem('app_splash_seen', 'true');
    } catch {
      // Ignored
    }
    setShowSplash(false);
  }, []);

  return (
    <GlobalErrorBoundary>
      <Suspense fallback={
        <div style={{ background: C.dark?.main, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary?.DEFAULT }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      }>
        {view === 'test' ? (
          <DevPlayground />
        ) : view === 'splash' || showSplash ? (
          <SplashScreen lang="ar" onFinish={view === 'splash' ? () => alert('انتهى عرض الشاشة الافتتاحية') : handleSplashFinish} />
        ) : (
          <>
            <OfflineAndUpdateBanner />
            <Routes>
              <Route path="/verify/:certId" element={<CertificateVerify />} />
              <Route path="/*" element={<MainContent />} />
            </Routes>
          </>
        )}
      </Suspense>
    </GlobalErrorBoundary>
  );
}
