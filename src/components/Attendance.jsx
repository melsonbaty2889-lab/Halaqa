import React, { useState, useEffect, useMemo, memo } from 'react';
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
  FaGraduationCap,
  FaWhatsapp,
  FaSearch,
  FaCheckDouble,
  FaChartPie,
  FaMagic,
  FaLightbulb
} from 'react-icons/fa';

export default function Attendance({ students = [], academyId, halaqas = [] }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  // --- الحالات الرئيسية (States) ---
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHalaqaId, setSelectedHalaqaId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [lastSessionData, setLastSessionData] = useState({});
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  // 🔍 فلترة الطلاب بناءً على الحلقة المختارة وكلمة البحث
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchHalaqa = !selectedHalaqaId || student.halaqa_id === selectedHalaqaId;
      const matchSearch = !searchQuery.trim() || student.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchHalaqa && matchSearch;
    });
  }, [students, selectedHalaqaId, searchQuery]);

  // 📊 حساب إحصائيات الحضور والإنتاجية التفاعلية لليوم
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

  // 🔄 جلب بيانات الحضور لليوم المحدد + استدعاء الذاكرة السريعة لآخر جلسة
  useEffect(() => {
    async function fetchAttendanceAndHistory() {
      if (!academyId || !selectedDate || students.length === 0) return;
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

    fetchAttendanceAndHistory();
  }, [selectedDate, academyId, students]);

  // ⚡ تحديث حقل معين لطالب
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

  // 🚀 تحضير جميع الطلاب المفلترين دفعة واحدة "حضور"
  const handleMarkAllPresent = () => {
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

  // 🔥 دالة الحفظ المجمع الشاملة والمطابقة مع Supabase
  const handleSaveAttendance = async () => {
    if (!academyId) {
      setMessage({ text: translateText('errorLoading', 'حدث خطأ في معرف الأكاديمية', 'Error in academy ID'), type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const attendanceRecords = filteredStudents.map(student => {
        const currentRecord = attendanceData[student.id];
        const isPresent = !currentRecord?.status || currentRecord.status === 'present' || currentRecord.status === 'late';
        
        // حساب تفاصيل الربع والجزء
        const qIndex = currentRecord?.quarter_index || student.current_quarter_index || 1;
        const juzNum = Math.ceil(qIndex / 8);
        const qInHizb = ((qIndex - 1) % 4) + 1;

        return {
          student_id: student.id,
          academy_id: academyId,
          halaqa_id: student.halaqa_id || selectedHalaqaId || null,
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

  return (
    <div className="text-slate-100 p-1 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 1️⃣ الهيدر الرئيسي وأدوات التجميع للتاريخ والحلقة */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-amber-400 flex items-center gap-2 m-0">
            <FaGraduationCap /> {translateText('recitation_attendance', 'رصد الحضور والإنتاجية القرآنية اليومية', 'Recitation & Attendance')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {translateText('attendanceSub', 'متابعة الدفتر اليومي للتسميع والمراجعة والتقييم مع التقرير المباشر لأولياء الأمور.', 'Track daily recitation, revision, grading, and instant parent reports.')}
          </p>
        </div>
        
        {/* أزرار اختيار الحلقة والتاريخ والبحث السريع */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
          
          {/* اختيار الحلقة */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 px-3 rounded-xl flex-1 sm:flex-none">
            <FaBookOpen className="text-amber-500 text-xs" />
            <select
              value={selectedHalaqaId}
              onChange={(e) => setSelectedHalaqaId(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer w-full text-slate-100"
              style={{ backgroundColor: '#0f172a' }}
            >
              <option value="" className="bg-slate-950 text-white">
                {isRtl ? 'جميع الحلقات والمجموعات' : 'All Learning Circles'}
              </option>
              {halaqas.map(halaqa => (
                <option key={halaqa.id} value={halaqa.id} className="bg-slate-950 text-white">
                  {isRtl ? (halaqa.name_ar || halaqa.name_en) : (halaqa.name_en || halaqa.name_ar)}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار التاريخ */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 px-3 rounded-xl flex-1 sm:flex-none">
            <FaCalendarAlt className="text-amber-500 text-xs" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2️⃣ شريط الإحصائيات التفاعلي والتحضير السريع */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 font-bold">{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</span>
          <span className="text-base font-extrabold text-white mt-0.5">{stats.total}</span>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[10px] text-emerald-400 font-bold">{isRtl ? 'الحاضرون' : 'Present'}</span>
          <span className="text-base font-extrabold text-emerald-400 mt-0.5">{stats.present}</span>
        </div>
        <div className="bg-red-950/30 border border-red-800/40 p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[10px] text-red-400 font-bold">{isRtl ? 'الغائبون' : 'Absent'}</span>
          <span className="text-base font-extrabold text-red-400 mt-0.5">{stats.absent}</span>
        </div>
        <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[10px] text-amber-400 font-bold">{isRtl ? 'المتأخرون' : 'Late'}</span>
          <span className="text-base font-extrabold text-amber-400 mt-0.5">{stats.late}</span>
        </div>
        <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-[10px] text-blue-400 font-bold">{isRtl ? 'نسبة الحضور' : 'Attendance Rate'}</span>
          <span className="text-base font-extrabold text-blue-400 mt-0.5">{stats.rate}%</span>
        </div>
        
        {/* زر التحضير السريع للجميع */}
        <button
          type="button"
          onClick={handleMarkAllPresent}
          className="col-span-2 md:col-span-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all active:scale-95 shadow-md"
        >
          <FaCheckDouble size={12} /> {isRtl ? 'تحضير الكل' : 'Mark All'}
        </button>
      </div>

      {/* 3️⃣ شريط البحث السريع عن طالب */}
      <div className="mb-4 relative">
        <FaSearch className="absolute right-3.5 top-3.5 text-slate-500 text-xs" />
        <input 
          type="text"
          placeholder={isRtl ? "ابحث باسم الطالب لسرعة الوصول..." : "Search student by name..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2.5 pr-9 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 box-border"
        />
      </div>

      {/* رسائل التنبيه والنجاح */}
      {message.text && (
        <div className={`p-3.5 rounded-xl mb-4 text-xs font-bold border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        } ${isRtl ? 'text-right' : 'text-left'}`}>
          {message.text}
        </div>
      )}

      {/* 4️⃣ عرض القائمة الرئيسية لكروت الطلاب */}
      {loadingFetch ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <FaSpinner className="animate-spin text-amber-500 text-2xl" />
          <span className="text-xs text-slate-400 font-bold">{translateText('loadingData', 'جاري جلب سجلات التسميع والحضور...', 'Fetching attendance logs...')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 mb-6">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-10">
              {isRtl ? 'لا يوجد طلاب مسجلون بحسب الفلتر المختار.' : 'No students found matching current filter.'}
            </p>
          ) : (
            filteredStudents.map(student => (
              <StudentCard 
                key={student.id}
                student={student}
                record={attendanceData[student.id] || {}}
                updateStudentField={updateStudentField}
                selectedDate={selectedDate}
                isRtl={isRtl}
                t={t}
              />
            ))
          )}
        </div>
      )}

      {/* 5️⃣ زر الحفظ النهائي المجمع للدفتر */}
      {!loadingFetch && filteredStudents.length > 0 && (
        <button 
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="w-full p-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-[0.995] transition-all cursor-pointer"
        >
          <FaSave /> {isSaving ? translateText('saving', 'جاري معالجة وتوثيق الإنتاجية...', 'Saving and adopting records...') : translateText('saveBtn', 'اعتماد وحفظ الكشف الشامل والتسميع اليومي للحلقة 🚀', 'Adopt & Save Comprehensive Halaqa Sheet 🚀')}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- */
/* 💎 المكون المطور لكارت كل طالب StudentCard مع تقرير الواتساب */
/* ------------------------------------------------------------- */
const StudentCard = memo(({ student, record, updateStudentField, selectedDate, isRtl, t }) => {
  const currentStatus = record.status || 'present';
  const isPresent = currentStatus === 'present' || currentStatus === 'late';

  // دالة تشكيل وإرسال تقرير الواتساب لولي الأمر
  const handleSendWhatsAppReport = () => {
    const parentPhone = student.parent_phone || student.phone;
    if (!parentPhone) {
      alert(isRtl ? "لا يوجد رقم هاتف مسجل لولي الأمر!" : "No phone number registered for parent!");
      return;
    }

    const cleanPhone = parentPhone.replace(/\D/g, '');
    const statusMap = {
      present: 'حاضر 🟢',
      absent: 'غائب 🔴',
      late: 'متأخر 🟡',
      excused: 'معتذر 🔵'
    };

    const gradeMap = {
      10: 'ممتاز 🌟',
      8: 'جيد جداً 👍',
      6: 'يحتاج تحسين ⚠️'
    };

    const text = `السلام عليكم ورحمة الله وبركاته 🌸
تقرير أداء الطالب/ة: *${student.name}*
📅 التاريخ: ${selectedDate}

📌 الحضور: ${statusMap[currentStatus] || 'حاضر'}
📖 الحفظ الجديد: ${record.new_memorization || 'لم يحدد'}
🔁 المراجعة والربط: ${record.retention_assignment || 'لم يحدد'}
⭐ التقييم: ${gradeMap[record.session_grade] || 'ممتاز 🌟'}
📝 الملاحظات: ${record.notes || 'لا يوجد ملاحظات'}

شاكرين ومقدرين حسن متابعتكم معنا 🌿`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // شرائح الملاحظات السريعة بنقرة واحدة
  const quickNotes = [
    'ممتاز ومرتل ✨',
    'تثبيت المتشابهات 🔁',
    'مراجعة الورد جيداً 📖',
    'تركيز في الأحكام 🎯'
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-3.5 transition-all hover:border-slate-700/60 box-border shadow-sm">
      
      {/* السطر العلوي: اسم الطالب، وأزرار الحضور المباشرة، وزر الواتساب */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-wide">{student.name}</span>
            {student.parent_phone && (
              <button
                type="button"
                onClick={handleSendWhatsAppReport}
                title={isRtl ? "إرسال تقرير التسميع عبر الواتساب لولي الأمر" : "Send WhatsApp Report"}
                className="p-1 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <FaWhatsapp className="text-emerald-400 text-xs" /> {isRtl ? "تقرير الواتساب" : "WhatsApp"}
              </button>
            )}
          </div>
          <span className="text-[11px] font-bold text-amber-500/80 block mt-0.5">
            {t('memorization_prefix') || 'مستوى الحفظ الحالي:'} {student.current_surah || (isRtl ? 'الربع ' + (student.current_quarter_index || 1) : 'Quarter ' + (student.current_quarter_index || 1))}
          </span>
        </div>
        
        {/* أزرار الحضور التفاعلية السريعة */}
        <div className="grid grid-cols-2 sm:flex gap-1.5 w-full lg:w-auto justify-center lg:justify-end">
          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'present')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'present' 
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow-md shadow-emerald-500/10' 
                : 'bg-slate-950 text-emerald-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaCheck size={10} /> {t('present') || 'حاضر'}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'absent')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'absent' 
                ? 'bg-red-500 text-white border-red-500 font-extrabold shadow-md shadow-red-500/10' 
                : 'bg-slate-950 text-red-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaTimes size={10} /> {t('absent') || 'غائب'}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'late')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'late' 
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md shadow-amber-500/10' 
                : 'bg-slate-950 text-amber-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaClock size={10} /> {t('late') || 'متأخر'}
          </button>

          <button 
            type="button"
            onClick={() => updateStudentField(student.id, 'status', 'excused')} 
            className={`flex items-center justify-center gap-1.5 p-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              currentStatus === 'excused' 
                ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-md shadow-blue-600/10' 
                : 'bg-slate-950 text-blue-400 border-slate-800/80 hover:bg-slate-900'
            }`}
          >
            <FaUserClock size={10} /> {t('excused') || 'معتذر'}
          </button>
        </div>
      </div>

      {/* لوحة رصد التسميع والإنتاجية (تفتح في حال حضور الطالب أو تأخره) */}
      {isPresent && (
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/50 flex flex-col gap-3.5 transition-all">
          
          {/* مدخلات الحفظ والتسميع اليومي */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* مدخل الحفظ الجديد */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <FaBookOpen className="text-amber-500 text-xs" /> {isRtl ? "ورد الحفظ الجديد" : "New Memorization"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: البقرة ١-١٥ (أو الربع 12)" : "e.g., Al-Baqarah 1-15"}
                value={record.new_memorization || ''}
                onChange={(e) => updateStudentField(student.id, 'new_memorization', e.target.value)}
                className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* مدخل المراجعة والربط */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <FaBook className="text-emerald-400 text-xs" /> {isRtl ? "ورد المراجعة والربط" : "Retention & Revision"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: مراجعة آخر ٥ صفحات" : "e.g., Last 5 pages"}
                value={record.retention_assignment || ''}
                onChange={(e) => updateStudentField(student.id, 'retention_assignment', e.target.value)}
                className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          {/* التقييم السريع والملاحظات الشرائحية */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            
            {/* أزرار التقييم الرقمية المتوافقة مع DB (10 / 8 / 6) */}
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                <FaGraduationCap className="text-amber-500" /> {isRtl ? "التقييم اليومي" : "Daily Grade"}
              </span>
              <div className="flex gap-1.5">
                {[
                  { value: 10, label: isRtl ? 'ممتاز 🌟' : 'Excellent' },
                  { value: 8, label: isRtl ? 'جيد جداً 👍' : 'Very Good' },
                  { value: 6, label: isRtl ? 'يحتاج تحسين ⚠️' : 'Needs Work' }
                ].map(grade => {
                  const isSelected = Number(record.session_grade || 10) === grade.value;
                  return (
                    <button
                      key={grade.value}
                      type="button"
                      onClick={() => updateStudentField(student.id, 'session_grade', grade.value)}
                      className={`flex-1 p-1.5 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {grade.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* الملاحظات السريعة (Quick Chips) + إدخال الملاحظة */}
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[11px] text-slate-400 font-bold">{isRtl ? "الملاحظات والتوجيه" : "Teacher Notes"}</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="text" 
                  placeholder={isRtl ? "اكتب ملاحظة أو اختر من الأزرار..." : "Write a note..."}
                  value={record.notes || ''}
                  onChange={(e) => updateStudentField(student.id, 'notes', e.target.value)}
                  className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700 ${isRtl ? 'text-right' : 'text-left'}`}
                />
              </div>
            </div>
          </div>

          {/* أزرار التوجيه السريعة (Chips) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <FaMagic className="text-amber-500/70" /> {isRtl ? "ملاحظات سريعة:" : "Quick Notes:"}
            </span>
            {quickNotes.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateStudentField(student.id, 'notes', record.notes ? `${record.notes} - ${chip}` : chip)}
                className="p-1 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
});

StudentCard.displayName = 'StudentCard';
