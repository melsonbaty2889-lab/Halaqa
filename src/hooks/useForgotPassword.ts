import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface StatusState {
  type: 'error' | 'success' | null;
  msg: string;
}

export interface UseForgotPasswordReturn {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  isSubmitted: boolean;
  cooldown: number;
  status: StatusState;
  toggleLanguage: () => void;
  handleReset: (e?: FormEvent) => Promise<void>;
  resendResetEmail: () => Promise<void>;
  isRtl: boolean;
  currentLang: string;
}

// ── Main Hook ───────────────────────────────────────────────────

export function useForgotPassword(): UseForgotPasswordReturn {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [status, setStatus] = useState<StatusState>({ type: null, msg: '' });

  const currentLang = i18n?.language || 'ar';
  const isRtl = i18n?.dir() === 'rtl' || currentLang === 'ar';

  // 1. تحديث عنوان الصفحة واتجاه Document
  useEffect(() => {
    document.title = t('auth.forgot_password_title', 'استعادة كلمة المرور | الحلقة الذكية');
    document.dir = isRtl ? 'rtl' : 'ltr';
  }, [t, currentLang, isRtl]);

  // 2. إدارة العد التنازلي (Cooldown Timer)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // 3. تبديل اللغة
  const toggleLanguage = useCallback(() => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(nextLang);
    }
  }, [i18n, currentLang]);

  // 4. تنفيذ طلب إعادة تعيين كلمة المرور
  const handleReset = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      const trimmedEmail = email.trim();

      if (!trimmedEmail || cooldown > 0 || loading) return;

      // تحقق بسيط من صيغة البريد
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setStatus({
          type: 'error',
          msg: t('auth.invalid_email', 'يرجى إدخال بريد إلكتروني صحيح.'),
        });
        return;
      }

      setLoading(true);
      setStatus({ type: null, msg: '' });

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
          let errorMsg = error.message || '';
          if (errorMsg.toLowerCase().includes('user not found')) {
            errorMsg = t('auth.user_not_found', 'البريد الإلكتروني غير مسجل لدينا.');
          } else if (
            errorMsg.toLowerCase().includes('rate limit') ||
            (error as any).status === 429
          ) {
            errorMsg = t(
              'auth.rate_limit',
              'تجاوزت حد إرسال الرسائل المسموح به. انتظر دقيقة ثم حاول مجدداً.'
            );
          } else {
            errorMsg = `${t('errors.server_error', 'خطأ الخادم')}: ${errorMsg}`;
          }
          setStatus({ type: 'error', msg: errorMsg });
        } else {
          setIsSubmitted(true);
          setCooldown(60);
          setStatus({
            type: 'success',
            msg: t('auth.reset_email_sent', 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.'),
          });
        }
      } catch (err: any) {
        const fallbackMsg = err?.message || t('errors.generic', 'حدث خطأ غير متوقع');
        setStatus({ type: 'error', msg: fallbackMsg });
      } finally {
        setLoading(false);
      }
    },
    [email, cooldown, loading, t]
  );

  // 5. دالة إعادة الإرسال بعد انتهاء المهلة
  const resendResetEmail = useCallback(async () => {
    if (cooldown === 0) {
      await handleReset();
    }
  }, [cooldown, handleReset]);

  return {
    email,
    setEmail,
    loading,
    isSubmitted,
    cooldown,
    status,
    toggleLanguage,
    handleReset,
    resendResetEmail,
    isRtl,
    currentLang,
  };
}

export default useForgotPassword;
