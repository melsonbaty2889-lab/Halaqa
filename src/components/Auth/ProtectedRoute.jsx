import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, academiesList, isLoading }) {
  const { slug } = useParams();

  // 1. حالة التحميل (أثناء فحص Supabase)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070C14] flex flex-col items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-[var(--primary,#E07A00)] mb-2" />
        <p className="text-xs text-slate-400">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  // 2. التحقق من امتلاك المستخدم صلاحية الوصول للأكاديمية الحالية
  const hasAccess = academiesList?.some((item) => item.slug === slug);

  // 3. إذا لم تكن لديه صلاحية، يتم توجيهه لصفحة الإنشاء أو الصفحة الرئيسية
  if (!hasAccess) {
    return <Navigate to="/create-academy" replace />;
  }

  // 4. إذا كان مصرحاً له، يتم عرض الصفحة المطلوبة (Layout / Dashboard)
  return children;
}
