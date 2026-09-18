/* src/components/UI/EmptyState.jsx */
import React from 'react';
import { useTranslation } from 'react-i18next';
import C from '@/theme/colors';

export default function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionText, 
  onAction,
  actionIcon: ActionIcon,
  isRtl: isRtlProp,
  variant = 'default' // 'default' أو 'dashed'
}) {
  const { t, i18n } = useTranslation();

  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : (i18n?.dir ? i18n.dir() === 'rtl' : (document.dir === 'rtl' || i18n?.language?.startsWith('ar')));

  const isDashed = variant === 'dashed';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl text-center w-full my-3 transition-all ${
        isDashed ? 'border border-dashed max-w-md mx-auto' : ''
      }`}
      style={{
        backgroundColor: C.dark?.card || C.dark?.surface,
        borderColor: C.dark?.borderInput || C.inputs?.border,
      }}
    >
      {/* الأيقونة */}
      <div 
        className="mb-3.5 flex items-center justify-center rounded-full p-3"
        style={{ 
          color: C.amber?.DEFAULT || C.primary?.DEFAULT,
          backgroundColor: `${C.amber?.DEFAULT || C.primary?.DEFAULT}12`
        }}
      >
        {Icon ? (
          React.isValidElement(Icon) ? Icon : <Icon size={36} style={{ color: C.amber?.DEFAULT || C.primary?.DEFAULT }} />
        ) : (
          <span className="text-3xl select-none">📂</span>
        )}
      </div>

      {/* العنوان */}
      <h3 
        className="text-sm sm:text-base font-bold mb-1"
        style={{ color: C.text?.title }}
      >
        {title || t('common.noData', 'لا توجد بيانات متاحة')}
      </h3>

      {/* الوصف */}
      {description && (
        <p 
          className="text-xs leading-relaxed mb-4 max-w-xs sm:max-w-sm"
          style={{ color: C.text?.sub || C.text?.muted }}
        >
          {description}
        </p>
      )}

      {/* زر الإجراء */}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionText}
          className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:opacity-90 active:scale-95 min-h-[40px] mt-1"
          style={{
            backgroundColor: C.amber?.DEFAULT || C.primary?.DEFAULT,
            color: C.dark?.bg,
          }}
        >
          {ActionIcon && <ActionIcon size={16} />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
