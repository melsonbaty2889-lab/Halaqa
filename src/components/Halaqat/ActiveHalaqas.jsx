import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Archive, Layers, Users, 
  Grid, List, CheckCircle2, Clock 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HalaqaCardItem from './HalaqaCardItem';
import HalaqaFormModal from './HalaqaFormModal';

export default function ActiveHalaqas({
  halaqas = [],
  teachers = [],
  getLocalizedText,
  onNavigateToAttendance,
  onToggleArchiveHalaqa,
  onCreateHalaqa
}) {
  const { t, i18n } = useTranslation();
  
  // حالات التحكم بالصفحة
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة النموذج بدون تكرار للغات (تعتمد على الكائن name بأسلوب المפתח-قيمة)
  const [formData, setFormData] = useState({
    name: {},
    teacher_id: '',
    educational_track: 'hifz',
    start_time: '16:00',
    end_time: '17:15',
    timezone: 'UTC'
  });

  // تصفية الجلسات وحساب المطابقة مع لغة النظام الحالية
  const filteredHalaqas = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return halaqas.filter(halaqa => {
      const isArchivedMatch = viewMode === 'archived' ? halaqa.is_archived : !halaqa.is_archived;
      const trackMatch = selectedTrack === 'all' || halaqa.educational_track === selectedTrack;
      
      if (!isArchivedMatch || !trackMatch) return false;
      if (!query) return true;

      const localizedName = (getLocalizedText ? getLocalizedText(halaqa.name) : (halaqa.name?.[i18n.language] || halaqa.name?.ar || '')).toLowerCase();
      const localizedTeacher = (getLocalizedText ? getLocalizedText(halaqa.teacher_name || halaqa.teacher) : '').toLowerCase();

      return localizedName.includes(query) || localizedTeacher.includes(query);
    });
  }, [halaqas, viewMode, selectedTrack, searchQuery, getLocalizedText, i18n.language]);

  // المؤشرات التنفيذية والإحصائية
  const stats = useMemo(() => ({
    totalActive: halaqas.filter(h => !h.is_archived).length,
    totalArchived: halaqas.filter(h => h.is_archived).length,
    unassigned: halaqas.filter(h => !h.teacher_id && !h.is_archived).length
  }), [halaqas]);

  // معالجة إضافة حلقة جديدة
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 text-slate-100">
      
      {/* 1. الترويسة التنفيذية والإجراءات */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <Layers className="text-amber-500" size={22} />
            {t('halaqatTitle', 'إدارة الجلسات التعليمية')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('halaqatSubTitle', 'متابعة الحلقات وتعيين الكادر التعليمي ومراقبة المسارات')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(prev => prev === 'active' ? 'archived' : 'active')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
              viewMode === 'archived'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Archive size={15} />
            {viewMode === 'active' 
              ? `${t('archive', 'الأرشيف')} (${stats.totalArchived})` 
              : t('activeSessions', 'الجلسات الجارية')}
          </button>

          <button
            type="button"
            onClick={() => setShowFormModal(prev => !prev)}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            <Plus size={16} />
            {t('createHalaqa', 'إضافة حلقة')}
          </button>
        </div>
      </div>

      {/* 2. مؤشرات الأداء الحية */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">{t('statActive', 'الحلقات القائمة')}</div>
            <div className="text-base font-black text-emerald-400">{stats.totalActive}</div>
          </div>
          <CheckCircle2 size={18} className="text-emerald-500/50" />
        </div>

        <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">{t('statUnassigned', 'غير معينة')}</div>
            <div className="text-base font-black text-amber-400">{stats.unassigned}</div>
          </div>
          <Users size={18} className="text-amber-500/50" />
        </div>

        <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">{t('statArchived', 'المؤرشفة')}</div>
            <div className="text-base font-black text-slate-400">{stats.totalArchived}</div>
          </div>
          <Archive size={18} className="text-slate-500/50" />
        </div>
      </div>

      {/* 3. نافذة إنشاء حلقة جديدة */}
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

      {/* 4. أدوات الفلترة والتحكم بالعرض */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder={t('searchPlaceholder', 'البحث بالحلقة أو المعلم...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedTrack}
            onChange={e => setSelectedTrack(e.target.value)}
            className="p-2 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white outline-none focus:border-amber-500"
          >
            <option value="all">{t('allTracks', 'كافة المسارات')}</option>
            <option value="hifz">{t('trackHifz', 'الحفظ المكثف')}</option>
            <option value="tilawah">{t('trackTilawah', 'التلاوة والتصحيح')}</option>
            <option value="ijazah">{t('trackIjazah', 'الإجازات والسند')}</option>
          </select>

          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${layoutMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'bg-transparent text-slate-400'}`}
            >
              <Grid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${layoutMode === 'list' ? 'bg-amber-500 text-slate-950' : 'bg-transparent text-slate-400'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. عرض الحلقات */}
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
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-white/10">
          <Clock className="mx-auto text-slate-600 mb-2" size={30} />
          <p className="text-xs text-slate-400 font-semibold">
            {t('noHalaqatFound', 'لا توجد نتائج مطابقة')}
          </p>
        </div>
      )}
    </div>
  );
}
