// src/components/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  getPrices, 
  detectUserRegion, 
  validateCoupon, 
  calculateFinalPrice 
} from '../constants/subscriptionData';
import PaymentSection from './PaymentSection';

export default function SubscriptionPage({ session, academyId, onBack }) {
  const { t, i18n } = useTranslation();
  const [region, setRegion] = useState('egypt');
  const [duration, setDuration] = useState('yearly'); // جعل الخطة السنوية افتراضية لزيادة المبيعات
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

  // تطبيق كود الخصم باستخدام دالة validateCoupon
  const handleApplyCoupon = () => {
    const { valid, discountPercent: discount, code } = validateCoupon(couponInput);
    
    if (valid) {
      setDiscountPercent(discount);
      setAppliedCoupon(code);
      setCouponMessage({ 
        type: 'success', 
        text: isRTL ? `تم تطبيق خصم ${discount}% بنجاح! 🎉` : `${discount}% Discount applied!` 
      });
    } else {
      setDiscountPercent(0);
      setAppliedCoupon('');
      setCouponMessage({ 
        type: 'error', 
        text: isRTL ? 'كود الخصم غير صالح أو منتهي.' : 'Invalid coupon code.' 
      });
    }
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

      const rawAmount = basePrices[region][duration];
      const finalAmount = calculateFinalPrice(rawAmount, discountPercent);

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

  // هيكلة الباقات والمميزات
  const plans = [
    {
      id: 'monthly',
      title: t('subscription.monthly'),
      color: '#f59e0b',
      features: [
        isRTL ? 'تفعيل فوري لكامل النظام' : 'Instant full system access',
        isRTL ? 'إدارة الطلاب والدورات' : 'Student & course management',
        isRTL ? 'دعم فني قياسي' : 'Standard support'
      ]
    },
    {
      id: 'yearly',
      title: t('subscription.yearly'),
      badge: isRTL ? 'توفير شهرين مجاناً 🔥' : 'Save 2 Months 🔥',
      badgeBg: '#10b981',
      color: '#10b981',
      features: [
        isRTL ? 'كل مميزات الاشتراك الشهري' : 'All Monthly features',
        isRTL ? 'توفير قيمة شهرين كاملين' : 'Save 2 full months cost',
        isRTL ? 'أولوية في الدعم الفني' : 'Priority support'
      ]
    },
    {
      id: 'lifetime',
      title: t('subscription.lifetime'),
      badge: isRTL ? 'فرصة حصرية للمؤسسين ⚡' : 'Exclusive Founder Deal ⚡',
      badgeBg: '#ef4444',
      color: '#ef4444',
      features: [
        isRTL ? 'دفع مرة واحدة مدى الحياة' : 'One-time payment for life',
        isRTL ? 'جميع التحديثات المستقبلية مجاناً' : 'All future updates included',
        isRTL ? 'دعم فني خاص VIP' : 'Dedicated VIP support'
      ]
    }
  ];

  return (
    <div style={{ background: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
      
      {/* Toast Notification */}
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

        {/* Coupon Code Input Section */}
        <div style={{
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto 30px auto',
          background: '#111827',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px dashed #f59e0b',
          boxSizing: 'border-box'
        }}>
          <label style={{ display: 'block', color: '#f8fafc', fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', textAlign: 'center' }}>
            🏷️ {isRTL ? "هل لديك كود خصم مخصص؟" : "Have a special promo code?"}
          </label>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
            <input 
              type="text" 
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder={isRTL ? "أدخل الكود (مثل: FOUNDERS20)" : "Enter code (e.g. FOUNDERS20)"}
              style={{ 
                flex: 1, 
                minWidth: '0',
                padding: '10px 14px', 
                borderRadius: '10px', 
                border: '1px solid #334155', 
                background: '#0a0f1d', 
                color: '#fff', 
                outline: 'none', 
                fontSize: '0.85rem', 
                fontWeight: '600' 
              }}
            />
            <button 
              type="button"
              onClick={handleApplyCoupon}
              style={{ 
                padding: '10px 18px', 
                background: '#f59e0b', 
                color: '#0a0f1d', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '800', 
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0 
              }}
            >
              {isRTL ? "تطبيق" : "Apply"}
            </button>
          </div>

          {/* Coupon Message Alert */}
          {couponMessage && (
            <div style={{ 
              marginTop: '10px', 
              textAlign: 'center', 
              fontSize: '0.85rem', 
              fontWeight: '700', 
              color: couponMessage.type === 'success' ? '#10b981' : '#ef4444' 
            }}>
              {couponMessage.text}
            </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '25px', marginBottom: '50px', alignItems: 'stretch' }}>
          {plans.map((plan) => {
            const isSelected = duration === plan.id;
            const rawPrice = basePrices[region][plan.id];
            const finalPrice = calculateFinalPrice(rawPrice, discountPercent);

            return (
              <div 
                key={plan.id}
                onClick={() => setDuration(plan.id)}
                style={{ 
                  background: isSelected ? '#162032' : '#111827', 
                  border: isSelected ? `2px solid ${plan.color}` : '1px solid #1e293b', 
                  padding: '35px 24px 24px 24px', 
                  borderRadius: '24px', 
                  cursor: 'pointer', 
                  position: 'relative', 
                  transition: 'all 0.25s ease',
                  marginTop: plan.badge ? '12px' : '0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? '0 10px 30px rgba(0,0,0,0.4)' : 'none'
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-14px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    background: plan.badgeBg, 
                    color: '#fff', 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 10px 0', textAlign: 'center' }}>
                    {plan.title}
                  </h3>
                  
                  <div style={{ fontSize: '2.4rem', fontWeight: '900', color: plan.color, margin: '20px 0', textAlign: 'center' }}>
                    {finalPrice} <span style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: '600' }}>/ {basePrices[region].curr}</span>
                  </div>

                  {/* Features List */}
                  <ul style={{ listStyle: 'none', padding: '0', margin: '20px 0', borderTop: '1px dashed #1e293b', paddingTop: '16px' }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: plan.color, fontWeight: 'bold' }}>✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  type="button"
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: isSelected ? plan.color : '#1e293b', 
                    color: isSelected ? (plan.id === 'monthly' ? '#0a0f1d' : '#fff') : '#94a3b8', 
                    border: 'none', 
                    fontWeight: '800', 
                    cursor: 'pointer',
                    transition: '0.2s',
                    marginTop: '10px'
                  }}
                >
                  {isSelected ? t('subscription.selectedPlan') : t('subscription.choosePlan')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Section */}
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
