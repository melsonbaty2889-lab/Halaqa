import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { C } from "../constants/colors";

export default function Students({ students, setStudents, academyId }) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", parent_phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // منطق الفلترة الاحترافي
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((student) => {
      if (student.academy_id !== academyId) return false;
      const name = student.name?.toLowerCase() || "";
      const phone = student.parent_phone || "";
      const term = searchTerm.toLowerCase();
      return name.includes(term) || phone.includes(term);
    });
  }, [students, searchTerm, academyId]);

  // دالة تحديث البيانات
  const handleUpdate = async (id) => {
    if (!editData.name.trim()) return setError(t('error_name_required'));
    setLoading(true);
    
    const { error: updateError } = await supabase
      .from("students")
      .update({ name: editData.name, parent_phone: editData.parent_phone })
      .eq("id", id);
    
    if (updateError) {
      setError(t('error_update_failed'));
    } else {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...editData } : s));
      setEditId(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", minHeight: "100%", direction: "rtl", color: "#fff" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>{t("students")}</h2>
        <div style={{ background: C.surface, padding: "8px 16px", borderRadius: "20px" }}>
          {filteredStudents.length}
        </div>
      </header>

      {error && (
        <div style={{ background: "#7f1d1d", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder={t("search_placeholder")}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ 
          width: "100%", padding: "14px", borderRadius: "12px", 
          background: "#0f172a", border: "1px solid #334155", 
          color: "#fff", marginBottom: "20px" 
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
            {t("no_students")}
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} style={{ 
              background: "#1e293b", padding: "16px", borderRadius: "14px", 
              display: "flex", justifyContent: "space-between", alignItems: "center" 
            }}>
              {editId === student.id ? (
                <div style={{ width: "100%", display: "flex", gap: "10px" }}>
                  <input 
                    defaultValue={student.name} 
                    onChange={(e) => setEditData({...editData, name: e.target.value})} 
                    style={{ padding: "8px", borderRadius: "5px", flex: 1 }} 
                  />
                  <button onClick={() => handleUpdate(student.id)} disabled={loading} 
                    style={{ background: "#22c55e", border: "none", padding: "8px 15px", borderRadius: "5px", color: "white", cursor: "pointer" }}>
                    {t("save")}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>{student.name}</div>
                    <div style={{ color: "#94a3b8" }}>{student.parent_phone}</div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={() => window.open(`https://wa.me/${student.parent_phone}`, '_blank')} 
                      style={{ background: "#25D366", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                      💬
                    </button>
                    <button 
                      onClick={() => {setEditId(student.id); setEditData({name: student.name, parent_phone: student.parent_phone})}} 
                      style={{ background: "#3b82f6", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                      ✏️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
