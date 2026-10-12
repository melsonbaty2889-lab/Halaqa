/* src/components/Halaqat/HalaqasManager.jsx */

import React, { useState, useMemo } from 'react';
import { Plus, Users, Archive, CheckCircle2 } from 'lucide-react';
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

export default function HalaqasManager({
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
  
  const academySettings = useAcademySettings() || {};
  const externalGetLocalizedText = academySettings.getLocalizedText;

  const safeGetLocalizedText = (val) => {
    if (typeof externalGetLocalizedText === 'function') {
      try {
        const res = externalGetLocalizedText(val);
        if (res) return String(res);
      } catch (e) {}
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => getEmptyFormData(academyId));

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

  // الفلترة المحلية الفورية
  const filteredHalaqas = useMemo(() => {
    if (!Array.isArray(halaqas)) return [];

    return halaqas.filter((halaqa) => {
      if (!halaqa) return false;
      const isArchived = Boolean(halaqa.is_archived);

      if (viewMode === 'archived' && !isArchived) return false;
      if (viewMode === 'active' && isArchived) return false;
      if (viewMode === 'unassigned') {
        if (isArchived) return false;
        const hasTeacher = Boolean(halaqa.teacher_id || halaqa.teacher_name || halaqa.teacher);
        if (hasTeacher) return false;
      }

      const trackVal = halaqa.educational_track || halaqa.track;
      if (selectedTrack !== 'all' && trackVal !== selectedTrack) {
        return false;
      }

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

  // التحقق الفوري هل يوجد نصوص تطابق البحث في التبويبات الأخرى
  const otherTabsSearchResult = useMemo(() => {
    if (!searchQuery?.trim() || filteredHalaqas.length > 0 || !Array.isArray(halaqas)) {
      return null;
    }

    const query = searchQuery.trim().toLowerCase();
    
    if (viewMode !== 'archived') {
      const archivedMatch = halaqas.find((h) => {
        if (!h?.is_archived) return false;
        const nameStr = safeGetLocalizedText(h.name).toLowerCase();
        const teacherStr = safeGetLocalizedText(h.teacher_name || h.teacher).toLowerCase();
        return nameStr.includes(query) || teacherStr.includes(query);
      });

      if (archivedMatch) {
        return {
          targetMode: 'archived',
          label: t('searchInArchivedSuggestion', 'عُثر على نتائج متطابقة في الأرشيف!'),
          btnText: t('switchToArchivedBtn', 'الانتقال إلى التبويب المؤرشف'),
          icon: Archive
        };
      }
    }

    if (viewMode === 'archived') {
      const activeMatch = halaqas.find((h) => {
        if (h?.is_archived) return false;
        const nameStr = safeGetLocalizedText(h.name).toLowerCase();
        const teacherStr = safeGetLocalizedText(h.teacher_name || h.teacher).toLowerCase();
        return nameStr.includes(query) || teacherStr.includes(query);
      });

      if (activeMatch) {
        return {
          targetMode: 'active',
          label: t('searchInActiveSuggestion', 'عُثر على نتائج متطابقة في الحلقات النشطة!'),
          btnText: t('switchToActiveBtn', 'الانتقال إلى الحلقات النشطة'),
          icon: CheckCircle2
        };
      }
    }

    return null;
  }, [searchQuery, filteredHalaqas, halaqas, viewMode, t]);

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
        stats={stats}
      />

      {/* حاوية العرض المتجاوبة بنمط الشبكة القياسي الموحد */}
      {filteredHalaqas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {filteredHalaqas.map((halaqa) => (
            <HalaqaCardItem
              key={halaqa.id}
              halaqa={halaqa}
              teachers={teachers}
              viewMode={viewMode}
              getLocalizedText={safeGetLocalizedText}
              onNavigateToAttendance={onNavigateToAttendance}
              onToggleArchiveHalaqa={onToggleArchiveHalaqa}
              onEditHalaqa={handleOpenEditModal}
              onUpdateHalaqa={onUpdateHalaqa}
            />
          ))}
        </div>
      ) : (
        <div className={`${UI.card} text-center py-12 px-4 flex flex-col items-center justify-center space-y-3`}>
          <div className="p-4 rounded-2xl bg-semantic-surfaceInput/80 border border-semantic-borderCard">
            <Users size={32} className="text-semantic-textMuted opacity-70" />
          </div>
          <div>
            <h3 className="text-base font-bold text-semantic-textPrimary mb-1">
              {t('noHalaqasFound', 'لا توجد حلقات للعرض')}
            </h3>
            <p className="text-xs text-semantic-textSecondary max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? t('noSearchResults', 'لم نجد أي حلقات تطابق بحثك الحالي في هذا التبويب.')
                : t('noHalaqasInView', 'لا توجد حلقات ينطبق عليها هذا الفلتر حالياً.')}
            </p>
          </div>

          {otherTabsSearchResult && (
            <div className="pt-2 animate-fade-in">
              <div className="p-3 bg-semantic-actionPrimary/10 border border-semantic-actionPrimary/30 rounded-xl max-w-sm mx-auto space-y-2">
                <p className="text-xs font-bold text-semantic-actionPrimary flex items-center justify-center gap-1.5">
                  {React.createElement(otherTabsSearchResult.icon, { size: 14 })}
                  <span>{otherTabsSearchResult.label}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode(otherTabsSearchResult.targetMode)}
                  className="w-full py-2 px-3 bg-semantic-actionPrimary text-white font-bold text-xs rounded-lg shadow-sm hover:opacity-90 transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{otherTabsSearchResult.btnText}</span>
                </button>
              </div>
            </div>
          )}
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
