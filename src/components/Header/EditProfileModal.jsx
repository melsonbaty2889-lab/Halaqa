// src/components/Header/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, KeyRound, ShieldCheck, Phone } from 'lucide-react';

import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Btn from '@/components/UI/Btn';
import Select from '@/components/UI/Select';

import { COUNTRIES_LIST } from '@/constants/countries';
import { parsePhoneNumber } from '@/utils/formatters';

// دالة مساعدة معتمدة للاكتشاف التلقائي لرمز الدولة الاحتياطي عبر المنطقة الزمنية
const getDefaultDialCode = () => {
  try {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (userTimeZone) {
      const matched = COUNTRIES_LIST.find((c) => c.timezones && c.timezones.includes(userTimeZone));
      if (matched) return matched.dialCode;
    }
  } catch (e) {
    // التغاضي عن الخطأ في البيئات غير الداعمة
  }
  return COUNTRIES_LIST[0]?.dialCode || '+966';
};

export default function EditProfileModal({
  isOpen = false,
  onClose = () => {},
  currentUser = { name: '', email: '', phone: '' },
  onSave = () => {},
  activeRtl = true
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryDialCode: '+966',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const { dialCode, phone } = parsePhoneNumber(currentUser?.phone || '');
      const fallbackCode = getDefaultDialCode();

      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        countryDialCode: dialCode || fallbackCode,
        phone: phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (submitError) setSubmitError('');
  };

  const handleCountryChange = (selectedDialCode) => {
    setFormData((prev) => ({ ...prev, countryDialCode: selectedDialCode }));
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = formData.name.trim();
    const emailTrimmed = formData.email.trim().toLowerCase();
    const currentEmailTrimmed = (currentUser?.email || '').trim().toLowerCase();

    if (!nameTrimmed) newErrors.name = t('profile.errors.nameRequired', 'الاسم مطلوب');
    if (!emailTrimmed) newErrors.email = t('profile.errors.emailRequired', 'البريد الإلكتروني مطلوب');

    const isEmailChanged = emailTrimmed !== currentEmailTrimmed;
    const isPasswordChanging = Boolean(formData.newPassword && formData.newPassword.trim() !== '');

    if ((isEmailChanged || isPasswordChanging) && !formData.currentPassword) {
      newErrors.currentPassword = t('profile.errors.currentPasswordRequired', 'كلمة المرور الحالية مطلوبة لتأكيد التغييرات');
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = t('profile.errors.passwordLength', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t('profile.errors.passwordMismatch', 'كلمات المرور غير متطابقة');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const fullPhone = formData.phone.trim() 
        ? `${formData.countryDialCode}${formData.phone.trim().replace(/^0+/, '')}`
        : '';

      await onSave({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhone,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      onClose();
    } catch (err) {
      console.error('Save profile error:', err);
      setSubmitError(
        err?.message || t('profile.errors.generalSaveError', 'حدث خطأ أثناء حفظ التغييرات، يرجى المحاولة لاحقاً')
      );
    } finally {
      setLoading(false);
    }
  };

  const countryOptions = COUNTRIES_LIST.map((c) => {
    const cName = currentLang.startsWith('ar') ? c.nameAr : c.nameEn;
    return {
      value: c.dialCode,
      label: `${c.flag} ${c.dialCode}`,
      subLabel: cName,
      icon: c.flag
    };
  });

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('profile.title', 'تعديل الملف الشخصي')}
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {submitError && (
          <div className="p-3 rounded-lg text-xs bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20">
            {submitError}
          </div>
        )}

        {/* الاسم الكامل */}
        <Input
          label={t('profile.nameLabel', 'الاسم الكامل')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={<User size={16} />}
          placeholder={t('profile.namePlaceholder', 'أدخل اسمك')}
          activeRtl={activeRtl}
        />

        {/* البريد الإلكتروني */}
        <Input
          label={t('profile.emailLabel', 'البريد الإلكتروني')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<Mail size={16} />}
          placeholder="example@mail.com"
          dir="ltr"
          activeRtl={activeRtl}
        />

        {/* رقم الهاتف والرمز الدولي */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-semantic-textSecondary">
            {t('profile.phoneLabel', 'رقم الهاتف / الواتساب')}
          </label>
          
          <div className="flex items-start gap-2">
            <div className="w-36 shrink-0">
              <Select
                options={countryOptions}
                value={formData.countryDialCode}
                onChange={handleCountryChange}
                dir="ltr"
              />
            </div>

            <div className="flex-1">
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={<Phone size={16} />}
                placeholder="500000000"
                dir="ltr"
                activeRtl={activeRtl}
              />
            </div>
          </div>
        </div>

        {/* كلمة المرور الحالية */}
        <Input
          label={t('profile.currentPasswordLabel', 'كلمة المرور الحالية (لتأكيد التعديل)')}
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          icon={<ShieldCheck size={16} />}
          placeholder="••••••••"
          activeRtl={activeRtl}
        />

        {/* فاصل قسم تغيير كلمة المرور */}
        <div className="pt-2 border-t border-semantic-borderCard">
          <span className="text-xs font-bold text-semantic-actionPrimary flex items-center gap-1.5 mb-2">
            <KeyRound size={14} />
            {t('profile.changePasswordSection', 'تغيير كلمة المرور (اختياري)')}
          </span>
        </div>

        {/* كلمة المرور الجديدة */}
        <Input
          label={t('profile.newPasswordLabel', 'كلمة المرور الجديدة')}
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          icon={<Lock size={16} />}
          placeholder="••••••••"
          activeRtl={activeRtl}
        />

        {/* تأكيد كلمة المرور الجديدة */}
        <Input
          label={t('profile.confirmPasswordLabel', 'تأكيد كلمة المرور الجديدة')}
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<Lock size={16} />}
          placeholder="••••••••"
          activeRtl={activeRtl}
        />

        {/* أزرار التحكم الثابتة أسفل المودال */}
        <div className="pt-4 border-t border-semantic-borderCard flex items-center justify-end gap-2 bg-semantic-surfaceCard sticky bottom-0">
          <Btn
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel', 'إلغاء')}
          </Btn>
          <Btn
            type="submit"
            variant="primary"
            loading={loading}
            className="min-w-[120px]"
          >
            {t('common.saveChanges', 'حفظ التغييرات')}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
