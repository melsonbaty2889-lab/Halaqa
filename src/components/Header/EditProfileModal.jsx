import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, KeyRound, ShieldCheck } from 'lucide-react';

import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Btn from '@/components/UI/Btn';
import PhoneInput from '@/components/UI/PhoneInput';

import { COUNTRIES_LIST } from '@/constants/countries';
import { parsePhoneNumber, detectUserCountryCode, normalizePhone } from '@/utils/formatters';

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
  
  // حالة ذكية لمنع الكتابة فوق تعديلات المستخدم إذا وصلت بيانات السيرفر متأخرة
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    // تعبئة البيانات فقط إذا كانت النافذة مفتوحة والمستخدم لم يقم بالتعديل اليدوي بعد
    if (isOpen && !hasEdited) {
      const rawPhone = currentUser?.phone || '';
      const { dialCode, phone } = parsePhoneNumber(rawPhone);
      
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
        phone: phone || rawPhone,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setErrors({});
      setSubmitError('');
    }

    // تصفير حالة التعديل عند الإغلاق لضمان تحميل البيانات الجديدة في المرة القادمة
    if (!isOpen) {
      setHasEdited(false);
    }
  }, [isOpen, currentUser?.name, currentUser?.email, currentUser?.phone]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setHasEdited(true);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (submitError) setSubmitError('');
  };

  const handleCountryChange = (selectedCode) => {
    setHasEdited(true);
    setFormData((prev) => ({ ...prev, countryCode: selectedCode }));
    if (submitError) setSubmitError('');
  };

  const handleClose = () => {
    onClose();
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

    const originalEmail = (currentUser?.email || '').trim().toLowerCase();
    const originalName = (currentUser?.name || '').trim();
    const originalPhone = currentUser?.phone || '';

    const normalizedPhoneVal = normalizePhone(formData.phone, formData.countryCode);
    const fullPhone = normalizedPhoneVal ? `+${normalizedPhoneVal}` : '';

    const isNameChanged = formData.name.trim() !== originalName;
    const isEmailChanged = formData.email.trim().toLowerCase() !== originalEmail;
    const isPhoneChanged = fullPhone !== originalPhone;
    const isPasswordChanged = Boolean(formData.newPassword && formData.newPassword.trim() !== '');

    if (!isNameChanged && !isEmailChanged && !isPhoneChanged && !isPasswordChanged) {
      onClose();
      return;
    }

    setLoading(true);
    try {
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
      onClose={handleClose}
      title={t('profile.title', 'تعديل الملف الشخصي')}
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto space-y-3 px-0.5 pb-3">
          {submitError && (
            <div className="p-2.5 rounded-lg text-xs bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20">
              {submitError}
            </div>
          )}

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

          <Input
            label={t('profile.emailLabel', 'البريد الإلكتروني')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={16} />}
            placeholder="example@mail.com"
            activeRtl={activeRtl}
          />

          <PhoneInput
            label={t('profile.phoneLabel', 'رقم الهاتف / الواتساب')}
            countryCode={formData.countryCode}
            phone={formData.phone}
            onCountryChange={handleCountryChange}
            onPhoneChange={handleChange}
            error={errors.phone}
            lang={currentLang}
            activeRtl={activeRtl}
            t={t}
          />

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

          <div className="pt-2 border-t border-[var(--border-card)]">
            <span className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5 mb-2">
              <KeyRound size={14} />
              {t('profile.changePasswordSection', 'تغيير كلمة المرور (اختياري)')}
            </span>
          </div>

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

        <div className="pt-3 border-t border-[var(--border-card)] grid grid-cols-2 gap-2.5 shrink-0 bg-[var(--surface-card)] sticky bottom-0">
          <Btn
            type="button"
            variant="secondary"
            onClick={handleClose}
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
