import React, { useState, useRef, useCallback } from 'react';
import { Upload, ShieldCheck, Check, Copy, X } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import rawColors from '@/theme/colors.js';
import { getText } from '@/utils/textUtils';
import PaymentMethods from './components/PaymentMethods';

// 🎨 الألوان المعتمدة v2.5
const C = {
  ...rawColors,
  dark: {
    card: rawColors?.dark?.card,
    border: rawColors?.dark?.cardBorder,
    surface: rawColors?.dark?.surface,
  },
  amber: {
    DEFAULT: rawColors?.amber?.DEFAULT,
    buttonStart: rawColors?.amber?.buttonStart,
    buttonEnd: rawColors?.amber?.buttonEnd,
    glow: rawColors?.amber?.buttonGlow,
  },
  emerald: {
    DEFAULT: rawColors?.emerald?.DEFAULT,
  },
  text: {
    title: rawColors?.text?.title,
    body: rawColors?.text?.body,
    muted: rawColors?.text?.muted,
  },
  inputs: {
    bg: rawColors?.inputs?.bg,
    border: rawColors?.inputs?.border,
  }
};

export default function PaymentSection({ 
  region = 'egypt', 
  txId, 
  setTxId, 
  isSubmitted, 
  loading, 
  onSubmit, 
  isRTL 
}) {
  const { t } = useAcademy();
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleRemoveFile = useCallback((e) => {
    e.stopPropagation();
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div style={{
      backgroundColor: C.dark?.card,
      borderColor: C.dark?.border,
      borderRadius: '20px',
      padding: '24px',
      maxWidth: '600px',
      marginInline: 'auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      border: `1px solid ${C.dark?.border}`
    }}>

      {/* 💳 1. استدعاء مكون وسائل الدفع (بدون تكرار) */}
      <PaymentMethods 
        onSelectPayment={(gateway) => setSelectedGateway(gateway)} 
      />

      {/* 📝 2. تفاصيل الإشعار ورقم المعاملة للدفع اليدوي */}
      {selectedGateway?.accountNumber && (
        <div style={{
          backgroundColor: C.dark?.surface,
          borderColor: C.dark?.border,
          border: `1px solid ${C.dark?.border}`,
          borderRadius: '12px',
          padding: '16px',
          marginBlockStart: '16px'
        }}>
          {/* مدخل رقم المعاملة */}
          <div style={{ marginBlockEnd: '12px' }}>
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={getText(t, 'subscription.txIdPlaceholder', 'رقم المعاملة / اسم المحول (اختياري)')}
              style={{
                backgroundColor: C.inputs?.bg,
                borderColor: C.inputs?.border,
                color: C.text?.title,
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                border: `1px solid ${C.inputs?.border}`,
                outline: 'none'
              }}
            />
          </div>

          {/* رفع صورة الإشعار */}
          <div>
            <label style={{ color: C.text?.muted, fontSize: '0.75rem', display: 'block', marginBlockEnd: '6px' }}>
              {getText(t, 'subscription.attachReceipt', 'إرفاق صورة إشعار التحويل:')}
            </label>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <label style={{
                backgroundColor: C.inputs?.bg,
                borderColor: C.inputs?.border,
                border: `1px dashed ${C.inputs?.border}`,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                minHeight: '44px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                gap: '8px'
              }}>
                <Upload size={16} style={{ color: C.amber?.DEFAULT }} />
                <span style={{ color: receiptFile ? C.emerald?.DEFAULT : C.text?.muted, fontWeight: receiptFile ? 'bold' : 'normal' }}>
                  {receiptFile ? receiptFile.name : getText(t, 'subscription.selectReceiptFile', 'اختر ملف الإشعار أو التقط صورة')}
                </span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setReceiptFile(e.target.files[0] || null)} 
                  style={{ display: 'none' }} 
                />
              </label>

              {receiptFile && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  aria-label={getText(t, 'common.remove', 'إزالة')}
                  style={{
                    position: 'absolute',
                    insetInlineEnd: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ 3. تنبيه الأمان */}
      <div style={{
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: C.emerald?.DEFAULT,
        border: `1px solid rgba(16, 185, 129, 0.2)`,
        padding: '10px',
        borderRadius: '10px',
        marginBlockStart: '16px',
        textAlign: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }}>
        {getText(t, 'subscription.secureNotice', 'دفع آمن وفوري - يتم تفعيل الترخيص تلقائياً.')}
      </div>

      {/* 🚀 4. زر إتمام الطلب النهائي */}
      {isSubmitted ? (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: C.emerald?.DEFAULT,
          border: `1px solid rgba(16, 185, 129, 0.3)`,
          padding: '14px',
          borderRadius: '12px',
          marginBlockStart: '16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <ShieldCheck size={18} />
          <span>{getText(t, 'subscription.orderReceived', 'تم استلام الطلب وستتم المراجعة والتفعيل فوراً')}</span>
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(selectedGateway?.id, !!selectedGateway?.accountNumber, receiptFile)}
          disabled={loading}
          aria-label={getText(t, 'subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
          style={{
            width: '100%',
            marginBlockStart: '16px',
            padding: '14px',
            minHeight: '48px',
            backgroundColor: C.amber?.DEFAULT,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading 
            ? getText(t, 'common.processing', 'جاري المعالجة...') 
            : getText(t, 'subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
        </button>
      )}
    </div>
  );
}
