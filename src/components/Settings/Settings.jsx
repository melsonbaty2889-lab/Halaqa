import React, { useState, useEffect, useRef } from 'react';
import { Building, ShieldCheck, Save, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
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
  onCurrencyChange,
  onAcademyUpdate
}) {
  const { t, i18n } = useTranslation();
  const { updateAcademyState } = useAcademy();

  // 🟢 تعريف المتغير isRtl لتحديد اتجاه اللغة وتفادي ReferenceError
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const [activeStep, setActiveStep] = useState('general');

  // حالة رسائل التنبيه الفورية (Toast)
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // مراجع رفع الملفات والنسخ الاحتياطي
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  // حالة البيانات
  const [formData, setFormData] = useState({
    name: { ar: '', en: '' },
    description: '',
    logo_url: '',
    currency: currentCurrency || 'EGP',
    timezone: currentTimezone || 'Africa/Cairo',
    country_code: currentCountryCode || 'EG',
    contact_email: '',
    contact_phone: '',
    website: '',
    default_qiraat: 'hafs',
    teaching_methodology: 'mashreqi',
    learning_type: 'online',
    max_students_per_group: 25,
    allow_self_registration: true,
    require_approval: true
  });

  const [initialData, setInitialData] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 1. جلب بيانات الأكاديمية
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
          let parsedName = { ar: '', en: '' };
          if (typeof data.name === 'object' && data.name !== null) {
            parsedName = {
              ar: data.name.ar || '',
              en: data.name.en || ''
            };
          } else if (typeof data.name === 'string') {
            parsedName.ar = data.name;
          }

          const loaded = {
            ...data,
            name: parsedName,
            description: data.description || '',
            logo_url: data.logo_url || '',
            currency: data.currency || currentCurrency || 'EGP',
            timezone: data.timezone || currentTimezone || 'Africa/Cairo',
            country_code: data.country_code || currentCountryCode || 'EG',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            website: data.website || '',
            default_qiraat: data.default_qiraat || 'hafs',
            teaching_methodology: data.teaching_methodology || 'mashreqi',
            learning_type: data.learning_type || 'online',
            max_students_per_group: data.max_students_per_group ?? 25,
            allow_self_registration: data.allow_self_registration ?? true,
            require_approval: data.require_approval ?? true
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

  // تحديث الحقول العامة
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

  // تحديث اللغات داخل حقل name الـ jsonb مع التحديث اللحظي للواجهة
  const handleNameChange = (lang, value) => {
    setFormData((prev) => {
      const updatedName = { ...prev.name, [lang]: value };
      const updated = { ...prev, name: updatedName };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialData));
      return updated;
    });

    if (typeof updateAcademyState === 'function') {
      updateAcademyState({
        name: {
          ...formData.name,
          [lang]: value
        }
      });
    }
  };

  // 2. دالة رفع الشعار
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !academyId) return;

    try {
      setUploadingLogo(true);

      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list('logos', { search: `logo-${academyId}` });

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(f => `logos/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToRemove);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${academyId}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '0',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newLogoUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('academies')
        .update({ logo_url: newLogoUrl })
        .eq('id', academyId);

      if (dbError) throw dbError;

      setFormData(prev => ({ ...prev, logo_url: newLogoUrl }));
      setInitialData(prev => ({ ...prev, logo_url: newLogoUrl }));

      if (typeof updateAcademyState === 'function') {
        updateAcademyState({ id: academyId, logo_url: newLogoUrl });
      }

      if (typeof onAcademyUpdate === 'function') {
        onAcademyUpdate({ id: academyId, logo_url: newLogoUrl });
      }

      showToast(t('settings.logoUploadSuccess', 'تم تحديث الشعار بنجاح!'), 'success');

    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast(t('settings.logoUploadError', 'حدث خطأ أثناء رفع الشعار'), 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 3. دالة حذف الشعار
  const handleRemoveLogo = async () => {
    if (!academyId) return;

    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list('logos', { search: `logo-${academyId}` });

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(f => `logos/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToRemove);
      }

      await supabase
        .from('academies')
        .update({ logo_url: null })
        .eq('id', academyId);

      setFormData(prev => ({ ...prev, logo_url: '' }));
      setInitialData(prev => ({ ...prev, logo_url: '' }));

      if (typeof updateAcademyState === 'function') {
        updateAcademyState({ id: academyId, logo_url: null });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      showToast(t('settings.logoRemoveSuccess', 'تم إزالة الشعار بنجاح!'), 'success');
    } catch (error) {
      console.error('Error removing logo:', error);
      showToast(t('settings.logoRemoveError', 'حدث خطأ أثناء إزالة الشعار'), 'error');
    }
  };

  // 4. حفظ البيانات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!academyId) return;

    const arName = formData.name?.ar?.trim();
    const enName = formData.name?.en?.trim();

    // استخدام isRtl الذي تم تعريفه في أعلى المكون
    const isValid = isRtl ? (arName || enName) : (enName || arName);

    if (!isValid) {
      const errorMessage = isRtl
        ? t('settings.nameRequiredAr', 'يرجى إدخال اسم الأكاديمية')
        : t('settings.nameRequiredEn', 'Please enter the academy name');

      showToast(errorMessage, 'error');
      return;
    }

    try {
      setSaving(true);

      const updatePayload = {
        name: formData.name,
        description: formData.description,
        logo_url: formData.logo_url,
        currency: formData.currency,
        timezone: formData.timezone,
        country_code: formData.country_code ? formData.country_code.toUpperCase() : null,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        website: formData.website,
        default_qiraat: formData.default_qiraat,
        teaching_methodology: formData.teaching_methodology,
        learning_type: formData.learning_type,
        max_students_per_group: formData.max_students_per_group,
        allow_self_registration: formData.allow_self_registration,
        require_approval: formData.require_approval
      };

      const { error } = await supabase
        .from('academies')
        .update(updatePayload)
        .eq('id', academyId);

      if (error) throw error;

      setInitialData(formData);
      setIsDirty(false);

      showToast(t('settings.saveSuccess', 'تم حفظ التغييرات بنجاح!'), 'success');

      if (typeof updateAcademyState === 'function') {
        updateAcademyState({
          ...updatePayload,
          id: academyId
        });
      }

      if (typeof onAcademyUpdate === 'function') {
        onAcademyUpdate({
          ...updatePayload,
          id: academyId
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(t('settings.saveError', 'حدث خطأ أثناء حفظ التغييرات'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setFormData(initialData);
    setIsDirty(false);
  };

  const steps = [
    { id: 'general', label: t('settings.generalStep', '1. البيانات الأساسية والإقليمية'), icon: Building },
    { id: 'system', label: t('settings.systemStep', '2. السياسات والنسخ الاحتياطي'), icon: ShieldCheck },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-start px-2 sm:px-4" dir={i18n.dir()}>
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

      <form onSubmit={handleSubmit} className="space-y-6 !overflow-visible">
        {toastMessage && (
          <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-lg ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
          }`}>
            <span>{toastMessage.text}</span>
            <button 
              type="button" 
              onClick={() => setToastMessage(null)} 
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}

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

        <div className={`space-y-6 !overflow-visible ${activeStep === 'system' ? 'block' : 'hidden'}`}>
          <QuranicPoliciesTab formData={formData} updateField={updateField} />
          <DataBackupTab 
            formData={formData} 
            setFormData={setFormData}
            importInputRef={importInputRef}
          />
        </div>

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
