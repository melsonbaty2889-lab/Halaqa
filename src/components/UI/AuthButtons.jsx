import React from 'react';
import Btn from './Btn';

// أيقونة جوجل الرسمية المعيارية
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
  </svg>
);

// 1. الزر الرئيسي (Primary Action Button)
export function PrimaryButton({ 
  children, 
  onClick, 
  type = "submit", 
  loading = false, 
  disabled = false, 
  className = "",
  ...restProps
}) {
  return (
    <Btn
      type={type}
      onClick={onClick}
      variant="primary"
      isLoading={loading}
      disabled={disabled}
      fullWidth
      className={className}
      {...restProps}
    >
      {children}
    </Btn>
  );
}

// 2. زر Google الموحد (Google Social Button)
export function GoogleButton({ 
  onClick, 
  text, 
  loading = false, 
  disabled = false, 
  className = "",
  t = (key, fallback) => fallback,
  ...restProps
}) {
  const buttonText = text || t('auth.googleContinue', 'متابعة باستخدام Google');

  return (
    <Btn
      type="button"
      onClick={onClick}
      variant="google"
      isLoading={loading}
      disabled={disabled}
      fullWidth
      startIcon={<GoogleIcon />}
      className={className}
      {...restProps}
    >
      {buttonText}
    </Btn>
  );
}
