import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, User, Loader2, ShieldCheck, Globe } from 'lucide-react';

// 🌟 شعار منصة الحلقة الذكية الموحد
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
        <linearGradient id="goldGradUpdate" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="emeraldGradUpdate" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12" stroke="url(#goldGradUpdate)" strokeWidth="1.8" />
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#emeraldGradUpdate)" stroke="#fef08a" strokeWidth="0.8" />
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#emeraldGradUpdate)" stroke="#fef08a" strokeWidth="0.8" />
    </svg>
  </div>
);

export default function UpdatePassword() {
  const { i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar';

  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [status, setStatus] = useState({ type: null, msg: '' });

  useEffect(() => {
    document.title = isRtl ? 'تحديث كلمة المرور | الحلقة الذكية' : 'Update Password | Smart Halaqa';
  }, [isRtl]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error || !currentUser) {
          setStatus({
            type: 'error',
            msg: isRtl ? 'رابط إعادة التعيين غير صالح أو انتهت صلاحيته' : 'Invalid or expired reset link'
          });
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setFetchingUser(false);
      }
    }
    loadUser();
  }, [isRtl]);

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (password !== confirmPassword) {
      setStatus({ 
        type: 'error', 
        msg: isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' 
      });
      return;
    }

    if (strength < 2) {
      setStatus({ 
        type: 'error', 
        msg: isRtl ? 'يرجى اختيار كلمة مرور أقوى تحتوي على أرقام وحروف' : 'Please choose a stronger password' 
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setStatus({
        type: 'success',
        msg: isRtl ? '✅ تم تحديث كلمة المرور بنجاح! جاري تحويلك...' : '✅ Password updated successfully! Redirecting...'
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.message || (isRtl ? 'حدث خطأ أثناء التحديث' : 'An error occurred')
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070C12', color: '#CBD5E1', fontFamily: "'Cairo', sans-serif" }}>
        <Loader2 size={24} className="spin-icon" style={{ marginLeft: '10px' }} />
        <span>{isRtl ? 'جاري التحقق من الحساب...' : 'Verifying user account...'}</span>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

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

        <h2 style={{ color: '#E2E8F0', fontSize: '18px', textAlign: 'center', marginBottom: '16px', fontWeight: '600' }}>
          {isRtl ? 'تحديث كلمة المرور' : 'Update Password'}
        </h2>

        {user && (
          <div style={{ background: '#090F16', padding: '12px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', border: '1px solid #223147' }}>
            <User style={{ color: '#D97706', flexShrink: 0 }} size={24} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName}
              </div>
              <div style={{ color: '#38BDF8', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {status.msg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#34D399' : '#F87171',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            {status.type === 'success' ? <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> : <AlertTriangle size={18} style={{ flexShrink: 0 }} />}
            <div>{status.msg}</div>
          </div>
        )}

        {user && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                required
                className="form-input-field"
              />
              <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: password ? '#D97706' : '#64748B' }} />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '14px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password && (
              <div style={{ display: 'flex', gap: '5px', height: '4px', marginTop: '-6px' }}>
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    style={{ 
                      flex: 1, 
                      borderRadius: '2px', 
                      background: step <= strength 
                        ? (strength <= 1 ? '#EF4444' : strength <= 3 ? '#F59E0B' : '#10B981') 
                        : '#1E293B',
                      transition: 'all 0.3s' 
                    }} 
                  />
                ))}
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                required
                className="form-input-field"
              />
              <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: confirmPassword ? '#D97706' : '#64748B' }} />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '14px', background: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>{isRtl ? 'جاري التحديث...' : 'Updating...'}</span>
                </>
              ) : (
                <span>{isRtl ? 'تحديث كلمة المرور' : 'Update Password'}</span>
              )}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '24px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>{isRtl ? 'بياناتك مشفرة ومحمية بالكامل' : '256-bit SSL Encrypted'}</span>
        </div>

      </div>
    </div>
  );
}
