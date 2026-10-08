import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Archive, Layers, Users, 
  Grid, List, CheckCircle2, Clock 
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
  
  // حالات التحكم بالصفحة
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة النموذج مع دعم كائن اسم موحد حسب اللغة
  const [formData, setFormData] = useState({
    name: {},
    teacher_id: '',
    educational_track: 'hifz',
    start_time: '16:00',
    end_time: '17:15',
    timezone: 'UTC'
  });

  // دالة مساعدة آمنة لاستخراج النصوص وتجنب (TypeError: a is not a function)
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

  // تصفية الحلقات مع مراعاة اللغة النشطة بشكل آمن
  const filteredHalaqas = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return (Array.isArray(halaqas) ? halaqas : []).filter(halaqa => {
      if (!halaqa) return false;
      const isArchivedMatch = viewMode === 'archived' ? Boolean(halaqa.is_archived) : !halaqa.is_archived;
      const trackMatch = selectedTrack === 'all' || halaqa.educational_track === selectedTrack;
      
      if (!isArchivedMatch || !trackMatch) return false;
      if (!query) return true;

      const localizedName = resolveText(halaqa.name).toLowerCase();
      const localizedTeacher = resolveText(halaqa.teacher_name || halaqa.teacher).toLowerCase();

      return localizedName.includes(query) || localizedTeacher.includes(query);
    });
  }, [halaqas, viewMode, selectedTrack, searchQuery, getLocalizedText, currentLang]);

  // إحصائيات سريعة للواجهة
  const stats = useMemo(() => {
    const list = Array.isArray(halaqas) ? halaqas : [];
    return {
      totalActive: list.filter(h => !h?.is_archived).length,
      totalArchived: list.filter(h => h?.is_archived).length,
      unassigned: list.filter(h => !h?.teacher_id && !h?.is_archived).length
    };
  }, [halaqas]);

  // حفظ وإرسال البيانات
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 text-semantic-textPrimary">
      
      {/* 1. الترويسة الرئيسية والإجراءات */}
      <div className={`${UI.card} flex flex-col md:flex-row md:items-center justify-between gap-4 p-5`}>
        <div>
          <h1 className={`${UI.title} flex items-center gap-2.5`}>
            <Layers className="text-semantic-actionPrimary" size={22} />
            {t('halaqatTitle', 'إدارة الحلقات')}
          </h1>
          <p className={`${UI.subtitle} mt-1`}>
            {t('halaqatSubTitle', 'متابعة الحلقات وتعيين الكادر التعليمي ومراقبة المسارات')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(prev => prev === 'active' ? 'archived' : 'active')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border ${
              viewMode === 'archived'
                ? 'bg-semantic-actionPrimary/20 text-semantic-actionPrimary border-semantic-actionPrimary/40'
                : 'bg-semantic-surfaceInput border-semantic-borderCard text-semantic-textSecondary hover:border-semantic-borderHover'
            }`}
          >
            <Archive size={15} />
            {viewMode === 'active' 
              ? `${t('archive', 'الأرشيف')} (${stats.totalArchived})` 
              : t('activeSessions', 'الحلقات النشطة')}
          </button>

          <button
            type="button"
            onClick={() => setShowFormModal(prev => !prev)}
            className={`${UI.btnPrimary} w-auto px-4 py-2.5 text-xs font-extrabold`}
          >
            <Plus size={16} />
            {t('createHalaqa', 'إضافة حلقة')}
          </button>
        </div>
      </div>

      {/* 2. شريط المؤشرات والإحصائيات */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${UI.card} flex items-center justify-between p-3.5`}>
          <div>
            <div className="text-[11px] text-semantic-textMuted">{t('statActive', 'الحلقات القائمة')}</div>
            <div className="text-base font-extrabold text-semantic-success">{stats.totalActive}</div>
          </div>
          <CheckCircle2 size={18} className="text-semantic-success/60" />
        </div>

        <div className={`${UI.card} flex items-center justify-between p-3.5`}>
          <div>
            <div className="text-[11px] text-semantic-textMuted">{t('statUnassigned', 'غير معينة')}</div>
            <div className="text-base font-extrabold text-semantic-actionPrimary">{stats.unassigned}</div>
          </div>
          <Users size={18} className="text-semantic-actionPrimary/60" />
        </div>

        <div className={`${UI.card} flex items-center justify-between p-3.5`}>
          <div>
            <div className="text-[11px] text-semantic-textMuted">{t('statArchived', 'المؤرشفة')}</div>
            <div className="text-base font-extrabold text-semantic-textSecondary">{stats.totalArchived}</div>
          </div>
          <Archive size={18} className="text-semantic-textMuted" />
        </div>
      </div>

      {/* 3. نموذج إضافة حلقة */}
      {showFormModal && (
        <HalaqaFormModal
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          teachers={teachers}
          getLocalizedText={getLocalizedText}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 4. البحث والفلترة ومطابقة طريقة العرض */}
      <div className={`${UI.card} flex flex-col sm:flex-row items-center justify-between gap-3 p-3`}>
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-semantic-textMuted" size={15} />
          <input
            type="text"
            placeholder={t('searchPlaceholder', 'البحث بالحلقة أو المعلم...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`${UI.input} pr-9 pl-3 text-xs`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedTrack}
            onChange={e => setSelectedTrack(e.target.value)}
            className={`${UI.input} w-auto text-xs`}
          >
            <option value="all">{t('allTracks', 'كافة المسارات')}</option>
            <option value="hifz">{t('trackHifz', 'الحفظ المكثف')}</option>
            <option value="tilawah">{t('trackTilawah', 'التلاوة والتصحيح')}</option>
            <option value="ijazah">{t('trackIjazah', 'الإجازات والسند')}</option>
          </select>

          <div className="flex items-center bg-semantic-surfaceInput rounded-xl p-1 border border-semantic-borderCard">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
                layoutMode === 'grid' ? 'bg-semantic-actionPrimary text-semantic-textPrimary' : 'bg-transparent text-semantic-textMuted'
              }`}
            >
              <Grid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
                layoutMode === 'list' ? 'bg-semantic-actionPrimary text-semantic-textPrimary' : 'bg-transparent text-semantic-textMuted'
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. عرض قائمة الحلقات */}
      {filteredHalaqas.length > 0 ? (
        <div className={
          layoutMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "flex flex-col gap-3"
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
        <div className={`${UI.card} text-center py-12 border-dashed`}>
          <Clock className="mx-auto text-semantic-textMuted mb-2" size={30} />
          <p className="text-xs text-semantic-textSecondary font-semibold">
            {t('noHalaqatFound', 'لا توجد نتائج مطابقة')}
          </p>
        </div>
      )}
    </div>
  );
}
