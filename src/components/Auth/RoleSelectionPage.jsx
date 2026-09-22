import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AuthLayout, { APP_SUBTITLES } from './AuthLayout';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { PrimaryButton } from '@/components/UI/AuthButtons';
import Toast from '@/components/UI/Toast';
import { useToast } from '@/hooks/useToast';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Building2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface RoleSelectionPageProps {
  onRoleSelected?: (role: string) => Promise<void> | void;
}

export default function RoleSelectionPage({ onRoleSelected }: RoleSelectionPageProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toastState, showToast, hideToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // استخراج اللغة الحالية وتحديد اتجاه الصفحة
  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const rtlLanguages = ['ar', 'ur'];
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : rtlLanguages.includes(currentLangCode);

  // استخراج اسم المنصة الفرعي من المكون الرئيسي AuthLayout
  const appSubtitle = APP_SUBTITLES[currentLangCode] || APP_SUBTITLES.ar;

  // التأكد من استرجاع الجلسة عند العودة من مصادقة OAuth (جوجل) ومنع الطرد لصفحة تسجيل الدخول
  useEffect(() => {
    document.title = `${t('roles.select_header', 'تحديد نوع الحساب')} | ${appSubtitle}`;

    const checkUserSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    checkUserSession();
  }, [i18n.language, t, appSubtitle, navigate]);

  const roles = [
    {
      id: 'student',
      title: t('roles.student_title', 'طالب / قارئ'),
      desc: t('roles.student_desc', 'الانضمام للحلقات ومتابعة أوراد الحفظ والمراجعة والدروس'),
      icon: GraduationCap,
    },
    {
      id: 'teacher',
      title: t('roles.teacher_title', 'معلم / محفظ'),
      desc: t('roles.teacher_desc', 'إدارة الحلقات القرآنية ورصد المتابعة وتقييم مستوى الإتقان'),
      icon: BookOpen,
    },
    {
      id: 'parent',
      title: t('roles.parent_title', 'ولي أمر / راعٍ'),
      desc: t('roles.parent_desc', 'لمتابعة إنجاز الأبناء ومواظبتهم في الحلقات القرآنية'),
      icon: Users,
    },
    {
      id: 'admin',
      title: t('roles.admin_title', 'مشرف / مدير كيان قرآني'),
      desc: t('roles.admin_desc', 'لإدارة المؤسسة القرآنية بالكامل والمعلمين والحلقات'),
      icon: Building2,
    },
  ];

  const handleSaveRole = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(t('auth.session_error', 'عفواً، لم نتمكن من التحقق من الجلسة'));
      }

      // 1. تحديث بيانات المستخدم في Supabase Auth Metadata
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { role: selectedRole }
      });
      if (updateAuthError) throw updateAuthError;

      // 2. تحديث دور المستخدم في جدول profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: selectedRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (onRoleSelected) {
        await onRoleSelected(selectedRole);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      console.error('Role update error:', err);
      const message = t('roles.update_error', 'حدث خطأ أثناء حفظ الصفة، يرجى المحاولة مرة أخرى');
      setErrorMsg(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      langBtn={<LanguageSwitcher />}
      subtitle={appSubtitle}
    >
      <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center mb-5 text-center">
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight mb-1 text-semantic-textPrimary">
            {t('roles.select_header', 'كيف تود استخدام المنصة؟')}
          </h1>
          <p className="text-xs font-medium leading-relaxed max-w-xs mx-auto m-0 text-semantic-textSecondary">
            {t('roles.select_subheader', 'حدد صفة استخدامك لنقوم بتخصيص الواجهة المناسبة لك')}
          </p>
        </div>

        {errorMsg && (
          <div 
            className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs border transition-all bg-semantic-dangerBg border-semantic-danger text-semantic-danger"
            role="alert"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedRole(item.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                title={item.title}
                aria-label={item.title}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedRole(item.id);
                }}
                className={`relative p-3.5 rounded-xl border text-start cursor-pointer transition-all flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-semantic-actionPrimary/10 border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary/30' 
                    : 'bg-semantic-surfaceInput border-semantic-borderInput hover:border-semantic-borderHover'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 
                    size={16} 
                    className="absolute top-2.5 end-2.5 text-semantic-actionPrimary" 
                  />
                )}
                
                <div className="flex items-center gap-2.5 mb-1.5 pe-5">
                  <div 
                    className={`p-2 rounded-lg shrink-0 border transition-colors ${
                      isSelected 
                        ? 'bg-semantic-actionPrimary border-semantic-actionPrimary text-white' 
                        : 'bg-semantic-surfaceCard border-semantic-borderCard text-semantic-actionPrimary'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-xs m-0 text-semantic-textPrimary">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-[11px] leading-relaxed m-0 text-semantic-textSecondary">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* زر التخصيص والمتابعة الموحد */}
        <PrimaryButton
          onClick={handleSaveRole}
          loading={loading}
          disabled={!selectedRole}
        >
          {t('common.continue_next_step', 'متابعة إلى الخطوة التالية')}
        </PrimaryButton>
      </div>

      {/* مكون الـ Toast للأخطاء والتنبيهات */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={hideToast}
      />
    </AuthLayout>
  );
}
