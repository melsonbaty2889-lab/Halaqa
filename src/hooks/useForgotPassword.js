import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

export function useForgotPassword() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState({ type: null, msg: '' });

  useEffect(() => {
    document.title = t('auth.forgot_password_title', 'استعادة كلمة المرور | الحلقة الذكية');
  }, [t, i18n.language]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const toggleLanguage = useCallback(() => {
    const nextLang = i18n?.language === 'ar' ? 'en' : 'ar';
    if (i18n?.changeLanguage) i18n.changeLanguage(nextLang);
  }, [i18n]);

  const handleReset = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || cooldown > 0 || loading) return;

    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        let errorMsg = error.message || '';
        if (errorMsg.includes('User not found')) {
          errorMsg = t('auth.user_not_found', 'البريد الإلكتروني غير مسجل لدينا.');
        } else if (errorMsg.toLowerCase().includes('rate limit') || error.status === 429) {
          errorMsg = t('auth.rate_limit', 'تجاوزت حد إرسال الرسائل المسموح به. انتظر دقيقة ثم حاول مجدداً.');
        } else {
          errorMsg = `${t('errors.server_error', 'خطأ الخادم')}: ${errorMsg}`;
        }
        setStatus({ type: 'error', msg: errorMsg });
      } else {
        setIsSubmitted(true);
        setCooldown(60);
      }
    } catch (err) {
      const fallbackMsg = err?.message || t('errors.generic', 'حدث خطأ غير متوقع');
      setStatus({ type: 'error', msg: fallbackMsg });
    } finally {
      setLoading(false);
    }
  }, [email, cooldown, loading, t]);

  return {
    email,
    setEmail,
    loading,
    isSubmitted,
    cooldown,
    status,
    toggleLanguage,
    handleReset,
    isRtl: i18n?.dir() === 'rtl',
    currentLang: i18n?.language
  };
}
