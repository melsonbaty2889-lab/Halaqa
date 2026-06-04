import { useState } from 'react';
import { supabase } from '../supabaseClient'; // تأكد من صحة مسار ملف تفعيل سوبابيز عندك

export default function SignUp() {
  // 1️⃣ تعريف حالات المدخلات (States) لربطها بالفورم
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [loading, setLoading] = useState(false);

  // 2️⃣ 🌟 هنا تضع الدالة بالتحديد 🌟
  const handleSignUp = async (e) => {
    e.preventDefault(); // منع الصفحة من إعادة التحميل عند إرسال الفورم
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,       // الاسم الكامل لمدير الأكاديمية (يلقطه التريجر)
          academy_name: academyName  // اسم الأكاديمية (يلقطه التريجر)
        }
      }
    });

    setLoading(false);

    if (error) {
      alert("خطأ في التسجيل: " + error.message);
    } else {
      alert("تم إنشاء أكاديميتك بنجاح! راجع بريدك لتأكيد الحساب.");
    }
  };

  // 3️⃣ واجهة العرض التي تربط المدخلات بالدالة
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', direction: 'rtl' }}>
      <h2>تأسيس أكاديمية جديدة (SaaS)</h2>
      
      <form onSubmit={handleSignUp}>
        <div>
          <label>اسمك الكامل:</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        
        <div>
          <label>اسم الأكاديمية القرآنية:</label>
          <input type="text" value={academyName} onChange={(e) => setAcademyName(e.target.value)} required />
        </div>

        <div>
          <label>البريد الإلكتروني:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>كلمة المرور:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'جاري التأسيس...' : 'أنشئ أكاديميتك الآن 🚀'}
        </button>
      </form>
    </div>
  );
          }
