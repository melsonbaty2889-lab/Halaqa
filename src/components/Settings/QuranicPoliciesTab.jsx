import React from 'react';
import { BookOpen, UserCheck, Users } from 'lucide-react';
import { Select } from '@/components/UI/UI.jsx';
import { useTranslation } from 'react-i18next';

export default function QuranicPoliciesTab({ formData = {}, updateField }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-start">
      {/* المنهجية والروايات */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
          <BookOpen size={16} /> {t('quranic.title', 'الإعدادات القرآنية والتعليمية')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select 
            label={t('quranic.learningType', 'نمط التعليم')}
            value={formData?.learning_type || 'online'}
            onChange={(e) => updateField('learning_type', e.target.value)}
            options={[
              { label: t('quranic.online', 'عن بُعد (Online)'), value: 'online' },
              { label: t('quranic.inPerson', 'حضوري (In-Person)'), value: 'in_person' },
              { label: t('quranic.hybrid', 'مدمج (Hybrid)'), value: 'hybrid' }
            ]}
          />

          <Select 
            label={t('quranic.defaultQiraat', 'الرواية الافتراضية')}
            value={formData?.default_qiraat || 'hafs'}
            onChange={(e) => updateField('default_qiraat', e.target.value)}
            options={[
              { label: t('qiraat.hafs', 'حفص عن عاصم'), value: 'hafs' },
              { label: t('qiraat.warsh', 'ورش عن نافع'), value: 'warsh' },
              { label: t('qiraat.qaloon', 'قالون عن نافع'), value: 'qaloon' },
              { label: t('qiraat.all', 'السبع / العشر المتواترة'), value: 'all' }
            ]}
          />

          <Select 
            label={t('quranic.methodology', 'المدرسة والمنهجية')}
            value={formData?.teaching_methodology || 'mashreqi'}
            onChange={(e) => updateField('teaching_methodology', e.target.value)}
            options={[
              { label: t('methodology.mashreqi', 'المشرقية (المعتادة)'), value: 'mashreqi' },
              { label: t('methodology.maghrebi', 'المغربية'), value: 'maghrebi' }
            ]}
          />
        </div>
      </div>

      {/* سياسات القبول والتسجيل */}
      <div className="pt-4 border-t border-[var(--border-light)] space-y-4">
        <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
          <UserCheck size={16} /> {t('registration.title', 'سياسات تسجيل وقبول الطلاب')}
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 bg-[var(--surface-input)] border border-[var(--border-input)] rounded-xl cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[var(--text-main)] block">
                {t('registration.allowSelf', 'السماح للطلاب بالتسجيل الذاتي')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                {t('registration.allowSelfDesc', 'تمكين رابط التسجيل العام المباشر للطلاب الجدد')}
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
                {t('registration.requireApproval', 'اشتراط موافقة الإدارة على طالب جديد')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                {t('registration.requireApprovalDesc', 'وضع الطالب في المراجعة حتى اعتماد الإدارة')}
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
              {t('registration.maxStudents', 'الحد الأقصى للطلاب في الحلقة الافتراضية')}
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
