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
    <form onSubmit={handleSubmit} style={{
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '16px',
      border: '1px solid rgba(201, 168, 76, 0.3)',
      background: '#0c1520',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>
          {t('nameAr', 'اسم الحلقة (بالعربية)')}
        </label>
        <input 
          type="text" 
          required 
          placeholder="مثال: حلقة الإمام الشاطبي" 
          value={formData.name_ar} 
          onChange={e => setFormData({...formData, name_ar: e.target.value})} 
          style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>
          {t('nameEn', 'اسم الحلقة (بالإنجليزية)')}
        </label>
        <input 
          type="text" 
          placeholder="e.g. Al-Shatibi Quran Circle" 
          value={formData.name_en} 
          onChange={e => setFormData({...formData, name_en: e.target.value})} 
          style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>
          {t('assignTeacher', 'تعيين المعلم المسؤول')}
        </label>
        <select 
          required 
          value={formData.teacher_id} 
          onChange={e => setFormData({...formData, teacher_id: e.target.value})} 
          style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
        >
          <option value="">{t('selectTeacher', '-- اختر المعلم المعتمد --')}</option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {getLocalizedText(teacher.name || teacher.full_name)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>
          {t('track', 'المسار التعليمي')}
        </label>
        <select 
          value={formData.educational_track} 
          onChange={e => setFormData({...formData, educational_track: e.target.value})} 
          style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
        >
          <option value="hifz">{t('trackHifz', 'مسار الحفظ والتجويد المكثف')}</option>
          <option value="tilawah">{t('trackTilawah', 'مسار التلاوة وتصحيح الأداء')}</option>
          <option value="ijazah">{t('trackIjazah', 'مسار الإجازات بالسند المتصل')}</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>{t('startTime', 'وقت البدء')}</label>
          <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} style={{ padding: '10px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textAlign: 'center', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>{t('endTime', 'وقت الانتهاء')}</label>
          <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} style={{ padding: '10px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textAlign: 'center', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>{t('timezone', 'المنطقة الزمنية النظامية')}</label>
        <div style={{ padding: '10px', fontSize: '0.78rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={15} style={{ color: '#C9A84C' }} />
          <span>{formData.timezone}</span>
        </div>
      </div>

      <div style={{ gridColumn: '1 / -1', paddingTop: '8px' }}>
        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)', color: '#0c1520', fontWeight: '800', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}>
          {t('btnSave', 'اعتماد الحلقة وتأكيد الجدولة')}
        </button>
      </div>
    </form>
  );
}
