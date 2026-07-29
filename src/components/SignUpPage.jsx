import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignUpPage({ onSwitchToLogin }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (password.length < 6) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
      });
      return;
    }

    setLoading(true);

    try {
      // 1. تسجيل المستخدم في Supabase Auth مع تمرير الاسم في metadata
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'admin' // دور افتراضي لمن ينشئ الحساب لأول مرة
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

      // تفريغ الحقول
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px', fontFamily: "'Cairo', sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#111C2A', padding: '35px 25px', borderRadius: '16px', border: '1px solid #1E2D3D', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        
        <h2 style={{ color: '#fff', fontSize: '24px', textAlign: 'center', marginBottom: '8px' }}>
          {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginBottom: '25px' }}>
          {isRtl ? 'قم بإنشاء حسابك للبدء في إدارة أكاديميتك' : 'Sign up to start managing your academy'}
        </p>

        {status.msg && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#10B981' : '#EF4444',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* الاسم الكامل */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isRtl ? 'الاسم الكامل' : 'Full Name'}
              required
              style={{ width: '100%', padding: '12px 40px', borderRadius: '10px', border: '1px solid #223147', background: '#090F16', color: '#fff', outline: 'none' }}
            />
            <FaUser style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '12px', color: '#64748b' }} />
          </div>

          {/* البريد الإلكتروني */}
          <div style={{ position: 'relative' }}>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              required
              style={{ width: '100%', padding: '12px 40px', borderRadius: '10px', border: '1px solid #223147', background: '#090F16', color: '#fff', outline: 'none' }}
            />
            <FaEnvelope style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '12px', color: '#64748b' }} />
          </div>

          {/* كلمة المرور */}
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRtl ? 'كلمة المرور' : 'Password'}
              required
              style={{ width: '100%', padding: '12px 40px', borderRadius: '10px', border: '1px solid #223147', background: '#090F16', color: '#fff', outline: 'none' }}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '12px', color: '#64748b', cursor: 'pointer' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '12px', background: '#C9A84C', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
          >
            {loading ? (isRtl ? 'جاري إنشاء الحساب...' : 'Creating Account...') : (isRtl ? 'إنشاء حساب' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <span onClick={onSwitchToLogin} style={{ color: '#C9A84C', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRtl ? 'تسجيل الدخول' : 'Log In'}
          </span>
        </div>

      </div>
    </div>
  );
}
