import { useState, useEffect, useCallback, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { handleAuthError } from '@/utils/errorHandler';
import { signUpSchema, validateFormData } from '@/schemas/auth';

export interface FieldErrors {
  fullName?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
  agreeTerms?: boolean;
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

  const toggleLanguage = useCallback(() => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  }, [i18n]);

  const handleAgreeTermsChange = useCallback((checked: boolean) => {
    setAgreeTerms(checked);
    if (checked) {
      setFieldErrors((prev) => ({ ...prev, agreeTerms: false }));
      setStatus((prev) => (prev.msg?.includes('الشروط') || prev.msg?.includes('Terms') ? { type: null, msg: '' } : prev));
    }
  }, []);

  const validateForm = useCallback(() => {
    const formData = {
      fullName,
      email,
      password,
      confirmPassword,
      agreeTerms,
    };

    // التحقق عبر Zod / signUpSchema
    const validation = validateFormData(signUpSchema, formData);

    if (!validation.success) {
      const errors: FieldErrors = {};
      
      if (!fullName.trim()) errors.fullName = true;
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = true;
      if (!password || password.length < 6) errors.password = true;
      if (password !== confirmPassword) errors.confirmPassword = true;
      if (!agreeTerms) errors.agreeTerms = true;

      setFieldErrors(errors);

      if (errors.agreeTerms && Object.keys(errors).length === 1) {
        setStatus({
          type: 'error',
          msg: t('auth.agreeTermsRequired', 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً.'),
        });
        return false;
      }

      setStatus({
        type: 'error',
        msg: validation.error || t('auth.fillRequiredFields', 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.'),
      });
      return false;
    }

    setFieldErrors({});
    return true;
  }, [fullName, email, password, confirmPassword, agreeTerms, t]);

  const handleSignUp = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      setStatus({ type: null, msg: '' });

      if (!validateForm()) return;

      try {
        setLoading(true);

        const response: AuthResponse = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (response.error) throw response.error;

        setStatus({
          type: 'success',
          msg: t('auth.signUpSuccess', 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني للتأكيد.'),
        });

        if (onSignUpSuccess) {
          onSignUpSuccess();
        }
      } catch (err: any) {
        console.error('Sign Up Error:', err);
        const translatedError = handleAuthError(err);
        setStatus({
          type: 'error',
          msg: translatedError || t('auth.signUpFailed', 'حدث خطأ أثناء إنشاء الحساب.'),
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password, fullName, validateForm, onSignUpSuccess, t]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSignUp();
      }
    },
    [handleSignUp]
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
    handleKeyUp,
    handleSignUp,
    navigate,
  };
};
