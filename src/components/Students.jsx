import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAcademy } from "../context/AcademyContext";
import { C } from "../constants/colors";
import { FaUserPlus, FaSearch, FaUserGraduate, FaPhoneAlt, FaTimes } from "react-icons/fa";

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();
  const { academyId } = useAcademy();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", phone: "" });

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
      .insert([{ name: newStudent.name, parent_phone: newStudent.phone, academy_id: academyId, status: 'active', level_score: 0, payment_plan: "شهري" }])
      .select();
    
    if (error) { alert("خطأ: " + error.message); } else {
      setStudents(prev => [...prev, ...data]);
      setIsModalOpen(false);
      setNewStudent({ name: "", phone: "" });
    }
    setLoading(false);
  };

  return (
    // التغيير هنا: الخلفية تأخذ C.bg والنص يأخذ C.text
    <div style={{ padding: "20px", color: C.text, direction: "rtl", maxWidth: "800px", margin: "auto", background: C.bg, minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ color: C.gold, display: "flex", alignItems: "center", gap: "10px" }}>
          <FaUserGraduate /> {t("students")}
        </h2>
        <button onClick={() => setIsModalOpen(true)} style={{ background: C.gold, padding: "12px 24px", borderRadius: "12px", border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>
          <FaUserPlus /> {t("add_student")}
        </button>
      </header>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <FaSearch style={{ position: "absolute", right: "15px", top: "14px", color: C.textMuted }} />
          <input placeholder={t("بحث...")} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "12px 40px", borderRadius: "12px", border: "1px solid " + C.border, background: C.surface, color: C.text }} />
        </div>
        <select onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "10px", borderRadius: "12px", background: C.surface, color: C.text, border: "1px solid " + C.border }}>
          <option value="active">{t("النشطون")}</option>
          <option value="inactive">{t("غير النشطين")}</option>
          <option value="all">{t("الكل")}</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        {filteredStudents.map((s) => (
          <Link to={`/student/${s.id}`} key={s.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            {/* الخلفية هنا أصبحت C.surface بدلاً من اللون الثابت */}
            <div style={{ background: C.surface, padding: "20px", borderRadius: "16px", borderRight: s.status === 'inactive' ? "5px solid #ef4444" : "5px solid " + C.gold, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid " + C.border }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0" }}>{s.name}</h3>
                <div style={{ fontSize: "0.9em", color: C.textMuted, display: "flex", alignItems: "center", gap: "6px" }}><FaPhoneAlt /> {s.parent_phone}</div>
              </div>
              <div style={{ fontSize: "0.8em", padding: "5px 12px", borderRadius: "20px", background: s.status === 'active' ? "#065f46" : "#450a0a", color: '#fff' }}>{t(s.status)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
