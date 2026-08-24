// src/components/Attendance.jsx
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Save, 
  BookOpen, 
  Loader2, 
  GraduationCap,
  Search,
  CheckCheck,
  TrendingUp
} from 'lucide-react';

import { useAttendance } from '@/hooks/useAttendance';
import StudentAttendanceCard from '@/components/Student/StudentAttendanceCard';

export default function Attendance({ 
  students = [], 
  academyId, 
  halaqas = [], 
  selectedHalaqaId: initialSelectedHalaqaId = null 
}) {
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

  useEffect(() => {
    if (initialSelectedHalaqaId) {
      setSelectedHalaqaId(initialSelectedHalaqaId);
    }
  }, [initialSelectedHalaqaId, setSelectedHalaqaId]);

  const formatHalaqaName = useCallback((halaqa) => {
    if (!halaqa) return '';
    
    if (isRtl && halaqa.name_ar) return halaqa.name_ar;
    if (!isRtl && halaqa.name_en) return halaqa.name_en;

    const nameData = halaqa.name;
    if (!nameData) return halaqa.name_ar || halaqa.name_en || '';
    if (typeof nameData === 'string') return nameData;
    if (typeof nameData === 'object') {
      return isRtl 
        ? (nameData.ar || nameData.en || Object.values(nameData)[0] || '')
        : (nameData.en || nameData.ar || Object.values(nameData)[0] || '');
    }
    return String(nameData);
  }, [isRtl]);

  return (
    <div className="text-[#FFFFFF] p-1 font-cairo leading-relaxed pb-28 relative select-none" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 1️⃣ رأس الصفحة وضوابط التصفية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5 m-0 tracking-normal">
            <GraduationCap className="w-7 h-7 text-[#E07A00] shrink-0" /> 
            {translateText('recitation_attendance', 'سجل الحضور والإنتاجية التعليمية اليومية', 'Daily Attendance & Performance Track')}
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-1.5 font-normal leading-normal">
            {translateText('attendanceSub', 'إدارة وتوثيق سجلات التسميع والمراجعة والتقييم مع التقارير الفورية للمستفيدين.', 'Monitor daily recitation, retention, evaluation, and real-time progress reports.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
          {/* اختيار الحلقة */}
          <div className="flex items-center gap-2.5 bg-[#0A101D] border border-[#1B2738] p-2.5 px-3 rounded-xl min-w-[180px] focus-within:border-[#E07A00] transition-all">
            <BookOpen className="w-4 h-4 text-[#E07A00] shrink-0" />
            <select
              value={selectedHalaqaId || ''}
              onChange={(e) => setSelectedHalaqaId(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-semibold outline-none cursor-pointer w-full truncate font-cairo"
            >
              <option value="" className="bg-[#0F172A] text-white">
                {isRtl ? 'جميع الحلقات والمجموعات' : 'All Learning Groups'}
              </option>
              {halaqas.map(halaqa => (
                <option key={halaqa.id} value={halaqa.id} className="bg-[#0F172A] text-white">
                  {formatHalaqaName(halaqa)}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار التاريخ */}
          <div className="flex items-center gap-2.5 bg-[#0A101D] border border-[#1B2738] p-2.5 px-3 rounded-xl min-w-[150px] focus-within:border-[#E07A00] transition-all">
            <Calendar className="w-4 h-4 text-[#E07A00] shrink-0" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-semibold outline-none cursor-pointer w-full font-sans"
            />
          </div>
        </div>
      </div>

      {/* 2️⃣ لوحة المؤشرات والإحصائيات */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0A101D] border border-[#1B2738] p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-[#A1A1AA] font-medium">{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</span>
            <span className="text-xl font-bold text-white mt-1 font-sans">{stats.total}</span>
          </div>
          <div className="bg-[#09332C]/60 border border-[#0D5C4D] p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] text-[#10B981] font-medium">{isRtl ? 'الحاضرون' : 'Present'}</span>
            <span className="text-xl font-bold text-[#10B981] mt-1 font-sans">{stats.present}</span>
          </div>
          <div className="bg-[#3F1212]/60 border border-[#851D1D] p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] text-[#EF4444] font-medium">{isRtl ? 'الغائبون' : 'Absent'}</span>
            <span className="text-xl font-bold text-[#EF4444] mt-1 font-sans">{stats.absent}</span>
          </div>
          <div className="bg-[#3D2200]/60 border border-[#854D0E] p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] text-[#E07A00] font-medium">{isRtl ? 'المتأخرون' : 'Late'}</span>
            <span className="text-xl font-bold text-[#E07A00] mt-1 font-sans">{stats.late}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1 bg-[#0A101D] border border-[#1B2738] p-3 rounded-xl flex items-center justify-between px-4">
            <span className="text-xs text-[#A1A1AA] font-medium flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#10B981]" /> {isRtl ? 'نسبة الانضباط:' : 'Attendance Rate:'}
            </span>
            <span className="text-base font-bold text-[#10B981] font-sans">{stats.rate}%</span>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={filteredStudents.length === 0}
            className="sm:col-span-2 bg-[#09332C] hover:bg-[#0D5C4D] border border-[#0D5C4D] text-[#10B981] disabled:opacity-40 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm font-cairo"
          >
            <CheckCheck className="w-4 h-4 shrink-0" /> {isRtl ? 'تسجيل حضور كافة طلاب القائمة' : 'Mark All Displayed Attended'}
          </button>
        </div>
      </div>

      {/* 3️⃣ حقل البحث والتصفية */}
      <div className="mb-5 relative">
        <Search className={`absolute top-3.5 w-4 h-4 text-[#64748B] ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input 
          type="text"
          placeholder={isRtl ? "البحث عن طالب بالنص أو المعرف..." : "Search student by name or ID..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full bg-[#0A101D] border border-[#1B2738] text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#E07A00] transition-all font-cairo ${isRtl ? 'pr-10' : 'pl-10'}`}
        />
      </div>

      {/* تنبيهات النظام */}
      {message.text && (
        <div className={`p-3.5 rounded-xl mb-5 text-xs font-semibold border backdrop-blur-md ${
          message.type === 'success' 
            ? 'bg-[#09332C]/90 text-[#10B981] border-[#0D5C4D]' 
            : 'bg-[#3F1212]/90 text-[#EF4444] border-[#851D1D]'
        } ${isRtl ? 'text-right' : 'text-left'}`}>
          {message.text}
        </div>
      )}

      {/* 4️⃣ عرض القائمة */}
      {loadingFetch ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#E07A00]" />
          <span className="text-xs text-[#A1A1AA] font-medium">{translateText('loadingData', 'جاري استرداد سجلات التسميع والحضور...', 'Fetching attendance logs...')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 mb-6">
          {filteredStudents.length === 0 ? (
            <div className="bg-[#0A101D] border border-[#1B2738] rounded-2xl p-8 text-center">
              <p className="text-xs text-[#A1A1AA] font-medium m-0">
                {isRtl ? 'لا توجد بيانات مطابقة لمعايير البحث الحالية.' : 'No student records match current criteria.'}
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

      {/* 5️⃣ زر الإقرار والحفظ الثابت */}
      {!loadingFetch && filteredStudents.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-6 backdrop-blur-lg bg-[#070B11]/85 p-2 rounded-2xl border border-white/10 shadow-xl">
          <button 
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="w-full bg-[#E07A00] hover:bg-[#C66C00] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-lg font-cairo"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
            {isSaving 
              ? translateText('saving', 'جاري توثيق واعتماد البيانات...', 'Processing & recording entries...') 
              : translateText('saveBtn', 'اعتماد وحفظ السجل اليومي الشامل للمجموعة', 'Adopt & Save Comprehensive Session Sheet')
            }
          </button>
        </div>
      )}
    </div>
  );
}
