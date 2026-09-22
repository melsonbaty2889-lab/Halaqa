import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { handleAuthError } from '@/utils/errorHandler';
import { loginSchema, validateFormData } from '@/schemas/auth';

// ── Types & Interfaces ──────────────────────────────────────────

export interface UserProfile {
  id?: string;
  role?: string;
  academy_id?: string | null;
  is_activated?: boolean;
  is_deleted?: boolean;
}

export interface AuthStatus {
  type: 'success' | 'error' | null;
  msg: string;
}

export type OnLoginSuccessCallback = (data: {
  user: User;
  profile: UserProfile | null;
}) => void;

// اللغات المدعومة بالترتيب
const SUPPORTED_LANGUAGES = ['ar', 'en', 'fr', 'tr', 'ur', 'id'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// لغات الـ RTL
const RTL_LANGUAGES = ['ar', 'ur', 'fa', 'he'];

// ── Main Hook ───────────────────────────────────────────────────

export function useLoginForm(onLoginSuccess?: OnLoginSuccessCallback) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isMounted = useRef<boolean>(true);

  // استخراج كود اللغة الأساسي (مثلاً ur من ur-PK)
  const currentLangCode = (i18n?.language?.split('-')[0] || 'ar').toLowerCase();
  
  // التحقق الصحيح من اتجاه RTL بمرونة عالية
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : RTL_LANGUAGES.includes(currentLangCode);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<AuthStatus>({ type: null, msg: '' });
  const [showResend, setShowResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // التبديل الدوري بين اللغات الـ 6 المدعومة
  const toggleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLangCode as SupportedLanguage);
    const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % SUPPORTED_LANGUAGES.length : 0;
    const nextLang = SUPPORTED_LANGUAGES[nextIndex];
    
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(nextLang);
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    if (e) e.preventDefault();
    if (!isMounted.current) return;

    setStatus({ type: null, msg: '' });
    setFieldErrors({});
    setShowResend(false);

    const validationResult = validateFormData(
      { email: email.trim(), password: password.trim() },
      loginSchema
    );

    if (!validationResult.valid) {
      setFieldErrors(validationResult.errors || {});
      setStatus({
        type: 'error',
        msg: t('auth.errors.fixHighlighted', 'يرجى تصحيح الأخطاء الموضحة أدناه.'),
      });
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: validationResult.data.email,
          password: validationResult.data.password,
        });

      if (authError) {
        if (authError.message === 'Email not confirmed') {
          if (isMounted.current) setShowResend(true);
        }
        throw authError;
      }

      const user = authData.user;
      if (!user) throw new Error(t('auth.errors.userNotFound', 'تعذر العثور على بيانات المستخدم.'));

      if (isMounted.current) setRedirecting(true);

      // 1. تحديث تاريخ آخر دخول والحالة بجدول profiles
      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          is_online: true,
        })
        .eq('id', user.id);

      // 2. جلب الملف والصلاحيات
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, academy_id, is_activated, is_deleted')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // 3. التحقق من الحساب المحذوف/المعطل
      if (profile?.is_deleted) {
        await supabase.auth.signOut();
        if (isMounted.current) setRedirecting(false);
        throw new Error(
          t('auth.errors.accountDeactivated', 'هذا الحساب معطل أو تم حذفه.')
        );
      }

      if (isMounted.current) {
        setStatus({
          type: 'success',
          msg: t('auth.success.login', '✅ تم تسجيل الدخول بنجاح! جاري التوجيه...'),
        });
      }

      setTimeout(() => {
        if (!isMounted.current) return;
        if (onLoginSuccess) {
          onLoginSuccess({ user, profile: profile as UserProfile });
        } else {
          const role = profile?.role?.toLowerCase().trim() || 'student';
          const routeMap: Record<string, string> = {
            super_admin: '/admin-dashboard',
            admin: '/dashboard',
            academy_admin: '/dashboard',
            teacher: '/teacher-dashboard',
            student: '/student-dashboard',
            parent: '/parent-dashboard',
          };
          navigate(routeMap[role] || '/dashboard');
        }
      }, 500);
    } catch (err: unknown) {
      console.error('Login Error:', err);
      const userFriendlyMsg = handleAuthError(err, isRtl);
      if (isMounted.current) {
        setStatus({
          type: 'error',
          msg: userFriendlyMsg,
        });
        setRedirecting(false);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim() || cooldown > 0) return;

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}?lang=${currentLangCode}`,
        },
      });

      if (error) throw error;

      if (isMounted.current) {
        setStatus({
          type: 'success',
          msg: t('auth.success.resend', '✅ تم إعادة إرسال رابط التفعيل!'),
        });
        setShowResend(false);
        setCooldown(60);
      }
    } catch (error: unknown) {
      const userFriendlyMsg = handleAuthError(error, isRtl);
      if (isMounted.current) {
        setStatus({ type: 'error', msg: userFriendlyMsg });
      }
    } finally {
      if (isMounted.current) setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (isMounted.current) setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return true;
    } catch (err: unknown) {
      const userFriendlyMsg = handleAuthError(err, isRtl);
      if (isMounted.current) {
        setStatus({ type: 'error', msg: userFriendlyMsg });
      }
      return false;
    } finally {
      if (isMounted.current) setGoogleLoading(false);
    }
  };

  return {
    isRtl,
    currentLang: currentLangCode,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    loading,
    googleLoading,
    redirecting,
    capsLockOn,
    cooldown,
    fieldErrors,
    setFieldErrors,
    status,
    setStatus,
    showResend,
    resendLoading,
    toggleLanguage,
    handleKeyUp,
    handleEmailLogin,
    handleResendEmail,
    handleGoogleLogin,
  };
}

export default useLoginForm;
