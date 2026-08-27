import React from 'react';
import { BookOpen, UserCheck, Users } from 'lucide-react';
import { Select } from '@/components/UI/UI.jsx';
import { useTranslation } from 'react-i18next';

export default function QuranicPoliciesTab({ formData = {}, updateField }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="space-y-6 text-start">
      {/* المنهجية والروايات */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
          <BookOpen size={16} /> {isRtl ? 'الإعدادات القرآنية والتعليمية' : 'Quranic & Teaching Setup'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select 
            label={isRtl ? 'نمط التعليم' : 'Learning Type'}
            value={formData?.learning_type || 'online'}
            onChange={(e) => updateField('learning_type', e.target.value)}
            options={[
              { label: isRtl ? 'عن بُعد (Online)' : 'Online', value: 'online' },
              { label: isRtl ? 'حضوري (In-Person)' : 'In-Person', value: 'in_person' },
              { label: isRtl ? 'مدمج (Hybrid)' : 'Hybrid', value: 'hybrid' }
            ]}
          />

          <Select 
            label={isRtl ? 'الرواية الافتراضية' : 'Default Qiraat'}
            value={formData?.default_qiraat || 'hafs'}
            onChange={(e) => updateField('default_qiraat', e.target.value)}
            options={[
              { label: isRtl ? 'حفص عن عاصم' : 'Hafs an Asim', value: 'hafs' },
              { label: isRtl ? 'ورش عن نافع' : 'Warsh an Nafi', value: 'warsh' },
              { label: isRtl ? 'قالون عن نافع' : 'Qaloon an Nafi', value: 'qaloon' },
              { label: isRtl ? 'السبع / العشر المتواترة' : 'Mutawatir', value: 'all' }
            ]}
          />

          <Select 
            label={isRtl ? 'المدرسة والمنهجية' : 'Methodology'}
            value={formData?.teaching_methodology || 'mashreqi'}
            onChange={(e) => updateField('teaching_methodology', e.target.value)}
            options={[
              { label: isRtl ? 'المشرقية (المعتادة)' : 'Mashreqi', value: 'mashreqi' },
              { label: isRtl ? 'المغربية' : 'Maghrebi', value: 'maghrebi' }
            ]}
          />
        </div>
      </div>

      {/* سياسات القبول والتسجيل */}
      <div className="pt-4 border-t border-[var(--border-light)] space-y-4">
        <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
          <UserCheck size={16} /> {isRtl ? 'سياسات تسجيل وقبول الطلاب' : 'Registration Policies'}
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 bg-[var(--surface-input)] border border-[var(--border-input)] rounded-xl cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[var(--text-main)] block">
                {isRtl ? 'السماح للطلاب بالتسجيل الذاتي' : 'Allow Self-Registration'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                {isRtl ? 'تمكين رابط التسجيل العام المباشر للطلاب الجدد' : 'Allow students to sign up via public link'}
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={formData?.allow_self_registration ?? true} 
              onChange={(e) => updateField('allow_self_registration', e.target.checked)} 
              className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-[var(--surface-input)] border border-[var(--border-input)] rounded-xl cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[var(--text-main)] block">
                {isRtl ? 'اشتراط موافقة الإدارة على طالب جديد' : 'Require Admin Approval'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                {isRtl ? 'وضع الطالب في المراجعة حتى اعتماد الإدارة' : 'Hold student status as pending until approved'}
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={formData?.require_approval ?? true} 
              onChange={(e) => updateField('require_approval', e.target.checked)} 
              className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
            />
          </label>

          <div className="pt-2">
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)] flex items-center gap-1.5">
              <Users size={14} />
              {isRtl ? 'الحد الأقصى للطلاب في الحلقة الافتراضية' : 'Max Students Per Group'}
            </label>
            <input 
              type="number" 
              min={1} 
              max={200}
              value={formData?.max_students_per_group || 25} 
              onChange={(e) => updateField('max_students_per_group', Number(e.target.value))} 
              className="app-input max-w-xs" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
