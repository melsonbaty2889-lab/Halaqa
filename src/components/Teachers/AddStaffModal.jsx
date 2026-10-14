/* src/components/Teachers/AddStaffModal.jsx */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Award, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/UI/Modal';
import { UI } from '@/theme/styles';
import { Input, Select } from '@/components/UI';
import { COUNTRIES_LIST, COUNTRIES_MAP } from '@/constants/countries';
import { getTimezoneOptions } from '@/constants/timezones';
import { getCurrencies } from '@/constants/currencies';
import { getIjazatOptions } from '@/constants/ijazat';
import { getStaffTitles } from '@/constants/staffTitles';

export default function AddStaffModal({ 
  isOpen, 
  open,
  onClose, 
  onSuccess, 
  onSubmit,
  handleSubmit: propsHandleSubmit,
  academyId 
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    title: '',
    isTeaching: true,
    country: '',
    timezone: '',
    ijazat: [],
    compensationType: '',
    hourlyRate: '',
    monthlySalary: '',
    currency: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isModalVisible = Boolean(isOpen || open);

  useEffect(() => {
    if (isModalVisible) {
      setErrorMsg('');
    }
  }, [isModalVisible]);

  const titlesList = getStaffTitles(t);

  const roleOptions = [
    { value: 'teacher', label: t('staff.roles.teacher', 'معلّم / محفّظ (إدارة الحلقات المسندة)') },
    { value: 'admin', label: t('staff.roles.admin', 'مدير أكاديمية (تحكم وإدارة كاملة)') }
  ];

  const countryOptions = COUNTRIES_LIST.map((c) => ({
    value: c.code,
    label: `${c.flag} ${currentLang === 'en' ? c.nameEn : c.nameAr} (${c.dialCode})`
  }));

  const timezoneOptions = getTimezoneOptions(t);

  const compensationOptions = [
    { value: 'volunteer', label: 'تطوعي (بدون مقابل مالي)' },
    { value: 'hourly', label: 'أجر بالساعة / الحصة' },
    { value: 'monthly', label: 'راتب شهري ثابت' }
  ];

  const supportedCurrencyCodes = ['USD', 'EUR', 'SAR', 'EGP', 'TRY'];
  const currencyOptions = getCurrencies(t)
    .filter(c => supportedCurrencyCodes.includes(c.code))
    .map(c => ({
      value: c.code,
      label: `${c.code} (${c.symbol}) - ${c.name}`
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
        // تعيين العملة التلقائية حسب دولة الإقامة
        if (value === 'EG') updated.currency = 'EGP';
        else if (value === 'SA') updated.currency = 'SAR';
        else if (value === 'TR') updated.currency = 'TRY';
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

  const onSubmitForm = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg(t('staff.errors.nameRequired', 'يرجى إدخال اسم الكادر كاملاً'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const submitCallback = propsHandleSubmit || onSubmit;

      if (submitCallback) {
        await submitCallback(formData);
      } else {
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
              title: formData.title || 'quran_teacher',
              is_teaching: formData.isTeaching,
              country: formData.country || null,
              timezone: formData.timezone || 'Africa/Cairo',
              ijazas: formData.isTeaching ? formData.ijazat : [],
              employment_type: dbEmploymentType,
              salary_system: formData.compensationType || 'volunteer',
              hourly_rate: parsedHourly,
              monthly_salary: parsedMonthly,
              academy_id: academyId || null,
              metadata: {
                currency: formData.currency || 'USD',
                system_role: formData.role || 'teacher'
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
      open={isModalVisible}
      onClose={onClose}
      title={t('staff.addTitle', 'إضافة كادر تعليمي / إداري جديد')}
    >
      <form onSubmit={onSubmitForm} className={`flex flex-col flex-1 min-h-0 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="space-y-3.5 p-1 overflow-y-auto flex-1 pb-3">
          
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
                placeholder={t('selectPlaceholder', 'اختر...')}
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
                placeholder={t('selectPlaceholder', 'اختر...')}
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
                placeholder={t('selectPlaceholder', 'اختر...')}
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
              placeholder={t('selectPlaceholder', 'اختر...')}
              value={formData.role}
              onChange={(v) => handleChange('role', v)}
              options={roleOptions}
            />
          </div>

          {/* الإجازات والسند القرآني */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-semantic-actionPrimary mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> {t('staff.ijazat.title', 'الإجازات والسند القرآني')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-semantic-surfaceInput/40 p-3 rounded-xl border border-semantic-borderCard">
              {ijazatOptions.map((item) => {
                const isChecked = formData.ijazat.includes(item.id);
                return (
                  <label 
                    key={item.id} 
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition border ${
                      isChecked 
                        ? 'bg-semantic-actionPrimary/15 border-semantic-actionPrimary/40 text-semantic-textPrimary font-bold shadow-sm' 
                        : 'border-semantic-borderCard/50 text-semantic-textSecondary hover:text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleIjazatChange(item.id)}
                      className="w-4 h-4 rounded border-semantic-borderInput bg-semantic-surfaceInput text-semantic-actionPrimary focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span className="select-none leading-tight">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* المستحقات المالية المحدثة والمدمجة برُقي */}
          <div className="pt-1">
  <label className="block text-xs font-bold text-semantic-textSecondary mb-2 flex items-center gap-1.5">
    <Wallet className="w-4 h-4 text-semantic-actionPrimary" /> المستحقات المالية
  </label>
            
            <div className="space-y-2.5">
              <Select
                title="المستحقات المالية"
                placeholder={t('selectPlaceholder', 'اختر...')}
                value={formData.compensationType}
                onChange={(v) => handleChange('compensationType', v)}
                options={compensationOptions}
              />

              {formData.compensationType && formData.compensationType !== 'volunteer' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-semantic-textSecondary mb-1">
                      {formData.compensationType === 'hourly' ? 'المبلغ المستحق عن كل ساعة / حصة' : 'قيمة الراتب الشهري الثابت'}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={formData.compensationType === 'hourly' ? 'أدخل الأجر بالساعة (مثال: 50)' : 'أدخل المبلغ (مثال: 3000)'}
                      value={formData.compensationType === 'hourly' ? formData.hourlyRate : formData.monthlySalary}
                      onChange={(v) => handleChange(formData.compensationType === 'hourly' ? 'hourlyRate' : 'monthlySalary', extractValue(v))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-semantic-textSecondary mb-1">
                      عملة التعامل
                    </label>
                    <Select
                      title={t('staff.financial.currency', 'عملة التعامل')}
                      placeholder={t('selectPlaceholder', 'اختر...')}
                      value={formData.currency}
                      onChange={(v) => handleChange('currency', v)}
                      options={currencyOptions}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* أزرار الحفظ والإلغاء */}
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
