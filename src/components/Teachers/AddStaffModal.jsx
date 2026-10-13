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

export default function AddStaffModal({ isOpen, onClose, onSuccess, academyId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    title: 'معلّم / مقرئ',
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

  const titlesList = [
    { value: 'معلّم / مقرئ', label: t('teachers.titles.teacher', 'معلّم / مقرئ') },
    { value: 'مشرف تعليمي', label: t('teachers.titles.supervisor', 'مشرف تعليمي') },
    { value: 'مدير أكاديمية', label: t('teachers.titles.admin', 'مدير أكاديمية') }
  ];

  const roleOptions = [
    { value: 'teacher', label: t('teachers.roles.teacher', 'معلّم حلقة') },
    { value: 'admin', label: t('teachers.roles.admin', 'مدير أكاديمية') },
    { value: 'supervisor', label: t('teachers.roles.supervisor', 'مشرف تعليمي') }
  ];

  const countryOptions = COUNTRIES_LIST.map((c) => ({
    value: c.code,
    label: `${c.flag} ${currentLang === 'en' ? c.nameEn : c.nameAr} (${c.dialCode})`
  }));

  const timezoneOptions = getTimezoneOptions(t);

  const compensationOptions = [
    { value: 'volunteer', label: t('teachers.compensation.volunteer', 'تطوع / احتساب') },
    { value: 'hourly', label: t('teachers.compensation.hourly', 'أجر بالساعة') },
    { value: 'monthly', label: t('teachers.compensation.monthly', 'راتب شهري ثابت') }
  ];

  const supportedCurrencyCodes = ['USD', 'EUR', 'SAR', 'EGP', 'TRY'];
  const currencyOptions = getCurrencies(t)
    .filter(c => supportedCurrencyCodes.includes(c.code))
    .map(c => ({
      value: c.code,
      label: `${c.code} (${c.symbol})`
    }));

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
      setErrorMsg(t('teachers.errorNameRequired', 'يرجى إدخال اسم الكادر التعليمي أو الإداري'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const newTeacherId = crypto.randomUUID();

      // تجهيز القيم المتوافق مع قيود الجدول DB Checks
      const dbEmploymentType = formData.compensationType === 'hourly' ? 'hourly' : 'salary';
      const parsedHourly = formData.compensationType === 'hourly' ? parseFloat(formData.hourlyRate) || 0 : 0;
      const parsedMonthly = formData.compensationType === 'monthly' ? parseFloat(formData.monthlySalary || formData.hourlyRate) || 0 : 0;

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
            ijazas: formData.ijazat,
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

        if (relError) console.warn("Notice: Rel insertion optional or logged:", relError.message);
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
      title={t('teachers.addStaffTitle', 'إضافة كادر تعليمي / إداري جديد')}
    >
      <form onSubmit={handleSubmit} className={`flex flex-col flex-1 min-h-0 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="space-y-3.5 p-1 overflow-y-auto flex-1 pb-3">
          
          {errorMsg && (
            <div className="bg-semantic-dangerBg border border-semantic-danger/30 text-semantic-danger p-3 rounded-xl text-xs font-bold mb-2">
              {errorMsg}
            </div>
          )}

          {/* الاسم الكامل والمسمى الوظيفي */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teachers.fullNameLabel', 'الاسم الكامل')} <span className="text-semantic-actionPrimary">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder={t('teachers.namePlaceholder', 'مثال: محمد أحمد العبدالله')}
                value={formData.name}
                onChange={(v) => handleChange('name', v)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teachers.jobTitleLabel', 'المسمى الوظيفي')}
              </label>
              <Select
                title={t('teachers.jobTitleLabel', 'المسمى الوظيفي')}
                value={formData.title}
                onChange={(v) => handleChange('title', v)}
                options={titlesList}
              />
            </div>
          </div>

          {/* الدولة والمنطقة الزمنية (مزامنة تلقائية) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teachers.countryLabel', 'الدولة')}
              </label>
              <Select
                title={t('teachers.countryLabel', 'الدولة')}
                value={formData.country}
                onChange={(v) => handleChange('country', v)}
                options={countryOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teachers.timezoneLabel', 'المنطقة الزمنية')}
              </label>
              <Select
                title={t('teachers.timezoneLabel', 'المنطقة الزمنية')}
                value={formData.timezone}
                onChange={(v) => handleChange('timezone', v)}
                options={timezoneOptions}
              />
            </div>
          </div>

          {/* البريد وال هاتف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teachers.emailLabel', 'البريد الإلكتروني')}
              </label>
              <Input
                type="email"
                placeholder={t('teachers.emailPlaceholder', 'name@academy.com')}
                value={formData.email}
                onChange={(v) => handleChange('email', v)}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
                {t('teachers.phoneLabel', 'رقم الهاتف / تطبيق المحادثة')}
              </label>
              <Input
                type="tel"
                placeholder={t('teachers.phonePlaceholder', '+XX XXXXXXXXXX')}
                value={formData.phone}
                onChange={(v) => handleChange('phone', v)}
                dir="ltr"
              />
            </div>
          </div>

          {/* الصلاحية */}
          <div>
            <label className="block text-xs font-bold text-semantic-textPrimary mb-1">
              {t('teachers.systemRoleLabel', 'الصلاحية داخل النظام')}
            </label>
            <Select
              title={t('teachers.systemRoleLabel', 'الصلاحية داخل النظام')}
              value={formData.role}
              onChange={(v) => handleChange('role', v)}
              options={roleOptions}
            />
          </div>

          {/* خيار التدريس الفعلي */}
          <div className="card-surface p-3 border-semantic-borderCard/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-semantic-textPrimary">{t('teachers.enableTeachingTitle', 'إتاحة التدريس المباشر للحلقات')}</p>
              <p className="text-[10px] text-semantic-textSecondary">{t('teachers.enableTeachingDesc', 'تفعيل ظهور اسم المعلم في جداول وقوائم الحلقات الدراسية')}</p>
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
                <Award className="w-4 h-4" /> {t('teachers.ijazatLabel', 'الإجازات والسند القرآني')}
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

          {/* التعاقد والماليات */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-semantic-textSecondary mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-semantic-success" /> {t('teachers.financialSystemLabel', 'نظام التعاقد والمستحقات')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Select
                title={t('teachers.financialSystemLabel', 'نظام التعاقد والمستحقات')}
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
                    placeholder={t('teachers.amountPlaceholder', 'القيمة المالية')}
                    value={formData.compensationType === 'hourly' ? formData.hourlyRate : formData.monthlySalary}
                    onChange={(v) => handleChange(formData.compensationType === 'hourly' ? 'hourlyRate' : 'monthlySalary', extractValue(v))}
                  />
                  <Select
                    title={t('teachers.currencyLabel', 'العملة')}
                    value={formData.currency}
                    onChange={(v) => handleChange('currency', v)}
                    options={currencyOptions}
                  />
                </>
              )}
            </div>
          </div>

        </div>

        {/* الأزرار */}
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
            <span>{loading ? t('common.saving', 'جاري الحفظ...') : t('common.saveData', 'حفظ البيانات')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
