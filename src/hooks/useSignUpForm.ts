import { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { handleAuthError } from '@/utils/errorHandler';
import { signUpSchema, validateFormData } from '@/schemas/auth';

// ── Types & Interfaces ──────────────────────────────────────────

export interface SignUpStatus {
  type: 'success' | 'error' | null;
  msg: string;
}

export type OnSignUpSuccessCallback = (data: AuthResponse['data']) => void;

export type UserRole = 'student' | 'teacher' | 'parent' | 'academy_admin' | string;

// ── Main Hook ───────────────────────────────────────────────────

export function useSignUpForm(onSignUpSuccess?: OnSignUpSuccessCallback) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isRtl = i18n?.language === 'ar';

  // 1. القراءة المباشرة من Local Storage مع معالجة حذرة
  const [fullName, setFullName] = useState<string>(() => {
    try {
      return localStorage.getItem('signup_draft_name') || '';
    } catch {
      return '';
    }
  });

  const [email, setEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('signup_draft_email') || '';
    } catch {
      return '';
    }
  });

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('student');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean | string>>({});
  const [status, setStatus] = useState<SignUpStatus>({ type: null, msg: '' });

  // 2. تحديث الحفظ التلقائي فور تغيير القيم
  useEffect(() => {
    try {
      if (fullName) {
        localStorage.setItem('signup_draft_name', fullName);
      } else {
        localStorage.removeItem('signup_draft_name');
      }
    } catch (e) {
      console.error('Error saving name draft:', e);
    }
  }, [fullName]);

  useEffect(() => {
    try {
      if (email) {
        localStorage.setItem('signup_draft_email', email);
      } else {
        localStorage.removeItem('signup_draft_email');
      }
    } catch (e) {
      console.error('Error saving email draft:', e);
    }
  }, [email]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(nextLang);
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const trackFailedAttempt = async (
    failedEmail: string,
    failedName: string,
    reason: string
  ) => {
    try {
      if (!failedEmail) return;
      // تسجيل محاولات التسجيل الفاشلة للتحليل والمتابعة
    } catch (e) {
      console.error('Failed to log lead attempt:', e);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });
    setFieldErrors({});

    if (!agreeTerms) {
      setFieldErrors({ agreeTerms: true });
      setStatus({
        type: 'error',
        msg: isRtl
          ? 'يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.'
          : 'Please agree to the terms and privacy policy to continue.',
      });
      return;
    }

    const formData = {
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      role,
      agreeTerms,
    };

    const validationResult = validateFormData(formData, signUpSchema);

    if (!validationResult.valid) {
      setFieldErrors(validationResult.errors || {});

      if (validationResult.errors?.agreeTerms) {
        setStatus({
          type: 'error',
          msg: isRtl
            ? 'يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.'
            : 'Please agree to the terms and privacy policy to continue.',
        });
      } else {
        setStatus({
          type: 'error',
          msg: isRtl
            ? 'يرجى التأكد من صحة البيانات المدخلة أعلاه.'
            : 'Please correct the highlighted errors above.',
        });
      }
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validationResult.data.email,
        password: validationResult.data.password,
        options: {
          data: {
            full_name: validationResult.data.fullName,
            role: validationResult.data.role,
          },
          emailRedirectTo: `${window.location.origin}?lang=${i18n?.language || 'ar'}`,
        },
      });

      if (authError) throw authError;

      // مسح المسودة فور نجاح عملية التسجيل
      localStorage.removeItem('signup_draft_name');
      localStorage.removeItem('signup_draft_email');

      setStatus({
        type: 'success',
        msg: isRtl
          ? '✅ تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب.'
          : '✅ Account created! Please check your email to activate.',
      });

      if (onSignUpSuccess) {
        onSignUpSuccess(authData);
      }
    } catch (err: unknown) {
      console.error('Sign Up Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      trackFailedAttempt(formData.email, formData.fullName, errorMessage);

      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({
        type: 'error',
        msg: userFriendlyMsg,
      });
    } finally {
      setLoading(false);
    }
  };

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
    role,
    setRole,
    agreeTerms,
    setAgreeTerms,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    capsLockOn,
    fieldErrors,
    setFieldErrors,
    status,
    setStatus,
    toggleLanguage,
    handleKeyUp,
    handleSignUp,
  };
}
