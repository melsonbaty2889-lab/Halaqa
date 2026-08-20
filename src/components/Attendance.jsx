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

  // 🚀 تزامن وتحديد الحلقة تلقائياً فور تحويل المستخدم من شاشة ActiveHalaqas
  useEffect(() => {
    if (initialSelectedHalaqaId) {
      setSelectedHalaqaId(initialSelectedHalaqaId);
    }
  }, [initialSelectedHalaqaId, setSelectedHalaqaId]);

  // 🛠️ دالة مساعدة لفك واستخراج اسم الحلقة بأمان (دعم JSONB والنصوص)
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
    <div className="text-primary p-1 font-sans pb-24 relative" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 1️⃣ الهيدر والتحكم بالتاريخ والحلقة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-accent flex items-center gap-2 m-0">
            <GraduationCap className="w-7 h-7 text-accent" /> 
            {translateText('recitation_attendance', 'رصد الحضور والإنتاجية القرآنية اليومية', 'Recitation & Attendance')}
          </h2>
          <p className="text-xs text-muted mt-1 font-medium">
            {translateText('attendanceSub', 'متابعة الدفتر اليومي للتسميع والمراجعة والتقييم مع التقرير المباشر لأولياء الأمور.', 'Track daily recitation, revision, grading, and instant parent reports.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border p-2.5 px-3 rounded-xl min-w-[170px]">
            <BookOpen className="w-4 h-4 text-accent shrink-0" />
            <select
              value={selectedHalaqaId || ''}
              onChange={(e) => setSelectedHalaqaId(e.target.value)}
              className="bg-transparent border-none text-primary text-xs font-bold outline-none cursor-pointer w-full truncate"
            >
              <option value="" className="bg-card text-primary">
                {isRtl ? 'جميع الحلقات والمجموعات' : 'All Learning Circles'}
              </option>
              {halaqas.map(halaqa => (
                <option key={halaqa.id} value={halaqa.id} className="bg-card text-primary">
                  {formatHalaqaName(halaqa)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border p-2.5 px-3 rounded-xl min-w-[150px]">
            <Calendar className="w-4 h-4 text-accent shrink-0" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-primary text-xs font-bold outline-none cursor-pointer w-full"
            />
          </div>
        </div>
      </div>

      {/* 2️⃣ شريط الإحصائيات */}
      <div className="flex flex-col gap-2.5 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-card border border-border p-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted font-bold">{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</span>
            <span className="text-base font-extrabold text-primary mt-0.5">{stats.total}</span>
          </div>
          <div className="bg-success/10 border border-success/30 p-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-success font-bold">{isRtl ? 'الحاضرون' : 'Present'}</span>
            <span className="text-base font-extrabold text-success mt-0.5">{stats.present}</span>
          </div>
          <div className="bg-danger/10 border border-danger/30 p-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-danger font-bold">{isRtl ? 'الغائبون' : 'Absent'}</span>
            <span className="text-base font-extrabold text-danger mt-0.5">{stats.absent}</span>
          </div>
          <div className="bg-warning/10 border border-warning/30 p-3 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-warning font-bold">{isRtl ? 'المتأخرون' : 'Late'}</span>
            <span className="text-base font-extrabold text-warning mt-0.5">{stats.late}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-1 bg-info/10 border border-info/30 p-2.5 rounded-xl flex items-center justify-between px-4">
            <span className="text-xs text-info font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> {isRtl ? 'نسبة الحضور:' : 'Attendance Rate:'}
            </span>
            <span className="text-base font-extrabold text-info">{stats.rate}%</span>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={filteredStudents.length === 0}
            className="sm:col-span-2 bg-success text-success-foreground hover:bg-success/90 disabled:opacity-40 p-2.5 rounded-xl border border-success/30 flex items-center justify-center gap-2 text-xs font-extrabold transition-all active:scale-[0.98] shadow-md cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> {isRtl ? 'تحضير جميع طلاب القائمة حضور' : 'Mark All Displayed Present'}
          </button>
        </div>
      </div>

      {/* 3️⃣ شريط البحث */}
      <div className="mb-4 relative">
        <Search className={`absolute top-3.5 w-4 h-4 text-muted ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input 
          type="text"
          placeholder={isRtl ? "ابحث باسم الطالب لسرعة الوصول..." : "Search student by name..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full p-2.5 bg-card border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-accent box-border ${isRtl ? 'pr-9' : 'pl-9'}`}
        />
      </div>

      {/* تنبيه الرسائل */}
      {message.text && (
        <div className={`p-3.5 rounded-xl mb-4 text-xs font-bold border ${
          message.type === 'success' 
            ? 'bg-success/10 text-success border-success/20' 
            : 'bg-danger/10 text-danger border-danger/20'
        } ${isRtl ? 'text-right' : 'text-left'}`}>
          {message.text}
        </div>
      )}

      {/* 4️⃣ عرض القائمة */}
      {loadingFetch ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="text-xs text-muted font-bold">{translateText('loadingData', 'جاري جلب سجلات التسميع والحضور...', 'Fetching attendance logs...')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 mb-6">
          {filteredStudents.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-xs text-muted font-bold m-0">
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

      {/* 5️⃣ زر الحفظ الثابت بالأسفل (Sticky Floating Action Bar) */}
      {!loadingFetch && filteredStudents.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-6 backdrop-blur-md bg-background/80 p-2 rounded-2xl border border-border shadow-2xl">
          <button 
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="w-full p-4 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.995] transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
            {isSaving 
              ? translateText('saving', 'جاري معالجة وتوثيق الإنتاجية...', 'Saving and adopting records...') 
              : translateText('saveBtn', 'اعتماد وحفظ الكشف الشامل والتسميع اليومي للحلقة 🚀', 'Adopt & Save Comprehensive Halaqa Sheet 🚀')
            }
          </button>
        </div>
      )}
    </div>
  );
}
