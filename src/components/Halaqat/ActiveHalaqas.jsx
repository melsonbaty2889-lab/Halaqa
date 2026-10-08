import React, { useState, useMemo } from 'react';
import { Plus, Users, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import { useAcademySettings } from '@/hooks/useAcademySettings';

import HalaqasFilterBar from './HalaqasFilterBar';
import HalaqaCardItem from './HalaqaCardItem';
import HalaqaFormModal from './HalaqaFormModal';

export default function ActiveHalaqas({
  halaqas = [],
  teachers = [],
  onCreateHalaqa,
  onToggleArchiveHalaqa,
  onNavigateToAttendance,
  isLoading = false
}) {
  const { t } = useTranslation();
  const { getLocalizedText } = useAcademySettings();

  // حالات البحث والفلترة والعرض
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'unassigned' | 'archived'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'

  // حالة النافذة المنبثقة ورسائل النموذج
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    track: 'hifz',
    teacher_id: '',
    target_audience: 'kids',
    type: 'online',
    start_time: '',
    end_time: ''
  });

  // 1. حساب الإحصائيات سريعا
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

  // 2. تصفية الحلقات بناءً على البحث والتبويب والمسار
  const filteredHalaqas = useMemo(() => {
    return halaqas.filter((halaqa) => {
      // الفلترة حسب حالة التبويب
      if (viewMode === 'archived' && !halaqa.is_archived) return false;
      if (viewMode === 'active' && halaqa.is_archived) return false;
      if (viewMode === 'unassigned') {
        if (halaqa.is_archived) return false;
        const hasTeacher = Boolean(halaqa.teacher_id || halaqa.teacher_name || halaqa.teacher);
        if (hasTeacher) return false;
      }

      // الفلترة حسب المسار التعليمي
      if (selectedTrack !== 'all' && halaqa.track !== selectedTrack) {
        return false;
      }

      // الفلترة حسب نص البحث (اسم الحلقة أو المعلم)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameStr = String(getLocalizedText(halaqa.name) || '').toLowerCase();
        const teacherData = halaqa.teacher_name || halaqa.teacher;
        const teacherStr = String(getLocalizedText(teacherData) || '').toLowerCase();

        return nameStr.includes(query) || teacherStr.includes(query);
      }

      return true;
    });
  }, [halaqas, viewMode, selectedTrack, searchQuery, getLocalizedText]);

  // فتح وإغلاق النافذة المنبثقة
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      track: 'hifz',
      teacher_id: '',
      target_audience: 'kids',
      type: 'online',
      start_time: '',
      end_time: ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onCreateHalaqa?.(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save halaqa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* رأس الصفحة وزر إنشاء حلقة جديدة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-semantic-borderCard">
        <div>
          <h2 className="text-lg font-black text-semantic-textPrimary flex items-center gap-2 m-0">
            <BookOpen className="text-semantic-actionPrimary" size={20} />
            {t('activeHalaqasTitle', 'إدارة الحلقات والفصول')}
          </h2>
          <p className="text-xs text-semantic-textMuted mt-1 mb-0">
            {t('activeHalaqasSub', 'متابعة الحلقات النشطة والمؤرشفة وتعيين المعلمين')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className={`${UI.btnPrimary} py-2 px-4 text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0`}
        >
          <Plus size={16} />
          <span>{t('createNewHalaqaBtn', 'إضافة حلقة جديدة')}</span>
        </button>
      </div>

      {/* شريط الفلترة والبحث والتبويبات */}
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

      {/* عرض الحلقات أو القائمة الفارغة */}
      {filteredHalaqas.length > 0 ? (
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filteredHalaqas.map((halaqa) => (
            <HalaqaCardItem
              key={halaqa.id}
              halaqa={halaqa}
              viewMode={viewMode}
              getLocalizedText={getLocalizedText}
              onNavigateToAttendance={onNavigateToAttendance}
              onToggleArchiveHalaqa={onToggleArchiveHalaqa}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-semantic-surfaceInput/30 rounded-2xl border border-dashed border-semantic-borderCard">
          <Users size={36} className="mx-auto text-semantic-textMuted mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-semantic-textPrimary mb-1">
            {t('noHalaqasFound', 'لا توجد حلقات للعرض')}
          </h3>
          <p className="text-xs text-semantic-textMuted max-w-sm mx-auto">
            {searchQuery
              ? t('noSearchResults', 'لم نجد أي حلقات تطابق بحثك الحالي.')
              : t('noHalaqasInView', 'لا توجد حلقات ينطبق عليها هذا الفلتر حالياً.')}
          </p>
        </div>
      )}

      {/* النافذة المنبثقة لإنشاء وتعديل الحلقة */}
      <HalaqaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        teachers={teachers}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
