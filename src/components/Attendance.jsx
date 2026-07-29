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
  FaSpinner, 
  FaGraduationCap,
  FaWhatsapp,
  FaSearch,
  FaCheckDouble,
  FaMagic,
  FaChartLine
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
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  // 🔍 فلترة الطلاب (مع تحويل الـ ID لـ String لمنع مشاكل عدم التطابق)
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    return students.filter(student => {
      const matchHalaqa = !selectedHalaqaId || String(student.halaqa_id) === String(selectedHalaqaId);
      const matchSearch = !searchQuery.trim() || (student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchHalaqa && matchSearch;
    });
  }, [students, selectedHalaqaId, searchQuery]);

  // 📊 حساب إحصائيات الحضور والإنتاجية التفاعلية
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

  // 🔥 الحفظ المجمع الشامل (مع ضمان استخراج halaqa_id لجميع الحالات)
  const handleSaveAttendance = async () => {
    if (!academyId) {
      setMessage({ text: translateText('errorLoading', 'حدث خطأ في معرف الأكاديمية', 'Error in academy ID'), type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    // تحديد halaqa_id افتراضية من أول حلقة متوفرة في الأكاديمية بحال عدم ارتقائها من الطالب
    const fallbackHalaqaId = halaqas.length > 0 ? halaqas[0].id : null;

    try {
      const attendanceRecords = filteredStudents.map(student => {
        const currentRecord = attendanceData[student.id];
        const isPresent = !currentRecord?.status || currentRecord.status === 'present' || currentRecord.status === 'late';
        
        const qIndex = currentRecord?.quarter_index || student.current_quarter_index || 1;
        const juzNum = Math.ceil(qIndex / 8);
        const qInHizb = ((qIndex - 1) % 4) + 1;

        // 💡 تضمن هذه المعادلة ألا تخرج قيمة halaqa_id كـ null إطلاقاً
        const targetHalaqaId = student.halaqa_id || (selectedHalaqaId !== '' ? selectedHalaqaId : fallbackHalaqaId);

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

  return (
    <div className="text-slate-100 p-1 font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 1️⃣ الهيدر والتحكم بالتاريخ والحلقة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-amber-400 flex items-center gap-2 m-0">
            <FaGraduationCap /> {translateText('recitation_attendance', 'رصد الحضور والإنتاجية القرآنية اليومية', 'Recitation & Attendance')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {translateText('attendanceSub', 'متابعة الدفتر اليومي للتسميع والمراجعة والتقييم مع التقرير المباشر لأولياء الأمور.', 'Track daily recitation, revision, grading, and instant parent reports.')}
          </p>
        </div>
        
        {/* حقول القوائم المنسدلة والتاريخ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:w-auto">
          
          {/* اختيارات الحلقة */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 px-3 rounded-xl min-w-[170px]">
            <FaBookOpen className="text-amber-500 text-xs shrink-0" />
            <select
              value={selectedHalaqaId}
              onChange={(e) => setSelectedHalaqaId(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer w-full text-slate-100 truncate"
              style={{ backgroundColor: '#0f172a' }}
            >
              <option value="" className="bg-slate-950 text-white">
                {isRtl ? 'جميع الحلقات والمجموعات' : 'All Learning Circles'}
              </option>
              {halaqas.map(halaqa => (
                <option key={halaqa.id} value={halaqa.id} className="bg-slate-950 text-white">
                  {isRtl ? (halaqa.name_ar || halaqa.name_en || halaqa.name) : (halaqa.name_en || halaqa.name_ar || halaqa.name)}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار التاريخ */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 px-3 rounded-xl min-w-[150px]">
            <FaCalendarAlt className="text-amber-500 text-xs shrink-0" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-bold outline-none cursor-pointer w-full"
            />
          </div>
        </div>
      </div>

      {/* 2️⃣ شريط الإحصائيات التفاعلي */}
      <div className="flex flex-col gap-2.5 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-1 bg-blue-950/30 border border-blue-800/40 p-2.5 rounded-xl flex items-center justify-between px-4">
            <span className="text-xs text-blue-400 font-bold flex items-center gap-1.5">
              <FaChartLine /> {isRtl ? 'نسبة الحضور:' : 'Attendance Rate:'}
            </span>
            <span className="text-base font-extrabold text-blue-400">{stats.rate}%</span>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={filteredStudents.length === 0}
            className="sm:col-span-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-extrabold transition-all active:scale-[0.98] shadow-md cursor-pointer"
          >
            <FaCheckDouble size={13} /> {isRtl ? 'تحضير جميع طلاب القائمة حضور' : 'Mark All Displayed Present'}
          </button>
        </div>
      </div>

      {/* 3️⃣ شريط البحث السريع عن طالب */}
      <div className="mb-4 relative">
        <FaSearch className={`absolute top-3.5 text-slate-500 text-xs ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input 
          type="text"
          placeholder={isRtl ? "ابحث باسم الطالب لسرعة الوصول..." : "Search student by name..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 box-border ${isRtl ? 'pr-9' : 'pl-9'}`}
        />
      </div>

      {/* تنبيه الرسائل */}
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
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-8 text-center">
              <p className="text-xs text-slate-400 font-bold m-0">
                {isRtl ? 'لا يوجد طلاب مسجلون بحسب الفلتر المختار.' : 'No students found matching current filter.'}
              </p>
            </div>
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

      {/* 5️⃣ زر الحفظ النهائي المجمع */}
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
/* 💎 المكون الفرعي StudentCard */
/* ------------------------------------------------------------- */
const StudentCard = memo(({ student, record, updateStudentField, selectedDate, isRtl, t }) => {
  const currentStatus = record.status || 'present';
  const isPresent = currentStatus === 'present' || currentStatus === 'late';

  const handleSendWhatsAppReport = () => {
    const parentPhone = student.parent_phone || student.phone;
    if (!parentPhone) {
      alert(isRtl ? "لا يوجد رقم هاتف مسجل لولي الأمر!" : "No phone number registered for parent!");
      return;
    }

    const cleanPhone = parentPhone.replace(/\D/g, '');
    const statusMap = { present: 'حاضر 🟢', absent: 'غائب 🔴', late: 'متأخر 🟡', excused: 'معتذر 🔵' };
    const gradeMap = { 10: 'ممتاز 🌟', 8: 'جيد جداً 👍', 6: 'يحتاج تحسين ⚠️' };

    const text = `السلام عليكم ورحمة الله وبركاته 🌸
تقرير أداء الطالب/ة: *${student.name}*
📅 التاريخ: ${selectedDate}

📌 الحضور: ${statusMap[currentStatus] || 'حاضر'}
📖 الحفظ الجديد: ${record.new_memorization || 'لم يحدد'}
🔁 المراجعة والربط: ${record.retention_assignment || 'لم يحدد'}
⭐ التقييم: ${gradeMap[record.session_grade] || 'ممتاز 🌟'}
📝 الملاحظات: ${record.notes || 'لا يوجد ملاحظات'}

شاكرين ومقدرين حسن متابعتكم معنا 🌿`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const quickNotes = ['ممتاز ومرتل ✨', 'تثبيت المتشابهات 🔁', 'مراجعة الورد جيداً 📖', 'تركيز في الأحكام 🎯'];

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-3.5 transition-all hover:border-slate-700/60 box-border shadow-sm">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-wide">{student.name}</span>
            {(student.parent_phone || student.phone) && (
              <button
                type="button"
                onClick={handleSendWhatsAppReport}
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

      {isPresent && (
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/50 flex flex-col gap-3.5 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <FaBookOpen className="text-amber-500 text-xs" /> {isRtl ? "ورد الحفظ الجديد" : "New Memorization"}
              </label>
              <input 
                type="text" 
                placeholder={isRtl ? "مثال: البقرة ١-١٥" : "e.g., Al-Baqarah 1-15"}
                value={record.new_memorization || ''}
                onChange={(e) => updateStudentField(student.id, 'new_memorization', e.target.value)}
                className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/40 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

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

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
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

            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[11px] text-slate-400 font-bold">{isRtl ? "الملاحظات والتوجيه" : "Teacher Notes"}</span>
              <input 
                type="text" 
                placeholder={isRtl ? "اكتب ملاحظة..." : "Write a note..."}
                value={record.notes || ''}
                onChange={(e) => updateStudentField(student.id, 'notes', e.target.value)}
                className={`w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700 ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

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
