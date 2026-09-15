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

  if (appState === 'LOADING') {
    return (
      <div style={{ background: C.dark?.bg || '#050811', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.amber?.DEFAULT || '#D97706' }}>
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  const currentRole = (userRole || profile?.role || 'admin').toString().toLowerCase().trim();
  const normalizedAllowed = allowedRoles.map(r => (r || '').toString().toLowerCase().trim());

  const isAllowed = normalizedAllowed.length === 0 || 
                    normalizedAllowed.includes(currentRole) || 
                    currentRole === 'admin' || 
                    currentRole === 'super_admin';

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
        background: C.dark?.bg || '#050811',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.text?.title || '#FFFFFF',
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Cairo', system-ui, sans-serif"
      }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '20px', borderRadius: '50%', marginBlockEnd: '16px', color: C.error?.DEFAULT || '#EF4444' }}>
          <Lock size={40} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBlockEnd: '8px' }}>
          {getText(t, 'auth.unauthorized_title', 'غير مصرح لك بالوصول لهذه الشاشة')}
        </h2>
        <p style={{ color: C.text?.muted || '#94A3B8', fontSize: '14px', maxWidth: '400px', marginBlockEnd: '24px' }}>
          {getText(t, 'auth.unauthorized_desc', 'دور حسابك الحالي غير مجاز لاستخدام هذه الصفحة.')}
        </p>
        <button
          onClick={logout}
          aria-label={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          title={getText(t, 'common.logout_return', 'تسجيل الخروج والعودة')}
          style={{
            padding: '10px 20px',
            minHeight: '44px',
            background: C.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)',
            color: C.text?.title || '#FFFFFF',
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
}
