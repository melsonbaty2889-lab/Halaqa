/* src/components/ActiveHalaqas.jsx */
import React, { useState, useCallback, useMemo } from 'react';
import { 
  User, 
  Clock, 
  FolderOpen, 
  Plus, 
  Archive, 
  Search, 
  BookOpen,
  Calendar,
  Globe
} from 'lucide-react';

export default function ActiveHalaqas({ 
  halaqas = [], 
  teachers = [], 
  isLoading = false, 
  error = null, 
  currentLang = 'ar', // 🌍 دعم رمز اللغة العالمي (ar, en, id, ur, fr...)
  isMobile = false,
  onCreateHalaqa, 
  onToggleArchiveHalaqa,
  onNavigateToAttendance 
}) {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  // 🛡️ استخلاص النصوص المتعددة اللغات من حقول JSONB المتوافقة مع قاعدة البيانات العالمية
  const getLocalizedText = useCallback((val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val[currentLang] || val['ar'] || val['en'] || Object.values(val).find(v => typeof v === 'string') || fallback;
    }
    return String(val);
  }, [currentLang]);

  // حالات التحكم الواجهية
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('active'); 
  const [searchQuery, setSearchQuery] = useState('');

  // 📋 حالة استمارة الحلقات الجديدة (متوافقة 100% مع أعمدة جدول halaqas في قاعدة البيانات)
  const [formData, setFormData] = useState({
    name_ar: '', 
    name_en: '', 
    teacher_id: '', 
    start_time: '16:00', 
    end_time: '18:00', 
    status: 'active',
    educational_track: 'hifz',
    teaching_type: 'online',
    max_students: 15,
    language_code: currentLang
  });

  // قاموس الترجمة الداخلية الفوري الواسع (للغات المتعددة)
  const translations = {
    ar: {
      halaqasManager: 'منظومة إدارة الحلقات القرآنية والتعليمية',
      halaqaSub: 'إدارة الصفوف، ربط المحفظين، ومتابعة هيكلة الحلقات عبر السحابة',
      close: 'إغلاق ✖',
      addHalaqa: 'إنشاء حلقة جديدة',
      viewArchived: 'أرشيف الحلقات',
      viewActive: 'الحلقات النشطة',
      nameAr: 'اسم الحلقة (بالعربية - افتراضي)',
      nameEn: 'اسم الحلقة (بالإنجليزية أو لغات أخرى)',
      assignTeacher: 'تعيين المعلم / المحفظ المسؤول',
      selectTeacher: '-- اختر المعلم من الأكاديمية --',
      halaqaStatus: 'الحالة التشغيلية الأولية',
      stLive: 'نشطة / جارية 🟢',
      stUpcoming: 'قادمة / مجدولة 🟡',
      stFinished: 'مكتملة ⚪',
      startTime: 'وقت البدء',
      endTime: 'وقت الانتهاء',
      track: 'المسار التعليمي',
      trackHifz: 'تحفظ وتجويد (Hifz)',
      trackTilawah: 'تلاوة وتصحيح (Tilawah)',
      btnSave: 'اعتماد الحلقة وحفظ البيانات في السحابة 🚀',
      searchPh: 'ابحث باسم الحلقة أو اسم المحفظ المكلف...',
      noData: 'لا توجد حلقات قرآنية مسجلة تطابق التصفية والبحث حالياً',
      tHalaqa: 'الحلقة / المسار التعليمي',
      tTeach: 'المحفظ المسؤول',
      tTime: 'التوقيت الزمني',
      tStatus: 'الحالة التشغيلية',
      tAction: 'العمليات والتحكم',
      live: 'نشطة',
      upc: 'قادمة',
      goToAttendance: 'غرفة التسميع الحي 🚀',
      archive: 'أرشفة',
      activate: 'تنشيط',
      errRequired: 'يرجى إدخال اسم الحلقة وتعيين المحفظ المسؤول أولاً',
      errLoad: 'حدث خطأ أثناء تحميل الحلقات الحية في المنظومة.',
      unassigned: 'لم يحدد بعد'
    },
    en: {
      halaqasManager: 'Qur\'an & Educational Circles Management',
      halaqaSub: 'Manage classes, assign reciters, and monitor circle structures via Cloud',
      close: 'Close ✖',
      addHalaqa: 'Create New Halaqa',
      viewArchived: 'View Archive',
      viewActive: 'Active Circles',
      nameAr: 'Halaqa Name (Arabic)',
      nameEn: 'Halaqa Name (English / Global)',
      assignTeacher: 'Assign Teacher / Reciter',
      selectTeacher: '-- Select Academy Teacher --',
      halaqaStatus: 'Initial Operational Status',
      stLive: 'Active / Live 🟢',
      stUpcoming: 'Upcoming 🟡',
      stFinished: 'Finished ⚪',
      startTime: 'Start Time',
      endTime: 'End Time',
      track: 'Educational Track',
      trackHifz: 'Memorization (Hifz)',
      trackTilawah: 'Recitation (Tilawah)',
      btnSave: 'Deploy Halaqa & Sync to Cloud 🚀',
      searchPh: 'Search by circle name or assigned teacher...',
      noData: 'No learning circles match your active filters',
      tHalaqa: 'Halaqa / Educational Track',
      tTeach: 'Assigned Teacher',
      tTime: 'Timing Schedule',
      tStatus: 'Status',
      tAction: 'Actions & Control',
      live: 'Live',
      upc: 'Upcoming',
      goToAttendance: 'Live Room 🚀',
      archive: 'Archive',
      activate: 'Activate',
      errRequired: 'Please fill the circle name and assign a teacher first',
      errLoad: 'Failed to load active sessions from the system.',
      unassigned: 'Unassigned'
    }
  };

  const t = (key) => translations[currentLang]?.[key] || translations['en'][key] || key;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_ar && !formData.name_en) {
      alert(t('errRequired'));
      return;
    }
    
    // إعداد هيكل البيانات ليتوافق مع حقل JSONB في قاعدة البيانات (name: {ar: '...', en: '...'})
    const payload = {
      ...formData,
      name: {
        ar: formData.name_ar || formData.name_en,
        en: formData.name_en || formData.name_ar,
        [currentLang]: formData.name_ar || formData.name_en
      }
    };

    if (onCreateHalaqa) {
      onCreateHalaqa(payload);
      setFormData({
        name_ar: '', name_en: '', teacher_id: '', start_time: '16:00', end_time: '18:00', status: 'active',
        educational_track: 'hifz', teaching_type: 'online', max_students: 15, language_code: currentLang
      });
      setShowForm(false);
    }
  };

  // 🔍 تصفية الحلقات بدعم البحث الذكي متعدد اللغات
  const filteredHalaqas = useMemo(() => {
    const query = (searchQuery || '').toLowerCase().trim();
    return (halaqas || []).filter(h => {
      const matchesView = viewMode === 'active' ? !h.is_archived : h.is_archived;
      
      const circleName = getLocalizedText(h.name || h.name_ar || h.title).toLowerCase();
      const teacherName = getLocalizedText(h.teacher_name || h.teacher).toLowerCase();

      const matchesSearch = !query || circleName.includes(query) || teacherName.includes(query);
      return matchesView && matchesSearch;
    });
  }, [halaqas, viewMode, searchQuery, getLocalizedText]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-white/5 shadow-xl bg-[var(--surface)] flex flex-col gap-4 h-full animate-pulse">
        <div className="h-5 bg-white/10 rounded w-1/3"></div>
        <div className="flex flex-col gap-3.5 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/10 shadow-xl bg-[var(--surface)] flex flex-col items-center justify-center text-center py-12">
        <p className="text-red-400 text-sm font-medium">{t('errLoad')}</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 h-full bg-[var(--surface)] relative overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* 🌟 الهيدر الرئيسي مع مؤشر التوافق العالمي */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🕌</span> {t('halaqasManager')}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono inline-flex items-center gap-1">
              <Globe size={10} /> {currentLang.toUpperCase()}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t('halaqaSub')}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${showForm ? 'bg-slate-800 text-white' : 'bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-md'}`}
          >
            <Plus size={14} />
            {showForm ? t('close') : t('addHalaqa')}
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'active' ? 'archived' : 'active')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-2 ${viewMode === 'active' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-amber-400 bg-amber-400/10 text-amber-400'}`}
          >
            <Archive size={14} />
            {viewMode === 'active' ? t('viewArchived') : t('viewActive')}
          </button>
        </div>
      </div>

      {/* 📋 استمارة إنشاء حلقة جديدة متوافقة مع الحقول السحابية */}
      {showForm && (
        <div className="p-5 rounded-xl border border-amber-400/20 bg-slate-900/90 backdrop-blur-md mt-2 shadow-2xl animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">*{t('nameAr')}</label>
              <input type="text" placeholder="حلقة الإمام عاصم" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{t('nameEn')}</label>
              <input type="text" placeholder="Al-Asim Qur'an Circle" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">*{t('assignTeacher')}</label>
              <select required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors">
                <option value="">{t('selectTeacher')}</option>
                {teachers.map(tObj => (
                  <option key={tObj.id} value={tObj.id}>
                    {getLocalizedText(tObj.name || tObj.full_name, tObj.id)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{t('halaqaStatus')}</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors">
                <option value="active">{t('stLive')}</option>
                <option value="upcoming">{t('stUpcoming')}</option>
                <option value="finished">{t('stFinished')}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{t('track')}</label>
              <select value={formData.educational_track} onChange={e => setFormData({...formData, educational_track: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors">
                <option value="hifz">{t('trackHifz')}</option>
                <option value="tilawah">{t('trackTilawah')}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-300">{t('startTime')}</label><input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white outline-none text-center font-mono"/></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-300">{t('endTime')}</label><input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white outline-none text-center font-mono"/></div>
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full p-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm transition-all hover:bg-amber-500 shadow-lg">{t('btnSave')}</button>
            </div>
          </form>
        </div>
      )}

      {/* حقل البحث الفوري */}
      <div className="relative">
        <span className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`}><Search size={16} /></span>
        <input 
          type="text" 
          placeholder={t('searchPh')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`w-full p-3.5 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-sm rounded-xl bg-slate-900/60 border border-slate-800 text-white outline-none focus:border-slate-700 transition-colors placeholder:text-slate-500`}
        />
      </div>

      {/* عرض الجدول أو البطاقات التفاعلية المتجاوبة */}
      {filteredHalaqas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
          <FolderOpen className="text-slate-600 mb-3" size={36} />
          <p className="text-slate-400 text-sm font-medium">{t('noData')}</p>
        </div>
      ) : isMobile ? (
        <div className="flex flex-col gap-3.5">
          {filteredHalaqas.map((halaqa) => (
            <div key={halaqa.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {getLocalizedText(halaqa.name)}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <User size={12} className="text-amber-400/80" />
                    <span>{getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned'))}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigateToAttendance && onNavigateToAttendance(halaqa.id)} 
                  className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen size={13} /> {t('goToAttendance')}
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 mt-1">
                <span className="text-[11px] text-slate-400 font-mono">⏰ {halaqa.start_time || '00:00'} - {halaqa.end_time || '00:00'}</span>
                <button onClick={() => onToggleArchiveHalaqa && onToggleArchiveHalaqa(halaqa.id, halaqa.is_archived)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${viewMode === 'active' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}>
                  {viewMode === 'active' ? t('archive') : t('activate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className={`w-full border-collapse bg-slate-900/20 ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-slate-300 text-xs font-bold">
                <th className="p-3.5">{t('tHalaqa')}</th>
                <th className="p-3.5">{t('tTeach')}</th>
                <th className="p-3.5">{t('tTime')}</th>
                <th className="p-3.5">{t('tStatus')}</th>
                <th className="p-3.5 text-center">{t('tAction')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-xs divide-y divide-white/[0.03]">
              {filteredHalaqas.map((halaqa) => (
                <tr key={halaqa.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-3.5 font-semibold text-white">
                    <div className="flex flex-col gap-0.5">
                      <span>{getLocalizedText(halaqa.name)}</span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">
                        {halaqa.educational_track || 'hifz'} • {halaqa.teaching_type || 'online'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      🧑‍🏫 {getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned'))}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} className="text-amber-400/70" />
                      {halaqa.start_time || '00:00'} - {halaqa.end_time || '00:00'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${halaqa.status === 'active' || halaqa.status === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' : 'bg-amber-500/10 text-amber-400 border-amber-500/15'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${halaqa.status === 'active' || halaqa.status === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                      {halaqa.status === 'active' || halaqa.status === 'live' ? t('live') : t('upc')}
                    </span>
                  </td>
                  <td className="p-3.5 flex items-center justify-center gap-2">
                    <button
                      onClick={() => onNavigateToAttendance && onNavigateToAttendance(halaqa.id)}
                      className="px-3.5 py-2 rounded-xl font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <BookOpen size={14} />
                      {t('goToAttendance')}
                    </button>

                    <button
                      onClick={() => onToggleArchiveHalaqa && onToggleArchiveHalaqa(halaqa.id, halaqa.is_archived)}
                      className={`px-3 py-2 rounded-xl font-bold border transition-colors ${viewMode === 'active' ? 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'}`}
                    >
                      {viewMode === 'active' ? t('archive') : t('activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
