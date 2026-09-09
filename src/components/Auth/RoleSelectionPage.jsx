import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import C from '@/theme/colors';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Building2, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function RoleSelectionPage({ onRoleSelected }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // مصطلحات معيارية وأصيلة تناسب كافة المؤسسات القرآنية
  const roles = [
    {
      id: 'student',
      title: t('roles.student_title', 'طالب / قارئ'),
      desc: t('roles.student_desc', 'الإنضمام للحلقات ومتابعة أوراد الحفظ والمراجعة والدروس'),
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

      // 1. تحديث بيانات المستخدم في user_metadata
      await supabase.auth.updateUser({
        data: { role: selectedRole }
      });

      // 2. تحديث جدول profiles الرئيسي لضمان الاستجابة المباشرة
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: selectedRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. التوجيه للخطوة التالية
      if (onRoleSelected) {
        await onRoleSelected(selectedRole);
      }
    } catch (err) {
      console.error('Role update error:', err);
      setErrorMsg(t('roles.update_error', 'حدث خطأ أثناء حفظ الصفة، يرجى المحاولة مرة أخرى'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* الشعار والعنوان */}
      <div className="flex flex-col items-center mb-5">
        <div className="mb-2">
          <SmartHalaqaProLogo size={52} />
        </div>
        <h1 
          className="text-xl font-extrabold tracking-tight mt-1 mb-0.5 text-center"
          style={{ color: C?.text?.primary || '#FFFFFF' }}
        >
          {t('roles.select_header', 'كيف تود استخدام المنصة؟')}
        </h1>
        <p 
          className="text-xs text-center m-0"
          style={{ color: C?.text?.secondary || '#94A3B8' }}
        >
          {t('roles.select_subheader', 'حدد صفة استخدامك لنقوم بتخصيص الواجهة المناسبة لك')}
        </p>
      </div>

      {/* رسالة الخطأ إن وجدت */}
      {errorMsg && (
        <div 
          className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs border"
          role="alert"
          style={{
            backgroundColor: C?.danger?.bg || 'rgba(244, 63, 94, 0.1)',
            borderColor: C?.danger?.border || 'rgba(244, 63, 94, 0.3)',
            color: C?.danger?.text || '#F43F5E'
          }}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* بطاقات الصفات والأدوار */}
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
              className="relative p-3.5 rounded-xl border text-start cursor-pointer transition-all flex flex-col justify-between"
              style={{
                backgroundColor: isSelected 
                  ? (C?.primary?.bg || 'rgba(224, 122, 0, 0.1)') 
                  : (C?.dark?.surface || '#0A101D'),
                borderColor: isSelected 
                  ? (C?.primary?.DEFAULT || '#E07A00') 
                  : (C?.dark?.border || '#1B2738')
              }}
            >
              {isSelected && (
                <CheckCircle2 
                  size={16} 
                  className={`absolute top-2.5 ${isRtl ? 'left-2.5' : 'right-2.5'}`} 
                  style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
                />
              )}
              
              <div className="flex items-center gap-2.5 mb-1.5">
                <div 
                  className="p-2 rounded-lg shrink-0"
                  style={{
                    backgroundColor: isSelected 
                      ? (C?.primary?.DEFAULT || '#E07A00') 
                      : (C?.dark?.bg || '#162032'),
                    color: isSelected 
                      ? (C?.primary?.text || '#000000') 
                      : (C?.primary?.DEFAULT || '#E07A00')
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 
                  className="font-bold text-xs m-0"
                  style={{ color: C?.text?.primary || '#FFFFFF' }}
                >
                  {item.title}
                </h3>
              </div>
              
              <p 
                className="text-[11px] leading-relaxed m-0"
                style={{ color: C?.text?.secondary || '#94A3B8' }}
              >
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* زر الحفظ والتأكيد */}
      <button
        type="button"
        onClick={handleSaveRole}
        disabled={!selectedRole || loading}
        title={t('common.continue_next_step', 'متابعة إلى الخطوة التالية')}
        aria-label={t('common.continue_next_step', 'متابعة إلى الخطوة التالية')}
        className="w-full min-h-[44px] py-2.5 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        style={{
          backgroundColor: C?.primary?.DEFAULT || '#E07A00',
          color: C?.primary?.text || '#000000'
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <span>{t('common.continue_next_step', 'متابعة إلى الخطوة التالية')}</span>
        )}
      </button>
    </AuthLayout>
  );
}
