import { useState, useCallback, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface CreateAcademyPayload {
  p_name: string;
  p_slug: string;
  p_country_code: string;
  p_currency: string;
  p_learning_type: string;
  p_default_qiraat: string;
  p_teaching_methodology: string;
  p_logo_url: string | null;
  [key: string]: any; // للسماح بتمرير المفاتيح الديناميكية مثل name_ar أو name_en
}

export type OnSubmitAcademyCallback = (data: any) => Promise<void> | void;

export interface UseCreateAcademyReturn {
  academyName: string;
  setAcademyName: (name: string) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  errorMsg: string;
  handleSubmit: (e?: FormEvent) => Promise<void>;
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

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      if (isSubmitting || !academyName.trim()) return;

      setIsSubmitting(true);
      setErrorMsg('');

      try {
        // 1. توليد Slug تلقائي وآمن من اسم الأكاديمية
        const cleanSlug = academyName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        const generatedSlug = cleanSlug
          ? `${cleanSlug}-${Date.now().toString().slice(-4)}`
          : `academy-${Date.now().toString().slice(-6)}`;

        // 2. تحديد مفتاح اسم اللغة الحالية
        const currentLang = i18n.language || 'ar';
        const nameKey = `name_${currentLang}`;

        // 3. تجهيز بيانات RPC واستدعاء الدالة السحابية
        const rpcPayload: CreateAcademyPayload = {
          p_name: academyName.trim(),
          [nameKey]: academyName.trim(),
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
        setTimeout(async () => {
          if (onSubmitAcademy) await onSubmitAcademy(data);
        }, 1000);
      } catch (error: any) {
        console.error('Create academy error:', error);
        setErrorMsg(
          error?.message?.includes('duplicate key') || error?.code === '23505'
            ? t('errors.slug_taken', 'اسم الأكاديمية مستخدم بالفعل، يرجى كتابة اسم آخر')
            : error?.message || t('errors.generic', 'حدث خطأ أثناء الإنشاء')
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [academyName, isSubmitting, i18n.language, onSubmitAcademy, t]
  );

  return {
    academyName,
    setAcademyName,
    isSubmitting,
    isSuccess,
    errorMsg,
    handleSubmit,
  };
}

export default useCreateAcademy;
