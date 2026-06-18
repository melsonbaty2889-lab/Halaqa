import React, { useState, useEffect, memo } from 'react';
import { sessionService } from '../lib/sessionService'; // الربط الذكي مع ملف الخدمات الموحد
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { 
  FaCalendarAlt, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUserClock, 
  FaSave, 
  FaBookOpen, 
  FaBook, 
  FaHistory, 
  FaGraduationCap 
} from 'react-icons/fa';

export default function Attendance({ students, academyId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  // 🔄 جلب البيانات عبر ملف الخدمات sessionService لتوحيد بنية المشروع
  useEffect(() => {
    async function fetchExistingAttendance() {
      if (!academyId || !selectedDate || students.length === 0) return;
      setLoadingFetch(true);
      setMessage({ text: '', type: '' });

      try {
        // استخدام خدمة جلب الحضور الموحدة
        const data = await sessionService.fetchAttendance(academyId, selectedDate);

        const mappedData = {};
        if (data) {
          data.forEach(record => {
            mappedData[record.student_id] = {
              status: record.status,
              notes: record.notes || '',
              memorization: record.memorization || '',
              revision: record.revision || '',
              distant_revision: record.distant_revision || '',
              daily_grade: record.daily_grade || ''
            };
          });
        }
        setAttendanceData(mappedData);
      } catch (error) {
        console.error("🚨 خطأ أثناء جلب البيانات:", error);
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchExistingAttendance();
  }, [selectedDate, academyId, students]);

  // دالة تحديث الحقول الممررة للكروت الفرعية
  const updateStudentField = (studentId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present', notes: '', memorization: '', revision: '', distant_revision: '', daily_grade: '' }),
        [field]: value
      }
    }));
  };

  // 🔥 حفظ السجل كاملاً بطلب واحد مجمع عبر خدمات sessionService
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
        const isPresent = !currentRecord?.status || currentRecord.status === 'present' || currentRecord.status === 'late';
        
        return {
          student_id: student.id,
          academy_id: academyId,
          date: selectedDate,
          status: currentRecord?.status || 'present',
          notes: currentRecord?.notes || '',
          memorization: isPresent ? (currentRecord?.memorization || '') : '',
          revision: isPresent ? (currentRecord?.revision || '') : '',
          distant_revision: isPresent ? (currentRecord?.distant_revision || '') : '',
          daily_grade: isPresent ? (currentRecord?.daily_grade || '') : ''
        };
      });

      // تنفيذ الحفظ المجمع من خلال السيرفيس
      await sessionService.upsertAttendance(attendanceRecords);

      setMessage({ 
        text: translateText('attendanceSavedSuccess', 'تم اعتماد وحفظ كشف الحضور والإنتاجية القرآنية بنجاح! 🎉', 'Attendance and recitation progress saved successfully! 🎉'), 
        type: 'success' 
      });
    } catch (error) {
      console.error("🚨 خطأ أثناء الحفظ المجمع:", error);
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
          <h2 style={{ color: C.gold || '#C9A84C', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {translateText('recitation_attendance', 'رصد الحضور والتحضير الأكاديمي', 'Recitation & Attendance')}
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px' }}>
            {translateText('attendanceSub', 'متابعة الثالوث القرآني اليومي وتقييم الطلاب', 'Track the quranic triad and grade students daily')}
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

      {/* مؤشر تحميل ناعم */}
      {loadingFetch ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 0' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.05)', borderTop: `3px solid ${C.gold || '#C9A84C'}`, borderRadius: '50%', animation: 'spinAttendance 0.8s linear infinite' }}></div>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>{translateText('loadingAttendanceData', 'جاري جلب السجل الشامل للحلقة...', 'Fetching comprehensive halaqa record...')}</span>
          <style>{`@keyframes spinAttendance { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
          {students.length === 0 ? (
            <p style={{ color: '#94a3b8', opacity: 0.6, textAlign: 'center', padding: '20px' }}>
              {t('no_students_registered')}
            </p>
          ) : (
            students.map(student => (
              <StudentCard 
                key={student.id}
                student={student}
                record={attendanceData[student.id] || {}}
                updateStudentField={updateStudentField}
                isMobile={isMobile}
                isRtl={isRtl}
                t={t}
                C={C}
              />
            ))
          )}
        </div>
      )}

      {/* زر الحفظ النهائي المجمع */}
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
          <FaSave /> {isSaving ? translateText('saving', 'جاري الحفظ والاعتماد التراكمي...', 'Saving and adopting...') : translateText('saveBtn', 'اعتماد وحفظ كشف الحضور والتسميع اليومي 🚀', 'Adopt & Save Recitation Sheet 🚀')}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- */
/* 💎 المكون الفرعي المعزول والمحمي من التكرار العشوائي StudentCard */
/* ------------------------------------------------------------- */
const StudentCard = memo(({ student, record, updateStudentField, isMobile, isRtl, t, C }) => {
  const currentStatus = record.status || 'present';
  const isPresent = currentStatus === 'present' || currentStatus === 'late';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      background: C.surface || '#111C2A', 
      padding: '20px', 
      borderRadius: '16px', 
      border: '1px solid rgba(255,255,255,0.04)', 
      gap: '16px',
      boxSizing: 'border-box',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      
      {/* اسم الطالب + أزرار حالة الحضور */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '12px'
      }}>
        <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#fff' }}>{student.name}</span>
          <span style={{ display: 'block', fontSize: '12px', color: C.gold || '#C9A84C', marginTop: '2px' }}>
            {t('memorization_prefix')} {student.current_surah || t('not_specified_yet')}
          </span>
        </div>
        
        {/* أزرار الحضور */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-end' }}>
          <button 
            onClick={() => updateStudentField(student.id, 'status', 'present')} 
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'present' ? '#10B981' : 'rgba(16, 185, 129, 0.05)', color: currentStatus === 'present' ? '#fff' : '#10B981', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s' }}
          >
            <FaCheck size={11} /> {t('present')}
          </button>

          <button 
            onClick={() => updateStudentField(student.id, 'status', 'absent')} 
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'absent' ? '#EF4444' : 'rgba(239, 68, 68, 0.05)', color: currentStatus === 'absent' ? '#fff' : '#EF4444', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s' }}
          >
            <FaTimes size={11} /> {t('absent')}
          </button>

          <button 
            onClick={() => updateStudentField(student.id, 'status', 'late')} 
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'late' ? '#F59E0B' : 'rgba(245, 158, 11, 0.05)', color: currentStatus === 'late' ? '#fff' : '#F59E0B', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s' }}
          >
            <FaClock size={11} /> {t('late')}
          </button>

          <button 
            onClick={() => updateStudentField(student.id, 'status', 'excused')} 
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentStatus === 'excused' ? '#3B82F6' : 'rgba(59, 130, 246, 0.05)', color: currentStatus === 'excused' ? '#fff' : '#3B82F6', fontWeight: '600', fontSize: '12px', transition: 'all 0.2s' }}
          >
            <FaUserClock size={11} /> {t('excused')}
          </button>
        </div>
      </div>

      {/* لوحة التسميع والمتابعة القرآنية الثلاثية */}
      {isPresent && (
        <div style={{ 
          backgroundColor: 'rgba(0,0,0,0.15)', 
          padding: '14px', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.02)',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          animation: 'fadeInSlideAttendance 0.2s ease-out'
        }}>
          
          {/* حقول المدخلات */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
            gap: '10px' 
          }}>
            {/* الحفظ الجديد */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaBookOpen size={12} color={C.gold || '#C9A84C'} /> {t('memorization')}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: البقرة ١-١٥" : "e.g., Al-Baqarah 1-15"}
                value={record.memorization || ''}
                onChange={(e) => updateStudentField(student.id, 'memorization', e.target.value)}
                style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '13px', textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>

            {/* المراجعة القريبة */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaBook size={12} color="#10B981" /> {t('revision')}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: آخر ٥ صفحات" : "e.g., Last 5 pages"}
                value={record.revision || ''}
                onChange={(e) => updateStudentField(student.id, 'revision', e.target.value)}
                style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '13px', textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>

            {/* المراجعة البعيدة */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaHistory size={12} color="#3B82F6" /> {isRtl ? "المراجعة البعيدة (الماضي)" : "Distant Revision"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: جزء عمّ كاملاً" : "e.g., Juz Amma"}
                value={record.distant_revision || ''}
                onChange={(e) => updateStudentField(student.id, 'distant_revision', e.target.value)}
                style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '13px', textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>
          </div>

          {/* نظام التقييم السريع والملاحظات */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '12px',
            marginTop: '4px' 
          }}>
            {/* التقييم اليومي */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaGraduationCap size={13} color={C.gold || '#C9A84C'} /> {t('daily_grade')}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['excellent', 'good', 'needs_improvement'].map(grade => {
                  const gradeColors = {
                    excellent: { bg: '#10B981', text: t('excellent') },
                    good: { bg: '#F59E0B', text: t('good') },
                    needs_improvement: { bg: '#EF4444', text: t('needs_improvement') }
                  };
                  const isSelected = record.daily_grade === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => updateStudentField(student.id, 'daily_grade', grade)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isSelected ? gradeColors[grade].bg : 'rgba(255,255,255,0.03)',
                        color: isSelected ? '#000' : '#94a3b8'
                      }}
                    >
                      {gradeColors[grade].text}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* صندوق الملاحظات */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{isRtl ? "ملاحظة خاصة باليوم" : "Today's specific note"}</span>
              <input 
                type="text" 
                placeholder={t('notes') || 'ملاحظات...'}
                value={record.notes || ''}
                onChange={(e) => updateStudentField(student.id, 'notes', e.target.value)}
                style={{ background: '#0F172A', border: '1px solid #233247', color: '#fff', padding: '7px 12px', borderRadius: '8px', outline: 'none', fontSize: '13px', boxSizing: 'border-box', textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>
          </div>

        </div>
      )}

      <style>{`
        @keyframes fadeInSlideAttendance {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});

// تعيين اسم للمكون لسهولة تتبعه أثناء الـ Debugging
StudentCard.displayName = 'StudentCard';
