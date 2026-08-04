import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { User, Mail, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, X, ShieldCheck, Globe, Loader2 } from 'lucide-react';

// 🌟 شعار منصة الحلقة الذكية الرسمي (مع إغلاق الدائرة الذهبية بالكامل)
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
        <linearGradient id="goldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* الدائرة الذهبية المكتملة */}
      <circle cx="16" cy="16" r="12" stroke="url(#goldGrad)" strokeWidth="1.8" />
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
    </svg>
  </div>
);

export default function SignUpPage({ onSwitchToLogin }) {
  const { i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });
  const [modalContent, setModalContent] = useState(null); // 'terms' | 'privacy' | null

  // التبديل السريع بين اللغات
  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(nextLang);
    }
  };

  // فحص شروط كلمة المرور
  const rules = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const validRulesCount = Object.values(rules).filter(Boolean).length;
  const isPasswordValid = validRulesCount === 4;

  const policyTexts = {
    terms: {
      title: isRtl ? 'الشروط والأحكام - الحلقة الذكية' : 'Terms of Service - Smart Halaqa',
      content: isRtl ? (
        <>
          <p style={{ marginTop: 0 }}><strong>1. القبول بالشروط:</strong> بإنشاء حساب في منصة "الحلقة الذكية"، تلتزم بالامتثال لكافة القوانين واللوائح التنظيمية الخاصة بالتطبيق.</p>
          <p><strong>2. إدارة الحساب والأكاديميات:</strong> يتعهد المسؤول (Admin) بصحة البيانات المدخلة وتوفير بيئة تعليمية آمنة للطلاب والمعلمين داخل الحلقة.</p>
          <p><strong>3. حماية البيانات والملكيات:</strong> يلتزم التطبيق بحفظ السجلات والبيانات التعليمية وتأمينها وفق أعلى معايير التشفير الإلكتروني.</p>
        </>
      ) : (
        <>
          <p style={{ marginTop: 0 }}><strong>1. Acceptance of Terms:</strong> By creating an account on Smart Halaqa, you agree to comply with all applicable policies and regulations.</p>
          <p><strong>2. Account & Academy Management:</strong> Administrators undertake to provide accurate data and foster a secure learning environment for students and teachers.</p>
          <p><strong>3. Data Protection:</strong> The platform is committed to safeguarding educational records and user data using industry-standard encryption.</p>
        </>
      )
    },
    privacy: {
      title: isRtl ? 'سياسة الخصوصية - الحلقة الذكية' : 'Privacy Policy - Smart Halaqa',
      content: isRtl ? (
        <>
          <p style={{ marginTop: 0 }}><strong>1. جمع البيانات:</strong> تجمع منصة "الحلقة الذكية" البيانات الأساسية (الاسم، البريد الإلكتروني، بيانات الحلقة) لتشغيل الخدمات وتسهيل التواصل.</p>
          <p><strong>2. حماية واستخدام البيانات:</strong> لا يتم مشاركة أو بيع بيانات الطلاب والمعلمين لأي أطراف خارجية، وتُستخدم حصراً لإدارة المنظومة التعليمية.</p>
          <p><strong>3. حقوق المستخدم:</strong> يحق لك طلب تصدير بياناتك أو طلب حذف الحساب نهائياً في أي وقت.</p>
        </>
      ) : (
        <>
          <p style={{ marginTop: 0 }}><strong>1. Data Collection:</strong> Smart Halaqa collects essential details (Name, Email, Academy info) strictly to operate and facilitate learning services.</p>
          <p><strong>2. Data Usage & Protection:</strong> Student and teacher information is never shared or sold to third parties, used solely for system management.</p>
          <p><strong>3. User Rights:</strong> You reserve the right to export your data or request complete account deletion at any time.</p>
        </>
      )
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (!acceptedTerms) {
      setStatus({
        type: 'error',
        msg: isRtl 
          ? 'يجب الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.' 
          : 'You must accept the Terms and Privacy Policy to continue.'
      });
      return;
    }

    if (!isPasswordValid) {
      setStatus({
        type: 'error',
        msg: isRtl 
          ? 'يرجى استيفاء جميع شروط كلمة المرور الموضحة بالأسفل.' 
          : 'Please satisfy all password requirements shown below.'
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

      if (data?.user) {
        await supabase.from('user_consents').insert([
          {
            user_id: data.user.id,
            consent_type: 'terms_and_privacy',
            version: 'v1.0',
            is_accepted: true,
            language_code: isRtl ? 'ar' : 'en',
            metadata: {
              platform: 'Smart Halaqa',
              role: 'admin',
              signup_source: 'web'
            }
          }
        ]);
      }

      setStatus({
        type: 'success',
        msg: isRtl 
          ? '✅ تم إنشاء حسابك في الحلقة الذكية بنجاح! تفقد بريدك الإلكتروني للتأكيد.' 
          : '✅ Account created successfully in Smart Halaqa! Please check your email.'
      });

      setFullName('');
      setEmail('');
      setPassword('');
      setAcceptedTerms(false);

    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.message || (isRtl ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during signup')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    }
  };

  const getStrengthColor = () => {
    if (validRulesCount <= 1) return '#EF4444';
    if (validRulesCount <= 3) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070C12', padding: '20px', fontFamily: "'Cairo', sans-serif", position: 'relative' }} dir={isRtl ? 'rtl' : 'ltr'}>
      
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* زر التبديل السريع بين اللغات العائم */}
      <button
        type="button"
        onClick={toggleLanguage}
        style={{
          position: 'absolute',
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
          zIndex: 10
        }}
      >
        <Globe size={14} color="#D97706" />
        <span>{isRtl ? 'English' : 'العربية'}</span>
      </button>

      <div style={{ width: '100%', maxWidth: '420px', background: '#0F172A', padding: '35px 25px', borderRadius: '20px', border: '1px solid #1E293B', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* الشعار والهوية البصرية */}
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
          {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', marginBottom: '22px' }}>
          {isRtl ? 'ابدأ في إدارة حلقتك التعليمية بذكاء وسهولة' : 'Start managing your academy effortlessly'}
        </p>

        {/* التسجيل عبر Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
            cursor: 'pointer',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
          <span style={{ color: '#64748B', fontSize: '12px' }}>{isRtl ? 'أو عبر البريد' : 'or via email'}</span>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
        </div>

        {status.msg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '18px',
            fontSize: '13px',
            lineHeight: '1.6',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#34D399' : '#F87171',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{status.msg}</div>
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
              className="form-input-field"
            />
            <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', color: fullName ? '#D97706' : '#64748B', transition: 'color 0.2s' }} />
          </div>

          {/* البريد الإلكتروني */}
          <div style={{ position: 'relative' }}>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              required
              className="form-input-field"
            />
            <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', color: email ? '#D97706' : '#64748B', transition: 'color 0.2s' }} />
          </div>

          {/* كلمة المرور */}
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRtl ? 'كلمة المرور' : 'Password'}
              required
              className="form-input-field"
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', color: password ? '#D97706' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* مؤشر وشروط كلمة المرور الحية */}
          {password && (
            <div style={{ background: '#090F16', padding: '12px', borderRadius: '10px', border: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ height: '4px', width: '100%', background: '#1E293B', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(validRulesCount / 4) * 100}%`, 
                  background: getStrengthColor(), 
                  transition: 'all 0.3s ease' 
                }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div style={{ color: rules.length ? '#34D399' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {rules.length ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {isRtl ? '8+ أحرف' : '8+ Characters'}
                </div>
                <div style={{ color: rules.capital ? '#34D399' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {rules.capital ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {isRtl ? 'حرف كبير (A-Z)' : 'Uppercase (A-Z)'}
                </div>
                <div style={{ color: rules.number ? '#34D399' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {rules.number ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {isRtl ? 'رقم (0-9)' : 'Number (0-9)'}
                </div>
                <div style={{ color: rules.special ? '#34D399' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {rules.special ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {isRtl ? 'رمز خاص (@!#)' : 'Symbol (@!#)'}
                </div>
              </div>
            </div>
          )}

          {/* مربع الموافقة على الشروط والسياسات */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#94A3B8' }}>
            <input 
              type="checkbox" 
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ accentColor: '#D97706', width: '16px', height: '16px', cursor: 'pointer', marginTop: '3px' }}
            />
            <label htmlFor="terms" style={{ cursor: 'pointer', lineHeight: '1.5' }}>
              {isRtl ? 'أوافق على ' : 'I agree to '}
              <button 
                type="button"
                onClick={() => setModalContent('terms')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#F59E0B', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
              >
                {isRtl ? 'الشروط والأحكام' : 'Terms of Service'}
              </button>
              {isRtl ? ' و ' : ' and '}
              <button 
                type="button"
                onClick={() => setModalContent('privacy')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#F59E0B', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
              >
                {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </button>
              {isRtl ? ' لمنصة الحلقة الذكية' : ' for Smart Halaqa'}
            </label>
          </div>

          {/* زر التسجيل مع أيقونة دوران ناعمة عند التحميل */}
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
              marginTop: '6px',
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>{isRtl ? 'جاري إنشاء الحساب...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{isRtl ? 'إنشاء حساب' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        {/* شارة الأمان والتقييد المشفر */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '16px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>{isRtl ? 'بياناتك مشفرة ومحمية وفق معايير 256-bit' : '256-bit SSL encrypted & secure data'}</span>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <span onClick={onSwitchToLogin} style={{ color: '#F59E0B', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRtl ? 'تسجيل الدخول' : 'Log In'}
          </span>
        </div>

      </div>

      {/* النافذة المنبثقة للشروط والسياسات */}
      {modalContent && policyTexts[modalContent] && (
        <div 
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div style={{
            background: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#F8FAFC', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                {policyTexts[modalContent].title}
              </h3>
              <button 
                onClick={() => setModalContent(null)} 
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', color: '#CBD5E1', fontSize: '13px', lineHeight: '1.8', overflowY: 'auto', textAlign: isRtl ? 'right' : 'left' }}>
              {policyTexts[modalContent].content}
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #1E293B', textAlign: isRtl ? 'left' : 'right', background: '#090F16' }}>
              <button 
                onClick={() => setModalContent(null)}
                style={{ padding: '8px 22px', background: '#D97706', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                {isRtl ? 'فهمت وموافق' : 'I Understand'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
