// src/components/Header/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, KeyRound, ShieldCheck, Phone } from 'lucide-react';

import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Btn from '@/components/UI/Btn';
import CountrySelect from '@/components/UI/CountrySelect';

import { COUNTRIES_LIST, COUNTRIES_MAP } from '@/constants/countries';
import { parsePhoneNumber } from '@/utils/formatters';

// دالة عامة لاكتشاف رمز الدولة التلقائي بناءً على المنطقة الزمنية للجهاز
const detectUserCountryCode = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return '';

    // 1. مطابقة مباشرة ودقيقة مع الـ timezone
    const matched = COUNTRIES_LIST.find((c) => c.timezone === tz);
    if (matched) return matched.code;

    // 2. مطابقة مرنة بناءً على اسم المدينة في المنطقة الزمنية
    const tzCity = tz.split('/')[1];
    if (tzCity) {
      const partialMatch = COUNTRIES_LIST.find(
        (c) => c.timezone && c.timezone.includes(tzCity)
      );
      if (partialMatch) return partialMatch.code;
    }
  } catch {
    // تجاهل الأخطاء
  }
  return '';
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
    countryCode: '',
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
      
      // البحث عن كود الدولة المطابق لرمز الاتصال أو اكتشاف الدولة تلقائياً
      let matchedCode = '';
      if (dialCode) {
        const found = COUNTRIES_LIST.find((c) => c.dialCode === dialCode);
        if (found) matchedCode = found.code;
      }

      if (!matchedCode) {
        matchedCode = detectUserCountryCode();
      }

      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        countryCode: matchedCode,
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

  const handleCountryChange = (selectedCode) => {
    setFormData((prev) => ({ ...prev, countryCode: selectedCode }));
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
      const selectedCountry = COUNTRIES_MAP[formData.countryCode] || COUNTRIES_LIST.find((c) => c.code === formData.countryCode);
      const dialCode = selectedCountry ? selectedCountry.dialCode : '';

      const fullPhone = formData.phone.trim() 
        ? `${dialCode}${formData.phone.trim().replace(/^0+/, '')}`
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

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('profile.title', 'تعديل الملف الشخصي')}
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto space-y-3 px-0.5 pb-3">
          {submitError && (
            <div className="p-2.5 rounded-lg text-xs bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20">
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

          {/* رقم الهاتف واختيار الدولة الموحد */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-semantic-textSecondary">
              {t('profile.phoneLabel', 'رقم الهاتف / الواتساب')}
            </label>
            
            <div className="flex items-start gap-2">
              <div className="w-40 sm:w-44 shrink-0">
                <CountrySelect
                  value={formData.countryCode}
                  onChange={handleCountryChange}
                  lang={currentLang}
                  isArabic={activeRtl}
                  t={t}
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
                  placeholder=""
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
        </div>

        {/* أزرار الحفظ والإلغاء */}
        <div className="pt-3 border-t border-semantic-borderCard grid grid-cols-2 gap-2.5 shrink-0 bg-semantic-surfaceCard sticky bottom-0">
          <Btn
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="w-full justify-center"
          >
            {t('common.cancel', 'إلغاء')}
          </Btn>
          <Btn
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full justify-center"
          >
            {t('common.saveChanges', 'حفظ التغييرات')}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
