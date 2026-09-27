// src/constants/notificationConstants.js

export const NOTIFICATION_TYPES = {
  LIVE_SESSION: 'live_session',
  RECITATION: 'recitation',
  ATTENDANCE: 'attendance',
  EXAM: 'exam',
  BADGE: 'badge',
  STREAK: 'streak',
  PAYMENT: 'payment',
  CERTIFICATE: 'certificate',
  SYSTEM_ALERT: 'system_alert',
  ANNOUNCEMENT: 'announcement',
  MESSAGE: 'message',
  GENERAL: 'general',
};

export const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.LIVE_SESSION]: {
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    icon: 'Video'
  },
  [NOTIFICATION_TYPES.RECITATION]: {
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    icon: 'BookOpen'
  },
  [NOTIFICATION_TYPES.ATTENDANCE]: {
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    icon: 'Calendar'
  },
  [NOTIFICATION_TYPES.EXAM]: {
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    icon: 'GraduationCap'
  },
  [NOTIFICATION_TYPES.BADGE]: {
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    icon: 'Award'
  },
  [NOTIFICATION_TYPES.STREAK]: {
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    icon: 'Flame'
  },
  [NOTIFICATION_TYPES.PAYMENT]: {
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
    icon: 'CreditCard'
  },
  [NOTIFICATION_TYPES.CERTIFICATE]: {
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    icon: 'FileText'
  },
  [NOTIFICATION_TYPES.SYSTEM_ALERT]: {
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    icon: 'AlertTriangle'
  },
  [NOTIFICATION_TYPES.ANNOUNCEMENT]: {
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    icon: 'Megaphone'
  },
  [NOTIFICATION_TYPES.MESSAGE]: {
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    icon: 'MessageSquare'
  },
  [NOTIFICATION_TYPES.GENERAL]: {
    color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    icon: 'Bell'
  }
};
