// src/components/PaymentSection.jsx
import React from 'react';

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
  const shouldShowTxInput = duration === 'lifetime' || region === 'global' || region === 'gcc';

  return (
    <div style={{ 
      background: '#111827', 
      border: '1px solid #1e293b', 
      borderRadius: '24px', 
      padding: '35px', 
      maxWidth: '650px', 
      margin: '0 auto', 
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' 
    }}>
      <h4 style={{ 
        color: '#f59e0b', 
        marginTop: '0', 
        marginBottom: '24px', 
        fontSize: '1.2rem', 
        fontWeight: '700', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '12px' 
      }}>
        {t('subscription.paymentMethodsTitle')}
      </h4>
      
      {/* وسائل دفع مصر */}
      {region === 'egypt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <img src="https://img.icons8.com/color/48/vodafone.png" alt="Vodafone" style={{ width: '32px', height: '32px' }} />
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.vodafoneCash')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '1.8rem', lineHeight: '1' }}>⚡</span>
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.instapay')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <img src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-fawry-is-the-first-and-largest-electronic-payment-network-in-egypt-logos-color-tal-revivo.png" alt="Fawry" style={{ width: '32px', height: '32px' }} />
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.fawry')}</span>
          </div>
        </div>
      )}

      {/* وسائل دفع الخليج */}
      {region === 'gcc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <img src="https://img.icons8.com/color/48/apple-pay.png" alt="Apple Pay" style={{ width: '38px', height: '38px' }} />
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.applePay')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <span style={{ background: '#005C53', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800' }}>mada</span>
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.mada')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" style={{ width: '32px', height: '32px' }} />
            <img src="https://img.icons8.com/color/48/mastercard.png" alt="MasterCard" style={{ width: '32px', height: '32px' }} />
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.creditCard')}</span>
          </div>
        </div>
      )}

      {/* وسائل دفع النطاق الدولي */}
      {region === 'global' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <img src="https://img.icons8.com/color/48/tether.png" alt="USDT" style={{ width: '32px', height: '32px' }} />
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.usdt')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
            <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" style={{ width: '32px', height: '32px' }} />
            <img src="https://img.icons8.com/color/48/mastercard.png" alt="MasterCard" style={{ width: '32px', height: '32px' }} />
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{t('subscription.creditCard')}</span>
          </div>
        </div>
      )}

      {/* حقل إدخال رقم المعاملة المرجعي */}
      {shouldShowTxInput && (
        <div style={{ 
          background: '#1e293b', 
          padding: '20px', 
          borderRadius: '16px', 
          marginTop: '24px', 
          borderRight: isRTL ? '4px solid #ef4444' : 'none', 
          borderLeft: isRTL ? 'none' : '4px solid #ef4444' 
        }}>
          <p style={{ margin: '0 0 14px 0', color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {region === 'global' ? t('subscription.usdtInstructions') : t('subscription.instapayInstructions')}
          </p>
          <input 
            type="text"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder={t('subscription.placeholderTx')}
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '10px', 
              border: '1px solid #334155', 
              background: '#0a0f1d', 
              color: '#fff', 
              outline: 'none', 
              textAlign: 'center', 
              fontSize: '1rem', 
              fontWeight: '600' 
            }}
          />
        </div>
      )}

      {/* زر التأكيد أو رسالة النجاح */}
      {isSubmitted ? (
        <div style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', padding: '18px', borderRadius: '14px', marginTop: '25px', textAlign: 'center', fontWeight: '700', border: '1px solid #10b981' }}>
          🎉 {t('subscription.successMsg')}
        </div>
      ) : (
        <button 
          onClick={onSubmit}
          disabled={loading}
          style={{ 
            width: '100%', 
            marginTop: '30px', 
            padding: '16px', 
            borderRadius: '14px', 
            background: loading ? '#475569' : '#f59e0b', 
            color: '#0a0f1d', 
            border: 'none', 
            fontSize: '1.05rem', 
            fontWeight: '800', 
            cursor: 'pointer', 
            opacity: loading ? 0.6 : 1 
          }}
        >
          {loading ? (isRTL ? "جاري الاتصال الآمن..." : "Processing...") : t('subscription.btnConfirm')}
        </button>
      )}
    </div>
  );
}
