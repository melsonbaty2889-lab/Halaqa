import React, { useState, useEffect, Component, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { 
  Loader2, Clock, LogOut, Wifi, WifiOff,
  AlertTriangle, RefreshCw, Zap, CheckCircle, X, Lock, ShieldAlert 
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import { ROLES } from '@/constants/roles';
import rawColors from '@/theme/colors.js';

// 🚀 Dynamic Imports (Lazy Loading) لتقليل حجم الـ Initial Bundle
const SplashScreen = lazy(() => import('@/components/UI/SplashScreen'));
const DevPlayground = lazy(() => import('@/components/Dev/DevPlayground'));
const LoginPage = lazy(() => import('@/components/Auth/LoginPage'));
const SignUpPage = lazy(() => import('@/components/Auth/SignUpPage'));
const ForgotPassword = lazy(() => import('@/components/Auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/components/Auth/UpdatePassword'));
const MainApp = lazy(() => import('@/components/Main/MainApp'));
const CreateAcademy = lazy(() => import('@/components/Auth/CreateAcademy'));
const CertificateVerify = lazy(() => import('@/components/Certificates/CertificateVerify'));
const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));

// 🎨 طبقة حماية وتوافق لكائن الألوان
const C = {
  ...rawColors,
  dark: {
    main: rawColors?.dark?.main || rawColors?.card || '#0F172A',
    card: rawColors?.dark?.card || rawColors?.card || '#1E293B',
    border: rawColors?.dark?.border || rawColors?.borderCard || '#334155',
    surface: rawColors?.dark?.surface || rawColors?.input || '#090F16',
  },
  primary: {
    DEFAULT: typeof rawColors?.primary === 'string' ? rawColors.primary : rawColors?.primary?.DEFAULT || '#D97706',
    gradient: rawColors?.primary?.gradient || 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
  },
  text: {
    title: rawColors?.text?.title || rawColors?.text || '#F8FAFC',
    body: rawColors?.text?.body || rawColors?.textSub || '#CBD5E1',
    muted: rawColors?.text?.muted || rawColors?.textMuted || '#94A3B8',
  },
  error: {
    DEFAULT: rawColors?.error?.DEFAULT || rawColors?.danger || '#EF4444',
    bgGlow: rawColors?.error?.bgGlow || 'rgba(239, 68, 68, 0.15)',
    light: rawColors?.error?.light || '#FCA5A5',
  },
  brandEmerald: {
    DEFAULT: rawColors?.brandEmerald?.DEFAULT || '#10B981',
    bgGlow: rawColors?.brandEmerald?.bgGlow || 'rgba(16, 185, 129, 0.15)',
  }
};

// 📡 مكون التنبيه بالاتصال والتحديث اللحظي لـ PWA
function OfflineAndUpdateBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [needRefresh, setNeedRefresh] = useState(false);

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

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      {/* 1️⃣ شريط انقطاع الإنترنت */}
      {!isOnline && (
        <div style={{
          background: C.error.DEFAULT,
          color: '#FFFFFF',
          textAlign: 'center',
          padding: '8px 16px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          fontWeight: 'bold',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          direction: 'rtl',
          fontFamily: "'Cairo', system-ui, sans-serif"
        }}>
          <WifiOff size={18} />
          <span>أنت تعمل حالياً بدون اتصال بالإنترنت (وضع الأوفلاين)</span>
        </div>
      )}

      {/* 2️⃣ شريط التنبيه عند توفر تحديث جديد للمنصة */}
      {needRefresh && (
        <div style={{
          background: C.brandEmerald.DEFAULT,
          color: C.dark.surface,
          textAlign: 'center',
          padding: '8px 16px',
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 99999,
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          direction: 'rtl',
          fontFamily: "'Cairo', system-ui, sans-serif"
        }}>
          <span>يتوفر تحديث جديد للمنظومة!</span>
          <button
            onClick={handleReload}
            style={{
              background: C.dark.main,
              color: C.brandEmerald.DEFAULT,
              border: 'none',
              padding: '6px 12px',
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
            تحديث الآن
          </button>
        </div>
      )}
    </>
  );
}

// ProtectedRoute المحسنة بالاعتماد على الصلاحية والأكاديمية الـ Slug
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { profile, appState, academy, logout } = useAcademy();
  const { slug } = useParams();

  if (appState === 'LOADING') {
    return (
      <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.primary.DEFAULT }}>
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  const cleanRole = profile?.role?.toLowerCase()?.trim();
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(cleanRole);
  const isCorrectAcademy = !slug || (academy && academy.slug === slug);

  if (!isAllowed || !isCorrectAcademy) {
    return (
      <div style={{
        background: C.dark.main,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.text.title,
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Cairo', system-ui, sans-serif",
        direction: 'rtl'
      }}>
        <div style={{ background: C.error.bgGlow, padding: '20px', borderRadius: '50%', marginBottom: '16px', color: C.error.DEFAULT }}>
          <Lock size={40} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>غير مصرح لك بالوصول لهذه الشاشة</h2>
        <p style={{ color: C.text.muted, fontSize: '14px', maxWidth: '400px', marginBottom: '24px' }}>
          دور حسابك الحقيقي ({profile?.role || 'غير معروف'}) أو الأكاديمية المطلوبة غير متطابقة مع صلاحيتك الحالية.
        </p>
        <button
          onClick={logout}
          style={{
            padding: '10px 20px',
            background: C.primary.gradient,
            color: C.dark.main,
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          تسجيل الخروج والعودة
        </button>
      </div>
    );
  }

  return children;
};

// التعامل مع أخطاء التحميل وتفريغ الكاش القديم تلقائياً
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
      direction: 'rtl',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        background: C.dark.card,
        border: `1px solid ${C.dark.border}`,
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'none',
            border: 'none',
            color: C.text.muted,
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: C.brandEmerald.bgGlow,
            color: C.primary.DEFAULT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Zap size={24} />
          </div>
          <h2 style={{ color: C.text.title, fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: 'bold' }}>
            ترقية حساب الأكاديمية
          </h2>
          <p style={{ color: C.text.muted, fontSize: '0.85rem', margin: 0 }}>
            احصل على كافة مميزات المنظومة الاحترافية لأكاديميتك ({academyName || ''})
          </p>
        </div>

        <div style={{
          background: C.dark.surface,
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
          border: `1px solid ${C.dark.border}`
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: C.text.body, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald.DEFAULT }} />
              <span>إدارة عدد غير محدود من الطلاب والحلقات</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald.DEFAULT }} />
              <span>تقارير وأداء لحظي وتنبيهات مستمرة</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald.DEFAULT }} />
              <span>دعم فني وتحديثات مستمرة للباقة الاحترافية</span>
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              alert("تم إرسال طلب الترقية إلى إدارة المنصة بنجاح، سيتم التواصل معكم فوراً.");
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: C.primary.gradient,
              color: C.dark.main,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            تأكيد طلب الترقية
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              color: C.text.muted,
              border: `1px solid ${C.dark.border}`,
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// 🛡️ واجهة التعامل مع الأخطاء العامة بتصميم SaaS احترافي
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
          background: C.dark.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Cairo', system-ui, sans-serif",
          direction: 'rtl',
          color: C.text.title
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: C.dark.card,
            border: `1px solid ${C.dark.border}`,
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-60px',
              right: '50%',
              transform: 'translateX(50%)',
              width: '180px',
              height: '180px',
              background: C.error.DEFAULT,
              filter: 'blur(90px)',
              opacity: 0.25,
              pointerEvents: 'none'
            }} />

            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: C.error.bgGlow,
              border: `1px solid rgba(239, 68, 68, 0.3)`,
              color: C.error.DEFAULT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.2)'
            }}>
              <AlertTriangle size={36} />
            </div>

            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: C.text.title
            }}>
              عذراً، حدث خطأ تقني غير متوقع
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: C.text.muted,
              margin: '0 0 24px 0',
              lineHeight: '1.6'
            }}>
              واجه النظام مشكلة أثناء تحميل هذه الصفحة. حاول تفريغ الذاكرة المؤقتة وإعادة التحديث.
            </p>

            <div style={{
              background: C.dark.surface,
              border: `1px solid ${C.dark.border}`,
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'left',
              direction: 'ltr',
              marginBottom: '28px'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: C.text.muted,
                fontFamily: 'monospace',
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                direction: 'rtl'
              }}>
                <span>تفاصيل الخطأ:</span>
                <span style={{ color: C.error.light }}>CRASH_REPORT</span>
              </div>
              <p style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8rem',
                color: C.error.light,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '110px',
                overflowY: 'auto',
                lineHeight: '1.5'
              }}>
                {errorMessage}
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: C.primary.gradient,
                  color: C.dark.main,
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
                }}
              >
                <RefreshCw size={18} />
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainContent() {
  const { appState, user, profile, academy, logout, refreshStatus } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (refreshStatus) await refreshStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 🛡️ استخراج سبب الحظر بأمان وتامين الشاشة من Minified React error #31
  const getSuspensionReason = () => {
    const reason = academy?.suspension_reason || academy?.status_reason;
    if (!reason) return 'تم إيقاف هذه الأكاديمية مؤقتاً من قبل إدارة المنصة.';
    
    if (typeof reason === 'object' && reason !== null) {
      return reason.ar || reason.en || Object.values(reason)[0] || JSON.stringify(reason);
    }
    return String(reason);
  };

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
      <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.primary.DEFAULT, gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} />
        <span style={{ fontSize: '0.85rem', color: C.text.muted, fontFamily: "'Cairo', system-ui, sans-serif" }}>جاري تحميل المنظومة...</span>
      </div>
    );
  }

  if (appState === 'UNAUTHENTICATED') {
    return (
      <div style={{ background: C.dark.main, minHeight: '100vh', direction: 'rtl' }}>
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.dark.main, padding: '20px', direction: 'rtl', fontFamily: "'Cairo', system-ui, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '500px', background: C.dark.card, padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${C.dark.border}` }}>
          <Clock size={40} style={{ color: C.primary.DEFAULT, marginBottom: '20px' }} />
          <h2 style={{ color: C.text.title, marginBottom: '15px' }}>طلبك قيد المراجعة</h2>
          <p style={{ color: C.text.muted, marginBottom: '25px', lineHeight: '1.6' }}>
            حسابك ({profile?.full_name || 'المستخدم'}) وأكاديميتك قيد التدقيق والموافقة من قبل الإدارة العامة للمنصة.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              style={{ padding: '10px 20px', background: C.primary.gradient, color: C.dark.main, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'جاري الفحص...' : 'تحديث حالة الطلب'}
            </button>
            
            <button 
              onClick={logout} 
              style={{ padding: '10px 20px', background: 'transparent', color: C.error.DEFAULT, border: `1px solid ${C.error.DEFAULT}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🛑 شاشة الحظر / إيقاف الأكاديمية (SUSPENDED)
  if (appState === 'SUSPENDED') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.dark.main, padding: '20px', direction: 'rtl', fontFamily: "'Cairo', system-ui, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '500px', background: C.dark.card, padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${C.dark.border}` }}>
          <div style={{ background: C.error.bgGlow, width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: C.error.DEFAULT }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ color: C.text.title, marginBottom: '12px', fontSize: '1.4rem', fontWeight: 'bold' }}>تم إيقاف حساب الأكاديمية</h2>
          <div style={{ background: C.dark.surface, padding: '16px', borderRadius: '12px', border: `1px solid ${C.dark.border}`, marginBottom: '24px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: C.text.muted, display: 'block', marginBottom: '4px' }}>سبب الإيقاف:</span>
            <p style={{ color: C.error.light, margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              {getSuspensionReason()}
            </p>
          </div>
          <p style={{ color: C.text.muted, marginBottom: '25px', fontSize: '0.85rem' }}>
            للمراجعة وتفعيل الحساب مرة أخرى، يُرجى التواصل مع الدعم الفني للمنصة.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              style={{ padding: '10px 20px', background: C.primary.gradient, color: C.dark.main, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'جاري التحقق...' : 'إعادة التحديث'}
            </button>
            
            <button 
              onClick={logout} 
              style={{ padding: '10px 20px', background: 'transparent', color: C.error.DEFAULT, border: `1px solid ${C.error.DEFAULT}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'SUPER_ADMIN') {
    return (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <AdminDashboard session={{ user }} onLogout={logout} />
      </ProtectedRoute>
    );
  }

  if (appState === 'NO_ACADEMY') {
    const cachedSlug = typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : null;
    if (cachedSlug) {
      refreshStatus && refreshStatus();
      return (
        <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.primary.DEFAULT, gap: '12px' }}>
          <Loader2 className="animate-spin" size={32} />
          <span style={{ fontSize: '0.85rem', color: C.text.muted, fontFamily: "'Cairo', system-ui, sans-serif" }}>جاري مزامنة بيانات الأكاديمية...</span>
        </div>
      );
    }

    return (
      <CreateAcademy 
        onLogout={logout} 
        onSubmitAcademy={async (createdAcademyData) => {
          if (refreshStatus) {
            await refreshStatus();
          }
          if (createdAcademyData?.slug) {
            localStorage.setItem('current_academy_slug', createdAcademyData.slug);
          }
        }} 
      />
    );
  }

  if (appState === 'FULLY_ACTIVE') {
    const formattedSession = user ? { user } : null;
    const targetSlug = academy?.slug || (typeof window !== 'undefined' ? localStorage.getItem('current_academy_slug') : '') || '';

    return (
      <Routes>
        <Route 
          path="/:slug/*" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]}>
              <MainApp 
                session={formattedSession} 
                userRole={profile?.role || 'student'} 
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
          path="*" 
          element={<Navigate to={targetSlug ? `/${targetSlug}` : '/'} replace />} 
        />
      </Routes>
    );
  }

  return (
    <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: C.text.title, fontFamily: "'Cairo', system-ui, sans-serif", padding: '20px', textAlign: 'center' }}>
      <AlertTriangle size={40} style={{ color: C.error.DEFAULT, marginBottom: '15px' }} />
      <h2 style={{ marginBottom: '10px' }}>عذراً، حالة النظام غير معرفة</h2>
      <p style={{ color: C.text.muted, marginBottom: '5px' }}>App State: <strong style={{ color: C.primary.DEFAULT }}>{appState || 'NULL'}</strong></p>
      <p style={{ color: C.text.muted, marginBottom: '20px' }}>إذا ظهرت هذه الرسالة، فهذا يعني أن النظام لا يستطيع تصنيف حسابك حالياً.</p>
      <button onClick={logout} style={{ background: C.primary.gradient, color: C.dark.main, padding: '10px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تسجيل الخروج</button>
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

  const handleSplashFinish = () => {
    try {
      sessionStorage.setItem('app_splash_seen', 'true');
    } catch {
      // Ignored
    }
    setShowSplash(false);
  };

  return (
    <GlobalErrorBoundary>
      {/* 📡 شريط تنبيهات الشبكة والتحديثات في أعلى تطبيقك */}
      <OfflineAndUpdateBanner />

      <Suspense fallback={
        <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary.DEFAULT }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      }>
        {view === 'test' ? (
          <DevPlayground />
        ) : view === 'splash' || showSplash ? (
          <SplashScreen lang="ar" onFinish={view === 'splash' ? () => alert('انتهى عرض الشاشة الافتتاحية') : handleSplashFinish} />
        ) : (
          <Routes>
            <Route path="/verify/:certId" element={<CertificateVerify />} />
            <Route path="/*" element={<MainContent />} />
          </Routes>
        )}
      </Suspense>
    </GlobalErrorBoundary>
  );
}
