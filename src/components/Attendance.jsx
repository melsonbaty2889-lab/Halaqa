import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { FaCalendarAlt, FaCheck, FaTimes, FaClock, FaUserClock, FaSave } from 'react-icons/fa';

export default function Attendance({ students, academyId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  // تحديد تاريخ اليوم كقيمة افتراضية (بصيغة YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // حالة تخزين بيانات الحضور لكل طالب
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // تتبع حجم الشاشة لضبط التجاوب البصري للكروت
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  // 🔄 [تطوير حرج]: جلب الحضور المسجل مسبقاً فور فتح الصفحة أو تغيير التاريخ
  useEffect(() => {
    async function fetchExistingAttendance() {
      if (!academyId || !selectedDate || students.length === 0) return;
      setLoadingFetch(true);
      setMessage({ text: '', type: '' });

      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('student_id, status, notes')
          .eq('academy_id', academyId)
          .eq('date', selectedDate);

        if (error) throw error;

        // تحويل المصفوفة المسترجعة إلى كائن (Map) يسهل قراءته بالـ student_id
        const mappedData = {};
        if (data) {
          data.forEach(record => {
            mappedData[record.student_id] = {
              status: record.status,
              notes: record.notes || ''
            };
          });
        }
        setAttendanceData(mappedData);
      } catch (error) {
        console.error("🚨 خطأ أثناء جلب الحضور السابق:", error);
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchExistingAttendance();
  }, [selectedDate, academyId, students]);

  // دالة لتحديث حالة الطالب في الـ State المحلية
  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status: status
      }
    }));
  };

  // دالة لتحديث الملاحظات الخاصة بالطالب في الـ State المحلية
  const handleNotesChange = (studentId, notesText) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        notes: notesText
      }
    }));
  };

  // 🔥 حفظ الحضور النهائي دفعة واحدة بطلب واحد (Batch Upsert)
  const handleSaveAttendance = async () => {
    if (!academyId) {
      setMessage({ text: translateText('errorLoading', 'حدث خطأ في تحميل البيانات', 'Error loading data'), type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const attendanceRecords = students.map(student => {
        const currentRecord = attendanceData[student.id];
        return {
          student_id: student.id,
          academy_id: academyId,
          date: selectedDate,
          status: currentRecord?.status || 'present', // 'present' كخيار ذكي افتراضي
          notes: currentRecord?.notes || ''
        };
      });

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, { onConflict: 'student_id, date' });

      if (error) throw error;

      setMessage({ 
        text: translateText('attendanceSavedSuccess', 'تم اعتماد وحفظ كشف الحضور بنجاح! 🎉', 'Attendance sheet saved successfully! 🎉'), 
        type: 'success' 
      });
    } catch (error) {
      console.error("🚨 خطأ أثناء حفظ الحضور مجمعاً:", error);
      setMessage({ text: `${translateText('saveFailed', 'فشل الحفظ:', 'Save failed:')} ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* التحكم العلوي بالتاريخ والهيدر */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: '15px' 
      }}>
        <div style={{ textAlign: isRtl ? 'right' : 'left', width: isMobile ? '100%' : 'auto' }}>
          <h2 style={{ color: C.gold || '#C9A84C', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{t('attendance')}</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px' }}>
            {translateText('attendanceSub', 'رصد حضور وغياب الطلاب اليومي', 'Track student daily attendance')}
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          background: '#162030', 
          padding: '10px 16px', 
          borderRadius: '12px', 
          border: '1px solid #334155',
          width: isMobile ? '100%' : 'auto',
          boxSizing: 'border-box'
        }}>
          <FaCalendarAlt style={{ color: C.gold || '#C9A84C' }} />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', width: '100%' }}
          />
        </div>
      </div>

      {/* رسائل التنبيه */}
      {message.text && (
        <div style={{ 
          padding: '14px', 
          borderRadius: '10px', 
          marginBottom: '20px', 
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
          color: message.type === 'success' ? '#10B981' : '#EF4444', 
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          fontSize: '14px',
          fontWeight: '600',
          textAlign: isRtl ? 'right' : 'left'
        }}>
          {message.text}
        </div>
      )}

      {/* مؤشر تحميل ناعم أثناء جلب بيانات اليوم المختار */}
      {loadingFetch ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 0' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.05)', borderTop: `3px solid ${C.gold || '#C9A84C'}`, borderRadius: '50%', animation: 'spinAttendance 0.8s linear infinite' }}></div>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>{translateText('loadingAttendanceData', 'جاري جلب سجل الحضور...', 'Fetching attendance record...')}</span>
          <style>{`@keyframes spinAttendance { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        /* قائمة الطلاب المحسنة للتجاوب الفاخر */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
          {students.length === 0 ? (
            <p style={{ color: '#94a3b8', opacity: 0.6, textAlign: 'center', padding: '20px' }}>
              {translateText('noStudentsRegistered', 'لا يوجد طلاب مسجلين حالياً لعرضهم.', 'No students currently registered to display.')}
            </p>
          ) : (
            students.map(student => {
              const currentStatus = attendanceData[student.id]?.status || 'present';
              
              return (
                <div key={student.id} style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : (isRtl ? 'row' : 'row-reverse'), 
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'stretch' : 'center', 
                  background: C.surface || '#111C2A', 
                  padding: '16px', 
                  borderRadius: '14px', 
                  border: '1px solid rgba(255,255,255,0.04)', 
                  gap: '14px',
                  boxSizing: 'border-box'
                }}>
                  
                  {/* اسم الطالب والمحاذاة المتقاطعة للغتين */}
                  <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1 }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{student.name}</span>
                  </div>
                  
                  {/* خيارات رصد الحضور (أزرار تفاعلية) وحقل الملاحظات */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    flexWrap: 'wrap', 
                    alignItems: 'center',
                    justifyContent: isMobile ? 'center' : 'flex-end'
                  }}>
                    
                    {/* زر حاضر */}
                    <button 
                      onClick={() => handleStatusChange(student.id, 'present')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'present' ? '#10B981' : 'rgba(16, 185, 129, 0.06)', color: currentStatus === 'present' ? '#fff' : '#10B981', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                    >
                      <FaCheck size={12} /> {t('present')}
                    </button>

                    {/* زر غائب */}
                    <button 
                      onClick={() => handleStatusChange(student.id, 'absent')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'absent' ? '#EF4444' : 'rgba(239, 68, 68, 0.06)', color: currentStatus === 'absent' ? '#fff' : '#EF4444', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                    >
                      <FaTimes size={12} /> {t('absent')}
                    </button>

                    {/* زر متأخر */}
                    <button 
                      onClick={() => handleStatusChange(student.id, 'late')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'late' ? '#F59E0B' : 'rgba(245, 158, 11, 0.06)', color: currentStatus === 'late' ? '#fff' : '#F59E0B', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                    >
                      <FaClock size={12} /> {t('late')}
                    </button>

                    {/* زر غائب بعذر */}
                    <button 
                      onClick={() => handleStatusChange(student.id, 'excused')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'excused' ? '#3B82F6' : 'rgba(59, 130, 246, 0.06)', color: currentStatus === 'excused' ? '#fff' : '#3B82F6', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                    >
                      <FaUserClock size={12} /> {t('excused')}
                    </button>

                    {/* حقل إدخال الملاحظات لكل طالب */}
                    <input 
                      type="text" 
                      placeholder={t('notes') || 'ملاحظات...'}
                      value={attendanceData[student.id]?.notes || ''}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      style={{ 
                        background: '#0F172A', 
                        border: '1px solid #334155', 
                        color: '#fff', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        outline: 'none', 
                        width: isMobile ? '100%' : '140px', 
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    />
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* زر حفظ الكشف النهائي الثابت الفخم */}
      {!loadingFetch && students.length > 0 && (
        <button 
          onClick={handleSaveAttendance}
          disabled={isSaving}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: C.gold || '#C9A84C', 
            color: '#000', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '15px', 
            fontWeight: '700', 
            cursor: isSaving ? 'not-allowed' : 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px', 
            opacity: isSaving ? 0.7 : 1, 
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(201, 168, 76, 0.15)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={(e) => e.currentTarget.style.opacity = isSaving ? 0.7 : 1}
        >
          <FaSave /> {isSaving ? translateText('saving', 'جاري الحفظ والاعتماد...', 'Saving and adopting...') : translateText('saveBtn', 'اعتماد وحفظ كشف الحضور 🚀', 'Adopt & Save Attendance Sheet 🚀')}
        </button>
      )}
    </div>
  );
}
