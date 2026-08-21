import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HalaqaFormModal({ 
  formData, 
  setFormData, 
  handleSubmit, 
  teachers, 
  getLocalizedText 
}) {
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit} className="p-5 mb-5 rounded-2xl border border-amber-500/30 bg-slate-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-300">
          {t('nameAr', 'اسم الحلقة (بالعربية)')}
        </label>
        <input 
          type="text" 
          required 
          placeholder="مثال: حلقة الإمام الشاطبي" 
          value={formData.name_ar} 
          onChange={e => setFormData({...formData, name_ar: e.target.value})} 
          className="p-2.5 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white outline-none focus:border-amber-500" 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-300">
          {t('nameEn', 'اسم الحلقة (بالإنجليزية)')}
        </label>
        <input 
          type="text" 
          placeholder="e.g. Al-Shatibi Quran Circle" 
          value={formData.name_en} 
          onChange={e => setFormData({...formData, name_en: e.target.value})} 
          className="p-2.5 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white outline-none focus:border-amber-500" 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-300">
          {t('assignTeacher', 'تعيين المعلم المسؤول')}
        </label>
        <select 
          required 
          value={formData.teacher_id} 
          onChange={e => setFormData({...formData, teacher_id: e.target.value})} 
          className="p-2.5 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white outline-none focus:border-amber-500"
        >
          <option value="">{t('selectTeacher', '-- اختر المعلم المعتمد --')}</option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {getLocalizedText(teacher.name || teacher.full_name)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-300">
          {t('track', 'المسار التعليمي')}
        </label>
        <select 
          value={formData.educational_track} 
          onChange={e => setFormData({...formData, educational_track: e.target.value})} 
          className="p-2.5 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white outline-none focus:border-amber-500"
        >
          <option value="hifz">{t('trackHifz', 'مسار الحفظ والتجويد المكثف')}</option>
          <option value="tilawah">{t('trackTilawah', 'مسار التلاوة وتصحيح الأداء')}</option>
          <option value="ijazah">{t('trackIjazah', 'مسار الإجازات بالسند المتصل')}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300">{t('startTime', 'وقت البدء')}</label>
          <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="p-2.5 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white text-center outline-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300">{t('endTime', 'وقت الانتهاء')}</label>
          <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="p-2.5 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-white text-center outline-none" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-300">{t('timezone', 'المنطقة الزمنية النظامية')}</label>
        <div className="p-2.5 text-xs rounded-xl bg-slate-800/90 border border-white/10 text-slate-400 flex items-center gap-2">
          <Globe size={15} className="text-amber-500" />
          <span>{formData.timezone}</span>
        </div>
      </div>

      <div className="col-span-full pt-2">
        <button type="submit" className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-extrabold text-sm border-none cursor-pointer hover:opacity-90 transition-opacity">
          {t('btnSave', 'اعتماد الحلقة وتأكيد الجدولة')}
        </button>
      </div>
    </form>
  );
}
