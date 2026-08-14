// src/components/SaaS/PaymentSection.jsx
import { useState, useEffect } from 'react';

// حاوية قياسية للشعارات المفرغة وبدون إطارات عريضة
const LogoSlot = ({ src, alt }) => (
  <div style={{ 
    width: '48px', 
    height: '32px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexShrink: 0 
  }}>
    <img 
      src={src} 
      alt={alt} 
      style={{ 
        maxWidth: '100%', 
        maxHeight: '100%', 
        objectFit: 'contain' 
      }} 
    />
  </div>
);

// الشعارات الرسمية المفرغة من روابط CDN موثوقة
const PaymentLogos = {
  applePay: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" />,
  mada: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mada_Logo.svg" alt="Mada" />,
  instapay: <LogoSlot src="https://instapay.eg/wp-content/uploads/2022/03/instapay-logo.png" alt="InstaPay" />,
  vodafone: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Vodafone_icon.svg" alt="Vodafone Cash" />,
  fawry: <LogoSlot src="https://fawry.com/wp-content/uploads/2022/07/fawry-logo.png" alt="Fawry" />,
  stcPay: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/e/e6/STC_Pay_logo.svg" alt="STC Pay" />,
  paypal: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />,
  card: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MasterCard / Visa" />,
  bank: (
    <div style={{ width: '48px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    </div>
  ),
  crypto: <LogoSlot src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=035" alt="USDT" />
};

export default function PaymentSection({ 
  region, 
  txId, 
  setTxId, 
  isSubmitted, 
  loading, 
  onSubmit, 
  isRTL 
}) {
  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const paymentMethods = {
    egypt: [
      { id: 'instapay', name: isRTL ? 'InstaPay (تحويل بنكي فوري)' : 'InstaPay Direct Transfer', isManual: true, number: 'username@instapay', logo: PaymentLogos.instapay },
      { id: 'vodafone', name: isRTL ? 'فودافون كاش والمحافظ الذكية' : 'Smart Wallets / Vodafone Cash', isManual: true, number: '01012345678', logo: PaymentLogos.vodafone },
      { id: 'fawry', name: isRTL ? 'فوري Pay (كود الدفع السريع)' : 'Fawry Pay Code', isManual: true, number: '987654321', logo: PaymentLogos.fawry },
      { id: 'card_eg', name: isRTL ? 'بطاقات الفيزا وميزة البنكية' : 'Visa / MasterCard / Meeza', isManual: false, logo: PaymentLogos.card },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay', isManual: false, logo: PaymentLogos.applePay, badge: isRTL ? 'الأسرع' : 'Fastest' },
      { id: 'mada', name: isRTL ? 'بطاقات مدى (Mada)' : 'Mada Debit/Credit Cards', isManual: false, logo: PaymentLogos.mada },
      { id: 'stc_pay', name: isRTL ? 'STC Pay / المحافظ الخليجية' : 'STC Pay & GCC Wallets', isManual: false, logo: PaymentLogos.stcPay },
      { id: 'iban', name: isRTL ? 'تحويل بنكي مباشر (IBAN)' : 'Direct IBAN Bank Transfer', isManual: true, number: 'SA8200000012345678901234', logo: PaymentLogos.bank },
    ],
    global: [
      { id: 'card_global', name: isRTL ? 'بطاقات ائتمان دولية (Visa / MasterCard)' : 'Visa / MasterCard / AMEX', isManual: false, logo: PaymentLogos.card },
      { id: 'paypal', name: 'PayPal', isManual: false, logo: PaymentLogos.paypal },
      { id: 'crypto', name: 'USDT (TRC20 Wallet)', isManual: true, number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', logo: PaymentLogos.crypto },
    ]
  };

  const activeMethods = paymentMethods[region] || paymentMethods.egypt;
  const [selectedMethod, setSelectedMethod] = useState(activeMethods[0]?.id || 'instapay');

  useEffect(() => {
    if (activeMethods.length > 0) {
      setSelectedMethod(activeMethods[0].id);
      setReceiptFile(null);
    }
  }, [region]);

  const handleCopy = (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const currentMethodObj = activeMethods.find(m => m.id === selectedMethod) || activeMethods[0];

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      style={{ 
        background: '#0f172a', 
        border: '1px solid #1e293b', 
        borderRadius: '20px', 
        padding: '24px', 
        maxWidth: '480px', 
        margin: '0 auto', 
        boxSizing: 'border-box', 
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* عنوان الوسائل */}
      <h4 style={{ 
        color: '#f59e0b', 
        marginTop: '0', 
        marginBottom: '18px', 
        fontSize: '0.95rem', 
        fontWeight: '700', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '12px'
      }}>
        {isRTL ? "اختر وسيلة الدفع المناسبة:" : "Select Payment Method:"}
      </h4>

      {/* خيارات وسائل الدفع */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeMethods.map((item) => {
          const isSelected = selectedMethod === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setSelectedMethod(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: isSelected ? 'rgba(245, 158, 11, 0.08)' : '#162032',
                border: isSelected ? '2px solid #f59e0b' : '1px solid #243147',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                {item.logo}
                <span style={{ 
                  color: '#f8fafc', 
                  fontWeight: '600', 
                  fontSize: '0.88rem', 
                  lineHeight: '1.35',
                  wordBreak: 'break-word'
                }}>
                  {item.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {item.badge && (
                  <span style={{ 
                    background: 'rgba(245, 158, 11, 0.2)', 
                    color: '#f59e0b', 
                    fontSize: '0.68rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.badge}
                  </span>
                )}
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: isSelected ? '5px solid #f59e0b' : '2px solid #475569',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* تفاصيل التحويل اليدوي */}
      {currentMethodObj.isManual && (
        <div style={{ marginTop: '18px', background: '#162032', border: '1px dashed #f59e0b', borderRadius: '14px', padding: '16px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 10px 0', fontWeight: '600' }}>
            {isRTL ? 'يرجى تحويل المبلغ إلى الحساب التالي:' : 'Please transfer to the following details:'}
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '10px', 
            background: '#0f172a', 
            padding: '12px', 
            borderRadius: '10px', 
            border: '1px solid #243147' 
          }}>
            <div style={{ 
              color: '#f59e0b', 
              fontFamily: 'monospace', 
              fontSize: '0.92rem', 
              fontWeight: '700', 
              wordBreak: 'break-all', 
              direction: 'ltr',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              {currentMethodObj.number}
            </div>

            <button 
              type="button"
              onClick={() => handleCopy(currentMethodObj.number)}
              style={{ 
                alignSelf: isRTL ? 'flex-start' : 'flex-end',
                background: copied ? '#10b981' : '#334155', 
                border: 'none', 
                color: '#fff', 
                borderRadius: '6px', 
                padding: '6px 14px', 
                cursor: 'pointer', 
                fontSize: '0.78rem', 
                fontWeight: '700',
                transition: '0.2s'
              }}
            >
              {copied ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ العنوان' : 'Copy Address')}
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={isRTL ? "رقم المعاملة / اسم المحول (اختياري)" : "Transaction Reference / Sender ID (Optional)"}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                border: '1px solid #334155', 
                background: '#0f172a', 
                color: '#fff', 
                outline: 'none', 
                fontSize: '0.82rem', 
                boxSizing: 'border-box' 
              }}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '6px', fontWeight: '600' }}>
              {isRTL ? "إرفاق صورة إشعار التحويل:" : "Attach Transfer Receipt:"}
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              padding: '12px',
              borderRadius: '8px',
              border: '1px dashed #334155',
              background: '#0f172a',
              color: receiptFile ? '#10b981' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              <span>
                {receiptFile 
                  ? receiptFile.name 
                  : (isRTL ? 'اختر ملف الإشعار أو التقط صورة' : 'Select receipt file')}
              </span>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onClick={(e) => { e.target.value = null; }}
                onChange={(e) => setReceiptFile(e.target.files[0])} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>
      )}

      {/* تنبيه الدفع المباشر */}
      {!currentMethodObj.isManual && (
        <div style={{ marginTop: '18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <p style={{ color: '#10b981', margin: '0', fontSize: '0.82rem', fontWeight: '700' }}>
            {isRTL ? "دفع آمن وفوري - يتم تفعيل الترخيص تلقائياً." : "Instant & Secure Checkout - Immediate License Grant."}
          </p>
        </div>
      )}

      {/* زر التأكيد أو حالة النجاح */}
      {isSubmitted ? (
        <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '14px', borderRadius: '10px', marginTop: '20px', textAlign: 'center', fontWeight: '700', border: '1px solid #10b981' }}>
          {isRTL ? 'تم استلام الطلب وستتم المراجعة فوراً' : 'Order Processed Successfully'}
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual, receiptFile)}
          disabled={loading}
          style={{ 
            width: '100%', 
            marginTop: '20px', 
            padding: '14px', 
            borderRadius: '10px', 
            background: loading ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)', 
            color: '#0f172a', 
            border: 'none', 
            fontSize: '0.92rem', 
            fontWeight: '800', 
            cursor: loading ? 'wait' : 'pointer', 
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)',
            transition: '0.2s'
          }}
        >
          {loading 
            ? (isRTL ? "جاري المعالجة..." : "Processing...") 
            : (isRTL ? "تأكيد وإتمام الطلب" : "Proceed to Payment")}
        </button>
      )}

      {/* تذييل الأمان */}
      <div style={{ 
        display: 'flex', 
        justify: 'center', 
        gap: '16px', 
        marginTop: '18px', 
        paddingTop: '12px', 
        borderTop: '1px solid #1e293b', 
        color: '#64748b', 
        fontSize: '0.72rem',
        direction: 'ltr'
      }}>
        <span>256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>Instant Activation</span>
      </div>

    </div>
  );
}
