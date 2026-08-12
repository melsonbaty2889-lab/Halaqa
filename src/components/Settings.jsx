import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Save, Globe, Mail, 
  Database, RefreshCw, CheckCircle2, Upload, 
  Download, Image as ImageIcon, AlertCircle, Trash2, Palette, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase.js';
import colors from '@/constants/colors.js';

export default function Settings({ currentAcademyId, isRtl = true }) {
  const [activeTab, setActiveTab] = useState('identity');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    email: '',
    phone: '',
    brand_color: colors.gold?.DEFAULT || '#D4AF37',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    calendar_type: 'gregorian',
    weekend_days: ['friday', 'saturday']
  });

  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (currentAcademyId) {
      fetchAcademySettings();
    } else {
      setLoading(false);
    }
  }, [currentAcademyId]);

  const fetchAcademySettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .eq('id', currentAcademyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        const fetchedName = typeof data.name === 'object' && data.name !== null
          ? (data.name.ar || data.name.en || '')
          : (data.name || '');

        const fetched = {
          name: fetchedName,
          slug: data.slug || '',
          logo_url: data.logo_url || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          brand_color: data.brand_color || colors.gold?.DEFAULT || '#D4AF37',
          currency: data.currency || 'EGP',
          timezone: data.timezone || 'Africa/Cairo',
          calendar_type: data.calendar_type || 'gregorian',
          weekend_days: data.weekend_days || ['friday', 'saturday']
        };
        setFormData(fetched);
        setInitialData(fetched);
      }
    } catch (err) {
      showToast('حدث خطأ أثناء جلب البيانات: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === initialData.slug ? generatedSlug : prev.slug
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('حجم الصورة يجب ألا يتجاوز 2 ميجابايت', 'error');
      return;
    }

    try {
      setUploadingLogo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentAcademyId || 'academy'}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) throw new Error('تعذر الحصول على رابط الصورة العام');

      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));

      if (currentAcademyId) {
        await supabase
          .from('academies')
          .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', currentAcademyId);
      }

      showToast('تم رفع الشعار وحفظه بنجاح');
    } catch (err) {
      showToast('فشل رفع الشعار: ' + err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
    if (currentAcademyId) {
      await supabase
        .from('academies')
        .update({ logo_url: '', updated_at: new Date().toISOString() })
        .eq('id', currentAcademyId);
    }
    showToast('تم حذف الشعار بنجاح');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast('اسم الأكاديمية مطلوب', 'error');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast('صيغة البريد الإلكتروني غير صحيحة', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        logo_url: formData.logo_url,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        brand_color: formData.brand_color,
        currency: formData.currency,
        timezone: formData.timezone,
        calendar_type: formData.calendar_type,
        weekend_days: formData.weekend_days,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('academies')
        .upsert({ id: currentAcademyId, ...payload });

      if (error) throw error;
      setInitialData(formData);
      showToast('تم حفظ كافة الإعدادات بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء الحفظ: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setFormData(initialData);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `settings-${formData.slug || 'academy'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير الإعدادات بنجاح');
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          setFormData((prev) => ({ ...prev, ...parsed }));
          showToast('تم استيراد الإعدادات بنجاح، اضغط حفظ لتأكيدها');
        } catch (err) {
          showToast('ملف JSON غير صالح', 'error');
        }
      };
    }
  };

  const toggleWeekendDay = (day) => {
    setFormData((prev) => {
      const exists = prev.weekend_days.includes(day);
      const updated = exists
        ? prev.weekend_days.filter((d) => d !== day)
        : [...prev.weekend_days, day];
      return { ...prev, weekend_days: updated };
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.dark?.bg || '#0B0F17', display: 'flex', justifyContent: 'center', alignItems: 'center', color: colors.primary?.DEFAULT || '#3B82F6' }}>
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.gradients?.pageBackground || '#0B0F17',
      padding: '16px 12px 120px 12px',
      direction: isRtl ? 'rtl' : 'ltr',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        maxWidth: '850px',
        margin: '0 auto',
        background: colors.dark?.card || '#111827',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.dark?.border || '#1F2937'}`,
        borderRadius: '20px',
        padding: '20px 16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        
        {/* التنبيهات Toast */}
        {toast && (
          <div style={{ 
            position: 'fixed', 
            top: '20px', 
            left: '50%',
            transform: 'translateX(-50%)', 
            zIndex: 9999, 
            padding: '10px 16px', 
            borderRadius: '12px', 
            color: '#FFF', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.82rem',
            background: toast.type === 'error' ? colors.error?.DEFAULT || '#EF4444' : colors.brandEmerald?.DEFAULT || '#10B981', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)' 
          }}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {toast.message}
          </div>
        )}

        {/* الهيدر الرئيسي */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: colors.text?.title || '#FFF', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Building2 size={24} color={colors.gold?.DEFAULT || '#D4AF37'} /> إعدادات المنظومة
          </h1>
          <p style={{ color: colors.text?.muted || '#9CA3AF', fontSize: '0.78rem', margin: 0 }}>
            إدارة هوية الأكاديمية، الخيارات الإقليمية والنسخ الاحتياطي
          </p>
        </div>

        {/* كارت المعاينة */}
        <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '14px', background: colors.dark?.surface || '#1F2937', border: `1px solid ${colors.dark?.border || '#374151'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', border: `1px solid ${colors.brandEmerald?.DEFAULT || '#10B981'}`, background: colors.dark?.input || '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 color={colors.text?.placeholder || '#6B7280'} size={20} />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: colors.gold?.DEFAULT || '#D4AF37', textTransform: 'uppercase' }}>معاينة هوية المنظومة</span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: colors.text?.title || '#FFF', margin: '1px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.name || 'اسم الأكاديمية'}</h3>
              <p style={{ fontSize: '0.7rem', color: colors.text?.muted || '#9CA3AF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {formData.slug ? `https://${formData.slug}.academy.com` : 'لم يتم تحديد المعرّف'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '16px', background: colors.dark?.buttonDark || '#374151', color: colors.text?.body || '#E5E7EB' }}>
              العملة: {formData.currency}
            </span>
            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '16px', background: colors.brandEmerald?.bgGlow || 'rgba(16, 185, 129, 0.2)', color: colors.brandEmerald?.DEFAULT || '#10B981', fontWeight: '700' }}>
              نشط
            </span>
          </div>
        </div>

        {/* تبويبات التنقل */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', borderBottom: `1px solid ${colors.dark?.border || '#374151'}`, paddingBottom: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[
            { id: 'identity', label: 'الهوية والبصريات', icon: Building2 },
            { id: 'regional', label: 'التواصل والإقليمية', icon: Globe },
            { id: 'backup', label: 'النسخ والبيانات', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  background: isActive ? colors.primary?.DEFAULT || '#3B82F6' : colors.dark?.surface || '#1F2937',
                  color: isActive ? '#FFF' : colors.text?.muted || '#9CA3AF'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* تبويب الهوية والبصريات */}
          {activeTab === 'identity' && (
            <>
              <div style={{ background: colors.dark?.surface || '#1F2937', padding: '16px', borderRadius: '14px', border: `1px solid ${colors.dark?.border || '#374151'}` }}>
                <h2 style={{ fontSize: '0.88rem', fontWeight: '800', color: colors.gold?.DEFAULT || '#D4AF37', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} /> البيانات الأساسية
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: colors.text?.body || '#E5E7EB', marginBottom: '4px' }}>اسم الأكاديمية *</label>
                    <input type="text" value={formData.name} onChange={handleNameChange} placeholder="أكاديمية الفرقان" className="settings-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: colors.text?.body || '#E5E7EB', marginBottom: '4px' }}>المعرّف الفريد (Slug)</label>
                    <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="alfurqan" className="settings-input" style={{ direction: 'ltr' }} />
                  </div>
                </div>

                {/* رفع الشعار */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: colors.gold?.DEFAULT || '#D4AF37', marginBottom: '6px' }}>شعار الأكاديمية (Logo)</label>
                  <div style={{ border: `1px dashed ${colors.brandEmerald?.border || '#059669'}`, borderRadius: '12px', padding: '12px', background: colors.dark?.card || '#111827', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {formData.logo_url ? (
                        <div style={{ position: 'relative' }}>
                          <img src={formData.logo_url} alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', border: `1px solid ${colors.dark?.border || '#374151'}` }} />
                          <button type="button" onClick={handleRemoveLogo} style={{ position: 'absolute', top: '-4px', right: '-4px', background: colors.error?.DEFAULT || '#EF4444', color: '#FFF', border: 'none', borderRadius: '50%', padding: '3px', cursor: 'pointer' }}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: colors.dark?.surface || '#1F2937', border: `1px solid ${colors.dark?.border || '#374151'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text?.placeholder || '#6B7280' }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '700', color: colors.text?.heading || '#F9FAFB' }}>اختر صورة الشعار الرسمية</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.68rem', color: colors.text?.muted || '#9CA3AF' }}>يدعم PNG, JPG حتى 2 ميجابايت</p>
                      </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo} style={{ padding: '7px 12px', borderRadius: '8px', background: colors.dark?.buttonDark || '#374151', border: `1px solid ${colors.dark?.border || '#4B5563'}`, color: '#FFF', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {uploadingLogo ? <RefreshCw className="animate-spin" size={12} /> : <Upload size={12} />}
                      {uploadingLogo ? 'جاري الرفع...' : 'رفع شعار جديد'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: colors.text?.body || '#E5E7EB', marginBottom: '4px' }}>الموقع الإلكتروني</label>
                  <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://academy.com" className="settings-input" style={{ direction: 'ltr' }} />
                </div>
              </div>

              <div style={{ background: colors.dark?.surface || '#1F2937', padding: '16px', borderRadius: '14px', border: `1px solid ${colors.dark?.border || '#374151'}` }}>
                <h2 style={{ fontSize: '0.88rem', fontWeight: '800', color: colors.gold?.DEFAULT || '#D4AF37', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={16} /> لون الهوية الرسمية (Branding)
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="color" value={formData.brand_color} onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '700', color: colors.text?.heading || '#F9FAFB' }}>اللون الرئيسي للواجهة</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.68rem', color: colors.text?.muted || '#9CA3AF' }}>سيتم تطبيق هذا اللون على أزرار وواجهات المنظومة</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* شريط الحفظ العائم المحسّن للموبايل */}
          {isDirty && (
            <div style={{ 
              position: 'fixed', 
              bottom: '12px', 
              left: '12px', 
              right: '12px',
              backgroundColor: colors.dark?.card || '#111827', 
              border: `1px solid ${colors.primary?.DEFAULT || '#3B82F6'}`, 
              padding: '8px 12px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '8px', 
              zIndex: 999,
              backdropFilter: 'blur(12px)',
              boxSizing: 'border-box'
            }}>
              <span style={{ 
                fontSize: '0.72rem', 
                color: colors.gold?.DEFAULT || '#D4AF37', 
                fontWeight: '700', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                minWidth: 0,
                flexShrink: 1
              }}>
                تغييرات غير محفوظة!
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button 
                  type="button" 
                  onClick={handleDiscardChanges}
                  disabled={saving}
                  style={{ 
                    padding: '6px 10px', 
                    borderRadius: '8px', 
                    background: colors.dark?.buttonDark || '#374151', 
                    color: colors.text?.muted || '#9CA3AF', 
                    fontWeight: '700', 
                    border: `1px solid ${colors.dark?.border || '#4B5563'}`, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '0.72rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <X size={13} /> التراجع
                </button>

                <button 
                  type="submit" 
                  disabled={saving} 
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '8px', 
                    background: colors.primary?.DEFAULT || '#3B82F6', 
                    color: '#FFF', 
                    fontWeight: '800', 
                    border: 'none', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '0.72rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {saving ? <RefreshCw className="animate-spin" size={13} /> : <Save size={13} />}
                  <span>{saving ? 'حفظ...' : 'حفظ'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        .settings-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid ${colors.dark?.border || '#374151'};
          background: ${colors.dark?.input || '#111827'};
          color: ${colors.text?.title || '#FFF'};
          font-size: 0.8rem;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        .settings-input:focus {
          border-color: ${colors.primary?.DEFAULT || '#3B82F6'};
        }
      `}</style>
    </div>
  );
}
