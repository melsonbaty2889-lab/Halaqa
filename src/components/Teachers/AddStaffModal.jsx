/* src/components/Teachers/AddStaffModal.jsx */

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Award, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';
import { Input, Select } from '@/components/UI';
import { COUNTRIES_LIST, COUNTRIES_MAP } from '@/constants/countries';
import { getTimezoneOptions } from '@/constants/timezones';
import { getCurrencies } from '@/constants/currencies';
import { getIjazatOptions } from '@/constants/ijazat';
import { getStaffTitles } from '@/constants/staffTitles';

export default function AddStaffModal({ isOpen, onClose, onSuccess, academyId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    title: 'quran_teacher',
    isTeaching: true,
    country: 'EG',
    timezone: 'Africa/Cairo',
    ijazat: [],
    compensationType: 'volunteer',
    hourlyRate: '',
    monthlySalary: '',
    currency: 'USD'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. المسميات العلمية والوظيفية من الثوابت الموحدة
  const titlesList = getStaffTitles(t);

  // 2. صلاحيات لوحة التحكم المعتمدة بالنظام
  const roleOptions = [
    { value: 'teacher', label: t('staff.roles.teacher', 'معلّم / محفّظ (إدارة الحلقات المسندة)') },
    { value: 'admin', label: t('staff.roles.admin', 'مدير أكاديمية (تحكم وإدارة كاملة)') }
  ];

  // 3. خيارات الدول بأسماء مترجمة وعلم الدولة
  const countryOptions = COUNTRIES_LIST.map((c) => ({
    value: c.code,
    label: `${c.flag} ${currentLang === 'en' ? c.nameEn : c.nameAr} (${c.dialCode})`
  }));

  const timezoneOptions = getTimezoneOptions(t);

  // 5. أنظمة المكافآت والماليات
  const compensationOptions = [
    { value: 'volunteer', label: t('staff.compensation.volunteer', 'تطوّع / احتساب') },
    { value: 'hourly', label: t('staff.compensation.hourly', 'مكافأة بالحصة / الساعة') },
    { value: 'monthly', label: t('staff.compensation.monthly', 'كفالة / راتب شهري ثابت') }
  ];

  // 6. العملات المدعومة
  const supportedCurrencyCodes = ['USD', 'EUR', 'SAR', 'EGP', 'TRY'];
  const currencyOptions = getCurrencies(t)
    .filter(c => supportedCurrencyCodes.includes(c.code))
    .map(c => ({
      value: c.code,
      label: `${c.code} (${c.symbol}) - ${c.name}`
    }));

  // 7. قائمة الإجازات والسند
  const ijazatOptions = getIjazatOptions(t);

  const extractValue = (val) => {
    if (val && typeof val === 'object' && 'target' in val) {
      return val.target.value;
    }
    return val;
  };

  const handleChange = (field, val) => {
    const value = extractValue(val);
    
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'country') {
        const countryData = COUNTRIES_MAP[value];
        if (countryData && countryData.timezone) {
          updated.timezone = countryData.timezone;
        }
      }

      if (field === 'compensationType' && value === 'volunteer') {
        updated.hourlyRate = '';
        updated.monthlySalary = '';
      }

      return updated;
    });
  };

  const handleIjazatChange = (ijazaId) => {
    setFormData(prev => ({
      ...prev,
      ijazat: prev.ijazat.includes(ijazaId)
        ? prev.ijazat.filter(i => i !== ijazaId)
        : [...prev.ijazat, ijazaId]
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg(t('staff.errors.nameRequired', 'يرجى إدخال اسم الكادر كاملاً'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const newTeacherId = crypto.randomUUID();

      const dbEmploymentType = formData.compensationType === 'hourly' ? 'hourly' : 'salary';
      const parsedHourly = formData.compensationType === 'hourly' ? Math.max(0, parseFloat(formData.hourlyRate) || 0) : 0;
      const parsedMonthly = formData.compensationType === 'monthly' ? Math.max(0, parseFloat(formData.monthlySalary || formData.hourlyRate) || 0) : 0;

      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert([
          {
            id: newTeacherId,
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            title: formData.title,
            is_teaching: formData.isTeaching,
            country: formData.country || null,
            timezone: formData.timezone,
            ijazas: formData.isTeaching ? formData.ijazat : [],
            employment_type: dbEmploymentType,
            salary_system: formData.compensationType,
            hourly_rate: parsedHourly,
            monthly_salary: parsedMonthly,
            academy_id: academyId || null,
            metadata: {
              currency: formData.currency,
              system_role: formData.role
            }
          }
        ])
        .select()
        .single();

      if (teacherError) throw teacherError;

      if (teacherData && academyId) {
        const { error: relError } = await supabase
          .from('academy_teachers')
          .insert([
            {
              academy_id: academyId,
              teacher_id: teacherData.id,
              is_active: true
            }
          ]);

        if (relError) console.warn("Notice: Rel insertion logged:", relError.message);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("🚨 خطأ أثناء إضافة الكادر:", err);
      setErrorMsg(err.message || t('common.errorOccurred', 'حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('staff.addTitle', 'إضافة كادر تعليمي / إداري جديد')}
    >
      <form onSubmit={handleSubmit} className={`flex flex-col flex-1 min-h-0 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="space-y-3.5 p-1 overflow-y-auto flex-1 pb-6">
          
          {errorMsg && (
            <div className="bg-semantic-dangerBg border border-semantic-danger/30 text-semantic-danger p-3 rounded-xl text-xs font-bold mb-2">
              {errorMsg}
            </div>
          )}

          {/* الاسم والمسمى العلمي */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('staff.fields.fullName', 'الاسم الكامل')} <span className="text-semantic-actionPrimary">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder={t('staff.placeholders.fullName', 'مثال: الشيخ د. أحمد بن علي')}
                value={formData.name}
                onChange={(v) => handleChange('name', v)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('staff.fields.title', 'الصفة / المسمى العلمي')}
              </label>
              <Select
                title={t('staff.fields.title', 'الصفة / المسمى العلمي')}
                value={formData.title}
                onChange={(v) => handleChange('title', v)}
                options={titlesList}
              />
            </div>
          </div>

          {/* الدولة والمنطقة الزمنية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('staff.fields.country', 'بلد الإقامة')}
              </label>
              <Select
                title={t('staff.fields.country', 'بلد الإقامة')}
                value={formData.country}
                onChange={(v) => handleChange('country', v)}
                options={countryOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('staff.fields.timezone', 'المنطقة الزمنية')}
              </label>
              <Select
                title={t('staff.fields.timezone', 'المنطقة الزمنية')}
                value={formData.timezone}
                onChange={(v) => handleChange('timezone', v)}
                options={timezoneOptions}
              />
            </div>
          </div>

          {/* البريد ورقم التواصل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('staff.fields.email', 'البريد الإلكتروني')}
              </label>
              <Input
                type="email"
                placeholder={t('staff.placeholders.email', 'teacher@academy.com')}
                value={formData.email}
                onChange={(v) => handleChange('email', v)}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('staff.fields.phone', 'رقم التواصل (واتساب)')}
              </label>
              <Input
                type="tel"
                placeholder={t('staff.placeholders.phone', '+XX XXXXXXXXXX')}
                value={formData.phone}
                onChange={(v) => handleChange('phone', v)}
                dir="ltr"
              />
            </div>
          </div>

          {/* صلاحية لوحة التحكم */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
              {t('staff.fields.role', 'صلاحيات لوحة التحكم')}
            </label>
            <Select
              title={t('staff.fields.role', 'صلاحيات لوحة التحكم')}
              value={formData.role}
              onChange={(v) => handleChange('role', v)}
              options={roleOptions}
            />
          </div>

          {/* خيار التدريس الفعلي */}
          <div className="card-surface p-3 border-semantic-borderCard/50 flex items-center justify-between rounded-xl">
            <div>
              <p className="text-xs font-bold text-semantic-textPrimary">{t('staff.teaching.enableTitle', 'إتاحة التدريس المباشر للحلقات')}</p>
              <p className="text-[10px] text-semantic-textSecondary">{t('staff.teaching.enableDesc', 'تفعيل ظهور اسم المعلم في جداول وقوائم الحلقات الدراسية')}</p>
            </div>
            <input 
              type="checkbox"
              checked={formData.isTeaching}
              onChange={(e) => setFormData({ ...formData, isTeaching: e.target.checked })}
              className="w-4 h-4 rounded border-semantic-borderInput bg-semantic-surfaceInput text-semantic-actionPrimary focus:ring-0 cursor-pointer"
            />
          </div>

          {/* الإجازات القرآنية */}
          {formData.isTeaching && (
            <div className="pt-1">
              <label className="block text-xs font-bold text-semantic-actionPrimary mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> {t('staff.ijazat.title', 'الإجازات والسند القرآني')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-semantic-surfaceInput/40 p-3 rounded-xl border border-semantic-borderCard">
                {ijazatOptions.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-xs text-semantic-textSecondary cursor-pointer hover:text-semantic-textPrimary">
                    <input 
                      type="checkbox"
                      checked={formData.ijazat.includes(item.id)}
                      onChange={() => handleIjazatChange(item.id)}
                      className="rounded border-semantic-borderInput bg-semantic-surfaceInput text-semantic-actionPrimary focus:ring-0 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* المكافآت والماليات */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-semantic-textSecondary mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-semantic-success" /> {t('staff.financial.title', 'نظام المكافآت والمستحقات المالية')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Select
                title={t('staff.financial.type', 'نظام المكافأة')}
                value={formData.compensationType}
                onChange={(v) => handleChange('compensationType', v)}
                options={compensationOptions}
              />

              {formData.compensationType !== 'volunteer' && (
                <>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t('staff.financial.amount', 'المبلغ / المستحق')}
                    value={formData.compensationType === 'hourly' ? formData.hourlyRate : formData.monthlySalary}
                    onChange={(v) => handleChange(formData.compensationType === 'hourly' ? 'hourlyRate' : 'monthlySalary', extractValue(v))}
                  />
                  <Select
                    title={t('staff.financial.currency', 'عملة التعامل')}
                    value={formData.currency}
                    onChange={(v) => handleChange('currency', v)}
                    options={currencyOptions}
                  />
                </>
              )}
            </div>
          </div>

        </div>

        {/* أزرار الحفظ والإلغاء الثابتة أسفل الشاشة */}
        <div className="flex items-center justify-end gap-2 border-t border-semantic-borderCard pt-3 mt-auto shrink-0 bg-semantic-surfaceCard">
          <button
            type="button"
            onClick={onClose}
            className={`${UI.btnSecondary} text-xs py-2.5 px-4 rounded-xl font-bold cursor-pointer`}
          >
            {t('common.cancel', 'إلغاء')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`${UI.btnPrimary} text-xs py-2.5 px-6 rounded-xl font-extrabold transition-opacity flex items-center gap-1.5 cursor-pointer`}
          >
            <UserPlus size={14} />
            <span>{loading ? t('common.saving', 'جاري الحفظ...') : t('staff.actions.save', 'حفظ البيانات')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
