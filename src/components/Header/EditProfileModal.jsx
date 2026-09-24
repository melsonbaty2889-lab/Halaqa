// src/components/Header/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Btn from '@/components/UI/Btn';

export default function EditProfileModal({
  isOpen = false,
  onClose = () => {},
  currentUser = { name: '', email: '' },
  onSave = () => {},
  activeRtl = true
}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // إعطاء القيم الأولية فقط مرة واحدة عند فتح المودال لمنع مسح الحقول أثناء الكتابة أو التفاعل
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [isOpen]); // الاعتماد على isOpen فقط لحماية البيانات من التفريغ المفاجئ

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
    if (!formData.name.trim()) {
      newErrors.name = t('profile.errors.nameRequired', 'الاسم مطلوب');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('profile.errors.emailRequired', 'البريد الإلكتروني مطلوب');
    }

    const isEmailChanged = formData.email.trim() !== (currentUser.email || '').trim();
    const isPasswordChanging = Boolean(formData.newPassword);

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

  // نص زر الحفظ المضمون بدعم العربية
  const saveButtonText = t('common.saveChanges', t('common.save', 'حفظ التغييرات'));
  const finalSaveText = saveButtonText === 'save' || saveButtonText === 'Save' ? 'حفظ التغييرات' : saveButtonText;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('profile.title', 'تعديل الملف الشخصي')}
    >
      <div className="flex flex-col max-h-[75vh] sm:max-h-[80vh]">
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
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

        {/* أزرار الإجراءات ثابتة بشكل ممتاز في الأسفل دون اقتطاع */}
        <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-end gap-2 bg-[var(--surface-card)] shrink-0">
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
            className="min-w-[110px] justify-center"
          >
            {finalSaveText}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
