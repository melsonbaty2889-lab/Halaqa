import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  Globe, 
  CheckCircle2 
} from 'lucide-react';

export default function UpdatePassword({ onSuccess }) {
  const { i18n } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        msg: isRtl ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters'
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus({
          type: 'error',
          msg: error.message || (isRtl ? 'فشل تحديث كلمة المرور' : 'Failed to update password')
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
        msg: err?.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred')
      });
    } finally {
      setLoading(false);
    }
  };

  const inputPadding = isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11';

  const langBtn = (
    <button
      type="button"
      onClick={toggleLanguage}
      className="bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] hover:border-[var(--border-hover,#2E3E56)] text-slate-300 py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg z-50 transition-all"
    >
      <Globe size={14} className="text-[var(--primary,#E07A00)]" />
      <span>{isRtl ? 'English' : 'العربية'}</span>
    </button>
  );

  return (
    <AuthLayout langBtn={langBtn}>
      {/* الشعار والعنوان */}
      <div className="flex flex-col items-center mb-5">
        <div className="mb-2 drop-shadow-[0_0_15px_var(--emerald-radial-glow,rgba(16,185,129,0.2))]">
          <SmartHalaqaProLogo size={52} />
        </div>
        <h1 className="text-[var(--text-main,#FFFFFF)] text-2xl font-extrabold tracking-tight mt-1 mb-0.5">
          {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
        </h1>
        <p className="text-[var(--primary,#E07A00)] text-[11px] font-bold tracking-wider uppercase m-0">
          {isRtl ? 'منصة إدارة المقارئ والأكاديميات' : 'ACADEMY MANAGEMENT PLATFORM'}
        </p>
      </div>

      {!isDone ? (
        <>
          <h2 className="text-[var(--text-main,#FFFFFF)] text-lg text-center mb-1 font-semibold">
            {isRtl ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
          </h2>
          <p className="text-[var(--text-sub,#94A3B8)] text-xs text-center mb-5 leading-relaxed">
            {isRtl ? 'يرجى إدخال كلمة المرور الجديدة وتأكيدها' : 'Please enter and confirm your new password'}
          </p>

          {/* التنبيهات */}
          {status.msg && (
            <div className="p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/25">
              <AlertCircle size={16} className="shrink-0" />
              <div>{status.msg}</div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="flex flex-col gap-3.5">
            {/* كلمة المرور الجديدة */}
            <div className="relative flex items-center">
              <Lock 
                size={18} 
                className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${password ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
              />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder={isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                required
                dir="ltr"
                className={`w-full py-2.5 ${inputPadding} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)]`}
              />
            </div>

            {/* تأكيد كلمة المرور الجديدة */}
            <div className="relative flex items-center">
              <Lock 
                size={18} 
                className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${confirmPassword ? 'text-[var(--primary,#E07A00)]' : 'text-[var(--text-muted,#475569)]'}`} 
              />
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder={isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                required
                dir="ltr"
                className={`w-full py-2.5 ${inputPadding} rounded-xl border border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] text-xs outline-none transition-all focus:border-[var(--primary,#E07A00)] placeholder-[var(--text-muted,#475569)]`}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-[#E67E00] to-[#D97706] hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-[rgba(217,119,6,0.2)] flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>{isRtl ? 'حفظ كلمة المرور' : 'Save New Password'}</span>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-2">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
          <h2 className="text-[var(--text-main,#FFFFFF)] text-lg font-bold mb-2">
            {isRtl ? 'تم التحديث بنجاح!' : 'Updated Successfully!'}
          </h2>
          <p className="text-[var(--text-sub,#94A3B8)] text-xs leading-relaxed">
            {isRtl ? 'تم تغيير كلمة المرور الخاصة بك، جارٍ تحويلك لتسجيل الدخول...' : 'Your password has been reset. Redirecting to login...'}
          </p>
        </div>
      )}

      {/* شارة الأمان */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted,#475569)] mt-5">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>
          {isRtl ? (
            <>بياناتك مشفرة ومحمية وفق معايير <span dir="ltr">256-bit</span></>
          ) : (
            '256-bit SSL encrypted & secure data'
          )}
        </span>
      </div>
    </AuthLayout>
  );
}
