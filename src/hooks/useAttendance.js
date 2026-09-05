import { useState, useEffect, useMemo, useCallback } from 'react';
import { sessionService } from '../lib/sessionService';

// ── Types & Interfaces ──────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface StudentNameObject {
  ar?: string;
  en?: string;
  full_name?: string;
  [key: string]: string | undefined;
}

export interface Student {
  id: string;
  name: string | StudentNameObject;
  halaqa_id?: string;
  current_quarter_index?: number;
  [key: string]: any;
}

export interface Halaqa {
  id: string;
  name?: string | Record<string, string>;
  [key: string]: any;
}

export interface AttendanceEntry {
  status: AttendanceStatus;
  notes: string;
  new_memorization: string;
  retention_assignment: string;
  session_grade: number;
  quarter_index: number;
}

export interface AttendanceRecordPayload {
  student_id: string;
  academy_id: string;
  halaqa_id: string;
  date: string;
  status: AttendanceStatus;
  notes: string;
  new_memorization: string;
  retention_assignment: string;
  session_grade: number | null;
  quarter_index: number;
  juz: number;
  quarter_in_hizb: number;
}

export interface MessageState {
  text: string;
  type: 'error' | 'success' | 'info' | '';
}

export interface UseAttendanceProps {
  students?: Student[];
  academyId?: string;
  halaqas?: Halaqa[];
  t?: (key: string) => string;
  i18n?: {
    language?: string;
    exists?: (key: string) => boolean;
  };
}

// ── Main Hook ───────────────────────────────────────────────────

export function useAttendance({
  students = [],
  academyId,
  halaqas = [],
  t,
  i18n,
}: UseAttendanceProps) {
  const currentLang = i18n?.language || 'ar';
  const isRtl = currentLang === 'ar';

  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedHalaqaId, setSelectedHalaqaId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceEntry>>({});
  const [loadingFetch, setLoadingFetch] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: '' });

  // 🛠️ دالة الترجمة النصية
  const translateText = useCallback(
    (key: string, arText: string, enText: string): string => {
      if (i18n && i18n.exists && i18n.exists(key) && typeof t === 'function') {
        return t(key);
      }
      return isRtl ? arText : enText;
    },
    [i18n, isRtl, t]
  );

  // 🛠️ دالة مساعدة لفك واستخراج اسم الطالب نصياً لعملية البحث
  const getSearchableName = useCallback((nameData: string | StudentNameObject | undefined): string => {
    if (!nameData) return '';
    if (typeof nameData === 'string') return nameData;
    if (typeof nameData === 'object') {
      return `${nameData.ar || ''} ${nameData.en || ''} ${nameData.full_name || ''} ${Object.values(nameData).join(' ')}`;
    }
    return String(nameData);
  }, []);

  // 🔍 فلترة الطلاب الآمنة
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    const query = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const matchHalaqa =
        !selectedHalaqaId || String(student.halaqa_id) === String(selectedHalaqaId);

      const studentNameStr = getSearchableName(student.name).toLowerCase();
      const matchSearch = !query || studentNameStr.includes(query);

      return matchHalaqa && matchSearch;
    });
  }, [students, selectedHalaqaId, searchQuery, getSearchableName]);

  // 📊 حساب الإحصائيات
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 0 };

    let present = 0,
      absent = 0,
      late = 0,
      excused = 0;

    filteredStudents.forEach((st) => {
      const status = attendanceData[st.id]?.status || 'present';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    const rate = Math.round(((present + late) / total) * 100);
    return { total, present, absent, late, excused, rate };
  }, [filteredStudents, attendanceData]);

  // 🔄 جلب البيانات لليوم المحدد
  useEffect(() => {
    async function fetchAttendance() {
      if (!academyId || !selectedDate) return;
      setLoadingFetch(true);
      setMessage({ text: '', type: '' });

      try {
        const data = await sessionService.fetchAttendance(academyId, selectedDate);
        const mappedData: Record<string, AttendanceEntry> = {};

        if (data && Array.isArray(data)) {
          data.forEach((record: any) => {
            mappedData[record.student_id] = {
              status: record.status || 'present',
              notes: record.notes || '',
              new_memorization: record.new_memorization || record.memorization || '',
              retention_assignment: record.retention_assignment || record.revision || '',
              session_grade: record.session_grade ?? record.daily_grade ?? 10,
              quarter_index: record.quarter_index || 1,
            };
          });
        }
        setAttendanceData(mappedData);
      } catch (error: any) {
        console.error('🚨 خطأ أثناء استدعاء بيانات الحضور:', error);
        setMessage({
          text: translateText(
            'fetchFailed',
            'تعذر استرجاع بيانات الحضور لهذا اليوم.',
            'Failed to retrieve attendance logs for this date.'
          ),
          type: 'error',
        });
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchAttendance();
  }, [selectedDate, academyId, translateText]);

  // ⚡ تحديث حقل طالب
  const updateStudentField = useCallback(
    (studentId: string, field: keyof AttendanceEntry, value: any) => {
      setAttendanceData((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {
            status: 'present',
            notes: '',
            new_memorization: '',
            retention_assignment: '',
            session_grade: 10,
            quarter_index: 1,
          }),
          [field]: value,
        },
      }));
    },
    []
  );

  // 🚀 تحضير الكل "حضور"
  const handleMarkAllPresent = useCallback(() => {
    if (filteredStudents.length === 0) return;
    setAttendanceData((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((st) => {
        updated[st.id] = {
          ...(updated[st.id] || {
            notes: '',
            new_memorization: '',
            retention_assignment: '',
            session_grade: 10,
            quarter_index: 1,
          }),
          status: 'present',
        };
      });
      return updated;
    });
    setMessage({
      text: translateText(
        'allMarkedPresent',
        'تم تحضير جميع طلاب القائمة "حضور" بنجاح 🟢',
        'All displayed students marked as present 🟢'
      ),
      type: 'success',
    });
  }, [filteredStudents, translateText]);

  // 🔥 الحفظ المجمع
  const handleSaveAttendance = async () => {
    if (!academyId) {
      setMessage({
        text: translateText('errorLoading', 'حدث خطأ في معرف الأكاديمية', 'Error in academy ID'),
        type: 'error',
      });
      return;
    }

    if (filteredStudents.length === 0) {
      setMessage({
        text: translateText(
          'noStudentsToSave',
          'لا يوجد طلاب لتسجيل حضورهم في هذه القائمة',
          'No students available to save'
        ),
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const fallbackHalaqaId = halaqas.length > 0 ? halaqas[0].id : null;

    try {
      const attendanceRecords: AttendanceRecordPayload[] = filteredStudents.map((student) => {
        const currentRecord = attendanceData[student.id];
        const isPresent =
          !currentRecord?.status ||
          currentRecord.status === 'present' ||
          currentRecord.status === 'late';

        const qIndex = Number(
          currentRecord?.quarter_index || student.current_quarter_index || 1
        );
        const juzNum = Math.ceil(qIndex / 8) || 1;
        const qInHizb = ((qIndex - 1) % 4) + 1 || 1;

        const targetHalaqaId =
          student.halaqa_id || (selectedHalaqaId !== '' ? selectedHalaqaId : fallbackHalaqaId);

        if (!targetHalaqaId) {
          throw new Error(
            isRtl
              ? 'لم يتم العثور على حلقة مرتبطة بهذا الطالب. يرجى التأكد من إضافة حلقات وتعيين الطالب إليها أولاً.'
              : 'No halaqa associated with this student.'
          );
        }

        return {
          student_id: student.id,
          academy_id: academyId,
          halaqa_id: targetHalaqaId,
          date: selectedDate,
          status: currentRecord?.status || 'present',
          notes: (currentRecord?.notes || '').trim(),
          new_memorization: isPresent ? (currentRecord?.new_memorization || '').trim() : '',
          retention_assignment: isPresent
            ? (currentRecord?.retention_assignment || '').trim()
            : '',
          session_grade: isPresent ? Number(currentRecord?.session_grade ?? 10) : null,
          quarter_index: qIndex,
          juz: juzNum,
          quarter_in_hizb: qInHizb,
        };
      });

      await sessionService.upsertAttendance(attendanceRecords);

      setMessage({
        text: translateText(
          'attendanceSavedSuccess',
          'تم اعتماد وحفظ كشف الحضور والإنتاجية اليومية بنجاح! 🎉',
          'Attendance and daily recitation sheet saved successfully! 🎉'
        ),
        type: 'success',
      });
    } catch (error: any) {
      console.error('🚨 خطأ أثناء الحفظ المجمع:', error);
      setMessage({
        text: `${translateText('saveFailed', 'فشل حفظ الكشف:', 'Save failed:')} ${error.message}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isRtl,
    selectedDate,
    setSelectedDate,
    selectedHalaqaId,
    setSelectedHalaqaId,
    searchQuery,
    setSearchQuery,
    attendanceData,
    loadingFetch,
    isSaving,
    message,
    setMessage,
    filteredStudents,
    stats,
    updateStudentField,
    handleMarkAllPresent,
    handleSaveAttendance,
    translateText,
  };
}
