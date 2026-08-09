import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Save, Globe, Clock, Calendar, Mail, Phone, 
  ShieldCheck, Database, RefreshCw, CheckCircle2, Upload, 
  Download, Image, AlertCircle 
} from 'lucide-react';
import { Card, Input, Select, Btn as Button } from '@/components/UI/UI.jsx';
import { supabase } from '@/lib/supabase.js';

export default function Settings({ currentAcademyId, isRtl = true }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    email: '',
    phone: '',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    calendar_type: 'gregorian',
    weekend_days: ['friday', 'saturday']
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  // إظهار التنبيهات الشفافة (Toast)
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // جلب البيانات من Supabase عند تحميل الصفحة
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
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          logo_url: data.logo_url || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          currency: data.currency || 'EGP',
          timezone: data.timezone || 'Africa/Cairo',
          calendar_type: data.calendar_type || 'gregorian',
          weekend_days: data.weekend_days || ['friday', 'saturday']
        });
      }
    } catch (err) {
      showToast('حدث خطأ أثناء جلب البيانات: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
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

      // 1. رفع الملف إلى Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. استخراج الرابط العام
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) throw new Error('تعذر الحصول على رابط الصورة العام');

      // 3. تحديث الـ State المحلية
      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));

      // 4. حفظ الرابط مباشرة في جدول الأكاديميات بقاعدة البيانات لضمان عدم ضياعه عند الرفريش
      if (currentAcademyId) {
        const { error: dbError } = await supabase
          .from('academies')
          .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', currentAcademyId);

        if (dbError) throw dbError;
      }

      showToast('تم رفع الشعار وحفظه بنجاح');
    } catch (err) {
      showToast('فشل رفع الشعار: ' + err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  // التحقق من صحة المدخلات
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

  // حفظ الإعدادات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('academies')
        .upsert({ id: currentAcademyId, ...payload });

      if (error) throw error;
      showToast('تم حفظ كافة الإعدادات بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء الحفظ: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // تصدير النسخة الاحتياطية (JSON)
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

  // استيراد النسخة الاحتياطية (JSON)
  const handleImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          setFormData((prev) => ({ ...prev, ...parsed }));
          showToast('تم استيراد الإعدادات إلى النموذج، اضغط حفظ لتطبيقها');
        } catch (err) {
          showToast('ملف JSON غير صالح', 'error');
        }
      };
    }
  };

  // تبديل أيام العطلة الأسبوعية
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px', color: '#f8fafc' }}>
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px', direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '10px',
            background: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: '#ffffff',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ color: '#f59e0b', fontSize: '1.8rem', fontWeight: '800', marginBottom: '6px', display: 'flex', items: 'center', justifyContent: 'center', gap: '10px' }}>
          إعدادات المنظومة وحفظ البيانات <Building2 size={24} />
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          إدارة ترخيص الأكاديمية، البيانات التأسيسية، وخيارات التزامن السحابي للغرفة الأكاديمية.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Basic Identity Section */}
        <Card>
          <h2 style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} /> الهوية والبيانات الأساسية
          </h2>

          <Input
            label="اسم الأكاديمية / المقرأة *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="أكاديمية الفرقان التجريبية"
          />

          <Input
            label="المعرّف الفريد (Slug)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="al-furquan"
          />

          {/* Direct Logo Upload */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '6px', display: 'block', fontWeight: '600', textAlign: 'start' }}>
              شعار الأكاديمية (Logo)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {formData.logo_url && (
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #334155' }}
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
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

        {/* Contact Channels */}
        <Card>
          <h2 style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} /> قنوات التواصل والروابط
          </h2>

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
        </Card>

        {/* Regional Preferences */}
        <Card>
          <h2 style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} /> التفضيلات والإعدادات الإقليمية
          </h2>

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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '8px', display: 'block', fontWeight: '600', textAlign: 'start' }}>
              أيام العطلة الأسبوعية
            </label>
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
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: active ? '1px solid #f59e0b' : '1px solid #334155',
                      background: active ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                      color: active ? '#f59e0b' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Backup & Restore Tools */}
        <Card>
          <h2 style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} /> النسخ الاحتياطي واستعادة الإعدادات
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button type="button" variant="ghost" onClick={handleExport}>
              <Download size={16} /> تصدير ملف الإعدادات (JSON)
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <Button type="button" variant="ghost" onClick={() => importInputRef.current?.click()}>
              <Upload size={16} /> استيراد من ملف (JSON)
            </Button>
          </div>
        </Card>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button type="submit" disabled={saving} style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>

      </form>
    </div>
  );
}
