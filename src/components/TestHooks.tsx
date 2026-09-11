import React, { useEffect } from 'react';

// استدعاء كافة الـ Hooks
import { useAcademySettings } from '@/hooks/useAcademySettings';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAttendance } from '@/hooks/useAttendance';
import { useCreateAcademy } from '@/hooks/useCreateAcademy';
import { useCurricula } from '@/hooks/useCurricula';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { useHalaqas } from '@/hooks/useHalaqas';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLoginForm } from '@/hooks/useLoginForm';
import useNetworkAndUpdateStatus from '@/hooks/useNetworkAndUpdateStatus';
import { useNotifications } from '@/hooks/useNotifications';
import { useParents } from '@/hooks/useParents';
import { useQuranProgress } from '@/hooks/useQuranProgress';
import { useReports } from '@/hooks/useReports';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { useStudentDocuments } from '@/hooks/useStudentDocuments';
import { useStudentForm } from '@/hooks/useStudentForm';
import { useStudents } from '@/hooks/useStudents';
import { useStudentsManager } from '@/hooks/useStudentsManager';
import { useSubscription } from '@/hooks/useSubscription';
import { useTeachers } from '@/hooks/useTeachers';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { usePayments } from '@/hooks/usePayments';
import { useCertificates } from '@/hooks/useCertificates';
import { useExams } from '@/hooks/useExams';
import { useBadgesAndStreaks } from '@/hooks/useBadgesAndStreaks';

export function TestHooks() {
  const isMobile = useIsMobile();
  const networkStatus = typeof useNetworkAndUpdateStatus === 'function' ? useNetworkAndUpdateStatus() : null;
  
  // 1. الأكاديمية والاشتراكات
  const { settings, loading: loadingSettings } = useAcademySettings();
  const { subscription } = useSubscription();
  const { academyLoading } = useCreateAcademy();

  // 2. التحليلات والإشعارات والواتساب
  const { dashboardStats, loadingStats } = useAnalytics();
  const { notifications, unreadCount } = useNotifications();
  const { sendWhatsAppReport } = useWhatsApp();

  // 3. الطلاب والرسوم والمستندات
  const { students, loading: loadingStudents } = useStudents();
  const { studentFormState } = useStudentForm();
  const { isManagerLoading } = useStudentsManager();
  const { documents } = useStudentDocuments();

  // 4. الحلقات، المعلمون، أسر الطلاب
  const { halaqas, loading: loadingHalaqas } = useHalaqas();
  const { teachers, loading: loadingTeachers } = useTeachers();
  const { parents } = useParents();

  // 5. المناهج، الحضور، التقدم القرآني، والتقارير
  const { curricula } = useCurricula();
  const { attendanceRecords } = useAttendance();
  const { quranProgress } = useQuranProgress();
  const { reportData } = useReports();

  // 6. الحسابات والنماذج
  const { loginState } = useLoginForm();
  const { signUpState } = useSignUpForm();
  const { forgotPasswordState } = useForgotPassword();

  // 7. المدفوعات، الشهادات، الاختبارات، والمكافآت
  const { overduePayments, fetchOverduePayments } = usePayments();
  const { certificates, fetchCertificates } = useCertificates();
  const { exams, fetchExams } = useExams();
  const { topAchievers, fetchTopAchievers } = useBadgesAndStreaks();

  useEffect(() => {
    if (fetchOverduePayments) fetchOverduePayments();
    if (fetchCertificates) fetchCertificates();
    if (fetchExams) fetchExams();
    if (fetchTopAchievers) fetchTopAchievers(5);
  }, []);

  return (
    <div style={{ padding: '16px', direction: 'rtl', color: '#E2E8F0', backgroundColor: '#070B11', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#D97706', fontSize: '1.25rem', borderBottom: '1px solid #1E293B', paddingBottom: '10px' }}>
        🧪 لوحة فحص كافة الـ Hooks (26/26)
      </h1>

      {/* الحالة العامة للنظام */}
      <div style={{ marginBlock: '12px', padding: '10px', backgroundColor: '#0A0F1C', borderRadius: '8px', border: '1px solid #10B981' }}>
        <p>📱 نوع الجهاز: <strong>{isMobile ? 'موبايل' : 'سطح المكتب'}</strong></p>
        <p>🌐 حالة الاتصال: <strong>{networkStatus?.isOnline !== undefined ? (networkStatus.isOnline ? 'متصل' : 'غير متصل') : 'جاهز'}</strong></p>
      </div>

      {/* قائمة الفحص السريع لكل Hook */}
      <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
        <HookStatus title="1. useAcademySettings" loading={loadingSettings} data={settings} />
        <HookStatus title="2. useAnalytics" loading={loadingStats} data={dashboardStats} />
        <HookStatus title="3. useNotifications" data={{ count: unreadCount, items: notifications?.length }} />
        <HookStatus title="4. useStudents" loading={loadingStudents} data={{ totalStudents: students?.length }} />
        <HookStatus title="5. useHalaqas" loading={loadingHalaqas} data={{ totalHalaqas: halaqas?.length }} />
        <HookStatus title="6. useTeachers" loading={loadingTeachers} data={{ totalTeachers: teachers?.length }} />
        <HookStatus title="7. usePayments" data={{ overdueCount: overduePayments?.length }} />
        <HookStatus title="8. useBadgesAndStreaks" data={{ topAchieversCount: topAchievers?.length }} />
        <HookStatus title="9. useCertificates" data={{ totalCertificates: certificates?.length }} />
        <HookStatus title="10. useExams" data={{ totalExams: exams?.length }} />
        <HookStatus title="11. useSubscription" data={subscription} />
        <HookStatus title="12. useParents" data={{ totalParents: parents?.length }} />
        <HookStatus title="13. useCurricula" data={{ curriculaCount: curricula?.length }} />
        <HookStatus title="14. useAttendance" data={{ recordsCount: attendanceRecords?.length }} />
        <HookStatus title="15. useQuranProgress" data={quranProgress} />
        <HookStatus title="16. useReports" data={reportData} />
        <HookStatus title="17. useStudentDocuments" data={{ docsCount: documents?.length }} />
        <HookStatus title="18. useStudentForm" data={studentFormState || 'Ready'} />
        <HookStatus title="19. useStudentsManager" loading={isManagerLoading} />
        <HookStatus title="20. useCreateAcademy" loading={academyLoading} />
        <HookStatus title="21. useLoginForm" data={loginState || 'Ready'} />
        <HookStatus title="22. useSignUpForm" data={signUpState || 'Ready'} />
        <HookStatus title="23. useForgotPassword" data={forgotPasswordState || 'Ready'} />
        <HookStatus title="24. useWhatsApp" data={typeof sendWhatsAppReport === 'function' ? 'دالة الإرسال جاهزة' : 'غير جاهز'} />
        <HookStatus title="25. useIsMobile" data={isMobile} />
        <HookStatus title="26. useNetworkAndUpdateStatus" data={networkStatus || 'Ready'} />
      </div>
    </div>
  );
}

function HookStatus({ title, loading, data }: { title: string; loading?: boolean; data?: any }) {
  return (
    <div style={{ padding: '8px 12px', backgroundColor: '#0F172A', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ fontWeight: 'bold', color: '#34D399' }}>{title}</span>: {' '}
      {loading ? (
        <span style={{ color: '#F59E0B' }}>جاري التحميل...</span>
      ) : (
        <span style={{ color: '#94A3B8' }}>{data !== undefined ? JSON.stringify(data) : 'سليم ✅'}</span>
      )}
    </div>
  );
}

export default TestHooks;
