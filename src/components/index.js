/* src/components/index.js */

// 1. التصدير المباشر من المجلدات الفرعية (Sub-modules)
export * from './Auth';
export * from './Dashboard';
export * from './Gamification';
export * from './Header';
export * from './Payments';
export * from './QuranProgress';
export * from './SaaS';
export * from './Student';
export * from './UI';

// 2. تصدير الشاشات المستقلة المتبقية في الجذر
export { default as ActiveHalaqas } from './ActiveHalaqas';
export { default as AddStaffModal } from './AddStaffModal';
export { default as Attendance } from './Attendance';
export { default as CommunicationHub } from './CommunicationHub';
export { default as CreateAcademy } from './CreateAcademy';
export { default as Exams } from './Exams';
export { default as MainApp } from './MainApp';
export { default as RealtimeAudit } from './RealtimeAudit';
export { default as Reports } from './Reports';
export { default as Settings } from './Settings';
export { default as Sidebar } from './Sidebar';
export { default as Teachers } from './Teachers';
