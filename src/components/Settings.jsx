import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Save, Globe, Mail, 
  Database, RefreshCw, CheckCircle2, Upload, 
  Download, Image as ImageIcon, AlertCircle, Trash2, Palette, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase.js';

export default function Settings({ currentAcademyId, isRtl = true }) {
  const [activeTab, setActiveTab] = useState('identity');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    email: '',
    phone: '',
    brand_color: '#D4AF37',
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
          brand_color: data.brand_color || '#D4AF37',
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
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-blue-500">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 pb-36 font-sans ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl">
        
        {/* التنبيهات Toast */}
        {toast && (
          <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-2xl text-xs sm:text-sm text-white transition-all ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </div>
        )}

        {/* الهيدر الرئيسي */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-center gap-2 mb-1">
            <Building2 className="text-amber-400" size={26} /> إعدادات المنظومة
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            إدارة هوية الأكاديمية، الخيارات الإقليمية والنسخ الاحتياطي
          </p>
        </div>

        {/* كارت المعاينة */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl border border-emerald-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-slate-500" size={22} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">معاينة هوية المنظومة</span>
              <h3 className="text-base font-extrabold text-white truncate">{formData.name || 'اسم الأكاديمية'}</h3>
              <p className="text-xs text-slate-400 truncate dir-ltr text-right">
                {formData.slug ? `https://${formData.slug}.academy.com` : 'لم يتم تحديد المعرّف'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              العملة: {formData.currency}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              نشط
            </span>
          </div>
        </div>

        {/* تبويبات التنقل */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border-none ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* تبويب الهوية والبصريات */}
          {activeTab === 'identity' && (
            <>
              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <h2 className="text-sm sm:text-base font-extrabold text-amber-400 mb-4 flex items-center gap-2">
                  <Building2 size={18} /> البيانات الأساسية
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الأكاديمية *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={handleNameChange} 
                      placeholder="أكاديمية الفرقان" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">المعرّف الفريد (Slug)</label>
                    <input 
                      type="text" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} 
                      placeholder="alfurqan" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr" 
                    />
                  </div>
                </div>

                {/* رفع الشعار */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-amber-400 mb-2">شعار الأكاديمية (Logo)</label>
                  <div className="border border-dashed border-emerald-500/40 rounded-xl p-3.5 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {formData.logo_url ? (
                        <div className="relative group">
                          <img src={formData.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-slate-700" />
                          <button 
                            type="button" 
                            onClick={handleRemoveLogo} 
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white border-none rounded-full p-1 cursor-pointer hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          <ImageIcon size={22} />
                        </div>
                      )}
                      <div>
                        <p className="m-0 text-xs font-bold text-slate-200">اختر صورة الشعار الرسمية</p>
                        <p className="m-0 mt-0.5 text-[11px] text-slate-400">يدعم PNG, JPG حتى 2 ميجابايت</p>
                      </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={uploadingLogo} 
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      {uploadingLogo ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                      {uploadingLogo ? 'جاري الرفع...' : 'رفع شعار جديد'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الموقع الإلكتروني</label>
                  <input 
                    type="text" 
                    value={formData.website} 
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                    placeholder="https://academy.com" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr" 
                  />
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <h2 className="text-sm sm:text-base font-extrabold text-amber-400 mb-3 flex items-center gap-2">
                  <Palette size={18} /> لون الهوية الرسمية (Branding)
                </h2>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={formData.brand_color} 
                    onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} 
                    className="w-11 h-11 rounded-xl border-0 cursor-pointer bg-transparent" 
                  />
                  <div>
                    <p className="m-0 text-xs font-bold text-slate-200">اللون الرئيسي للواجهة</p>
                    <p className="m-0 mt-0.5 text-[11px] text-slate-400">سيتم تطبيق هذا اللون على أزرار وواجهات المنظومة</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* تبويب التواصل والإقليمية */}
          {activeTab === 'regional' && (
            <>
              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <h2 className="text-sm sm:text-base font-extrabold text-amber-400 mb-4 flex items-center gap-2">
                  <Mail size={18} /> قنوات التواصل
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني للتواصل</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      placeholder="info@academy.com" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف / الواتساب</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      placeholder="+201000000000" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <h2 className="text-sm sm:text-base font-extrabold text-amber-400 mb-4 flex items-center gap-2">
                  <Globe size={18} /> التفضيلات الإقليمية
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">العملة الرئيسية</label>
                    <select 
                      value={formData.currency} 
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })} 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="EGP">جنيه مصري (EGP)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">المنطقة الزمنية</label>
                    <select 
                      value={formData.timezone} 
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="Africa/Cairo">توقيت القاهرة (GMT+2/3)</option>
                      <option value="Asia/Riyadh">توقيت مكة المكرمة (GMT+3)</option>
                      <option value="UTC">التوقيت العالمي (UTC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع التقويم</label>
                    <select 
                      value={formData.calendar_type} 
                      onChange={(e) => setFormData({ ...formData, calendar_type: e.target.value })} 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="gregorian">ميلادي</option>
                      <option value="hijri">هجري</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-2">أيام العطلة الأسبوعية</label>
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
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            active 
                              ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                          }`}
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
            <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <h2 className="text-sm sm:text-base font-extrabold text-amber-400 mb-2 flex items-center gap-2">
                <Database size={18} /> النسخ الاحتياطي واستعادة الإعدادات
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                يمكنك تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في بيئة أخرى بسهولة.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button 
                  type="button" 
                  onClick={handleExport} 
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold cursor-pointer flex items-center gap-2 transition-all"
                >
                  <Download size={15} /> تصدير ملف الإعدادات (JSON)
                </button>
                <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                <button 
                  type="button" 
                  onClick={() => importInputRef.current?.click()} 
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold cursor-pointer flex items-center gap-2 transition-all"
                >
                  <Upload size={15} /> استيراد من ملف (JSON)
                </button>
              </div>
            </div>
          )}

          {/* شريط الحفظ العائم بـ Tailwind CSS */}
          {isDirty && (
            <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-auto bg-slate-900/95 border border-blue-500/50 p-2.5 px-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 z-50 backdrop-blur-md">
              <span className="text-xs text-amber-400 font-bold whitespace-nowrap truncate">
                تغييرات غير محفوظة!
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  onClick={handleDiscardChanges}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 cursor-pointer flex items-center gap-1 text-xs whitespace-nowrap transition-all"
                >
                  <X size={13} /> التراجع
                </button>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold border-none cursor-pointer flex items-center gap-1 text-xs whitespace-nowrap transition-all shadow-md shadow-blue-600/30"
                >
                  {saving ? <RefreshCw className="animate-spin" size={13} /> : <Save size={13} />}
                  <span>{saving ? 'حفظ...' : 'حفظ'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
