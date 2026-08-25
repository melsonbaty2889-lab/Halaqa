import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import AuthLayout from './AuthLayout';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Building2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function RoleSelectionPage({ onRoleSelected, isRtl = true }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'student',
      title: isRtl ? 'طالب / دارس' : 'Student',
      desc: isRtl ? 'للانضمام للحلقات ومتابعة حفظ القرآن والدروس' : 'Join halaqas and track Quran memorization',
      icon: GraduationCap,
    },
    {
      id: 'teacher',
      title: isRtl ? 'معلم / محفظ' : 'Teacher',
      desc: isRtl ? 'لإدارة الحلقات والطلاب وتقييم الحفظ' : 'Manage halaqas, students, and evaluations',
      icon: BookOpen,
    },
    {
      id: 'parent',
      title: isRtl ? 'ولي أمر' : 'Parent',
      desc: isRtl ? 'لمتابعة أداء الأبناء ومستوى تقدمهم' : 'Follow children performance and progress',
      icon: Users,
    },
    {
      id: 'academy_admin',
      title: isRtl ? 'مدير أكاديمية' : 'Academy Admin',
      desc: isRtl ? 'لإدارة المقرأة بالكامل والمعلمين والحلقات' : 'Full management of academy and teachers',
      icon: Building2,
    },
  ];

  const handleSaveRole = async () => {
    if (!selectedRole) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { role: selectedRole }
        });

        if (error) throw error;
        if (onRoleSelected) onRoleSelected(selectedRole);
      }
    } catch (err) {
      console.error('Role update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* الشعار والعنوان */}
      <div className="flex flex-col items-center mb-5">
        <div className="mb-2 drop-shadow-[0_0_15px_var(--emerald-radial-glow,rgba(16,185,129,0.2))]">
          <SmartHalaqaProLogo size={52} />
        </div>
        <h1 className="text-[var(--text-main,#FFFFFF)] text-xl font-extrabold tracking-tight mt-1 mb-0.5 text-center">
          {isRtl ? 'كيف تود استخدام المنصة؟' : 'How would you like to use the platform?'}
        </h1>
        <p className="text-[var(--text-sub,#94A3B8)] text-xs text-center m-0">
          {isRtl ? 'حدد دورك لنقوم بتخصيص الواجهة المناسبة لك' : 'Select your role to customize your interface'}
        </p>
      </div>

      {/* بطاقات الأدوار */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {roles.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedRole === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedRole(item.id)}
              className={`relative p-3.5 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                isSelected 
                  ? 'border-[var(--primary,#E07A00)] bg-[rgba(224,122,0,0.1)] shadow-lg shadow-[rgba(224,122,0,0.15)]' 
                  : 'border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)] hover:border-[var(--border-hover,#2E3E56)]'
              }`}
            >
              {isSelected && (
                <CheckCircle2 
                  size={16} 
                  className={`absolute top-2.5 ${isRtl ? 'left-2.5' : 'right-2.5'} text-[var(--primary,#E07A00)]`} 
                />
              )}
              
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`p-2 rounded-lg shrink-0 ${
                  isSelected 
                    ? 'bg-[var(--primary,#E07A00)] text-slate-950' 
                    : 'bg-slate-800 text-[var(--primary,#E07A00)]'
                }`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-[var(--text-main,#FFFFFF)] text-xs m-0">{item.title}</h3>
              </div>
              
              <p className="text-[var(--text-sub,#94A3B8)] text-[11px] leading-relaxed m-0">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* زر الحفظ والتأكيد */}
      <button
        onClick={handleSaveRole}
        disabled={!selectedRole || loading}
        className="w-full py-2.5 bg-gradient-to-r from-[#E67E00] to-[#D97706] hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-[rgba(217,119,6,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <span>{isRtl ? 'متابعة إلى لوحة التحكم' : 'Continue to Dashboard'}</span>
        )}
      </button>
    </AuthLayout>
  );
}
