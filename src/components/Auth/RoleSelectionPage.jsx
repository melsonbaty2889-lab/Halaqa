import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GraduationCap, BookOpen, Users, Building2, CheckCircle2 } from 'lucide-react';

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
        // تحديث metadata الخاص بالمستخدم في Supabase
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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(15,118,110,0.18)_0%,#070C12_70%)] p-5 font-['Cairo',sans-serif]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl text-center">
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {isRtl ? 'كيف تود استخدام المنصة؟' : 'How would you like to use the platform?'}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mb-6">
          {isRtl ? 'حدد دورك لنقوم بتخصيص واجهة الاستخدام المناسبة لك' : 'Select your role to customize your interface'}
        </p>

        {/* شبكة الخيارات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedRole(item.id)}
                className={`relative p-4 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10' 
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 size={18} className="absolute top-3 left-3 text-amber-500 rtl:left-auto rtl:right-auto" />
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-500'}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                </div>
                
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* زر التأكيد */}
        <button
          onClick={handleSaveRole}
          disabled={!selectedRole || loading}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'متابعة إلى لوحة التحكم' : 'Continue to Dashboard')}
        </button>

      </div>
    </div>
  );
}
