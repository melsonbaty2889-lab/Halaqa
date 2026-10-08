import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Layers, Users, 
  Grid, List, CheckCircle2, Archive, Clock, Sparkles 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HalaqaCardItem from './HalaqaCardItem';
import HalaqaFormModal from './HalaqaFormModal';
import { UI } from '@/theme/styles';

export default function ActiveHalaqas({
  halaqas = [],
  teachers = [],
  getLocalizedText,
  onNavigateToAttendance,
  onToggleArchiveHalaqa,
  onCreateHalaqa
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived' | 'unassigned'
  const [layoutMode, setLayoutMode] = useState('grid');
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: {},
    teacher_id: '',
    educational_track: 'hifz',
    start_time: '16:00',
    end_time: '17:15',
    timezone: 'UTC'
  });

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
      setFormData({
        name: {},
        teacher_id: '',
        educational_track: 'hifz',
        start_time: '16:00',
        end_time: '17:15',
        timezone: 'UTC'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto space-y-3.5 text-semantic-textPrimary">
      
      {/* 1. الترويسة المدمجة والأنيقة (توفير مساحة الموبايل) */}
      <div className="flex items-center justify-between gap-2 py-1">
        <div>
          <h1 className="text-base sm:text-xl font-black text-semantic-textPrimary flex items-center gap-2 m-0">
            <Layers className="text-semantic-actionPrimary shrink-0" size={20} />
            {t('halaqatTitle', 'إدارة الحلقات والفصول')}
          </h1>
          <p className="text-[11px] text-semantic-textMuted m-0 mt-0.5 hidden sm:block">
            {t('halaqatSubTitle', 'متابعة الجلسات التعليمية وتوزيع المعلمين ومراقبة المسارات')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFormModal(true)}
          className={`${UI.btnPrimary} w-auto px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0`}
        >
          <Plus size={16} />
          <span>{t('createHalaqa', 'حلقة جديدة')}</span>
        </button>
      </div>

      {/* 2. أزرار التصفية التفاعلية المدمجة (Chips Tabs) */}
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

      {/* 3. شريط البحث والمسارات الحديث بدون حشو */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-semantic-textMuted pointer-events-none" size={14} />
          <input
            type="text"
            placeholder={t('searchPlaceholder', 'ابحث باسم الحلقة أو المعلم...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`${UI.input} pr-8 pl-3 py-2 text-xs w-full bg-semantic-surfaceInput`}
          />
        </div>

        <select
          value={selectedTrack}
          onChange={e => setSelectedTrack(e.target.value)}
          className={`${UI.input} w-auto text-xs py-2 bg-semantic-surfaceInput shrink-0`}
        >
          <option value="all">{t('allTracks', 'جميع المسارات')}</option>
          <option value="hifz">{t('trackHifz', 'الحفظ والتجويد')}</option>
          <option value="tilawah">{t('trackTilawah', 'التلاوة والأداء')}</option>
          <option value="ijazah">{t('trackIjazah', 'الإجازات بالسند')}</option>
        </select>

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

      {/* 4. نافذة الإضافة المضمونة (Modal) */}
      <HalaqaFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        teachers={teachers}
        isSubmitting={isSubmitting}
      />

      {/* 5. عرض قائمة الحلقات بكروت سريعة الاستجابة */}
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
        <div className={`${UI.card} text-center py-10 border-dashed my-4`}>
          <Clock className="mx-auto text-semantic-textMuted mb-2 opacity-60" size={28} />
          <p className="text-xs text-semantic-textSecondary font-bold m-0">
            {t('noHalaqatFound', 'لا توجد حلقات مطابقة للبحث')}
          </p>
        </div>
      )}
    </div>
  );
}
