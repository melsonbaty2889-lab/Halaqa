import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { useAuth } from '@/context/AuthContext';
import { C } from '@/theme/colors';

export default function ProtectedRoute({ children }) {
  const { academy, appState } = useAcademy();
  const { user, profile } = useAuth();
  const { slug } = useParams();
  const { t } = useTranslation();

  // 1. حالة التحميل أثناء فحص الجلسة والصلاحيات
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

  // 2. التحقق مما إذا كان المستخدم لم يحدد دوره بعد
  const userRole = profile?.role || user?.user_metadata?.role;
  if (!userRole) {
    return <Navigate to="/select-role" replace />;
  }

  // 3. التحقق من وجود الأكاديمية ومطابقة الـ slug في الرابط مع الأكاديمية الخاصة بالمستخدم
  const hasAccess = academy && academy.slug === slug;

  // 4. إذا لم يملك الوصول للأكاديمية الحالية
  if (!hasAccess) {
    if (userRole === 'admin') {
      return <Navigate to="/create-academy" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // 5. عرض الصفحة المطلوبة عند توفر الصلاحيات
  return children;
}
