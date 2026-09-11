import { useState, useCallback, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface CreateAcademyPayload {
  p_name: string | Record<string, string>;
  p_slug: string;
  p_country_code?: string;
  p_currency?: string;
  p_learning_type?: string;
  p_default_qiraat?: string;
  p_teaching_methodology?: string;
  p_logo_url?: string | null;
  [key: string]: any;
}

export type OnSubmitAcademyCallback = (data: any) => Promise<void> | void;

export interface UseCreateAcademyReturn {
  academyName: string;
  setAcademyName: (name: string) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  errorMsg: string;
  handleSubmit: (e?: FormEvent) => Promise<any>;
  reset: () => void;
}

// ── Helper Function ─────────────────────────────────────────────

/**
 * توليد Slug آمن يدعم الحروف العربية والإنجليزية والترقيم
 */
function generateSlug(text: string): string {
  const cleanText = text
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // السماح بالحروف العربية والأرقام واللاتينية
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const timeStamp = Date.now().toString().slice(-5);
  
  if (!cleanText) {
    return `academy-${timeStamp}`;
  }
  
  return `${cleanText}-${timeStamp}`;
}

// ── Main Hook ───────────────────────────────────────────────────

export function useCreateAcademy(
  onSubmitAcademy?: OnSubmitAcademyCallback | null
): UseCreateAcademyReturn {
  const { t, i18n } = useTranslation();

  const [academyName, setAcademyName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const reset = useCallback(() => {
    setAcademyName('');
    setIsSubmitting(false);
    setIsSuccess(false);
    setErrorMsg('');
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();

      const trimmedName = academyName.trim();
      if (isSubmitting || !trimmedName) return;

      setIsSubmitting(true);
      setErrorMsg('');

      try {
        // 1. توليد Slug تلقائي وآمن من اسم الأكاديمية
        const generatedSlug = generateSlug(trimmedName);

        // 2. تحديد مفتاح اسم اللغة الحالية
        const currentLang = i18n?.language || 'ar';
        const nameKey = `name_${currentLang}`;

        // 3. تجهيز بيانات RPC واستدعاء الدالة السحابية
        const rpcPayload: CreateAcademyPayload = {
          p_name: trimmedName,
          [nameKey]: trimmedName,
          p_slug: generatedSlug,
          p_country_code: 'SA',
          p_currency: 'SAR',
          p_learning_type: 'online',
          p_default_qiraat: 'hafs_an_asem',
          p_teaching_methodology: 'mashreqi',
          p_logo_url: null,
        };

        const { data, error } = await supabase.rpc('create_academy_with_owner', rpcPayload);

        if (error) throw error;

        setIsSuccess(true);

        if (onSubmitAcademy) {
          await onSubmitAcademy(data);
        }

        return data;
      } catch (error: any) {
        console.error('Create academy error:', error);
        
        const isDuplicate =
          error?.message?.includes('duplicate key') ||
          error?.code === '23505' ||
          error?.message?.includes('academies_slug_key');

        const fallbackMsg = isDuplicate
          ? t('errors.slug_taken', 'اسم الأكاديمية مستخدم بالفعل، يرجى كتابة اسم آخر')
          : error?.message || t('errors.generic', 'حدث خطأ أثناء إنشاء الأكاديمية');

        setErrorMsg(fallbackMsg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [academyName, isSubmitting, i18n?.language, onSubmitAcademy, t]
  );

  return {
    academyName,
    setAcademyName,
    isSubmitting,
    isSuccess,
    errorMsg,
    handleSubmit,
    reset,
  };
}

export default useCreateAcademy;
