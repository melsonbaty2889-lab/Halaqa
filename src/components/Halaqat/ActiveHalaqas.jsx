import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Plus, Archive, Search, X, Radio } from 'lucide-react';
import HalaqaCard from '@/components/Halaqat/HalaqaCard.jsx';
import HalaqaFormModal from '@/components/Halaqat/HalaqaFormModal.jsx';

export default function ActiveHalaqas({ 
  halaqas = [], 
  teachers = [], 
  isLoading = false, 
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

  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  const [formData, setFormData] = useState({
    name_ar: '', 
    name_en: '', 
    teacher_id: '', 
    start_time: '16:00', 
    end_time: '17:15', 
    timezone: userTimezone,
    status: 'active',
    educational_track: 'hifz',
    teaching_type: 'online',
    max_students: 15
  });

  const getLocalizedText = useCallback((val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val[currentLang] || val['ar'] || val['en'] || Object.values(val)[0] || fallback;
    }
    return String(val);
  }, [currentLang]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_ar && !formData.name_en) {
      alert(t('errRequired', 'يرجى إدخال اسم الحلقة وتعيين المعلم المسؤول'));
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
        name_ar: '', name_en: '', teacher_id: '', start_time: '16:00', end_time: '17:15', 
        timezone: userTimezone, status: 'active', educational_track: 'hifz', teaching_type: 'online', max_students: 15
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
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-amber-500 font-bold">جاري تحميل الحلقات...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 p-4 md:p-6 font-cairo ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      <div className="max-w-5xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
        {/* الهيدر الرئيسي */}
        <div className="flex flex-wrap justify-between items-center pb-5 mb-5 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/25 inline-flex">
                <Radio size={20} />
              </span>
              <h3 className="text-xl font-extrabold text-white m-0">
                {t('halaqasManager', 'منصة إدارة الحلقات القرآنية والأكاديمية')}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 m-0">
              {t('halaqaSub', 'إدارة الجلسات التعليمية، توزيع المعلمين، ومتابعة المسارات القرآنية سحابياً')}
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5 transition-all ${
                showForm 
                  ? 'bg-slate-950 text-slate-300 border border-white/10' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 border-none'
              }`}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? t('close', 'إغلاق') : t('addHalaqa', 'إنشاء حلقة جديدة')}
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'active' ? 'archived' : 'active')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5 transition-all ${
                viewMode === 'active' 
                  ? 'bg-slate-950 text-slate-400 border border-white/10' 
                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              }`}
            >
              <Archive size={16} />
              {viewMode === 'active' ? t('viewArchived', 'الأرشيف') : t('viewActive', 'الحلقات النشطة')}
            </button>
          </div>
        </div>

        {/* نموذج إنشاء حلقة */}
        {showForm && (
          <HalaqaFormModal
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            teachers={teachers}
            getLocalizedText={getLocalizedText}
          />
        )}

        {/* شريط البحث */}
        <div className="relative mb-5">
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input 
            type="text" 
            placeholder={t('searchPh', 'ابحث باسم الحلقة أو اسم المعلم المكلف...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full p-3 text-xs rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500/50 ${isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'}`}
          />
        </div>

        {/* شبكة الكروت */}
        {filteredHalaqas.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl bg-slate-950">
            <FolderOpen size={32} className="text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-xs m-0">{t('noData', 'لا توجد جلسات تعليمية مسجلة طابق بحثك حالياً')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHalaqas.map((halaqa) => (
              <HalaqaCard
                key={halaqa.id}
                halaqa={halaqa}
                viewMode={viewMode}
                getLocalizedText={getLocalizedText}
                onNavigateToAttendance={onNavigateToAttendance}
                onToggleArchiveHalaqa={onToggleArchiveHalaqa}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
