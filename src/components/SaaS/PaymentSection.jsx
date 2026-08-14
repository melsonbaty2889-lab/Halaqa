// src/components/SaaS/PaymentSection.jsx
import { useState, useEffect } from 'react';

// حاوية قياسية موحدة الحجم والحواف لجميع الشعارات الرسمية
const LogoSlot = ({ children }) => (
  <div style={{ 
    width: '54px', 
    height: '36px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: '8px',
    background: '#ffffff',
    padding: '3px 5px',
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
    flexShrink: 0,
    overflow: 'hidden'
  }}>
    {children}
  </div>
);

// الشعارات الرسمية الأصلية الدقيقة (Official Vector SVGs)
const PaymentLogos = {
  // 🍎 Apple Pay
  applePay: (
    <LogoSlot>
      <svg width="42" height="22" viewBox="0 0 100 40" fill="none">
        <rect width="100" height="40" rx="6" fill="#000000"/>
        <path d="M22.5 22.3c0-4.1 3.3-6.1 3.5-6.2-1.9-2.8-4.9-3.2-6-3.2-2.5-0.3-5 1.5-6.3 1.5-1.3 0-3.3-1.4-5.4-1.4-2.8 0-5.3 1.6-6.8 4.2-3 5.2-0.8 12.9 2.1 17.1 1.4 2 3.1 4.3 5.3 4.2 2.1-0.1 2.9-1.3 5.5-1.3 2.5 0 3.3 1.3 5.5 1.3 2.3 0 3.7-2.1 5.1-4.1 1.6-2.3 2.2-4.6 2.3-4.7-0.1-0.1-4.8-1.8-4.8-6.7z" fill="#FFFFFF"/>
        <path d="M18.5 9.7c1.1-1.4 1.9-3.4 1.7-5.4-1.6 0.1-3.7 1.1-4.8 2.4-1 1.2-1.9 3.2-1.7 5.1 1.9 0.2 3.7-0.8 4.8-2.1z" fill="#FFFFFF"/>
        <text x="34" y="29" fill="#FFFFFF" fontSize="22" fontWeight="bold" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">Pay</text>
      </svg>
    </LogoSlot>
  ),

  // 🇸🇦 mada مدى
  mada: (
    <LogoSlot>
      <svg width="46" height="24" viewBox="0 0 100 40" fill="none">
        <rect width="100" height="40" rx="6" fill="#FFFFFF"/>
        <path d="M12 12c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z" fill="#00A859"/>
        <path d="M28 12c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z" fill="#0058A3"/>
        <text x="42" y="27" fill="#003B64" fontSize="20" fontWeight="900" fontFamily="sans-serif">mada</text>
      </svg>
    </LogoSlot>
  ),

  // ⚡ InstaPay انستا باي
  instapay: (
    <LogoSlot>
      <svg width="46" height="24" viewBox="0 0 120 40" fill="none">
        <rect width="120" height="40" rx="8" fill="#38085C"/>
        <path d="M22 8L10 22h10l-2 10 12-14H20l2-10z" fill="#00E5FF"/>
        <text x="36" y="27" fill="#FFFFFF" fontSize="18" fontWeight="800" fontFamily="system-ui, sans-serif">InstaPay</text>
      </svg>
    </LogoSlot>
  ),

  // 📱 Vodafone Cash فودافون كاش
  vodafone: (
    <LogoSlot>
      <svg width="28" height="28" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#E60000"/>
        <path d="M50 20c-16.5 0-30 13.5-30 30 0 14.5 10.3 26.6 24 29.3v-12.8c-6.8-2.2-11.8-8.6-11.8-16.2 0-9.4 7.6-17 17-17s17 7.6 17 17c0 7.6-5 14-11.8 16.2v12.8c13.7-2.7 24-14.8 24-29.3 0-16.5-13.5-30-30-30z" fill="#FFFFFF"/>
        <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
      </svg>
    </LogoSlot>
  ),

  // 🟡 Fawry فوري
  fawry: (
    <LogoSlot>
      <svg width="46" height="22" viewBox="0 0 100 35">
        <rect width="100" height="35" rx="6" fill="#FFCC00"/>
        <text x="10" y="25" fill="#002B49" fontSize="22" fontWeight="900" fontFamily="sans-serif" fontStyle="italic">fawry</text>
      </svg>
    </LogoSlot>
  ),

  // 🟣 STC Pay
  stcPay: (
    <LogoSlot>
      <svg width="46" height="22" viewBox="0 0 100 35">
        <rect width="100" height="35" rx="6" fill="#4F008C"/>
        <text x="10" y="24" fill="#FF375F" fontSize="18" fontWeight="900" fontFamily="sans-serif">stc</text>
        <text x="46" y="24" fill="#FFFFFF" fontSize="18" fontWeight="700" fontFamily="sans-serif">pay</text>
      </svg>
    </LogoSlot>
  ),

  // 🅿️ PayPal
  paypal: (
    <LogoSlot>
      <svg width="40" height="22" viewBox="0 0 100 40">
        <path d="M22 8h15c7 0 12 3 10.5 9.5C46 23 41 26 35 26h-6l-3 12H15L22 8z" fill="#003087"/>
        <path d="M32 14h15c7 0 12 3 10.5 9.5C56 29 51 32 45 32h-6l-3 12H25L32 14z" fill="#0079C1" opacity="0.9"/>
      </svg>
    </LogoSlot>
  ),

  // 💳 Visa & MasterCard
  card: (
    <LogoSlot>
      <svg width="44" height="24" viewBox="0 0 100 60">
        <rect width="100" height="60" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
        <circle cx="40" cy="30" r="18" fill="#EB001B"/>
        <circle cx="60" cy="30" r="18" fill="#F79E1B" fillOpacity="0.85"/>
      </svg>
    </LogoSlot>
  ),

  // 🏛️ Bank Transfer / IBAN
  bank: (
    <LogoSlot>
      <svg width="26" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    </LogoSlot>
  ),

  // 🟢 Crypto USDT (Tether)
  crypto: (
    <LogoSlot>
      <svg width="28" height="28" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#26A17B"/>
        <path d="M30 32h40v10H55v8.5c15 0.8 26 4 26 8s-11 7.2-26 8v16.5H45V66.5c-15-0.8-26-4-26-8s11-7.2 26-8V42H30V32z" fill="#FFFFFF"/>
        <path d="M50 51.5c11.5 0 20.8-2.5 20.8-5.5S61.5 40.5 50 40.5 29.2 43 29.2 46s9.3 5.5 20.8 5.5z" fill="#26A17B"/>
      </svg>
    </LogoSlot>
  )
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
        borderRadius: '24px', 
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
        fontSize: '1rem', 
        fontWeight: '700', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <span>💳</span> {isRTL ? "اختر وسيلة الدفع المناسبة لك:" : "Select Payment Method:"}
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
                padding: '12px 14px',
                borderRadius: '14px',
                background: isSelected ? 'rgba(245, 158, 11, 0.08)' : '#162032',
                border: isSelected ? '2px solid #f59e0b' : '1px solid #243147',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                {item.logo}
                <span style={{ 
                  color: '#f8fafc', 
                  fontWeight: '600', 
                  fontSize: '0.86rem', 
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
                  flexShrink: 0,
                  transition: '0.2s'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* خيار التحويل اليدوي */}
      {currentMethodObj.isManual && (
        <div style={{ marginTop: '18px', background: '#162032', border: '1px dashed #f59e0b', borderRadius: '16px', padding: '16px' }}>
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

      {/* تنبيه الدفع المباشر */}
      {!currentMethodObj.isManual && (
        <div style={{ marginTop: '18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <p style={{ color: '#10b981', margin: '0', fontSize: '0.82rem', fontWeight: '700' }}>
            ⚡ {isRTL ? "دفع آمن وفوري - سيتم تفعيل الترخيص تلقائياً." : "Instant & Secure Checkout - Immediate License Grant."}
          </p>
        </div>
      )}

      {/* زر التأكيد أو حالة النجاح */}
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
            color: '#0f172a', 
            border: 'none', 
            fontSize: '0.98rem', 
            fontWeight: '800', 
            cursor: loading ? 'wait' : 'pointer', 
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)',
            transition: '0.2s'
          }}
        >
          {loading 
            ? (isRTL ? "جاري المعالجة..." : "Processing...") 
            : (isRTL ? "تأكيد وإتمام الطلب 🚀" : "Proceed to Payment 🚀")}
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
        <span>🔒 256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>⚡ Instant Activation</span>
      </div>

    </div>
  );
}
