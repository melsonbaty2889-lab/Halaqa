/* src/components/ActiveHalaqas.jsx */
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Clock, 
  FolderOpen, 
  Plus, 
  Archive, 
  Search, 
  BookOpen, 
  Globe, 
  X,
  Video,
  Radio,
  Users
} from 'lucide-react';

export default function ActiveHalaqas({ 
  halaqas = [], 
  teachers = [], 
  isLoading = false, 
  error = null, 
  isMobile = false,
  onCreateHalaqa, 
  onToggleArchiveHalaqa,
  onNavigateToAttendance 
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = i18n.dir(currentLang) === 'rtl' || currentLang === 'ar';

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('active'); 
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name_ar: '', 
    name_en: '', 
    teacher_id: '', 
    start_time: '16:00', 
    end_time: '18:00', 
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    status: 'active',
    educational_track: 'hifz',
    teaching_type: 'online',
    max_students: 15
  });

  const getLocalizedText = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val[currentLang] || val['ar'] || val['en'] || Object.values(val)[0] || fallback;
    }
    return String(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_ar && !formData.name_en) {
      alert(t('errRequired', 'يرجى إدخال اسم الحلقة وتعيين المحفظ'));
      return;
    }
    
    const payload = {
      ...formData,
      name: {
        ar: formData.name_ar || formData.name_en,
        en: formData.name_en || formData.name_ar
      }
    };

    if (onCreateHalaqa) {
      onCreateHalaqa(payload);
      setFormData({
        name_ar: '', name_en: '', teacher_id: '', start_time: '16:00', end_time: '18:00', 
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        status: 'active', educational_track: 'hifz', teaching_type: 'online', max_students: 15
      });
      setShowForm(false);
    }
  };

  const filteredHalaqas = useMemo(() => {
    const query = (searchQuery || '').toLowerCase().trim();
    return (halaqas || []).filter(h => {
      const matchesView = viewMode === 'active' ? !h.is_archived : h.is_archived;
      const circleName = getLocalizedText(h.name || h.name_ar || h.title).toLowerCase();
      const teacherName = getLocalizedText(h.teacher_name || h.teacher).toLowerCase();
      return matchesView && (!query || circleName.includes(query) || teacherName.includes(query));
    });
  }, [halaqas, viewMode, searchQuery, currentLang]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0b1329] animate-pulse flex flex-col gap-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-20 bg-slate-800/50 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`p-5 md:p-6 rounded-2xl border border-slate-800/80 bg-[#0b1329] text-slate-100 shadow-2xl transition-all duration-300 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* 🟢 الهيدر الرئيسي التفاعلي */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
            <Radio className="text-amber-400 animate-pulse" size={20} />
            {t('halaqasManager', 'منظومة إدارة الحلقات القرآنية والتعليمية')}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono">
              {currentLang.toUpperCase()}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('halaqaSub', 'إدارة الصفوف، ربط المحفظين، ومتابعة هيكلة الحلقات عبر السحابة')}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              showForm ? 'bg-slate-800 text-slate-300' : 'bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-lg shadow-amber-400/10'
            }`}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? t('close', 'إغلاق') : t('addHalaqa', 'إنشاء حلقة جديدة')}
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'active' ? 'archived' : 'active')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
              viewMode === 'active' 
                ? 'border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800' 
                : 'border-amber-400/30 bg-amber-400/10 text-amber-400'
            }`}
          >
            <Archive size={14} />
            {viewMode === 'active' ? t('viewArchived', 'أرشيف الحلقات') : t('viewActive', 'الحلقات النشطة')}
          </button>
        </div>
      </div>

      {/* 📝 نموذج إنشاء حلقة جديدة مع دعم المناطق الزمنية */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 my-4 rounded-xl border border-amber-400/20 bg-slate-900/90 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('nameAr', 'اسم الحلقة (بالعربية)')}</label>
            <input type="text" required placeholder={t('exAr', 'حلقة الإمام عاصم')} value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('nameEn', 'اسم الحلقة (بالإنجليزية)')}</label>
            <input type="text" placeholder={t('exEn', 'Al-Asim Quran Circle')} value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('assignTeacher', 'تعيين المعلم / المحفظ المسؤول')}</label>
            <select required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400">
              <option value="">{t('selectTeacher', '-- اختر المعلم من الأكاديمية --')}</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{getLocalizedText(teacher.name || teacher.full_name)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('track', 'المسار التعليمي')}</label>
            <select value={formData.educational_track} onChange={e => setFormData({...formData, educational_track: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400">
              <option value="hifz">{t('trackHifz', 'تحفيظ وتجويد (Hifz)')}</option>
              <option value="tilawah">{t('trackTilawah', 'تلاوة وتصحيح (Tilawah)')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{t('startTime', 'وقت البدء')}</label>
              <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white text-center font-mono" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{t('endTime', 'وقت الانتهاء')}</label>
              <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white text-center font-mono" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('timezone', 'المنطقة الزمنية للحلقة')}</label>
            <input type="text" readOnly value={formData.timezone} className="p-3 text-sm rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-400 font-mono text-xs" />
          </div>

          <div className="md:col-span-2 pt-2">
            <button type="submit" className="w-full p-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-500 transition-all shadow-lg">
              {t('btnSave', 'اعتماد الحلقة وحفظ البيانات')}
            </button>
          </div>
        </form>
      )}

      {/* 🔍 شريط البحث العالمي */}
      <div className="relative my-4">
        <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`} size={16} />
        <input 
          type="text" 
          placeholder={t('searchPh', 'ابحث باسم الحلقة أو اسم المحفظ المكلف...')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`w-full p-3.5 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-sm rounded-xl bg-slate-900/60 border border-slate-800 text-white outline-none focus:border-amber-400/40 transition-colors placeholder:text-slate-500`}
        />
      </div>

      {/* 📊 عرض شبكي عالمي للحلقات (Cards Grid) */}
      {filteredHalaqas.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <FolderOpen className="mx-auto text-slate-600 mb-2" size={32} />
          <p className="text-slate-400 text-xs font-medium">{t('noData', 'لا توجد حلقات مسجلة تطابق البحث حالياً')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHalaqas.map((halaqa) => (
            <div key={halaqa.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
              
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="text-sm font-bold text-white leading-snug">{getLocalizedText(halaqa.name)}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium whitespace-nowrap">
                    {t('live', 'نشطة')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <User size={13} className="text-amber-400 shrink-0" />
                  <span className="truncate">{getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned', 'غير معين'))}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Clock size={12} className="shrink-0" />
                  <span>{halaqa.start_time || '16:00'} - {halaqa.end_time || '18:00'}</span>
                  <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                    {halaqa.timezone || 'UTC'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3">
                <button 
                  onClick={() => onNavigateToAttendance?.(halaqa.id)} 
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Video size={13} />
                  {t('goToAttendance', 'غرفة التسميع الحي')}
                </button>

                <button 
                  onClick={() => onToggleArchiveHalaqa?.(halaqa.id, halaqa.is_archived)} 
                  className="px-2.5 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 text-xs transition-all"
                >
                  {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
