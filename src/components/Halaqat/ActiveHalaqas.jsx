/* src/components/Halaqat/ActiveHalaqas.jsx */

import React, { useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import { useAcademySettings } from '@/hooks/useAcademySettings';

import HalaqasFilterBar from './HalaqasFilterBar';
import HalaqaCardItem from './HalaqaCardItem';
import HalaqaFormModal from './HalaqaFormModal';

const getEmptyFormData = (academyId) => ({
  name: '',
  educational_track: '',
  teacher_id: '',
  target_audience: '',
  teaching_type: '',
  start_time: '',
  end_time: '',
  max_students: '',
  academy_id: academyId || null,
  academyId: academyId || null
});

export default function ActiveHalaqas({
  halaqas = [],
  teachers = [],
  academyId = null,
  filters = {},
  setFilters,
  onCreateHalaqa,
  onUpdateHalaqa,
  onToggleArchiveHalaqa,
  onNavigateToAttendance,
  isLoading = false
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  
  // استدعاء آمن لـ useAcademySettings مع توفير بديل محلي
  const academySettings = useAcademySettings() || {};
  const externalGetLocalizedText = academySettings.getLocalizedText;

  // دالة مساعدة محلية وآمنة تماماً لاستخراج النصوص المترجمة دون أي أخطاء
  const safeGetLocalizedText = (val) => {
    if (typeof externalGetLocalizedText === 'function') {
      try {
        const res = externalGetLocalizedText(val);
        if (res) return String(res);
      } catch (e) {
        // تجاهل الخطأ والاعتصام بالبديل المحلي
      }
    }
    
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val[currentLang] || val.ar || val.en || Object.values(val)[0] || '';
    }
    return String(val);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [layoutMode, setLayoutMode] = useState('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => getEmptyFormData(academyId));

  // تحديد الـ viewMode الحالي
  const viewMode = filters.is_archived ? 'archived' : (filters.status === 'unassigned' ? 'unassigned' : 'active');

  const setViewMode = (mode) => {
    if (typeof setFilters === 'function') {
      if (mode === 'archived') {
        setFilters((prev) => ({ ...(prev || {}), is_archived: true, status: 'all' }));
      } else if (mode === 'unassigned') {
        setFilters((prev) => ({ ...(prev || {}), is_archived: false, status: 'unassigned' }));
      } else {
        setFilters((prev) => ({ ...(prev || {}), is_archived: false, status: 'all' }));
      }
    }
  };

  // حساب الإحصائيات بأمان
  const stats = useMemo(() => {
    let totalActive = 0;
    let totalArchived = 0;
    let unassigned = 0;

    if (Array.isArray(halaqas)) {
      halaqas.forEach((h) => {
        if (!h) return;
        if (h.is_archived) {
          totalArchived++;
        } else {
          totalActive++;
          if (!h.teacher_id && !h.teacher_name && !h.teacher) {
            unassigned++;
          }
        }
      });
    }

    return { totalActive, totalArchived, unassigned };
  }, [halaqas]);

  // الفلترة المحلية الفورية والآمنة
  const filteredHalaqas = useMemo(() => {
    if (!Array.isArray(halaqas)) return [];

    return halaqas.filter((halaqa) => {
      if (!halaqa) return false;
      const isArchived = Boolean(halaqa.is_archived);

      // 1. فلترة حسب تبويب العرض الحالي
      if (viewMode === 'archived' && !isArchived) return false;
      if (viewMode === 'active' && isArchived) return false;
      if (viewMode === 'unassigned') {
        if (isArchived) return false;
        const hasTeacher = Boolean(halaqa.teacher_id || halaqa.teacher_name || halaqa.teacher);
        if (hasTeacher) return false;
      }

      // 2. فلترة المسار التعليمي
      const trackVal = halaqa.educational_track || halaqa.track;
      if (selectedTrack !== 'all' && trackVal !== selectedTrack) {
        return false;
      }

      // 3. فلترة البحث بشكل آمن ومحمي
      if (typeof searchQuery === 'string' && searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const nameStr = safeGetLocalizedText(halaqa.name).toLowerCase();
        const teacherData = halaqa.teacher_name || halaqa.teacher;
        const teacherStr = safeGetLocalizedText(teacherData).toLowerCase();

        return nameStr.includes(query) || teacherStr.includes(query);
      }

      return true;
    });
  }, [halaqas, viewMode, selectedTrack, searchQuery, currentLang]);

  const handleOpenCreateModal = () => {
    setFormData(getEmptyFormData(academyId));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (halaqa) => {
    if (!halaqa) return;
    setFormData({
      id: halaqa.id,
      name: halaqa.name,
      name_text: typeof halaqa.name === 'string' ? halaqa.name : '',
      educational_track: halaqa.educational_track || halaqa.track || 'hifz',
      teacher_id: halaqa.teacher_id || '',
      target_audience: halaqa.target_audience || 'kids',
      teaching_type: halaqa.teaching_type || halaqa.type || 'online',
      start_time: halaqa.start_time || '',
      end_time: halaqa.end_time || '',
      max_students: halaqa.max_students || '',
      timezone: halaqa.timezone || '',
      academy_id: halaqa.academy_id || halaqa.academyId || academyId,
      academyId: halaqa.academy_id || halaqa.academyId || academyId
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const baseData = payload || formData;
      const resolvedAcademyId = baseData.academy_id || baseData.academyId || academyId;

      const dataToSave = {
        ...baseData,
        educational_track: baseData.educational_track || 'hifz',
        target_audience: baseData.target_audience || 'kids',
        teaching_type: baseData.teaching_type || 'online',
        academy_id: resolvedAcademyId,
        academyId: resolvedAcademyId
      };

      if (!dataToSave.id && typeof onCreateHalaqa !== 'function') {
        alert(t('errorNoCreateFunc', 'خطأ: لم يتم ربط دالة الإنشاء onCreateHalaqa بالمكون!'));
        return;
      }

      let res;
      if (dataToSave.id) {
        res = await onUpdateHalaqa?.(dataToSave);
      } else {
        res = await onCreateHalaqa?.(dataToSave);
      }

      if (res && res.success === false) {
        alert(t('errorCreateFailed', 'فشلت عملية حفظ الحلقة: ') + (res.error || t('unknownError', 'خطأ غير معروف')));
      } else {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to save halaqa:', error);
      alert(t('errorOccurred', 'حدث خطأ أثناء الحفظ: ') + (error?.message || error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-5 pt-3 pb-12 bg-app-layout">
      {/* زر إضافة حلقة */}
      <button
        type="button"
        onClick={handleOpenCreateModal}
        className={`${UI.btnPrimary} w-full py-3.5 font-extrabold text-sm flex items-center justify-center gap-2 relative z-10 shadow-lg`}
      >
        <Plus size={18} />
        <span>{t('createNewHalaqaBtn', 'إضافة حلقة جديدة')}</span>
      </button>

      {/* شريط الفلترة */}
      <HalaqasFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTrack={selectedTrack}
        setSelectedTrack={setSelectedTrack}
        viewMode={viewMode}
        setViewMode={setViewMode}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        stats={stats}
      />

      {/* عرض القائمة أو الشبكة */}
      {filteredHalaqas.length > 0 ? (
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'
              : 'flex flex-col gap-3 w-full'
          }
        >
          {filteredHalaqas.map((halaqa) => (
            <HalaqaCardItem
              key={halaqa.id}
              halaqa={halaqa}
              viewMode={viewMode}
              layoutMode={layoutMode}
              getLocalizedText={safeGetLocalizedText}
              onNavigateToAttendance={onNavigateToAttendance}
              onToggleArchiveHalaqa={onToggleArchiveHalaqa}
              onEditHalaqa={handleOpenEditModal}
            />
          ))}
        </div>
      ) : (
        <div className={`${UI.card} text-center py-12 px-4 flex flex-col items-center justify-center`}>
          <div className="p-4 rounded-2xl bg-semantic-surfaceInput/80 mb-3 border border-semantic-borderCard">
            <Users size={32} className="text-semantic-textMuted opacity-70" />
          </div>
          <h3 className="text-base font-bold text-semantic-textPrimary mb-1">
            {t('noHalaqasFound', 'لا توجد حلقات للعرض')}
          </h3>
          <p className="text-xs text-semantic-textSecondary max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? t('noSearchResults', 'لم نجد أي حلقات تطابق بحثك الحالي.')
              : t('noHalaqasInView', 'لا توجد حلقات ينطبق عليها هذا الفلتر حالياً.')}
          </p>
        </div>
      )}

      <HalaqaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        teachers={teachers}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
