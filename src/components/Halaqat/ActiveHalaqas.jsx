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
  onUpdateHalaqa,
  onToggleArchiveHalaqa,
  onNavigateToAttendance,
  isLoading = false
}) {
  const { t } = useTranslation();
  const { getLocalizedText } = useAcademySettings();

  // حالات البحث والفلترة والعرض
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active');
  const [layoutMode, setLayoutMode] = useState('grid');

  // حالة النافذة المنبثقة ورسائل النموذج
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    educational_track: 'hifz',
    teacher_id: '',
    target_audience: 'kids',
    teaching_type: 'online',
    start_time: '',
    end_time: ''
  });

  // حساب الإحصائيات
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

  // تصفية الحلقات
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

  // فتح النافذة بوضع الإنشاء
  const handleOpenCreateModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormData({
      name: '',
      educational_track: 'hifz',
      teacher_id: '',
      target_audience: 'kids',
      teaching_type: 'online',
      start_time: '',
      end_time: ''
    });
    setIsModalOpen(true);
  };

  // فتح النافذة بوضع التعديل
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
      max_students: halaqa.max_students || 10,
      timezone: halaqa.timezone || 'Africa/Cairo'
    });
    setIsModalOpen(true);
  };

  // معالجة الحفظ الموحدة
  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const dataToSave = payload || formData;
      if (dataToSave.id) {
        await onUpdateHalaqa?.(dataToSave);
      } else {
        await onCreateHalaqa?.(dataToSave);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save halaqa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pt-2 pb-8 bg-app-layout">
      {/* رأس الصفحة الاحترافي الموحد متوافق مع كافة الشاشات */}
      <div className={`${UI.card} flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5`}>
        <div className="flex items-center gap-3">
          <div className={UI.logoWrapper}>
            <BookOpen className="w-6 h-6 text-semantic-success" />
          </div>
          <div>
            <h1 className={UI.title}>
              {t('halaqasManagementTitle', 'إدارة الحلقات والفصول')}
            </h1>
            <p className={UI.subtitle}>
              {t('activeHalaqasSub', 'متابعة الحلقات النشطة والمؤرشفة وتعيين المعلمين')}
            </p>
          </div>
        </div>

        {/* توحيد نوع الزر الرئيسي ليكون UI.btnPrimary بدلاً من btnEmerald */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className={`${UI.btnPrimary} w-full sm:w-auto shrink-0`}
        >
          <Plus size={18} />
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

      {/* النافذة المنبثقة */}
      <HalaqaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        handleSubmit={handleFormSubmit}
        onSave={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        teachers={teachers}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
