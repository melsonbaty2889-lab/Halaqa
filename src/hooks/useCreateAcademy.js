import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

export function useCreateAcademy(onSubmitAcademy) {
  const { t, i18n } = useTranslation();

  const [academyName, setAcademyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting || !academyName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. توليد Slug مخفي وتلقائي من الاسم مع ضمان عدم التكرار
      const cleanSlug = academyName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const generatedSlug = cleanSlug 
        ? `${cleanSlug}-${Date.now().toString().slice(-4)}`
        : `academy-${Date.now().toString().slice(-6)}`;

      // 2. تحديد اسم حقل اللغة الحالية
      const currentLang = i18n.language || 'ar';
      const nameKey = `name_${currentLang}`;

      // 3. استدعاء الدالة السحابية مع التمرير الآمن
      const { data, error } = await supabase.rpc('create_academy_with_owner', {
        p_name: academyName.trim(),
        [nameKey]: academyName.trim(),
        p_slug: generatedSlug,
        p_country_code: 'SA',
        p_currency: 'SAR',
        p_learning_type: 'online',
        p_default_qiraat: 'hafs_an_asem',
        p_teaching_methodology: 'mashreqi',
        p_logo_url: null,
      });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(async () => {
        if (onSubmitAcademy) await onSubmitAcademy(data);
      }, 1000);

    } catch (error) {
      console.error('Create academy error:', error);
      setErrorMsg(
        error.message?.includes('duplicate key') || error.code === '23505'
          ? t('errors.slug_taken', 'اسم الأكاديمية مستخدم بالفعل، يرجى كتابة اسم آخر')
          : (error.message || t('errors.generic', 'حدث خطأ أثناء الإنشاء'))
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [academyName, isSubmitting, i18n.language, onSubmitAcademy, t]);

  return {
    academyName,
    setAcademyName,
    isSubmitting,
    isSuccess,
    errorMsg,
    handleSubmit
  };
}
