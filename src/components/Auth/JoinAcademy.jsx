/* src/components/Auth/JoinAcademy.jsx */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AuthLayout, { APP_SUBTITLES } from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { PrimaryButton } from '@/components/UI/AuthButtons';
import Toast from '@/components/UI/Toast';
import { useToast } from '@/hooks/useToast';
import { LogOut, Building2, KeyRound, AlertCircle } from 'lucide-react';

export default function JoinAcademy({ onLogout, onJoinedAcademy }) {
  const { t, i18n } = useTranslation();
  const { toastState, showToast, hideToast } = useToast();

  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const rtlLanguages = ['ar', 'ur'];
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : rtlLanguages.includes(currentLangCode);
  const appSubtitle = APP_SUBTITLES[currentLangCode] || APP_SUBTITLES.ar;

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      const msg = t('join_academy.code_required', 'يرجى إدخال رمز انضمام الأكاديمية');
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. البحث عن الأكاديمية بواسطة كود الانضمام أو الـ Slug
      const { data: academyData, error: academyError } = await supabase
        .from('academies')
        .select('id, name, slug')
        .or(`invite_code.eq.${inviteCode.trim()},code.eq.${inviteCode.trim()},slug.eq.${inviteCode.trim()}`)
        .maybeSingle();

      if (academyError || !academyData) {
        throw new Error(t('join_academy.invalid_code', 'رمز الانضمام غير صحيح أو غير موجود، يرجى مراجعة إدارة الأكاديمية'));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('auth.session_error', 'عفواً، لم نتمكن من التحقق من الجلسة'));

      // 2. تحديث academy_id في بروفايل المستخدم
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ academy_id: academyData.id, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showToast(t('join_academy.success', 'تم الانضمام للأكاديمية بنجاح!'), 'success');
      
      if (onJoinedAcademy) {
        await onJoinedAcademy(academyData);
      }
    } catch (err) {
      console.error('Join academy error:', err);
      const msg = err.message || t('join_academy.error', 'حدث خطأ أثناء الانضمام للأكاديمية');
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout langBtn={<LanguageSwitcher />} subtitle={appSubtitle}>
      <div className="w-full max-w-md mx-auto px-2" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-semantic-actionPrimary/10 text-semantic-actionPrimary rounded-2xl mb-3">
            <Building2 size={32} />
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight mb-1 text-semantic-textPrimary">
            {t('join_academy.title', 'الانضمام إلى أكاديمية')}
          </h1>
          <p className="text-xs font-medium leading-relaxed max-w-xs mx-auto text-semantic-textSecondary">
            {t('join_academy.subtitle', 'أدخل رمز الدعوة أو كود الأكاديمية الذي زودتك به إدارة المقرأة')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs border bg-semantic-dangerBg border-semantic-danger text-semantic-danger">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
              {t('join_academy.code_label', 'رمز الانضمام / كود الأكاديمية')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder={t('join_academy.code_placeholder', 'أدخل الكود هنا (مثال: ACAD-1234)')}
                className="w-full px-4 py-3 bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl text-xs font-medium text-semantic-textPrimary placeholder:text-semantic-textSecondary/50 focus:outline-none focus:border-semantic-actionPrimary transition-all pe-10"
              />
              <KeyRound size={18} className="absolute end-3 top-3.5 text-semantic-textSecondary" />
            </div>
          </div>

          <PrimaryButton loading={loading} disabled={!inviteCode.trim()}>
            {t('join_academy.submit_btn', 'انضمام الآن')}
          </PrimaryButton>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onLogout}
            type="button"
            className="inline-flex items-center gap-2 text-xs font-bold text-semantic-danger hover:underline cursor-pointer bg-transparent border-none"
          >
            <LogOut size={14} />
            <span>{t('common.logout', 'تسجيل الخروج')}</span>
          </button>
        </div>
      </div>

      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}
