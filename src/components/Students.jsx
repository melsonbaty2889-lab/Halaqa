import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useAcademy } from "../context/AcademyContext";
import { C } from "../constants/colors";

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();
  const { academyId } = useAcademy();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!students || !academyId) return [];
    return students.filter((s) => 
      s.academy_id === academyId && 
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       s.parent_phone?.includes(searchTerm))
    );
  }, [students, searchTerm, academyId]);

  const handleUpdate = async (id) => {
    setLoading(true);
    const { error } = await supabase.from("students").update(editData).eq("id", id);
    if (!error) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...editData } : s));
      setEditId(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", direction: "rtl", color: "#fff" }}>
      <header style={{ marginBottom: "20px" }}>
        <h2>{t("students")} ({filteredStudents.length})</h2>
        <input 
          placeholder={t("search_placeholder")}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }}
        />
      </header>

      <div style={{ display: "grid", gap: "16px" }}>
        {filteredStudents.map((student) => (
          <div key={student.id} style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
            {editId === student.id ? (
              // وضع التعديل (Edit Mode)
              <div style={{ display: "grid", gap: "10px" }}>
                <input defaultValue={student.name} onChange={(e) => setEditData({...editData, name: e.target.value})} style={{ padding: "8px" }} />
                <input defaultValue={student.email} onChange={(e) => setEditData({...editData, email: e.target.value})} style={{ padding: "8px" }} />
                <button onClick={() => handleUpdate(student.id)} style={{ background: C.gold, padding: "10px", border: 'none', borderRadius: '8px' }}>{t("save")}</button>
              </div>
            ) : (
              // وضع العرض (View Mode) - التصميم العالمي
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>{student.name}</h3>
                  <div style={{ fontSize: "0.85em", color: "#94a3b8" }}>
                    {student.parent_phone} | {student.email || "---"}
                  </div>
                  <div style={{ marginTop: "8px", color: C.gold, fontWeight: "bold" }}>
                    {t("plan")}: {student.payment_plan || "غير محدد"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {/* أزرار تواصل سريعة */}
                  <button onClick={() => window.open(`https://wa.me/${student.parent_phone}`)} style={{ background: "#25D366", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>💬</button>
                  <button onClick={() => setEditId(student.id)} style={{ background: "#3b82f6", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>✏️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
