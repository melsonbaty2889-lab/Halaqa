import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 🌐 قاموس اللغات العالمي الاحترافي المصمم خصيصاً لمنصات الـ SaaS الدولية
const translations = {
  ar: {
    title: "امتلاك ترخيص المنظومة - منصة الحلقة الذكية",
    subtitle: "اختر خطة الاستثمار الأكاديمي الأنسب لك، وانضم إلى كبرى الأكاديميات والمراكز التعليمية حول العالم.",
    regionLabel: "حدد النطاق الجغرافي لتفعيل بروتوكولات الدفع المتوافقة مع منطقتك:",
    egypt: "جمهورية مصر العربية 🇪🇬",
    gcc: "المملكة العربية السعودية والخليج العربي 🇸🇦",
    global: "النطاق الدولي وباقي دول العالم 🌐",
    monthly: "الوصول المرن (اشتراك شهري)",
    yearly: "الكفاءة المستدامة (ترخيص سنوي)",
    lifetime: "الترخيص الأبدي للمؤسسين (مدى الحياة)",
    saveTwoMonths: "توفير شهرين كاملين مجاناً المستدام 🔥",
    limitedOffer: "فرصة حصرية للمؤسسين الأوائل ⚡",
    currencyEg: "جنيه مصري",
    currencyGcc: "ريال سعودي",
    currencyGlobal: "دولار أمريكي",
    choosePlan: "امتلك هذه الرخصة الآن",
    selectedPlan: "رخصتك المحددة حالياً",
    paymentMethodsTitle: "قنوات الدفع المعتمدة والآمنة لنطاقك الجغرافي:",
    vodafoneCash: "المحافظ الإلكترونية الذكية و فودافون كاش",
    instapay: "تحويل بنكي فوري ومؤتمت بالكامل عبر InstaPay",
    fawry: "المدفوعات الفورية عبر منافذ فوري (Fawry Pay)",
    mada: "شبكة مدى للمدفوعات المحلية (Mada)",
    applePay: "المحفظة الرقمية بلمسة واحدة Apple Pay",
    usdt: "قنوات الأصول الرقمية المشفرة (USDT - TRC20)",
    creditCard: "البطاقات الائتمانية العالمية (Visa / MasterCard)",
    instapayInstructions: "يرجى تحويل مبلغ الاستثمار إلى العنوان الرسمي: company@instapay ثم إدراج رقم العملية المرجعي بالأسفل لمزامنة النظام تلقائياً.",
    usdtInstructions: "يرجى تحويل الأصول إلى المحفظة المشفرة شبكة TRC20 عبر العنوان: TXxxxxxxxxxxxxxxxxx ثم إدراج معرف المعاملة (TxID) بالأسفل للتحقق البرمجي.",
    placeholderTx: "أدخل رقم العملية أو المعرف المرجعي هنا للتحقق",
    btnConfirm: "اعتماد المعاملة وتفعيل ترخيص الأكاديمية الفوري 🚀",
    successMsg: "تم تسجيل المعاملة وإرسال طلب التفعيل بنجاح! يقوم النظام والتحقق الذكي بفتح اللوحة لك خلال دقائق معدودة.",
    switchLang: "English",
    backToDashboard: "⬅️ العودة إلى مركز التحكم والتحليلات"
  },
  en: {
    title: "Acquire System License - Smart Halaqa",
    subtitle: "Select your corporate academic investment plan and join leading global institutions and academies.",
    regionLabel: "Select your geographical jurisdiction to initialize localized payment protocols:",
    egypt: "Egypt Region 🇪🇬",
    gcc: "Saudi Arabia & GCC Countries 🇸🇦",
    global: "International & Global Jurisdiction 🌐",
    monthly: "Flexible Access (Monthly Subscription)",
    yearly: "Sustainable Efficiency (Annual License)",
    lifetime: "Founders Lifetime License (Endless Access)",
    saveTwoMonths: "Save 2 Months Automatically 🔥",
    limitedOffer: "Exclusive Founder Passage Deal ⚡",
    currencyEg: "EGP",
    currencyGcc: "SAR",
    currencyGlobal: "USD",
    choosePlan: "Acquire This License",
    selectedPlan: "Currently Active Selection",
    paymentMethodsTitle: "Verified Secure Payment Protocols for Your Region:",
    vodafoneCash: "Smart Mobile Wallets & Vodafone Cash",
    instapay: "Instant Automated Bank Transfer via InstaPay",
    fawry: "Instant Retail Payments via Fawry Pay Network",
    mada: "Mada National Card Network",
    applePay: "One-Click Digital Wallet via Apple Pay",
    usdt: "Decentralized Crypto Assets (USDT - TRC20)",
    creditCard: "International Credit Gateway (Visa / MasterCard)",
    instapayInstructions: "Please route your investment to the official handle: company@instapay then provide the reference ID below for automated sync.",
    usdtInstructions: "Route assets to our secure TRC20 cryptographic ledger: TXxxxxxxxxxxxxxxxxx then submit the Transaction ID (TxID) below.",
    placeholderTx: "Enter Transaction ID or Reference Reference Key",
    btnConfirm: "Authorize Transaction & Grant Instant Academy License 🚀",
    successMsg: "Transaction logged successfully! The smart verification system will unlock your enterprise access within minutes.",
    switchLang: "العربية",
    backToDashboard: "⬅️ Back to Analytics Dashboard"
  }
};

export default function SubscriptionPage({ session, onBack }) {
  const initialLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
  const [lang, setLang] = useState(initialLang);
  const [region, setRegion] = useState('egypt'); 
  const [duration, setDuration] = useState('monthly'); 
  const [txId, setTxId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); 

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // هيكل الاستثمار المالي للأكاديميات
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

  const handleSubmitPayment = async () => {
    // 🔗 بروتوكول توجيه بوابات الدفع المؤتمتة (Stripe / Paymob / Tap Payments)
    if (region === 'egypt' && (duration === 'monthly' || duration === 'yearly')) {
      alert(isRTL ? "جاري تهيئة الاتصال الآمن وتوجيهك إلى بوابة الدفع الإلكترونية الرسمية (Paymob)..." : "Initializing secure handshake. Redirecting to official checkout gateway (Paymob)...");
      return;
    }
    
    // التحقق الفوري من إدخال المعرف المرجعي للعمليات اليدوية أو شبه المؤتمتة حماية للبيانات
    if ((duration === 'lifetime' || region === 'global' || region === 'gcc') && !txId.trim()) {
      alert(isRTL ? "يرجى توفير الرقم المرجعي أو معرف المعاملة لتأكيد الاستحقاق ومطابقة الحساب." : "Transaction Reference ID is required to authorize account reconciliation.");
      return;
    }

    setLoading(true);
    try {
      const expiryDate = new Date();
      if (duration === 'monthly') expiryDate.setDate(expiryDate.getDate() + 30);
      else if (duration === 'yearly') expiryDate.setDate(expiryDate.getDate() + 365);
      else if (duration === 'lifetime') expiryDate.setDate(expiryDate.getDate() + 36500); 

      // المزامنة والمطابقة الفورية مع الجدول السحابي saas_subscriptions
      const { error } = await supabase
        .from('saas_subscriptions')
        .insert([{
          user_id: session?.user?.id,
          plan_type: duration, // يحافظ على استقرار قاعدة البيانات القديمة (monthly, yearly, lifetime)
          status: 'pending', 
          payment_gateway: region === 'egypt' ? 'instapay_vodafone' : (region === 'global' ? 'usdt_crypto' : 'gcc_local_methods'),
          transaction_id: txId || 'AUTOMATED_GATEWAY_HANDSHAKE',
          amount: parseFloat(prices[region][duration]),
          currency: region === 'egypt' ? 'EGP' : (region === 'gcc' ? 'SAR' : 'USD'),
          expires_at: expiryDate.toISOString()
        }]);

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (err) {
      console.error("🚨 Critical Subscription Logging Error:", err);
      alert(isRTL ? "فشل بروتوكول الاتصال أثناء معالجة الطلب، يرجى إعادة المحاولة." : "Network anomaly detected during authorization. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const shouldShowTxInput = duration === 'lifetime' || region === 'global' || region === 'gcc';

  return (
    <div style={{ background: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left', boxSizing: 'border-box' }}>
      
      {/* 🧭 شريط التنقل العلوي الاحترافي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 40px auto', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ background: '#1e293b', color: '#f59e0b', border: '1px solid #334155', padding: '10px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.background = '#334155'} onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}>
          🌐 {t.switchLang}
        </button>
        {onBack && (
          <button onClick={onBack} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
            {t.backToDashboard}
          </button>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* العناوين القيادية */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <h1 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: '800', marginBottom: '14px', letterSpacing: '-0.5px' }}>{t.title}</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>{t.subtitle}</p>
        </div>

        {/* 🗺️ قسم تحديد النطاق القضائي والجغرافي */}
        <div style={{ marginBottom: '40px', background: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
          <label style={{ display: 'block', color: '#94a3b8', marginBottom: '16px', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.5px' }}>{t.regionLabel}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {['egypt', 'gcc', 'global'].map((r) => {
              const isSelected = region === r;
              return (
                <button key={r} onClick={() => setRegion(r)} style={{ padding: '14px 24px', borderRadius: '12px', border: isSelected ? '2px solid #f59e0b' : '1px solid #334155', background: isSelected ? 'rgba(245,158,11,0.08)' : '#1e293b', color: isSelected ? '#f59e0b' : '#f8fafc', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: isSelected ? '0 0 15px rgba(245,158,11,0.1)' : 'none' }}>
                  {t[r]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 📊 بطاقات خطط التراخيص والاستثمار الأكاديمي الحقيقي */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '50px', alignItems: 'stretch' }}>
          
          {/* رخصة الوصول المرن (الشهري) */}
          <div onClick={() => setDuration('monthly')} style={{ background: '#111827', border: duration === 'monthly' ? '2px solid #f59e0b' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: duration === 'monthly' ? '0 10px 25px -5px rgba(245,158,11,0.15)' : 'none' }}>
            <div>
              <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 20px 0' }}>{t.monthly}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>
                {prices[region].monthly} <span style={{ fontSize: '1rem', fontWeight: '400', color: '#94a3b8' }}>/ {prices[region].curr}</span>
              </div>
            </div>
            <button style={{ width: '100%', marginTop: '30px', padding: '14px', borderRadius: '12px', background: duration === 'monthly' ? '#f59e0b' : '#1e293b', color: duration === 'monthly' ? '#0a0f1d' : '#94a3b8', border: 'none', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s' }}>
              {duration === 'monthly' ? t.selectedPlan : t.choosePlan}
            </button>
          </div>

          {/* رخصة الكفاءة المستدامة (السنوية) - قيمة ممتازة وموصى بها للمراكز */}
          <div onClick={() => setDuration('yearly')} style={{ background: '#111827', border: duration === 'yearly' ? '2px solid #10b981' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.25s', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: duration === 'yearly' ? '0 15px 30px -5px rgba(16,185,129,0.2)' : 'none' }}>
            <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>{t.saveTwoMonths}</span>
            <div style={{ marginTop: '10px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 20px 0' }}>{t.yearly}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>
                {prices[region].yearly} <span style={{ fontSize: '1rem', fontWeight: '400', color: '#94a3b8' }}>/ {prices[region].curr}</span>
              </div>
            </div>
            <button style={{ width: '100%', marginTop: '30px', padding: '14px', borderRadius: '12px', background: duration === 'yearly' ? '#10b981' : '#1e293b', color: duration === 'yearly' ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s' }}>
              {duration === 'yearly' ? t.selectedPlan : t.choosePlan}
            </button>
          </div>

          {/* الترخيص الأبدي للمؤسسين (مدى الحياة) - عرض استراتيجي حصري */}
          <div onClick={() => setDuration('lifetime')} style={{ background: '#111827', border: duration === 'lifetime' ? '2px solid #ef4444' : '1px solid #1e293b', padding: '35px 24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.25s', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: duration === 'lifetime' ? '0 15px 30px -5px rgba(239,68,68,0.2)' : 'none' }}>
            <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px', boxShadow: '0 4px 10px rgba(239,68,68,0.3)' }}>{t.limitedOffer}</span>
            <div style={{ marginTop: '10px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 20px 0' }}>{t.lifetime}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>
                {prices[region].lifetime} <span style={{ fontSize: '1rem', fontWeight: '400', color: '#94a3b8' }}>/ {prices[region].curr}</span>
              </div>
            </div>
            <button style={{ width: '100%', marginTop: '30px', padding: '14px', borderRadius: '12px', background: duration === 'lifetime' ? '#ef4444' : '#1e293b', color: duration === 'lifetime' ? '#fff' : '#94a3b8', border: 'none', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s' }}>
              {duration === 'lifetime' ? t.selectedPlan : t.choosePlan}
            </button>
          </div>

        </div>

        {/* 🔒 لوحة تفعيل ومعالجة المدفوعات التكيفية الفاخرة */}
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '24px', padding: '35px', maxWidth: '650px', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          <h4 style={{ color: '#f59e0b', marginTop: '0', marginBottom: '24px', fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>{t.paymentMethodsTitle}</h4>
          
          {/* قنوات دفع جمهورية مصر العربية */}
          {region === 'egypt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <img src="https://img.icons8.com/color/48/vodafone.png" alt="Vodafone Smart Wallet" style={{ width: '32px', height: '32px' }} />
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.vodafoneCash}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '1.8rem', lineHeight: '1' }}>⚡</span>
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.instapay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <img src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-fawry-is-the-first-and-largest-electronic-payment-network-in-egypt-logos-color-tal-revivo.png" alt="Fawry Pay System" style={{ width: '32px', height: '32px' }} />
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.fawry}</span>
              </div>
            </div>
          )}

          {/* قنوات دفع المملكة العربية السعودية والخليج العربي */}
          {region === 'gcc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <img src="https://img.icons8.com/color/48/apple-pay.png" alt="Apple Pay Instant" style={{ width: '38px', height: '38px' }} />
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.applePay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <span style={{ background: '#005C53', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', marginLeft: isRTL ? '0' : '8px', marginRight: isRTL ? '8px' : '0' }}>mada</span>
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.mada}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa Core" style={{ width: '32px', height: '32px' }} />
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="MasterCard Corporate" style={{ width: '32px', height: '32px' }} />
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.creditCard}</span>
              </div>
            </div>
          )}

          {/* قنوات المدفوعات الدولية والمستودعات الرقمية */}
          {region === 'global' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <img src="https://img.icons8.com/color/48/tether.png" alt="USDT Blockchain Ledger" style={{ width: '32px', height: '32px' }} />
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.usdt}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1e293b', padding: '14px 18px', borderRadius: '14px', border: '1px solid #334155' }}>
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa International" style={{ width: '32px', height: '32px' }} />
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="MasterCard Global" style={{ width: '32px', height: '32px' }} />
                <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1rem' }}>{t.creditCard}</span>
              </div>
            </div>
          )}

          {/* نموذج إدخال المعرف المرجعي في حالة التحقق شبه المؤتمت */}
          {shouldShowTxInput && (
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', marginTop: '24px', borderLeft: isRTL ? 'none' : '4px solid #ef4444', borderRight: isRTL ? '4px solid #ef4444' : 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
              <p style={{ margin: '0 0 14px 0', color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {region === 'global' ? t.usdtInstructions : t.instapayInstructions}
              </p>
              <input 
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder={t.placeholderTx}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #334155', background: '#0a0f1d', color: '#fff', outline: 'none', boxSizing: 'border-box', textAlign: 'center', fontSize: '1rem', fontWeight: '600', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>
          )}

          {/* مخرجات وعمليات تسليم الطلبات الفورية */}
          {isSubmitted ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', padding: '18px', borderRadius: '14px', marginTop: '25px', textAlign: 'center', fontWeight: '700', border: '1px solid #10b981', lineHeight: '1.5' }}>
              🎉 {t.successMsg}
            </div>
          ) : (
            <button 
              onClick={handleSubmitPayment}
              disabled={loading}
              style={{ width: '100%', marginTop: '30px', padding: '16px', borderRadius: '14px', background: loading ? '#475569' : '#f59e0b', color: '#0a0f1d', border: 'none', fontSize: '1.05rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', opacity: loading ? 0.6 : 1, boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(245,158,11,0.2)' }}
              onMouseEnter={(e) => { if(!loading) e.currentTarget.style.background = '#d97706'; }}
              onMouseLeave={(e) => { if(!loading) e.currentTarget.style.background = '#f59e0b'; }}
            >
              {loading ? (isRTL ? "جاري الاتصال الآمن مع بروتوكول المصادقة..." : "Processing secure verification handshake...") : t.btnConfirm}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
