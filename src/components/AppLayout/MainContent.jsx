// src/components/Main/MainApp.jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout/AppLayout';
import { Loader2 } from 'lucide-react';

// 🟢 استدعاء المكونات بنظام التحميل الكسول (Lazy Loading)
const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));
const Attendance = lazy(() => import('@/components/Attendance/Attendance'));
const QuranProgress = lazy(() => import('@/components/QuranProgress/QuranProgress'));

// ⚡ المكونان المنفصلان بدلاً من المدمج
const CommunicationHub = lazy(() => import('@/components/Notifications/CommunicationHub'));
const Reports = lazy(() => import('@/components/Reports/Reports'));

const Halaqat = lazy(() => import('@/components/Halaqat/HalaqatList'));
const StudentsList = lazy(() => import('@/components/Students/StudentsList'));
const ParentsList = lazy(() => import('@/components/Parents/ParentsList'));
const TeachersList = lazy(() => import('@/components/Teachers/TeachersList'));

const Curricula = lazy(() => import('@/components/Curriculum/CurriculumManagement'));
const Exams = lazy(() => import('@/components/Exams/Exams'));
const Gamification = lazy(() => import('@/components/Gamification/Gamification'));
const Documents = lazy(() => import('@/components/Documents/Documents'));

const Finance = lazy(() => import('@/components/Payments/Payments'));
const AuditLogs = lazy(() => import('@/components/Logs/ActivityAuditLogs'));
const Settings = lazy(() => import('@/components/Settings/Settings'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-emerald-500">
    <Loader2 className="animate-spin" size={32} />
    <span className="text-sm text-slate-400 font-medium">جاري تحميل الصفحة...</span>
  </div>
);

export default function MainApp({ session, userRole, setShowEarlyUpgrade }) {
  return (
    <AppLayout session={session} userRole={userRole} setShowEarlyUpgrade={setShowEarlyUpgrade}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 1. الرئيسية والعمليات */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="interactive_quran" element={<QuranProgress />} />
          <Route path="communication" element={<CommunicationHub />} />

          {/* 2. الحلقات والأفراد */}
          <Route path="halaqas" element={<Halaqat />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="parents" element={<ParentsList />} />
          <Route path="teachers" element={<TeachersList />} />

          {/* 3. المناهج والتقييم */}
          <Route path="curricula" element={<Curricula />} />
          <Route path="exams" element={<Exams />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="documents" element={<Documents />} />

          {/* 4. الإدارة والمالية والتقارير */}
          <Route path="reports" element={<Reports />} />
          <Route path="finance" element={<Finance />} />
          <Route path="audit_logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />

          {/* إعادة التوجيه الافتراضي */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
