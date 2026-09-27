import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from '@/components/UI/Select';

export default function GenderSelect({
  value,
  onChange,
  error = null,
  label,
  placeholder,
  disabled = false,
  activeRtl = true,
  className = "",
  style = {}
}) {
  const { t } = useTranslation();

  const genderOptions = [
    { value: 'male', label: t('profile.genderMale', 'ذكر') },
    { value: 'female', label: t('profile.genderFemale', 'أنثى') }
  ];

  return (
    <Select
      label={label !== undefined ? label : t('profile.genderLabel', 'الجنس')}
      value={value}
      onChange={onChange}
      options={genderOptions}
      placeholder={placeholder || t('profile.selectGender', 'اختر الجنس')}
      error={error}
      searchable={false} // معطل دائماً لأن الخيارات 2 فقط
      disabled={disabled}
      dir={activeRtl ? 'rtl' : 'ltr'}
      className={className}
      style={style}
      t={t}
    />
  );
}
