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

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-[#090E17] p-5 font-['Cairo',sans-serif]" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* الكارت الرئيسي */}
      <div className="w-full max-w-[420px] bg-[#0D1724] p-[35px_24px] rounded-[24px] border border-[#1A2738] shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative">
        
        {/* زر تغيير اللغة */}
        <div className={`absolute -top-12 ${isRtl ? 'left-0' : 'right-0'}`}>
          <button 
            type="button"
            onClick={toggleLanguage}
            className="bg-[#0D1724] border border-[#1E2D3D] text-[#D4AF37] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-[#152336] transition-colors"
          >
            <Globe className="w-4 h-4" /> {isRtl ? 'English' : 'العربية'}
          </button>
        </div>

        {/* العناوين */}
        <h2 className="text-[#D4AF37] text-2xl sm:text-3xl text-center mb-1.5 font-bold">
          {isRtl ? 'تسجيل الدخول' : 'Sign In'}
        </h2>
        <p className="text-[#94A3B8] text-sm text-center mb-6">
          {isRtl ? 'مرحباً بك في الحلقة الذكية' : 'Welcome back to Smart Halaqa'}
        </p>

        {/* تنبيه الأخطاء أو النجاح */}
        {status.msg && (
          <div className={`p-3.5 rounded-xl mb-5 text-xs sm:text-sm leading-relaxed flex flex-col items-center gap-2.5 border ${
            status.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
              : 'bg-red-500/10 text-red-400 border-red-500/25'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{status.msg}</span>
            </div>

            {/* زر إعادة إرسال رابط التفعيل */}
            {showResend && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="bg-[#D4AF37] text-[#0B131E] rounded-lg px-3.5 py-1.5 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {resendLoading 
                  ? (isRtl ? 'جاري الإرسال...' : 'Sending...') 
                  : (isRtl ? 'إعادة إرسال رابط التفعيل؟' : 'Resend Activation Link?')}
              </button>
            )}
          </div>
        )}

        {/* نموذج الدخول */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          
          {/* حقل البريد الإلكتروني */}
          <div className="relative">
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              className={`w-full py-4 px-11 rounded-xl bg-[#0B131E] text-white text-sm outline-none transition-colors border ${
                fieldErrors.email ? 'border-red-500' : 'border-[#1E2D3D] focus:border-[#D4AF37]'
              }`}
            />
            <Mail 
              className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 ${
                isRtl ? 'right-4' : 'left-4'
              } ${fieldErrors.email ? 'text-red-500' : 'text-slate-500'}`} 
            />
            {fieldErrors.email && (
              <span className="text-xs text-red-500 mt-1 block px-1">
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* حقل كلمة المرور */}
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder={isRtl ? 'كلمة المرور' : 'Password'}
              className={`w-full py-4 px-11 rounded-xl bg-[#0B131E] text-white text-sm outline-none transition-colors border ${
                fieldErrors.password ? 'border-red-500' : 'border-[#1E2D3D] focus:border-[#D4AF37]'
              }`}
            />
            <Lock 
              className={`w-5 h-5 absolute top-1/2 -translate-y-1/2 ${
                isRtl ? 'right-4' : 'left-4'
              } ${fieldErrors.password ? 'text-red-500' : 'text-slate-500'}`} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isRtl ? 'left-4' : 'right-4'
              } text-slate-500 hover:text-slate-300 transition-colors`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {fieldErrors.password && (
              <span className="text-xs text-red-500 mt-1 block px-1">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* تذكرني + نسيت كلمة المرور */}
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <label className="text-slate-400 flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#D4AF37] w-4 h-4 rounded" 
              />
              {isRtl ? 'تذكرني' : 'Remember me'}
            </label>

            <button 
              type="button"
              onClick={onForgotPassword}
              className="text-slate-400 hover:text-[#D4AF37] transition-colors"
            >
              {isRtl ? 'استعادة كلمة المرور' : 'Forgot Password?'}
            </button>
          </div>

          {/* زر تسجيل الدخول الرئيسي */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#c3a030] text-[#0B131E] rounded-xl font-bold text-base transition-colors mt-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (isRtl ? 'جاري التحقق...' : 'Signing in...') : (isRtl ? 'تسجيل الدخول' : 'Log In')}
          </button>
        </form>

        {/* فاصل OR */}
        <div className="flex items-center my-5 gap-2.5">
          <div className="flex-1 h-px bg-[#1E2D3D]"></div>
          <span className="text-slate-500 text-xs font-bold">OR</span>
          <div className="flex-1 h-px bg-[#1E2D3D]"></div>
        </div>

        {/* زر Google */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* رابط إنشاء حساب */}
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={onSwitchToSignUp} 
            className="text-[#D4AF37] hover:underline text-sm font-bold bg-transparent border-0 cursor-pointer"
          >
            {isRtl ? 'إنشاء حساب معلم/مشرف' : 'Create Teacher/Admin Account'}
          </button>
        </div>

      </div>
    </div>
  );
}
