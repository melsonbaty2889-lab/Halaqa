// src/components/Settings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Save, Globe, Clock, Calendar, Mail, Phone, 
  ShieldCheck, Database, RefreshCw, CheckCircle2, Upload, 
  Download, Image as ImageIcon, AlertCircle, Trash2, Sliders, Palette, Layers
} from 'lucide-react';
import { Card, Input, Select, Btn as Button } from '@/components/UI/UI.jsx';
import { supabase } from '@/lib/supabase.js';

export default function Settings({ currentAcademyId, isRtl = true }) {
  const [activeTab, setActiveTab] = useState('identity'); // identity | regional | backup
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    email: '',
    phone: '',
    brand_color: '#d97706',
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
        // قراءة الاسم كنص مباشر وبدون كائنات
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
          brand_color: data.brand_color || '#d97706',
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
      <div className="flex justify-center items-center min-h-[350px] text-slate-100">
        <RefreshCw className="animate-spin text-amber-600" size={32} />
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-6 text-slate-100 ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl text-white font-semibold shadow-2xl flex items-center gap-2 transition-all ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.message}
        </div>
      )}

      {/* Main Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-amber-600 mb-2 flex items-center justify-center gap-3">
          <Building2 size={28} /> إعدادات المنظومة
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          إدارة هوية الأكاديمية، الخيارات الإقليمية والنسخ الاحتياطي
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden transition-all"
            style={{ borderColor: formData.brand_color }}
          >
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-slate-500" size={24} />
            )}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: formData.brand_color }}>
              معاينة هوية المنظومة
            </span>
            <h3 className="text-lg font-bold text-white">{formData.name || 'اسم الأكاديمية'}</h3>
            <p className="text-xs text-slate-400">
              {formData.slug ? `https://${formData.slug}.academy.com` : 'لم يتم تحديد المعرّف'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            العملة: {formData.currency}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            نشط
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3 overflow-x-auto">
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
              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Tab 1: Identity & Branding */}
        {activeTab === 'identity' && (
          <>
            <Card>
              <h2 className="text-amber-500 text-lg font-bold mb-5 flex items-center gap-2">
                <Building2 size={20} /> البيانات الأساسية
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="اسم الأكاديمية *"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="أكاديمية الفرقان"
                />

                <Input
                  label="المعرّف الفريد (Slug)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="alfurqan"
                />
              </div>

              {/* Logo Upload */}
              <div className="my-4">
                <label className="text-xs text-amber-500 font-bold block mb-2 text-start">
                  شعار الأكاديمية (Logo)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-4 bg-slate-900/40 transition-all flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {formData.logo_url ? (
                      <div className="relative group">
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                        <ImageIcon size={28} />
                      </div>
                    )}
                    <div className="text-start">
                      <p className="text-sm font-semibold text-slate-200">اختر صورة الشعار الرسمية</p>
                      <p className="text-xs text-slate-400">يدعم PNG, JPG حتى 2 ميجابايت</p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                    {uploadingLogo ? 'جاري الرفع...' : 'رفع شعار جديد'}
                  </Button>
                </div>
              </div>

              <Input
                label="الموقع الإلكتروني"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://academy.com"
              />
            </Card>

            <Card>
              <h2 className="text-amber-500 text-lg font-bold mb-4 flex items-center gap-2">
                <Palette size={20} /> لون الهوية الرسمية (Branding)
              </h2>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={formData.brand_color} 
                  onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                  className="w-12 h-12 rounded-xl border-0 cursor-pointer bg-transparent"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-200">اللون الرئيسي للواجهة</p>
                  <p className="text-xs text-slate-400">سيتم تطبيق هذا اللون على أزرار وواجهات المنظومة</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Tab 2: Contact & Regional */}
        {activeTab === 'regional' && (
          <>
            <Card>
              <h2 className="text-amber-500 text-lg font-bold mb-5 flex items-center gap-2">
                <Mail size={20} /> قنوات التواصل
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="البريد الإلكتروني للتواصل"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@academy.com"
                />

                <Input
                  label="رقم الهاتف / الواتساب"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+201000000000"
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-amber-500 text-lg font-bold mb-5 flex items-center gap-2">
                <Globe size={20} /> التفضيلات الإقليمية
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Select
                  label="العملة الرئيسية"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  options={[
                    { value: 'EGP', label: 'جنيه مصري (EGP)' },
                    { value: 'USD', label: 'دولار أمريكي (USD)' },
                    { value: 'SAR', label: 'ريال سعودي (SAR)' },
                    { value: 'AED', label: 'درهم إماراتي (AED)' }
                  ]}
                />

                <Select
                  label="المنطقة الزمنية"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  options={[
                    { value: 'Africa/Cairo', label: 'توقيت القاهرة (GMT+2/3)' },
                    { value: 'Asia/Riyadh', label: 'توقيت مكة المكرمة (GMT+3)' },
                    { value: 'UTC', label: 'التوقيت العالمي (UTC)' }
                  ]}
                />

                <Select
                  label="نوع التقويم"
                  value={formData.calendar_type}
                  onChange={(e) => setFormData({ ...formData, calendar_type: e.target.value })}
                  options={[
                    { value: 'gregorian', label: 'ميلادي' },
                    { value: 'hijri', label: 'هجري' }
                  ]}
                />
              </div>

              <div>
                <label className="text-xs text-amber-500 font-bold block mb-3 text-start">
                  أيام العطلة الأسبوعية
                </label>
                <div className="flex gap-2 flex-wrap">
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
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          active 
                            ? 'border-amber-600 bg-amber-500/10 text-amber-500' 
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Tab 3: Backup & Restore */}
        {activeTab === 'backup' && (
          <Card>
            <h2 className="text-amber-500 text-lg font-bold mb-4 flex items-center gap-2">
              <Database size={20} /> النسخ الاحتياطي واستعادة الإعدادات
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              يمكنك تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في بيئة أخرى بسهولة.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button type="button" variant="ghost" onClick={handleExport}>
                <Download size={16} /> تصدير ملف الإعدادات (JSON)
              </Button>
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button type="button" variant="ghost" onClick={() => importInputRef.current?.click()}>
                <Upload size={16} /> استيراد من ملف (JSON)
              </Button>
            </div>
          </Card>
        )}

        {/* Floating Save Bar */}
        {isDirty && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-amber-500/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-fade-in">
            <span className="text-xs text-amber-500 font-medium">هناك تغييرات غير محفوظة!</span>
            <Button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-bold">
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات الآن'}
            </Button>
          </div>
        )}

      </form>
    </div>
  );
}
