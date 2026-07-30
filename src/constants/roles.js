// 1. التعريف القياسي لأدوار النظام (تطابق قيم Supabase)
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin', // المدير العام
  ADMIN: 'admin',             // مدير الأكاديمية
  MANAGER: 'manager',         // مدير فرعي / تنفيذي
  TEACHER: 'teacher',         // معلم / محفظ
  STUDENT: 'student',         // طالب
  PARENT: 'parent',           // ولي أمر
});

// 2. خريطة التوجيه الموحدة للمسارات (Routes Mapping)
export const ROLE_ROUTES = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/admin-dashboard',
  [ROLES.ADMIN]: '/academy-dashboard',
  [ROLES.MANAGER]: '/academy-dashboard', // أو مسار آخر لو وجد
  [ROLES.TEACHER]: '/teacher-dashboard',
  [ROLES.STUDENT]: '/student-dashboard',
  [ROLES.PARENT]: '/parent-dashboard',
});

// 3. المسار الافتراضي عند عدم التعرف على الدور (شبكة الأمان)
export const DEFAULT_ROUTE = '/';

// 4. دالة مساعدة لتنظيف مسمى الدور وتوحيده
const sanitizeRole = (role) => (typeof role === 'string' ? role.toLowerCase().trim() : '');

// 5. دوال مساعدة للتحقق من الصلاحيات
export const isSuperAdmin = (role) => sanitizeRole(role) === ROLES.SUPER_ADMIN;
export const isAdmin = (role) => sanitizeRole(role) === ROLES.ADMIN;
export const isManager = (role) => sanitizeRole(role) === ROLES.MANAGER;
export const isTeacher = (role) => sanitizeRole(role) === ROLES.TEACHER;
export const isStudent = (role) => sanitizeRole(role) === ROLES.STUDENT;
export const isParent = (role) => sanitizeRole(role) === ROLES.PARENT;

// 6. دالة جلب المسار بناءً على الدور
export const getRouteForRole = (role) => {
  const cleanRole = sanitizeRole(role);
  return ROLE_ROUTES[cleanRole] || DEFAULT_ROUTE;
};
