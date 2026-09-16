import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

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

export function useForgotPassword(): UseForgotPasswordReturn {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [status, setStatus] = useState<StatusState>({ type: null, msg: '' });

  const currentLang = i18n?.language || 'ar';
  const isRtl = i18n?.dir() === 'rtl' || currentLang === 'ar';

  useEffect(() => {
    document.title = t('auth.forgot_password_title', 'استعادة كلمة المرور | الحلقة الذكية');
    document.dir = isRtl ? 'rtl' : 'ltr';
  }, [t, currentLang, isRtl]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const toggleLanguage = useCallback(() => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(nextLang);
    }
  }, [i18n, currentLang]);

  // دالة تحويل وحظر كائنات الأخطاء الفارغة {}
  const parseErrorMessage = (err: any): string => {
    if (!err) return t('errors.generic', 'حدث خطأ غير متوقع');
    
    // استخراج النص من مختلف خواص الأخطاء الممكنة في Supabase
    let rawMsg = '';
    if (typeof err === 'string') {
      rawMsg = err;
    } else if (typeof err === 'object') {
      rawMsg = err.message || err.error_description || err.msg || err.details || '';
    }

    // تنظيف النص وتصفية الكائنات المجوفة
    rawMsg = typeof rawMsg === 'string' ? rawMsg.trim() : '';

    if (!rawMsg || rawMsg === '{}' || rawMsg === '[object Object]') {
      // التعامل مع حالات عدم وجود شبكة أو رفض الطلب من السيرفر
      if (err?.status === 0 || err?.name === 'FetchError') {
        return t('errors.network_error', 'فشل الاتصال بالخادم، تحقق من الاتصال بالإنترنت.');
      }
      return t('errors.generic', 'حدث خطأ غير متوقع أثناء معالجة الطلب');
    }

    return rawMsg;
  };

  const handleReset = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();
      const trimmedEmail = email.trim();

      if (!trimmedEmail || cooldown > 0 || loading) return;

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
          const rawMessage = parseErrorMessage(error);
          let finalMsg = '';

          if (rawMessage.toLowerCase().includes('user not found')) {
            finalMsg = t('auth.user_not_found', 'البريد الإلكتروني غير مسجل لدينا.');
          } else if (
            rawMessage.toLowerCase().includes('rate limit') ||
            (error as any).status === 429
          ) {
            finalMsg = t(
              'auth.rate_limit',
              'تجاوزت حد إرسال الرسائل المسموح به. انتظر دقيقة ثم حاول مجدداً.'
            );
          } else {
            finalMsg = `${t('errors.server_error', 'خطأ الخادم')}: ${rawMessage}`;
          }

          setStatus({ type: 'error', msg: finalMsg });
        } else {
          setIsSubmitted(true);
          setCooldown(60);
          setStatus({
            type: 'success',
            msg: t('auth.reset_email_sent', 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.'),
          });
        }
      } catch (err: any) {
        const fallbackMsg = parseErrorMessage(err);
        setStatus({ type: 'error', msg: fallbackMsg });
      } finally {
        setLoading(false);
      }
    },
    [email, cooldown, loading, t]
  );

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
