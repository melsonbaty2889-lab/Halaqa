import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';

export default function RoleSelectionGuard() {
  const { profile, appState, userRole } = useAcademy();

  // 1. أثناء تحميل بيانات الجلسة والمستخدم
  if (appState === 'LOADING') {
    return (
      <div className="bg-semantic-bgPage min-h-screen flex justify-center items-center text-semantic-actionPrimary">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  // 2. إذا لم يكن هناك ملف شخصي للمستخدم (غير مسجل الدخول) -> توجيهه لصفحة الدخول
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // 3. استخراج الدور الحقيقي
  const rawRole = userRole || profile?.role;

  // 4. إذا كان لديه دور محدد بالفعل -> منعه من دخول صفحة التحديد وتحويله للوحة التحكم
  if (rawRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // 5. إذا كان مسجلاً ولا يملك دوراً بعد (مثل القادم من تسجيل جوجل لأول مرة) -> السماح بالمرور لصفحة الاختيار
  return <Outlet />;
}
