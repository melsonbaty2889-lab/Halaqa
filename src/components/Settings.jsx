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
    brand_color: colors.gold.DEFAULT,
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
          brand_color: data.brand_color || colors.gold.DEFAULT,
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
      <div style={{ minHeight: '100vh', background: colors.dark.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', color: colors.primary.DEFAULT }}>
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.gradients.pageBackground,
      padding: '24px 16px 100px 16px',
      direction: isRtl ? 'rtl' : 'ltr',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        maxWidth: '850px',
        margin: '0 auto',
        background: colors.dark.card,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.dark.border}`,
        borderRadius: '24px',
        padding: '28px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        
        {/* التنبيهات Toast */}
        {toast && (
          <div style={{ 
            position: 'fixed', 
            top: '24px', 
            left: '50%',
            transform: 'translateX(-50%)', 
            zIndex: 9999, 
            padding: '12px 20px', 
            borderRadius: '12px', 
            color: colors.text.title, 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: toast.type === 'error' ? colors.error.DEFAULT : colors.brandEmerald.DEFAULT, 
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)' 
          }}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </div>
        )}

        {/* الهيدر الرئيسي */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.text.title, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Building2 size={26} color={colors.gold.DEFAULT} /> إعدادات المنظومة
          </h1>
          <p style={{ color: colors.text.muted, fontSize: '0.82rem', margin: 0 }}>
            إدارة هوية الأكاديمية، الخيارات الإقليمية والنسخ الاحتياطي
          </p>
        </div>

        {/* كارت المعاينة */}
        <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '16px', background: colors.dark.surface, border: `1px solid ${colors.dark.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', border: `1px solid ${colors.brandEmerald.DEFAULT}`, background: colors.dark.input, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 color={colors.text.placeholder} size={24} />
              )}
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: colors.gold.DEFAULT, textTransform: 'uppercase' }}>معاينة هوية المنظومة</span>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: colors.text.title, margin: '2px 0' }}>{formData.name || 'اسم الأكاديمية'}</h3>
              <p style={{ fontSize: '0.75rem', color: colors.text.muted, margin: 0 }}>
                {formData.slug ? `https://${formData.slug}.academy.com` : 'لم يتم تحديد المعرّف'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', background: colors.dark.buttonDark, color: colors.text.body, border: `1px solid ${colors.dark.borderLight}` }}>
              العملة: {formData.currency}
            </span>
            <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', background: colors.brandEmerald.bgGlow, color: colors.brandEmerald.DEFAULT, border: `1px solid ${colors.brandEmerald.border}`, fontWeight: '700' }}>
              نشط
            </span>
          </div>
        </div>

        {/* تبويبات التنقل */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: `1px solid ${colors.dark.border}`, paddingBottom: '12px', overflowX: 'auto' }}>
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
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  background: isActive ? colors.primary.DEFAULT : colors.dark.surface,
                  color: isActive ? colors.text.title : colors.text.muted
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* تبويب الهوية والبصريات */}
          {activeTab === 'identity' && (
            <>
              <div style={{ background: colors.dark.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${colors.dark.border}` }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: colors.gold.DEFAULT, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} /> البيانات الأساسية
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>اسم الأكاديمية *</label>
                    <input type="text" value={formData.name} onChange={handleNameChange} placeholder="أكاديمية الفرقان" className="settings-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>المعرّف الفريد (Slug)</label>
                    <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="alfurqan" className="settings-input" style={{ direction: 'ltr' }} />
                  </div>
                </div>

                {/* رفع الشعار */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.gold.DEFAULT, marginBottom: '8px' }}>شعار الأكاديمية (Logo)</label>
                  <div style={{ border: `1px dashed ${colors.brandEmerald.border}`, borderRadius: '14px', padding: '16px', background: colors.dark.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {formData.logo_url ? (
                        <div style={{ position: 'relative' }}>
                          <img src={formData.logo_url} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: `1px solid ${colors.dark.border}` }} />
                          <button type="button" onClick={handleRemoveLogo} style={{ position: 'absolute', top: '-6px', right: '-6px', background: colors.error.DEFAULT, color: colors.text.title, border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: colors.dark.surface, border: `1px solid ${colors.dark.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text.placeholder }}>
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '700', color: colors.text.heading }}>اختر صورة الشعار الرسمية</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: colors.text.muted }}>يدعم PNG, JPG حتى 2 ميجابايت</p>
                      </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo} style={{ padding: '8px 16px', borderRadius: '10px', background: colors.dark.buttonDark, border: `1px solid ${colors.dark.border}`, color: colors.text.title, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {uploadingLogo ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                      {uploadingLogo ? 'جاري الرفع...' : 'رفع شعار جديد'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>الموقع الإلكتروني</label>
                  <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://academy.com" className="settings-input" style={{ direction: 'ltr' }} />
                </div>
              </div>

              <div style={{ background: colors.dark.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${colors.dark.border}` }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: colors.gold.DEFAULT, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Palette size={18} /> لون الهوية الرسمية (Branding)
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <input type="color" value={formData.brand_color} onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '700', color: colors.text.heading }}>اللون الرئيسي للواجهة</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: colors.text.muted }}>سيتم تطبيق هذا اللون على أزرار وواجهات المنظومة</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* تبويب التواصل والإقليمية */}
          {activeTab === 'regional' && (
            <>
              <div style={{ background: colors.dark.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${colors.dark.border}` }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: colors.gold.DEFAULT, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} /> قنوات التواصل
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>البريد الإلكتروني للتواصل</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="info@academy.com" className="settings-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>رقم الهاتف / الواتساب</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+201000000000" className="settings-input" style={{ direction: 'ltr' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: colors.dark.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${colors.dark.border}` }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: colors.gold.DEFAULT, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} /> التفضيلات الإقليمية
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>العملة الرئيسية</label>
                    <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="settings-input">
                      <option value="EGP">جنيه مصري (EGP)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>المنطقة الزمنية</label>
                    <select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="settings-input">
                      <option value="Africa/Cairo">توقيت القاهرة (GMT+2/3)</option>
                      <option value="Asia/Riyadh">توقيت مكة المكرمة (GMT+3)</option>
                      <option value="UTC">التوقيت العالمي (UTC)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.text.body, marginBottom: '6px' }}>نوع التقويم</label>
                    <select value={formData.calendar_type} onChange={(e) => setFormData({ ...formData, calendar_type: e.target.value })} className="settings-input">
                      <option value="gregorian">ميلادي</option>
                      <option value="hijri">هجري</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: colors.gold.DEFAULT, marginBottom: '8px' }}>أيام العطلة الأسبوعية</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'thursday', label: 'الخميس' },
                      { key: 'friday', label: 'الجمعة' },
                      { key: 'saturday', label: 'السبت' },
                      { key: 'sunday', label: 'الأحد' }
                    ].map((day) => {
                      const active = formData.weekend_days.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => toggleWeekendDay(day.key)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            border: active ? `1px solid ${colors.gold.DEFAULT}` : `1px solid ${colors.dark.border}`,
                            background: active ? colors.gold.glow : colors.dark.card,
                            color: active ? colors.gold.DEFAULT : colors.text.muted,
                            cursor: 'pointer'
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* تبويب النسخ الاحتياطي */}
          {activeTab === 'backup' && (
            <div style={{ background: colors.dark.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${colors.dark.border}` }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: colors.gold.DEFAULT, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} /> النسخ الاحتياطي واستعادة الإعدادات
              </h2>
              <p style={{ fontSize: '0.78rem', color: colors.text.muted, marginBottom: '16px' }}>
                يمكنك تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في بيئة أخرى بسهولة.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" onClick={handleExport} style={{ padding: '10px 16px', borderRadius: '10px', background: colors.dark.buttonDark, border: `1px solid ${colors.dark.border}`, color: colors.text.title, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={15} /> تصدير ملف الإعدادات (JSON)
                </button>
                <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                <button type="button" onClick={() => importInputRef.current?.click()} style={{ padding: '10px 16px', borderRadius: '10px', background: colors.dark.buttonDark, border: `1px solid ${colors.dark.border}`, color: colors.text.title, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={15} /> استيراد من ملف (JSON)
                </button>
              </div>
            </div>
          )}

          {/* شريط الحفظ العائم التفاعلي والمستجيب للهواتف */}
          {isDirty && (
            <div style={{ 
              position: 'fixed', 
              bottom: '16px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: 'calc(100% - 32px)',
              maxWidth: '600px',
              backgroundColor: colors.dark.card, 
              border: `1px solid ${colors.primary.DEFAULT}`, 
              padding: '12px 18px', 
              borderRadius: '16px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '12px', 
              zIndex: 200,
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '0.8rem', color: colors.gold.DEFAULT, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                هناك تغييرات غير محفوظة!
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button 
                  type="button" 
                  onClick={handleDiscardChanges}
                  disabled={saving}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '10px', 
                    background: colors.dark.buttonDark, 
                    color: colors.text.muted, 
                    fontWeight: '700', 
                    border: `1px solid ${colors.dark.border}`, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '0.78rem' 
                  }}
                >
                  <X size={14} /> التراجع
                </button>

                <button 
                  type="submit" 
                  disabled={saving} 
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    background: colors.primary.DEFAULT, 
                    color: colors.text.title, 
                    fontWeight: '800', 
                    border: 'none', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.78rem' 
                  }}
                >
                  {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        .settings-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid ${colors.dark.border};
          background: ${colors.dark.input};
          color: ${colors.text.title};
          font-size: 0.82rem;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        .settings-input:focus {
          border-color: ${colors.primary.DEFAULT};
          box-shadow: 0 0 0 2px ${colors.primary.focusRing};
        }
      `}</style>
    </div>
  );
}
