import { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
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

// ── Main Hook ───────────────────────────────────────────────────

export function useLoginForm(onLoginSuccess?: OnLoginSuccessCallback) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isRtl = i18n?.language === 'ar';

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<AuthStatus>({ type: null, msg: '' });
  const [showResend, setShowResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

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

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
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
        msg: isRtl
          ? 'يرجى تصحيح الأخطاء الموضحة أدناه.'
          : 'Please correct the highlighted errors.',
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
          setShowResend(true);
        }
        throw authError;
      }

      const user = authData.user;
      if (!user) throw new Error('تعذر العثور على بيانات المستخدم.');

      setRedirecting(true);

      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          is_online: true,
        })
        .eq('id', user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, academy_id, is_activated, is_deleted')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.is_deleted) {
        await supabase.auth.signOut();
        setRedirecting(false);
        throw new Error(
          isRtl
            ? 'هذا الحساب معطل أو تم حذفه.'
            : 'This account is deactivated or deleted.'
        );
      }

      setStatus({
        type: 'success',
        msg: isRtl
          ? '✅ تم تسجيل الدخول بنجاح! جاري التوجيه...'
          : '✅ Logged in successfully! Redirecting...',
      });

      setTimeout(() => {
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
      setStatus({
        type: 'error',
        msg: userFriendlyMsg,
      });
      setRedirecting(false);
    } finally {
      setLoading(false);
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
          emailRedirectTo: `${window.location.origin}?lang=${i18n?.language || 'ar'}`,
        },
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl
          ? '✅ تم إعادة إرسال رابط التفعيل! تفقد البريد الوارد أو المجلد غير المرغوب به (Spam).'
          : '✅ Activation link sent! Check your inbox or spam folder.',
      });
      setShowResend(false);
      setCooldown(60);
    } catch (error: unknown) {
      const userFriendlyMsg = handleAuthError(error, isRtl);
      setStatus({ type: 'error', msg: userFriendlyMsg });
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({ type: 'error', msg: userFriendlyMsg });
      setLoading(false);
    }
  };

  return {
    isRtl,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    loading,
    redirecting,
    capsLockOn,
    cooldown,
    fieldErrors,
    setFieldErrors,
    status,
    showResend,
    resendLoading,
    toggleLanguage,
    handleKeyUp,
    handleEmailLogin,
    handleResendEmail,
    handleGoogleLogin,
  };
}
