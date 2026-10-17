// src/components/Attendance/Attendance.jsx
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, Search, Archive, Lock } from 'lucide-react';

import { useAttendance } from '@/hooks/useAttendance';
import StudentAttendanceCard from '@/components/Student/StudentAttendanceCard';
import Input from '@/components/UI/Input';
import PageLayout from '@/components/UI/PageLayout';

import AttendanceHeader from './AttendanceHeader';
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

  // فحص هل التاريخ الحالي يوافق يوم مجدول للحلقة
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

  return (
    <PageLayout dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-semantic-textPrimary p-1 font-cairo leading-relaxed pb-28 relative select-none">
        
        {/* 1️⃣ الترويسة وشريط اختيار الحلقة والتاريخ الموحد */}
        <AttendanceHeader
          halaqas={halaqas}
          selectedHalaqaId={selectedHalaqaId}
          setSelectedHalaqaId={setSelectedHalaqaId}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          formatHalaqaName={formatHalaqaName}
          isOfficialScheduleDay={isOfficialScheduleDay}
        />

        {/* 2️⃣ تنبيه الحلقة المؤرشفة (في حال اختيار حلقة مؤرشفة) */}
        {isArchived && (
          <div className="p-3.5 rounded-xl mb-5 bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textSecondary text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
            <Archive className="w-4 h-4 text-semantic-actionPrimary shrink-0" />
            <span>
              {t('attendance.archivedNotice', 'هذه الحلقة مؤرشفة حالياً. يمكنك استعراض السجلات القديمة فقط، وتم إيقاف إمكانية تعديل الحضور أو تسجيل التسميع.')}
            </span>
          </div>
        )}

        {/* 3️⃣ لوحة الإحصائيات والتحضير السريع */}
        <AttendanceStats
          stats={stats}
          handleMarkAllPresent={handleMarkAllPresent}
          disabledMarkAll={filteredStudents.length === 0 || isArchived}
        />

        {/* 4️⃣ حقل البحث الموحد */}
        <div className="mb-5">
          <Input 
            type="text"
            icon={Search}
            placeholder={t('attendance.searchPlaceholder', 'البحث عن طالب بالنص أو المعرف...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* رسائل التنبيهات */}
        {message.text && (
          <div className={`p-3.5 rounded-xl mb-5 text-xs font-bold border backdrop-blur-md animate-fade-in ${
            message.type === 'success' 
              ? 'bg-semantic-successBg text-semantic-success border-semantic-successBorder' 
              : 'bg-semantic-dangerBg text-semantic-danger border-semantic-danger/30'
          } ${isRtl ? 'text-right' : 'text-left'}`}>
            {message.text}
          </div>
        )}

        {/* 5️⃣ قائمة بطاقات الطلاب والتسميع */}
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

        {/* 6️⃣ الشريط الثابت للحفظ والتوثيق النهائي */}
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
    </PageLayout>
  );
}
