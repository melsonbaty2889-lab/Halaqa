import React, { useState, useEffect, memo } from 'react';
import { sessionService } from '../lib/sessionService'; 
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
  FaSpinner, 
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

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  // 🔄 جلب البيانات التراكمية للحلقة لليوم المحدد عبر السيرفيس الموحد
  useEffect(() => {
    async function fetchExistingAttendance() {
      if (!academyId || !selectedDate || students.length === 0) return;
      setLoadingFetch(true);
      setMessage({ text: '', type: '' });

      try {
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
      } finaly {
        setLoadingFetch(false);
      }
    }

    fetchExistingAttendance();
  }, [selectedDate, academyId, students]);

  // تحديث حقل معين لطالب داخل كرت المتابعة مع حماية الهيكل البنيوي للـ state
  const updateStudentField = (studentId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present', notes: '', memorization: '', revision: '', distant_revision: '', daily_grade: '' }),
        [field]: value
      }
    }));
  };

  // 🔥 دالة الحفظ المجمع والذكي لكامل الحلقة بطلب شبكة واحد
  const handleSaveAttendance = async () => {
    if (!academyId) {
      setMessage({ text: translateText('errorLoading', 'حدث خطأ في تحميل بيانات الأكاديمية', 'Error loading academy data'), type: 'error' });
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

      await sessionService.upsertAttendance(attendanceRecords);

      setMessage({ 
        text: translateText('attendanceSavedSuccess', 'تم اعتماد وحفظ كشف الحضور والإنتاجية القرآنية اليومية للحلقة بنجاح! 🎉', 'Attendance and daily recitation sheet saved successfully! 🎉'), 
        type: 'success' 
      });
    } catch (error) {
      console.error("🚨 خطأ أثناء الحفظ المجمع:", error);
      setMessage({ text: `${translateText('saveFailed', 'فشل حفظ الكشف:', 'Save failed:')} ${error.message}`, type: 'error' });
    } finaly {
      setIsSaving(false);
    }
  };

  return (
    <div className="text-slate-100 p-1 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* التحكم العلوي بالتاريخ وهيدر الصفحة المتجاوب */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-amber-400 flex items-center gap-2 margin-0">
            {translateText('recitation_attendance', 'رصد الحضور والإنتاجية القرآنية اليومية', 'Recitation & Attendance')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {translateText('attendanceSub', 'تتبع كفاءة الثالوث القرآني اليومي (الحفظ الجديد، المراجعة القريبة والبعيدة).', 'Track daily Quranic triad performance (New Memorization, Revision, Distant).')}
          </p>
        </div>
        
        {/* منقي وفلتر التاريخ الذكي */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 px-4 rounded-xl w-full md:w-auto box-border shadow-inner">
          <FaCalendarAlt className="text-amber-500 text-sm" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer w-full md:w-auto"
          />
        </div>
      </div>

      {/* لوحة عرض الرسائل التحذيرية أو رسائل النجاح */}
      {message.text && (
        <div className={`p-4 rounded-xl mb-5 text-xs font-bold border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        } ${isRtl ? 'text-right' : 'text-left'}`}>
          {message.text}
        </div>
      )}

      {/* الهيكل الرئيسي للتحميل وعرض الكروت للطلاب */}
      {loadingFetch ? (
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <FaSpinner className="animate-spin text-amber-500 text-xl" />
          <span className="text-xs text-slate-400 font-bold">{translateText('loadingAttendanceData', 'جاري استدعاء السجل البنيوي الشامل للحلقة...', 'Fetching comprehensive halaqa records...')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {students.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-10">
              {t('no_students_registered')}
            </p>
          ) : (
            students.map(student => (
              <StudentCard 
                key={student.id}
                student={student}
                record={attendanceData[student.id] || {}}
                updateStudentField={updateStudentField}
                isRtl={isRtl}
                t={t}
              />
            ))
          )}
        </div>
      )}

      {/* زر الاعتماد المجمع للحلقة بالكامل */}
      {!loadingFetch && students.length > 0 && (
        <button 
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="w-full p-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 active:scale-[0.995] transition-all"
        >
          <FaSave /> {isSaving ? translateText('saving', 'جاري معالجة وتوثيق الإنتاجية قرآنياً...', 'Saving and adopting records...') : translateText('saveBtn', 'اعتماد وحفظ الكشف الشامل والتسميع اليومي للحلقة 🚀', 'Adopt & Save Comprehensive Halaqa Sheet 🚀')}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- */
/* 💎 المكون الفرعي الميمو المطور والمعزول للأداء العالي StudentCard */
/* ------------------------------------------------------------- */
const StudentCard = memo(({ student, record, updateStudentField, isRtl, t }) => {
  const currentStatus = record.status || 'present';
  const isPresent = currentStatus === 'present' || currentStatus === 'late';

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4 transition-all hover:border-slate-700/60 box-border shadow-sm">
      
      {/* سطر بيانات الطالب ومفاتيح اختيار الحضور السريع المتجاوبة كلياً */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <span className="text-sm font-extrabold text-white tracking-wide block">{student.name}</span>
          <span className="text-[11px] font-bold text-amber-500/80 block mt-1">
            {t('memorization_prefix')} {student.current_surah || t('not_specified_yet')}
          </span>
        </div>
        
        {/* أزرار الحضور التفاعلية ذات النمط العصري المنفصل */}
        <div className="grid grid-cols-2 sm:flex gap-2 w-full lg:w-auto justify-center lg:justify-end">
          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'present')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3.5 rounded-xl border text-[11px] font-bold transition-all ${
              currentStatus === 'present' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow-md shadow-emerald-500/10' 
                : 'bg-slate-950 text-emerald-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaCheck size={10} /> {t('present')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'absent')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3.5 rounded-xl border text-[11px] font-bold transition-all ${
              currentStatus === 'absent' 
                ? 'bg-red-500 text-white border-red-500 font-extrabold shadow-md shadow-red-500/10' 
                : 'bg-slate-950 text-red-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaTimes size={10} /> {t('absent')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'late')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3.5 rounded-xl border text-[11px] font-bold transition-all ${
              currentStatus === 'late' 
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md shadow-amber-500/10' 
                : 'bg-slate-950 text-amber-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaClock size={10} /> {t('late')}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'excused')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3.5 rounded-xl border text-[11px] font-bold transition-all ${
              currentStatus === 'excused' 
                ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-md shadow-blue-600/10' 
                : 'bg-slate-950 text-blue-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaUserClock size={10} /> {t('excused')}
          </button>
        </div>
      </div>

      {/* لوحة رصد المتابعة الثلاثية والتقييم، تفتح فقط في حال حضور الطالب أو تأخره */}
      {isPresent && (
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/50 flex flex-col gap-4 animate-fadeIn transition-all">
          
          {/* شبكة الثالوث القرآني المتجاوبة (الحفظ - المراجعة - الماضي المبتعد) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* مدخل الحفظ الجديد */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <FaBookOpen className="text-amber-500 text-xs" /> {t('memorization')}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: البقرة ١-١٥" : "e.g., Al-Baqarah 1-15"}
                value={record.memorization || ''}
                onChange={(e) => updateStudentField(student.id, 'memorization', e.target.value)}
                className={`w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* مدخل المراجعة القريبة */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <FaBook className="text-emerald-400 text-xs" /> {t('revision')}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: آخر ٥ صفحات" : "e.g., Last 5 pages"}
                value={record.revision || ''}
                onChange={(e) => updateStudentField(student.id, 'revision', e.target.value)}
                className={`w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* مدخل المراجعة البعيدة (الماضي التراكمي) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <FaHistory className="text-blue-400 text-xs" /> {isRtl ? "المراجعة البعيدة (الماضي)" : "Distant Revision"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: جزء عم كاملاً" : "e.g., Juz Amma"}
                value={record.distant_revision || ''}
                onChange={(e) => updateStudentField(student.id, 'distant_revision', e.target.value)}
                className={`w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          {/* نظام رصد تقييم الحصة السريع والملاحظات النوعية لليوم */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-1">
            
            {/* التقييم السريع الملون */}
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <FaGraduationCap className="text-amber-500" /> {t('daily_grade')}
              </span>
              <div className="flex gap-2">
                {['excellent', 'good', 'needs_improvement'].map(grade => {
                  const gradeStyles = {
                    excellent: 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/5 font-extrabold',
                    good: 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/5 font-extrabold',
                    needs_improvement: 'bg-red-500 text-white shadow-md shadow-red-500/5 font-extrabold'
                  };
                  const gradeLabels = {
                    excellent: t('excellent'),
                    good: t('good'),
                    needs_improvement: t('needs_improvement')
                  };
                  const isSelected = record.daily_grade === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => updateStudentField(student.id, 'daily_grade', grade)}
                      className={`flex-1 p-2 rounded-lg border text-[10px] font-bold transition-all ${
                        isSelected 
                          ? gradeStyles[grade] + ' border-transparent'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      {gradeLabels[grade]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* حقل الملاحظات الفردية لليوم */}
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[11px] text-slate-400 font-bold">{isRtl ? "ملاحظة التوجيه الخاصة باليوم" : "Today's specific directive"}</span>
              <input 
                type="text" 
                placeholder={t('notes') || 'اكتب ملاحظات المعلم هنا...'}
                value={record.notes || ''}
                onChange={(e) => updateStudentField(student.id, 'notes', e.target.value)}
                className={`w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700 box-border ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
});

StudentCard.displayName = 'StudentCard';
