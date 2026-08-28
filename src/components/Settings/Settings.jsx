import React, { useState, useEffect, useRef } from 'react';
import { Building, ShieldCheck, Save, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import IdentityTab from './IdentityTab';
import ContactRegionalTab from './ContactRegionalTab';
import QuranicPoliciesTab from './QuranicPoliciesTab';
import DataBackupTab from './DataBackupTab';

export default function Settings({
  academyId,
  session,
  currentCurrency,
  currentTimezone,
  currentCountryCode,
  onCurrencyChange
}) {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState('general');

  // مراجع رفع الملفات والنسخ الاحتياطي
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  // حالات البيانات والرفع
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description: '',
    logo_url: '',
    currency: currentCurrency || 'USD',
    timezone: currentTimezone || 'UTC',
    country_code: currentCountryCode || 'US'
  });

  const [initialData, setInitialData] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 1. جلب بيانات الأكاديمية عند التحميل أو تغير academyId
  useEffect(() => {
    async function loadAcademySettings() {
      if (!academyId) return;
      try {
        const { data, error } = await supabase
          .from('academies')
          .select('*')
          .eq('id', academyId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const loaded = {
            name_ar: data.name_ar || data.name || '',
            name_en: data.name_en || '',
            description: data.description || '',
            logo_url: data.logo_url || '',
            currency: data.currency || currentCurrency || 'USD',
            timezone: data.timezone || currentTimezone || 'UTC',
            country_code: data.country_code || currentCountryCode || 'US',
            ...data
          };
          setFormData(loaded);
          setInitialData(loaded);
          setIsDirty(false);
        }
      } catch (err) {
        console.error('Error fetching academy settings:', err);
      }
    }

    loadAcademySettings();
  }, [academyId, currentCurrency, currentTimezone, currentCountryCode]);

  // تحديث الحقول وتتبع التغيير
  const updateField = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialData));
      return updated;
    });

    if (field === 'currency' && typeof onCurrencyChange === 'function') {
      onCurrencyChange(value);
    }
  };

  const handleNameChange = (lang, value) => {
    const key = lang === 'ar' ? 'name_ar' : 'name_en';
    updateField(key, value);
  };

  // 2. دالة رفع الشعار لـ Supabase Storage المعالجة للأخطاء
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !academyId) return;

    try {
      setUploadingLogo(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `academies/${academyId}/logo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('academy-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('academy-assets')
        .getPublicUrl(filePath);

      const newLogoUrl = publicUrlData.publicUrl;
      updateField('logo_url', newLogoUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(t('common.uploadError', 'حدث خطأ أثناء رفع الشعار، يرجى المحاولة لاحقاً.'));
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 3. حذف الشعار
  const handleRemoveLogo = () => {
    updateField('logo_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 4. حفظ التغييرات في قاعدة البيانات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!academyId) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('academies')
        .update({
          name: formData.name_ar,
          name_ar: formData.name_ar,
          name_en: formData.name_en,
          description: formData.description,
          logo_url: formData.logo_url,
          currency: formData.currency,
          timezone: formData.timezone,
          country_code: formData.country_code
        })
        .eq('id', academyId);

      if (error) throw error;

      setInitialData(formData);
      setIsDirty(false);
      alert(t('common.saveSuccess', 'تم حفظ التغييرات بنجاح'));
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('common.saveError', 'حدث خطأ أثناء حفظ التغييرات'));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm(t('common.confirmDiscard', 'هل أنت متأكد من إلغاء التغييرات غير المحفوظة؟'))) {
      setFormData(initialData);
      setIsDirty(false);
    }
  };

  const steps = [
    { id: 'general', label: t('settings.generalStep', '1. البيانات الأساسية والإقليمية'), icon: Building },
    { id: 'system', label: t('settings.systemStep', '2. السياسات والنسخ الاحتياطي'), icon: ShieldCheck },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-start px-2 sm:px-4" dir={i18n.dir()}>
      {/* شريط التنقل بين الخطوات */}
      <div className="grid grid-cols-2 border-b border-[var(--border-card)] gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center justify-center gap-2 px-3 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] cursor-pointer bg-transparent focus:outline-none ${
                isActive 
                  ? 'border-[var(--primary)] text-[var(--primary)] font-extrabold' 
                  : 'border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon size={16} />
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* محتوى النموذج */}
      <form onSubmit={handleSubmit} className="space-y-6 !overflow-visible">
        {/* الخطوة الأولى: الحفاظ عليها في الـ DOM بواسطة hidden لمنع تدمير المراجع */}
        <div className={`space-y-6 !overflow-visible ${activeStep === 'general' ? 'block' : 'hidden'}`}>
          <IdentityTab 
            formData={formData} 
            updateField={updateField} 
            handleNameChange={handleNameChange} 
            handleLogoUpload={handleLogoUpload} 
            handleRemoveLogo={handleRemoveLogo} 
            uploadingLogo={uploadingLogo} 
            fileInputRef={fileInputRef} 
          />
          <ContactRegionalTab formData={formData} updateField={updateField} />
        </div>

        {/* الخطوة الثانية */}
        <div className={`space-y-6 !overflow-visible ${activeStep === 'system' ? 'block' : 'hidden'}`}>
          <QuranicPoliciesTab formData={formData} updateField={updateField} />
          <DataBackupTab 
            formData={formData} 
            setFormData={setFormData}
            importInputRef={importInputRef}
          />
        </div>

        {/* شريط التحكم السفلي */}
        <div className="flex flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-card)] w-full">
          <button 
            type="submit" 
            disabled={saving} 
            className={`btn-primary text-xs px-6 py-2.5 flex items-center justify-center gap-2 cursor-pointer ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save size={16} />
            <span>{saving ? t('common.saving', 'جاري الحفظ...') : t('common.save', 'حفظ التغييرات')}</span>
          </button>

          <div className="min-h-[38px] flex items-center">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="btn-secondary text-xs px-4 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{t('common.discard', 'تراجع')}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
