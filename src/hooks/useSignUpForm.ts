import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { handleAuthError } from '@/utils/errorHandler';
import { signUpSchema, validateFormData } from '@/schemas/auth';

export interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
  general?: string;
}

export interface StatusState {
  type: 'success' | 'error' | null;
  msg: string;
}

export const useSignUpForm = (onSignUpSuccess?: () => void) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : true;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<StatusState>({ type: null, msg: '' });

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggleLanguage = useCallback(() => {
    const currentLang = i18n.language || 'ar';
    const nextLang = currentLang.startsWith('ar') ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  }, [i18n]);

  const handleAgreeTermsChange = useCallback((checked: boolean) => {
    setAgreeTerms(checked);
    if (checked) {
      setFieldErrors((prev) => ({ ...prev, agreeTerms: undefined }));
      setStatus((prev) =>
        prev.msg?.includes('الشروط') || prev.msg?.includes('Terms') ? { type: null, msg: '' } : prev
      );
    }
  }, []);

  // دالة التحقق المباشر باستخدام الـ Schema فقط (Single Source of Truth)
  const validateFormDirectly = useCallback((): string | null => {
    const formData = {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      agreeTerms,
    };

    const validation = validateFormData(signUpSchema, formData);

    if (!validation.success) {
      if (validation.fieldErrors) {
        setFieldErrors(validation.fieldErrors as FieldErrors);
      }
      return validation.error || 'auth.fillRequiredFields';
    }

    setFieldErrors({});
    return null;
  }, [fullName, email, password, confirmPassword, agreeTerms]);

  const validateForm = useCallback(() => {
    const errorKey = validateFormDirectly();
    return errorKey === null;
  }, [validateFormDirectly]);

  const handleSignUp = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      if (isMounted.current) setStatus({ type: null, msg: '' });

      if (!validateForm()) return;

      try {
        if (isMounted.current) setLoading(true);

        const response: AuthResponse = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (response.error) throw response.error;

        if (isMounted.current) {
          setStatus({
            type: 'success',
            msg: t('auth.signUpSuccess', 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني للتأكيد.'),
          });
        }

        if (onSignUpSuccess) {
          onSignUpSuccess();
        }
      } catch (err: unknown) {
        console.error('Sign Up Error:', err);
        const translatedError = handleAuthError(err);
        if (isMounted.current) {
          setStatus({
            type: 'error',
            msg: translatedError || t('auth.signUpFailed', 'حدث خطأ أثناء إنشاء الحساب.'),
          });
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [email, password, fullName, validateForm, onSignUpSuccess, t]
  );

  return {
    isRtl,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    agreeTerms,
    setAgreeTerms: handleAgreeTermsChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    fieldErrors,
    setFieldErrors,
    status,
    setStatus,
    toggleLanguage,
    handleSignUp,
    validateFormDirectly,
    navigate,
  };
};

export default useSignUpForm;
