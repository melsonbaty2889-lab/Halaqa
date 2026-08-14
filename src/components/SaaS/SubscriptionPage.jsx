// src/components/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { processAndUploadReceipt } from '@/lib/uploadHelper';
import { useAcademy } from '@/context/AcademyContext';
import { 
  getPrices, 
  detectUserRegion, 
  validateCoupon, 
  calculateFinalPrice 
} from '@/constants/subscriptionData';
import PaymentSection from '@/components/SaaS/PaymentSection';

export default function SubscriptionPage({ session: propSession, academyId: propAcademyId, onBack }) {
  const { t, i18n } = useTranslation();
  const { academy, user } = useAcademy();

  const activeAcademyId = propAcademyId || academy?.id;
  const activeUser = propSession?.user || user;
  
  const [region, setRegion] = useState('egypt');
  const [duration, setDuration] = useState('yearly');
  const [txId, setTxId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  const isRTL = i18n.language === 'ar';
  const basePrices = getPrices(t);

  useEffect(() => {
    const userLoc = navigator.language;
    setRegion(detectUserRegion(userLoc, i18n.language));
  }, [i18n.language]);

  // الاستماع اللحظي لتحديث حالة الاشتراك
  useEffect(() => {
    if (!activeAcademyId) return;

    const fetchCurrentSubscription = async () => {
      const { data } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('academy_id', activeAcademyId)
        .maybeSingle();

      if (data) {
        setSubscriptionStatus(data.status);
        if (data.status === 'pending_verification') {
          setIsSubmitted(true);
        }
      }
    };

    fetchCurrentSubscription();

    const subscriptionChannel = supabase
      .channel(`subscription-status-${activeAcademyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saas_subscriptions',
          filter: `academy_id=eq.${activeAcademyId}`
        },
        (payload) => {
          const newStatus = payload.new?.status;
          setSubscriptionStatus(newStatus);
          
          if (newStatus === 'active') {
            setIsSubmitted(false);
            showNotification(
              isRTL 
                ? 'تم قبول طلبك وتفعيل اشتراك المنظمة بنجاح' 
                : 'Your subscription has been approved and activated!'
            );
          } else if (newStatus === 'canceled' || newStatus === 'unpaid') {
            setIsSubmitted(false);
            showNotification(
              isRTL 
                ? 'تعذر تفعيل الاشتراك، يرجى التواصل مع الدعم الفني.' 
                : 'Subscription request was not approved.'
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [activeAcademyId, isRTL]);

  const handleApplyCoupon = () => {
    const { valid, discountPercent: discount, code } = validateCoupon(couponInput);
    
    if (valid) {
      setDiscountPercent(discount);
      setAppliedCoupon(code);
      setCouponMessage({ 
        type: 'success', 
        text: isRTL ? `تم تطبيق خصم ${discount}% بنجاح` : `${discount}% Discount applied!` 
      });
    } else {
      setDiscountPercent(0);
      setAppliedCoupon('');
      setCouponMessage({ 
        type: 'error', 
        text: isRTL ? 'كود الخصم غير صالح أو منتهي الصلاحية.' : 'Invalid or expired coupon code.' 
      });
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmitPayment = async (selectedPaymentMethod, isManualTransfer, receiptFile) => {
    let resolvedAcademyId = activeAcademyId;

    if (!resolvedAcademyId && activeUser?.id) {
      const { data: userAcad } = await supabase
        .from('academies')
        .select('id')
        .eq('owner_id', activeUser.id)
        .maybeSingle();

      if (userAcad?.id) {
        resolvedAcademyId = userAcad.id;
      } else {
        const { data: firstAcad } = await supabase
          .from('academies')
          .select('id')
          .limit(1)
          .maybeSingle();

        resolvedAcademyId = firstAcad?.id || null;
      }
    }

    if (!resolvedAcademyId) {
      showNotification(isRTL ? "لم يتم العثور على معرف الأكاديمية." : "Academy ID is missing.");
      return;
    }

    setLoading(true);
    try {
      let receiptUrl = null;

      if (isManualTransfer && receiptFile) {
        try {
          const { url } = await processAndUploadReceipt(
            receiptFile, 
            supabase, 
            activeUser?.id || resolvedAcademyId
          );
          receiptUrl = url;
        } catch (uploadError) {
          console.error("Receipt Upload Error:", uploadError);
          showNotification(`${uploadError.message || (isRTL ? 'فشل رفع صورة الإشعار' : 'Receipt upload failed')}`);
          setLoading(false);
          return;
        }
      }

      const startsAt = new Date();
      const expiryDate = new Date();
      if (duration === 'monthly') expiryDate.setDate(expiryDate.getDate() + 30);
      else if (duration === 'yearly') expiryDate.setDate(expiryDate.getDate() + 365);
      else if (duration === 'lifetime') expiryDate.setDate(expiryDate.getDate() + 36500);

      const rawAmount = basePrices[region][duration];
      const finalAmount = calculateFinalPrice(rawAmount, discountPercent);

      const { error } = await supabase
        .from('saas_subscriptions')
        .upsert([{
          academy_id: resolvedAcademyId,
          payer_id: activeUser?.id,
          plan_tier: 'pro',
          plan_duration: duration,
          status: isManualTransfer ? 'pending_verification' : 'active',
          payment_gateway: selectedPaymentMethod,
          price: finalAmount,
          currency: basePrices[region]?.curr || 'EGP',
          starts_at: startsAt.toISOString(),
          expires_at: expiryDate.toISOString(),
          metadata: {
            region: region,
            discount_applied: discountPercent,
            coupon_code: appliedCoupon || null,
            receipt_url: receiptUrl,
            transaction_id: txId || 'MANUAL_VERIFICATION_PENDING'
          },
          updated_at: new Date().toISOString()
        }], { onConflict: 'academy_id' });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      setSubscriptionStatus('pending_verification');
      showNotification(
        isRTL 
          ? "تم إرسال طلب الاشتراك بنجاح وهو قيد المراجعة حالياً." 
          : "Subscription request submitted successfully and is under review."
      );

    } catch (err) {
      console.error("Subscription Error Details:", err);
      const errorMessage = err?.message || err?.error_description || (isRTL ? "حدث خطأ أثناء معالجة الطلب." : "Network error occurred.");
      showNotification(`${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'monthly',
      title: isRTL ? 'الوصول المرن (شهرية)' : 'Flexible Monthly Access',
      color: '#f59e0b',
      badge: null,
      features: [
        isRTL ? 'تفعيل فوري لكامل النظام' : 'Instant full system access',
        isRTL ? 'إدارة الطلاب والدورات' : 'Student & course management',
        isRTL ? 'دعم فني قياسي' : 'Standard support'
      ]
    },
    {
      id: 'yearly',
      title: isRTL ? 'الكفاءة المستدامة (ترخيص سنوي)' : 'Sustainable Annual License',
      badge: isRTL ? 'توفير شهرين مجاناً' : 'Save 2 Months',
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
      title: isRTL ? 'الترخيص الأبدي (مدى الحياة)' : 'Lifetime Founder Access',
      badge: isRTL ? 'عرض المؤسسين الخريجين' : 'Founder Exclusive',
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
    <div style={{ 
      background: '#0a0f1d', 
      color: '#f8fafc', 
      minHeight: '100vh', 
      padding: '40px 20px', 
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      direction: isRTL ? 'rtl' : 'ltr', 
      textAlign: isRTL ? 'right' : 'left' 
    }}>
      
      {/* إشعارات النظام Upper Toast */}
      {notification && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 9999, 
          background: '#1e293b', 
          color: '#f8fafc', 
          padding: '14px 28px', 
          borderRadius: '12px', 
          border: '1px solid #f59e0b', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', 
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          {notification}
        </div>
      )}

      {/* الشريط العلوي */}
      <div style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        maxWidth: '1100px', 
        margin: '0 auto 30px auto', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '20px' 
      }}>
        <button 
          onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} 
          style={{ 
            background: '#1e293b', 
            color: '#f59e0b', 
            border: '1px solid #334155', 
            padding: '8px 18px', 
            borderRadius: '10px', 
            cursor: 'pointer', 
            fontWeight: '700',
            fontSize: '0.85rem'
          }}
        >
          {isRTL ? 'English' : 'العربية'}
        </button>

        {onBack && (
          <button 
            onClick={onBack} 
            style={{ 
              background: 'transparent', 
              color: '#94a3b8', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            {isRTL ? 'العودة إلى لوحة التحكم ←' : '← Back to Dashboard'}
          </button>
        )}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* تنبيه مراجعة الاشتراك */}
        {subscriptionStatus === 'pending_verification' && (
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.08)', 
            border: '1px solid #f59e0b', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '30px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ color: '#f59e0b', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '800' }}>
              {isRTL ? 'طلب الاشتراك قيد المراجعة والتحقق' : 'Subscription Request Pending Review'}
            </h3>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
              {isRTL 
                ? 'تم استلام إيصال التحويل الخاص بك بنجاح، ويقوم فريق الإدارة بمراجعته الآن. سيتم تفعيل ترخيص المنظومة فور الاعتماد.' 
                : 'Your receipt has been received and is being verified by admin. Your account will be activated automatically once approved.'}
            </p>
          </div>
        )}

        {/* الهيدر الرئيسي */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ 
            color: '#f59e0b', 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            {isRTL ? 'امتلاك ترخيص المنظومة - منصة الحلقة الذكية' : 'Acquire System License - Smart Halaqa'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            {isRTL 
              ? 'اختر خطة الاستثمار الأكاديمي الأنسب لك، وانضم إلى كبرى الأكاديميات والمراكز التعليمية حول العالم.' 
              : 'Choose the suitable investment plan for your academy and join top institutions worldwide.'}
          </p>
        </div>

        {/* كارت كود الخصم الاحترافي */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          margin: '0 auto 35px auto',
          background: '#0f172a',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px dashed #334155',
          boxSizing: 'border-box'
        }}>
          <label style={{ 
            display: 'block', 
            color: '#cbd5e1', 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            marginBottom: '10px', 
            textAlign: 'center' 
          }}>
            {isRTL ? "هل لديك كود خصم مخصص؟" : "Have a promo discount code?"}
          </label>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
            <input 
              type="text" 
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder={isRTL ? "أدخل الكود (مثال: S20)" : "Enter code (e.g. S20)"}
              style={{ 
                flex: 1, 
                minWidth: '0',
                padding: '10px 14px', 
                borderRadius: '8px', 
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
                color: '#0f172a', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '800', 
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontSize: '0.85rem'
              }}
            >
              {isRTL ? "تطبيق" : "Apply"}
            </button>
          </div>

          {couponMessage && (
            <div style={{ 
              marginTop: '10px', 
              textAlign: 'center', 
              fontSize: '0.8rem', 
              fontWeight: '700', 
              color: couponMessage.type === 'success' ? '#10b981' : '#ef4444' 
            }}>
              {couponMessage.text}
            </div>
          )}
        </div>

        {/* محدد النطاق الجغرافي */}
        <div style={{ 
          marginBottom: '35px', 
          background: '#0f172a', 
          padding: '20px', 
          borderRadius: '18px', 
          border: '1px solid #1e293b' 
        }}>
          <label style={{ 
            display: 'block', 
            color: '#94a3b8', 
            marginBottom: '14px', 
            fontWeight: '700', 
            textAlign: 'center',
            fontSize: '0.88rem'
          }}>
            {isRTL ? 'حدد النطاق الجغرافي لتفعيل بروتوكولات الدفع المتوافقة مع منطقتك:' : 'Select Region for Localized Gateways:'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {[
              { id: 'egypt', name: isRTL ? 'جمهورية مصر العربية' : 'Egypt' },
              { id: 'gcc', name: isRTL ? 'المملكة العربية السعودية والخليج' : 'Saudi Arabia & GCC' },
              { id: 'global', name: isRTL ? 'النطاق الدولي وباقي العالم' : 'Global / International' }
            ].map((r) => (
              <button 
                key={r.id} 
                onClick={() => setRegion(r.id)} 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '10px', 
                  border: region === r.id ? '2px solid #f59e0b' : '1px solid #334155', 
                  background: region === r.id ? 'rgba(245,158,11,0.08)' : '#162032', 
                  color: region === r.id ? '#f59e0b' : '#f8fafc', 
                  cursor: 'pointer', 
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  transition: '0.2s'
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* بطاقات أسعار الخطط الجداول */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginBottom: '45px', 
          alignItems: 'stretch' 
        }}>
          {plans.map((plan) => {
            const isSelected = duration === plan.id;
            const rawPrice = basePrices[region][plan.id];
            const finalPrice = calculateFinalPrice(rawPrice, discountPercent);

            return (
              <div 
                key={plan.id}
                onClick={() => setDuration(plan.id)}
                style={{ 
                  background: isSelected ? '#162032' : '#0f172a', 
                  border: isSelected ? `2px solid ${plan.color}` : '1px solid #1e293b', 
                  padding: '30px 22px 22px 22px', 
                  borderRadius: '20px', 
                  cursor: 'pointer', 
                  position: 'relative', 
                  transition: 'all 0.2s ease-in-out',
                  marginTop: plan.badge ? '10px' : '0',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  boxShadow: isSelected ? '0 8px 25px rgba(0,0,0,0.4)' : 'none'
                }}
              >
                {plan.badge && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    background: plan.badgeBg, 
                    color: '#fff', 
                    padding: '4px 14px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: '800',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 style={{ 
                    color: '#f8fafc', 
                    fontSize: '1.25rem', 
                    fontWeight: '800', 
                    margin: '0 0 10px 0', 
                    textAlign: 'center' 
                  }}>
                    {plan.title}
                  </h3>
                  
                  <div style={{ 
                    fontSize: '2.2rem', 
                    fontWeight: '900', 
                    color: plan.color, 
                    margin: '16px 0', 
                    textAlign: 'center' 
                  }}>
                    {finalPrice} <span style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: '600' }}>/ {basePrices[region].curr}</span>
                  </div>

                  <ul style={{ 
                    listStyle: 'none', 
                    padding: '0', 
                    margin: '18px 0', 
                    borderTop: '1px dashed #1e293b', 
                    paddingTop: '16px' 
                  }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} style={{ 
                        color: '#cbd5e1', 
                        fontSize: '0.84rem', 
                        marginBottom: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                      }}>
                        <span style={{ color: plan.color, fontWeight: 'bold' }}>✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  type="button"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    background: isSelected ? plan.color : '#1e293b', 
                    color: isSelected ? (plan.id === 'monthly' ? '#0a0f1d' : '#fff') : '#94a3b8', 
                    border: 'none', 
                    fontWeight: '800', 
                    cursor: 'pointer',
                    transition: '0.2s',
                    fontSize: '0.85rem',
                    marginTop: '10px'
                  }}
                >
                  {isSelected 
                    ? (isRTL ? 'رخصتك المحشوة حالياً' : 'Current Selected') 
                    : (isRTL ? 'اختيار هذه الخطة' : 'Select Plan')}
                </button>
              </div>
            );
          })}
        </div>

        {/* قسم وسائل الدفع المعتمد والمنقح */}
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
