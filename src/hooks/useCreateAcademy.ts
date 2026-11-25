import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

/**
 * توليد Slug مطابق لقيد academies_slug_lowercase_check (حروف صغيرة وأرقام وشرطات فقط)
 */
function generateSafeSlug(nameText) {
  const latinPart = String(nameText || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  const suffix = Date.now().toString().slice(-5);

  if (!latinPart) {
    return `academy-${suffix}`;
  }

  return `${latinPart}-${suffix}`;
}

export function useCreateAcademy(onSubmitAcademy = null) {
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setErrorMsg('');
  }, []);

  const handleSubmit = useCallback(
    async (eOrData, maybeData) => {
      if (eOrData && typeof eOrData.preventDefault === 'function') {
        eOrData.preventDefault();
      }

      const rawInput =
        maybeData && typeof maybeData === 'object'
          ? maybeData
          : eOrData && typeof eOrData === 'object' && !eOrData.preventDefault
          ? eOrData
          : {};

      const academyName = String(rawInput.name || rawInput.academyName || '').trim();

      if (isSubmitting || !academyName) return null;

      setIsSubmitting(true);
      setErrorMsg('');

      try {
        const safeSlug = generateSafeSlug(academyName);
        const countryCode = rawInput.country_code
          ? String(rawInput.country_code).trim().toUpperCase().slice(0, 2)
          : null;

        const rpcParams = {
          p_name: academyName,
          p_slug: safeSlug,
          p_country_code: countryCode,
          p_default_qiraat: rawInput.default_qiraat || 'hafs_an_asem',
          p_teaching_methodology: rawInput.teaching_methodology || 'mashreqi',
          p_logo_url: rawInput.logo_url || null,
        };

        const { data, error } = await supabase.rpc('create_academy_with_owner', rpcParams);

        if (error) throw error;

        setIsSuccess(true);

        if (typeof onSubmitAcademy === 'function') {
          await onSubmitAcademy({
            ...data,
            ...rawInput,
            slug: safeSlug,
          });
        }

        return data;
      } catch (error) {
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
    [isSubmitting, onSubmitAcademy, t]
  );

  return {
    isSubmitting,
    isSuccess,
    errorMsg,
    handleSubmit,
    reset,
  };
}

export default useCreateAcademy;
