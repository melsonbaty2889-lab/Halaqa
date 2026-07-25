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

  // 💳 شجرة وسائل الدفع المتكاملة (آلية ويدوية)
  const paymentMethods = {
    egypt: [
      { id: 'instapay', name: 'InstaPay (تحويل بنكي فوري)', isManual: true, number: 'username@instapay', icon: '⚡' },
      { id: 'vodafone', name: 'فودافون كاش والمحافظ الذكية', isManual: true, number: '01012345678', icon: '📱' },
      { id: 'fawry', name: 'فوري Pay (كود الدفع السريع)', isManual: true, number: '987654321', icon: '🏪' },
      { id: 'card_eg', name: 'بطاقات الفيزا وميزة البنكية Direct Card', isManual: false, icon: '💳' },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay (دفع سريع بضغطة واحدة)', isManual: false, icon: '🍏' },
      { id: 'mada', name: 'بطاقات مدى (Mada Debit/Credit)', isManual: false, icon: '💳' },
      { id: 'stc_pay', name: 'STC Pay / المحافظ الخليجية', isManual: false, icon: '📲' },
      { id: 'iban', name: 'تحويل بنكي مباشر (IBAN)', isManual: true, number: 'SA8200000012345678901234', icon: '🏦' },
    ],
    global: [
      { id: 'card_global', name: 'Visa / MasterCard / AMEX (دولي)', isManual: false, icon: '💳' },
      { id: 'paypal', name: 'PayPal السريع', isManual: false, icon: '🅿️' },
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
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '24px', padding: '35px', maxWidth: '650px', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
      
      <h4 style={{ color: '#f59e0b', marginTop: '0', marginBottom: '20px', fontSize: '1.15rem', fontWeight: '700', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        💳 {isRTL ? "اختر وسيلة الدفع المناسبة لك:" : "Select Your Preferred Payment Method:"}
      </h4>

      {/* 🚀 قائمة خيارات الدفع */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {activeMethods.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedMethod(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '14px',
              background: selectedMethod === item.id ? '#1e293b' : '#0a0f1d',
              border: selectedMethod === item.id ? '2px solid #f59e0b' : '1px solid #1f293d',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</span>
          </div>
        ))}
      </div>

      {/* 🟢 حالة الدفع اليدوي (InstaPay / المحافظ / USDT): يظهر الرقم + زر النسخ + مدخل اختياري */}
      {currentMethodObj.isManual && (
        <div style={{ marginTop: '22px', background: '#0a0f1d', border: '1px dashed #f59e0b', borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 10px 0', fontWeight: '600' }}>
            {isRTL ? 'يرجى تحويل المبلغ إلى الرقم/الحساب التالي:' : 'Please transfer amount to the following account:'}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', padding: '12px 18px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: '700', direction: 'ltr' }}>
              {currentMethodObj.number}
            </span>
            <button 
              type="button"
              onClick={() => handleCopy(currentMethodObj.number)}
              style={{ background: copied ? '#10b981' : '#334155', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
            >
              {copied ? (isRTL ? 'تم النسخ! 📋' : 'Copied! 📋') : (isRTL ? 'نسخ' : 'Copy')}
            </button>
          </div>

          <div style={{ marginTop: '16px' }}>
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={isRTL ? "أدخل رقم المعاملة / رقم المحول (اختياري لتسريع التفعيل)" : "Transaction Reference (Optional)"}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#111827', color: '#fff', outline: 'none', textAlign: 'center', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      )}

      {/* 🔵 حالة الدفع الآلي المباشر (Visa / Apple Pay / PayPal / Mada): لا يتطلب أي مدخلات */}
      {!currentMethodObj.isManual && (
        <div style={{ marginTop: '22px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
          <p style={{ color: '#10b981', margin: '0', fontSize: '0.9rem', fontWeight: '700' }}>
            ⚡ {isRTL ? "دفع آمن وفوري - سيتم تفعيل ترخيص الأكاديمية تلقائياً بمجرد إتمام العملية." : "Instant & Secure Checkout - Immediate License Grant."}
          </p>
        </div>
      )}

      {/* زر إتمام العملية */}
      {isSubmitted ? (
        <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '20px', borderRadius: '16px', marginTop: '25px', textAlign: 'center', fontWeight: '700', border: '1px solid #10b981' }}>
          🎉 {isRTL ? 'تم استلام الطلب وتفعيل الترخيص بنجاح!' : 'Order Processed Successfully!'}
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual)}
          disabled={loading}
          style={{ width: '100%', marginTop: '25px', padding: '16px', borderRadius: '14px', background: loading ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0a0f1d', border: 'none', fontSize: '1.05rem', fontWeight: '800', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)' }}
        >
          {loading ? (isRTL ? "جاري معالجة الطلب..." : "Processing...") : (
            currentMethodObj.isManual 
              ? (isRTL ? 'تأكيد التحويل وإرسال الطلب 🚀' : 'Confirm Manual Transfer 🚀') 
              : (isRTL ? `الانتقال للدفع عبر ${currentMethodObj.name} 💳` : `Pay via ${currentMethodObj.name} 💳`)
          )}
        </button>
      )}

      {/* شارات الأمان */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #1e293b', color: '#64748b', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        <span>🔒 {isRTL ? "تشفير آمن 256-bit" : "256-Bit SSL Encrypted"}</span>
        <span>⚡ {isRTL ? "تفعيل تلقائي متاح" : "Instant Activation Available"}</span>
        <span>🛡️ {isRTL ? "ضمان استرجاع 14 يوم" : "14-Day Money Back"}</span>
      </div>

    </div>
  );
}
