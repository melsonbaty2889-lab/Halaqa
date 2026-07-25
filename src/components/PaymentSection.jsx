// src/components/PaymentSection.jsx
import React, { useState } from 'react';

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

  // قائمة الوسائل ببيانات منظمة بدون خلط لغوي
  const paymentMethods = {
    egypt: [
      { id: 'instapay', name: isRTL ? 'InstaPay (تحويل بنكي فوري)' : 'InstaPay Direct Transfer', isManual: true, number: 'username@instapay', icon: '⚡' },
      { id: 'vodafone', name: isRTL ? 'فودافون كاش والمحافظ الذكية' : 'Smart Wallets / Vodafone Cash', isManual: true, number: '01012345678', icon: '📱' },
      { id: 'fawry', name: isRTL ? 'فوري Pay (كود الدفع السريع)' : 'Fawry Pay Code', isManual: true, number: '987654321', icon: '🏪' },
      { id: 'card_eg', name: isRTL ? 'بطاقات الفيزا وميزة البنكية' : 'Visa / MasterCard / Meeza', isManual: false, icon: '💳' },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay', isManual: false, icon: '🍎' },
      { id: 'mada', name: isRTL ? 'بطاقات مدى (Mada)' : 'Mada Debit/Credit Cards', isManual: false, icon: '💳' },
      { id: 'stc_pay', name: isRTL ? 'STC Pay / المحافظ الخليجية' : 'STC Pay & GCC Wallets', isManual: false, icon: '📲' },
      { id: 'iban', name: isRTL ? 'تحويل بنكي مباشر (IBAN)' : 'Direct IBAN Bank Transfer', isManual: true, number: 'SA8200000012345678901234', icon: '🏦' },
    ],
    global: [
      { id: 'card_global', name: isRTL ? 'بطاقات أئتمان دولية (Visa / MasterCard)' : 'Visa / MasterCard / AMEX', isManual: false, icon: '💳' },
      { id: 'paypal', name: 'PayPal', isManual: false, icon: '🅿️' },
      { id: 'google_pay', name: 'Google Pay', isManual: false, icon: '🌐' },
      { id: 'crypto', name: 'USDT (TRC20 Wallet)', isManual: true, number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', icon: '🪙' },
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
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '24px', padding: '24px', maxWidth: '550px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      <h4 style={{ color: '#f59e0b', marginTop: '0', marginBottom: '20px', fontSize: '1.05rem', fontWeight: '700', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        💳 {isRTL ? "اختر وسيلة الدفع المناسبة لك:" : "Select Payment Method:"}
      </h4>

      {/* خيارات وسائل الدفع */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeMethods.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedMethod(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              background: selectedMethod === item.id ? '#1e293b' : '#0a0f1d',
              border: selectedMethod === item.id ? '2px solid #f59e0b' : '1px solid #1f293d',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</span>
            </div>
            {selectedMethod === item.id && <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>✓</span>}
          </div>
        ))}
      </div>

      {/* حالة التحويل اليدوي */}
      {currentMethodObj.isManual && (
        <div style={{ marginTop: '20px', background: '#0a0f1d', border: '1px dashed #f59e0b', borderRadius: '14px', padding: '16px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 10px 0', fontWeight: '600' }}>
            {isRTL ? 'يرجى تحويل المبلغ إلى الرقم/الحساب التالي:' : 'Please transfer to the following details:'}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: '700', direction: 'ltr' }}>
              {currentMethodObj.number}
            </span>
            <button 
              type="button"
              onClick={() => handleCopy(currentMethodObj.number)}
              style={{ background: copied ? '#10b981' : '#334155', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
            >
              {copied ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ' : 'Copy')}
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={isRTL ? "رقم المعاملة / رقم المحول (اختياري)" : "Transaction Reference / Sender ID (Optional)"}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#111827', color: '#fff', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {/* حالة الدفع المباشر والآلي */}
      {!currentMethodObj.isManual && (
        <div style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <p style={{ color: '#10b981', margin: '0', fontSize: '0.85rem', fontWeight: '700' }}>
            ⚡ {isRTL ? "دفع آمن وفوري - سيتم تفعيل الترخيص تلقائياً." : "Instant & Secure Checkout - Immediate License Grant."}
          </p>
        </div>
      )}

      {/* زر إجراء العمليات الموحد والمبسط */}
      {isSubmitted ? (
        <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '16px', borderRadius: '12px', marginTop: '20px', textAlign: 'center', fontWeight: '700', border: '1px solid #10b981' }}>
          🎉 {isRTL ? 'تم استلام الطلب بنجاح!' : 'Order Processed Successfully!'}
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual)}
          disabled={loading}
          style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '12px', background: loading ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0a0f1d', border: 'none', fontSize: '1rem', fontWeight: '800', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)' }}
        >
          {loading 
            ? (isRTL ? "جاري المعالجة..." : "Processing...") 
            : (isRTL ? "تأكيد وإتمام الطلب 🚀" : "Proceed to Payment 🚀")}
        </button>
      )}

      {/* شارات الأمان */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem' }}>
        <span>🔒 256-Bit SSL Encrypted</span>
        <span>⚡ Instant Activation</span>
      </div>

    </div>
  );
}
