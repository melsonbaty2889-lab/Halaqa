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
  const [selectedMethod, setSelectedMethod] = useState('');
  const [copied, setCopied] = useState(false);

  // 📌 بيانات التحويل المباشرة (يمكنك وضع أرقامك الرسمية هنا في ملفك المحلي)
  const paymentDetails = {
    egypt: {
      vodafone: { name: t('subscription.vodafoneCash') || 'فودافون كاش / المحافظ الإلكترونية', number: '01012345678', icon: '📱' },
      instapay: { name: t('subscription.instapay') || 'حساب InstaPay المباشر', number: 'username@instapay', icon: '⚡' },
      fawry: { name: t('subscription.fawry') || 'كود دفع فوري (Fawry Pay)', number: '987654321', icon: '🏪' },
    },
    gcc: {
      apple: { name: t('subscription.applePay') || 'Apple Pay / Mada', number: 'متاح عبر البوابة المباشرة', icon: '💳' },
      instapay_gcc: { name: 'تحويل بنكي مباشر (IBAN)', number: 'SA8200000012345678901234', icon: '🏦' },
    },
    global: {
      crypto: { name: t('subscription.usdt') || 'USDT (TRC20 Wallet)', number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', icon: '🪙' },
      card: { name: t('subscription.creditCard') || 'Visa / MasterCard Gateway', number: 'دفع إلكتروني آمن 100%', icon: '💳' },
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeGroup = paymentDetails[region] || paymentDetails.egypt;

  return (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '24px', padding: '35px', maxWidth: '650px', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
      
      <h4 style={{ color: '#f59e0b', marginTop: '0', marginBottom: '20px', fontSize: '1.15rem', fontWeight: '700', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        💳 {isRTL ? "اختر طريقة الدفع المعتمدة لنطاقك:" : "Select Verified Payment Gateway:"}
      </h4>

      {/* قائمة طرق الدفع */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(activeGroup).map(([key, item]) => (
          <div 
            key={key}
            onClick={() => setSelectedMethod(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '16px 20px',
              borderRadius: '14px',
              background: selectedMethod === key ? '#1e293b' : '#0a0f1d',
              border: selectedMethod === key ? '2px solid #f59e0b' : '1px solid #1f293d',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
            <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.95rem' }}>{item.name}</span>
          </div>
        ))}
      </div>

      {/* صندوق عرض رقم الحساب وزر النسخ السريع */}
      {selectedMethod && activeGroup[selectedMethod]?.number && (
        <div style={{ marginTop: '22px', background: '#0a0f1d', border: '1px dashed #f59e0b', borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 10px 0', fontWeight: '600' }}>
            {isRTL ? 'حوّل المبلغ للرقم/الحساب التالي ثم أدخل رقم المعاملة للتحقق:' : 'Transfer amount to the following account then enter TxID:'}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', padding: '12px 18px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: '700', direction: 'ltr' }}>
              {activeGroup[selectedMethod].number}
            </span>
            <button 
              type="button"
              onClick={() => handleCopy(activeGroup[selectedMethod].number)}
              style={{ background: copied ? '#10b981' : '#334155', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.2s ease' }}
            >
              {copied ? (isRTL ? 'تم النسخ! 📋' : 'Copied! 📋') : (isRTL ? 'نسخ' : 'Copy')}
            </button>
          </div>

          {/* مدخل رقم المعاملة المرجعي */}
          <div style={{ marginTop: '16px' }}>
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={t('subscription.placeholderTx') || (isRTL ? "أدخل رقم المعاملة أو المعرف المرجعي للتحويل" : "Enter Transaction ID / Reference Key")}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #334155', background: '#111827', color: '#fff', outline: 'none', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600' }}
            />
          </div>
        </div>
      )}

      {/* زر التأكيد أو رسالة النجاح */}
      {isSubmitted ? (
        <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '20px', borderRadius: '16px', marginTop: '25px', textAlign: 'center', fontWeight: '700', border: '1px solid #10b981' }}>
          🎉 {t('subscription.successMsg') || (isRTL ? 'تم استلام طلبك بنجاح! جاري التفعيل والتحقق...' : 'Request received successfully!')}
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(selectedMethod)}
          disabled={loading}
          style={{ width: '100%', marginTop: '25px', padding: '16px', borderRadius: '14px', background: loading ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0a0f1d', border: 'none', fontSize: '1.05rem', fontWeight: '800', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)' }}
        >
          {loading ? (isRTL ? "جاري الاتصال الآمن وتأكيد المعاملة..." : "Processing...") : (t('subscription.btnConfirm') || (isRTL ? 'اعتماد المعاملة وتفعيل ترخيص الأكاديمية الفوري 🚀' : 'Authorize & Grant License 🚀'))}
        </button>
      )}

      {/* 🛡️ شارات الأمان */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #1e293b', color: '#64748b', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        <span>🔒 {isRTL ? "تشفير آمن 256-bit" : "256-Bit SSL Encrypted"}</span>
        <span>⚡ {isRTL ? "تفعيل تلقائي فور التأكيد" : "Instant Activation"}</span>
        <span>🛡️ {isRTL ? "ضمان استرجاع 14 يوم" : "14-Day Refund Policy"}</span>
      </div>

    </div>
  );
}
