import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { C } from '@/theme/colors';

export default function ProtectedRoute({ children }) {
  const { academy, appState, user, profile, userRole } = useAcademy();
  const { slug } = useParams();
  const { t } = useTranslation();

  // 1. حالة التحميل
  if (appState === 'LOADING') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: C?.dark?.bg || '#070C14' }}
      >
        <Loader2 
          size={32} 
          className="animate-spin mb-3" 
          style={{ color: C?.amber?.DEFAULT || '#D97706' }} 
        />
        <p 
          className="text-xs font-medium tracking-wide animate-pulse"
          style={{ color: C?.text?.muted || '#94A3B8' }}
        >
          {t('common.verifying_permissions', 'جاري التحقق من الصلاحيات...')}
        </p>
      </div>
    );
  }

  // 2. إذا لم يكن المستخدم مسجل الدخول، اسمح للتطبيق بالتحميل ليعالج شاشة تسجيل الدخول داخلياً لمنع الـ Loop
  if (appState === 'UNAUTHENTICATED' || !user) {
    return children;
  }

  // 3. التحقق من الـ Slug فقط في حال وجوده في الرابط وعدم مطابقته
  if (slug && academy?.slug && academy.slug !== slug) {
    return <Navigate to={`/${academy.slug}`} replace />;
  }

  return children;
}
