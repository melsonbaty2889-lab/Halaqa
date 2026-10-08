import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Layers, Users, 
  Grid, List, CheckCircle2, Archive, Clock, X 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HalaqaCardItem from './HalaqaCardItem';
import HalaqaFormModal from './HalaqaFormModal';
import { UI } from '@/theme/styles';
import { Input, Select, EmptyState } from '@/components/UI';
import { useAcademySettings } from '@/hooks/useAcademySettings';

export default function ActiveHalaqas({
  currentAcademyId,
  halaqas = [],
  teachers = [],
  getLocalizedText,
  onNavigateToAttendance,
  onToggleArchiveHalaqa,
  onCreateHalaqa
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = i18n?.dir?.() === 'rtl' || currentLang === 'ar';

  const { formData: academySettings } = useAcademySettings(currentAcademyId, isRtl);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived' | 'unassigned'
  const [layoutMode, setLayoutMode] = useState('grid');
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialFormData = () => ({
    name: {},
    teacher_id: '',
    educational_track: 'hifz',
    target_audience: 'all',
    start_time: '',
    end_time: '',
    max_students: academySettings?.max_students_per_group || 25,
    timezone: academySettings?.timezone || 'Africa/Cairo'
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const handleOpenModal = () => {
    setFormData(getInitialFormData());
    setShowFormModal(true);
  };

  const resolveText = (value) => {
    if (!value) return '';
    if (typeof getLocalizedText === 'function') {
      try {
        return getLocalizedText(value) || '';
      } catch (e) {
        console.warn('Error executing getLocalizedText:', e);
      }
    }
    if (typeof value === 'object' && value !== null) {
      return value[currentLang] || value.ar || value.en || '';
    }
    return typeof value === 'string' ? value : '';
  };

  const filteredHalaqas = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return (Array.isArray(halaqas) ? halaqas : []).filter(halaqa => {
      if (!halaqa) return false;
      
      let viewMatch = true;
      if (viewMode === 'archived') {
        viewMatch = Boolean(halaqa.is_archived);
      } else if (viewMode === 'unassigned') {
        viewMatch = !halaqa.is_archived && !halaqa.teacher_id && !halaqa.teacher_name && !halaqa.teacher;
      } else {
        viewMatch = !halaqa.is_archived;
      }

      const trackMatch = selectedTrack === 'all' || halaqa.educational_track === selectedTrack;
      
      if (!viewMatch || !trackMatch) return false;
      if (!query) return true;

      const localizedName = resolveText(halaqa.name).toLowerCase();
      const localizedTeacher = resolveText(halaqa.teacher_name || halaqa.teacher).toLowerCase();

      return localizedName.includes(query) || localizedTeacher.includes(query);
    });
  }, [halaqas, viewMode, selectedTrack, searchQuery, getLocalizedText, currentLang]);

  const stats = useMemo(() => {
    const list = Array.isArray(halaqas) ? halaqas : [];
    return {
      totalActive: list.filter(h => !h?.is_archived).length,
      totalArchived: list.filter(h => h?.is_archived).length,
      unassigned: list.filter(h => !h?.teacher_id && !h?.teacher_name && !h?.teacher && !h?.is_archived).length
    };
  }, [halaqas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateHalaqa?.(formData);
      setShowFormModal(false);
      setFormData(getInitialFormData());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTrack('all');
  };

  const trackOptions = [
    { value: 'all', label: t('allTracks', 'جميع المسارات التعليمية') },
    { value: 'hifz', label: t('trackHifz', 'الحفظ الجديد والتجويد المكثف') },
    { value: 'review', label: t('trackReview', 'المراجعة والتثبيت') },
    { value: 'tilawah', label: t('trackTilawah', 'التلاوة وتصحيح القراءة') },
    { value: 'ijazah', label: t('trackIjazah', 'الإجازة بالسند المتصل') }
  ];

  const extractValue = (val) => {
    if (val && typeof val === 'object' && 'target' in val) {
      return val.target.value;
    }
    return val;
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedTrack !== 'all';

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto space-y-4 text-semantic-textPrimary">
      
      {/* --- السطر الأول: العنوان المختصر وزر الإنشاء --- */}
      <div className="flex items-center justify-between gap-3 border-b border-semantic-borderCard/50 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-semantic-textPrimary m-0">
              {t('halaqatTitle', 'الحلقات والفصول')}
            </h1>
            <p className="text-[11px] text-semantic-textMuted m-0 hidden sm:block">
              {t('halaqatSubTitle', 'متابعة وإدارة الجلسات التعليمية وتوزيع الطلاب')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className={`${UI.btnPrimary} px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 rounded-xl`}
        >
          <Plus size={16} />
          <span>{t('createHalaqa', 'حلقة جديدة')}</span>
        </button>
      </div>

      {/* --- السطر الثاني: أزرار التصفية الرئيسية (Tabs) --- */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-semantic-surfaceInput rounded-2xl border border-semantic-borderCard">
        <button
          type="button"
          onClick={() => setViewMode('active')}
          className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
            viewMode === 'active'
              ? 'bg-semantic-bgMain text-semantic-actionPrimary shadow-sm'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>{t('statActive', 'النشطة')}</span>
          <span className="bg-semantic-actionPrimary/15 text-semantic-actionPrimary px-1.5 py-0.2 rounded-full text-[10px]">
            {stats.totalActive}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('unassigned')}
          className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
            viewMode === 'unassigned'
              ? 'bg-semantic-bgMain text-semantic-actionPrimary shadow-sm'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <Users size={14} />
          <span>{t('statUnassigned', 'بلا معلم')}</span>
          <span className="bg-semantic-borderCard text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px]">
            {stats.unassigned}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('archived')}
          className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
            viewMode === 'archived'
              ? 'bg-semantic-bgMain text-semantic-actionPrimary shadow-sm'
              : 'bg-transparent text-semantic-textMuted hover:text-semantic-textPrimary'
          }`}
        >
          <Archive size={14} />
          <span>{t('statArchived', 'المؤرشفة')}</span>
          <span className="bg-semantic-borderCard text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px]">
            {stats.totalArchived}
          </span>
        </button>
      </div>

      {/* --- عناصر التصفية الثانوية: البحث والمسارات وزر العرض --- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t('searchPlaceholder', 'ابحث باسم الحلقة أو المعلم...')}
            value={searchQuery}
            onChange={(v) => setSearchQuery(extractValue(v))}
            icon={<Search size={14} className="text-semantic-textMuted" />}
          />
        </div>

        <div className="w-full sm:w-64 shrink-0 flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              title={t('selectTrackTitle', 'المسار التعليمي')}
              value={selectedTrack}
              onChange={(v) => setSelectedTrack(extractValue(v))}
              options={trackOptions}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              title={t('resetFilters', 'إعادة ضبط')}
              className="p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted hover:text-semantic-textPrimary cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* زر تبديل العرض للكمبيوتر فقط */}
        <div className="hidden sm:flex items-center bg-semantic-surfaceInput rounded-xl p-1 border border-semantic-borderCard">
          <button
            type="button"
            onClick={() => setLayoutMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
              layoutMode === 'grid' ? 'bg-semantic-actionPrimary text-semantic-bgMain' : 'bg-transparent text-semantic-textMuted'
            }`}
          >
            <Grid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
              layoutMode === 'list' ? 'bg-semantic-actionPrimary text-semantic-bgMain' : 'bg-transparent text-semantic-textMuted'
            }`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* --- شريط حالة النتائج الصغيرة --- */}
      <div className="flex items-center justify-between text-[11px] text-semantic-textMuted px-1">
        <span>
          {t('showingResults', 'عرض {{count}} حلقة', { count: filteredHalaqas.length })}
        </span>
      </div>

      {/* --- نافذة إنشاء الحلقة --- */}
      <HalaqaFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        teachers={teachers}
        isSubmitting={isSubmitting}
      />

      {/* --- عرض المحتوى --- */}
      {filteredHalaqas.length > 0 ? (
        <div className={
          layoutMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" 
            : "flex flex-col gap-2.5"
        }>
          {filteredHalaqas.map(halaqa => (
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
        <EmptyState
          icon={Clock}
          title={t('noHalaqatFound', 'لا توجد حلقات مطابقة للبحث أو الفلترة')}
          description={t('tryChangingFilters', 'جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية')}
        />
      )}
    </div>
  );
}
