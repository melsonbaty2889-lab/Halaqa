/* src/components/index.js */

// Re-export Sub-modules
export * from './Auth';
export * from './Dashboard';
export * from './SaaS';
export * from './Payments';
export * from './Student';
export * from './Gamification';
export * from './QuranProgress';
export * from './UI';
export * from './Header';

// Export Standalone Pages & Main Components
export { default as ActiveHalaqas } from './ActiveHalaqas';
export { default as Attendance } from './Attendance';
export { default as CommunicationHub } from './CommunicationHub';
export { default as CreateAcademy } from './CreateAcademy';
export { default as Exams } from './Exams';
export { default as Reports } from './Reports';
export { default as Settings } from './Settings';
export { default as Sidebar } from './Sidebar';
export { default as Teachers } from './Teachers';
export { default as AddStaffModal } from './AddStaffModal';
export { default as RealtimeAudit } from './RealtimeAudit';
export { default as MainApp } from './MainApp';
