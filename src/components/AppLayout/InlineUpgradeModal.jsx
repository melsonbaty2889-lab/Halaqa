import React from 'react';
import { Zap, CheckCircle, X } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { C } from '@/theme/colors';

const getText = (tFunc, key, fallback) => {
  if (typeof tFunc === 'function') {
    const res = tFunc(key, fallback);
    if (res && res !== key) return res;
  }
  return fallback;
};

export default function InlineUpgradeModal({ isOpen, onClose, academyName }) {
  const academyContext = useAcademy();
  const t = academyContext?.t;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        background: C.semantic.surfaceCard,
        border: `1px solid ${C.semantic.borderInput}`,
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        position: 'relative'
      }}>
        {/* زر الإغلاق */}
        <button 
          onClick={onClose}
          aria-label={getText(t, 'common.close', 'إغلاق')}
          title={getText(t, 'common.close', 'إغلاق')}
          style={{
            position: 'absolute',
            insetBlockStart: '16px',
            insetInlineStart: '16px',
            background: 'none',
            border: 'none',
            color: C.semantic.textSecondary,
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* الهيدر والأيقونة */}
        <div style={{ textAlign: 'center', marginBlockEnd: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: C.semantic.successBg,
            border: `1px solid ${C.semantic.successBorder}`,
            color: C.semantic.success,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Zap size={24} />
          </div>
          <h2 style={{ color: C.semantic.textPrimary, fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: 'bold' }}>
            {getText(t, 'upgrade.title', 'ترقية حساب الأكاديمية')}
          </h2>
          <p style={{ color: C.semantic.textSecondary, fontSize: '0.85rem', margin: 0 }}>
            {getText(t, 'upgrade.subtitle', 'احصل على كافة مميزات المنظومة الاحترافية لأكاديميتك')} ({academyName || ''})
          </p>
        </div>

        {/* قائمة المميزات */}
        <div style={{
          background: C.semantic.surfaceInput,
          borderRadius: '10px',
          padding: '14px',
          marginBlockEnd: '20px',
          border: `1px solid ${C.semantic.borderInput}`
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: C.semantic.textPrimary, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.semantic.success }} />
              <span>{getText(t, 'upgrade.feat1', 'إدارة عدد غير محدود من الطلاب والحلقات')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.semantic.success }} />
              <span>{getText(t, 'upgrade.feat2', 'تقارير وأداء لحظي وتنبيهات مستمرة')}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.semantic.success }} />
              <span>{getText(t, 'upgrade.feat3', 'دعم فني وتحديثات مستمرة للباقة الاحترافية')}</span>
            </li>
          </ul>
        </div>

        {/* الأزرار الإجرائية */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              alert(getText(t, 'upgrade.success_msg', 'تم إرسال طلب الترقية إلى إدارة المنصة بنجاح، سيتم التواصل معكم فوراً.'));
              onClose();
            }}
            aria-label={getText(t, 'upgrade.confirm', 'تأكيد طلب الترقية')}
            title={getText(t, 'upgrade.confirm', 'تأكيد طلب الترقية')}
            style={{
              flex: 1,
              padding: '12px',
              minHeight: '44px',
              background: C.semantic.actionPrimary,
              color: C.semantic.textPrimary,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${C.semantic.actionPrimaryGlow}`
            }}
          >
            {getText(t, 'upgrade.confirm', 'تأكيد طلب الترقية')}
          </button>
          <button
            onClick={onClose}
            aria-label={getText(t, 'common.cancel', 'إلغاء')}
            title={getText(t, 'common.cancel', 'إلغاء')}
            style={{
              padding: '12px 18px',
              minHeight: '44px',
              background: C.semantic.surfaceSecondary,
              color: C.semantic.textSecondary,
              border: `1px solid ${C.semantic.borderInput}`,
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {getText(t, 'common.cancel', 'إلغاء')}
          </button>
        </div>
      </div>
    </div>
  );
}
