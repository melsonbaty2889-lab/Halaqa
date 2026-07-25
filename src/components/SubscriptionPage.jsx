// src/components/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getPrices, detectUserRegion } from '../constants/subscriptionData';
import PaymentSection from './PaymentSection';

export default function SubscriptionPage({ session, academyId, onBack }) {
  const { t, i18n } = useTranslation();
  const [region, setRegion] = useState('egypt');
  const [duration, setDuration] = useState('monthly');
  const [txId, setTxId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [notification, setNotification] = useState(null);

  const isRTL = i18n.language === 'ar';
  const basePrices = getPrices(t);

  useEffect(() => {
    const userLoc = navigator.language;
    setRegion(detectUserRegion(userLoc, i18n.language));
  }, [i18n.language]);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'HALAQA10' || code === 'SAVE10') {
      setDiscountPercent(10);
      setAppliedCoupon(code);
      setCouponMessage({ type: 'success', text: isRTL ? 'تم تطبيق خصم 10% بنجاح! 🎉' : '10% Discount applied!' });
    } else if (code === 'FOUNDERS20') {
      setDiscountPercent(20);
      setAppliedCoupon(code);
      setCouponMessage({ type: 'success', text: isRTL ? 'تم تطبيق خصم 20% للمؤسسين! 🔥' : '20% Founder discount applied!' });
    } else {
      setCouponMessage({ type: 'error', text: isRTL ? 'كود الخصم غير صالح أو منتهي.' : 'Invalid coupon code.' });
    }
  };

  const calculateFinalPrice = (basePrice) => {
    const numeric = parseFloat(basePrice);
    if (isNaN(numeric)) return basePrice;
    if (discountPercent > 0) {
      return (numeric * (1 - discountPercent / 100)).toFixed(0);
    }
    return basePrice;
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmitPayment = async (selectedPaymentMethod, isManualTransfer) => {
    if (!academyId) {
      showNotification(isRTL ? "⚠️ لم يتم العثور على معرف الأكاديمية." : "⚠️ Academy ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const startsAt = new Date();
      const expiryDate = new Date();
      if (duration === 'monthly') expiryDate.setDate(expiryDate.getDate() + 30);
      else if (duration === 'yearly') expiryDate.setDate(expiryDate.getDate() + 365);
      else if (duration === 'lifetime') expiryDate.setDate(expiryDate.getDate() + 36500);

      const rawAmount = parseFloat(basePrices[region][duration]);
      const finalAmount = discountPercent > 0 ? rawAmount * (1 - discountPercent / 100) : rawAmount;

      const { error } = await supabase
        .from('saas_subscriptions')
        .insert([{
          academy_id: academyId,
          payer_id: session?.user?.id,
          plan_tier: 'pro',
          plan_duration: duration,
          status: isManualTransfer ? 'pending_verification' : 'active',
          payment_gateway: selectedPaymentMethod,
          price: finalAmount,
          currency: basePrices[region].curr,
          starts_at: startsAt.toISOString(),
          expires_at: expiryDate.toISOString(),
          metadata: {
            transaction_id: txId || (isManualTransfer ? 'MANUAL_VERIFICATION_PENDING' : 'AUTO_GATEWAY_SUCCESS'),
            region: region,
            discount_applied: discountPercent,
            coupon_code: appliedCoupon || null
          }
        }]);

      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      console.error("🚨 Subscription Error:", err);
      showNotification(isRTL ? "❌ حدث خطأ أثناء معالجة الطلب." : "❌ Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
      
      {notification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#1e293b', color: '#f8fafc', padding: '14px 28px', borderRadius: '12px', border: '1px solid #f59e0b', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontWeight: '700' }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 30px auto', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} style={{ background: '#1e293b', color: '#f59e0b', border: '1px solid #334155', padding: '10px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>
          🌐 {t('subscription.switchLang')}
        </button>
        {onBack && (
          <button onClick={onBack} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            {t('subscription.backToDashboard')}
          </button>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: '800', marginBottom: '14px' }}>{t('subscription.title')}</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>{t('subscription.subtitle')}</p>
        </div>

        {/* 🎟️ قسم كود الخصم العلوي */}
        <div style={{ maxWidth: '550px', margin: '0 auto 35px auto', background: '#111827', padding: '18px 24px', borderRadius: '18px', border: '1px dashed #f59e0b' }}>
          <label style={{ display: 'block', color: '#f8fafc', fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', textAlign: 'center' }}>
            🏷️ {isRTL ? "هل لديك كود خصم مخصص؟" : "Have a special promo code?"}
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder={isRTL ? "أدخل الكود (مثل: FOUNDERS20)" : "Enter code (e.g. FOUNDERS20)"}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#0a0f1d', color: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: '600' }}
            />
            <button 
              type="button"
              onClick={handleApplyCoupon}
              style={{ padding: '12px 24px', background: '#f59e0b', color: '#0a0f1d', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
            >
              {isRTL ? "تطبيق" : "Apply"}
            </button>
          </div>
          {couponMessage && (
            <p style={{ margin: '10px 0 0 0', textAlign: 'center', fontSize: '0.85rem', color: couponMessage.type === 'success' ? '#10b981' : '#ef4444', fontWeight: '700' }}>
              {couponMessage.text}
            </p>
          )}
        </div>

        {/* Region Selector */}
        <div style={{ marginBottom: '40px', background: '#111827', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b' }}>
          <label style={{ display: 'block', color: '#94a3b8', marginBottom: '14px', fontWeight: '700', textAlign: 'center' }}>{t('subscription.regionLabel')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {['egypt', 'gcc', 'global'].map((r) => (
              <button key={r} onClick={() => setRegion(r)} style={{ padding: '12px 22px', borderRadius: '12px', border: region === r ? '2px solid #f59e0b' : '1px solid #334155', background: region === r ? 'rgba(245,158,11,0.08)' : '#1e293b', color: region === r ? '#f59e0b' : '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>
                {t(`subscription.${r}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '50px' }}>
          
          {/* Monthly */}
          <div onClick={() => setDuration('monthly')} style={{ background: '#111827', border: duration === 'monthly' ? '2px solid #f59e0b' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 10px 0' }}>{t('subscription.monthly')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f59e0b', margin: '20px 0' }}>
              {calculateFinalPrice(basePrices[region].monthly)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {basePrices[region].curr}</span>
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '12px', background: duration === 'monthly' ? '#f59e0b' : '#1e293b', color: duration === 'monthly' ? '#0a0f1d' : '#94a3b8', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              {duration === 'monthly' ? t('subscription.selectedPlan') : t('subscription.choosePlan')}
            </button>
          </div>

          {/* Yearly */}
          <div onClick={() => setDuration('yearly')} style={{ background: '#111827', border: duration === 'yearly' ? '2px solid #10b981' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease' }}>
            <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {isRTL ? 'توفير شهرين مجاناً 🔥' : 'Save 2 Months Automatically 🔥'}
            </span>
            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', marginTop: '10px' }}>{t('subscription.yearly')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981', margin: '20px 0' }}>
              {calculateFinalPrice(basePrices[region].yearly)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {basePrices[region].curr}</span>
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '12px', background: duration === 'yearly' ? '#10b981' : '#1e293b', color: duration === 'yearly' ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              {duration === 'yearly' ? t('subscription.selectedPlan') : t('subscription.choosePlan')}
            </button>
          </div>

          {/* Lifetime */}
          <div onClick={() => setDuration('lifetime')} style={{ background: '#111827', border: duration === 'lifetime' ? '2px solid #ef4444' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease' }}>
            <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {isRTL ? 'فرصة حصرية للمؤسسين ⚡' : 'Exclusive Founder Deal ⚡'}
            </span>
            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', marginTop: '10px' }}>{t('subscription.lifetime')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444', margin: '20px 0' }}>
              {calculateFinalPrice(basePrices[region].lifetime)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {basePrices[region].curr}</span>
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '12px', background: duration === 'lifetime' ? '#ef4444' : '#1e293b', color: duration === 'lifetime' ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              {duration === 'lifetime' ? t('subscription.selectedPlan') : t('subscription.choosePlan')}
            </button>
          </div>

        </div>

        {/* مكون الدفع المتطور والمبسط */}
        <PaymentSection 
          region={region}
          duration={duration}
          txId={txId}
          setTxId={setTxId}
          isSubmitted={isSubmitted}
          loading={loading}
          onSubmit={handleSubmitPayment}
          t={t}
          isRTL={isRTL}
        />

      </div>
    </div>
  );
}
