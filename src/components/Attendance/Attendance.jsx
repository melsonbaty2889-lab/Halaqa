// src/components/Attendance/Attendance.jsx
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, GraduationCap, BookOpen, Calendar as CalendarIcon, Archive, Lock } from 'lucide-react';

import { useAttendance } from '@/hooks/useAttendance';
import PageLayout from '@/components/UI/PageLayout';
import Select from '@/components/UI/Select';
import CustomDatePicker from '@/components/UI/CustomDatePicker';

import AttendanceCard from './AttendanceCard';
import AttendanceStats from './AttendanceStats';

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

  const selectedHalaqa = halaqas.find(h => String(h.id) === String(selectedHalaqaId));
  const isArchived = Boolean(selectedHalaqa?.is_archived);

  // فحص هل اليوم مجدول للحلقة
  const checkIsScheduledDay = () => {
    if (!selectedHalaqa || !selectedHalaqa.days_of_week || !selectedDate) return false;
    const dateObj = new Date(selectedDate);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const selectedDayName = dayNames[dateObj.getDay()];
    
    return selectedHalaqa.days_of_week.some(d => String(d).toLowerCase() === selectedDayName);
  };

  const isOfficialScheduleDay = checkIsScheduledDay();

  const formatHalaqaName = useCallback((halaqa) => {
    if (!halaqa) return '';
    const currentLang = i18n?.language || 'ar';
    const nameData = halaqa.name;
    if (typeof nameData === 'object' && nameData !== null) {
      return nameData[currentLang] || nameData.ar || nameData.en || Object.values(nameData)[0] || '';
    }
    return halaqa.name_ar || halaqa.name_en || halaqa.name || String(nameData || '');
  }, [i18n?.language]);

  const halaqaOptions = [
    { value: '', label: t('attendance.allHalaqas', 'جميع الحلقات والمجموعات') },
    ...halaqas.map(h => ({
      value: h.id,
      label: `${formatHalaqaName(h)} ${h.is_archived ? `(${t('common.archived', 'مؤرشفة')})` : ''}`
    }))
  ];

  // 1️⃣ شبكة الإحصائيات
  const statsGridComponent = (
    <AttendanceStats stats={stats} />
  );

  // 2️⃣ الفلاتر المباشرة داخل PageLayout
  const filtersComponent = (
    <>
      <div className="col-span-2 md:col-span-1">
        <Select
          value={selectedHalaqaId || ''}
          onChange={setSelectedHalaqaId}
          options={halaqaOptions}
          placeholder={t('attendance.selectHalaqa', 'جميع الحلقات والمجموعات')}
          modalTitle={t('attendance.selectHalaqaModalTitle', 'اختيار الحلقة الدراسية')}
          icon={BookOpen}
        />
      </div>

      <div className="col-span-2 md:col-span-2 flex flex-col justify-center">
        <CustomDatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          icon={CalendarIcon}
        />
        {selectedHalaqaId && selectedDate && (
          <div className="text-[10px] mt-1 font-semibold px-1 flex items-center gap-1">
            {isOfficialScheduleDay ? (
              <span className="text-semantic-success flex items-center gap-1">
                ● {t('attendance.officialDay', 'يوم انعقاد مجدول لهذه الحلقة')}
              </span>
            ) : (
              <span className="text-semantic-textMuted flex items-center gap-1">
                ○ {t('attendance.extraOrArchiveDay', 'جلسة استثنائية / استعراض أرشيف')}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <PageLayout
      title={t('attendance.title', 'متابعة الجلسات والتحصيل')}
      subtitle={t('attendance.subtitle', 'إدارة وتوثيق سجلات التسميع والمراجعة والتقييم للطلاب')}
      icon={GraduationCap}
      actionButtonText={t('attendance.markAllPresent', 'تسجيل حضور القائمة')}
      onActionButtonClick={handleMarkAllPresent}
      statsGrid={statsGridComponent}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={t('attendance.searchPlaceholder', 'البحث باسم الطالب أو المعرف...')}
      filtersChildren={filtersComponent}
      totalCount={students.length}
      filteredCount={filteredStudents.length}
      countUnitText={t('common.studentUnit', 'طالب')}
      hasActiveFilters={Boolean(searchQuery || selectedHalaqaId)}
      onResetFilters={() => {
        setSearchQuery('');
        setSelectedHalaqaId('');
      }}
      isRtl={isRtl}
      t={t}
    >
      <div className="text-semantic-textPrimary pb-20 relative select-none" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* شريط تنبيه الحلقة المؤرشفة (مدمج مباشرة) */}
        {isArchived && (
          <div className="p-3.5 rounded-xl mb-4 bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textSecondary text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
            <Archive className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
            <span>
              {t(
                'attendance.archivedNotice', 
                'هذه الحلقة مؤرشفة حالياً. يمكنك استعراض السجلات القديمة فقط، وتم إيقاف إمكانية تعديل الحضور أو تسجيل التسميع.'
              )}
            </span>
          </div>
        )}

        {/* رسائل التنبيه والنتائج */}
        {message.text && (
          <div className={`p-3.5 rounded-xl mb-4 text-xs font-bold border backdrop-blur-md animate-fade-in ${
            message.type === 'success' 
              ? 'bg-semantic-successBg text-semantic-success border-semantic-successBorder' 
              : 'bg-semantic-dangerBg text-semantic-danger border-semantic-danger/30'
          } ${isRtl ? 'text-right' : 'text-left'}`}>
            {message.text}
          </div>
        )}

        {/* قائمة بطاقات الطلاب */}
        {loadingFetch ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="w-8 h-8 animate-spin text-semantic-actionPrimary" />
            <span className="text-xs text-semantic-textSecondary font-bold">{t('attendance.loadingData', 'جاري استرداد البيانات...')}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 mb-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-semantic-surfaceCard rounded-2xl p-8 text-center border border-semantic-borderCard">
                <p className="text-xs text-semantic-textSecondary font-bold m-0">
                  {t('attendance.noStudentsFound', 'لا توجد بيانات مطابقة لمعايير البحث الحالية.')}
                </p>
              </div>
            ) : (
              filteredStudents.map(student => (
                <div key={student.id} className={isArchived ? "pointer-events-none opacity-80" : ""}>
                  <AttendanceCard 
                    student={student}
                    initialData={attendanceData[student.id] || {}}
                    onSaveAttendance={(data) => {
                      updateStudentField(student.id, 'status', data.status);
                      updateStudentField(student.id, 'new_memorization', data.memorization);
                      updateStudentField(student.id, 'retention_assignment', data.review);
                      updateStudentField(student.id, 'session_grade', data.rating * 2);
                      updateStudentField(student.id, 'notes', data.notes);
                    }}
                    isRtl={isRtl}
                    t={t}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* الشريط الثابت للحفظ والاعتماد */}
        {!loadingFetch && filteredStudents.length > 0 && (
          <div className="sticky bottom-4 z-20 mt-6 backdrop-blur-lg bg-semantic-bgPage/85 p-2 rounded-2xl border border-semantic-borderCard shadow-xl">
            {isArchived ? (
              <div className="p-3.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-center text-xs text-semantic-textMuted font-extrabold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
                <span>{t('attendance.archivedReadOnlyBtn', 'الحلقة مؤرشفة - السجل متاح للعرض فقط')}</span>
              </div>
            ) : (
              <button 
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="w-full py-3 bg-semantic-actionPrimary hover:opacity-90 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                <span>
                  {isSaving 
                    ? t('attendance.saving', 'جاري توثيق واعتماد البيانات...') 
                    : t('attendance.saveBtn', 'اعتماد وحفظ السجل اليومي الشامل للمجموعة')
                  }
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
