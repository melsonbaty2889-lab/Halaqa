import React, { useState, useEffect, useRef } from 'react';
import { Building, ShieldCheck, Save, RotateCcw, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import IdentityTab from './IdentityTab';
import ContactRegionalTab from './ContactRegionalTab';
import QuranicPoliciesTab from './QuranicPoliciesTab';
import DataBackupTab from './DataBackupTab';

// دالة ذكية لتوليد الـ Slug تدعم الاسم الإنجليزي أو تنشئ رابطاً نظيفاً للمستخدم العربي
const generateSmartSlug = (enName, arName, rawSlug, currentId) => {
  // 1. إذا أدخل المستخدم Slug مخصص بيده، ننظفه ونعتمده
  if (rawSlug && !rawSlug.startsWith('academy-')) {
    const cleanedCustom = rawSlug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
    if (cleanedCustom) return cleanedCustom;
  }

  // 2. إذا كان الاسم الإنجليزي موجوداً، نولّد منه الـ Slug
  if (enName && enName.trim() !== '') {
    const cleanedEn = enName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
    if (cleanedEn) return cleanedEn;
  }

  // 3. للمستخدم العربي: إذا لم يتوفر اسم إنجليزي أو slug مخصص، ننشئ رابطاً نظيفاً يعتمد على المعرف
  const shortId = currentId ? currentId.slice(0, 8) : Math.random().toString(36).substring(2, 8);
  return `academy-${shortId}`;
};

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

  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const [activeStep, setActiveStep] = useState('general');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);
  const isDirtyRef = useRef(false);

  // حالة البيانات الأساسية
  const [formData, setFormData] = useState({
    name: { ar: '', en: '' },
    slug: '',
    description: '',
    logo_url: '',
    currency: currentCurrency || 'EGP',
    timezone: currentTimezone || 'Africa/Cairo',
    country_code: currentCountryCode || 'EG',
    calendar_type: 'gregorian',
    contact_email: '',
    contact_phone: '',
    website: '',
    weekend_days: ['friday', 'saturday'],
    default_qiraat: 'hafs_an_asem',
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

  // جلب البيانات من قاعدة البيانات
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
            try {
              const jsonParsed = JSON.parse(data.name);
              parsedName = { ar: jsonParsed.ar || '', en: jsonParsed.en || '' };
            } catch {
              parsedName.ar = data.name;
            }
          }

          const loadedWeekendDays = Array.isArray(data.weekend_days)
            ? data.weekend_days
            : (typeof data.weekend_days === 'string'
                ? JSON.parse(data.weekend_days)
                : ['friday', 'saturday']);

          const loaded = {
            ...data,
            name: parsedName,
            slug: data.slug || `academy-${academyId.slice(0, 8)}`,
            description: data.description || '',
            logo_url: data.logo_url || '',
            currency: data.currency || currentCurrency || 'EGP',
            timezone: data.timezone || currentTimezone || 'Africa/Cairo',
            country_code: data.country_code || currentCountryCode || 'EG',
            calendar_type: data.calendar_type || 'gregorian',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            website: data.website || '',
            weekend_days: loadedWeekendDays,
            default_qiraat: data.default_qiraat || 'hafs_an_asem',
            teaching_methodology: data.teaching_methodology || 'mashreqi',
            learning_type: data.learning_type || 'online',
            max_students_per_group: data.max_students_per_group ?? 25,
            allow_self_registration: data.allow_self_registration ?? true,
            require_approval: data.require_approval ?? true
          };

          if (!isDirtyRef.current) {
            setFormData(loaded);
            setInitialData(loaded);
          }
        }
      } catch (err) {
        console.error('Error fetching academy settings:', err);
      }
    }

    loadAcademySettings();
  }, [academyId]);

  // تحديث الحقول العامة
  const updateField = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const hasChanged = JSON.stringify(updated) !== JSON.stringify(initialData);
      
      isDirtyRef.current = hasChanged;
      setIsDirty(hasChanged);
      
      return updated;
    });

    if (field === 'currency' && typeof onCurrencyChange === 'function') {
      onCurrencyChange(value);
    }
  };

  // تحديث الاسم مع توليد ذكي للـ Slug
  const handleNameChange = (lang, value) => {
    setFormData((prev) => {
      const updatedName = { ...prev.name, [lang]: value };
      
      // ننشئ الـ slug تلقائياً فقط إذا كان الـ slug الحالي فارغاً أو معرفاً افتراضياً
      let newSlug = prev.slug;
      if (!prev.slug || prev.slug.startsWith('academy-')) {
        newSlug = generateSmartSlug(updatedName.en, updatedName.ar, '', academyId);
      }

      const updated = { ...prev, name: updatedName, slug: newSlug };
      const hasChanged = JSON.stringify(updated) !== JSON.stringify(initialData);
      
      isDirtyRef.current = hasChanged;
      setIsDirty(hasChanged);
      
      return updated;
    });
  };

  // رفع الشعار
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
        .upload(filePath, file, { cacheControl: '0', upsert: true });

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

      showToast(t('settings.logoUploadSuccess', isRtl ? 'تم تحديث الشعار بنجاح!' : 'Logo updated successfully!'), 'success');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast(t('settings.logoUploadError', isRtl ? 'حدث خطأ أثناء رفع الشعار' : 'Error uploading logo'), 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // حذف الشعار
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

      if (fileInputRef.current) fileInputRef.current.value = '';

      showToast(t('settings.logoRemoveSuccess', isRtl ? 'تم إزالة الشعار بنجاح!' : 'Logo removed successfully!'), 'success');
    } catch (error) {
      console.error('Error removing logo:', error);
      showToast(t('settings.logoRemoveError', isRtl ? 'حدث خطأ أثناء إزالة الشعار' : 'Error removing logo'), 'error');
    }
  };

  // حفظ التغييرات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!academyId) return;

    const arName = formData.name?.ar?.trim();
    const enName = formData.name?.en?.trim();

    if (!arName && !enName) {
      const errorMessage = isRtl
        ? t('settings.nameRequiredAr', 'يرجى إدخال اسم الأكاديمية')
        : t('settings.nameRequiredEn', 'Please enter the academy name');

      showToast(errorMessage, 'error');
      return;
    }

    try {
      setSaving(true);

      // تنظيف وتوليد الـ slug النهائي الذكي
      const cleanSlug = generateSmartSlug(enName, arName, formData.slug, academyId);

      const updatePayload = {
        name: formData.name,
        slug: cleanSlug,
        description: formData.description,
        logo_url: formData.logo_url,
        currency: formData.currency,
        timezone: formData.timezone,
        country_code: formData.country_code ? formData.country_code.toUpperCase() : null,
        calendar_type: formData.calendar_type || 'gregorian',
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        website: formData.website,
        weekend_days: Array.isArray(formData.weekend_days) ? formData.weekend_days : ['friday', 'saturday'],
        default_qiraat: formData.default_qiraat || 'hafs_an_asem',
        teaching_methodology: formData.teaching_methodology,
        learning_type: formData.learning_type,
        max_students_per_group: Number(formData.max_students_per_group) || 25,
        allow_self_registration: Boolean(formData.allow_self_registration),
        require_approval: Boolean(formData.require_approval)
      };

      const { error } = await supabase
        .from('academies')
        .update(updatePayload)
        .eq('id', academyId);

      if (error) throw error;

      setFormData(prev => ({ ...prev, slug: cleanSlug }));
      setInitialData({ ...formData, slug: cleanSlug });
      isDirtyRef.current = false;
      setIsDirty(false);

      showToast(t('settings.saveSuccess', isRtl ? 'تم حفظ التغييرات بنجاح!' : 'Changes saved successfully!'), 'success');

      if (typeof updateAcademyState === 'function') {
        updateAcademyState({ ...updatePayload, id: academyId });
      }

      if (typeof onAcademyUpdate === 'function') {
        onAcademyUpdate({ ...updatePayload, id: academyId });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(
        t(
          'settings.saveError',
          isRtl 
            ? 'حدث خطأ أثناء الحفظ (قد يكون الرابط المُستخدَم مستخدماً من أكاديمية أخرى)' 
            : 'Error saving settings (slug might already be taken)'
        ),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setFormData(initialData);
    isDirtyRef.current = false;
    setIsDirty(false);
  };

  const steps = [
    {
      id: 'general',
      label: isRtl
        ? t('settings.generalStep', '1. الأساسية والإقليمية')
        : t('settings.generalStep', '1. Basic & Regional'),
      icon: Building
    },
    {
      id: 'system',
      label: isRtl
        ? t('settings.systemStep', '2. السياسات والنسخ الاحتياطي')
        : t('settings.systemStep', '2. Policies & Backup'),
      icon: ShieldCheck
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-start px-2 sm:px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* شريط التبويبات العلوي */}
      <div className="flex border-b border-[var(--border-card)] gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[var(--primary)] text-[var(--primary)] font-extrabold bg-[var(--surface-input)]/20 rounded-t-lg'
                  : 'border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon size={16} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 !overflow-visible">
        {/* التنبيهات الفورية */}
        {toastMessage && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-md animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
          }`}>
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="opacity-70 hover:opacity-100 cursor-pointer p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* محتوى التبويب الأول */}
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

        {/* محتوى التبويب الثاني */}
        <div className={`space-y-6 !overflow-visible ${activeStep === 'system' ? 'block' : 'hidden'}`}>
          <QuranicPoliciesTab formData={formData} updateField={updateField} />
          <DataBackupTab
            formData={formData}
            setFormData={setFormData}
            importInputRef={importInputRef}
            showToast={showToast}
          />
        </div>

        {/* شريط الإجراءات الثابت */}
        <div className="flex flex-row items-center justify-between gap-3 pt-5 border-t border-[var(--border-card)] w-full">
          <button
            type="submit"
            disabled={saving}
            className={`btn-primary text-xs px-6 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-xl font-bold transition-all ${
              saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'
            }`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? t('common.saving', isRtl ? 'جاري الحفظ...' : 'Saving...') : t('common.save', isRtl ? 'حفظ التغييرات' : 'Save Changes')}</span>
          </button>

          <div className="min-h-[38px] flex items-center">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="btn-secondary text-xs px-4 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl font-medium transition-all animate-in fade-in"
              >
                <RotateCcw size={14} />
                <span>{t('common.discard', isRtl ? 'تراجع' : 'Discard')}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
