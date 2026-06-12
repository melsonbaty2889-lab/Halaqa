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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", parent_phone: "", email: "" });
  const [loading, setLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!students || !academyId) return [];
    return students.filter((s) => 
      s.academy_id === academyId && 
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       s.parent_phone?.includes(searchTerm))
    );
  }, [students, searchTerm, academyId]);

  const handleAdd = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .insert([{ ...newStudent, academy_id: academyId }])
      .select();
    
    if (!error) {
      setStudents([...students, ...data]);
      setIsModalOpen(false);
      setNewStudent({ name: "", parent_phone: "", email: "" });
    }
    setLoading(false);
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    const { error } = await supabase.from("students").update(editData).eq("id", id);
    if (!error) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...editData } : s));
      setEditId(null);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(t("confirm_delete"))) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (!error) setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ padding: "20px", direction: "rtl", color: "#fff" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>{t("students")}</h2>
        <button onClick={() => setIsModalOpen(true)} style={{ background: C.gold, padding: "10px 20px", borderRadius: "10px", border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          + {t("add_student")}
        </button>
      </header>

      <input 
        placeholder={t("search_placeholder")}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", marginBottom: "20px" }}
      />

      <div style={{ display: "grid", gap: "16px" }}>
        {filteredStudents.map((student) => (
          <div key={student.id} style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155" }}>
            {editId === student.id ? (
              <div style={{ display: "grid", gap: "10px" }}>
                <input defaultValue={student.name} onChange={(e) => setEditData({...editData, name: e.target.value})} style={{ padding: "8px" }} />
                <button onClick={() => handleUpdate(student.id)} style={{ background: "#22c55e", padding: "10px", border: 'none', borderRadius: '8px', color: '#fff' }}>{t("save")}</button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>{student.name}</h3>
                  <div style={{ fontSize: "0.85em", color: "#94a3b8" }}>{student.parent_phone}</div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => window.open(`https://wa.me/${student.parent_phone}`)} style={{ background: "#25D366", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>💬</button>
                  <button onClick={() => setEditId(student.id)} style={{ background: "#3b82f6", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>✏️</button>
                  <button onClick={() => handleDelete(student.id)} style={{ background: "#ef4444", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal الإضافة */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "#1e293b", padding: "25px", borderRadius: "16px", width: "90%", maxWidth: "400px" }}>
            <h3>{t("add_student")}</h3>
            <input placeholder={t("name")} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} style={{ width: "100%", padding: "10px", margin: "10px 0" }} />
            <input placeholder={t("phone")} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} style={{ width: "100%", padding: "10px", margin: "10px 0" }} />
            <button onClick={handleAdd} disabled={loading} style={{ width: "100%", background: C.gold, padding: "10px", marginTop: "10px", border: 'none', borderRadius: '8px' }}>{t("save")}</button>
            <button onClick={() => setIsModalOpen(false)} style={{ width: "100%", background: "transparent", border: '1px solid #475569', color: '#fff', padding: "10px", marginTop: "10px", borderRadius: '8px' }}>{t("cancel")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
