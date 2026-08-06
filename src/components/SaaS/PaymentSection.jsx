// src/components/PaymentSection.jsx
import React, { useState, useEffect } from 'react';

// حاوية قياسية موحدة الحجم والشكل لجميع اللوجوهات الرسمية
const LogoSlot = ({ children }) => (
  <div style={{ 
    width: '52px', 
    height: '34px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: '8px',
    background: '#ffffff',
    padding: '4px 6px',
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    flexShrink: 0 
  }}>
    {children}
  </div>
);

// الشعارات الأصلية الرسمية (Official High-Quality SVGs)
const PaymentLogos = {
  applePay: (
    <LogoSlot>
      <svg width="36" height="20" viewBox="0 0 100 40" fill="none">
        <path d="M12.8 22.3c0-4.1 3.3-6.1 3.5-6.2-1.9-2.8-4.9-3.2-6-3.2-2.5-0.3-5 1.5-6.3 1.5-1.3 0-3.3-1.4-5.4-1.4-2.8 0-5.3 1.6-6.8 4.2-3 5.2-0.8 12.9 2.1 17.1 1.4 2 3.1 4.3 5.3 4.2 2.1-0.1 2.9-1.3 5.5-1.3 2.5 0 3.3 1.3 5.5 1.3 2.3 0 3.7-2.1 5.1-4.1 1.6-2.3 2.2-4.6 2.3-4.7-0.1-0.1-4.8-1.8-4.8-6.7z" fill="#000000"/>
        <path d="M8.8 9.7c1.1-1.4 1.9-3.4 1.7-5.4-1.6 0.1-3.7 1.1-4.8 2.4-1 1.2-1.9 3.2-1.7 5.1 1.9 0.2 3.7-0.8 4.8-2.1z" fill="#000000"/>
        <text x="24" y="30" fill="#000000" fontSize="24" fontWeight="bold" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Pay</text>
      </svg>
    </LogoSlot>
  ),
  mada: (
    <LogoSlot>
      <svg width="40" height="20" viewBox="0 0 100 40">
        <rect width="100" height="40" rx="4" fill="#00A859"/>
        <path d="M15 12h10v16H15z" fill="#0058A3"/>
        <text x="30" y="27" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif">mada</text>
      </svg>
    </LogoSlot>
  ),
  instapay: (
    <LogoSlot>
      <svg width="40" height="22" viewBox="0 0 120 40">
        <defs>
          <linearGradient id="instaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E0854"/>
            <stop offset="100%" stopColor="#6B11B0"/>
          </linearGradient>
        </defs>
        <rect width="120" height="40" rx="6" fill="url(#instaGrad)"/>
        <path d="M22 8L10 22h10l-2 10 12-14H20l2-10z" fill="#00E5FF"/>
        <text x="36" y="27" fill="#FFFFFF" fontSize="18" fontWeight="800" fontFamily="sans-serif">InstaPay</text>
      </svg>
    </LogoSlot>
  ),
  vodafone: (
    <LogoSlot>
      <svg width="24" height="24" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#E60000"/>
        <path d="M50 20c-16.5 0-30 13.5-30 30 0 14.5 10.3 26.6 24 29.3v-12.8c-6.8-2.2-11.8-8.6-11.8-16.2 0-9.4 7.6-17 17-17s17 7.6 17 17c0 7.6-5 14-11.8 16.2v12.8c13.7-2.7 24-14.8 24-29.3 0-16.5-13.5-30-30-30z" fill="#FFFFFF"/>
      </svg>
    </LogoSlot>
  ),
  fawry: (
    <LogoSlot>
      <svg width="42" height="20" viewBox="0 0 100 35">
        <rect width="100" height="35" rx="4" fill="#FFCC00"/>
        <text x="8" y="25" fill="#002B49" fontSize="22" fontWeight="900" fontFamily="sans-serif" italic="true">fawry</text>
      </svg>
    </LogoSlot>
  ),
  stcPay: (
    <LogoSlot>
      <svg width="40" height="20" viewBox="0 0 100 35">
        <rect width="100" height="35" rx="4" fill="#4F008C"/>
        <text x="12" y="24" fill="#FF375F" fontSize="18" fontWeight="900" fontFamily="sans-serif">stc</text>
        <text x="48" y="24" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="sans-serif">pay</text>
      </svg>
    </LogoSlot>
  ),
  paypal: (
    <LogoSlot>
      <svg width="36" height="20" viewBox="0 0 100 40">
        <path d="M25 8h15c7 0 12 3 10.5 9.5C49 23 44 26 38 26h-6l-3 12H18L25 8z" fill="#003087"/>
        <path d="M35 14h15c7 0 12 3 10.5 9.5C59 29 54 32 48 32h-6l-3 12H28L35 14z" fill="#0079C1" opacity="0.85"/>
      </svg>
    </LogoSlot>
  ),
  card: (
    <LogoSlot>
      <svg width="36" height="22" viewBox="0 0 100 60">
        <rect width="100" height="60" rx="8" fill="#1A1F71"/>
        <circle cx="40" cy="30" r="16" fill="#EB001B"/>
        <circle cx="60" cy="30" r="16" fill="#F79E1B" fillOpacity="0.8"/>
      </svg>
    </LogoSlot>
  ),
  bank: (
    <LogoSlot>
      <svg width="24" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    </LogoSlot>
  ),
  crypto: (
    <LogoSlot>
      <svg width="26" height="26" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#26A17B"/>
        <path d="M50 20v10M30 30h40M35 40h30v25c0 8-6.7 15-15 15s-15-7-15-15V40z" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
      </svg>
    </LogoSlot>
  )
};

export default function PaymentSection({ 
  region, 
  duration, 
  txId, 
  setTxId, 
  isSubmitted, 
  loading, 
  onSubmit, 
  t, 
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
  const [selectedMethod, setSelectedMethod] = useState(activeMethods[0]?.id || 'card_eg');

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
        borderRadius: '24px', 
        padding: '20px', 
        maxWidth: '480px', 
        margin: '0 auto', 
        boxSizing: 'border-box', 
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, Roboto, sans-serif'
      }}
    >
      <h4 style={{ 
        color: '#f59e0b', 
        marginTop: '0', 
        marginBottom: '16px', 
        fontSize: '0.98rem', 
        fontWeight: '700', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <span>💳</span> {isRTL ? "اختر وسيلة الدفع المناسبة لك:" : "Select Payment Method:"}
      </h4>

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
                padding: '12px 14px',
                borderRadius: '14px',
                background: isSelected ? '#1e293b' : '#162032',
                border: isSelected ? '2px solid #f59e0b' : '1px solid #243147',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                {item.logo}
                <span style={{ 
                  color: '#f8fafc', 
                  fontWeight: '600', 
                  fontSize: '0.84rem', 
                  lineHeight: '1.35',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal'
                }}>
                  {item.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {item.badge && (
                  <span style={{ 
                    background: '#f59e0b22', 
                    color: '#f59e0b', 
                    fontSize: '0.68rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
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

      {currentMethodObj.isManual && (
        <div style={{ marginTop: '16px', background: '#162032', border: '1px dashed #f59e0b', borderRadius: '16px', padding: '16px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 10px 0', fontWeight: '600' }}>
            {isRTL ? 'يرجى تحويل المبلغ إلى الرقم/الحساب التالي:' : 'Please transfer to the following details:'}
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '10px', 
            background: '#0f172a', 
            padding: '12px', 
            borderRadius: '12px', 
            border: '1px solid #243147' 
          }}>
            <div style={{ 
              color: '#f59e0b', 
              fontFamily: 'monospace', 
              fontSize: '0.88rem', 
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
                borderRadius: '8px', 
                padding: '6px 14px', 
                cursor: 'pointer', 
                fontSize: '0.78rem', 
                fontWeight: '700',
                transition: '0.2s'
              }}
            >
              {copied ? (isRTL ? '✓ تم النسخ' : '✓ Copied') : (isRTL ? '📋 نسخ العنوان' : '📋 Copy Address')}
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
                borderRadius: '10px', 
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
              {isRTL ? "📎 إرفاق صورة إشعار التحويل (لتسريع التفعيل):" : "📎 Attach Transfer Receipt (For instant check):"}
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '10px',
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
                  ? `📄 ${receiptFile.name}` 
                  : (isRTL ? '📷 التقاط صورة أو اختيار ملف الإشعار' : '📷 Take photo or select receipt file')}
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

      {!currentMethodObj.isManual && (
        <div style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <p style={{ color: '#10b981', margin: '0', fontSize: '0.82rem', fontWeight: '700' }}>
            ⚡ {isRTL ? "دفع آمن وفوري - سيتم تفعيل الترخيص تلقائياً." : "Instant & Secure Checkout - Immediate License Grant."}
          </p>
        </div>
      )}

      {isSubmitted ? (
        <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '14px', borderRadius: '12px', marginTop: '20px', textAlign: 'center', fontWeight: '700', border: '1px solid #10b981' }}>
          🎉 {isRTL ? 'تم استلام الطلب وستتم المراجعة فوراً!' : 'Order Processed Successfully!'}
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual, receiptFile)}
          disabled={loading}
          style={{ 
            width: '100%', 
            marginTop: '20px', 
            padding: '14px', 
            borderRadius: '12px', 
            background: loading ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)', 
            color: '#0a0f1d', 
            border: 'none', 
            fontSize: '0.98rem', 
            fontWeight: '800', 
            cursor: loading ? 'wait' : 'pointer', 
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)' 
          }}
        >
          {loading 
            ? (isRTL ? "جاري المعالجة..." : "Processing...") 
            : (isRTL ? "تأكيد وإتمام الطلب 🚀" : "Proceed to Payment 🚀")}
        </button>
      )}

      <div style={{ 
        display: 'flex', 
        justify: 'center', 
        gap: '16px', 
        marginTop: '16px', 
        paddingTop: '12px', 
        borderTop: '1px solid #1e293b', 
        color: '#64748b', 
        fontSize: '0.72rem',
        direction: 'ltr'
      }}>
        <span>🔒 256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>⚡ Instant Activation</span>
      </div>

    </div>
  );
}
