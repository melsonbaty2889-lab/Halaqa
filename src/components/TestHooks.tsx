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
  const isMobile = safeCall(() => useIsMobile());
  const networkStatus = safeCall(() => typeof useNetworkAndUpdateStatus === 'function' ? useNetworkAndUpdateStatus() : null);

  const academyRes = safeCall(() => useAcademySettings());
  const subRes = safeCall(() => useSubscription());
  const createAcadRes = safeCall(() => useCreateAcademy());
  const analyticsRes = safeCall(() => useAnalytics());
  const notifRes = safeCall(() => useNotifications());
  const waRes = safeCall(() => useWhatsApp());
  const studentsRes = safeCall(() => useStudents());
  const studentFormRes = safeCall(() => useStudentForm());
  const studentMgrRes = safeCall(() => useStudentsManager());
  const docsRes = safeCall(() => useStudentDocuments());
  const halaqasRes = safeCall(() => useHalaqas());
  const teachersRes = safeCall(() => useTeachers());
  const parentsRes = safeCall(() => useParents());
  const curriculaRes = safeCall(() => useCurricula());
  const attRes = safeCall(() => useAttendance());
  const quranRes = safeCall(() => useQuranProgress());
  const reportsRes = safeCall(() => useReports());
  const loginRes = safeCall(() => useLoginForm());
  const signUpRes = safeCall(() => useSignUpForm());
  const forgotRes = safeCall(() => useForgotPassword());
  const paymentsRes = safeCall(() => usePayments());
  const certsRes = safeCall(() => useCertificates());
  const examsRes = safeCall(() => useExams());
  const streaksRes = safeCall(() => useBadgesAndStreaks());

  return (
    <div style={{ padding: '16px', direction: 'rtl', color: '#E2E8F0', backgroundColor: '#070B11', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#D97706', fontSize: '1.2rem', borderBottom: '1px solid #1E293B', paddingBottom: '10px' }}>
        🧪 لوحة فحص كافة الـ Hooks (المحمية)
      </h1>

      <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem', marginTop: '12px' }}>
        <HookStatus title="1. useAcademySettings" data={academyRes} />
        <HookStatus title="2. useAnalytics" data={analyticsRes} />
        <HookStatus title="3. useNotifications" data={notifRes} />
        <HookStatus title="4. useStudents" data={studentsRes} />
        <HookStatus title="5. useHalaqas" data={halaqasRes} />
        <HookStatus title="6. useTeachers" data={teachersRes} />
        <HookStatus title="7. usePayments" data={paymentsRes} />
        <HookStatus title="8. useBadgesAndStreaks" data={streaksRes} />
        <HookStatus title="9. useCertificates" data={certsRes} />
        <HookStatus title="10. useExams" data={examsRes} />
        <HookStatus title="11. useSubscription" data={subRes} />
        <HookStatus title="12. useParents" data={parentsRes} />
        <HookStatus title="13. useCurricula" data={curriculaRes} />
        <HookStatus title="14. useAttendance" data={attRes} />
        <HookStatus title="15. useQuranProgress" data={quranRes} />
        <HookStatus title="16. useReports" data={reportsRes} />
        <HookStatus title="17. useStudentDocuments" data={docsRes} />
        <HookStatus title="18. useStudentForm" data={studentFormRes} />
        <HookStatus title="19. useStudentsManager" data={studentMgrRes} />
        <HookStatus title="20. useCreateAcademy" data={createAcadRes} />
        <HookStatus title="21. useLoginForm" data={loginRes} />
        <HookStatus title="22. useSignUpForm" data={signUpRes} />
        <HookStatus title="23. useForgotPassword" data={forgotRes} />
        <HookStatus title="24. useWhatsApp" data={waRes} />
        <HookStatus title="25. useIsMobile" data={isMobile} />
        <HookStatus title="26. useNetworkAndUpdateStatus" data={networkStatus} />
      </div>
    </div>
  );
}

function safeCall(fn: () => any) {
  try {
    return fn();
  } catch (err) {
    return { error: 'Failed to execution' };
  }
}

function HookStatus({ title, data }: { title: string; data?: any }) {
  return (
    <div style={{ padding: '8px 12px', backgroundColor: '#0F172A', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ fontWeight: 'bold', color: '#34D399' }}>{title}</span>: {' '}
      <span style={{ color: '#94A3B8' }}>{data ? JSON.stringify(data).slice(0, 70) : 'جاهز ✅'}</span>
    </div>
  );
}

export default TestHooks;
