import React, { useState } from 'react';

// حاوية قياسية موحدة الحجم لجميع الشعارات لمنع أي اختلال
const LogoSlot = ({ children }) => (
  <div style={{ 
    width: '48px', 
    height: '32px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0 
  }}>
    {children}
  </div>
);

// الشعارات المحدثة
const PaymentLogos = {
  applePay: (
    <LogoSlot>
      <svg width="34" height="18" viewBox="0 0 50 30" fill="none">
        <path d="M12.5 14.1c0-2.8 2.2-4.2 2.3-4.3-1.3-1.9-3.3-2.1-4-2.2-1.7-0.2-3.4 1-4.3 1-.9 0-2.2-0.9-3.6-0.9-1.9 0-3.6 1.1-4.6 2.8-2 3.5-0.5 8.7 1.4 11.5 0.9 1.4 2 2.9 3.5 2.8 1.4-0.1 2-0.9 3.7-0.9 1.7 0 2.2 0.9 3.6 0.9 1.5 0 2.5-1.3 3.4-2.7 1.1-1.6 1.5-3.1 1.6-3.2-0.1 0-3-1.1-3-4.5z" fill="#FFF"/>
        <path d="M9.8 5.6c0.8-1 1.3-2.3 1.1-3.6-1.1 0-2.5 0.7-3.3 1.7-0.7 0.8-1.3 2.2-1.1 3.5 1.3 0.1 2.5-0.6 3.3-1.6z" fill="#FFF"/>
        <text x="18" y="20" fill="#FFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Pay</text>
      </svg>
    </LogoSlot>
  ),
  mada: (
    <LogoSlot>
      <div style={{ background: '#00A859', color: '#FFF', padding: '2px 5px', borderRadius: '4px', fontWeight: '900', fontSize: '9px', letterSpacing: '0.5px' }}>
        mada
      </div>
    </LogoSlot>
  ),
  instapay: (
    <LogoSlot>
      <div style={{ background: 'linear-gradient(135deg, #4c1d95, #6d28d9)', color: '#FFF', padding: '2px 5px', borderRadius: '4px', fontWeight: '800', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '2px' }}>
        <span>⚡</span>Insta
      </div>
    </LogoSlot>
  ),
  vodafone: (
    <LogoSlot>
      <div style={{ background: '#e60000', color: '#FFF', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', lineHeight: '1' }}>
        Voda
      </div>
    </LogoSlot>
  ),
  fawry: (
    <LogoSlot>
      <div style={{ background: '#ffcc00', color: '#002b49', padding: '2px 4px', borderRadius: '4px', fontWeight: '900', fontSize: '9px' }}>
        fawry
      </div>
    </LogoSlot>
  ),
  stcPay: (
    <LogoSlot>
      <div style={{ background: '#4F008C', color: '#FFF', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px' }}>
        stc
      </div>
    </LogoSlot>
  ),
  paypal: (
    <LogoSlot>
      <svg width="22" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.762.762 0 0 1 .752-.644h6.78c2.62 0 4.606.58 5.488 1.62.83 1.02.936 2.45.312 4.28-.795 2.33-2.316 3.66-4.52 3.96h-1.53c-.382 0-.712.277-.773.655l-.946 5.96a.64.64 0 0 1-.631.543z" fill="#003087"/>
        <path d="M8.88 15.347l.95-6.02a.778.778 0 0 1 .77-.65h3.04c2.203 0 3.724-1.33 4.52-3.96.287-.84.38-1.63.28-2.34a7.84 7.84 0 0 1 1.77.21c.882 1.04.988 2.47.364 4.3-.795 2.33-2.316 3.66-4.52 3.96h-1.53a.778.778 0 0 0-.77.655l-.946 5.96a.64.64 0 0 1-.63.543H8.88z" fill="#0079C1"/>
      </svg>
    </LogoSlot>
  ),
  card: (
    <LogoSlot>
      <svg width="22" height="16" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    </LogoSlot>
  ),
  bank: (
    <LogoSlot>
      <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    </LogoSlot>
  ),
  crypto: (
    <LogoSlot>
      <div style={{ background: '#26A17B', color: '#FFF', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px' }}>
        USDT
      </div>
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
  const [selectedMethod, setSelectedMethod] = useState('card');
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeMethods = paymentMethods[region] || paymentMethods.egypt;
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
      
      {/* عنوان القسم */}
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

      {/* قائمة وسائط الدفع - معالجة كاملة لعدم قص النص */}
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
                  wordBreak: 'break-word', // السماح بالنص الكامل دون قص
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

      {/* تفاصيل التحويل اليدوي */}
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
                  : (isRTL ? '📁 اضغط هنا لاختيار صورة الإشعار' : '📁 Click here to select receipt image')}
              </span>
              <input 
                type="file" 
                accept="image/*,.pdf" 
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
