import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

export default function LoginPage({ onSwitchToSignUp, onForgotPassword }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl ? '✅ تم تسجيل الدخول بنجاح! جاري التوجيه...' : '✅ Logged in successfully! Redirecting...'
      });

      // إعادة تحميل الجلسة للتوجيه للوحة التحكم
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Login Error:', err);
      setStatus({
        type: 'error',
        msg: err.message === 'Invalid login credentials' 
          ? (isRtl ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
          : (err.message || (isRtl ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login'))
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 42px',
    borderRadius: '10px',
    border: '1px solid #223147',
    background: '#090F16',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070C12', padding: '20px', fontFamily: "'Cairo', sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
      
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #090F16 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', background: '#0F172A', padding: '35px 25px', borderRadius: '20px', border: '1px solid #1E293B', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        <h2 style={{ color: '#F8FAFC', fontSize: '24px', textAlign: 'center', marginBottom: '8px', fontWeight: 'bold' }}>
          {isRtl ? 'تسجيل الدخول' : 'Welcome Back'}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', marginBottom: '25px' }}>
          {isRtl ? 'أدخل بياناتك للدخول إلى حسابك' : 'Enter your credentials to access your account'}
        </p>

        {status.msg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            lineHeight: '1.6',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#34D399' : '#F87171',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            <FaExclamationCircle style={{ flexShrink: 0 }} />
            <div>{status.msg}</div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* البريد الإلكتروني */}
          <div style={{ position: 'relative' }}>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              required
              style={inputStyle}
            />
            <FaEnvelope style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', color: '#64748B' }} />
          </div>

          {/* كلمة المرور */}
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRtl ? 'كلمة المرور' : 'Password'}
              required
              style={inputStyle}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', color: '#64748B', cursor: 'pointer' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* نسيت كلمة المرور */}
          <div style={{ textAlign: isRtl ? 'left' : 'right', marginTop: '-4px' }}>
            <span 
              onClick={onForgotPassword}
              style={{ color: '#F59E0B', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </span>
          </div>

          {/* زر تسجيل الدخول */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '14px', 
              background: '#D97706', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer', 
              marginTop: '4px',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}
          >
            {loading ? (isRtl ? 'جاري الدخول...' : 'Logging In...') : (isRtl ? 'تسجيل الدخول' : 'Log In')}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
          {isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
          <span onClick={onSwitchToSignUp} style={{ color: '#F59E0B', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRtl ? 'إنشاء حساب جديد' : 'Sign Up'}
          </span>
        </div>

      </div>
    </div>
  );
                 }
