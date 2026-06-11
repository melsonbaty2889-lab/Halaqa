import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword({ onBackToLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://smart-halaqa.vercel.app/', // سيكتشف App.jsx الرابط هنا
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage(t('checkYourEmail')); // تأكد من إضافة هذا النص في ملف الترجمة الخاص بك
      setIsError(false);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center', color: '#fff' }}>
      <h2>{t('forgotPassword')}</h2>
      <form onSubmit={handleReset}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder={t('email')}
          required
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: 'none' }}
        />
        <button 
          type="submit" 
          disabled={loading} // الزر يتعطل تماماً أثناء الإرسال
          style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#64748b' : '#fbbf24', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? t('loading') : t('sendResetLink')}
        </button>
      </form>
      
      <button onClick={onBackToLogin} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}>
        {t('backToLogin')}
      </button>

      {message && (
        <p style={{ marginTop: '20px', color: isError ? '#f87171' : '#4ade80' }}>
          {message}
        </p>
      )}
    </div>
  );
}
