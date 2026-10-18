/* src/components/Halaqat/HalaqasManager.jsx */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import PageLayout from '@/components/UI/PageLayout';
import Select from '@/components/UI/Select';

import HalaqaCardItem from './HalaqaCardItem';
import HalaqaFormModal from './HalaqaFormModal';

export default function HalaqasManager({ 
  halaqas = [], 
  teachers = [], 
  academyId, 
  onRefresh, 
  isRtl, 
  isMobile,
  onCreateHalaqa,
  onUpdateHalaqa,
  onToggleArchiveHalaqa,
  onNavigateToAttendance
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHalaqa, setEditingHalaqa] = useState(null);

  const safeHalaqas = Array.isArray(halaqas) ? halaqas : [];

  const stats = {
    total: safeHalaqas.length,
    active: safeHalaqas.filter(h => h && h.is_active !== false && !h.is_archived).length,
    noTeacher: safeHalaqas.filter(h => h && !h.teacher_id && !h.is_archived).length,
    archived: safeHalaqas.filter(h => h && h.is_archived === true).length
  };

  const filteredHalaqas = safeHalaqas.filter(item => {
    if (!item) return false;

    let rawName = '';
    if (typeof item.name === 'object' && item.name !== null) {
      rawName = item.name[currentLang] || item.name.ar || item.name.en || Object.values(item.name)[0] || '';
    } else if (typeof item.name === 'string') {
      rawName = item.name;
    } else if (typeof item.name_text === 'string') {
      rawName = item.name_text;
    }

    const safeSearchQuery = (searchQuery || '').toString().toLowerCase();
    const safeName = (rawName || '').toString().toLowerCase();

    const matchesSearch = safeName.includes(safeSearchQuery);

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = item.is_active !== false && !item.is_archived;
    if (statusFilter === 'no_teacher') matchesStatus = !item.teacher_id && !item.is_archived;
    if (statusFilter === 'archived') matchesStatus = item.is_archived === true;

    return matchesSearch && matchesStatus;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = Boolean((searchQuery || '').trim()) || statusFilter !== 'all';

  const statusOptions = [
    { label: t('halaqas.all_status', 'جميع الحلقات'), value: 'all' },
    { label: t('halaqas.active', 'الحلقات النشطة'), value: 'active' },
    { label: t('halaqas.no_teacher', 'بدون معلم'), value: 'no_teacher' },
    { label: t('common.archived', 'المؤرشفة'), value: 'archived' }
  ];

  const handleEditHalaqa = (item) => {
    if (!item) return;

    const nameText = typeof item?.name === 'object' && item?.name !== null
      ? (item.name[currentLang] || item.name.ar || item.name.en || '') 
      : (item?.name || item?.name_text || '');

    setEditingHalaqa({
      ...item,
      id: item.id,
      name_text: nameText,
      name: item.name,
      days_of_week: Array.isArray(item.days_of_week) ? item.days_of_week : [],
      educational_track: item.educational_track || 'hifz',
      teaching_type: item.teaching_type || 'online',
      target_audience: item.target_audience || 'kids',
      teacher_id: item.teacher_id || '',
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      max_students: item.max_students || 15
    });
    setIsAddModalOpen(true);
  };

    const handleModalSubmit = async (payload) => {
    try {
      if (editingHalaqa?.id) {
        if (onUpdateHalaqa) {
          await onUpdateHalaqa(editingHalaqa.id, payload);
        }
      } else {
        if (onCreateHalaqa) {
          await onCreateHalaqa(payload);
        }
      }
      setIsAddModalOpen(false);
      setEditingHalaqa(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error submitting halaqa form:", err);
    }
  };
  
  const getEmptyStateMessage = () => {
    if ((searchQuery || '').trim() !== '') return t('no_search_results', 'لم يتم العثور على حلقات تطابق البحث.');
    if (statusFilter === 'no_teacher') return t('halaqas.no_unassigned_halaqas', 'لا توجد حلقات بدون معلم حالياً.');
    if (statusFilter === 'archived') return t('halaqas.no_archived_halaqas', 'لا توجد حلقات مؤرشفة.');
    if (statusFilter === 'active') return t('halaqas.no_active_halaqas', 'لا توجد حلقات نشطة حالياً.');
    return t('halaqas.no_halaqas', 'لا توجد حلقات مضافة بعد.');
  };

  return (
    <>
      <PageLayout
        title={t('halaqas.title', 'إدارة الحلقات والفصول')}
        subtitle={t('halaqas.subtitle', 'تنظيم وتوزيع الطلاب والمعلمين على الحلقات')}
        icon={BookOpen}
        actionButtonText={t('halaqas.add_new', 'إنشاء حلقة جديدة')}
        onActionButtonClick={() => {
          setEditingHalaqa(null);
          setIsAddModalOpen(true);
        }}
        statsGrid={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div 
              onClick={() => setStatusFilter('all')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${
                statusFilter === 'all' 
                  ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary' 
                  : 'border-semantic-borderCard hover:border-semantic-borderCard/80'
              }`}
            >
              <div className={`absolute top-0 start-0 end-0 h-1 transition-colors ${
                statusFilter === 'all' ? 'bg-semantic-actionPrimary' : 'bg-transparent'
              }`}></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('halaqas.total', 'إجمالي الحلقات')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-textPrimary mt-1">{stats.total}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('active')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${
                statusFilter === 'active' 
                  ? 'border-semantic-success ring-1 ring-semantic-success' 
                  : 'border-semantic-borderCard hover:border-semantic-borderCard/80'
              }`}
            >
              <div className={`absolute top-0 start-0 end-0 h-1 transition-colors ${
                statusFilter === 'active' ? 'bg-semantic-success' : 'bg-transparent'
              }`}></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('halaqas.active', 'الحلقات النشطة')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-success mt-1">{stats.active}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('no_teacher')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${
                statusFilter === 'no_teacher' 
                  ? 'border-semantic-warning ring-1 ring-semantic-warning' 
                  : 'border-semantic-borderCard hover:border-semantic-borderCard/80'
              }`}
            >
              <div className={`absolute top-0 start-0 end-0 h-1 transition-colors ${
                statusFilter === 'no_teacher' ? 'bg-semantic-warning' : 'bg-transparent'
              }`}></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('halaqas.no_teacher', 'بدون معلم')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-warning mt-1">{stats.noTeacher}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('archived')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${
                statusFilter === 'archived' 
                  ? 'border-semantic-error ring-1 ring-semantic-error' 
                  : 'border-semantic-borderCard hover:border-semantic-borderCard/80'
              }`}
            >
              <div className={`absolute top-0 start-0 end-0 h-1 transition-colors ${
                statusFilter === 'archived' ? 'bg-semantic-error' : 'bg-transparent'
              }`}></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('common.archived', 'المؤرشفة')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-error mt-1">{stats.archived}</p>
            </div>
          </div>
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('halaqas.search_placeholder', 'ابحث باسم الحلقة...')}
        filtersChildren={
          <div className="relative z-30 col-span-2 md:col-span-1">
            <Select
              title={t('halaqas.filter_status_title', 'حالة الحلقة')}
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder={t('halaqas.select_status', 'اختر الحالة...')}
            />
          </div>
        }
        totalCount={stats.total}
        filteredCount={filteredHalaqas.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onRefresh={onRefresh}
        countUnitText={t('common.halaqaUnit', 'حلقة')}
        isLoading={false}
        isRtl={isRtl}
        t={t}
      >
        {filteredHalaqas.length === 0 ? (
          <div className="text-center py-12 bg-semantic-surfaceCard rounded-2xl border border-semantic-borderCard space-y-3">
            <BookOpen className="w-12 h-12 text-semantic-textSecondary opacity-60 mx-auto" />
            <p className="text-semantic-textSecondary font-medium text-sm">
              {getEmptyStateMessage()}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-0">
            {filteredHalaqas.map((halaqa) => (
              <HalaqaCardItem
                key={halaqa?.id || Math.random()}
                halaqa={halaqa}
                teachers={teachers}
                onEdit={handleEditHalaqa}
                onToggleArchive={onToggleArchiveHalaqa}
                onNavigateToAttendance={onNavigateToAttendance}
              />
            ))}
          </div>
        )}
      </PageLayout>

      {isAddModalOpen && (
        <HalaqaFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingHalaqa(null);
          }}
          formData={editingHalaqa || {}}
          setFormData={setEditingHalaqa}
          handleSubmit={handleModalSubmit}
          teachers={teachers}
          academyId={academyId}
        />
      )}
    </>
  );
}
