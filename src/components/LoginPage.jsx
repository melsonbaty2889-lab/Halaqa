import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { handleAuthError } from '../utils/errorHandler';
import { loginSchema, validateFormData } from '../schemas/auth';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Globe 
} from 'lucide-react';

export default function LoginPage({ onSwitchToSignUp, onForgotPassword, onLoginSuccess }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  const currentLang = i18n?.language || 'ar';
  const isRtl = currentLang === 'ar';

  // الحالات (States)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // أخطاء الحقول والتحقق (Zod Validation)
  const [fieldErrors, setFieldErrors] = useState({});
  
  // إدارة حالات الخطأ العامة والتفعيل
  const [status, setStatus] = useState({ type: null, msg: '' });
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // تغيير اللغة
  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  // 1. تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });
    setFieldErrors({});
    setShowResend(false);

    // التحقق من المدخلات بواسطة Zod
    const validationResult = validateFormData(
      { email: email.trim(), password: password.trim() },
      loginSchema
    );

    if (!validationResult.valid) {
      setFieldErrors(validationResult.errors);
      setStatus({
        type: 'error',
        msg: isRtl ? 'يرجى تصحيح الأخطاء الموضحة أدناه' : 'Please correct the errors below'
      });
      return;
    }

    setLoading(true);

    try {
      // تسجيل الدخول في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      if (authError) {
        if (authError.message === 'Email not confirmed') {
          setShowResend(true);
        }
        throw authError;
      }

      const user = authData.user;

      // تحديث حالة الاتصال وآخر تسجيل دخول
      await supabase
        .from('profiles')
        .update({ 
          last_login_at: new Date().toISOString(),
          is_online: true 
        })
        .eq('id', user.id);

      // جلب الـ Profile للتأكد من الدور وحالة الحساب
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, academy_id, is_activated, is_deleted')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.is_deleted) {
        await supabase.auth.signOut();
        throw new Error(isRtl ? 'هذا الحساب معطل أو محذوف.' : 'This account is deactivated or deleted.');
      }

      setStatus({
        type: 'success',
        msg: isRtl ? '✅ تم تسجيل الدخول بنجاح! جاري التوجيه...' : '✅ Logged in successfully! Redirecting...'
      });

      // التوجيه المباشر
      if (onLoginSuccess) {
        onLoginSuccess({ user, profile });
      } else {
        const role = profile?.role?.toLowerCase().trim() || 'student';
        const routeMap = {
          super_admin: '/admin-dashboard',
          admin: '/dashboard',
          academy_admin: '/dashboard',
          teacher: '/teacher-dashboard',
          student: '/student-dashboard',
          parent: '/parent-dashboard',
        };
        navigate(routeMap[role] || '/dashboard');
      }

    } catch (err) {
      console.error('Login Error:', err);
      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({
        type: 'error',
        msg: userFriendlyMsg
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. إعادة إرسال رابط التفعيل
  const handleResendEmail = async () => {
    if (!email.trim()) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'يرجى إدخال البريد الإلكتروني أولاً' : 'Please enter your email address first'
      });
      return;
    }

    setResendLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}?lang=${currentLang}`
        }
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl 
          ? '✅ تم إعادة إرسال رابط التفعيل! تفقد صندوق الوارد أو الـ Spam' 
          : '✅ Activation link resent! Check your inbox or spam folder'
      });
      setShowResend(false);

    } catch (error) {
      const userFriendlyMsg = handleAuthError(error, isRtl);
      setStatus({
        type: 'error',
        msg: userFriendlyMsg
      });
    } finally {
      setResendLoading(false);
    }
  };

  // 3. التسجيل عبر حساب Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Error:', err);
      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({
        type: 'error',
        msg: userFriendlyMsg
      });
      setLoading(false);
    }
  };

  const getInputStyle = (hasError) => ({
    width: '100%',
    padding: '16px 45px 16px 45px',
    borderRadius: '12px',
    border: hasError ? '1px solid #EF4444' : '1px solid #1E2D3D',
    background: '#0B131E',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090E17', padding: '20px', fontFamily: "'Cairo', sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
      
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #0B131E inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* الكارت الرئيسي */}
      <div style={{ width: '100%', maxWidth: '420px', background: '#0D1724', padding: '35px 24px', borderRadius: '24px', border: '1px solid #1A2738', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', position: 'relative' }}>
        
        {/* زر تغيير اللغة */}
        <div style={{ position: 'absolute', top: '-50px', [isRtl ? 'left' : 'right']: '0' }}>
          <button 
            type="button"
            onClick={toggleLanguage}
            style={{ 
              background: '#0D1724', 
              border: '1px solid #1E2D3D', 
              color: '#D4AF37', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            <Globe className="w-4 h-4" /> {isRtl ? 'English' : 'العربية'}
          </button>
        </div>

        {/* العناوين */}
        <h2 style={{ color: '#D4AF37', fontSize: '28px', textAlign: 'center', marginBottom: '6px', fontWeight: 'bold' }}>
          {isRtl ? 'تسجيل الدخول' : 'Sign In'}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
          {isRtl ? 'مرحباً بك في الحلقة الذكية' : 'Welcome back to Smart Halaqa'}
        </p>

        {/* تنبيه الأخطاء أو النجاح */}
        {status.msg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#34D399' : '#F87171',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{status.msg}</span>
            </div>

            {/* زر إعادة إرسال رابط التفعيل */}
            {showResend && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading}
                style={{
                  background: '#D4AF37',
                  color: '#0B131E',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  marginTop: '4px',
                  opacity: resendLoading ? 0.6 : 1
                }}
              >
                {resendLoading 
                  ? (isRtl ? 'جاري الإرسال...' : 'Sending...') 
                  : (isRtl ? 'إعادة إرسال رابط التفعيل؟' : 'Resend Activation Link?')}
              </button>
            )}
          </div>
        )}

        {/* نموذج الدخول */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* حقل البريد الإلكتروني */}
          <div style={{ position: 'relative' }}>
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              style={getInputStyle(!!fieldErrors.email)}
            />
            <Mail 
              className="w-5 h-5"
              style={{ 
                position: 'absolute', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                [isRtl ? 'right' : 'left']: '16px', 
                color: fieldErrors.email ? '#EF4444' : '#64748B' 
              }} 
            />
            {fieldErrors.email && (
              <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block', paddingRight: '4px' }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* حقل كلمة المرور */}
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder={isRtl ? 'كلمة المرور' : 'Password'}
              style={getInputStyle(!!fieldErrors.password)}
            />
            <Lock 
              className="w-5 h-5"
              style={{ 
                position: 'absolute', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                [isRtl ? 'right' : 'left']: '16px', 
                color: fieldErrors.password ? '#EF4444' : '#64748B' 
              }} 
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '16px', color: '#64748B', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </span>
            {fieldErrors.password && (
              <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block', paddingRight: '4px' }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* تذكرني + نسيت كلمة المرور */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <label style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#D4AF37' }} 
              />
              {isRtl ? 'تذكرني' : 'Remember me'}
            </label>

            <span 
              onClick={onForgotPassword}
              style={{ color: '#94A3B8', cursor: 'pointer' }}
            >
              {isRtl ? 'استعادة كلمة المرور' : 'Forgot Password?'}
            </span>
          </div>

          {/* زر تسجيل الدخول الرئيسي */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '15px', 
              background: '#D4AF37', 
              color: '#0B131E', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer', 
              marginTop: '6px',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s ease'
            }}
          >
            {loading ? (isRtl ? 'جاري التحقق...' : 'Signing in...') : (isRtl ? 'تسجيل الدخول' : 'Log In')}
          </button>
        </form>

        {/* فاصل OR */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: '#1E2D3D' }}></div>
          <span style={{ color: '#64748B', fontSize: '12px', fontWeight: 'bold' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#1E2D3D' }}></div>
        </div>

        {/* زر Google بحجم أيقونة ملائم */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '14px', 
            background: '#FFFFFF', 
            color: '#1E293B', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        >
          {/* SVG Google أصلية عالية الجودة لتطابق التصميم القياسي */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* رابط إنشاء حساب */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span onClick={onSwitchToSignUp} style={{ color: '#D4AF37', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            {isRtl ? 'إنشاء حساب معلم/مشرف' : 'Create Teacher/Admin Account'}
          </span>
        </div>

      </div>
    </div>
  );
}
