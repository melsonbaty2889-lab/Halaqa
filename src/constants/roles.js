// 1. التعريف القياسي لأدوار النظام (تطابق القيم في Supabase)
export const ROLES = {
  SUPER_ADMIN: 'super_admin', // المدير العام
  ADMIN: 'admin',             // مدير الأكاديمية
  TEACHER: 'teacher',         // معلم / محفظ
  STUDENT: 'student',         // طالب
  PARENT: 'parent',           // ولي أمر
};

// 2. خريطة التوجيه الموحدة للمسارات (Routes Mapping)
export const ROLE_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/admin-dashboard',
  [ROLES.ADMIN]: '/academy-dashboard',
  [ROLES.TEACHER]: '/teacher-dashboard',
  [ROLES.STUDENT]: '/student-dashboard',
  [ROLES.PARENT]: '/parent-dashboard',
};

// 3. المسار الافتراضي للتحويل عند عدم التعرف على الدور
export const DEFAULT_ROUTE = '/';

// 4. دوال مساعدة للتحقق من الصلاحيات والمسارات
export const isSuperAdmin = (role) => role?.toLowerCase() === ROLES.SUPER_ADMIN;
export const isAdmin = (role) => role?.toLowerCase() === ROLES.ADMIN;
export const isTeacher = (role) => role?.toLowerCase() === ROLES.TEACHER;
export const isStudent = (role) => role?.toLowerCase() === ROLES.STUDENT;

export const getRouteForRole = (role) => {
  const cleanRole = role?.toLowerCase()?.trim();
  return ROLE_ROUTES[cleanRole] || DEFAULT_ROUTE;
};
