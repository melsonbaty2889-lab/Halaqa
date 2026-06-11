import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function LoginPage({ onSwitchToSignUp }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // دالة تسجيل الدخول التقليدي
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setErrorMsg(t('errorLoading')); 
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // دالة تسجيل الدخول عبر جوجل
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://smart-halaqa.vercel.app/dashboard', 
        },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', color: '#fbbf24', margin: '0 0 10px 0', fontWeight: '800' }}>{t('signIn')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{t('welcome')}</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* نموذج الدخول التقليدي */}
        <form onSubmit={handleLogin}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #475569', backgroundColor: 'rgba(15, 23, 42, 0.5)', color: '#fff', boxSizing: 'border-box', marginBottom: '16px' }} />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #475569', backgroundColor: 'rgba(15, 23, 42, 0.5)', color: '#fff', boxSizing: 'border-box', marginBottom: '24px' }} />
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? t('loading') : t('signIn')}
          </button>
        </form>

        {/* فاصل بين الخيارين */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', margin: '24px 0' }}>
          <hr style={{ flex: 1, border: '0', borderTop: '1px solid #475569' }} />
          {t('or')}
          <hr style={{ flex: 1, border: '0', borderTop: '1px solid #475569' }} />
        </div>

        {/* زر جوجل */}
        <button type="button" onClick={handleGoogleLogin} style={{ width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="20" />
          {t('signInWithGoogle')}
        </button>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button onClick={onSwitchToSignUp} style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>
            {t('createAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
