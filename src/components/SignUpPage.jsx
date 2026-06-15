import { useState } from "react";
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export default function SignUpPage({ onSwitchToLogin }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isRtl = i18n.language === 'ar';
  const goldColor = '#C9A84C';

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      return setError(isRtl ? 'برجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
    }
    if (password.length < 6) {
      return setError(isRtl ? 'يجب ألا تقل كلمة المرور عن 6 أحرف' : 'Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: { 
          data: { name: name.trim() } 
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      alert(isRtl ? "✅ تم إنشاء الحساب بنجاح! راجع بريدك الإلكتروني لتأكيده ثم سجل دخولك." : "✅ Account created! Check your email to confirm, then log in.");
      onSwitchToLogin();
    } catch (err) {
      console.error("SignUp Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // دالة موحدة لجلب نص الحقل الفارغ بناءً على اتجاه الملف الحالي
  const getRequiredMsg = () => {
    return isRtl ? 'هذا الحقل مطلوب ولا يمكن تركه فارغاً' : 'This field is required';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#111C2A', padding: '40px 30px', borderRadius: '16px', border: '1px solid #1E2D3D', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        
        <h2 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800', textAlign: 'center' }}>
          {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 32px 0', textAlign: 'center' }}>
          {isRtl ? 'انضم إلينا لإدارة حلقتك القرآنيّة بذكاء' : 'Join us to manage your Quranic circle smartly'}
        </p>

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* حقل الاسم المطور */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '15px', color: '#64748b' }}>
              <FaUser />
            </span>
            <input 
              type="text" 
              placeholder={isRtl ? 'الاسم الكامل' : 'Full Name'}
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              
              // 🌟 التحكم بالترجمة
              onInvalid={(e) => e.target.setCustomValidity(getRequiredMsg())}
              onInput={(e) => e.target.setCustomValidity('')}
              
              style={{ width: '100%', padding: '14px 15px 14px ' + (isRtl ? '15px' : '45px'), paddingRight: isRtl ? '45px' : '15px', borderRadius: '12px', border: '1px solid #223147', background: '#090F16', color: '#fff', fontSize: '14px', outline: 'none', textAlign: isRtl ? 'right' : 'left' }}
            />
          </div>

          {/* حقل البريد المطور */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '15px', color: '#64748b' }}>
              <FaEnvelope />
            </span>
            <input 
              type="email" 
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              
              // 🌟 التحكم بالترجمة
              onInvalid={(e) => e.target.setCustomValidity(getRequiredMsg())}
              onInput={(e) => e.target.setCustomValidity('')}
              
              style={{ width: '100%', padding: '14px 15px 14px ' + (isRtl ? '15px' : '45px'), paddingRight: isRtl ? '45px' : '15px', borderRadius: '12px', border: '1px solid #223147', background: '#090F16', color: '#fff', fontSize: '14px', outline: 'none', textAlign: isRtl ? 'right' : 'left' }}
            />
          </div>

          {/* حقل كلمة السر المطور ذو التحقق المزدوج للـ Required والـ minLength */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '15px', color: '#64748b' }}>
              <FaLock />
            </span>
            <input 
              type="password" 
              placeholder={isRtl ? 'كلمة المرور (6 أحرف فأكثر)' : 'Password (min 6 characters)'}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              minLength={6} // التحقق المدمج الأصلي لـ HTML5
              
              // 🌟 التحكم الذكي بالترجمة بحسب نوع الخطأ (فارغ أم قصير)
              onInvalid={(e) => {
                if (e.target.value === '') {
                  e.target.setCustomValidity(getRequiredMsg());
                } else {
                  e.target.setCustomValidity(isRtl ? 'يجب ألا تقل كلمة المرور عن 6 أحرف' : 'Password must be at least 6 characters');
                }
              }}
              onInput={(e) => e.target.setCustomValidity('')}
              
              style={{ width: '100%', padding: '14px 15px 14px ' + (isRtl ? '15px' : '45px'), paddingRight: isRtl ? '45px' : '15px', borderRadius: '12px', border: '1px solid #223147', background: '#090F16', color: '#fff', fontSize: '14px', outline: 'none', textAlign: isRtl ? 'right' : 'left' }}
            />
          </div>

          {error && <p style={{ color: "#EF4444", textAlign: "center", fontSize: '13px', margin: 0, padding: '5px', background: 'rgba(239,68,68,0.05)', borderRadius: '6px' }}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading} 
            style={{ padding: "14px", background: goldColor, color: "#000", border: "none", borderRadius: '12px', fontSize: "15px", fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: '10px', transition: 'all 0.2s' }}
          >
            {loading ? (isRtl ? 'جاري إنشاء الحساب...' : 'Creating...') : (isRtl ? 'إنشاء حساب معلم' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: '#64748b', fontSize: '14px' }}>
          {isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
          <button 
            onClick={onSwitchToLogin} 
            style={{ color: goldColor, border: "none", background: "none", cursor: 'pointer', fontWeight: '700', fontSize: '14px', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            {isRtl ? <FaArrowLeft size={11} /> : <FaArrowRight size={11} />}
          </button>
        </p>

      </div>
    </div>
  );
}
