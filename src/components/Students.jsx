import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"; // تأكد من استيراد Link
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
  
  const [newStudent, setNewStudent] = useState({ name: "", phone: "" });

  // الفلترة الذكية المدمجة
  const filteredStudents = students.filter(s => 
    s.academy_id === academyId && 
    (statusFilter === "all" || s.status === statusFilter) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.parent_phone.includes(searchTerm))
  );

  const handleAdd = async () => {
    if (!academyId) return alert(t("خطأ: لم يتم التعرف على الأكاديمية."));
    if (!newStudent.name || !newStudent.phone) return alert(t("يرجى ملء البيانات"));
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from("students")
      .insert([{ 
        name: newStudent.name, 
        parent_phone: newStudent.phone, 
        academy_id: academyId, 
        status: 'active',
        level_score: 0,
        payment_plan: "شهري"
      }])
      .select();
    
    if (error) {
      alert("خطأ: " + error.message);
    } else {
      setStudents(prev => [...prev, ...data]);
      setIsModalOpen(false);
      setNewStudent({ name: "", phone: "" });
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

      {/* قائمة الطلاب مع الربط بصفحة الملف الشخصي */}
      <div style={{ display: "grid", gap: "15px" }}>
        {filteredStudents.map((s) => (
          <Link to={`/student/${s.id}`} key={s.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: s.status === 'inactive' ? "1px solid #ef4444" : "1px solid #334155" }}>
              <h3 style={{ margin: "0 0 5px 0" }}>{s.name}</h3>
              <div style={{ fontSize: "0.9em", color: "#94a3b8" }}>📞 {s.parent_phone}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* المودال */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} style={{ position: "fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.8)", display:"flex", justifyContent:"center", alignItems:"center", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", padding: "30px", borderRadius: "20px", width: "90%", maxWidth: "350px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ textAlign: "center" }}>{t("إضافة طالب جديد")}</h3>
            <input placeholder={t("الاسم الكامل")} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} style={{ padding: "12px", borderRadius: "10px", background: "#1e293b", border: "none", color: "#fff" }} />
            <input type="tel" placeholder={t("رقم الهاتف")} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} style={{ padding: "12px", borderRadius: "10px", background: "#1e293b", border: "none", color: "#fff" }} />
            <button onClick={handleAdd} disabled={loading} style={{ padding: "12px", background: C.gold, borderRadius: "10px", border: "none", fontWeight: "bold" }}>{t("حفظ")}</button>
            <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "#666" }}>{t("إلغاء")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
