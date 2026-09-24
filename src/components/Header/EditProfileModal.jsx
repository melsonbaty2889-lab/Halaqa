// src/components/Header/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, KeyRound, ShieldCheck, Phone } from 'lucide-react';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Btn from '@/components/UI/Btn';
import { COUNTRIES_LIST } from '@/constants/countries';

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

  // استخراج رمز الدولة والهاتف عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      let rawPhone = currentUser?.phone || '';
      let matchedDialCode = '+966';
      let mainPhone = rawPhone;

      // مطابقة الهاتف المسجل بقائمة الدول الموجودة
      const foundCountry = COUNTRIES_LIST.find((c) => rawPhone.startsWith(c.dialCode));
      if (foundCountry) {
        matchedDialCode = foundCountry.dialCode;
        mainPhone = rawPhone.replace(foundCountry.dialCode, '').trim();
      }

      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        countryDialCode: matchedDialCode,
        phone: mainPhone,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [isOpen, currentUser]);

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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '68vh', overflow: 'hidden' }}>
        <form 
          onSubmit={handleSubmit} 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingLeft: 4, 
            paddingRight: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16 
          }}
        >
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

          {/* رقم الهاتف + القائمة المنسدلة المربوطة بـ COUNTRIES_LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {t('profile.phoneLabel', 'رقم الهاتف / الواتساب')}
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <select
                name="countryDialCode"
                value={formData.countryDialCode}
                onChange={handleChange}
                style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border-input)',
                  borderRadius: 12,
                  color: 'var(--color-text-primary)',
                  padding: '0 8px',
                  fontSize: 13,
                  cursor: 'pointer',
                  outline: 'none',
                  direction: 'ltr'
                }}
              >
                {COUNTRIES_LIST.map((item) => {
                  const countryName = currentLang.startsWith('ar') ? item.nameAr : item.nameEn;
                  return (
                    <option key={`${item.code}-${item.dialCode}`} value={item.dialCode} style={{ background: '#1e293b', color: '#fff' }}>
                      {item.flag} {item.dialCode} ({countryName})
                    </option>
                  );
                })}
              </select>

              <div style={{ flex: 1 }}>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  icon={<Phone size={16} />}
                  placeholder="50 000 0000"
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
          <div style={{ paddingTop: 12, marginTop: 4, borderTop: '1px solid var(--color-border-input, rgba(255,255,255,0.1))' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-action-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
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
        </form>

        {/* الشريط السفلي الثابت للأزرار */}
        <div 
          style={{ 
            paddingTop: 16, 
            marginTop: 12, 
            borderTop: '1px solid var(--color-border-input, rgba(255,255,255,0.1))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            gap: 10, 
            flexShrink: 0 
          }}
        >
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
            style={{ minWidth: 120 }}
          >
            {t('common.saveChanges', 'حفظ التغييرات')}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
