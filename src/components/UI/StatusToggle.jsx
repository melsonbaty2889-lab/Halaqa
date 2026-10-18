/* src/components/UI/StatusToggle.jsx */

import React from 'react';

export default function StatusToggle({
  checked = false,
  onChange,
  activeLabel = 'نشط',
  inactiveLabel = 'مؤرشف',
  disabled = false,
  loading = false,
  className = ''
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || loading) return;
    if (onChange) onChange(!checked);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-semantic-borderCard/60 bg-semantic-surfaceInput/90 hover:border-semantic-actionPrimary/50 transition-all cursor-pointer shadow-sm active:scale-95 outline-none focus:ring-0 ${className}`}
    >
      {/* جسم المفتاح (Track) */}
      <div
        className={`w-8 h-4 rounded-full transition-colors duration-200 relative flex items-center p-0.5 ${
          checked ? 'bg-semantic-success' : 'bg-semantic-borderCard'
        }`}
      >
        {/* دائرة المفتاح المتحركة (Thumb) */}
        <div
          className={`w-3 h-3 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>

      {/* النص التوضيحي */}
      <span
        className={`text-[11px] font-extrabold select-none ${
          checked ? 'text-semantic-success' : 'text-semantic-textMuted'
        }`}
      >
        {checked ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
}
