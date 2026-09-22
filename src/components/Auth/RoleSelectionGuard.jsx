import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';

// قائمة الأدوار المعتمدة رسمياً في المنصة لضمان عدم قبول أي قيمة عشوائية
const VALID_ROLES = ['super_admin', 'admin', 'teacher', 'student', 'parent'];

export default function RoleSelectionGuard() {
  const { profile, appState, userRole } = useAcademy();

  // 1. انتظار اكتمال تحميل البيانات لمنع الـ Race Condition
  if (appState === 'LOADING') {
    return (
      <div 
        role="status" 
        aria-label="جاري التحميل" 
        className="bg-semantic-bgPage min-h-screen flex justify-center items-center text-semantic-actionPrimary"
      >
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  // 2. إذا لم يكتمل تسجيل الدخول أو لا يوجد ملف شخصي -> التوجيه لصفحة الدخول
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // 3. استخراج وتدقيق الدور من المصدر المركزي
  const currentRole = (userRole || profile?.role || '').toString().toLowerCase().trim();
  const hasValidRole = VALID_ROLES.includes(currentRole);

  // 4. إذا كان لدى المستخدم دور صالح بالفعل -> منعه من دخول صفحة التحديد وتوجيهه للوحة التحكم
  if (hasValidRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // 5. إذا كان المستخدم مسجلاً وليس لديه دور صالح بعد -> السماح بصفحة اختيار الدور
  return <Outlet />;
}
