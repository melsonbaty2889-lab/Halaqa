import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import C from '@/theme/colors';

export default function ProtectedRoute({ children }) {
  const { academy, appState } = useAcademy();
  const { slug } = useParams();
  const { t } = useTranslation();

  // 1. حالة التحميل أثناء فحص Supabase والجلسة
  if (appState === 'LOADING') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: C?.dark?.bg || '#070C14' }}
      >
        <Loader2 
          size={32} 
          className="animate-spin mb-2" 
          style={{ color: C?.primary?.DEFAULT || '#E07A00' }} 
        />
        <p 
          className="text-xs font-medium"
          style={{ color: C?.text?.secondary || '#94A3B8' }}
        >
          {t('common.verifying_permissions', 'جاري التحقق من الصلاحيات...')}
        </p>
      </div>
    );
  }

  // 2. التحقق من وجود الأكاديمية ومطابقة الـ slug في الرابط مع الأكاديمية الخاصة بالمستخدم
  const hasAccess = academy && academy.slug === slug;

  // 3. إذا لم تكن لديه صلاحية أو لا يملك أكاديمية، يتم توجيهه للتأسيس
  if (!hasAccess) {
    return <Navigate to="/create-academy" replace />;
  }

  // 4. إذا كان مصرحاً له، يتم عرض الصفحة المطلوبة
  return children;
}
