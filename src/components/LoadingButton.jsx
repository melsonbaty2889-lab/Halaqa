import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function LoadingButton({ 
  children, 
  onClick, 
  isLoading = false, 
  disabled = false, 
  variant = 'primary', 
  type = 'button',
  className = '',
  style = {} 
}) {
  
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    opacity: (isLoading || disabled) ? 0.7 : 1,
    ...style
  };

  const variants = {
    primary: { background: '#FBBF24', color: '#000' },
    danger: { background: '#EF4444', color: '#fff' },
    outline: { background: 'transparent', border: '1px solid #374151', color: '#9CA3AF' }
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={isLoading || disabled} 
      className={className}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {isLoading && <FaSpinner className="spin-animation" />}
      {children}
    </button>
  );
}
