// src/hooks/useAttendance.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { sessionService } from '../lib/sessionService';

export function useAttendance({ students = [], academyId, halaqas = [], t, i18n }) {
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHalaqaId, setSelectedHalaqaId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const translateText = useCallback((key, arText, enText) => {
    if (i18n && i18n.exists && i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  }, [i18n, isRtl, t]);

  // 🛠️ دالة مساعدة لفك واستخراج اسم الطالب نصياً لعملية البحث
  const getSearchableName = useCallback((nameData) => {
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
    
    return students.filter(student => {
      const matchHalaqa = !selectedHalaqaId || String(student.halaqa_id) === String(selectedHalaqaId);
      
      const studentNameStr = getSearchableName(student.name).toLowerCase();
      const matchSearch = !query || studentNameStr.includes(query);
      
      return matchHalaqa && matchSearch;
    });
  }, [students, selectedHalaqaId, searchQuery, getSearchableName]);

  // 📊 حساب الإحصائيات
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 0 };

    let present = 0, absent = 0, late = 0, excused = 0;
    filteredStudents.forEach(st => {
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
        const mappedData = {};
        
        if (data && Array.isArray(data)) {
          data.forEach(record => {
            mappedData[record.student_id] = {
              status: record.status || 'present',
              notes: record.notes || '',
              new_memorization: record.new_memorization || record.memorization || '',
              retention_assignment: record.retention_assignment || record.revision || '',
              session_grade: record.session_grade || record.daily_grade || 10,
              quarter_index: record.quarter_index || 1
            };
          });
        }
        setAttendanceData(mappedData);
      } catch (error) {
        console.error("🚨 خطأ أثناء استدعاء بيانات الحضور:", error);
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchAttendance();
  }, [selectedDate, academyId]);

  // ⚡ تحديث حقل طالب
  const updateStudentField = (studentId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { 
          status: 'present', 
          notes: '', 
          new_memorization: '', 
          retention_assignment: '', 
          session_grade: 10,
          quarter_index: 1 
        }),
        [field]: value
      }
    }));
  };

  // 🚀 تحضير الكل "حضور"
  const handleMarkAllPresent = () => {
    if (filteredStudents.length === 0) return;
    const updated = { ...attendanceData };
    filteredStudents.forEach(st => {
      updated[st.id] = {
        ...(updated[st.id] || { notes: '', new_memorization: '', retention_assignment: '', session_grade: 10 }),
        status: 'present'
      };
    });
    setAttendanceData(updated);
    setMessage({ 
      text: translateText('allMarkedPresent', 'تم تحضير جميع طلاب القائمة "حضور" بنجاح 🟢', 'All displayed students marked as present 🟢'), 
      type: 'success' 
    });
  };

  // 🔥 الحفظ المجمع
  const handleSaveAttendance = async () => {
    if (!academyId) {
      setMessage({ text: translateText('errorLoading', 'حدث خطأ في معرف الأكاديمية', 'Error in academy ID'), type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const fallbackHalaqaId = halaqas.length > 0 ? halaqas[0].id : null;

    try {
      const attendanceRecords = filteredStudents.map(student => {
        const currentRecord = attendanceData[student.id];
        const isPresent = !currentRecord?.status || currentRecord.status === 'present' || currentRecord.status === 'late';
        
        const qIndex = Number(currentRecord?.quarter_index || student.current_quarter_index || 1);
        const juzNum = Math.ceil(qIndex / 8) || 1;
        const qInHizb = (((qIndex - 1) % 4) + 1) || 1;

        const targetHalaqaId = student.halaqa_id || (selectedHalaqaId !== '' ? selectedHalaqaId : fallbackHalaqaId);

        if (!targetHalaqaId) {
          throw new Error(isRtl ? "لم يتم العثور على حلقة مرتبطة بهذا الطالب. يرجى التأكد من إضافة حلقات وتعيين الطالب إليها أولاً." : "No halaqa associated with this student.");
        }

        return {
          student_id: student.id,
          academy_id: academyId,
          halaqa_id: targetHalaqaId, 
          date: selectedDate,
          status: currentRecord?.status || 'present',
          notes: currentRecord?.notes || '',
          new_memorization: isPresent ? (currentRecord?.new_memorization || '') : '',
          retention_assignment: isPresent ? (currentRecord?.retention_assignment || '') : '',
          session_grade: isPresent ? Number(currentRecord?.session_grade || 10) : null,
          quarter_index: qIndex,
          juz: juzNum,
          quarter_in_hizb: qInHizb
        };
      });

      await sessionService.upsertAttendance(attendanceRecords);

      setMessage({ 
        text: translateText('attendanceSavedSuccess', 'تم اعتماد وحفظ كشف الحضور والإنتاجية اليومية بنجاح! 🎉', 'Attendance and daily recitation sheet saved successfully! 🎉'), 
        type: 'success' 
      });
    } catch (error) {
      console.error("🚨 خطأ أثناء الحفظ المجمع:", error);
      setMessage({ text: `${translateText('saveFailed', 'فشل حفظ الكشف:', 'Save failed:')} ${error.message}`, type: 'error' });
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
    filteredStudents,
    stats,
    updateStudentField,
    handleMarkAllPresent,
    handleSaveAttendance,
    translateText
  };
}
