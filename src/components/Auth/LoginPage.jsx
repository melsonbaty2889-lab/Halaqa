import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { handleAuthError } from '../utils/errorHandler';
import { loginSchema, validateFormData } from '../schemas/auth';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Globe, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

// 🌟 شعار منصة الحلقة الذكية الرسمي (طابق تماماً لصفحة التسجيل)
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
        <linearGradient id="goldGradLogin" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="emeraldGradLogin" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12" stroke="url(#goldGradLogin)" strokeWidth="1.8" />
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#emeraldGradLogin)" stroke="#fef08a" strokeWidth="0.8" />
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#emeraldGradLogin)" stroke="#fef08a" strokeWidth="0.8" />
    </svg>
  </div>
);

export default function LoginPage({ onSwitchToSignUp, onForgotPassword, onLoginSuccess }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isRtl = i18n?.language === 'ar';

  // الحالات الأساسية (States)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // حالات مؤشرات UX المتقدمة
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Zod & Status Management
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: null, msg: '' });
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // 1. التعبئة التلقائية للبريد عند التحويل من صفحة التسجيل
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // 2. إدارة العداد التنازلي لمنع تكرار طلب التفعيل (Cooldown Timer)
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // التبديل بين اللغات
  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(nextLang);
    }
  };

  // فحص مفتاح Caps Lock
  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // 3. عملية تسجيل الدخول الرئيسية
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });
    setFieldErrors({});
    setShowResend(false);

    // التحقق المسبق عبر Zod[span_4](start_span)[span_4](end_span)
    const validationResult = validateFormData(
      { email: email.trim(), password: password.trim() },
      loginSchema
    );

    if (!validationResult.valid) {
      setFieldErrors(validationResult.errors);
      setStatus({
        type: 'error',
        msg: isRtl ? 'يرجى تصحيح الأخطاء الموضحة أدناه.' : 'Please correct the highlighted errors.'
      });
      return;
    }

    setLoading(true);

    try {
      // تسجيل الدخول في Supabase[span_5](start_span)[span_5](end_span)
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
      setRedirecting(true); // تفعيل شاشة التوجيه السلسة

      // تحديث حالة الاتصال وآخر تسجيل دخول[span_6](start_span)[span_6](end_span)
      await supabase
        .from('profiles')
        .update({ 
          last_login_at: new Date().toISOString(),
          is_online: true 
        })
        .eq('id', user.id);

      // جلب بيانات البروفايل والأكاديمية لتحديد الصلاحيات[span_7](start_span)[span_7](end_span)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, academy_id, is_activated, is_deleted')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.is_deleted) {
        await supabase.auth.signOut();
        setRedirecting(false);
        throw new Error(isRtl ? 'هذا الحساب معطل أو تم حذفه.' : 'This account is deactivated or deleted.');
      }

      setStatus({
        type: 'success',
        msg: isRtl ? '✅ تم تسجيل الدخول بنجاح! جاري التوجيه...' : '✅ Logged in successfully! Redirecting...'
      });

      // التوجيه الذكي حسب الدور (Role-based Navigation)[span_8](start_span)[span_8](end_span)
      setTimeout(() => {
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
      }, 500);

    } catch (err) {
      console.error('Login Error:', err);
      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({
        type: 'error',
        msg: userFriendlyMsg
      });
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  // 4. إعادة إرسال رابط التفعيل مع دعم Cooldown[span_9](start_span)[span_9](end_span)
  const handleResendEmail = async () => {
    if (!email.trim() || cooldown > 0) return;

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}?lang=${i18n?.language || 'ar'}`
        }
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl 
          ? '✅ تم إعادة إرسال رابط التفعيل! تفقد البريد الوارد أو المجلد غير المرغوب به (Spam).' 
          : '✅ Activation link sent! Check your inbox or spam folder.'
      });
      setShowResend(false);
      setCooldown(60); // قفل الإرسال لمدة 60 ثانية

    } catch (error) {
      const userFriendlyMsg = handleAuthError(error, isRtl);
      setStatus({ type: 'error', msg: userFriendlyMsg });
    } finally {
      setResendLoading(false);
    }
  };

  // 5. التسجيل عبر Google OAuth[span_10](start_span)[span_10](end_span)[span_11](start_span)[span_11](end_span)
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
      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({ type: 'error', msg: userFriendlyMsg });
      setLoading(false);
    }
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
        position: 'relative',
        boxSizing: 'border-box'
      }} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      {/* تنسيقات الإدخال والتعبئة التلقائية المطابقة لـ SignUpPage */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #090F16 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .form-input-field {
          width: 100%;
          padding: 14px 42px;
          border-radius: 10px;
          border: 1px solid #223147;
          background: #090F16;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input-field:focus {
          border-color: #D97706 !important;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.2) !important;
        }
        .form-input-error {
          border-color: #EF4444 !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* زر اللغة العائم الثابت */}
      <button
        type="button"
        onClick={toggleLanguage}
        style={{
          position: 'fixed',
          top: '20px',
          [isRtl ? 'left' : 'right']: '20px',
          background: '#0F172A',
          border: '1px solid #1E293B',
          color: '#CBD5E1',
          padding: '8px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 50
        }}
      >
        <Globe size={14} color="#D97706" />
        <span>{isRtl ? 'English' : 'العربية'}</span>
      </button>

      {/* الكارت الرئيسي */}
      <div style={{ width: '100%', maxWidth: '420px', background: '#0F172A', padding: '35px 25px 30px 25px', borderRadius: '20px', border: '1px solid #1E293B', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', margin: 'auto 0', relative: 'relative' }}>
        
        {/* الشعار والهوية البصرية[span_12](start_span)[span_12](end_span) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <SmartHalaqaProLogo size={52} />
          <h1 style={{ color: '#F8FAFC', fontSize: '22px', fontWeight: 'bold', margin: '12px 0 4px 0' }}>
            {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
          </h1>
          <p style={{ color: '#D97706', fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', margin: 0, textTransform: 'uppercase' }}>
            {isRtl ? 'منصة إدارة المقارئ والأكاديميات' : 'ACADEMY MANAGEMENT PLATFORM'}
          </p>
        </div>

        <h2 style={{ color: '#E2E8F0', fontSize: '18px', textAlign: 'center', marginBottom: '6px', fontWeight: '600' }}>
          {isRtl ? 'تسجيل الدخول' : 'Sign In'}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', marginBottom: '22px' }}>
          {isRtl ? 'أهلاً بعودتك! ادخل لمتابعة إدارة حلقاتك التعليمية' : 'Welcome back! Log in to access your academy'}
        </p>

        {/* التسجيل عبر Google السريع[span_13](start_span)[span_13](end_span)[span_14](start_span)[span_14](end_span) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || redirecting}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #334155',
            background: '#1E293B',
            color: '#F8FAFC',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '18px',
            transition: 'all 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {isRtl ? 'المتابعة بواسطة Google' : 'Continue with Google'}
        </button>

        {/* فاصل البريد الإلكتروني[span_15](start_span)[span_15](end_span) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
          <span style={{ color: '#64748B', fontSize: '12px' }}>{isRtl ? 'أو عبر البريد' : 'or via email'}</span>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
        </div>

        {/* تنبيه الأخطاء أو النجاح التفاعلي[span_16](start_span)[span_16](end_span) */}
        {status.msg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '18px',
            fontSize: '13px',
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#34D399' : '#F87171',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{status.msg}</div>
            </div>

            {/* زر إعادة الإرسال الذكي مع التهدئة[span_17](start_span)[span_17](end_span) */}
            {showResend && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading || cooldown > 0}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '4px',
                  background: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: (resendLoading || cooldown > 0) ? 'not-allowed' : 'pointer',
                  opacity: (resendLoading || cooldown > 0) ? 0.6 : 1
                }}
              >
                {resendLoading 
                  ? (isRtl ? 'جاري الإرسال...' : 'Sending...') 
                  : cooldown > 0 
                    ? (isRtl ? `انتظر (${cooldown} ثانية)` : `Wait (${cooldown}s)`) 
                    : (isRtl ? 'إعادة إرسال رابط التفعيل؟' : 'Resend Activation Link?')}
              </button>
            )}
          </div>
        )}

        {/* نموذج الدخول الرئيسي[span_18](start_span)[span_18](end_span) */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* حقل البريد الإلكتروني[span_19](start_span)[span_19](end_span) */}
          <div style={{ position: 'relative' }}>
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              required
              className={`form-input-field ${fieldErrors.email ? 'form-input-error' : ''}`}
            />
            <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: email ? '#D97706' : '#64748B', transition: 'color 0.2s' }} />
            {fieldErrors.email && (
              <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block', padding: '0 4px' }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* حقل كلمة المرور مع مؤشر Caps Lock[span_20](start_span)[span_20](end_span) */}
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onKeyUp={handleKeyUp}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder={isRtl ? 'كلمة المرور' : 'Password'}
              required
              className={`form-input-field ${fieldErrors.password ? 'form-input-error' : ''}`}
            />
            <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: password ? '#D97706' : '#64748B', transition: 'color 0.2s' }} />
            
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', color: password ? '#D97706' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>

            {fieldErrors.password && (
              <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block', padding: '0 4px' }}>
                {fieldErrors.password}
              </span>
            )}

            {/* تنبيه Caps Lock التفاعلي */}
            {capsLockOn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontSize: '11px', marginTop: '6px', padding: '0 4px' }}>
                <AlertTriangle size={13} />
                <span>{isRtl ? 'مفتاح الحروف الكبيرة (Caps Lock) مفعل' : 'Caps Lock is ON'}</span>
              </div>
            )}
          </div>

          {/* تذكرني + استعادة كلمة المرور المنسقة[span_21](start_span)[span_21](end_span) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94A3B8' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#D97706', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>{isRtl ? 'تذكرني' : 'Remember me'}</span>
            </label>

            <button 
              type="button"
              onClick={onForgotPassword}
              style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', font: 'inherit', fontSize: '13px' }}
              className="hover:underline"
            >
              {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </button>
          </div>

          {/* زر تسجيل الدخول الرئيسي[span_22](start_span)[span_22](end_span) */}
          <button 
            type="submit" 
            disabled={loading || redirecting}
            style={{ 
              padding: '14px', 
              background: '#D97706', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              fontSize: '15px',
              cursor: (loading || redirecting) ? 'not-allowed' : 'pointer', 
              marginTop: '6px',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {redirecting ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>{isRtl ? 'جاري تجهيز لوحة التحكم...' : 'Preparing dashboard...'}</span>
              </>
            ) : loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>{isRtl ? 'جاري التحقق...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>{isRtl ? 'تسجيل الدخول' : 'Log In'}</span>
            )}
          </button>
        </form>

        {/* شارة التشفير والأمان SSL 256-bit[span_23](start_span)[span_23](end_span) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '20px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>
            {isRtl ? (
              <>بياناتك مشفرة ومحمية وفق معايير <span dir="ltr">256-bit</span></>
            ) : (
              '256-bit SSL encrypted & secure data'
            )}
          </span>
        </div>

        {/* رابط التحويل لإنشاء حساب[span_24](start_span)[span_24](end_span)[span_25](start_span)[span_25](end_span) */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
          {isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
          <span onClick={onSwitchToSignUp} style={{ color: '#F59E0B', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRtl ? 'إنشاء حساب جديد' : 'Create Account'}
          </span>
        </div>

      </div>
    </div>
  );
}
