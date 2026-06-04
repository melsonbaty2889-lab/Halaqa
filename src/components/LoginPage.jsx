import { useState } from "react";
import { supabase } from "../lib/supabase";
import { C, g } from "../constants/colors";
import { Card, Input, Btn } from "./UI";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(true); // التبديل بين إنشاء حساب وتسجيل دخول
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        // 🚀 1. تأسيس أكاديمية جديدة وإرسال البيانات للـ Metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              academy_name: academyName,
            },
          },
        });

        if (error) throw error;
        setMessage("🚀 تم إرسال رابط تأكيد الحساب إلى بريدك الإلكتروني بنجاح! يرجى فحص الوارد والرسائل غير المرغوب فيها.");
      } else {
        // 🔐 2. تسجيل دخول لأكاديمية مسجلة بالفعل
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      alert("⚠️ حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl", padding: 16, boxSizing: "border-box" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420 }}>
        <Card style={{ padding: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {isSignUp ? "تأسيس أكاديمية قرآنية جديدة" : "تسجيل الدخول للحلقة"}
          </h1>
          <p style={{ fontSize: "0.85rem", color: C.muted, marginBottom: 24 }}>
            {isSignUp ? "ابدأ إطلاق منصتك الخاصة لإدارة الحلقات والطلاب عالمياً" : "مرحباً بك مجدداً، أدخل بيانات حسابك للمتابعة"}
          </p>

          {message && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: `1px solid ${C.green}`, color: C.green, padding: 12, borderRadius: 10, fontSize: "0.82rem", marginBottom: 16, lineHeight: 1.5 }}>
              {message}
            </div>
          )}

          {isSignUp && (
            <>
              <Input label="اسمك الكامل" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="محمد مصطفى" required />
              <Input label="اسم الأكاديمية القرآنية" value={academyName} onChange={e => setAcademyName(e.target.value)} placeholder="اقرأ" required />
            </>
          )}

          <Input label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
          <Input label="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" required />

          <Btn type="submit" style={{ width: "100%", marginTop: 16, justifyContent: "center" }} disabled={loading}>
            {loading ? "جاري المعالجة... ⏳" : isSignUp ? "أنشئ أكاديميتك الآن 🚀" : "دخول لوحة التحكم 🔐"}
          </Btn>

          <div style={{ marginTop: 20, fontSize: "0.85rem" }}>
            <span style={{ color: C.muted }}>
              {isSignUp ? "لديك أكاديمية بالفعل؟ " : "ليس لديك حساب؟ "}
            </span>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }}
              style={{ background: "transparent", border: "none", color: C.blue, cursor: "pointer", fontFamily: "'Cairo'", fontWeight: "bold", textDecoration: "underline" }}
            >
              {isSignUp ? "سجل دخولك" : "أسس أكاديميتك الآن"}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
