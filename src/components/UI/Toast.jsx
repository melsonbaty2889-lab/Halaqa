import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ 
  isOpen, 
  message, 
  type = 'info', 
  onClose = () => {}, 
  duration = 4000 
}) {
  useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      style: 'bg-semantic-surfaceCard border-semantic-actionPrimary/30 text-semantic-textPrimary',
      iconColor: 'text-semantic-actionPrimary'
    },
    error: {
      icon: AlertCircle,
      style: 'bg-semantic-surfaceCard border-semantic-error/30 text-semantic-textPrimary',
      iconColor: 'text-semantic-error'
    },
    warning: {
      icon: AlertTriangle,
      style: 'bg-semantic-surfaceCard border-semantic-warning/30 text-semantic-textPrimary',
      iconColor: 'text-semantic-warning'
    },
    info: {
      icon: Info,
      style: 'bg-semantic-surfaceCard border-semantic-borderCard text-semantic-textPrimary',
      iconColor: 'text-semantic-actionPrimary'
    }
  }[type] || {
    icon: Info,
    style: 'bg-semantic-surfaceCard border-semantic-borderCard text-semantic-textPrimary',
    iconColor: 'text-semantic-actionPrimary'
  };

  const IconComponent = config.icon;

  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[90%] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${config.style}`}>
        <div className="shrink-0 flex items-center justify-center">
          <IconComponent className={`w-5 h-5 shrink-0 ${config.iconColor}`} />
        </div>

        <p className="text-xs sm:text-sm font-semibold leading-snug flex-1 text-right">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-semantic-textSecondary hover:text-semantic-textPrimary hover:bg-semantic-surfaceInput transition-colors shrink-0 cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
