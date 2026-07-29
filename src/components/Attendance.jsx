// src/components/Attendance.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaCalendarAlt, 
  FaSave, 
  FaBookOpen, 
  FaSpinner, 
  FaGraduationCap,
  FaSearch,
  FaCheckDouble,
  FaChartLine
} from 'react-icons/fa';

import { useAttendance } from '../hooks/useAttendance';
import StudentAttendanceCard from './StudentAttendanceCard';

export default function Attendance({ students = [], academyId, halaqas = [] }) {
  const { t, i18n } = useTranslation();

  const {
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
  } = useAttendance({ students, academyId, halaqas, t, i18n });

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:w-auto">
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

      {/* 2️⃣ شريط الإحصائيات */}
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

      {/* 3️⃣ شريط البحث */}
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

      {/* 4️⃣ عرض القائمة */}
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
              <StudentAttendanceCard 
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

      {/* 5️⃣ زر الحفظ النهائي */}
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
