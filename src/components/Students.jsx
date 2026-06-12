import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useAcademy } from "../context/AcademyContext";
import { C } from "../constants/colors";

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();
  const { academyId } = useAcademy();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({ 
    name: "", phone: "", countryCode: "+20", payment_plan: "شهري", status: "active" 
  });

  const countries = ["+20", "+966", "+971", "+965", "+973", "+968", "+964"];

  const filteredStudents = students.filter(s => 
    s.academy_id === academyId && 
    (statusFilter === "all" || s.status === statusFilter) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.parent_phone.includes(searchTerm))
  );

  const handleAdd = async () => {
    // حل مشكلة الأكاديمية
    if (!academyId) {
      console.error("academyId is null!");
      return alert(t("خطأ: لم يتم التعرف على الأكاديمية. أعد تسجيل الدخول."));
    }

    if (!newStudent.name || !newStudent.phone) return alert(t("يرجى ملء البيانات"));
    
    setLoading(true);
    const cleanedPhone = newStudent.phone.replace(/^0+/, '');

    const { data, error } = await supabase
      .from("students")
      .insert([{ 
        ...newStudent,
        parent_phone: cleanedPhone,
        academy_id: academyId,
        level_score: 0 
      }])
      .select();
    
    if (error) {
      console.error(error);
      alert("خطأ: " + error.message);
    } else {
      setStudents(prev => [...prev, ...data]);
      setIsModalOpen(false);
      setNewStudent({ name: "", phone: "", countryCode: "+20", payment_plan: "شهري", status: "active" });
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

      {/* شريط البحث والفلترة */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input placeholder={t("بحث...")} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#1e293b", color: "#fff" }} />
        <select onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "10px", borderRadius: "12px", background: "#1e293b", color: "#fff", border: "none" }}>
          <option value="active">{t("النشطون")}</option>
          <option value="inactive">{t("غير النشطين")}</option>
          <option value="all">{t("الكل")}</option>
        </select>
      </div>

      {/* قائمة الطلاب */}
      <div style={{ display: "grid", gap: "15px" }}>
        {filteredStudents.map((s) => (
          <div key={s.id} style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: s.status === 'inactive' ? "1px solid #ef4444" : "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 8px 0" }}>{s.name}</h3>
            <div style={{ fontSize: "0.9em", color: "#94a3b8" }}>📞 {s.country_code} {s.parent_phone} | 📋 {s.payment_plan}</div>
          </div>
        ))}
      </div>

      {/* المودال المصحح */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} style={{ position: "fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.8)", display:"flex", justifyContent:"center", alignItems:"center", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", padding: "30px", borderRadius: "20px", width: "90%", maxWidth: "350px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <input placeholder={t("الاسم")} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} style={{ padding: "12px", borderRadius: "10px", background: "#1e293b", border: "none", color: "#fff" }} />
            <input placeholder={t("الهاتف")} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} style={{ padding: "12px", borderRadius: "10px", background: "#1e293b", border: "none", color: "#fff" }} />
            <select onChange={(e) => setNewStudent({...newStudent, status: e.target.value})} style={{ padding: "12px", borderRadius: "10px", background: "#1e293b", color: "#fff" }}>
              <option value="active">{t("نشط")}</option>
              <option value="inactive">{t("غير نشط")}</option>
            </select>
            <button onClick={handleAdd} disabled={loading} style={{ padding: "12px", background: C.gold, borderRadius: "10px", border: "none", fontWeight: "bold" }}>{t("حفظ")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
