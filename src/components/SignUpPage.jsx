import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

export default function SignUpPage({ onSwitchToLogin }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });

  // فحص قوة وشروط كلمة المرور
  const validatePassword = (pass) => {
    const hasMinLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (!validatePassword(password)) {
      setStatus({
        type: 'error',
        msg: isRtl 
          ? 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، تتضمن حروفاً كبيرة وصغيرة وأرقاماً ورموزاً خاصة.' 
          : 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'admin'
          }
        }
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl 
          ? '✅ تم إنشاء الحساب بنجاح! تفقد بريدك الإلكتروني لتأكيد الحساب.' 
          : '✅ Account created successfully! Please check your email to confirm.'
      });

      setFullName('');
      setEmail('');
      setPassword('');

    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.message || (isRtl ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during signup')
      });
    } finally {
      setLoading(false);
    }
  };

  // نمط موحد للمدخلات لمنع تغير اللون الأبيض عند التعبئة التلقائية (Autofill)
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
      
      {/* ستايل مخصص لمعالجة خلفية الـ Autofill في المتصفحات */}
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
          {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', marginBottom: '25px' }}>
          {isRtl ? 'قم بإنشاء حسابك للبدء في إدارة أكاديميتك' : 'Sign up to start managing your academy'}
        </p>

        {/* عرض رسائل الخطأ والتنبيه بشكل منسق */}
        {status.msg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            lineHeight: '1.6',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#34D399' : '#F87171',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            <FaExclamationCircle style={{ marginTop: '3px', flexShrink: 0 }} />
            <div>{status.msg}</div>
          </div>
        )}

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* الاسم الكامل */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isRtl ? 'الاسم الكامل' : 'Full Name'}
              required
              style={inputStyle}
            />
            <FaUser style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', color: '#64748B' }} />
          </div>

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

          {/* زر التسجيل */}
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
              marginTop: '8px',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}
          >
            {loading ? (isRtl ? 'جاري إنشاء الحساب...' : 'Creating Account...') : (isRtl ? 'إنشاء حساب' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <span onClick={onSwitchToLogin} style={{ color: '#F59E0B', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRtl ? 'تسجيل الدخول' : 'Log In'}
          </span>
        </div>

      </div>
    </div>
  );
}
