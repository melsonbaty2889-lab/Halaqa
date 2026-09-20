import React from 'react';
import { Select } from './UI';

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  noOptionsMessage,
  error = null,
  searchable = false,
  disabled = false,
  className = '',
  id,
  isArabic = true,
  lang = 'ar',
  t = (key, fallback) => fallback,
  ...restProps
}) => {
  // معالجة الحدث ليتوافق مع النمطين (إرجاع القيمة المباشرة أو الكائن)
  const handleChange = (e) => {
    const selectedVal = e?.target ? e.target.value : e;
    if (typeof onChange === 'function') {
      onChange(selectedVal);
    }
  };

  return (
    <Select
      id={id}
      options={options}
      value={value}
      onChange={handleChange}
      placeholder={placeholder || t('common.select', 'اختر...')}
      searchPlaceholder={searchPlaceholder || t('common.search', 'بحث...')}
      noOptionsMessage={noOptionsMessage || t('common.noOptions', 'لا توجد خيارات متاحة')}
      errorText={error}
      searchable={searchable}
      disabled={disabled}
      className={className}
      {...restProps}
    />
  );
};

export default CustomSelect;
