// src/components/Header/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, KeyRound, ShieldCheck, Phone, ChevronDown } from 'lucide-react';
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
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  // إغلاق قائمة الدول عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // استخراج كود الدولة ورقم الهاتف الأساسي عند الفتح
  useEffect(() => {
    if (isOpen) {
      let rawPhone = currentUser?.phone || '';
      let matchedDialCode = '+966';
      let mainPhone = rawPhone;

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
      setIsCountryOpen(false);
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

  const handleSelectCountry = (dialCode) => {
    setFormData((prev) => ({ ...prev, countryDialCode: dialCode }));
    setIsCountryOpen(false);
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

  const selectedCountry = COUNTRIES_LIST.find((c) => c.dialCode === formData.countryDialCode) || COUNTRIES_LIST[0];
  const selectedCountryName = currentLang.startsWith('ar') ? selectedCountry.nameAr : selectedCountry.nameEn;

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

          {/* رقم الهاتف + القائمة المخصصة لتفادي حواف المتصفح الافتراضية */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {t('profile.phoneLabel', 'رقم الهاتف / الواتساب')}
            </label>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              {/* قائمة القطر المخصصة Custom Select */}
              <div ref={countryDropdownRef} style={{ position: 'relative', width: '160px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '42px',
                    background: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border-input)',
                    borderRadius: 12,
                    color: 'var(--color-text-primary)',
                    padding: '0 10px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    outline: 'none',
                    gap: 4
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span>{selectedCountry.flag}</span>
                    <span dir="ltr">{selectedCountry.dialCode}</span>
                  </span>
                  <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                </button>

                {/* القائمة المنسدلة عند الفتح */}
                {isCountryOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      left: 0,
                      maxHeight: '180px',
                      overflowY: 'auto',
                      background: 'var(--color-surface-card, #1e293b)',
                      border: '1px solid var(--color-border-input, #334155)',
                      borderRadius: 12,
                      zIndex: 100,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {COUNTRIES_LIST.map((item) => {
                      const cName = currentLang.startsWith('ar') ? item.nameAr : item.nameEn;
                      return (
                        <div
                          key={`${item.code}-${item.dialCode}`}
                          onClick={() => handleSelectCountry(item.dialCode)}
                          style={{
                            padding: '8px 10px',
                            fontSize: 12,
                            color: 'var(--color-text-primary, #fff)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: item.dialCode === formData.countryDialCode ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{item.flag}</span>
                            <span>{cName}</span>
                          </span>
                          <span dir="ltr" style={{ opacity: 0.7, fontSize: 11 }}>{item.dialCode}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* حقل ادخال الرقم الأساسي */}
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
