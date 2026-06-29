/**
 * IMPROVED LoginPage Component
 * This is a reference implementation showing how to integrate:
 * 1. Error handler utility (handleAuthError)
 * 2. Zod validation (loginSchema)
 * 3. Better error state management
 * 
 * Key improvements over original:
 * - Uses centralized error handler
 * - Validates input before submission
 * - Better error message display
 * - Proper navigation with React Router (instead of window.location)
 * - More robust error handling
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // or use your routing solution
import { supabase } from '../lib/supabase';
import { handleAuthError } from '../utils/errorHandler';
import { loginSchema, validateFormData } from '../schemas/auth';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa';

export default function LoginPageImproved({ onSwitchToSignUp, onSwitchToForgotPassword }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // Use React Router for navigation
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  // ✨ IMPROVEMENT 1: Validate form data before submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});
    setShowResend(false);

    // Validate form inputs using Zod
    const validationResult = validateFormData(
      { email: email.trim(), password: password.trim() },
      loginSchema
    );

    if (!validationResult.valid) {
      // Display field-specific errors
      setFieldErrors(validationResult.errors);
      setErrorMsg(translateText('validationError', 'يرجى تصحيح الأخطاء أدناه', 'Please correct the errors below'));
      return;
    }

    setLoading(true);

    try {
      // ✨ IMPROVEMENT 2: Use error handler for auth errors
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      if (error) {
        // Use centralized error handler
        const userMessage = handleAuthError(error, isRtl);
        setErrorMsg(userMessage);
        
        // Show resend option for unconfirmed emails
        if (error.message === 'Email not confirmed') {
          setShowResend(true);
        }
        setLoading(false);
        return;
      }

      // ✨ IMPROVEMENT 3: Validate user and fetch profile
      if (!authData?.user?.id) {
        setErrorMsg(translateText('authFailed', 'فشل التحقق من الهوية', 'Authentication failed'));
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle(); // Use maybeSingle instead of single for safety

        if (profileError) throw profileError;

        // ✨ IMPROVEMENT 4: Use React Router for navigation instead of window.location
        const role = profile?.role?.toLowerCase().trim() || 'student';
        
        const routeMap = {
          admin: '/admin-dashboard',
          super_admin: '/admin-dashboard',
          teacher: '/teacher-dashboard',
          academy_admin: '/academy-dashboard',
          student: '/student-dashboard',
          parent: '/parent-dashboard',
        };

        const route = routeMap[role] || '/dashboard';
        navigate(route);

      } catch (err) {
        const userMessage = handleAuthError(err, isRtl);
        setErrorMsg(userMessage);
        setLoading(false);
      }
    } catch (err) {
      const userMessage = handleAuthError(err, isRtl);
      setErrorMsg(userMessage);
      setLoading(false);
    }
  };

  // ✨ IMPROVEMENT 5: Better error handling for resend email
  const handleResendEmail = async () => {
    if (!email.trim()) {
      setErrorMsg(translateText('emailRequired', 'يرجى إدخال بريدك الإلكتروني', 'Please enter your email'));
      return;
    }

    setResendLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}?lang=${currentLang}`
        }
      });

      if (error) throw error;

      setErrorMsg(
        translateText('resendSuccess', '✅ تم إعادة إرسال رابط التفعيل بنجاح! تفقد صندوق الوارد أو الـ Spam', 
          '✅ Verification link resent successfully! Check your inbox or spam folder')
      );
      setShowResend(false);

    } catch (error) {
      const userMessage = handleAuthError(error, isRtl);
      setErrorMsg(userMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      
      if (error) throw error;
    } catch (error) {
      const userMessage = handleAuthError(error, isRtl);
      setErrorMsg(userMessage);
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
      direction: isRtl ? 'rtl' : 'ltr',
      position: 'relative'
    }}>
      
      {/* Language Toggle Button */}
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

        {/* Error Message Display */}
        {errorMsg && (
          <div style={{ 
            background: errorMsg.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: errorMsg.includes('✅') ? '#10B981' : '#EF4444',
            padding: '15px', 
            borderRadius: '12px', 
            marginBottom: '20px', 
            fontSize: '0.85rem', 
            textAlign: 'center',
            border: errorMsg.includes('✅') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>{errorMsg}</span>
            
            {showResend && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading}
                style={{
                  background: '#C9A84C',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  opacity: resendLoading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                {resendLoading 
                  ? translateText('sending', 'جاري الإرسال...', 'Sending...') 
                  : translateText('resendBtn', 'إعادة إرسال رابط التفعيل؟', 'Resend Activation Link?')}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Email Field with Field Error */}
          <div style={{ position: 'relative' }}>
            <FaEnvelope style={{ 
              position: 'absolute', 
              right: isRtl ? '15px' : 'auto', 
              left: !isRtl ? '15px' : 'auto', 
              top: '15px', 
              color: fieldErrors.email ? '#EF4444' : '#64748b'
            }} />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={translateText('email', 'البريد الإلكتروني', 'Email Address')} 
              style={{ 
                width: '100%', 
                padding: isRtl ? '14px 40px 14px 14px' : '14px 14px 14px 40px', 
                borderRadius: '12px', 
                border: fieldErrors.email ? '1px solid #EF4444' : '1px solid #334155',
                background: '#162030', 
                color: '#fff', 
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }} 
            />
            {fieldErrors.email && (
              <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                {fieldErrors.email}
              </span>
            )}
          </div>
          
          {/* Password Field with Field Error */}
          <div style={{ position: 'relative' }}>
            <FaLock style={{ 
              position: 'absolute', 
              right: isRtl ? '15px' : 'auto', 
              left: !isRtl ? '15px' : 'auto', 
              top: '15px', 
              color: fieldErrors.password ? '#EF4444' : '#64748b'
            }} />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder={translateText('password', 'كلمة المرور', 'Password')} 
              style={{ 
                width: '100%', 
                padding: isRtl ? '14px 40px 14px 14px' : '14px 14px 14px 40px', 
                borderRadius: '12px', 
                border: fieldErrors.password ? '1px solid #EF4444' : '1px solid #334155',
                background: '#162030', 
                color: '#fff', 
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }} 
            />
            {fieldErrors.password && (
              <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button 
            type="button" 
            onClick={onSwitchToForgotPassword} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              alignSelf: 'flex-start',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#C9A84C'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            {translateText('forgotPassword', 'نسيت كلمة المرور؟', 'Forgot Password?')}
          </button>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              padding: '14px', 
              background: '#C9A84C', 
              color: '#000', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? translateText('loading', 'جاري التحقق...', 'Signing in...') : translateText('signIn', 'تسجيل الدخول', 'Sign In')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
          {translateText('or', 'أو', 'OR')}
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: '#fff', 
            color: '#1E293B', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
          onMouseLeave={(e) => e.target.style.background = '#fff'}
        >
          <FaGoogle color="#DB4437" /> {translateText('signInWithGoogle', 'الدخول بواسطة جوجل', 'Sign in with Google')}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={onSwitchToSignUp} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#C9A84C', 
              cursor: 'pointer', 
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#E5C158'}
            onMouseLeave={(e) => e.target.style.color = '#C9A84C'}
          >
            {translateText('createAccount', 'إنشاء حساب معلم/مشرف', 'Create Teacher/Admin Account')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * USAGE NOTES:
 * 
 * This improved component includes:
 * 
 * 1. ERROR HANDLER INTEGRATION:
 *    - Uses handleAuthError() for consistent error messages
 *    - Maps Supabase errors to user-friendly Arabic text
 *    - Logs errors with context for debugging
 * 
 * 2. ZOD VALIDATION:
 *    - Validates email format
 *    - Validates password minimum length
 *    - Displays field-specific error messages
 *    - Prevents submission of invalid data
 * 
 * 3. REACT ROUTER INTEGRATION:
 *    - Uses navigate() instead of window.location.href
 *    - Role-based routing to correct dashboard
 *    - Cleaner navigation handling
 * 
 * 4. BETTER STATE MANAGEMENT:
 *    - Separate fieldErrors state for form validation
 *    - Better message clarity
 *    - Success message styling
 * 
 * TO INTEGRATE:
 * - Replace LoginPage.jsx with this version
 * - Make sure to install/setup React Router in your app
 * - Import the error handler and validation schemas
 */
