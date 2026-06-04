import { useState } from 'react';
import { supabase } from '../supabaseClient'; // تأكد من صحة مسار ملف سوبابيز في مشروعك

export default function LoginPage() {
  // حالتان: false تعني تسجيل دخول، و true تعني إنشاء أكاديمية جديدة
  const [isSignUp, setIsSignUp] = useState(false);
  
  // حالات المدخلات
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [loading, setLoading] = useState(false);

  // دالة المعالجة الموحدة (تسجيل دخول / إنشاء حساب)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // 🚀 تدفق الـ SaaS: إنشاء حساب وتمرير بيانات الأكاديمية للتريجر
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            academy_name: academyName
          }
        }
      });

      if (error) {
        alert("خطأ في تأسيس الأكاديمية: " + error.message);
      } else {
        alert("تم إنشاء أكاديميتك بنجاح! يرجى مراجعة بريدك لتأكيد الحساب والبدء.");
      }
    } else {
      // 🔐 تدفق تسجيل الدخول العادي للمدرسين والمديرين
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert("خطأ في تسجيل الدخول: " + error.message);
      } else {
        alert("مرحباً بك مجدداً في نظام حلقة! جاري توجيهك...");
        // هنا يمكنك إضافة توجيه للمستخدم إلى الـ Dashboard
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {isSignUp ? 'تأسيس أكاديمية قرآنية جديدة' : 'تسجيل الدخول إلى حلقة'}
        </h2>
        <p style={styles.subtitle}>
          {isSignUp ? 'ابدأ إطلاق منصتك الخاصة لإدارة الحلقات والطلاب عالمياً' : 'مرحباً بك! أدخل بياناتك لمتابعة حلقاتك'}
        </p>

        <form onSubmit={handleAuthSubmit} style={styles.form}>
          {isSignUp && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>اسمك الكامل</label>
                <input type="text" style={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>اسم الأكاديمية القرآنية</label>
                <input type="text" style={styles.input} value={academyName} onChange={(e) => setAcademyName(e.target.value)} required />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>البريد الإلكتروني</label>
            <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <input type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'جاري المعالجة...' : isSignUp ? 'أنشئ أكاديميتك الآن 🚀' : 'تسجيل الدخول 🔐'}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <button onClick={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
            {isSignUp ? 'لديك أكاديمية بالفعل؟ سجل دخولك' : 'تريد إطلاق أكاديميتك الخاصة؟ أنشئ حساباً جديداً'}
          </button>
        </div>
      </div>
    </div>
  );
}

// تصميم مخصص، بسيط وهادئ ليعطي طابع الـ Premium SaaS
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f6f8', direction: 'rtl', fontFamily: 'sans-serif', padding: '20px' },
  card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '450px', width: '100%', textAlign: 'center' },
  title: { fontSize: '24px', color: '#1a1a1a', marginBottom: '8px', fontWeight: 'bold' },
  subtitle: { fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'right' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', color: '#444', fontWeight: '500' },
  input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', backgroundColor: '#fafafa' },
  button: { padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s' },
  toggleContainer: { marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' },
  toggleButton: { background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', fontSize: '14px' }
};
