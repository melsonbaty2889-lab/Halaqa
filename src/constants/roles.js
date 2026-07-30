// 1. الأدوار كما هي مسجلة تماماً في قاعدة البيانات
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

// 2. التوجيه المباشر والبسيط لكل دور
export const ROLE_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/admin-dashboard',
  [ROLES.ADMIN]: '/academy-dashboard',
  [ROLES.TEACHER]: '/teacher-dashboard',
  [ROLES.STUDENT]: '/student-dashboard',
  [ROLES.PARENT]: '/parent-dashboard',
};

// 3. دالة تجلب المسار مباشرة وبأمان
export const getRouteForRole = (role) => {
  const cleanRole = role?.toLowerCase()?.trim();
  return ROLE_ROUTES[cleanRole] || '/academy-dashboard';
};
