import { useState } from "react";
import { supabase } from "../lib/supabase";
import { C } from "../constants/colors";
import { Card, Input, Btn } from "./UI";

export default function LoginPage() {
  const [lang, setLang] = useState("ar"); // ar = العربية, en = English
  const [mode, setMode] = useState("login"); // login | signup | reset (إدارة الحالات)
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [academyName, setAcademyName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // قاموس النصوص للغات المتعددة
  const t = {
    ar: {
      titleLogin: "تسجيل الدخول للحلقة الذكية",
      titleSignUp: "تأسيس أكاديمية قرآنية جديدة",
      titleReset: "استعادة كلمة المرور",
      subLogin: "مرحباً بك مجدداً، أدخل بيانات حسابk للمتابعة",
      subSignUp: "ابدأ إطلاق منصتك الخاصة لإدارة الحلقات والطلاب عالمياً",
      subReset: "أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور",
      labelName: "اسم المعلم / مدير الأكاديمية",
      labelAcademy: "اسم الأكاديمية القرآنية",
      labelEmail: "البريد الإلكتروني",
      labelPassword: "كلمة المرور",
      btnLogin: "دخول لوحة التحكم 🔐",
      btnSignUp: "أنشئ أكاديميتك الآن 🚀",
      btnReset: "إرسال رابط الاستعادة ✉️",
      forgot: "نسيت بيانات الدخول؟",
      haveAcc: "لديك أكاديمية بالفعل؟ سجل دخولك",
      noAcc: "تريد التسجيل كأكاديمية جديدة؟ أسس أكاديميتك",
      backLogin: "العودة لتسجيل الدخول",
      successReset: "🚀 تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني! يرجى فحص الرسائل الواردة وغير المرغوب فيها (Spam).",
      successSignUp: "🚀 تم إرسال رابط تأكيد الحساب إلى بريدك الإلكتروني بنجاح! يرجى تفعيله للمتابعة.",
      errPrefix: "⚠️ حدث خطأ أثناء المعالجة: ",
      loadingText: "جاري الاتصال بالسيرفر... ⏳"
    },
    en: {
      titleLogin: "Login to Smart Halaqa",
      titleSignUp: "Establish New Quran Academy",
      titleReset: "Reset Password",
      subLogin: "Welcome back! Enter your credentials to continue",
      subSignUp: "Start launching your own platform to manage centers worldwide",
      subReset: "Enter your registered email to receive a password reset link",
      labelName: "Teacher / Manager Full Name",
      labelAcademy: "Quran Academy Name",
      labelEmail: "Email Address",
      labelPassword: "Password",
      btnLogin: "Access Dashboard 🔐",
      btnSignUp: "Create Academy Now 🚀",
      btnReset: "Send Reset Link ✉️",
      forgot: "Forgot credentials?",
      haveAcc: "Already have an academy? Login here",
      noAcc: "Don't have an account? Establish an academy",
      backLogin: "Back to Login",
      successReset: "🚀 Password reset link has been sent to your email! Please check your inbox and spam folder.",
      successSignUp: "🚀 Verification link has been sent to your email! Please verify to activate.",
      errPrefix: "⚠️ An error occurred: ",
      loadingText: "Connecting to cloud server... ⏳"
    }
  };

  const current = t[lang];
  const isRtl = lang === "ar";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        // 🚀 1. تأسيس أكاديمية جديدة
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, academy_name: academyName } },
        });
        if (error) throw error;
        setMessage(current.successSignUp);
      } else if (mode === "login") {
        // 🔐 2. تسجيل دخول اعتيادي
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "reset") {
        // 🔑 3. نسيت كلمة المرور (إرسال رابط الاستعادة السحابي)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, // سيعود المستخدم إلى موقعك بعد الضغط على الرابط
        });
        if (error) throw error;
        setMessage(current.successReset);
      }
    } catch (error) {
      alert(current.errPrefix + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: C.bg, 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center", 
      direction: isRtl ? "rtl" : "ltr", 
      padding: 16, 
      boxSizing: "border-box" 
    }}>
      
      {/* شريط تبديل اللغة العلوي الفخم */}
      <div style={{ position: "absolute", top: 20, right: isRtl ? 20 : "auto", left: isRtl ? "auto" : 20 }}>
        <button
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${C.border}`,
            color: C.gold,
            padding: "6px 14px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontFamily: isRtl ? "'Cairo'" : "sans-serif",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          🌐 {lang === "ar" ? "English" : "العربية"}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420 }}>
        <Card style={{ padding: 32, textAlign: "center" }}>
          
          {/* عنوان الواجهة الديناميكي حسب الحالة واللغة */}
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.gold, marginBottom: 8 }}>
            {mode === "login" && current.titleLogin}
            {mode === "signup" && current.titleSignUp}
            {mode === "reset" && current.titleReset}
          </h1>
          <p style={{ fontSize: "0.85rem", color: C.muted, marginBottom: 24 }}>
            {mode === "login" && current.subLogin}
            {mode === "signup" && current.subSignUp}
            {mode === "reset" && current.subReset}
          </p>

          {/* رسائل تأكيد النجاح السحابية */}
          {message && (
            <div style={{ 
              background: "rgba(16, 185, 129, 0.1)", 
              border: `1px solid ${C.green || '#10B981'}`, 
              color: C.green || '#10B981', 
              padding: 12, 
              borderRadius: 10, 
              fontSize: "0.82rem", 
              marginBottom: 16, 
              lineHeight: 1.5,
              textAlign: isRtl ? "right" : "left"
            }}>
              {message}
            </div>
          )}

          {/* حقول تسجيل الحساب الجديد فقط */}
          {mode === "signup" && (
            <>
              <Input label={current.labelName} value={fullName} onChange={e => setFullName(e.target.value)} placeholder={isRtl ? "أحمد محمد..." : "John Doe..."} required />
              <Input label={current.labelAcademy} value={academyName} onChange={e => setAcademyName(e.target.value)} placeholder={isRtl ? "أكاديمية البيان..." : "Al-Bayan Academy..."} required />
            </>
          )}

          {/* البريد الإلكتروني مطلوب في كل الحالات */}
          <Input label={current.labelEmail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
          
          {/* كلمة المرور مخفية في حالة استعادة الحساب */}
          {mode !== "reset" && (
            <Input label={current.labelPassword} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" required />
          )}

          {/* رابط "نسيت كلمة المرور" يظهر فقط في واجهة تسجيل الدخول */}
          {mode === "login" && (
            <div style={{ textAlign: isRtl ? "left" : "right", marginTop: -8, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => { setMode("reset"); setMessage(""); }}
                style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem", textDecoration: "underline" }}
              >
                {current.forgot}
              </button>
            </div>
          )}

          {/* زر التفعيل الرئيسي */}
          <Btn type="submit" style={{ width: "100%", marginTop: 16, justifyContent: "center" }} disabled={loading}>
            {loading ? current.loadingText : (
              <>
                {mode === "login" && current.btnLogin}
                {mode === "signup" && current.btnSignUp}
                {mode === "reset" && current.btnReset}
              </>
            )}
          </Btn>

          {/* روابط التنقل والتبديل التحتية للواجهة */}
          <div style={{ marginTop: 24, fontSize: "0.85rem", borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => { setMode("signup"); setMessage(""); }}
                style={{ background: "transparent", border: "none", color: C.gold, cursor: "pointer", fontFamily: "inherit", fontWeight: "bold" }}
              >
                {current.noAcc}
              </button>
            )}
            {mode === "signup" && (
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(""); }}
                style={{ background: "transparent", border: "none", color: C.gold, cursor: "pointer", fontFamily: "inherit", fontWeight: "bold" }}
              >
                {current.haveAcc}
              </button>
            )}
            {mode === "reset" && (
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(""); }}
                style={{ background: "transparent", border: "none", color: C.gold, cursor: "pointer", fontFamily: "inherit", fontWeight: "bold" }}
              >
                ← {current.backLogin}
              </button>
            )}
          </div>

        </Card>
      </form>
    </div>
  );
}
