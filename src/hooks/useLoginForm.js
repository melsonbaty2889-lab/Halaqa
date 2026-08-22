import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { handleAuthError } from '@/utils/errorHandler';
import { loginSchema, validateFormData } from '@/schemas/auth';

export function useLoginForm(onLoginSuccess) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isRtl = i18n?.language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: null, msg: '' });
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    let timer;
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

  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });
    setFieldErrors({});
    setShowResend(false);

    const validationResult = validateFormData(
      { email: email.trim(), password: password.trim() },
      loginSchema
    );

    if (!validationResult.valid) {
      setFieldErrors(validationResult.errors);
      setStatus({
        type: 'error',
        msg: isRtl ? 'يرجى تصحيح الأخطاء الموضحة أدناه.' : 'Please correct the highlighted errors.'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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
      setRedirecting(true);

      await supabase
        .from('profiles')
        .update({ 
          last_login_at: new Date().toISOString(),
          is_online: true 
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
        throw new Error(isRtl ? 'هذا الحساب معطل أو تم حذفه.' : 'This account is deactivated or deleted.');
      }

      setStatus({
        type: 'success',
        msg: isRtl ? '✅ تم تسجيل الدخول بنجاح! جاري التوجيه...' : '✅ Logged in successfully! Redirecting...'
      });

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({ user, profile });
        } else {
          const role = profile?.role?.toLowerCase().trim() || 'student';
          const routeMap = {
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

    } catch (err) {
      console.error('Login Error:', err);
      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({
        type: 'error',
        msg: userFriendlyMsg
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
          emailRedirectTo: `${window.location.origin}?lang=${i18n?.language || 'ar'}`
        }
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl 
          ? '✅ تم إعادة إرسال رابط التفعيل! تفقد البريد الوارد أو المجلد غير المرغوب به (Spam).' 
          : '✅ Activation link sent! Check your inbox or spam folder.'
      });
      setShowResend(false);
      setCooldown(60);

    } catch (error) {
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
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
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
