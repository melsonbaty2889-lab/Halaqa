import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginPage({ onSwitchToSignUp, onSwitchToForgotPassword }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      window.location.reload(); // إعادة تحميل لمزامنة الحالة
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#111C2A', padding: '40px', borderRadius: '24px', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#C9A84C', fontSize: '1.8rem', margin: '0 0 10px 0' }}>{t('signIn')}</h2>
          <p style={{ color: '#94a3b8' }}>{t('welcome')}</p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <FaEnvelope style={{ position: 'absolute', right: '15px', top: '15px', color: '#64748b' }} />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')} style={{ width: '100%', padding: '14px 40px 14px 14px', borderRadius: '12px', border: '1px solid #334155', background: '#162030', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ position: 'relative' }}>
            <FaLock style={{ position: 'absolute', right: '15px', top: '15px', color: '#64748b' }} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} style={{ width: '100%', padding: '14px 40px 14px 14px', borderRadius: '12px', border: '1px solid #334155', background: '#162030', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          <button type="button" onClick={onSwitchToForgotPassword} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
            {t('forgotPassword?')}
          </button>

          <button type="submit" disabled={loading} style={{ padding: '14px', background: '#C9A84C', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? t('loading') : t('signIn')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
          {t('or')}
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
        </div>

        <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '14px', background: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
          <FaGoogle color="#DB4437" /> {t('signInWithGoogle')}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onSwitchToSignUp} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontWeight: '600' }}>
            {t('createAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
