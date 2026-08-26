import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';

export default function ProtectedRoute({ children }) {
  const { academy, appState } = useAcademy();
  const { slug } = useParams();

  // 1. حالة التحميل أثناء فحص Supabase والجلسة
  if (appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#070C14] flex flex-col items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-[var(--primary,#E07A00)] mb-2" />
        <p className="text-xs text-slate-400">جاري التحقق من الصلاحيات...</p>
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
