// 1. التعريف القياسي لأدوار النظام (تطابق قيم Supabase)
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin', // المدير العام للنظام (داخلي فقط)
  ADMIN: 'admin',             // مشرف / مدير كيان قرآني
  MANAGER: 'manager',         // مدير فرعي / تنفيذي
  TEACHER: 'teacher',         // معلم / محفظ
  STUDENT: 'student',         // طالب / قارئ
  PARENT: 'parent',           // ولي أمر / راعٍ
});

// 2. الأدوار المتاحة للاختيار في شاشة التسجيل العامة (تستثني super_admin و manager)
export const SELECTABLE_ROLES = Object.freeze([
  ROLES.STUDENT,
  ROLES.TEACHER,
  ROLES.PARENT,
  ROLES.ADMIN,
]);

// 3. مسارات الخطوة التالية بعد اختيار الدور (قبل ربط الأكاديمية)
export const ONBOARDING_ROLE_ROUTES = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/admin-dashboard',
  [ROLES.ADMIN]: '/create-academy',
  [ROLES.MANAGER]: '/join-academy',
  [ROLES.TEACHER]: '/join-academy',
  [ROLES.STUDENT]: '/join-academy',
  [ROLES.PARENT]: '/join-academy',
});

// 4. مسارات اللوحة الخاصة بكل دور بعد وجود الأكاديمية
export const ROLE_ROUTES = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/admin-dashboard',
  [ROLES.ADMIN]: '/academy-dashboard',
  [ROLES.MANAGER]: '/academy-dashboard',
  [ROLES.TEACHER]: '/teacher-dashboard',
  [ROLES.STUDENT]: '/student-dashboard',
  [ROLES.PARENT]: '/parent-dashboard',
});

// 5. المسار الافتراضي عند عدم التعرف على الدور (شبكة الأمان)
export const DEFAULT_ROUTE = '/';

// 6. دالة مساعدة لتنظيف مسمى الدور وتوحيده
export const sanitizeRole = (role) => (typeof role === 'string' ? role.toLowerCase().trim() : '');

// 7. التحقق من صلاحية الدور للاختيار من التسجيل العام
export const isValidSelectableRole = (role) => {
  const cleanRole = sanitizeRole(role);
  return SELECTABLE_ROLES.includes(cleanRole);
};

// 8. دوال مساعدة للتحقق من الصلاحيات
export const isSuperAdmin = (role) => sanitizeRole(role) === ROLES.SUPER_ADMIN;
export const isAdmin = (role) => sanitizeRole(role) === ROLES.ADMIN;
export const isManager = (role) => sanitizeRole(role) === ROLES.MANAGER;
export const isTeacher = (role) => sanitizeRole(role) === ROLES.TEACHER;
export const isStudent = (role) => sanitizeRole(role) === ROLES.STUDENT;
export const isParent = (role) => sanitizeRole(role) === ROLES.PARENT;

// 9. دالة جلب المسار بناءً على الدور وحالة وجود الأكاديمية
export const getRouteForRole = (role, hasAcademy = false) => {
  const cleanRole = sanitizeRole(role);
  if (!hasAcademy && ONBOARDING_ROLE_ROUTES[cleanRole]) {
    return ONBOARDING_ROLE_ROUTES[cleanRole];
  }
  return ROLE_ROUTES[cleanRole] || DEFAULT_ROUTE;
};
