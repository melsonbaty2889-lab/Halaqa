// src/components/Header/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, KeyRound, ShieldCheck, Phone } from 'lucide-react';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Btn from '@/components/UI/Btn';

export default function EditProfileModal({
  isOpen = false,
  onClose = () => {},
  currentUser = { name: '', email: '', phone: '' },
  onSave = () => {},
  activeRtl = true
}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // تحديث البيانات فقط عند فتح المودال لمنع اختفاء كلمة المرور لحظة الإغلاق
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = formData.name.trim();
    const emailTrimmed = formData.email.trim().toLowerCase();
    const currentEmailTrimmed = (currentUser?.email || '').trim().toLowerCase();

    if (!nameTrimmed) {
      newErrors.name = t('profile.errors.nameRequired', 'الاسم مطلوب');
    }
    if (!emailTrimmed) {
      newErrors.email = t('profile.errors.emailRequired', 'البريد الإلكتروني مطلوب');
    }

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
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      onClose();
    } catch (err) {
      console.error('Save profile error:', err);
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
      <div className="flex flex-col max-h-[70vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1 py-2">
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

          {/* رقم الهاتف */}
          <Input
            label={t('profile.phoneLabel', 'رقم الهاتف / الواتساب')}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={<Phone size={16} />}
            placeholder="+966 50 000 0000"
            dir="ltr"
            activeRtl={activeRtl}
          />

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

          {/* فاصل تغيير كلمة المرور */}
          <div className="pt-2 border-t border-[var(--border-card)]">
            <span className="text-[11px] font-bold text-[var(--primary)] flex items-center gap-1.5 mb-2">
              <KeyRound size={13} />
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

          {/* تأكيد كلمة المرور */}
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
        </form>

        {/* الشريط السفلي الثابت */}
        <div className="pt-3 mt-2 border-t border-[var(--border-card)] flex items-center justify-end gap-2 shrink-0">
          <Btn
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel', 'إلغاء')}
          </Btn>
          <Btn
            type="button"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
            className="min-w-[120px] justify-center"
          >
            {t('common.saveChanges', 'حفظ التغييرات')}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
