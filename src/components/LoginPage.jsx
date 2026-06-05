import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage({ onLoginSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setErrorMsg('برجاء إدخال البريد الإلكتروني وكلمة المرور');
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data?.session) {
        onLoginSuccess(data.session);
      }
    } catch (error) {
      setErrorMsg(error.message || 'خطأ في بيانات تسجيل الدخول، تأكد من صحتها');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff', direction: 'rtl', padding: '20px', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fbbf24', margin: '0 0 8px 0', fontWeight: 'bold' }}>🔑 تسجيل دخول المعلم</h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>مرحباً بك مجدداً في نظام إدارة الحلقات السحابي</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', border: '1px solid #991b1b' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>البريد الإلكتروني المعتمد</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }}
              placeholder="your-email@academy.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', textAlign: 'left', direction: 'ltr' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
          >
            {loading ? 'جاري التحقق والمزامنة... ⏳' : '🔓 دخول آمن للوحة التحكم'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
          ليس لديك حساب أكاديمية؟{' '}
          <button
            onClick={onSwitchToSignUp}
            style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 'bold', fontFamily: 'inherit' }}
          >
            تأسيس أكاديمية جديدة من هنا
          </button>
        </div>

      </div>
    </div>
  );
}
