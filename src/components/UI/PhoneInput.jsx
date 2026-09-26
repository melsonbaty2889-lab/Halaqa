// src/components/UI/PhoneInput.jsx
import React, { useEffect } from 'react';
import Input from '@/components/UI/Input';
import CountrySelect from '@/components/UI/CountrySelect';
import { detectUserCountryCode } from '@/utils/formatters';

export default function PhoneInput({
  countryCode = '',
  phone = '',
  onCountryChange = () => {},
  onPhoneChange = () => {},
  error = '',
  label = '',
  lang = 'ar',
  activeRtl = true,
  t = (k, d) => d
}) {
  // التحديد التلقائي لكود الدولة (مع مصر EG كبديل موثوق)
  useEffect(() => {
    if (!countryCode) {
      const defaultCode = detectUserCountryCode();
      if (defaultCode) {
        onCountryChange(defaultCode);
      }
    }
  }, [countryCode, onCountryChange]);

  return (
    <div className="flex flex-col gap-1 relative z-20">
      {label && (
        <label className="text-xs font-semibold text-semantic-textSecondary">
          {label}
        </label>
      )}
      
      <div className="flex items-start gap-2">
        <div className="w-28 sm:w-32 shrink-0 relative z-30">
          <CountrySelect
            value={countryCode}
            onChange={onCountryChange}
            lang={lang}
            isArabic={activeRtl}
            t={t}
          />
        </div>

        <div className="flex-1">
          <Input
            type="tel"
            name="phone"
            value={phone}
            onChange={onPhoneChange}
            error={error}
            placeholder="1000000000"
            activeRtl={activeRtl}
          />
        </div>
      </div>
    </div>
  );
}
