// src/components/Header/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Lock, Save, ShieldCheck, KeyRound } from 'lucide-react';

export default function EditProfileModal({
  isOpen = false,
  onClose = () => {},
  currentUser = { name: '', email: '', role: 'admin' },
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

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [currentUser, isOpen]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      ...(formData.newPassword ? { newPassword: formData.newPassword } : {})
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md dropdown-surface border border-[var(--border-input)] rounded-2xl shadow-2xl overflow-hidden bg-[var(--surface-dropdown)] text-[var(--text-main)]"
        dir={activeRtl ? 'rtl' : 'ltr'}
      >
        {/* هيدر النافذة */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{t('profile.title', 'تعديل الملف الشخصي')}</h3>
              <p className="text-[11px] text-[var(--text-sub)]">{t('profile.subtitle', 'تحديث بيانات الحساب وكلمة المرور')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--surface-input)] transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* نموذج البيانات */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* الاسم الكامل */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-main)] mb-1">
              {t('profile.nameLabel', 'الاسم الكامل')}
            </label>
            <div className="relative">
              <User size={15} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-sub)] ${activeRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full py-2 bg-[var(--surface-input)] border ${
                  errors.name ? 'border-[var(--error)]' : 'border-[var(--border-input)]'
                } rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all ${
                  activeRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
                placeholder={t('profile.namePlaceholder', 'أدخل اسمك')}
              />
            </div>
            {errors.name && <span className="text-[10px] text-[var(--error)] mt-0.5 block">{errors.name}</span>}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-main)] mb-1">
              {t('profile.emailLabel', 'البريد الإلكتروني')}
            </label>
            <div className="relative">
              <Mail size={15} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-sub)] ${activeRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="email"
                name="email"
                dir="ltr"
                value={formData.email}
                onChange={handleChange}
                className={`w-full py-2 bg-[var(--surface-input)] border ${
                  errors.email ? 'border-[var(--error)]' : 'border-[var(--border-input)]'
                } rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all ${
                  activeRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
                placeholder="example@mail.com"
              />
            </div>
            {errors.email && <span className="text-[10px] text-[var(--error)] mt-0.5 block">{errors.email}</span>}
          </div>

          {/* خط فاصل */}
          <div className="pt-1 pb-1 border-b border-[var(--border-card)]">
            <span className="text-[10.5px] font-bold text-[var(--primary)] flex items-center gap-1">
              <KeyRound size={12} />
              {t('profile.changePasswordSection', 'تغيير كلمة المرور (اختياري)')}
            </span>
          </div>

          {/* كلمة المرور الجديدة */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-main)] mb-1">
              {t('profile.newPasswordLabel', 'كلمة المرور الجديدة')}
            </label>
            <div className="relative">
              <Lock size={15} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-sub)] ${activeRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full py-2 bg-[var(--surface-input)] border ${
                  errors.newPassword ? 'border-[var(--error)]' : 'border-[var(--border-input)]'
                } rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all ${
                  activeRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.newPassword && <span className="text-[10px] text-[var(--error)] mt-0.5 block">{errors.newPassword}</span>}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-main)] mb-1">
              {t('profile.confirmPasswordLabel', 'تأكيد كلمة المرور الجديدة')}
            </label>
            <div className="relative">
              <Lock size={15} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-sub)] ${activeRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full py-2 bg-[var(--surface-input)] border ${
                  errors.confirmPassword ? 'border-[var(--error)]' : 'border-[var(--border-input)]'
                } rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all ${
                  activeRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <span className="text-[10px] text-[var(--error)] mt-0.5 block">{errors.confirmPassword}</span>}
          </div>

          {/* أزرار الإجراءات */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border-card)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--border-input)] text-[var(--text-sub)] hover:bg-[var(--surface-input)] text-xs font-bold transition-all cursor-pointer"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[var(--emerald-bg)] text-[var(--emerald-text)] border border-[var(--emerald-border)] hover:brightness-110 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>{t('common.save', 'حفظ التغييرات')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
