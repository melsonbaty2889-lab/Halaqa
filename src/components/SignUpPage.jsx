import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SignUpPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !fullName.trim() || !academyName.trim()) {
      return setErrorMsg('برجاء ملء جميع الحقول المطلوبة');
    }

    if (password.length < 6) {
      return setErrorMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      // 1. إنشاء المستخدم
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { full_name: fullName.trim() }, // تخزين الاسم في user_metadata
        },
      });

      if (authError) throw authError;

      const user = authData?.user;
      if (!user) throw new Error('فشل إنشاء المستخدم');

      // 2. إنشاء الأكاديمية والـ staff
      // نستخدم transaction-like pattern (sequential inserts)
      const { data: academyData, error: academyError } = await supabase
        .from('academies')
        .insert([{ name: academyName.trim() }])
        .select()
        .single();

      if (academyError) throw academyError;

      const { error: staffError } = await supabase
        .from('staff')
        .insert([
          {
            user_id: user.id,
            name: fullName.trim(),
            role: 'admin',
            academy_id: academyData.id,
          },
        ]);

      if (staffError) throw staffError;

      setSuccessMsg(
        'تم إنشاء حسابك وأكاديميتك بنجاح! 🎉\n' +
        'تم إرسال رابط التأكيد إلى بريدك الإلكتروني.\n' +
        'يرجى التحقق من البريد (بما في ذلك مجلد السبام).'
      );

      // تنظيف الحقول
      setEmail('');
      setPassword('');
      setFullName('');
      setAcademyName('');
    } catch (error: any) {
      console.error(error);
      let message = 'حدث خطأ غير متوقع أثناء التسجيل';

      if (error.message?.includes('already registered')) {
        message = 'هذا البريد الإلكتروني مسجل مسبقاً';
      } else if (error.message?.includes('Password')) {
        message = 'كلمة المرور ضعيفة جداً';
      }

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: '#fff',
      direction: 'rtl',
      padding: '20px',
      fontFamily: "'Cairo', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: '#1e293b',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fbbf24', margin: '0 0 8px 0', fontWeight: 'bold' }}>
            ✨ إنشاء حساب مشرف جديد
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            ابدأ تأسيس حلقة تحفيظك الرقمية وسجل أكاديميتك سحابياً الآن
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#7f1d1d',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            border: '1px solid #991b1b'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: '#064e3b',
            color: '#6ee7b7',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            border: '1px solid #065f46',
            whiteSpace: 'pre-line'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>
              الاسم الكامل للشيخ / المشرف
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#fff',
                boxSizing: 'border-box'
              }}
              placeholder="مثال: فضيلة الشيخ محمد أحمد..."
            />
          </div>

          {/* Academy Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>
              اسم الأكاديمية / الحلقة
            </label>
            <input
              type="text"
              required
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#fff',
                boxSizing: 'border-box'
              }}
              placeholder="مثال: أكاديمية الإيمان والفرقان"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>
              البريد الإلكتروني للإدارة
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#fff',
                boxSizing: 'border-box',
                textAlign: 'left',
                direction: 'ltr'
              }}
              placeholder="admin@academy.com"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#fff',
                boxSizing: 'border-box',
                textAlign: 'left',
                direction: 'ltr'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#fbbf24',
              color: '#0f172a',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.85 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'جاري تأسيس الأكاديمية سحابياً... ⏳' : '🚀 تسجيل وتأسيس الحلقة السحابية'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
          لديك حساب مشرف بالفعل؟{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#fbbf24',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              fontWeight: 'bold',
              fontFamily: 'inherit'
            }}
          >
            تسجيل الدخول من هنا
          </button>
        </div>
      </div>
    </div>
  );
}
