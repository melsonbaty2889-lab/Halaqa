import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Clock, 
  FolderOpen, 
  Plus, 
  Archive, 
  Search, 
  Globe, 
  X,
  Video,
  Radio
} from 'lucide-react';

export default function ActiveHalaqas({ 
  halaqas = [], 
  teachers = [], 
  isLoading = false, 
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
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #111e2e 0%, #0c1520 100%)',
        padding: '24px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#C9A84C', fontWeight: 'bold' }}>جاري تحميل الحلقات...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #111e2e 0%, #0c1520 100%)',
      padding: '24px 16px',
      direction: isRtl ? 'rtl' : 'ltr',
      textAlign: isRtl ? 'right' : 'left',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'rgba(21, 35, 50, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        borderRadius: '24px',
        padding: '28px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* الهيدر الرئيسي */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ padding: '8px', borderRadius: '12px', background: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C', border: '1px solid rgba(201, 168, 76, 0.25)', display: 'inline-flex' }}>
                <Radio size={20} />
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                {t('halaqasManager', 'منصة إدارة الحلقات القرآنية والأكاديمية')}
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', margin: 0 }}>
              {t('halaqaSub', 'إدارة الجلسات التعليمية، توزيع المعلمين، ومتابعة المسارات القرآنية سحابياً')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: showForm ? '#0c1520' : 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)',
                color: showForm ? '#cbd5e1' : '#0c1520',
                border: showForm ? '1px solid rgba(255,255,255,0.12)' : 'none'
              }}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? t('close', 'إغلاق') : t('addHalaqa', 'إنشاء حلقة جديدة')}
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'active' ? 'archived' : 'active')}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: viewMode === 'active' ? '#0c1520' : 'rgba(201, 168, 76, 0.15)',
                color: viewMode === 'active' ? '#94a3b8' : '#C9A84C',
                border: viewMode === 'active' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(201, 168, 76, 0.3)'
              }}
            >
              <Archive size={16} />
              {viewMode === 'active' ? t('viewArchived', 'الأرشيف') : t('viewActive', 'الحلقات النشطة')}
            </button>
          </div>
        </div>

        {/* نموذج إنشاء حلقة */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ padding: '20px', marginBottom: '20px', borderRadius: '16px', border: '1px solid rgba(201, 168, 76, 0.3)', background: '#0c1520', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>{t('nameAr', 'اسم الحلقة (بالعربية)')}</label>
              <input type="text" required placeholder="مثال: حلقة الإمام الشاطبي" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>{t('nameEn', 'اسم الحلقة (بالإنجليزية)')}</label>
              <input type="text" placeholder="e.g. Al-Shatibi Quran Circle" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>{t('assignTeacher', 'تعيين المعلم المسؤول')}</label>
              <select required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}>
                <option value="">{t('selectTeacher', '-- اختر المعلم المعتمد --')}</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{getLocalizedText(teacher.name || teacher.full_name)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>{t('track', 'المسار التعليمي')}</label>
              <select value={formData.educational_track} onChange={e => setFormData({...formData, educational_track: e.target.value})} style={{ padding: '10px 12px', fontSize: '0.82rem', borderRadius: '10px', background: 'rgba(21, 35, 50, 0.92)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}>
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
        )}

        {/* شريط البحث */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: '#64748B' }} />
          <input 
            type="text" 
            placeholder={t('searchPh', 'ابحث باسم الحلقة أو اسم المعلم المكلف...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              paddingRight: isRtl ? '40px' : '14px',
              paddingLeft: isRtl ? '14px' : '40px',
              fontSize: '0.85rem',
              borderRadius: '12px',
              background: '#0c1520',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* شبكة الكروت */}
        {filteredHalaqas.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '16px', background: '#0c1520' }}>
            <FolderOpen size={32} style={{ color: '#64748B', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>{t('noData', 'لا توجد جلسات تعليمية مسجلة طابق بحثك حالياً')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredHalaqas.map((halaqa) => (
              <div key={halaqa.id} style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: '#0c1520', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', margin: 0 }}>{getLocalizedText(halaqa.name)}</h4>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', fontWeight: '700' }}>
                      {t('activeSession', 'جلسة نشطة')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
                    <User size={14} style={{ color: '#C9A84C' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned', 'بانتظار تعيين معتمد'))}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <Clock size={13} style={{ color: '#64748B' }} />
                    <span>{halaqa.start_time || '16:00'} - {halaqa.end_time || '17:15'}</span>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(21, 35, 50, 0.92)', padding: '2px 6px', borderRadius: '6px', color: '#94a3b8' }}>
                      {halaqa.timezone || 'UTC'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                  <button 
                    onClick={() => onNavigateToAttendance?.(halaqa.id)} 
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)',
                      color: '#0c1520',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Video size={14} />
                    {t('goToAttendance', 'الانضمام للجلسة المباشرة')}
                  </button>

                  <button 
                    onClick={() => onToggleArchiveHalaqa?.(halaqa.id, halaqa.is_archived)} 
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent',
                      color: '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
