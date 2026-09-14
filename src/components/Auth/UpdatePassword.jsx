import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import AuthLayout, { APP_SUBTITLES } from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { PrimaryButton } from '@/components/UI/AuthButtons';
import Toast from '@/components/UI/Toast';
import { useToast } from '@/hooks/useToast';
import { C } from '@/theme/colors';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

export default function UpdatePassword({ onSuccess }) {
  const { t, i18n } = useTranslation();
  const { toastState, showToast, hideToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLangCode);
  const appSubtitle = APP_SUBTITLES[currentLangCode] || APP_SUBTITLES.ar;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get('lang');
    if (langParam && ['ar', 'en', 'ur', 'fr', 'tr', 'id'].includes(langParam)) {
      if (i18n?.changeLanguage) {
        i18n.changeLanguage(langParam);
      }
    }
  }, [i18n]);

  useEffect(() => {
    document.title = `${t('auth.updatePasswordTitle', 'تحديث كلمة المرور')} | ${appSubtitle}`;
  }, [i18n.language, t, appSubtitle]);

  // إظهار Toast عند حدث أخطاء أو تنبيهات
  useEffect(() => {
    if (status?.msg) {
      showToast(status.msg, status.type === 'success' ? 'success' : 'error');
    }
  }, [status, showToast]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (password.length < 6) {
      const msg = t('auth.passwordTooShort', 'كلمة المرور يجب أن لا تقل عن 6 أحرف');
      setStatus({ type: 'error', msg });
      return;
    }

    if (password !== confirmPassword) {
      const msg = t('auth.passwordsMismatch', 'كلمتا المرور غير متطابقتين');
      setStatus({ type: 'error', msg });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus({
          type: 'error',
          msg: error.message || t('auth.updatePasswordFailed', 'فشل تحديث كلمة المرور'),
        });
      } else {
        const successMsg = t('auth.updateSuccessTitle', 'تم التحديث بنجاح!');
        setStatus({ type: 'success', msg: successMsg });
        setIsDone(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2500);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err?.message || t('common.unexpectedError', 'حدث خطأ غير متوقع'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      langBtn={<LanguageSwitcher />} 
      subtitle={appSubtitle}
    >
      <div className="w-full flex flex-col justify-between relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {!isDone ? (
          <>
            {/* النصوص الأساسية */}
            <div className="text-center mb-5">
              <h2 
                className="text-lg sm:text-xl font-extrabold tracking-tight mb-1"
                style={{ color: C?.text?.title }}
              >
                {t('auth.setNewPassword', 'تعيين كلمة مرور جديدة')}
              </h2>
              <p 
                className="text-xs font-medium leading-relaxed max-w-xs mx-auto m-0"
                style={{ color: C?.text?.muted }}
              >
                {t('auth.setNewPasswordDesc', 'يرجى إدخال كلمة المرور الجديدة وتأكيدها')}
              </p>
            </div>

            {/* صندوق التنبيهات والأخطاء */}
            {status?.msg && (
              <div 
                className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 border transition-all"
                role="alert"
                style={{
                  backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  borderColor: status.type === 'success' ? (C?.emerald?.DEFAULT || '#10B981') : (C?.error?.DEFAULT || '#EF4444'),
                  color: status.type === 'success' ? (C?.emerald?.DEFAULT || '#10B981') : (C?.error?.DEFAULT || '#EF4444'),
                }}
              >
                <AlertCircle size={16} className="shrink-0" />
                <div>{status.msg}</div>
              </div>
            )}

            {/* النموذج */}
            <form onSubmit={handleUpdate} className="flex flex-col gap-3.5" noValidate>
              
              {/* كلمة المرور الجديدة */}
              <div className="relative flex items-center group">
                <Lock 
                  size={18} 
                  className="absolute start-3.5 pointer-events-none transition-colors inset-y-auto z-10"
                  style={{
                    color: password ? (C?.amber?.DEFAULT || '#D97706') : C?.text?.muted
                  }} 
                />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password || ''} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={t('auth.newPasswordPlaceholder', 'كلمة المرور الجديدة')}
                  aria-label={t('auth.newPasswordPlaceholder', 'كلمة المرور الجديدة')}
                  required
                  className="w-full py-2.5 rounded-xl border text-xs outline-none transition-all text-start font-sans min-h-[44px] ps-11 pe-11"
                  style={{
                    borderColor: C?.inputs?.border,
                    backgroundColor: C?.inputs?.bg,
                    color: C?.text?.title,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  aria-label={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  className="absolute end-1 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                  style={{ color: C?.text?.muted }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* تأكيد كلمة المرور الجديدة */}
              <div className="relative flex items-center group">
                <Lock 
                  size={18} 
                  className="absolute start-3.5 pointer-events-none transition-colors inset-y-auto z-10"
                  style={{
                    color: confirmPassword ? (C?.amber?.DEFAULT || '#D97706') : C?.text?.muted
                  }} 
                />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword || ''} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder={t('auth.confirmNewPasswordPlaceholder', 'تأكيد كلمة المرور الجديدة')}
                  aria-label={t('auth.confirmNewPasswordPlaceholder', 'تأكيد كلمة المرور الجديدة')}
                  required
                  className="w-full py-2.5 rounded-xl border text-xs outline-none transition-all text-start font-sans min-h-[44px] ps-11 pe-11"
                  style={{
                    borderColor: C?.inputs?.border,
                    backgroundColor: C?.inputs?.bg,
                    color: C?.text?.title,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  aria-label={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  className="absolute end-1 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                  style={{ color: C?.text?.muted }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* زر الحفظ الرئيسي الموحد */}
              <PrimaryButton loading={loading}>
                {t('auth.saveNewPassword', 'حفظ كلمة المرور')}
              </PrimaryButton>
            </form>
          </>
        ) : (
          /* حالة النجاح */
          <div className="text-center py-4 animate-fadeIn">
            <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: C?.emerald?.DEFAULT || '#10B981' }} />
            <h2 
              className="text-lg font-bold mb-2"
              style={{ color: C?.text?.title }}
            >
              {t('auth.updateSuccessTitle', 'تم التحديث بنجاح!')}
            </h2>
            <p 
              className="text-xs leading-relaxed"
              style={{ color: C?.text?.muted }}
            >
              {t('auth.updateSuccessDesc', 'تم تغيير كلمة المرور الخاصة بك، جارٍ تحويلك لتسجيل الدخول...')}
            </p>
          </div>
        )}

        {/* شارة الأمان */}
        <div 
          className="flex items-center justify-center gap-1.5 text-[11px] mt-5 opacity-75"
          style={{ color: C?.text?.muted }}
        >
          <ShieldCheck size={14} style={{ color: C?.emerald?.DEFAULT || '#10B981' }} />
          <span>
            {t('auth.encryptionNotice', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}
          </span>
        </div>
      </div>

      {/* مكون الـ Toast المنزلق أسفل الشاشة */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}
