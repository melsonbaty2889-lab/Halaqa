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
  Globe,
  X
} from 'lucide-react';

export default function ActiveHalaqas({ 
  halaqas = [], 
  teachers = [], 
  isLoading = false, 
  error = null, 
  currentLang = 'ar', // 'ar' أو 'en'
  isMobile = false,
  onCreateHalaqa, 
  onToggleArchiveHalaqa,
  onNavigateToAttendance 
}) {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  // 🛡️ استخلاص النصوص الديناميكية للغات
  const getLocalizedText = useCallback((val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val[currentLang] || val['ar'] || val['en'] || Object.values(val).find(v => typeof v === 'string') || fallback;
    }
    return String(val);
  }, [currentLang]);

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('active'); 
  const [searchQuery, setSearchQuery] = useState('');

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

  // 🌐 القاموس الشامل للترجمة الواجهية (عربي / إنجليزي)
  const dict = {
    ar: {
      title: 'منظومة إدارة الحلقات القرآنية والتعليمية',
      sub: 'إدارة الصفوف، ربط المحفظين، ومتابعة هيكلة الحلقات عبر السحابة',
      addBtn: 'إنشاء حلقة جديدة',
      closeBtn: 'إغلاق',
      archivedBtn: 'أرشيف الحلقات',
      activeBtn: 'الحلقات النشطة',
      searchPh: 'ابحث باسم الحلقة أو اسم المحفظ المكلف...',
      nameArLabel: 'اسم الحلقة (بالعربية)',
      nameEnLabel: 'اسم الحلقة (بالإنجليزية)',
      teacherLabel: 'تعيين المعلم / المحفظ المسؤول',
      selectTeacher: '-- اختر المعلم من الأكاديمية --',
      statusLabel: 'الحالة التشغيلية الأولية',
      stLive: 'نشطة / جارية',
      stUpcoming: 'قادمة / مجدولة',
      stFinished: 'مكتملة',
      trackLabel: 'المسار التعليمي',
      trackHifz: 'تحفيظ وتجويد (Hifz)',
      trackTilawah: 'تلاوة وتصحيح (Tilawah)',
      startTime: 'وقت البدء',
      endTime: 'وقت الانتهاء',
      saveBtn: 'اعتماد الحلقة وحفظ البيانات في السحابة 🚀',
      roomBtn: 'غرفة التسميع الحي 🚀',
      archiveAction: 'أرشفة',
      activateAction: 'تنشيط',
      unassigned: 'غير معين',
      noData: 'لا توجد حلقات مسجلة تطابق البحث حالياً',
      colHalaqa: 'الحلقة / المسار',
      colTeacher: 'المحفظ المسؤول',
      colTime: 'التوقيت الزمني',
      colStatus: 'الحالة',
      colAction: 'التحكم',
      errReq: 'يرجى إدخال اسم الحلقة وتحديد المحفظ'
    },
    en: {
      title: 'Quranic & Educational Circles Management',
      sub: 'Manage classes, assign reciters, and monitor circle structure via Cloud',
      addBtn: 'Create New Circle',
      closeBtn: 'Close',
      archivedBtn: 'Archived Circles',
      activeBtn: 'Active Circles',
      searchPh: 'Search by circle name or assigned teacher...',
      nameArLabel: 'Circle Name (Arabic)',
      nameEnLabel: 'Circle Name (English)',
      teacherLabel: 'Assign Teacher / Reciter',
      selectTeacher: '-- Select Academy Teacher --',
      statusLabel: 'Initial Status',
      stLive: 'Active / Live',
      stUpcoming: 'Upcoming',
      stFinished: 'Finished',
      trackLabel: 'Educational Track',
      trackHifz: 'Memorization (Hifz)',
      trackTilawah: 'Recitation (Tilawah)',
      startTime: 'Start Time',
      endTime: 'End Time',
      saveBtn: 'Save & Deploy to Cloud 🚀',
      roomBtn: 'Live Recitation Room 🚀',
      archiveAction: 'Archive',
      activateAction: 'Activate',
      unassigned: 'Unassigned',
      noData: 'No learning circles match your query',
      colHalaqa: 'Circle / Track',
      colTeacher: 'Teacher',
      colTime: 'Schedule',
      colStatus: 'Status',
      colAction: 'Actions',
      errReq: 'Please enter circle name and assign a teacher'
    }
  };

  const t = (key) => dict[currentLang]?.[key] || dict['en'][key] || key;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_ar && !formData.name_en) {
      alert(t('errReq'));
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
        name_ar: '', name_en: '', teacher_id: '', start_time: '16:00', end_time: '18:00', status: 'active',
        educational_track: 'hifz', teaching_type: 'online', max_students: 15, language_code: currentLang
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
  }, [halaqas, viewMode, searchQuery, getLocalizedText]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a] animate-pulse flex flex-col gap-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-20 bg-slate-800/50 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className={`p-5 md:p-6 rounded-2xl border border-slate-800 bg-[#0b1329] text-slate-100 shadow-2xl ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* 🟢 الهيدر العلوي */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
            <span>🕌</span> {t('title')}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono">
              {currentLang.toUpperCase()}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t('sub')}</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              showForm ? 'bg-slate-800 text-slate-300' : 'bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-lg shadow-amber-400/10'
            }`}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? t('closeBtn') : t('addBtn')}
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
            {viewMode === 'active' ? t('archivedBtn') : t('activeBtn')}
          </button>
        </div>
      </div>

      {/* 📝 نموذج الإنشاء المتوافق مع الإنجليزي والعربي */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 my-4 rounded-xl border border-amber-400/20 bg-slate-900/90 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('nameArLabel')}</label>
            <input type="text" required placeholder="حلقة الإمام عاصم" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('nameEnLabel')}</label>
            <input type="text" placeholder="Al-Asim Quran Circle" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('teacherLabel')}</label>
            <select required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400">
              <option value="">{t('selectTeacher')}</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{getLocalizedText(teacher.name || teacher.full_name)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('statusLabel')}</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400">
              <option value="active">{t('stLive')}</option>
              <option value="upcoming">{t('stUpcoming')}</option>
              <option value="finished">{t('stFinished')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t('trackLabel')}</label>
            <select value={formData.educational_track} onChange={e => setFormData({...formData, educational_track: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400">
              <option value="hifz">{t('trackHifz')}</option>
              <option value="tilawah">{t('trackTilawah')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{t('startTime')}</label>
              <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white text-center font-mono" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{t('endTime')}</label>
              <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white text-center font-mono" />
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button type="submit" className="w-full p-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-500 transition-all shadow-lg">{t('saveBtn')}</button>
          </div>
        </form>
      )}

      {/* 🔍 البحث */}
      <div className="relative my-4">
        <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`} size={16} />
        <input 
          type="text" 
          placeholder={t('searchPh')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`w-full p-3.5 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-sm rounded-xl bg-slate-900/60 border border-slate-800 text-white outline-none focus:border-slate-700 transition-colors placeholder:text-slate-500`}
        />
      </div>

      {/* 📊 عرض القائمة (تجاوبي) */}
      {filteredHalaqas.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <FolderOpen className="mx-auto text-slate-600 mb-2" size={32} />
          <p className="text-slate-400 text-xs font-medium">{t('noData')}</p>
        </div>
      ) : isMobile ? (
        <div className="flex flex-col gap-3">
          {filteredHalaqas.map((halaqa) => (
            <div key={halaqa.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{getLocalizedText(halaqa.name)}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <User size={12} className="text-amber-400" />
                    <span>{getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned'))}</span>
                  </div>
                </div>
                <button onClick={() => onNavigateToAttendance?.(halaqa.id)} className="px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold flex items-center gap-1">
                  <BookOpen size={12} /> {t('roomBtn')}
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px] text-slate-400">
                <span className="font-mono">⏰ {halaqa.start_time || '16:00'} - {halaqa.end_time || '18:00'}</span>
                <button onClick={() => onToggleArchiveHalaqa?.(halaqa.id, halaqa.is_archived)} className="text-xs text-red-400 hover:underline">
                  {viewMode === 'active' ? t('archiveAction') : t('activateAction')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className={`w-full border-collapse bg-slate-900/30 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                <th className="p-3.5">{t('colHalaqa')}</th>
                <th className="p-3.5">{t('colTeacher')}</th>
                <th className="p-3.5">{t('colTime')}</th>
                <th className="p-3.5">{t('colStatus')}</th>
                <th className="p-3.5 text-center">{t('colAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-200">
              {filteredHalaqas.map((halaqa) => (
                <tr key={halaqa.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-white">
                    {getLocalizedText(halaqa.name)}
                    <span className="block text-[10px] text-slate-500 font-normal uppercase">{halaqa.educational_track || 'Hifz'}</span>
                  </td>
                  <td className="p-3.5 text-slate-400">{getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned'))}</td>
                  <td className="p-3.5 font-mono text-slate-400">{halaqa.start_time || '16:00'} - {halaqa.end_time || '18:00'}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {t('stLive')}
                    </span>
                  </td>
                  <td className="p-3.5 flex items-center justify-center gap-2">
                    <button onClick={() => onNavigateToAttendance?.(halaqa.id)} className="px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold flex items-center gap-1.5">
                      <BookOpen size={13} /> {t('roomBtn')}
                    </button>
                    <button onClick={() => onToggleArchiveHalaqa?.(halaqa.id, halaqa.is_archived)} className="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10">
                      {viewMode === 'active' ? t('archiveAction') : t('activateAction')}
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
