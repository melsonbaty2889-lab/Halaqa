import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://smart-halaqa.vercel.app/update-password',
    });

    if (error) {
      setMessage('خطأ: ' + error.message);
    } else {
      setMessage('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني!');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleReset} style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>{t('forgotPassword')}</h2>
      <input 
        type="email" 
        placeholder={t('email')} 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button disabled={loading} type="submit" style={{ width: '100%', padding: '10px' }}>
        {loading ? t('loading') : t('sendResetLink')}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
