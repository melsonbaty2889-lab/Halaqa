import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { FaCalendarAlt, FaCheck, FaTimes, FaClock, FaUserClock, FaSave } from 'react-icons/fa';

export default function Attendance({ students, academyId }) {
  const { t } = useTranslation();
  
  // 1. تحديد تاريخ اليوم كقيمة افتراضية (بصيغة YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 2. حالة تخزين بيانات الحضور لكل طالب (المفتاح هو id الطالب)
  const [attendanceData, setAttendanceData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // دالة لتحديث حالة الطالب (حاضر، غائب، متأخر، بعذر) في الـ State المحلية
  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status
      }
    }));
  };

  // دالة لتحديث الملاحظات الخاصة بالطالب في الـ State المحلية
  const handleNotesChange = (studentId, notesText) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes: notesText
      }
    }));
  };

  // 🔥 الدالة الاحترافية المحدثة: حفظ الحضور دفعة واحدة بطلب واحد (Batch Upsert)
  const handleSaveAttendance = async () => {
    if (!academyId) {
      setMessage({ text: t('errorLoading'), type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      // أ) بناء المصفوفة المجمعة لجميع الطلاب
      const attendanceRecords = students.map(student => {
        // إذا لم يقم المعلم بتحديد حالة، نعتبر الطالب "حاضر" كخيار افتراصي ذكي
        const currentRecord = attendanceData[student.id] || { status: 'present', notes: '' };
        
        return {
          student_id: student.id,
          academy_id: academyId,
          date: selectedDate,
          status: currentRecord.status || 'present',
          notes: currentRecord.notes || ''
        };
      });

      // ب) إرسال المصفوفة بالكامل دفعة واحدة إلى جدول الـ attendance في Supabase
      // ملاحظة: تأكد أن جدول قاعدة البيانات يحتوي على Unique Constraint يجمع بين (student_id و date)
      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, { onConflict: 'student_id, date' });

      if (error) throw error;

      setMessage({ text: "تم اعتماد وحفظ كشف الحضور بنجاح! 🎉", type: 'success' });
    } catch (error) {
      console.error("🚨 خطأ أثناء حفظ الحضور مجمعاً:", error);
      setMessage({ text: `فشل الحفظ: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ direction: 'inherit' }}>
      {/* العنوان العلوي والتحكم بالتاريخ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: C.gold, margin: 0 }}>{t('attendance')}</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surface, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${C.border}` }}>
          <FaCalendarAlt style={{ color: C.gold }} />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', cursor: 'pointer', fontSize: '15px' }}
          />
        </div>
      </div>

      {/* رسائل التنبيه والنجاح */}
      {message.text && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}` }}>
          {message.text}
        </div>
      )}

      {/* قائمة الطلاب ورصد الحالات */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        {students.length === 0 ? (
          <p style={{ color: C.text, opacity: 0.6 }}>لا يوجد طلاب مسجلين حالياً لعرضهم.</p>
        ) : (
          students.map(student => {
            const currentStatus = attendanceData[student.id]?.status || 'present';
            
            return (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, padding: '15px', borderRadius: '10px', border: `1px solid ${C.border}`, flexWrap: 'wrap', gap: '15px' }}>
                
                {/* اسم الطالب */}
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: C.text }}>{student.name}</span>
                
                {/* خيارات رصد الحضور (أزرار تفاعلية) */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  
                  {/* زر حاضر */}
                  <button onClick={() => handleStatusChange(student.id, 'present')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: currentStatus === 'present' ? '#10B981' : 'rgba(16, 185, 129, 0.1)', color: currentStatus === 'present' ? '#fff' : '#10B981', transition: '0.2s' }}>
                    <FaCheck /> {t('present')}
                  </button>

                  {/* زر غائب */}
                  <button onClick={() => handleStatusChange(student.id, 'absent')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: currentStatus === 'absent' ? '#EF4444' : 'rgba(239, 68, 68, 0.1)', color: currentStatus === 'absent' ? '#fff' : '#EF4444', transition: '0.2s' }}>
                    <FaTimes /> {t('absent')}
                  </button>

                  {/* زر متأخر */}
                  <button onClick={() => handleStatusChange(student.id, 'late')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: currentStatus === 'late' ? '#F59E0B' : 'rgba(245, 158, 11, 0.1)', color: currentStatus === 'late' ? '#fff' : '#F59E0B', transition: '0.2s' }}>
                    <FaClock /> {t('late')}
                  </button>

                  {/* زر غائب بعذر */}
                  <button onClick={() => handleStatusChange(student.id, 'excused')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: currentStatus === 'excused' ? '#3B82F6' : 'rgba(59, 130, 246, 0.1)', color: currentStatus === 'excused' ? '#fff' : '#3B82F6', transition: '0.2s' }}>
                    <FaUserClock /> {t('excused')}
                  </button>

                  {/* حقل إدخال الملاحظات لكل طالب */}
                  <input 
                    type="text" 
                    placeholder={t('notes')}
                    value={attendanceData[student.id]?.notes || ''}
                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                    style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '6px 10px', borderRadius: '6px', outline: 'none', width: '160px', fontSize: '14px' }}
                  />
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* زر حفظ الكشف النهائي الثابت في الأسفل أو نهاية الصفحة */}
      {students.length > 0 && (
        <button 
          onClick={handleSaveAttendance}
          disabled={isSaving}
          style={{ width: '100%', padding: '14px', background: C.gold, color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isSaving ? 0.7 : 1, transition: '0.2s' }}
        >
          <FaSave /> {isSaving ? "جاري الحفظ والاعتماد..." : t('save_attendance')}
        </button>
      )}
    </div>
  );
}
