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

// 3. خريطة التوجيه الموحدة للمسارات (Routes Mapping)
export const ROLE_ROUTES = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/admin-dashboard',
  [ROLES.ADMIN]: '/academy-dashboard',
  [ROLES.MANAGER]: '/academy-dashboard',
  [ROLES.TEACHER]: '/teacher-dashboard',
  [ROLES.STUDENT]: '/student-dashboard',
  [ROLES.PARENT]: '/parent-dashboard',
});

// 4. المسار الافتراضي عند عدم التعرف على الدور (شبكة الأمان)
export const DEFAULT_ROUTE = '/';

// 5. دالة مساعدة لتنظيف مسمى الدور وتوحيده
export const sanitizeRole = (role) => (typeof role === 'string' ? role.toLowerCase().trim() : '');

// 6. التحقق من صلاحية الدور للاختيار من التسجيل العام
export const isValidSelectableRole = (role) => {
  const cleanRole = sanitizeRole(role);
  return SELECTABLE_ROLES.includes(cleanRole);
};

// 7. دوال مساعدة للتحقق من الصلاحيات
export const isSuperAdmin = (role) => sanitizeRole(role) === ROLES.SUPER_ADMIN;
export const isAdmin = (role) => sanitizeRole(role) === ROLES.ADMIN;
export const isManager = (role) => sanitizeRole(role) === ROLES.MANAGER;
export const isTeacher = (role) => sanitizeRole(role) === ROLES.TEACHER;
export const isStudent = (role) => sanitizeRole(role) === ROLES.STUDENT;
export const isParent = (role) => sanitizeRole(role) === ROLES.PARENT;

// 8. دالة جلب المسار بناءً على الدور
export const getRouteForRole = (role) => {
  const cleanRole = sanitizeRole(role);
  return ROLE_ROUTES[cleanRole] || DEFAULT_ROUTE;
};
