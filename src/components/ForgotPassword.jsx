import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export default function ForgotPassword({ onBackToLogin }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const isRtl = i18n.language === 'ar';
  const goldColor = '#C9A84C';

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin, 
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage(t('checkYourEmail') || (isRtl ? 'برجاء مراجعة بريدك الإلكتروني لتفعيل الرابط' : 'Please check your email for the reset link'));
      setIsError(false);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#111C2A', padding: '40px 30px', borderRadius: '16px', border: '1px solid #1E2D3D', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center' }}>
        
        <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '700' }}>
          {t('forgotPassword') || (isRtl ? 'استعادة كلمة المرور' : 'Forgot Password')}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 30px 0', lineHeight: '1.6' }}>
          {isRtl ? 'أدخل بريدك الإلكتروني المسجل لإرسال رابط آمن لإعادة تعيين كلمة السر.' : 'Enter your registered email to receive a secure password reset link.'}
        </p>

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '15px', color: '#64748b' }}>
              <FaEnvelope />
            </span>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={t('email') || (isRtl ? 'البريد الإلكتروني' : 'Email Address')}
              required
              style={{ width: '100%', padding: '14px 15px 14px ' + (isRtl ? '15px' : '45px'), paddingRight: isRtl ? '45px' : '15px', borderRadius: '12px', border: '1px solid #223147', background: '#090F16', color: '#fff', fontSize: '14px', outline: 'none', textAlign: isRtl ? 'right' : 'left' }}
            />
          </div>

          {message && (
            <div style={{ padding: '12px', borderRadius: '8px', fontSize: '13px', background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isError ? '#F87171' : '#34D399', border: `1px solid ${isError ? '#EF4444' : '#10B981'}`, textAlign: isRtl ? 'right' : 'left' }}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#1E2D3D' : goldColor, color: '#000', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            {loading ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : (t('sendResetLink') || (isRtl ? 'إرسال رابط الحماية' : 'Send Reset Link'))}
          </button>
        </form>
        
        <button onClick={onBackToLogin} style={{ marginTop: '25px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
          {isRtl ? <FaArrowRight /> : <FaArrowLeft />}
          {isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </button>

      </div>
    </div>
  );
}
