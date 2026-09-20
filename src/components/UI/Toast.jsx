/* src/components/UI/Toast.jsx */
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ isOpen, message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  // أنماط الألوان الدلالية المعتمدة
  const typeStyles = {
    success: 'bg-semantic-surfaceCard border-semantic-success/40 text-semantic-textPrimary',
    error: 'bg-semantic-surfaceCard border-semantic-error/40 text-semantic-textPrimary',
    warning: 'bg-semantic-surfaceCard border-semantic-warning/40 text-semantic-textPrimary',
    info: 'bg-semantic-surfaceCard border-semantic-borderCard text-semantic-textPrimary',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-semantic-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-semantic-error shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-semantic-warning shrink-0" />,
    info: <Info className="w-5 h-5 text-semantic-actionPrimary shrink-0" />,
  };

  const currentStyle = typeStyles[type] || typeStyles.info;
  const currentIcon = icons[type] || icons.info;

  return (
    <div 
      dir="auto"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-md p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${currentStyle}`}
    >
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          {currentIcon}
          <span className="leading-snug break-words">{message}</span>
        </div>

        <button 
          type="button"
          onClick={onClose} 
          className="p-1.5 hover:bg-semantic-surfaceInput rounded-xl text-semantic-textSecondary hover:text-semantic-textPrimary transition-colors shrink-0 cursor-pointer active:scale-95"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
