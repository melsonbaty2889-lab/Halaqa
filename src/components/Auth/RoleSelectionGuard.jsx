import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';

const VALID_ROLES = ['super_admin', 'admin', 'teacher', 'student', 'parent'];

const getText = (tFunc, key, fallback) => {
  if (typeof tFunc === 'function') {
    const res = tFunc(key, fallback);
    if (res && res !== key) return res;
  }
  return fallback;
};

export default function RoleSelectionGuard() {
  const { profile, appState, userRole, t } = useAcademy();

  if (appState === 'LOADING' || !appState) {
    return (
      <div
        role="status"
        aria-label={getText(t, 'system.loading', 'جاري التحميل...')}
        className="bg-semantic-bgPage min-h-screen flex justify-center items-center text-semantic-actionPrimary"
      >
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = (userRole || profile?.role || '').toString().toLowerCase().trim();
  const hasValidRole = VALID_ROLES.includes(currentRole);
  const isRoleExplicitlySelected = profile?.metadata?.role_selected === true;

  if (hasValidRole && isRoleExplicitlySelected) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
