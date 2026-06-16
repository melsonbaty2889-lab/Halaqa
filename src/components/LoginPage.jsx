import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa';

export default function LoginPage({ onSwitchToSignUp, onSwitchToForgotPassword }) {
  // 🌐 استخراج تابع الترجمة والتحكم باللغات
  const { t, i18n } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 📐 إدارة اتجاه الواجهة بناءً على اللغة المحددة
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  // 🧠 دالة الترجمة الذكية: تقرأ من ملف i18n، وإذا لم تجد الكلمة تترجمها فورياً
  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  // 🔄 دالة التبديل الفوري للغة
  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  // دالة تسجيل الدخول الأساسية (تم تحديثها لترجمة رسائل الأخطاء القادمة من السيرفر)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      // 💡 الميكانيكية الذكية لفحص رسالة الخطأ وترجمتها فورياً بناءً على لغة الواجهة الحالية
      if (error.message === "Email not confirmed") {
        setErrorMsg(
          isRtl 
            ? "يرجى تأكيد بريدك الإلكتروني أولاً! تحقق من صندوق الوارد أو مجلد الـ Spam لتفعيل حسابك." 
            : "Email not confirmed. Please check your inbox or spam folder to verify your account."
        );
      } else if (error.message === "Invalid login credentials") {
        setErrorMsg(
          isRtl 
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى إعادة التحقق." 
            : "Invalid email or password. Please check your credentials."
        );
      } else {
        // تمرير أي رسائل أخطاء أخرى قادمة من النظام بطبيعتها الإفتراضية
        setErrorMsg(error.message);
      }
      setLoading(false);
    } else {
      window.location.reload(); // إعادة تحميل لمزامنة الحالة
    }
  };

  // دالة تسجيل الدخول بواسطة جوجل (بدون المساس بالبنية الأصلية)
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0C1520', 
      padding: '20px', 
      fontFamily: "'Cairo', sans-serif",
      direction: isRtl ? 'rtl' : 'ltr', // قلب الصفحة كاملاً بناءً على اللغة
      position: 'relative'
    }}>
      
      {/* 🌐 زر تغيير اللغة الاحترافي العائم في أعلى الشاشة */}
      <button 
        onClick={toggleLanguage}
        style={{
          position: 'absolute',
          top: '20px',
          right: isRtl ? 'auto' : '20px',
          left: isRtl ? '20px' : 'auto',
          background: '#111C2A',
          border: '1px solid #334155',
          color: '#C9A84C',
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <FaGlobe />
        <span>{currentLang === 'ar' ? 'English' : 'العربية'}</span>
      </button>

          <div style={{ width: '100%', maxWidth: '400px', background: '#111C2A', padding: '40px', borderRadius: '24px', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#C9A84C', fontSize: '1.8rem', margin: '0 0 10px 0' }}>
            {translateText('signIn', 'تسجيل الدخول', 'Sign In')}
          </h2>
          <p style={{ color: '#94a3b8' }}>
            {translateText('welcome', 'مرحباً بك في الحلقة الذكية', 'Welcome to Smart Halaqa')}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* حقل البريد الإلكتروني المطور */}
          <div style={{ position: 'relative' }}>
            <FaEnvelope style={{ 
              position: 'absolute', 
              right: isRtl ? '15px' : 'auto', 
              left: !isRtl ? '15px' : 'auto', 
              top: '15px', 
              color: '#64748b' 
            }} />
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={translateText('email', 'البريد الإلكتروني', 'Email Address')} 
              
              // 🌟 إضافة الترجمة الديناميكية للتنبيه
              onInvalid={(e) => e.target.setCustomValidity(translateText('fieldRequired', 'هذا الحقل مطلوب ولا يمكن تركه فارغاً', 'This field is required'))}
              onInput={(e) => e.target.setCustomValidity('')}
              
              style={{ 
                width: '100%', 
                padding: isRtl ? '14px 40px 14px 14px' : '14px 14px 14px 40px', 
                borderRadius: '12px', 
                border: '1px solid #334155', 
                background: '#162030', 
                color: '#fff', 
                boxSizing: 'border-box',
                outline: 'none'
              }} 
            />
          </div>
          
          {/* حقل كلمة المرور المطور */}
          <div style={{ position: 'relative' }}>
            <FaLock style={{ 
              position: 'absolute', 
              right: isRtl ? '15px' : 'auto', 
              left: !isRtl ? '15px' : 'auto', 
              top: '15px', 
              color: '#64748b' 
            }} />
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={translateText('password', 'كلمة المرور', 'Password')} 
              
              // 🌟 إضافة الترجمة الديناميكية للتنبيه
              onInvalid={(e) => e.target.setCustomValidity(translateText('fieldRequired', 'هذا الحقل مطلوب ولا يمكن تركه فارغاً', 'This field is required'))}
              onInput={(e) => e.target.setCustomValidity('')}
              
              style={{ 
                width: '100%', 
                padding: isRtl ? '14px 40px 14px 14px' : '14px 14px 14px 40px', 
                borderRadius: '12px', 
                border: '1px solid #334155', 
                background: '#162030', 
                color: '#fff', 
                boxSizing: 'border-box',
                outline: 'none'
              }} 
            />
          </div>

          <button type="button" onClick={onSwitchToForgotPassword} style={{ 
            background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', 
            alignSelf: 'flex-start' 
          }}>
            {translateText('forgotPassword', 'نسيت كلمة المرور؟', 'Forgot Password?')}
          </button>

          <button type="submit" disabled={loading} style={{ padding: '14px', background: '#C9A84C', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? translateText('loading', 'جاري التحقق...', 'Signing in...') : translateText('signIn', 'تسجيل الدخول', 'Sign In')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
          {translateText('or', 'أو', 'OR')}
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
        </div>

        <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '14px', background: '#fff', color: '#1E293B', border: 'none', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
          <FaGoogle color="#DB4437" /> {translateText('signInWithGoogle', 'الدخول بواسطة جوجل', 'Sign in with Google')}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onSwitchToSignUp} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontWeight: '600' }}>
            {translateText('createAccount', 'إنشاء حساب معلم/مشرف', 'Create Teacher/Admin Account')}
          </button>
        </div>
      </div>
    </div>
  );
}
