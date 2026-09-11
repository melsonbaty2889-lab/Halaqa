import { useState, useEffect, useRef, ChangeEvent, FormEvent, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'tr' | 'ur' | 'id';

export interface MultiLangName {
  ar?: string;
  en?: string;
  fr?: string;
  tr?: string;
  ur?: string;
  id?: string;
  [key: string]: string | undefined;
}

export interface AcademyFormData {
  name_ar: string;
  name_en: string;
  name_fr: string;
  name_tr: string;
  name_ur: string;
  name_id: string;
  slug: string;
  logo_url: string;
  tagline: string;
  description: string;
  brand_color: string;
  
  contact_email: string;
  contact_phone: string;
  website: string;
  country_code: string;
  
  currency: string;
  timezone: string;
  language_code: SupportedLanguage;
  calendar_type: string;
  weekend_days: string[];
  
  learning_type: string;
  default_qiraat: string;
  teaching_methodology: string;
  
  allow_self_registration: boolean;
  require_approval: boolean;
  max_students_per_group: number;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface RawAcademyData {
  id: string;
  name?: MultiLangName | string | null;
  slug?: string | null;
  logo_url?: string | null;
  tagline?: string | null;
  description?: string | null;
  brand_color?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website?: string | null;
  country_code?: string | null;
  currency?: string | null;
  timezone?: string | null;
  language_code?: SupportedLanguage | null;
  calendar_type?: string | null;
  weekend_days?: string[] | null;
  learning_type?: string | null;
  default_qiraat?: string | null;
  teaching_methodology?: string | null;
  allow_self_registration?: boolean | null;
  require_approval?: boolean | null;
  max_students_per_group?: number | null;
  [key: string]: unknown;
}

export const INITIAL_ACADEMY_FORM: AcademyFormData = {
  name_ar: '',
  name_en: '',
  name_fr: '',
  name_tr: '',
  name_ur: '',
  name_id: '',
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
  max_students_per_group: 25,
};

const BUCKET_NAME = 'academy-logos';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Translation Helper ──────────────────────────────────────────

const MESSAGES: Record<SupportedLanguage, Record<string, string>> = {
  ar: {
    fetch_error: 'حدث خطأ أثناء جلب البيانات: ',
    invalid_id_logo: 'تعذر رفع الشعار: معرّف الأكاديمية غير صالح',
    invalid_type: 'يرجى اختيار صورة بصيغة صالحة (JPEG, PNG, WebP)',
    size_exceeded: 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت',
    public_url_error: 'تعذر الحصول على رابط الصورة العام',
    logo_success: 'تم رفع الشعار بنجاح',
    logo_fail: 'فشل رفع الشعار: ',
    logo_remove_success: 'تم حذف الشعار بنجاح',
    logo_remove_fail: 'فشل حذف الشعار: ',
    invalid_id_save: 'تعذّر الحفظ: لم يتم التعرف على معرّف الأكاديمية',
    name_required: 'يرجى إدخال اسم الأكاديمية بلغة واحدة على الأقل',
    invalid_max_students: 'الحد الأقصى للطلاب في المجموعة يجب أن يكون بين 1 و 1000',
    save_success: 'تم حفظ كافة الإعدادات بنجاح',
    save_fail: 'حدث خطأ أثناء الحفظ: ',
  },
  en: {
    fetch_error: 'Error fetching data: ',
    invalid_id_logo: 'Cannot upload logo: Invalid Academy ID',
    invalid_type: 'Please select a valid image file (JPEG, PNG, WebP)',
    size_exceeded: 'Image size must not exceed 2MB',
    public_url_error: 'Failed to get public image URL',
    logo_success: 'Logo uploaded successfully',
    logo_fail: 'Logo upload failed: ',
    logo_remove_success: 'Logo removed successfully',
    logo_remove_fail: 'Failed to remove logo: ',
    invalid_id_save: 'Save failed: Invalid Academy ID',
    name_required: 'Please enter academy name in at least one language',
    invalid_max_students: 'Max students per group must be between 1 and 1000',
    save_success: 'Settings saved successfully',
    save_fail: 'Error saving: ',
  },
  fr: {
    fetch_error: 'Erreur lors de la récupération des données: ',
    invalid_id_logo: 'Impossible de télécharger le logo: ID d’académie invalide',
    invalid_type: 'Veuillez sélectionner une image valide (JPEG, PNG, WebP)',
    size_exceeded: 'La taille de l’image ne doit pas dépasser 2 Mo',
    public_url_error: 'Impossible d’obtenir l’URL publique de l’image',
    logo_success: 'Logo téléchargé avec succès',
    logo_fail: 'Échec du téléchargement du logo: ',
    logo_remove_success: 'Logo supprimé avec succès',
    logo_remove_fail: 'Échec de la suppression du logo: ',
    invalid_id_save: 'Échec de l’enregistrement: ID d’académie invalide',
    name_required: 'Veuillez saisir le nom de l’académie dans au moins une langue',
    invalid_max_students: 'Le nombre maximal d’étudiants par groupe doit être compris entre 1 et 1000',
    save_success: 'Paramètres enregistrés avec succès',
    save_fail: 'Erreur lors de l’enregistrement: ',
  },
  tr: {
    fetch_error: 'Veriler alınırken hata oluştu: ',
    invalid_id_logo: 'Logo yüklenemiyor: Geçersiz Akademi Kimliği',
    invalid_type: 'Lütfen geçerli bir görsel dosyası seçin (JPEG, PNG, WebP)',
    size_exceeded: 'Görsel boyutu 2 MB’ı geçmemelidir',
    public_url_error: 'Açık görsel bağlantısı alınamadı',
    logo_success: 'Logo başarıyla yüklendi',
    logo_fail: 'Logo yükleme başarısız: ',
    logo_remove_success: 'Logo başarıyla kaldırıldı',
    logo_remove_fail: 'Logo kaldırılması başarısız: ',
    invalid_id_save: 'Kaydetme başarısız: Geçersiz Akademi Kimliği',
    name_required: 'Lütfen en az bir dilde akademi adını girin',
    invalid_max_students: 'Grup başına maksimum öğrenci sayısı 1 ile 1000 arasında olmalıdır',
    save_success: 'Ayarlar başarıyla kaydedildi',
    save_fail: 'Kaydetme hatası: ',
  },
  ur: {
    fetch_error: 'ڈیٹا حاصل کرنے میں خرابی: ',
    invalid_id_logo: 'لوگو اپ لوڈ نہیں ہو سکتا: اکیڈمی آئی ڈی درست نہیں ہے',
    invalid_type: 'براہ کرم درست تصویر کا انتخاب کریں (JPEG, PNG, WebP)',
    size_exceeded: 'تصویر کا سائز 2MB سے زیادہ نہیں ہونا چاہیے',
    public_url_error: 'عوامی تصویر کا لنک حاصل کرنے میں ناکامی',
    logo_success: 'لوگو کامیابی کے ساتھ اپ لوڈ ہو گیا',
    logo_fail: 'لوگو اپ لوڈ کرنے میں ناکامی: ',
    logo_remove_success: 'لوگو کامیابی کے ساتھ ہٹا دیا گیا',
    logo_remove_fail: 'لوگو ہٹانے میں ناکامی: ',
    invalid_id_save: 'محفوظ کرنے میں ناکامی: اکیڈمی آئی ڈی درست نہیں ہے',
    name_required: 'براہ کرم کم از کم ایک زبان میں اکیڈمی کا نام درج کریں',
    invalid_max_students: 'فی گروپ زیادہ سے زیادہ طلباء کی تعداد 1 اور 1000 کے درمیان ہونی چاہیے',
    save_success: 'تمام ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں',
    save_fail: 'محفوظ کرنے میں خرابی: ',
  },
  id: {
    fetch_error: 'Gagal mengambil data: ',
    invalid_id_logo: 'Gagal mengunggah logo: ID Akademi tidak valid',
    invalid_type: 'Silakan pilih gambar yang valid (JPEG, PNG, WebP)',
    size_exceeded: 'Ukuran gambar tidak boleh melebihi 2MB',
    public_url_error: 'Gagal mendapatkan URL gambar publik',
    logo_success: 'Logo berhasil diunggah',
    logo_fail: 'Gagal mengunggah logo: ',
    logo_remove_success: 'Logo berhasil dihapus',
    logo_remove_fail: 'Gagal menghapus logo: ',
    invalid_id_save: 'Gagal menyimpan: ID Akademi tidak valid',
    name_required: 'Silakan masukkan nama akademi setidaknya dalam satu bahasa',
    invalid_max_students: 'Jumlah siswa maksimum per kelompok harus antara 1 dan 1000',
    save_success: 'Pengaturan berhasil disimpan',
    save_fail: 'Gagal menyimpan: ',
  },
};

// ── Helper Functions ──────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
}

function extractStoragePathFromUrl(url: string, bucket: string): string | null {
  if (!url) return null;
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(marker);
    if (index !== -1) {
      return url.substring(index + marker.length);
    }
  } catch {
    return null;
  }
  return null;
}

// ── Main Hook ───────────────────────────────────────────────────

export function useAcademySettings(
  currentAcademyId?: string | null,
  currentLang: SupportedLanguage = 'ar',
  refreshStatus?: (() => Promise<void> | void) | null,
  onCurrencyChange?: ((currency: string) => void) | null
) {
  const [formData, setFormData] = useState<AcademyFormData>(INITIAL_ACADEMY_FORM);
  const [initialData, setInitialData] = useState<AcademyFormData>(INITIAL_ACADEMY_FORM);
  const [rawAcademyData, setRawAcademyData] = useState<RawAcademyData | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  const t = useCallback(
    (key: string): string => {
      return MESSAGES[currentLang]?.[key] || MESSAGES.en[key] || '';
    },
    [currentLang]
  );

  const isValidAcademyId = Boolean(
    currentAcademyId && 
    currentAcademyId !== 'undefined' && 
    typeof currentAcademyId === 'string' &&
    currentAcademyId.trim() !== ''
  );

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const fetchAcademySettings = useCallback(async () => {
    if (!isValidAcademyId) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academies')
        .select('*')
        .eq('id', currentAcademyId!)
        .abortSignal(abortController.signal)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const academyData = data as RawAcademyData;
        setRawAcademyData(academyData);
        
        let arName = '';
        let enName = '';
        let frName = '';
        let trName = '';
        let urName = '';
        let idName = '';

        if (typeof academyData.name === 'object' && academyData.name !== null) {
          arName = academyData.name.ar || '';
          enName = academyData.name.en || '';
          frName = academyData.name.fr || '';
          trName = academyData.name.tr || '';
          urName = academyData.name.ur || '';
          idName = academyData.name.id || '';
        } else if (typeof academyData.name === 'string') {
          arName = academyData.name;
          enName = academyData.name;
        }

        const fetched: AcademyFormData = {
          name_ar: arName,
          name_en: enName,
          name_fr: frName,
          name_tr: trName,
          name_ur: urName,
          name_id: idName,
          slug: academyData.slug || '',
          logo_url: academyData.logo_url || '',
          tagline: academyData.tagline || '',
          description: academyData.description || '',
          brand_color: academyData.brand_color || '#D97706',
          
          contact_email: academyData.contact_email || '',
          contact_phone: academyData.contact_phone || '',
          website: academyData.website || '',
          country_code: academyData.country_code || 'EG',
          
          currency: academyData.currency || 'EGP',
          timezone: academyData.timezone || 'Africa/Cairo',
          language_code: academyData.language_code || 'ar',
          calendar_type: academyData.calendar_type || 'gregorian',
          weekend_days: Array.isArray(academyData.weekend_days) ? academyData.weekend_days : ['friday', 'saturday'],
          
          learning_type: academyData.learning_type || 'online',
          default_qiraat: academyData.default_qiraat || 'hafs',
          teaching_methodology: academyData.teaching_methodology || 'mashreqi',
          
          allow_self_registration: academyData.allow_self_registration ?? true,
          require_approval: academyData.require_approval ?? true,
          max_students_per_group: Number(academyData.max_students_per_group) || 25,
        };

        setFormData(fetched);
        setInitialData(fetched);
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      showToast(`${t('fetch_error')}${getErrorMessage(err)}`, 'error');
    } finally {
      setLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, [currentAcademyId, isValidAcademyId, t, showToast]);

  useEffect(() => {
    fetchAcademySettings();
  }, [fetchAcademySettings]);

  const updateField = <K extends keyof AcademyFormData>(field: K, value: AcademyFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (lang: SupportedLanguage, value: string) => {
    const generatedSlug = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    setFormData((prev) => ({
      ...prev,
      [`name_${lang}`]: value,
      slug: prev.slug === '' || prev.slug === initialData.slug ? generatedSlug : prev.slug,
    }));
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidAcademyId) {
      showToast(t('invalid_id_logo'), 'error');
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      showToast(t('invalid_type'), 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast(t('size_exceeded'), 'error');
      return;
    }

    let uploadedFilePath: string | null = null;

    try {
      setUploadingLogo(true);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const uniqueRandom = Math.random().toString(36).substring(2, 8);
      uploadedFilePath = `academy/${currentAcademyId}/logo/${Date.now()}-${uniqueRandom}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uploadedFilePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`[Storage] ${uploadError.message}`);

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadedFilePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) throw new Error(t('public_url_error'));

      const oldLogoUrl = formData.logo_url;

      const { error: dbError } = await supabase
        .from('academies')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', currentAcademyId!);

      if (dbError) {
        await supabase.storage.from(BUCKET_NAME).remove([uploadedFilePath]);
        throw new Error(`[Database] ${dbError.message}`);
      }

      const oldPath = extractStoragePathFromUrl(oldLogoUrl, BUCKET_NAME);
      if (oldPath) {
        await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
      }

      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));
      setInitialData((prev) => ({ ...prev, logo_url: publicUrl }));

      if (refreshStatus) await refreshStatus();

      showToast(t('logo_success'));
    } catch (err: unknown) {
      showToast(`${t('logo_fail')}${getErrorMessage(err)}`, 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!isValidAcademyId) return;

    try {
      const oldLogoUrl = formData.logo_url;

      const { error } = await supabase
        .from('academies')
        .update({ logo_url: null, updated_at: new Date().toISOString() })
        .eq('id', currentAcademyId!);

      if (error) throw new Error(error.message);

      const oldPath = extractStoragePathFromUrl(oldLogoUrl, BUCKET_NAME);
      if (oldPath) {
        await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
      }

      setFormData((prev) => ({ ...prev, logo_url: '' }));
      setInitialData((prev) => ({ ...prev, logo_url: '' }));

      if (refreshStatus) await refreshStatus();
      showToast(t('logo_remove_success'));
    } catch (err: unknown) {
      showToast(`${t('logo_remove_fail')}${getErrorMessage(err)}`, 'error');
    }
  };

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!isValidAcademyId) {
      showToast(t('invalid_id_save'), 'error');
      return;
    }

    const hasAnyName = Boolean(
      formData.name_ar.trim() ||
      formData.name_en.trim() ||
      formData.name_fr.trim() ||
      formData.name_tr.trim() ||
      formData.name_ur.trim() ||
      formData.name_id.trim()
    );

    if (!hasAnyName) {
      showToast(t('name_required'), 'error');
      return;
    }

    const maxStudents = Number(formData.max_students_per_group);
    if (isNaN(maxStudents) || maxStudents < 1 || maxStudents > 1000) {
      showToast(t('invalid_max_students'), 'error');
      return;
    }

    try {
      setSaving(true);

      const fallbackName =
        formData.name_ar.trim() ||
        formData.name_en.trim() ||
        formData.name_fr.trim() ||
        formData.name_tr.trim() ||
        formData.name_ur.trim() ||
        formData.name_id.trim();

      const namePayload: MultiLangName = {
        ar: formData.name_ar.trim() || fallbackName,
        en: formData.name_en.trim() || fallbackName,
        fr: formData.name_fr.trim() || fallbackName,
        tr: formData.name_tr.trim() || fallbackName,
        ur: formData.name_ur.trim() || fallbackName,
        id: formData.name_id.trim() || fallbackName,
      };

      let formattedSlug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (!formattedSlug) {
        formattedSlug = `academy-${String(currentAcademyId).slice(0, 8)}`;
      }

      const savedFormData: AcademyFormData = {
        ...formData,
        slug: formattedSlug,
        max_students_per_group: maxStudents,
      };

      const updatePayload = {
        name: namePayload,
        slug: formattedSlug,
        logo_url: savedFormData.logo_url || null,
        tagline: savedFormData.tagline || null,
        description: savedFormData.description || null,
        brand_color: savedFormData.brand_color,
        
        contact_email: savedFormData.contact_email || null,
        contact_phone: savedFormData.contact_phone || null,
        website: savedFormData.website || null,
        country_code: savedFormData.country_code,
        
        currency: savedFormData.currency,
        timezone: savedFormData.timezone,
        language_code: savedFormData.language_code,
        calendar_type: savedFormData.calendar_type,
        weekend_days: savedFormData.weekend_days,
        
        learning_type: savedFormData.learning_type,
        default_qiraat: savedFormData.default_qiraat,
        teaching_methodology: savedFormData.teaching_methodology,
        
        allow_self_registration: savedFormData.allow_self_registration,
        require_approval: savedFormData.require_approval,
        max_students_per_group: maxStudents,
        
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('academies')
        .update(updatePayload)
        .eq('id', currentAcademyId!);

      if (error) throw error;

      setFormData(savedFormData);
      setInitialData(savedFormData);

      if (refreshStatus) await refreshStatus();

      localStorage.setItem('app_currency', savedFormData.currency);
      window.dispatchEvent(new CustomEvent('currencyUpdated', { detail: savedFormData.currency }));
      if (onCurrencyChange) onCurrencyChange(savedFormData.currency);

      showToast(t('save_success'));
    } catch (err: unknown) {
      showToast(`${t('save_fail')}${getErrorMessage(err)}`, 'error');
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
    rawAcademyData,
    loading,
    saving,
    uploadingLogo,
    isDirty,
    isRtl,
    currentLang,
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
    fetchAcademySettings,
  };
}

export default useAcademySettings;
