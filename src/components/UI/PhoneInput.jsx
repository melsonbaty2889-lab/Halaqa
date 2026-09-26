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
  activeRtl,
  isArabic,
  isRtl,
  t = (k, d) => d
}) {
  const effectiveRtl = isRtl !== undefined ? isRtl : (activeRtl !== undefined ? activeRtl : (isArabic !== undefined ? isArabic : lang === 'ar' || lang === 'ur'));

  useEffect(() => {
    if (!countryCode) {
      const defaultCode = detectUserCountryCode();
      if (defaultCode) {
        onCountryChange(defaultCode);
      }
    }
  }, [countryCode, onCountryChange]);

  return (
    <div className="flex flex-col gap-1 relative">
      {label && (
        <label className="text-xs font-semibold text-semantic-textSecondary">
          {label}
        </label>
      )}
      
      {/* ضمان اتجاه LTR للحاوية لمنع انعكاس الترتيب في اللغات RTL */}
      <div className="flex items-start gap-2" dir="ltr">
        <div className="w-28 sm:w-32 shrink-0">
          <CountrySelect
            value={countryCode}
            onChange={onCountryChange}
            showDialCode={true}
            lang={lang}
            isRtl={effectiveRtl}
            isArabic={effectiveRtl}
            t={t}
          />
        </div>

        <div className="flex-1" dir="ltr">
          <Input
            type="tel"
            name="phone"
            value={phone}
            onChange={onPhoneChange}
            error={error}
            placeholder="1000000000"
            activeRtl={false}
            className="text-left font-mono"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}
