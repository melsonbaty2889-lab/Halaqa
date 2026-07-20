/* src/components/EmptyState.jsx */
import React from 'react';

export default function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionText, 
  onAction,
  isRtl: isRtlProp
}) {
  // استخدام الخاصية الممررة أو اكتشاف اللغة من المتصفح تلقائياً
  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : (typeof window !== 'undefined' && (document.dir === 'rtl' || navigator.language?.startsWith('ar')));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#111827',
      borderRadius: '12px',
      border: '1px dashed #374151',
      textAlign: 'center',
      maxWidth: '480px',
      margin: '20px auto',
      boxSizing: 'border-box',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      {/* الأيقونة */}
      {Icon ? (
        <div style={{ color: '#9CA3AF', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.isValidElement(Icon) ? Icon : <Icon size={48} />}
        </div>
      ) : (
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>📂</div>
      )}

      {/* العنوان الرئيسي */}
      <h3 style={{
        color: '#F9FAFB',
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: '0 0 8px 0',
        fontFamily: "'Cairo', sans-serif"
      }}>
        {title || (isRtl ? 'لا توجد بيانات متاحة' : 'No Data Available')}
      </h3>

      {/* الوصف */}
      <p style={{
        color: '#9CA3AF',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        margin: '0 0 20px 0',
        fontFamily: "'Cairo', sans-serif"
      }}>
        {description || (isRtl ? 'لم يتم إضافة أي عناصر في هذا القسم بعد.' : 'No items have been added to this section yet.')}
      </p>

      {/* زر الإجراء */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '10px 20px',
            background: '#38BDF8',
            color: '#0F172A',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            transition: 'background 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(56, 189, 248, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#7DD3FC'}
          onMouseOut={(e) => e.currentTarget.style.background = '#38BDF8'}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
