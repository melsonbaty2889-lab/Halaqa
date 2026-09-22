import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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

export const useSignUpForm = (
  onSignUpSuccess?: () => void,
  onSwitchToLogin?: (email?: string) => void
) => {
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<StatusState>({ type: null, msg: '' });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isMounted = useRef(true);

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

  const clearFieldError = useCallback((fieldName: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const handleAgreeTermsChange = useCallback((checked: boolean) => {
    setAgreeTerms(checked);
    if (checked) {
      clearFieldError('agreeTerms');
      setStatus((prev) => (prev.type === 'error' ? { type: null, msg: '' } : prev));
    }
  }, [clearFieldError]);

  const validateFormDirectly = useCallback((): boolean => {
    const formData = {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      agreeTerms,
    };

    const validation = validateFormData(formData, signUpSchema);
    if (!validation.valid) {
      const errors = (validation.errors || {}) as FieldErrors;
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  }, [fullName, email, password, confirmPassword, agreeTerms]);

  const handleSignUp = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      setHasSubmitted(true);
      if (isMounted.current) setStatus({ type: null, msg: '' });

      const isValid = validateFormDirectly();
      if (!isValid) {
        return false;
      }

      const cleanEmail = email.trim();

      try {
        if (isMounted.current) setLoading(true);

        const response: AuthResponse = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/select-role`,
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (response.error) throw response.error;

        // في حال كان البريد مسجلاً سابقاً بدون تفعيل أو بدون إرجاع خطأ مباشر من Supabase
        if (
          response.data?.user &&
          response.data.user.identities &&
          response.data.user.identities.length === 0
        ) {
          if (isMounted.current) {
            setStatus({
              type: 'error',
              msg: t('auth.emailAlreadyRegistered', 'هذا البريد الإلكتروني مسجل بالفعل. جاري تحويلك لتسجيل الدخول...'),
            });
          }
          setTimeout(() => {
            if (isMounted.current && onSwitchToLogin) {
              onSwitchToLogin(cleanEmail);
            }
          }, 1500);
          return false;
        }

        if (isMounted.current) {
          setStatus({
            type: 'success',
            msg: t('auth.signUpSuccess', 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني للتأكيد.'),
          });
        }
        if (onSignUpSuccess) {
          onSignUpSuccess();
        }
        return true;
      } catch (err: any) {
        console.error('Sign Up Detailed Error:', err);

        let rawMessage = '';
        if (typeof err === 'string') {
          rawMessage = err;
        } else if (err?.message && typeof err.message === 'string') {
          rawMessage = err.message;
        } else if (err?.error_description && typeof err.error_description === 'string') {
          rawMessage = err.error_description;
        }

        const isAlreadyRegistered =
          rawMessage.toLowerCase().includes('already registered') ||
          rawMessage.toLowerCase().includes('already in use') ||
          rawMessage.toLowerCase().includes('user_already_exists') ||
          err?.status === 400;

        if (isAlreadyRegistered) {
          if (isMounted.current) {
            setStatus({
              type: 'error',
              msg: t('auth.emailAlreadyRegistered', 'هذا البريد الإلكتروني مسجل بالفعل. جاري تحويلك لتسجيل الدخول...'),
            });
          }
          setTimeout(() => {
            if (isMounted.current && onSwitchToLogin) {
              onSwitchToLogin(cleanEmail);
            }
          }, 1500);
          return false;
        }

        let errorString = rawMessage || t('auth.signUpFailed', 'حدث خطأ أثناء إنشاء الحساب.');

        if (isMounted.current) {
          setStatus({
            type: 'error',
            msg: errorString,
          });
        }
        return false;
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [email, password, fullName, validateFormDirectly, onSignUpSuccess, onSwitchToLogin, t]
  );

  const handleGoogleSignUp = useCallback(async () => {
    if (!agreeTerms) {
      const errorMsg = t('auth.agreeTermsRequired', 'يرجى الموافقة على الشروط وسياسة الخصوصية أولاً.');
      setFieldErrors((prev) => ({ ...prev, agreeTerms: errorMsg }));
      return false;
    }

    try {
      if (isMounted.current) setGoogleLoading(true);
      if (supabase?.auth?.signInWithOAuth) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/select-role`,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });
        if (error) throw error;
      }
      return true;
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const errorString = err?.message || t('auth.googleSignUpFailed', 'فشل التسجيل بواسطة Google');
      if (isMounted.current) {
        setStatus({
          type: 'error',
          msg: errorString,
        });
      }
      return false;
    } finally {
      if (isMounted.current) setGoogleLoading(false);
    }
  }, [agreeTerms, t]);

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
    googleLoading,
    fieldErrors,
    setFieldErrors,
    clearFieldError,
    status,
    setStatus,
    toggleLanguage,
    handleSignUp,
    handleGoogleSignUp,
    validateFormDirectly,
    navigate,
  };
};

export default useSignUpForm;
