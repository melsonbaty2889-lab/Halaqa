// src/components/SaaS/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// استيراد المكونات المقسمة النظيفة
import RegionSelector from './components/RegionSelector';
import PromoCodeInput from './components/PromoCodeInput';
import PlanCard from './components/PlanCard';
import SubscriptionStatus from './components/SubscriptionStatus';
import PaymentSection from '../SaaS/PaymentSection';

export default function SubscriptionPage({ lang = 'ar' }) {
  const isRTL = lang === 'ar';

  // الحالات العامة
  const [selectedPlan, setSelectedPlan] = useState('lifetime');
  const [region, setRegion] = useState('egypt');
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);
  
  // حالات الطلب والدفع
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);

  // جلب حالة اشتراك المستخدم الحالية والربط مع Realtime
  useEffect(() => {
    let subscriptionChannel;

    const fetchSubscriptionStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // جلب بيانات الاشتراك من جدول profiles أو subscriptions
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, plan_type')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserSubscription(data);
      }

      // الاستماع للتحديثات اللحظية Realtime
      subscriptionChannel = supabase
        .channel(`public:profiles:id=eq.${user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${user.id}` 
        }, (payload) => {
          setUserSubscription(payload.new);
        })
        .subscribe();
    };

    fetchSubscriptionStatus();

    return () => {
      if (subscriptionChannel) supabase.removeChannel(subscriptionChannel);
    };
  }, []);

  // بيانات خطط الأسعار والعملات
  const currency = region === 'egypt' ? (isRTL ? 'ج.م' : 'EGP') : (region === 'gcc' ? (isRTL ? 'ر.س' : 'SAR') : '$');

  const basePrices = {
    monthly: region === 'egypt' ? 350 : (region === 'gcc' ? 85 : 25),
    yearly: region === 'egypt' ? 2900 : (region === 'gcc' ? 750 : 200),
    lifetime: region === 'egypt' ? 6500 : (region === 'gcc' ? 1600 : 450)
  };

  const plans = [
    {
      id: 'monthly',
      title: isRTL ? 'الاشتراك الشهري' : 'Monthly Plan',
      price: basePrices.monthly,
      color: '#3b82f6',
      features: [
        isRTL ? 'دعم فني مباشر على مدار الساعة' : '24/7 Dedicated Support',
        isRTL ? 'تحديثات النظام المستمرة' : 'Continuous System Updates',
        isRTL ? 'إدارة حتى 100 طالب' : 'Up to 100 Students',
      ]
    },
    {
      id: 'yearly',
      title: isRTL ? 'الاشتراك السنوي' : 'Yearly Plan',
      price: basePrices.yearly,
      color: '#10b981',
      badge: isRTL ? 'الأكثر شعبية (توفير 30%)' : 'Most Popular (Save 30%)',
      badgeBg: '#10b981',
      features: [
        isRTL ? 'كل مميزات الخطة الشهرية' : 'All Monthly Features',
        isRTL ? 'عدد طلاب غير محدود' : 'Unlimited Students',
        isRTL ? 'نسخ احتياطي يومي تلقائي' : 'Automatic Daily Backups',
        isRTL ? 'تقارير أداء متقدمة' : 'Advanced Performance Analytics'
      ]
    },
    {
      id: 'lifetime',
      title: isRTL ? 'الترخيص المدى الحياة' : 'Lifetime Access',
      price: basePrices.lifetime,
      color: '#f59e0b',
      badge: isRTL ? 'العرض الأفضل' : 'Best Value',
      badgeBg: '#f59e0b',
      features: [
        isRTL ? 'دفع مرة واحدة ومدى الحياة' : 'One-time Payment, Lifetime Use',
        isRTL ? 'جميع الميزات الحالية والمستقبلية' : 'All Current & Future Features',
        isRTL ? 'دعم الأولوية القصوى (VIP)' : 'VIP Priority Support',
        isRTL ? 'ربط اسم نطاق خاص (Custom Domain)' : 'Custom Domain Integration'
      ]
    }
  ];

  // تطبيق كود الخصم
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === 'S20' || code === 'HALAQA20') {
      setAppliedDiscount(20);
      setCouponMessage({ type: 'success', text: isRTL ? 'تم تطبيق خصم 20% بنجاح!' : '20% Discount applied!' });
    } else if (code === 'VIP50') {
      setAppliedDiscount(50);
      setCouponMessage({ type: 'success', text: isRTL ? 'تم تطبيق خصم VIP 50%!' : '50% VIP Discount applied!' });
    } else {
      setAppliedDiscount(0);
      setCouponMessage({ type: 'error', text: isRTL ? 'كود الخصم غير صحيح أو منتهي' : 'Invalid promo code' });
    }
  };

  // رفع الإشعار وإرسال الطلب
  const handlePaymentSubmit = async (methodId, isManual, receiptFile) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let receiptUrl = null;

      // 1. رفع الصورة إلى Supabase Storage إذا وُجدت
      if (isManual && receiptFile && user) {
        const fileExt = receiptFile.name.split('.').pop();
        const filePath = `receipts/${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('saas-receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('saas-receipts')
          .getPublicUrl(filePath);

        receiptUrl = urlData.publicUrl;
      }

      // 2. تسجيل الطلب في قاعدة البيانات
      if (user) {
        await supabase.from('subscriptions').insert([{
          user_id: user.id,
          plan_id: selectedPlan,
          region,
          payment_method: methodId,
          transaction_ref: txId,
          receipt_url: receiptUrl,
          status: isManual ? 'pending_verification' : 'active'
        }]);

        // تحديث حالة ملف المستخدم
        await supabase.from('profiles').update({
          subscription_status: isManual ? 'pending_verification' : 'active',
          plan_type: selectedPlan
        }).eq('id', user.id);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Payment Submission Error:', err);
      alert(isRTL ? 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.' : 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* رأس الصفحة */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mb-3 tracking-tight">
            {isRTL ? 'اختر الخطة المناسبة لمنظومتك' : 'Choose Your Subscription Plan'}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            {isRTL 
              ? 'احصل على وصول كامل لأدوات إدارة الحلقات، المتابعة المباشرة، والشهادات الرقمية بكل سهولة.' 
              : 'Unlock full features for academy management, live tracking, and verified certification.'}
          </p>
        </div>

        {/* شريط حالة الاشتراك الحالية */}
        <SubscriptionStatus 
          status={userSubscription?.subscription_status} 
          isRTL={isRTL} 
        />

        {/* محدد النطاق الجغرافي */}
        <RegionSelector 
          region={region} 
          setRegion={setRegion} 
          isRTL={isRTL} 
        />

        {/* حقل كود الخصم */}
        <PromoCodeInput 
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          handleApplyCoupon={handleApplyCoupon}
          couponMessage={couponMessage}
          isRTL={isRTL}
        />

        {/* كروت خطط الأسعار */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((p) => {
            const calculatedPrice = appliedDiscount > 0 
              ? Math.round(p.price * (1 - appliedDiscount / 100)) 
              : p.price;

            return (
              <PlanCard 
                key={p.id}
                plan={p}
                isSelected={selectedPlan === p.id}
                onSelect={() => setSelectedPlan(p.id)}
                finalPrice={calculatedPrice}
                currency={currency}
                isRTL={isRTL}
              />
            );
          })}
        </div>

        {/* قسم الدفع وتحويل الأموال */}
        <PaymentSection 
          region={region}
          txId={txId}
          setTxId={setTxId}
          isSubmitted={isSubmitted}
          loading={loading}
          onSubmit={handlePaymentSubmit}
          isRTL={isRTL}
        />

      </div>
    </div>
  );
}
