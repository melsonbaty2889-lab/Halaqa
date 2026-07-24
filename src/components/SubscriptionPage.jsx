// src/components/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getPrices, detectUserRegion } from '../constants/subscriptionData';
import PaymentSection from './PaymentSection';

export default function SubscriptionPage({ session, onBack }) {
  const { t, i18n } = useTranslation();
  const [region, setRegion] = useState('egypt');
  const [duration, setDuration] = useState('monthly'); // شهري، سنوي، مدى الحياة
  const [txId, setTxId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notification, setNotification] = useState(null);

  const isRTL = i18n.language === 'ar';
  const basePrices = getPrices(t);

  useEffect(() => {
    const userLoc = navigator.language;
    setRegion(detectUserRegion(userLoc, i18n.language));
  }, [i18n.language]);

  // دالة تطبيق كود الخصم التجريبية (يمكن ربطها بـ Supabase لاحقاً)
  const handleApplyCoupon = (code) => {
    if (code.toUpperCase() === 'HALAQA10' || code.toUpperCase() === 'SAVE10') {
      setDiscountPercent(10);
      return true;
    }
    if (code.toUpperCase() === 'FOUNDERS20') {
      setDiscountPercent(20);
      return true;
    }
    return false;
  };

  // حساب السعر النهائي بعد الخصم
  const calculateFinalPrice = (basePrice) => {
    const numeric = parseFloat(basePrice);
    if (isNaN(numeric)) return basePrice;
    if (discountPercent > 0) {
      return (numeric * (1 - discountPercent / 100)).toFixed(0);
    }
    return basePrice;
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmitPayment = async () => {
    if (region === 'egypt' && (duration === 'monthly' || duration === 'yearly')) {
      showNotification(isRTL ? "جاري تهيئة الاتصال الآمن وتوجيهك إلى بوابة الدفع..." : "Redirecting to Payment Gateway...");
      return;
    }
    
    if ((duration === 'lifetime' || region === 'global' || region === 'gcc') && !txId.trim()) {
      showNotification(isRTL ? "⚠️ يرجى توفير الرقم المرجعي أو معرف المعاملة لتأكيد الاستحقاق." : "⚠️ Transaction Reference ID is required.");
      return;
    }

    setLoading(true);
    try {
      const expiryDate = new Date();
      if (duration === 'monthly') expiryDate.setDate(expiryDate.getDate() + 30);
      else if (duration === 'yearly') expiryDate.setDate(expiryDate.getDate() + 365);
      else if (duration === 'lifetime') expiryDate.setDate(expiryDate.getDate() + 36500);

      const rawAmount = parseFloat(basePrices[region][duration]);
      const finalAmount = discountPercent > 0 ? rawAmount * (1 - discountPercent / 100) : rawAmount;

      const { error } = await supabase
        .from('saas_subscriptions')
        .insert([{
          user_id: session?.user?.id,
          plan_type: duration,
          status: 'pending',
          payment_gateway: region === 'egypt' ? 'instapay_vodafone' : (region === 'global' ? 'usdt_crypto' : 'gcc_local_methods'),
          transaction_id: txId || 'AUTOMATED_GATEWAY_HANDSHAKE',
          amount: finalAmount,
          currency: region === 'egypt' ? 'EGP' : (region === 'gcc' ? 'SAR' : 'USD'),
          expires_at: expiryDate.toISOString()
        }]);

      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      console.error("🚨 Subscription Error:", err);
      showNotification(isRTL ? "❌ فشل بروتوكول الاتصال أثناء معالجة الطلب." : "❌ Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
      
      {/* 🔔 شريط التنبيهات المدمج الأنيق */}
      {notification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#1e293b', color: '#f8fafc', padding: '14px 28px', borderRadius: '12px', border: '1px solid #f59e0b', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontWeight: '700' }}>
          {notification}
        </div>
      )}

      {/* الهيدر وزر اللغة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 40px auto', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <button onClick={toggleLanguage} style={{ background: '#1e293b', color: '#f59e0b', border: '1px solid #334155', padding: '10px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>
          🌐 {t('subscription.switchLang')}
        </button>
        {onBack && (
          <button onClick={onBack} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            {t('subscription.backToDashboard')}
          </button>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* العناوين */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <h1 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: '800', marginBottom: '14px' }}>{t('subscription.title')}</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>{t('subscription.subtitle')}</p>
        </div>

        {/* اختيار النطاق الجغرافي */}
        <div style={{ marginBottom: '40px', background: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b' }}>
          <label style={{ display: 'block', color: '#94a3b8', marginBottom: '16px', fontWeight: '700' }}>{t('subscription.regionLabel')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {['egypt', 'gcc', 'global'].map((r) => (
              <button key={r} onClick={() => setRegion(r)} style={{ padding: '14px 24px', borderRadius: '12px', border: region === r ? '2px solid #f59e0b' : '1px solid #334155', background: region === r ? 'rgba(245,158,11,0.08)' : '#1e293b', color: region === r ? '#f59e0b' : '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>
                {t(`subscription.${r}`)}
              </button>
            ))}
          </div>
        </div>

        {/* 📦 كروت الخطط الثابتة الثلاث (شهري / سنوي / مدى الحياة) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '50px' }}>
          
          {/* 1. الاشتراك الشهري */}
          <div onClick={() => setDuration('monthly')} style={{ background: '#111827', border: duration === 'monthly' ? '2px solid #f59e0b' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: '700' }}>{t('subscription.monthly')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f59e0b', margin: '20px 0' }}>
              {calculateFinalPrice(basePrices[region].monthly)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {basePrices[region].curr}</span>
              {discountPercent > 0 && <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>خصم {discountPercent}% مُطبق</div>}
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '12px', background: duration === 'monthly' ? '#f59e0b' : '#1e293b', color: duration === 'monthly' ? '#0a0f1d' : '#94a3b8', border: 'none', fontWeight: '700' }}>
              {duration === 'monthly' ? t('subscription.selectedPlan') : t('subscription.choosePlan')}
            </button>
          </div>

          {/* 2. الترخيص السنوي */}
          <div onClick={() => setDuration('yearly')} style={{ background: '#111827', border: duration === 'yearly' ? '2px solid #10b981' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
            <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>{t('subscription.saveTwoMonths')}</span>
            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', marginTop: '10px' }}>{t('subscription.yearly')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981', margin: '20px 0' }}>
              {calculateFinalPrice(basePrices[region].yearly)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {basePrices[region].curr}</span>
              {discountPercent > 0 && <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>خصم {discountPercent}% مُطبق</div>}
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '12px', background: duration === 'yearly' ? '#10b981' : '#1e293b', color: duration === 'yearly' ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700' }}>
              {duration === 'yearly' ? t('subscription.selectedPlan') : t('subscription.choosePlan')}
            </button>
          </div>

          {/* 3. الترخيص الأبدي (مدى الحياة) */}
          <div onClick={() => setDuration('lifetime')} style={{ background: '#111827', border: duration === 'lifetime' ? '2px solid #ef4444' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
            <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>{t('subscription.limitedOffer')}</span>
            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', marginTop: '10px' }}>{t('subscription.lifetime')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444', margin: '20px 0' }}>
              {calculateFinalPrice(basePrices[region].lifetime)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {basePrices[region].curr}</span>
              {discountPercent > 0 && <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>خصم {discountPercent}% مُطبق</div>}
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '12px', background: duration === 'lifetime' ? '#ef4444' : '#1e293b', color: duration === 'lifetime' ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700' }}>
              {duration === 'lifetime' ? t('subscription.selectedPlan') : t('subscription.choosePlan')}
            </button>
          </div>

        </div>

        {/* المكون المستقل الخاص بالدفع وكوبون الخصم */}
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
          discountPercent={discountPercent}
          onApplyCoupon={handleApplyCoupon}
        />

      </div>
    </div>
  );
}
