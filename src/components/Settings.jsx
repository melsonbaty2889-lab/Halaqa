import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Save, Globe, Mail, 
  Database, RefreshCw, CheckCircle2, Upload, 
  Download, Image as ImageIcon, AlertCircle, Trash2, Palette, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase.js';
import { Select } from '@/components/UI/UI.jsx';
import { useAcademy } from '@/context/AcademyContext';

export default function Settings({ currentAcademyId: propAcademyId, isRtl = true, onCurrencyChange }) {
  // 1. جلب الأكاديمية من الـ Context كخيار احتياطي أساسي
  const { academy, currentAcademy } = useAcademy();
  
  // 2. اعتماد الـ ID المتاح (سواء الممرر عبر Props أو الموجود في Context)
  const activeAcademy = academy || currentAcademy;
  const currentAcademyId = propAcademyId || activeAcademy?.id;

  const [activeTab, setActiveTab] = useState('identity');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    email: '',
    phone: '',
    brand_color: '#D97706',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    calendar_type: 'gregorian',
    weekend_days: ['friday', 'saturday']
  });

  const [rawAcademyData, setRawAcademyData] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  // التحقق المباشر من صلاحية الـ ID كـ UUID
  const isValidAcademyId = Boolean(
    currentAcademyId && 
    currentAcademyId !== 'undefined' && 
    typeof currentAcademyId === 'string' &&
    currentAcademyId.trim() !== ''
  );

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isValidAcademyId) {
      fetchAcademySettings();
    } else {
      setLoading(false);
    }
  }, [currentAcademyId, isRtl]);

  const fetchAcademySettings = async () => {
    if (!isValidAcademyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .eq('id', currentAcademyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setRawAcademyData(data);
        
        let fetchedName = '';
        if (typeof data.name === 'object' && data.name !== null) {
          fetchedName = isRtl ? (data.name.ar || data.name.en || '') : (data.name.en || data.name.ar || '');
        } else {
          fetchedName = data.name || '';
        }

        const fetched = {
          name: fetchedName,
          slug: data.slug || '',
          logo_url: data.logo_url || '',
          website: data.website || '',
          email: data.contact_email || '',
          phone: data.contact_phone || '',
          brand_color: data.brand_color || '#D97706',
          currency: data.currency || 'EGP',
          timezone: data.timezone || 'Africa/Cairo',
          calendar_type: data.calendar_type || 'gregorian',
          weekend_days: Array.isArray(data.weekend_days) ? data.weekend_days : ['friday', 'saturday']
        };
        setFormData(fetched);
        setInitialData(fetched);

        // إعلام الهيدر بالعملة الحالية فور تحميل البيانات وتخزينها محلياً
        localStorage.setItem('app_currency', fetched.currency);
        window.dispatchEvent(new CustomEvent('currencyUpdated', { detail: fetched.currency }));
        if (onCurrencyChange && fetched.currency) {
          onCurrencyChange(fetched.currency);
        }
      }
    } catch (err) {
      showToast(isRtl ? 'حدث خطأ أثناء جلب البيانات: ' + err.message : 'Error fetching data: ' + err.message, 'error');
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

    if (!isValidAcademyId) {
      showToast(isRtl ? 'تعذر رفع الشعار: معرّف الأكاديمية غير صالح' : 'Cannot upload logo: Invalid Academy ID', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast(isRtl ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast(isRtl ? 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت' : 'Image size must not exceed 2MB', 'error');
      return;
    }

    try {
      setUploadingLogo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${currentAcademyId}-${Date.now()}.${fileExt}`;

      // 1. الرفع المباشر إلى Bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Storage error:', uploadError);
        throw new Error(`[Storage] ${uploadError.message}`);
      }

      // 2. استخراج الرابط العام
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) throw new Error(isRtl ? 'تعذر الحصول على رابط الصورة العام' : 'Failed to get public image URL');

      // تحديث حالة الفورم
      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));

      // 3. تحديث جدول الأكاديميات
      const { error: dbError } = await supabase
        .from('academies')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', currentAcademyId);

      if (dbError) {
        console.error('DB error:', dbError);
        throw new Error(`[Database RLS] ${dbError.message}`);
      }

      showToast(isRtl ? 'تم رفع الشعار بنجاح' : 'Logo uploaded successfully');
    } catch (err) {
      showToast((isRtl ? 'فشل رفع الشعار: ' : 'Logo upload failed: ') + err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
    if (isValidAcademyId) {
      await supabase
        .from('academies')
        .update({ logo_url: '', updated_at: new Date().toISOString() })
        .eq('id', currentAcademyId);
    }
    showToast(isRtl ? 'تم حذف الشعار بنجاح' : 'Logo removed successfully');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast(isRtl ? 'اسم الأكاديمية مطلوب' : 'Academy name is required', 'error');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast(isRtl ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!isValidAcademyId) {
      showToast(
        isRtl 
          ? 'تعذّر الحفظ: لم يتم التعرف على معرّف الأكاديمية الحالية' 
          : 'Save failed: Academy ID is missing or invalid', 
        'error'
      );
      return;
    }

    if (!validateForm()) return;

    try {
      setSaving(true);

      let namePayload = {};
      if (rawAcademyData && typeof rawAcademyData.name === 'object' && rawAcademyData.name !== null) {
        namePayload = {
          ...rawAcademyData.name,
          [isRtl ? 'ar' : 'en']: formData.name.trim()
        };
      } else {
        namePayload = {
          ar: formData.name.trim(),
          en: formData.name.trim()
        };
      }

      let formattedSlug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (!formattedSlug) {
        formattedSlug = `academy-${currentAcademyId ? String(currentAcademyId).slice(0, 8) : Date.now()}`;
      }

      const updatePayload = {
        name: namePayload,
        slug: formattedSlug,
        logo_url: formData.logo_url || null,
        website: formData.website || null,
        contact_email: formData.email || null,
        contact_phone: formData.phone || null,
        currency: formData.currency,
        timezone: formData.timezone,
        calendar_type: formData.calendar_type,
        weekend_days: Array.isArray(formData.weekend_days) ? formData.weekend_days : ['friday', 'saturday'],
        brand_color: formData.brand_color,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('academies')
        .update(updatePayload)
        .eq('id', currentAcademyId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(isRtl ? 'تعذر التحديث، يرجى التأكد من صلاحيات RLS أو معرّف الأكاديمية' : 'Update failed, check RLS or Academy ID');
      }

      const updatedState = {
        ...formData,
        slug: formattedSlug
      };

      setFormData(updatedState);
      setInitialData(updatedState);

      // 🔴 التعديل الأساسي والمباشر: حفظ العملة محلياً وإطلاق حدث البث للهيدر
      localStorage.setItem('app_currency', formData.currency);
      window.dispatchEvent(new CustomEvent('currencyUpdated', { detail: formData.currency }));

      if (onCurrencyChange && formData.currency) {
        onCurrencyChange(formData.currency);
      }

      showToast(isRtl ? 'تم حفظ كافة الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (err) {
      showToast((isRtl ? 'حدث خطأ أثناء الحفظ: ' : 'Error saving: ') + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setFormData(initialData);
  };

  const handleExport = () => {
    const exportSlug = formData.slug && formData.slug !== '-' ? formData.slug : 'academy';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `settings-${exportSlug}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(isRtl ? 'تم تصدير الإعدادات بنجاح' : 'Settings exported successfully');
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          setFormData((prev) => ({ 
            ...prev, 
            ...parsed,
            weekend_days: Array.isArray(parsed.weekend_days) ? parsed.weekend_days : ['friday', 'saturday']
          }));
          showToast(isRtl ? 'تم استيراد الإعدادات بنجاح، اضغط حفظ لتأكيدها' : 'Settings imported successfully, click save to confirm');
        } catch (err) {
          showToast(isRtl ? 'ملف JSON غير صالح' : 'Invalid JSON file', 'error');
        }
      };
    }
  };

  const toggleWeekendDay = (day) => {
    setFormData((prev) => {
      const days = Array.isArray(prev.weekend_days) ? prev.weekend_days : [];
      const exists = days.includes(day);
      const updated = exists
        ? days.filter((d) => d !== day)
        : [...days, day];
      return { ...prev, weekend_days: updated };
    });
  };

  const currencyOptions = [
    { label: isRtl ? 'جنيه مصري (EGP)' : 'Egyptian Pound (EGP)', value: 'EGP' },
    { label: isRtl ? 'ريال سعودي (SAR)' : 'Saudi Riyal (SAR)', value: 'SAR' },
    { label: isRtl ? 'درهم إماراتي (AED)' : 'UAE Dirham (AED)', value: 'AED' },
    { label: isRtl ? 'دينار كويتي (KWD)' : 'Kuwaiti Dinar (KWD)', value: 'KWD' },
    { label: isRtl ? 'ريال قطري (QAR)' : 'Qatari Riyal (QAR)', value: 'QAR' },
    { label: isRtl ? 'ريال عماني (OMR)' : 'Omani Rial (OMR)', value: 'OMR' },
    { label: isRtl ? 'دينار بحريني (BHD)' : 'Bahraini Dinar (BHD)', value: 'BHD' },
    { label: isRtl ? 'دينار أردني (JOD)' : 'Jordanian Dinar (JOD)', value: 'JOD' },
    { label: isRtl ? 'درهم مغربي (MAD)' : 'Moroccan Dirham (MAD)', value: 'MAD' },
    { label: isRtl ? 'دولار أمريكي (USD)' : 'US Dollar (USD)', value: 'USD' },
    { label: isRtl ? 'يورو (EUR)' : 'Euro (EUR)', value: 'EUR' },
    { label: isRtl ? 'جنيه إسترليني (GBP)' : 'British Pound (GBP)', value: 'GBP' },
    { label: isRtl ? 'دولار كندي (CAD)' : 'Canadian Dollar (CAD)', value: 'CAD' },
    { label: isRtl ? 'ليرة تركية (TRY)' : 'Turkish Lira (TRY)', value: 'TRY' },
    { label: isRtl ? 'دولار أسترالي (AUD)' : 'Australian Dollar (AUD)', value: 'AUD' }
  ];

  const timezoneOptions = [
    { label: isRtl ? 'توقيت القاهرة (GMT+2/3)' : 'Cairo Time (GMT+2/3)', value: 'Africa/Cairo' },
    { label: isRtl ? 'توقيت مكة المكرمة (GMT+3)' : 'Makkah Time (GMT+3)', value: 'Asia/Riyadh' },
    { label: isRtl ? 'توقيت دبي (GMT+4)' : 'Dubai Time (GMT+4)', value: 'Asia/Dubai' },
    { label: isRtl ? 'التوقيت العالمي الموحد (UTC)' : 'Coordinated Universal Time (UTC)', value: 'UTC' }
  ];

  const calendarOptions = [
    { label: isRtl ? 'ميلادي (Gregorian)' : 'Gregorian', value: 'gregorian' },
    { label: isRtl ? 'هجري (Hijri)' : 'Hijri', value: 'hijri' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex justify-center items-center text-[var(--primary)]">
        <RefreshCw className="spin-animation" size={32} />
      </div>
    );
  }

  const activeWeekendDays = Array.isArray(formData.weekend_days) ? formData.weekend_days : [];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`min-h-screen bg-[var(--bg-dark)] text-[var(--text-main)] p-3 sm:p-6 pb-40 font-sans ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="w-full max-w-4xl mx-auto card-surface !p-4 sm:!p-7 border-0 sm:border rounded-xl sm:rounded-2xl relative">
        
        {toast && (
          <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-2xl text-xs sm:text-sm text-white transition-all ${
            toast.type === 'error' ? 'bg-[var(--danger)]' : 'bg-[var(--emerald)]'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </div>
        )}

        <div className="mb-6 border-b border-[var(--border-light)] pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 text-[var(--text-main)]">
            <Building2 className="text-[var(--primary)]" size={24} />
            {isRtl ? 'إعدادات المنظومة' : 'Platform Settings'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            {isRtl ? 'إدارة هوية الأكاديمية، الخيارات الإقليمية والنسخ الاحتياطي' : 'Manage academy identity, regional options, and backups'}
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl border border-[var(--border-light)] bg-[var(--surface-input)] flex items-center justify-center overflow-hidden shrink-0">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-[var(--text-muted)]" size={22} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider block">
                {isRtl ? 'معاينة هوية المنظومة' : 'Identity Live Preview'}
              </span>
              <h3 className="text-base font-extrabold text-[var(--text-main)] truncate">
                {formData.name || (isRtl ? 'أدخل اسم الأكاديمية' : 'Enter Academy Name')}
              </h3>
              <p className="text-xs text-[var(--text-muted)] truncate dir-ltr text-start">
                {formData.slug && formData.slug !== '-' ? `https://${formData.slug}.smart-halaqa.com` : (isRtl ? 'لم يتم تحديد المعرّف الفريد' : 'No slug specified')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--surface-dark)] text-[var(--text-muted)] border border-[var(--border-light)] font-medium">
              {isRtl ? `العملة: ${formData.currency}` : `Currency: ${formData.currency}`}
            </span>
            <span className="badge-active">{isRtl ? 'نشط' : 'Active'}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--border-light)] pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'identity', label: isRtl ? 'الهوية والبصريات' : 'Identity & Branding', icon: Building2 },
            { id: 'regional', label: isRtl ? 'التواصل والإقليمية' : 'Contact & Regional', icon: Globe },
            { id: 'backup', label: isRtl ? 'النسخ والبيانات' : 'Backup & Data', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-none whitespace-nowrap ${
                  isActive 
                    ? 'btn-primary' 
                    : 'btn-secondary !border-transparent hover:!border-[var(--border-light)]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'identity' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                  <Building2 size={16} /> {isRtl ? 'البيانات الأساسية' : 'Basic Information'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">
                      {isRtl ? 'اسم الأكاديمية *' : 'Academy Name *'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={handleNameChange} 
                      placeholder={isRtl ? 'أدخل اسم الأكاديمية الرسمي...' : 'Enter official academy name...'} 
                      className="app-input" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">
                      {isRtl ? 'المعرّف الفريد (Slug)' : 'Unique Slug'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} 
                      placeholder="academy-slug" 
                      className="app-input text-start dir-ltr" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">
                    {isRtl ? 'شعار الأكاديمية (Logo)' : 'Academy Logo'}
                  </label>
                  <div className="border border-dashed border-[var(--border-input)] rounded-xl p-3.5 bg-[var(--surface-input)] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {formData.logo_url ? (
                        <div className="relative group shrink-0">
                          <img src={formData.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-[var(--border-light)]" />
                          <button 
                            type="button" 
                            onClick={handleRemoveLogo} 
                            className="absolute -top-1.5 -right-1.5 bg-[var(--danger)] text-white border-none rounded-full p-1 cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[var(--surface-dark)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                          <ImageIcon size={22} />
                        </div>
                      )}
                      <div>
                        <p className="m-0 text-xs font-bold text-[var(--text-main)]">
                          {isRtl ? 'رفع صورة الشعار الرسمية' : 'Upload Official Logo Image'}
                        </p>
                        <p className="m-0 mt-0.5 text-[10px] text-[var(--text-muted)]">
                          {isRtl ? 'صيغ PNG, JPG بحد أقصى 2 ميجابايت' : 'PNG, JPG format up to 2MB'}
                        </p>
                      </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={uploadingLogo} 
                      className="btn-secondary text-xs w-full sm:w-auto"
                    >
                      {uploadingLogo ? <RefreshCw className="spin-animation" size={14} /> : <Upload size={14} />}
                      {uploadingLogo ? (isRtl ? 'جاري الرفع...' : 'Uploading...') : (isRtl ? 'اختر ملف الشعار' : 'Choose Logo File')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">
                    {isRtl ? 'الموقع الإلكتروني' : 'Website URL'}
                  </label>
                  <input 
                    type="url" 
                    value={formData.website} 
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                    placeholder="https://example.com" 
                    className="app-input text-start dir-ltr" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-light)] space-y-3">
                <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                  <Palette size={16} /> {isRtl ? 'لون الهوية الرسمية (Branding)' : 'Official Brand Color'}
                </h2>
                <div className="flex items-center justify-between p-3 bg-[var(--surface-input)] border border-[var(--border-input)] rounded-xl">
                  <div>
                    <p className="m-0 text-xs font-bold text-[var(--text-main)]">
                      {isRtl ? 'اللون الرئيسي للواجهة' : 'Primary Theme Color'}
                    </p>
                    <p className="m-0 mt-0.5 text-[10px] text-[var(--text-muted)]">
                      {isRtl ? 'سيتم استخدام هذا اللون لأزرار وعناصر المنظومة' : 'Applied across system buttons and UI highlights'}
                    </p>
                  </div>
                  <input 
                    type="color" 
                    value={formData.brand_color || '#D97706'} 
                    onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} 
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                  <Mail size={16} /> {isRtl ? 'بيانات التواصل الرسمية' : 'Official Contact Channels'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">
                      {isRtl ? 'البريد الإلكتروني' : 'Contact Email'}
                    </label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      placeholder="admin@domain.com" 
                      className="app-input text-start dir-ltr" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">
                      {isRtl ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      placeholder="+20 123 456 7890" 
                      className="app-input text-start dir-ltr" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-light)] space-y-4">
                <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                  <Globe size={16} /> {isRtl ? 'التفضيلات الإقليمية والمعاملات' : 'Regional & Financial Settings'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select 
                    label={isRtl ? 'العملة الرسمية' : 'Official Currency'}
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    options={currencyOptions}
                  />

                  <Select 
                    label={isRtl ? 'المنطقة الزمنية' : 'Timezone'}
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    options={timezoneOptions}
                  />

                  <Select 
                    label={isRtl ? 'نوع التقويم المعتمد' : 'Default Calendar'}
                    value={formData.calendar_type}
                    onChange={(e) => setFormData({ ...formData, calendar_type: e.target.value })}
                    options={calendarOptions}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 text-[var(--text-muted)]">
                    {isRtl ? 'أيام العطلة الأسبوعية' : 'Weekend Days'}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'thursday', label: isRtl ? 'الخميس' : 'Thursday' },
                      { key: 'friday', label: isRtl ? 'الجمعة' : 'Friday' },
                      { key: 'saturday', label: isRtl ? 'السبت' : 'Saturday' },
                      { key: 'sunday', label: isRtl ? 'الأحد' : 'Sunday' }
                    ].map((day) => {
                      const active = activeWeekendDays.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => toggleWeekendDay(day.key)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            active ? 'btn-primary' : 'btn-secondary'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                <Database size={16} /> {isRtl ? 'النسخ الاحتياطي واستعادة البيانات' : 'Backup & Data Restoration'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {isRtl 
                  ? 'تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في أكاديمية أخرى بنقرة واحدة.' 
                  : 'Export platform configuration as a backup or restore it across organizations with a single click.'}
              </p>
              <div className="flex gap-3 flex-wrap pt-2">
                <button 
                  type="button" 
                  onClick={handleExport} 
                  className="btn-secondary text-xs"
                >
                  <Download size={15} /> {isRtl ? 'تصدير الإعدادات (JSON)' : 'Export Settings (JSON)'}
                </button>
                <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                <button 
                  type="button" 
                  onClick={() => importInputRef.current?.click()} 
                  className="btn-secondary text-xs"
                >
                  <Upload size={15} /> {isRtl ? 'استيراد إعدادات (JSON)' : 'Import Settings (JSON)'}
                </button>
              </div>
            </div>
          )}

          {isDirty && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-[var(--surface-card)] border border-[var(--primary)]/60 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 z-[999] backdrop-blur-xl">
              <span className="text-xs text-[var(--primary)] font-bold truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping inline-block shrink-0" />
                {isRtl ? 'تغييرات غير محفوظة!' : 'Unsaved changes!'}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  onClick={handleDiscardChanges}
                  disabled={saving}
                  className="btn-secondary text-xs !py-1.5 !px-3"
                >
                  <X size={13} /> {isRtl ? 'تراجع' : 'Discard'}
                </button>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary text-xs !py-1.5 !px-3.5"
                >
                  {saving ? <RefreshCw className="spin-animation" size={13} /> : <Save size={13} />}
                  <span>{saving ? (isRtl ? 'حفظ...' : 'Saving...') : (isRtl ? 'حفظ' : 'Save')}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
