import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useAcademy } from "../context/AcademyContext";
import { C } from "../constants/colors";

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();
  const { academyId } = useAcademy();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", parent_phone: "", countryCode: "+20" });
  const [loading, setLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!students || !academyId) return [];
    return students.filter((s) => s.academy_id === academyId);
  }, [students, academyId]);

  const handleAdd = async () => {
    if (!newStudent.name || !newStudent.parent_phone) return;
    setLoading(true);

    // المعالجة الذكية: إزالة الصفر من بداية الرقم لضمان التوافق العالمي
    const cleanedPhone = newStudent.parent_phone.replace(/^0+/, ''); 

    const { data, error } = await supabase
      .from("students")
      .insert([{ 
        name: newStudent.name, 
        parent_phone: cleanedPhone, 
        country_code: newStudent.countryCode, 
        academy_id: academyId 
      }])
      .select();
    
    if (!error) {
      setStudents([...students, ...data]);
      setIsModalOpen(false);
      setNewStudent({ name: "", parent_phone: "", countryCode: "+20" });
    }
    setLoading(false);
  };

  const sendWhatsApp = (student) => {
    const code = student.country_code || "+20";
    const phone = student.parent_phone.replace(/^0+/, '');
    const url = `https://wa.me/${code}${phone}?text=${encodeURIComponent(t("hello_message"))}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: "20px", color: "#fff", direction: "rtl" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>{t("students")}</h2>
        <button onClick={() => setIsModalOpen(true)} style={{ background: C.gold, padding: "10px 20px", borderRadius: "10px", border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          + {t("add_student")}
        </button>
      </header>

      <div style={{ display: "grid", gap: "16px" }}>
        {filteredStudents.map((student) => (
          <div key={student.id} style={{ background: "#1e293b", padding: "16px", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0" }}>{student.name}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9em" }}>{student.country_code} {student.parent_phone}</p>
            </div>
            <button onClick={() => sendWhatsApp(student)} style={{ background: "#25D366", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>💬</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", padding: "20px", borderRadius: "15px", width: "90%", maxWidth: "300px" }}>
            <h3 style={{ textAlign: "center", color: "#fff" }}>{t("add_student")}</h3>
            
            <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
              <select onChange={(e) => setNewStudent({...newStudent, countryCode: e.target.value})} style={{ width: "80px", padding: "10px", borderRadius: "5px" }}>
                <option value="+20">🇪🇬 +20</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+971">🇦🇪 +971</option>
              </select>
              <input placeholder={t("phone")} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "none" }} />
            </div>

            <input placeholder={t("name")} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "none", boxSizing: "border-box" }} />
            
            <button onClick={handleAdd} disabled={loading} style={{ width: "100%", padding: "12px", background: C.gold, border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? "..." : t("save")}
            </button>
            <button onClick={() => setIsModalOpen(false)} style={{ width: "100%", padding: "10px", marginTop: "10px", background: "transparent", border: '1px solid #444', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
