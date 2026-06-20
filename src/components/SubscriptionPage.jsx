import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 🌐 قاموس الترجمة الذكي للغات (العربية والإنجليزية كبديل عالمي لكل لغات العالم)
const translations = {
  ar: {
    title: "ترقية الحساب - منصة الحلقة الذكية",
    subtitle: "اختر الخطة المناسبة لك وانضم إلى مئات المعلمين حول العالم العربي",
    regionLabel: "اختر منطقتك الجغرافية لعرض وسائل الدفع المحلية:",
    egypt: "جمهورية مصر العربية 🇪🇬",
    gcc: "المملكة العربية السعودية والخليج 🇸🇦",
    global: "باقي دول العالم وآسيا وأفريقيا 🌐",
    monthly: "الاشتراك الشهري",
    yearly: "الاشتراك السنوي",
    lifetime: "باقة المؤسسين (مدى الحياة)",
    saveTwoMonths: "توفير شهرين مجاناً 🔥",
    limitedOffer: "عرض محدود جداً ⚡",
    currencyEg: "جنيه مصري",
    currencyGcc: "ريال سعودي",
    currencyGlobal: "دولار أمريكي",
    choosePlan: "اختر هذه الخطة",
    selectedPlan: "الباقة المختارة حالياً",
    paymentMethodsTitle: "طرق الدفع المتاحة لمنطقتك:",
    vodafoneCash: "محفظة فودافون كاش / المحافظ الإلكترونية",
    instapay: "تحويل سريع عبر InstaPay (شبه مؤتمت)",
    fawry: "دفع عبر كشك فوري (رقم مرجعي)",
    mada: "بطاقات مدى المحلية (Mada)",
    applePay: "الدفع بلمسة واحدة عبر Apple Pay",
    usdt: "العملات الرقمية المشفرة (USDT - TRC20)",
    creditCard: "البطاقات الائتمانية الدولية (Visa / MasterCard)",
    instapayInstructions: "قم بالتحويل إلى عنوان الانستا باي: company@instapay ثم أدخل رقم العملية بالأسفل ليتأكد النظام تلقائياً.",
    usdtInstructions: "قم بتحويل المبلغ إلى شبكة TRC20 على العنوان: TXxxxxxxxxxxxxxxxxx ثم أدخل رقم المعاملة السري بالأسفل.",
    placeholderTx: "أدخل رقم العملية أو المعرف هنا",
    btnConfirm: "تأكيد الدفع وإرسال للطلب للمراجعة الفورية 🚀",
    successMsg: "تم إرسال طلب تفعيل حسابك بنجاح! سيقوم الدعم الفني بمراجعته وفتح اللوحة لك خلال دقائق.",
    switchLang: "English"
  },
  en: {
    title: "Upgrade Your Account - Smart Halaqa",
    subtitle: "Choose the perfect plan and join hundreds of educators worldwide",
    regionLabel: "Select your geographical region for local payment options:",
    egypt: "Egypt 🇪🇬",
    gcc: "Saudi Arabia & GCC 🇸🇦",
    global: "Rest of the World / Asia / Africa 🌐",
    monthly: "Monthly Subscription",
    yearly: "Annual Subscription",
    lifetime: "Founders Deal (Lifetime)",
    saveTwoMonths: "Save 2 Months Free 🔥",
    limitedOffer: "Highly Limited Offer ⚡",
    currencyEg: "EGP",
    currencyGcc: "SAR",
    currencyGlobal: "USD",
    choosePlan: "Choose This Plan",
    selectedPlan: "Currently Selected",
    paymentMethodsTitle: "Available Payment Methods For Your Region:",
    vodafoneCash: "Vodafone Cash / Mobile Wallets",
    instapay: "Fast Transfer via InstaPay",
    fawry: "Fawry Pay (Reference Number)",
    mada: "Mada Local Cards",
    applePay: "One-Click Apple Pay",
    usdt: "Crypto Currency (USDT - TRC20)",
    creditCard: "International Credit Cards (Visa / MasterCard)",
    instapayInstructions: "Transfer to InstaPay Address: company@instapay then enter the transaction ID below.",
    usdtInstructions: "Send USDT to TRC20 Address: TXxxxxxxxxxxxxxxxxx then enter the transaction ID below.",
    placeholderTx: "Enter Transaction ID or Reference here",
    btnConfirm: "Confirm Payment & Activate Account 🚀",
    successMsg: "Your activation request has been sent! Our system will verify and open your dashboard within minutes.",
    switchLang: "العربية"
  }
};

export default function SubscriptionPage({ session, onBack }) {
  const initialLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
  const [lang, setLang] = useState(initialLang);
  const [region, setRegion] = useState('egypt'); 
  const [duration, setDuration] = useState('monthly'); 
  const [txId, setTxId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // [إضافة اليوم] حالة الانتظار لحماية البيانات

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const prices = {
    egypt: { monthly: "150", yearly: "1500", lifetime: "3500", curr: t.currencyEg },
    gcc: { monthly: "50", yearly: "500", lifetime: "1200", curr: t.currencyGcc },
    global: { monthly: "15", yearly: "150", lifetime: "300", curr: t.currencyGlobal }
  };

  useEffect(() => {
    const userLoc = navigator.language;
    if (userLoc.includes('SA') || userLoc.includes('KW') || userLoc.includes('AE') || userLoc.includes('QA') || userLoc.includes('BH') || userLoc.includes('OM')) {
      setRegion('gcc');
    } else if (userLoc.includes('EG')) {
      setRegion('egypt');
    } else {
      if (initialLang === 'en') setRegion('global');
    }
  }, []);

  // [تطوير الدالة] للربط الفعلي بقاعدة البيانات وحفظ العمليات
  const handleSubmitPayment = async () => {
    // 1. إذا كان الدفع في مصر شهري أو سنوي يتم التوجيه لـ Paymob (مستقبلاً)
    if (region === 'egypt' && (duration === 'monthly' || duration === 'yearly')) {
      alert(isRTL ? "جاري توجيهك بأمان إلى بوابة الدفع الإلكترونية الرسمية..." : "Redirecting securely to the official payment gateway...");
      return;
    }
    
    // 2. التحقق من إدخال رقم المعاملة للوسائل اليدوية وشبه المؤتمتة
    if ((duration === 'lifetime' || region === 'global' || region === 'gcc') && !txId.trim()) {
      alert(isRTL ? "الرجاء إدخال رقم العملية أو المعرف لتأكيد التحويل" : "Please enter the Transaction ID to confirm transfer");
      return;
    }

    setLoading(true);
    try {
      // حساب تاريخ انتهاء الاشتراك تلقائياً حسب نوع الباقة
      const expiryDate = new Date();
      if (duration === 'monthly') expiryDate.setDate(expiryDate.getDate() + 30);
      else if (duration === 'yearly') expiryDate.setDate(expiryDate.getDate() + 365);
      else if (duration === 'lifetime') expiryDate.setDate(expiryDate.getDate() + 36500); // مدى الحياة (100 عام)

      // إرسال الطلب وحفظه داخل جدول saas_subscriptions السحابي
      const { error } = await supabase
        .from('saas_subscriptions')
        .insert([{
          user_id: session?.user?.id,
          plan_type: duration,
          status: 'pending', // ينتظر موافقتك اليدوية كـ Admin
          payment_gateway: region === 'egypt' ? 'instapay_vodafone' : (region === 'global' ? 'usdt_crypto' : 'gcc_local_methods'),
          transaction_id: txId || 'ONLINE_GATEWAY_ATTEMPT',
          amount: parseFloat(prices[region][duration]),
          currency: region === 'egypt' ? 'EGP' : (region === 'gcc' ? 'SAR' : 'USD'),
          expires_at: expiryDate.toISOString()
        }]);

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (err) {
      console.error("🚨 خطأ أثناء رفع طلب الاشتراك:", err);
      alert(isRTL ? "حدث خطأ أثناء حفظ طلبك، يرجى المحاولة مجدداً" : "Error saving your request, please try again");
    } finally {
      setLoading(false);
    }
  };

  // تحديد متى يجب عرض حقل رقم العملية (يظهر في باقة مدى الحياة، أو أي باقة خارج بوابات مصر المؤتمتة)
  const shouldShowTxInput = duration === 'lifetime' || region === 'global' || region === 'gcc';

  return (
    <div style={{ background: '#090F17', color: '#FFF', minHeight: '100vh', padding: '30px 20px', fontFamily: 'sans-serif', direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left', boxSizing: 'border-box' }}>
      
      {/* شريط الرأس العلوي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto 30px auto', borderBottom: '1px solid #1F2937', paddingBottom: '15px' }}>
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ background: '#1F2937', color: '#FBBF24', border: '1px solid #374151', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          {t.switchLang}
        </button>
        {onBack && (
          <button onClick={onBack} style={{ background: 'transparent', color: '#9CA3AF', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
            {isRTL ? '⬅️ العودة للوحة التحكم' : '⬅️ Back to Dashboard'}
          </button>
        )}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#FBBF24', fontSize: '2rem', marginBottom: '10px' }}>{t.title}</h1>
        <p style={{ color: '#9CA3AF', fontSize: '1rem', marginBottom: '35px' }}>{t.subtitle}</p>

        {/* 🗺️ قسم تحديد المنطقة الجغرافية */}
        <div style={{ marginBottom: '35px', background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '12px', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.regionLabel}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {['egypt', 'gcc', 'global'].map((r) => (
              <button key={r} onClick={() => setRegion(r)} style={{ padding: '12px 20px', borderRadius: '8px', border: region === r ? '2px solid #FBBF24' : '1px solid #374151', background: region === r ? 'rgba(251,191,36,0.1)' : '#1F2937', color: region === r ? '#FBBF24' : '#FFF', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>
                {t[r]}
              </button>
            ))}
          </div>
        </div>

        {/* 📊 بطاقات خطط الأسعار الثلاثة المعتمدة عالمياً ومحلياً */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          {/* الخطة الأولى: الشهري */}
          <div onClick={() => setDuration('monthly')} style={{ background: '#111827', border: duration === 'monthly' ? '2px solid #FBBF24' : '1px solid #1F2937', padding: '30px 20px', borderRadius: '16px', cursor: 'pointer', transition: '0.3s', position: 'relative' }}>
            <h3 style={{ color: '#FFF', fontSize: '1.3rem', margin: '0 0 15px 0' }}>{t.monthly}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FBBF24', marginBottom: '5px' }}>
              {prices[region].monthly} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#9CA3AF' }}>/ {prices[region].curr}</span>
            </div>
            <button style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '8px', background: duration === 'monthly' ? '#FBBF24' : '#1F2937', color: duration === 'monthly' ? '#090F17' : '#9CA3AF', border: 'none', fontWeight: 'bold' }}>
              {duration === 'monthly' ? t.selectedPlan : t.choosePlan}
            </button>
          </div>

          {/* الخطة الثانية: السنوي (التوفير والأكثر طلباً) */}
          <div onClick={() => setDuration('yearly')} style={{ background: '#111827', border: duration === 'yearly' ? '2px solid #10B981' : '1px solid #1F2937', padding: '30px 20px', borderRadius: '16px', cursor: 'pointer', transition: '0.3s', position: 'relative', boxShadow: duration === 'yearly' ? '0 0 15px rgba(16,185,129,0.2)' : 'none' }}>
            <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: '#FFF', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{t.saveTwoMonths}</span>
            <h3 style={{ color: '#FFF', fontSize: '1.3rem', margin: '0 0 15px 0' }}>{t.yearly}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981', marginBottom: '5px' }}>
              {prices[region].yearly} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#9CA3AF' }}>/ {prices[region].curr}</span>
            </div>
            <button style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '8px', background: duration === 'yearly' ? '#10B981' : '#1F2937', color: duration === 'yearly' ? '#FFF' : '#9CA3AF', border: 'none', fontWeight: 'bold' }}>
              {duration === 'yearly' ? t.selectedPlan : t.choosePlan}
            </button>
          </div>

          {/* الخطة الثالثة: باقة المؤسسين مدى الحياة */}
          <div onClick={() => setDuration('lifetime')} style={{ background: '#111827', border: duration === 'lifetime' ? '2px solid #EF4444' : '1px solid #1F2937', padding: '30px 20px', borderRadius: '16px', cursor: 'pointer', transition: '0.3s', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: '#FFF', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{t.limitedOffer}</span>
            <h3 style={{ color: '#FFF', fontSize: '1.3rem', margin: '0 0 15px 0' }}>{t.lifetime}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EF4444', marginBottom: '5px' }}>
              {prices[region].lifetime} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#9CA3AF' }}>/ {prices[region].curr}</span>
            </div>
            <button style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '8px', background: duration === 'lifetime' ? '#EF4444' : '#1F2937', color: duration === 'lifetime' ? '#FFF' : '#9CA3AF', border: 'none', fontWeight: 'bold' }}>
              {duration === 'lifetime' ? t.selectedPlan : t.choosePlan}
            </button>
          </div>

        </div>

        {/* 🔒 شاشة استقبال وتأكيد الدفع الديناميكية المحدثة بالشعارات والأيقونات */}
        <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '16px', padding: '30px', maxWidth: '600px', margin: '0 auto', textAlign: isRTL ? 'right' : 'left' }}>
          <h4 style={{ color: '#FBBF24', marginTop: '0', marginBottom: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>{t.paymentMethodsTitle}</h4>
          
          {/* 📱 عرض وسائل الدفع المخصصة لمصر بالشعارات */}
          {region === 'egypt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <img src="https://img.icons8.com/color/48/vodafone.png" alt="Vodafone" style={{ width: '30px', height: '30px' }} />
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.vodafoneCash}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <span style={{ fontSize: '1.6rem' }}>⚡</span>
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.instapay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <img src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-fawry-is-the-first-and-largest-electronic-payment-network-in-egypt-logos-color-tal-revivo.png" alt="Fawry" style={{ width: '30px', height: '30px' }} />
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.fawry}</span>
              </div>
            </div>
          )}

          {/* 🇸🇦 عرض وسائل الدفع المخصصة للخليج بالشعارات */}
          {region === 'gcc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <img src="https://img.icons8.com/color/48/apple-pay.png" alt="Apple Pay" style={{ width: '35px', height: '35px' }} />
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.applePay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <span style={{ background: '#005C53', color: '#FFF', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginLeft: isRTL ? '0' : '5px', marginRight: isRTL ? '5px' : '0' }}>mada</span>
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.mada}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" style={{ width: '30px', height: '30px' }} />
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="MasterCard" style={{ width: '30px', height: '30px' }} />
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.creditCard}</span>
              </div>
            </div>
          )}

          {/* 🌐 عرض وسائل الدفع الدولية بالشعارات */}
          {region === 'global' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <img src="https://img.icons8.com/color/48/tether.png" alt="USDT" style={{ width: '30px', height: '30px' }} />
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.usdt}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1F2937', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151' }}>
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" style={{ width: '30px', height: '30px' }} />
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="MasterCard" style={{ width: '30px', height: '30px' }} />
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '0.95rem' }}>{t.creditCard}</span>
              </div>
            </div>
          )}

          {/* التعليمات في حالة التحويل اليدوي/الشبه مؤتمت بناء على الشرط المطور */}
          {shouldShowTxInput && (
            <div style={{ background: '#1F2937', padding: '15px', borderRadius: '8px', marginTop: '20px', fontSize: '0.9rem', borderLeft: isRTL ? 'none' : '4px solid #EF4444', borderRight: isRTL ? '4px solid #EF4444' : 'none' }}>
              <p style={{ margin: '0 0 10px 0', color: '#9CA3AF', lineHeight: '1.6' }}>
                {region === 'global' ? t.usdtInstructions : t.instapayInstructions}
              </p>
              <input 
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder={t.placeholderTx}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #374151', background: '#090F17', color: '#FFF', outline: 'none', boxSizing: 'border-box', textAlign: 'center', fontSize: '1rem' }}
              />
            </div>
          )}

          {isSubmitted ? (
            <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '15px', borderRadius: '8px', marginTop: '20px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #10B981' }}>
              {t.successMsg}
            </div>
          ) : (
            <button 
              onClick={handleSubmitPayment}
              disabled={loading}
              style={{ width: '100%', marginTop: '25px', padding: '14px', borderRadius: '8px', background: loading ? '#4B5563' : '#FBBF24', color: '#090F17', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (isRTL ? "جاري معالجة ورفع طلبك..." : "Processing...") : t.btnConfirm}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
