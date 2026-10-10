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
  onCreateHalaqa,
  onUpdateHalaqa,
  onToggleArchiveHalaqa,
  onNavigateToAttendance,
  isLoading = false
}) {
  const { t } = useTranslation();
  const { getLocalizedText } = useAcademySettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active');
  const [layoutMode, setLayoutMode] = useState('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => getEmptyFormData(academyId));

  const stats = useMemo(() => {
    let totalActive = 0;
    let totalArchived = 0;
    let unassigned = 0;

    halaqas.forEach((h) => {
      if (h.is_archived) {
        totalArchived++;
      } else {
        totalActive++;
        if (!h.teacher_id && !h.teacher_name && !h.teacher) {
          unassigned++;
        }
      }
    });

    return { totalActive, totalArchived, unassigned };
  }, [halaqas]);

  const filteredHalaqas = useMemo(() => {
    return halaqas.filter((halaqa) => {
      if (viewMode === 'archived' && !halaqa.is_archived) return false;
      if (viewMode === 'active' && halaqa.is_archived) return false;
      if (viewMode === 'unassigned') {
        if (halaqa.is_archived) return false;
        const hasTeacher = Boolean(halaqa.teacher_id || halaqa.teacher_name || halaqa.teacher);
        if (hasTeacher) return false;
      }

      const trackVal = halaqa.educational_track || halaqa.track;
      if (selectedTrack !== 'all' && trackVal !== selectedTrack) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameStr = String(getLocalizedText(halaqa.name) || halaqa.name_text || '').toLowerCase();
        const teacherData = halaqa.teacher_name || halaqa.teacher;
        const teacherStr = String(getLocalizedText(teacherData) || '').toLowerCase();

        return nameStr.includes(query) || teacherStr.includes(query);
      }

      return true;
    });
  }, [halaqas, viewMode, selectedTrack, searchQuery, getLocalizedText]);

  const handleOpenCreateModal = () => {
    setFormData(getEmptyFormData(academyId));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (halaqa) => {
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

      if (!dataToSave.id && !onCreateHalaqa) {
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
      {/* زر إضافة حلقة مميز وسلس */}
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

      {/* شبكة/قائمة العرض الاستجابة المحدثة */}
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
              getLocalizedText={getLocalizedText}
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
