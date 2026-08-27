import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export const INITIAL_ACADEMY_FORM = {
  name_ar: '',
  name_en: '',
  slug: '',
  logo_url: '',
  tagline: '',
  description: '',
  brand_color: '#D97706',
  
  contact_email: '',
  contact_phone: '',
  website: '',
  country_code: 'EG',
  
  currency: 'EGP',
  timezone: 'Africa/Cairo',
  language_code: 'ar',
  calendar_type: 'gregorian',
  weekend_days: ['friday', 'saturday'],
  
  learning_type: 'online',
  default_qiraat: 'hafs',
  teaching_methodology: 'mashreqi',
  
  allow_self_registration: true,
  require_approval: true,
  max_students_per_group: 25
};

export function useAcademySettings(currentAcademyId, isRtl = true, refreshStatus = null, onCurrencyChange = null) {
  const [formData, setFormData] = useState(INITIAL_ACADEMY_FORM);
  const [initialData, setInitialData] = useState(INITIAL_ACADEMY_FORM);
  const [rawAcademyData, setRawAcademyData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const isValidAcademyId = Boolean(
    currentAcademyId && 
    currentAcademyId !== 'undefined' && 
    typeof currentAcademyId === 'string' &&
    currentAcademyId.trim() !== ''
  );

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
        
        let arName = '';
        let enName = '';
        if (typeof data.name === 'object' && data.name !== null) {
          arName = data.name.ar || '';
          enName = data.name.en || '';
        } else if (typeof data.name === 'string') {
          arName = data.name;
          enName = data.name;
        }

        const fetched = {
          name_ar: arName,
          name_en: enName,
          slug: data.slug || '',
          logo_url: data.logo_url || '',
          tagline: data.tagline || '',
          description: data.description || '',
          brand_color: data.brand_color || '#D97706',
          
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          website: data.website || '',
          country_code: data.country_code || 'EG',
          
          currency: data.currency || 'EGP',
          timezone: data.timezone || 'Africa/Cairo',
          language_code: data.language_code || 'ar',
          calendar_type: data.calendar_type || 'gregorian',
          weekend_days: Array.isArray(data.weekend_days) ? data.weekend_days : ['friday', 'saturday'],
          
          learning_type: data.learning_type || 'online',
          default_qiraat: data.default_qiraat || 'hafs',
          teaching_methodology: data.teaching_methodology || 'mashreqi',
          
          allow_self_registration: data.allow_self_registration ?? true,
          require_approval: data.require_approval ?? true,
          max_students_per_group: Number(data.max_students_per_group) || 25,
        };

        setFormData(fetched);
        setInitialData(fetched);
      }
    } catch (err) {
      showToast(isRtl ? 'حدث خطأ أثناء جلب البيانات: ' + err.message : 'Error fetching data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademySettings();
  }, [currentAcademyId, isRtl]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (lang, value) => {
    const generatedSlug = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    setFormData(prev => ({
      ...prev,
      [`name_${lang}`]: value,
      slug: (prev.slug === '' || prev.slug === initialData.slug) ? generatedSlug : prev.slug
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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw new Error(`[Storage] ${uploadError.message}`);

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) throw new Error(isRtl ? 'تعذر الحصول على رابط الصورة العام' : 'Failed to get public image URL');

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));

      const { error: dbError } = await supabase
        .from('academies')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', currentAcademyId);

      if (dbError) throw new Error(`[Database] ${dbError.message}`);

      if (refreshStatus) await refreshStatus();

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

      if (refreshStatus) await refreshStatus();
    }
    showToast(isRtl ? 'تم حذف الشعار بنجاح' : 'Logo removed successfully');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!isValidAcademyId) {
      showToast(isRtl ? 'تعذّر الحفظ: لم يتم التعرف على معرّف الأكاديمية' : 'Save failed: Invalid Academy ID', 'error');
      return;
    }

    if (!formData.name_ar.trim() && !formData.name_en.trim()) {
      showToast(isRtl ? 'يرجى إدخال اسم الأكاديمية على الأقل بلغتك الأساسية' : 'Please enter academy name', 'error');
      return;
    }

    try {
      setSaving(true);

      const namePayload = {
        ar: formData.name_ar.trim() || formData.name_en.trim(),
        en: formData.name_en.trim() || formData.name_ar.trim()
      };

      let formattedSlug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (!formattedSlug) {
        formattedSlug = `academy-${String(currentAcademyId).slice(0, 8)}`;
      }

      const updatePayload = {
        name: namePayload,
        slug: formattedSlug,
        logo_url: formData.logo_url || null,
        tagline: formData.tagline || null,
        description: formData.description || null,
        brand_color: formData.brand_color,
        
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        website: formData.website || null,
        country_code: formData.country_code,
        
        currency: formData.currency,
        timezone: formData.timezone,
        language_code: formData.language_code,
        calendar_type: formData.calendar_type,
        weekend_days: formData.weekend_days,
        
        learning_type: formData.learning_type,
        default_qiraat: formData.default_qiraat,
        teaching_methodology: formData.teaching_methodology,
        
        allow_self_registration: formData.allow_self_registration,
        require_approval: formData.require_approval,
        max_students_per_group: Number(formData.max_students_per_group) || 25,
        
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('academies')
        .update(updatePayload)
        .eq('id', currentAcademyId)
        .select();

      if (error) throw error;

      setInitialData(formData);

      if (refreshStatus) await refreshStatus();

      localStorage.setItem('app_currency', formData.currency);
      window.dispatchEvent(new CustomEvent('currencyUpdated', { detail: formData.currency }));
      if (onCurrencyChange) onCurrencyChange(formData.currency);

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

  return {
    formData,
    setFormData,
    loading,
    saving,
    uploadingLogo,
    isDirty,
    toast,
    fileInputRef,
    importInputRef,
    updateField,
    handleNameChange,
    handleLogoUpload,
    handleRemoveLogo,
    handleSave,
    handleDiscardChanges,
    showToast,
    fetchAcademySettings
  };
}
