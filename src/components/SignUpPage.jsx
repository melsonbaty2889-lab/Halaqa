import { useState } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function SignUpPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. إنشاء المستخدم في نظام المصادقة
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. التحقق من وجود المستخدم قبل الإدخال في جدول staff
      if (authData.user) {
        // نستخدم الإدخال المباشر. تأكد أن سياستك تسمح بالـ INSERT لـ authenticated
        const { error: staffError } = await supabase
          .from('staff')
          .insert([
            {
              user_id: authData.user.id,
              name: name.trim(),
              role: 'teacher',
              academy_id: null
            }
          ]);

        if (staffError) {
          console.error("Staff Insert Error:", staffError);
          throw new Error("فشل في ربط بيانات المعلم بقاعدة البيانات");
        }
      }

      alert("✅ تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
      onSwitchToLogin();
    } catch (err) {
      console.error("SignUp Error:", err);
      setError(err.message || "حدث خطأ غير متوقع أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Cairo', sans-serif", direction: "rtl",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>🕌</span>
          <h1 style={{ color: C.gold, margin: "16px 0 8px" }}>إنشاء حساب معلم</h1>
        </div>

        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="text" placeholder="الاسم الكامل" value={name} onChange={e => setName(e.target.value)} required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }} />

          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }} />

          <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }} />

          {error && <p style={{ color: "#EF4444", textAlign: "center" }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            padding: "14px", background: C.gold, color: "#1A1208", border: "none",
            borderRadius: 8, fontSize: "1.1rem", fontWeight: 700
          }}>
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: C.muted }}>
          لديك حساب؟ <button onClick={onSwitchToLogin} style={{color: C.gold, border: "none", background: "none"}}>تسجيل الدخول</button>
        </p>
      </div>
    </div>
  );
}
