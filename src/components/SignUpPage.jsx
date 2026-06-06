import { useState } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';   // تأكد من المسار

export default function SignUpPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');           // اسم المعلم
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. إنشاء حساب المستخدم
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. إضافة بيانات المعلم في جدول staff
      if (authData.user) {
        const { error: staffError } = await supabase
          .from('staff')
          .insert({
            user_id: authData.user.id,
            name,
            phone,
            // academy_id يمكن إضافته لاحقاً أو جعله null
          });

        if (staffError) throw staffError;
      }

      alert("تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.");
      onSwitchToLogin();
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: C.bg, 
      color: C.text, 
      fontFamily: "'Cairo', sans-serif",
      direction: "rtl",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>🕌</span>
          <h1 style={{ color: C.gold, margin: "16px 0 8px" }}>إنشاء حساب جديد</h1>
          <p style={{ color: C.muted }}>الحلقة الذكية</p>
        </div>

        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }}
          />

          <input
            type="tel"
            placeholder="رقم الجوال (بدون 0 أو +)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }}
          />

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }}
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }}
          />

          {error && <p style={{ color: "#EF4444", textAlign: "center" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: C.gold,
              color: "#1A1208",
              border: "none",
              borderRadius: 8,
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: C.muted }}>
          لديك حساب بالفعل؟{" "}
          <button 
            onClick={onSwitchToLogin}
            style={{ color: C.gold, background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
}
