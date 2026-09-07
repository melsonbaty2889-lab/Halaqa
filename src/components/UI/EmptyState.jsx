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
  isRtl: isRtlProp
}) {
  const { t, i18n } = useTranslation();

  // تحديد الاتجاه بناءً على اللغة الحالية للـ i18n أو الخصائص الممررة
  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : (i18n?.dir ? i18n.dir() === 'rtl' : (document.dir === 'rtl' || i18n?.language?.startsWith('ar')));

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed text-center max-w-md mx-auto my-5 transition-all"
      style={{
        backgroundColor: C.dark?.surfaceInput || C.dark?.surface || '#111827',
        borderColor: C.dark?.borderInput || C.inputs?.border || '#374151',
      }}
    >
      {/* الأيقونة */}
      <div 
        className="mb-4 flex items-center justify-center rounded-full p-3.5"
        style={{ 
          color: C.text?.muted || '#9CA3AF',
          backgroundColor: `${C.amber?.DEFAULT || C.primary?.DEFAULT || '#38BDF8'}12`
        }}
      >
        {Icon ? (
          React.isValidElement(Icon) ? Icon : <Icon size={40} style={{ color: C.amber?.DEFAULT || C.primary?.DEFAULT }} />
        ) : (
          <span className="text-4xl select-none">📂</span>
        )}
      </div>

      {/* العنوان الرئيسي - يقرأ من اللغات الست تلقائياً */}
      <h3 
        className="text-base sm:text-lg font-bold mb-1.5"
        style={{ color: C.text?.title || '#F9FAFB' }}
      >
        {title || t('common.noData', 'لا توجد بيانات متاحة')}
      </h3>

      {/* الوصف - يقرأ من اللغات الست تلقائياً */}
      <p 
        className="text-xs sm:text-sm leading-relaxed mb-5 max-w-sm"
        style={{ color: C.text?.sub || C.text?.muted || '#9CA3AF' }}
      >
        {description || t('common.noDataDesc', 'لم يتم إضافة أي عناصر في هذا القسم بعد.')}
      </p>

      {/* زر الإجراء */}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionText}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:opacity-90 active:scale-95 min-h-[44px]"
          style={{
            backgroundColor: C.amber?.DEFAULT || C.primary?.DEFAULT || '#38BDF8',
            color: C.dark?.bg || '#0F172A',
          }}
        >
          {ActionIcon && <ActionIcon size={16} />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
