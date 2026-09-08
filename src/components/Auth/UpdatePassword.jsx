import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import C from '@/theme/colors';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  Globe, 
  CheckCircle2 
} from 'lucide-react';

export default function UpdatePassword({ onSuccess }) {
  const { t, i18n } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get('lang');
    if (langParam && (langParam === 'ar' || langParam === 'en')) {
      if (i18n?.changeLanguage) {
        i18n.changeLanguage(langParam);
      }
    }
  }, [i18n]);

  const isRtl = i18n?.language === 'ar';

  useEffect(() => {
    document.title = isRtl ? 'تحديث كلمة المرور | الحلقة الذكية' : 'Update Password | Smart Halaqa';
  }, [isRtl]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) i18n.changeLanguage(nextLang);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (password.length < 6) {
      setStatus({
        type: 'error',
        msg: t('auth.passwordTooShort', 'كلمة المرور يجب أن لا تقل عن 6 أحرف')
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        msg: t('auth.passwordsMismatch', 'كلمتا المرور غير متطابقتين')
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus({
          type: 'error',
          msg: error.message || t('auth.updatePasswordFailed', 'فشل تحديث كلمة المرور')
        });
      } else {
        setIsDone(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2500);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err?.message || t('common.unexpectedError', 'حدث خطأ غير متوقع')
      });
    } finally {
      setLoading(false);
    }
  };

  const langBtn = (
    <button
      type="button"
      onClick={toggleLanguage}
      title={t('common.switchLanguage', 'تغيير اللغة')}
      aria-label={t('common.switchLanguage', 'تغيير اللغة')}
      className="border py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg z-50 transition-all min-h-[44px]"
      style={{
        backgroundColor: C?.dark?.surfaceInput || C?.dark?.surface || '#0A101D',
        borderColor: C?.dark?.border || '#1B2738',
        color: C?.text?.secondary || '#94A3B8',
      }}
    >
      <Globe size={14} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
      <span>{isRtl ? 'English' : 'العربية'}</span>
    </button>
  );

  return (
    <AuthLayout langBtn={langBtn}>
      <div className="w-full">
        {/* الشعار والعنوان */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="mb-2 drop-shadow-md">
            <SmartHalaqaProLogo size={52} />
          </div>
          <h1 
            className="text-2xl font-extrabold tracking-tight mt-1 mb-0.5"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {t('auth.joinSmartHalaqa', 'الحلقة الذكية')}
          </h1>
          <p 
            className="text-[11px] font-bold tracking-wider uppercase m-0"
            style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
          >
            {t('auth.platformSubtitle', 'منصة إدارة المقارئ والأكاديميات')}
          </p>
        </div>

        {!isDone ? (
          <>
            <h2 
              className="text-lg text-center mb-1 font-semibold"
              style={{ color: C?.text?.primary || '#FFFFFF' }}
            >
              {t('auth.setNewPassword', 'تعيين كلمة مرور جديدة')}
            </h2>
            <p 
              className="text-xs text-center mb-5 leading-relaxed"
              style={{ color: C?.text?.secondary || '#94A3B8' }}
            >
              {t('auth.setNewPasswordDesc', 'يرجى إدخال كلمة المرور الجديدة وتأكيدها')}
            </p>

            {/* التنبيهات والأخطاء */}
            {status?.msg && (
              <div 
                className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 border"
                style={{
                  backgroundColor: status.type === 'success' 
                    ? (C?.emerald?.bg || 'rgba(16, 185, 129, 0.1)') 
                    : (C?.danger?.bg || 'rgba(244, 63, 94, 0.1)'),
                  color: status.type === 'success' 
                    ? (C?.emerald?.text || '#10B981') 
                    : (C?.danger?.text || '#F43F5E'),
                  borderColor: status.type === 'success' 
                    ? (C?.emerald?.border || 'rgba(16, 185, 129, 0.3)') 
                    : (C?.danger?.border || 'rgba(244, 63, 94, 0.3)'),
                }}
              >
                <AlertCircle size={16} className="shrink-0" />
                <div>{status.msg}</div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="flex flex-col gap-3.5">
              {/* كلمة المرور الجديدة */}
              <div className="relative flex items-center">
                <Lock 
                  size={18} 
                  className={`absolute pointer-events-none transition-colors inset-y-auto ${
                    isRtl ? 'right-3.5' : 'left-3.5'
                  }`}
                  style={{
                    color: password ? (C?.primary?.DEFAULT || '#E07A00') : (C?.text?.secondary || '#94A3B8')
                  }} 
                />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={t('auth.newPasswordPlaceholder', 'كلمة المرور الجديدة')}
                  aria-label={t('auth.newPasswordPlaceholder', 'كلمة المرور الجديدة')}
                  required
                  dir="ltr"
                  className="w-full py-2.5 px-11 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px]"
                  style={{
                    borderColor: C?.dark?.border || '#1B2738',
                    backgroundColor: C?.dark?.surfaceInput || '#0A101D',
                    color: C?.text?.primary || '#FFFFFF',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  aria-label={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  className={`absolute transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isRtl ? 'left-1' : 'right-1'
                  }`}
                  style={{
                    color: C?.text?.secondary || '#94A3B8',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* تأكيد كلمة المرور الجديدة */}
              <div className="relative flex items-center">
                <Lock 
                  size={18} 
                  className={`absolute pointer-events-none transition-colors inset-y-auto ${
                    isRtl ? 'right-3.5' : 'left-3.5'
                  }`}
                  style={{
                    color: confirmPassword ? (C?.primary?.DEFAULT || '#E07A00') : (C?.text?.secondary || '#94A3B8')
                  }} 
                />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder={t('auth.confirmNewPasswordPlaceholder', 'تأكيد كلمة المرور الجديدة')}
                  aria-label={t('auth.confirmNewPasswordPlaceholder', 'تأكيد كلمة المرور الجديدة')}
                  required
                  dir="ltr"
                  className="w-full py-2.5 px-11 rounded-xl border text-xs outline-none transition-all font-sans text-start min-h-[44px]"
                  style={{
                    borderColor: C?.dark?.border || '#1B2738',
                    backgroundColor: C?.dark?.surfaceInput || '#0A101D',
                    color: C?.text?.primary || '#FFFFFF',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  aria-label={showConfirmPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
                  className={`absolute transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isRtl ? 'left-1' : 'right-1'
                  }`}
                  style={{
                    color: C?.text?.secondary || '#94A3B8',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                title={t('auth.saveNewPassword', 'حفظ كلمة المرور')}
                aria-label={t('auth.saveNewPassword', 'حفظ كلمة المرور')}
                className="w-full py-2.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60 min-h-[44px]"
                style={{
                  backgroundColor: C?.primary?.DEFAULT || '#E07A00',
                  color: C?.primary?.text || '#000000',
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>{t('auth.saveNewPassword', 'حفظ كلمة المرور')}</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: C?.emerald?.text || '#10B981' }} />
            <h2 
              className="text-lg font-bold mb-2"
              style={{ color: C?.text?.primary || '#FFFFFF' }}
            >
              {t('auth.updateSuccessTitle', 'تم التحديث بنجاح!')}
            </h2>
            <p 
              className="text-xs leading-relaxed"
              style={{ color: C?.text?.secondary || '#94A3B8' }}
            >
              {t('auth.updateSuccessDesc', 'تم تغيير كلمة المرور الخاصة بك، جارٍ تحويلك لتسجيل الدخول...')}
            </p>
          </div>
        )}

        {/* شارة الأمان */}
        <div 
          className="flex items-center justify-center gap-1.5 text-[11px] mt-5"
          style={{ color: C?.text?.secondary || '#94A3B8' }}
        >
          <ShieldCheck size={14} style={{ color: C?.emerald?.text || '#10B981' }} />
          <span>
            {t('auth.encryptionNotice', 'بياناتك مشفرة ومحمية وفق معايير 256-bit')}
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}
