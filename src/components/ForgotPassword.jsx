import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Loader2, Globe, CheckCircle2, RefreshCw } from 'lucide-react';

const SmartHalaqaProLogo = ({ size = 52 }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '14px',
    background: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
    border: '1px solid rgba(45, 212, 191, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(15, 118, 110, 0.35)',
    flexShrink: 0
  }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradForgot" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="emeraldGradForgot" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12" stroke="url(#goldGradForgot)" strokeWidth="1.8" />
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#emeraldGradForgot)" stroke="#fef08a" strokeWidth="0.8" />
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#emeraldGradForgot)" stroke="#fef08a" strokeWidth="0.8" />
    </svg>
  </div>
);

export default function ForgotPassword({ onBackToLogin }) {
  const { i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState({ type: null, msg: '' });

  const isRtl = i18n?.language === 'ar';

  useEffect(() => {
    document.title = isRtl ? 'استعادة كلمة المرور | الحلقة الذكية' : 'Reset Password | Smart Halaqa';
  }, [isRtl]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) i18n.changeLanguage(nextLang);
  };

  const handleReset = async (e) => {
    e?.preventDefault();
    if (!email.trim() || cooldown > 0) return;

    setLoading(true);
    setStatus({ type: null, msg: '' });

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}?lang=${i18n?.language || 'ar'}`,
    });

    if (error) {
      let errorMsg = error.message;
      if (isRtl) {
        if (error.message.includes('User not found')) errorMsg = 'البريد الإلكتروني غير مسجل لدينا.';
        else if (error.message.includes('Rate limit')) errorMsg = 'تم إرسال طلبات كثيرة، يرجى الانتظار قليلاً.';
        else errorMsg = 'حدث خطأ أثناء الاتصال بالخادم.';
      }
      setStatus({ type: 'error', msg: errorMsg });
    } else {
      setIsSubmitted(true);
      setCooldown(60);
    }
    setLoading(false);
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'radial-gradient(circle at 50% 25%, rgba(15, 118, 110, 0.18) 0%, #070C12 70%)', 
        padding: '60px 20px 40px 20px', 
        fontFamily: "'Cairo', sans-serif", 
        boxSizing: 'border-box'
      }} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <style>{`
        input:-webkit-autofill { -webkit-text-fill-color: #ffffff !important; -webkit-box-shadow: 0 0 0px 1000px #090F16 inset !important; }
        .form-input-field { width: 100%; padding: 14px 42px; border-radius: 10px; border: 1px solid #223147; background: #090F16; color: #ffffff; font-size: 14px; outline: none; box-sizing: border-box; }
        .form-input-field:focus { border-color: #D97706 !important; box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.2) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>

      <button
        type="button"
        onClick={toggleLanguage}
        style={{ position: 'fixed', top: '20px', [isRtl ? 'left' : 'right']: '20px', background: '#0F172A', border: '1px solid #1E293B', color: '#CBD5E1', padding: '8px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', zIndex: 50 }}
      >
        <Globe size={14} color="#D97706" />
        <span>{isRtl ? 'English' : 'العربية'}</span>
      </button>

      <div style={{ width: '100%', maxWidth: '420px', background: '#0F172A', padding: '35px 25px 30px 25px', borderRadius: '20px', border: '1px solid #1E293B', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <SmartHalaqaProLogo size={52} />
          <h1 style={{ color: '#F8FAFC', fontSize: '22px', fontWeight: 'bold', margin: '12px 0 4px 0' }}>
            {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
          </h1>
          <p style={{ color: '#D97706', fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', margin: 0, textTransform: 'uppercase' }}>
            {isRtl ? 'منصة إدارة المقارئ والأكاديميات' : 'ACADEMY MANAGEMENT PLATFORM'}
          </p>
        </div>

        {!isSubmitted ? (
          <>
            <h2 style={{ color: '#E2E8F0', fontSize: '18px', textAlign: 'center', marginBottom: '6px', fontWeight: '600' }}>
              {isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', marginBottom: '22px', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto 22px auto' }}>
              {isRtl ? 'أدخل بريدك الإلكتروني المسجل لإرسال رابط آمن لإعادة التعيين' : 'Enter your email to receive a secure reset link'}
            </p>

            {status.msg && (
              <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{status.msg}</div>
              </div>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  required
                  className="form-input-field"
                />
                <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: email ? '#D97706' : '#64748B' }} />
              </div>

              <button 
                type="submit" 
                disabled={loading || cooldown > 0}
                style={{ padding: '14px', background: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: (loading || cooldown > 0) ? 'not-allowed' : 'pointer', opacity: (loading || cooldown > 0) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={18} className="spin-icon" /> : <span>{isRtl ? 'إرسال رابط الحماية' : 'Send Reset Link'}</span>}
              </button>
            </form>
          </>
        ) : (
          /* شاشة التأكيد والنجاح التفاعلية */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle2 size={54} color="#10B981" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h2 style={{ color: '#E2E8F0', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {isRtl ? 'تحقق من صندوق البريد' : 'Check Your Inbox'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
              {isRtl ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى:` : `Password reset link sent to:`}
              <br />
              <strong style={{ color: '#38BDF8', wordBreak: 'break-all' }}>{email}</strong>
            </p>

            <button
              type="button"
              onClick={handleReset}
              disabled={cooldown > 0 || loading}
              style={{ background: 'transparent', border: '1px solid #334155', color: cooldown > 0 ? '#64748B' : '#CBD5E1', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}
            >
              <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
              <span>
                {cooldown > 0 
                  ? (isRtl ? `إعادة الإرسال بعد (${cooldown} ثانية)` : `Resend in (${cooldown}s)`)
                  : (isRtl ? 'إعادة إرسال الرابط' : 'Resend Link')}
              </span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button"
            onClick={onBackToLogin} 
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}
          >
            {isRtl ? <ArrowRight size={16} color="#D97706" /> : <ArrowLeft size={16} color="#D97706" />}
            <span>{isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '20px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>{isRtl ? 'بياناتك مشفرة ومحمية بالكامل' : '256-bit SSL Encrypted'}</span>
        </div>

      </div>
    </div>
  );
}
