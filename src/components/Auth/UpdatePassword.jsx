import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Lock, AlertCircle, ShieldCheck, Loader2, Globe, CheckCircle2 } from 'lucide-react';

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

export default function UpdatePassword({ onSuccess }) {
  const { i18n } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get('lang');
    if (langParam && (langParam === 'ar' || langParam === 'en')) {
      if (i18n?.changeLanguage) {
        i18n.changeLanguage(langParam);
      }
    }
  }, [i18n]);

  const isRtl = i18n?.language === 'ar';

  useEffect(() => {
    document.title = isRtl ? 'تحديث كلمة المرور | الحلقة الذكية' : 'Update Password | Smart Halaqa';
  }, [isRtl]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) i18n.changeLanguage(nextLang);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });

    if (password.length < 6) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters'
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        msg: isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus({
          type: 'error',
          msg: error.message || (isRtl ? 'فشل تحديث كلمة المرور' : 'Failed to update password')
        });
      } else {
        setIsDone(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2500);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err?.message || (isRtl ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred')
      });
    } finally {
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

        {!isDone ? (
          <>
            <h2 style={{ color: '#E2E8F0', fontSize: '18px', textAlign: 'center', marginBottom: '6px', fontWeight: '600' }}>
              {isRtl ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', marginBottom: '22px', lineHeight: '1.6' }}>
              {isRtl ? 'يرجى إدخال كلمة المرور الجديدة وتأكيدها' : 'Please enter and confirm your new password'}
            </p>

            {status.msg && (
              <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{status.msg}</div>
              </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                  required
                  dir="ltr"
                  className="form-input-field"
                />
                <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: password ? '#D97706' : '#64748B' }} />
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder={isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                  required
                  dir="ltr"
                  className="form-input-field"
                />
                <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '14px', color: confirmPassword ? '#D97706' : '#64748B' }} />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '14px', background: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={18} className="spin-icon" /> : <span>{isRtl ? 'حفظ كلمة المرور' : 'Save New Password'}</span>}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle2 size={54} color="#10B981" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h2 style={{ color: '#E2E8F0', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {isRtl ? 'تم التحديث بنجاح!' : 'Updated Successfully!'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' }}>
              {isRtl ? 'تم تغيير كلمة المرور الخاصة بك، جارٍ تحويلك لتسجيل الدخول...' : 'Your password has been reset. Redirecting to login...'}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginTop: '24px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>{isRtl ? 'بياناتك مشفرة ومحمية بالكامل' : '256-bit SSL Encrypted'}</span>
        </div>

      </div>
    </div>
  );
}
