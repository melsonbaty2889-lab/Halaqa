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
  TrendingUp,
  Archive,
  Lock
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
    handleSaveAttendance
  } = useAttendance({ students, academyId, halaqas, t, i18n });

  useEffect(() => {
    if (initialSelectedHalaqaId) {
      setSelectedHalaqaId(initialSelectedHalaqaId);
    }
  }, [initialSelectedHalaqaId, setSelectedHalaqaId]);

  // التحقق مما إذا كانت الحلقة المختارة حالياً مؤرشفة
  const selectedHalaqa = halaqas.find(h => String(h.id) === String(selectedHalaqaId));
  const isArchived = Boolean(selectedHalaqa?.is_archived);

  const formatHalaqaName = useCallback((halaqa) => {
    if (!halaqa) return '';
    const currentLang = i18n?.language || 'ar';
    
    const nameData = halaqa.name;
    if (typeof nameData === 'object' && nameData !== null) {
      return nameData[currentLang] || nameData.ar || nameData.en || Object.values(nameData)[0] || '';
    }
    return halaqa.name_ar || halaqa.name_en || halaqa.name || String(nameData || '');
  }, [i18n?.language]);

  return (
    <div className="text-white p-1 font-cairo leading-relaxed pb-28 relative select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1️⃣ رأس الصفحة وضوابط التصفية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-semantic-textPrimary flex items-center gap-2.5 m-0">
            <GraduationCap className="w-7 h-7 text-semantic-actionPrimary shrink-0" /> 
            {t('attendance.title', 'متابعة الجلسات والتحصيل')}
          </h2>
          <p className="text-xs text-semantic-textSecondary mt-1.5 font-normal leading-normal">
            {t('attendance.subtitle', 'إدارة وتوثيق سجلات التسميع والمراجعة والتقييم مع التقارير الفورية للمستفيدين.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
          {/* اختيار الحلقة */}
          <div className="flex items-center gap-2.5 bg-semantic-surfaceInput border border-semantic-borderInput p-2.5 px-3 rounded-xl min-w-[180px] focus-within:border-semantic-actionPrimary transition-all">
            <BookOpen className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
            <select
              value={selectedHalaqaId || ''}
              onChange={(e) => setSelectedHalaqaId(e.target.value)}
              className="bg-transparent border-none text-semantic-textPrimary text-xs font-bold outline-none cursor-pointer w-full truncate font-cairo"
            >
              <option value="" className="bg-semantic-surfaceCard text-semantic-textPrimary">
                {t('attendance.allHalaqas', 'جميع الحلقات والمجموعات')}
              </option>
              {halaqas.map(halaqa => (
                <option key={halaqa.id} value={halaqa.id} className="bg-semantic-surfaceCard text-semantic-textPrimary">
                  {formatHalaqaName(halaqa)} {halaqa.is_archived ? `(${t('common.archived', 'مؤرشفة')})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار التاريخ */}
          <div className="flex items-center gap-2.5 bg-semantic-surfaceInput border border-semantic-borderInput p-2.5 px-3 rounded-xl min-w-[150px] focus-within:border-semantic-actionPrimary transition-all">
            <Calendar className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-semantic-textPrimary text-xs font-bold outline-none cursor-pointer w-full font-cairo"
            />
          </div>
        </div>
      </div>

      {/* ⚠️ تنبيه الحلقة المؤرشفة (وضع القراءة فقط) */}
      {isArchived && (
        <div className="p-3.5 rounded-xl mb-5 bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textSecondary text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <Archive className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
          <span>
            {t('attendance.archivedNotice', 'هذه الحلقة مؤرشفة حالياً. يمكنك استعراض السجلات القديمة فقط، وتم إيقاف إمكانية تعديل الحضور أو تسجيل التسميع.')}
          </span>
        </div>
      )}

      {/* 2️⃣ لوحة المؤشرات والإحصائيات */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-semantic-surfaceInput border border-semantic-borderInput p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-semantic-textSecondary font-semibold">{t('attendance.totalStudents', 'إجمالي الطلاب')}</span>
            <span className="text-xl font-extrabold text-semantic-textPrimary mt-1 font-cairo">{stats.total}</span>
          </div>
          <div className="bg-semantic-successBg border border-semantic-successBorder p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] text-semantic-success font-semibold">{t('attendance.present', 'الحاضرون')}</span>
            <span className="text-xl font-extrabold text-semantic-success mt-1 font-cairo">{stats.present}</span>
          </div>
          <div className="bg-semantic-dangerBg border border-semantic-danger/30 p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] text-semantic-danger font-semibold">{t('attendance.absent', 'الغائبون')}</span>
            <span className="text-xl font-extrabold text-semantic-danger mt-1 font-cairo">{stats.absent}</span>
          </div>
          <div className="bg-semantic-surfaceInput border border-semantic-borderInput p-3.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] text-semantic-actionPrimary font-semibold">{t('attendance.late', 'المتأخرون')}</span>
            <span className="text-xl font-extrabold text-semantic-actionPrimary mt-1 font-cairo">{stats.late}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1 bg-semantic-surfaceInput border border-semantic-borderInput p-3 rounded-xl flex items-center justify-between px-4">
            <span className="text-xs text-semantic-textSecondary font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-semantic-success" /> {t('attendance.rate', 'نسبة الانضباط:')}
            </span>
            <span className="text-base font-extrabold text-semantic-success font-cairo">{stats.rate}%</span>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={filteredStudents.length === 0 || isArchived}
            className="sm:col-span-2 bg-semantic-successBg hover:bg-semantic-success/20 border border-semantic-successBorder text-semantic-success disabled:opacity-40 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all active:scale-[0.98] cursor-pointer shadow-sm font-cairo"
          >
            <CheckCheck className="w-4 h-4 shrink-0" /> {t('attendance.markAllPresent', 'تسجيل حضور كافة طلاب القائمة')}
          </button>
        </div>
      </div>

      {/* 3️⃣ حقل البحث والتصفية */}
      <div className="mb-5 relative">
        <Search className={`absolute top-3.5 w-4 h-4 text-semantic-textMuted ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input 
          type="text"
          placeholder={t('attendance.searchPlaceholder', 'البحث عن طالب بالنص أو المعرف...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`app-input text-xs font-cairo ${isRtl ? 'pr-10' : 'pl-10'}`}
        />
      </div>

      {/* تنبيهات النظام */}
      {message.text && (
        <div className={`p-3.5 rounded-xl mb-5 text-xs font-bold border backdrop-blur-md ${
          message.type === 'success' 
            ? 'bg-semantic-successBg text-semantic-success border-semantic-successBorder' 
            : 'bg-semantic-dangerBg text-semantic-danger border-semantic-danger/30'
        } ${isRtl ? 'text-right' : 'text-left'}`}>
          {message.text}
        </div>
      )}

      {/* 4️⃣ عرض القائمة */}
      {loadingFetch ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-8 h-8 animate-spin text-semantic-actionPrimary" />
          <span className="text-xs text-semantic-textSecondary font-bold">{t('attendance.loadingData', 'جاري استرداد سجلات التسميع والحضور...')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 mb-6">
          {filteredStudents.length === 0 ? (
            <div className="card-surface rounded-2xl p-8 text-center">
              <p className="text-xs text-semantic-textSecondary font-bold m-0">
                {t('attendance.noStudentsFound', 'لا توجد بيانات مطابقة لمعايير البحث الحالية.')}
              </p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div key={student.id} className={isArchived ? "pointer-events-none opacity-80" : ""}>
                <StudentAttendanceCard 
                  student={student}
                  record={attendanceData[student.id] || {}}
                  updateStudentField={updateStudentField}
                  selectedDate={selectedDate}
                  isRtl={isRtl}
                  t={t}
                  isReadOnly={isArchived}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* 5️⃣ زر الإقرار والحفظ الثابت */}
      {!loadingFetch && filteredStudents.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-6 backdrop-blur-lg bg-semantic-bgPage/85 p-2 rounded-2xl border border-semantic-borderCard shadow-xl">
          {isArchived ? (
            <div className="p-3.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-center text-xs text-semantic-textMuted font-extrabold flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
              <span>{t('attendance.archivedReadOnlyBtn', 'الحلقة مؤرشفة - السجل متاح للعرض فقط')}</span>
            </div>
          ) : (
            <button 
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
              {isSaving 
                ? t('attendance.saving', 'جاري توثيق واعتماد البيانات...') 
                : t('attendance.saveBtn', 'اعتماد وحفظ السجل اليومي الشامل للمجموعة')
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
}
