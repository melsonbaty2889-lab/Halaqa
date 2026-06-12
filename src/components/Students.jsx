import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useAcademy } from "../context/AcademyContext";
import { C } from "../constants/colors";

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();
  const { academyId } = useAcademy();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({ 
    name: "", phone: "", countryCode: "+20", payment_plan: "شهري" 
  });

  const countries = ["+20", "+966", "+971", "+965", "+973", "+968", "+964"];

  const handleAdd = async () => {
    // 1. تشخيص سريع قبل الإرسال
    if (!academyId) {
      console.error("Critical Error: academyId is missing in Context!");
      return alert(t("خطأ: لم يتم التعرف على الأكاديمية. أعد تسجيل الدخول."));
    }

    if (!newStudent.name || !newStudent.phone) return alert(t("يرجى ملء البيانات"));
    
    setLoading(true);
    const cleanedPhone = newStudent.phone.replace(/^0+/, '');

    const studentToInsert = { 
      name: newStudent.name, 
      parent_phone: cleanedPhone, 
      country_code: newStudent.countryCode, 
      academy_id: academyId, 
      payment_plan: newStudent.payment_plan,
      level_score: 0 
    };

    console.log("Attempting to insert to Supabase:", studentToInsert);

    // 2. محاولة الإضافة
    const { data, error } = await supabase
      .from("students")
      .insert([studentToInsert])
      .select();
    
    if (error) {
      // 3. كشف الخطأ الحقيقي
      console.error("Supabase Detailed Error:", error);
      alert("خطأ تقني: " + error.message);
    } else {
      console.log("Success! Data inserted:", data);
      setStudents(prev => [...prev, ...data]);
      setIsModalOpen(false);
      setNewStudent({ name: "", phone: "", countryCode: "+20", payment_plan: "شهري" });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", color: "#fff", direction: "rtl", maxWidth: "800px", margin: "auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ color: C.gold }}>{t("students")}</h2>
        <button onClick={() => setIsModalOpen(true)} style={{ background: C.gold, padding: "12px 24px", borderRadius: "12px", border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          + {t("add_student")}
        </button>
      </header>

      <div style={{ display: "grid", gap: "15px" }}>
        {students.filter(s => s.academy_id === academyId).map((s) => (
          <div key={s.id} style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #334155" }}>
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>{s.name}</h3>
              <div style={{ fontSize: "0.9em", color: "#94a3b8" }}>
                📞 {s.country_code} {s.parent_phone} <br />
                📋 {t("plan")}: {s.payment_plan} | ⭐ {t("level")}: {s.level_score}
              </div>
            </div>
            <button onClick={() => window.open(`https://wa.me/${s.country_code}${s.parent_phone}`, '_blank')} style={{ background: "#25D366", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "1.2em" }}>💬</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", padding: "30px", borderRadius: "20px", width: "90%", maxWidth: "350px", display: "flex", flexDirection: "column", gap: "15px", border: "1px solid #1e293b" }}>
            <h3 style={{ textAlign: "center", margin: "0 0 10px 0" }}>{t("إضافة طالب جديد")}</h3>
            <input placeholder={t("الاسم")} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} style={{ padding: "12px", borderRadius: "10px", border: "none", background: "#1e293b", color: "#fff" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <select onChange={(e) => setNewStudent({...newStudent, countryCode: e.target.value})} style={{ padding: "10px", borderRadius: "10px", background: "#1e293b", color: "#fff", border: "none" }}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="tel" placeholder={t("رقم الهاتف")} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#1e293b", color: "#fff" }} />
            </div>
            <input placeholder={t("الخطة")} onChange={(e) => setNewStudent({...newStudent, payment_plan: e.target.value})} style={{ padding: "12px", borderRadius: "10px", border: "none", background: "#1e293b", color: "#fff" }} />
            <button onClick={handleAdd} disabled={loading} style={{ padding: "14px", background: C.gold, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? "..." : t("حفظ")}
            </button>
            <button onClick={() => setIsModalOpen(false)} style={{ padding: "12px", background: "transparent", border: "1px solid #444", color: "#fff", borderRadius: "10px" }}>{t("إلغاء")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
