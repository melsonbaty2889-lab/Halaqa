import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Layers, Users, 
  Grid, List, CheckCircle2, Archive, Clock 
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

  // جلب إعدادات الأكاديمية لاستخراج المنطقة الزمنية والسعة الاستيعابية التلقائية
  const { formData: academySettings } = useAcademySettings(currentAcademyId, isRtl);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived' | 'unassigned'
  const [layoutMode, setLayoutMode] = useState('grid');
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تعيين القيم الافتراضية المستمدة من إعدادات الأكاديمية
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

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto space-y-3.5 text-semantic-textPrimary">
      
      {/* 1. الترويسة الموحدة والمبسطة للموبايل والشاشات الكبيرة */}
      <div className="flex items-center justify-between gap-2 py-1">
        <div>
          <h1 className="text-sm sm:text-xl font-black text-semantic-textPrimary flex items-center gap-2 m-0">
            <Layers className="text-semantic-actionPrimary shrink-0" size={18} />
            <span>{t('halaqatTitle', 'إدارة الحلقات والفصول')}</span>
          </h1>
          <p className="text-[11px] text-semantic-textMuted m-0 mt-0.5 hidden sm:block">
            {t('halaqatSubTitle', 'متابعة الجلسات التعليمية وتوزيع المعلمين ومراقبة المسارات')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className={`${UI.btnPrimary} w-auto px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0`}
        >
          <Plus size={15} />
          <span>{t('createHalaqa', 'حلقة جديدة')}</span>
        </button>
      </div>

      {/* 2. أزرار التصفية التفاعلية */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setViewMode('active')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer ${
            viewMode === 'active'
              ? 'bg-semantic-actionPrimary/15 border-semantic-actionPrimary text-semantic-actionPrimary'
              : 'bg-semantic-surfaceInput border-semantic-borderCard text-semantic-textSecondary hover:border-semantic-borderHover'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>{t('statActive', 'النشطة')}</span>
          <span className="bg-semantic-actionPrimary text-semantic-bgMain px-1.5 py-0.2 rounded-full text-[10px] font-black">
            {stats.totalActive}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('unassigned')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer ${
            viewMode === 'unassigned'
              ? 'bg-semantic-actionPrimary/15 border-semantic-actionPrimary text-semantic-actionPrimary'
              : 'bg-semantic-surfaceInput border-semantic-borderCard text-semantic-textSecondary hover:border-semantic-borderHover'
          }`}
        >
          <Users size={13} />
          <span>{t('statUnassigned', 'بانتظار معلم')}</span>
          <span className="bg-semantic-surfaceInput text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px] font-bold border border-semantic-borderCard">
            {stats.unassigned}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('archived')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer ${
            viewMode === 'archived'
              ? 'bg-semantic-actionPrimary/15 border-semantic-actionPrimary text-semantic-actionPrimary'
              : 'bg-semantic-surfaceInput border-semantic-borderCard text-semantic-textSecondary hover:border-semantic-borderHover'
          }`}
        >
          <Archive size={13} />
          <span>{t('statArchived', 'المؤرشفة')}</span>
          <span className="bg-semantic-surfaceInput text-semantic-textMuted px-1.5 py-0.2 rounded-full text-[10px] font-bold border border-semantic-borderCard">
            {stats.totalArchived}
          </span>
        </button>
      </div>

      {/* 3. شريط البحث والمسارات */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t('searchPlaceholder', 'ابحث باسم الحلقة أو المعلم...')}
            value={searchQuery}
            onChange={(v) => setSearchQuery(extractValue(v))}
            icon={<Search size={14} className="text-semantic-textMuted" />}
          />
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <Select
            title={t('selectTrackTitle', 'المسار التعليمي')}
            value={selectedTrack}
            onChange={(v) => setSelectedTrack(extractValue(v))}
            options={trackOptions}
          />
        </div>

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

      {/* 4. نافذة إنشاء الحلقة */}
      <HalaqaFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        teachers={teachers}
        isSubmitting={isSubmitting}
      />

      {/* 5. عرض قائمة الحلقات أو حالة الفراغ */}
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
