import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { C } from "../constants/colors";

// استقبلنا academyId هنا لضمان التطابق مع App.jsx
export default function Students({ students, setStudents, academyId }) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", parent_phone: "" });
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  const handleUpdate = async (id) => {
    if (!editData.name.trim()) return setError(t('error_name_required'));
    setLoadingId(id);
    const payload = { name: editData.name.trim(), parent_phone: editData.parent_phone.trim() };
    const { error: updateError } = await supabase.from("students").update(payload).eq("id", id).eq("academy_id", academyId);
    
    if (updateError) setError(t('error_update_failed'));
    else {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s));
      setEditId(null);
    }
    setLoadingId(null);
  };

  return (
    <div style={{ padding: "20px", minHeight: "100%", direction: "rtl" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ color: "#fff" }}>{t("students")}</h2>
        <div style={{ background: C.surface, padding: "8px 16px", borderRadius: "20px", color: "#fff" }}>
          {filteredStudents.length}
        </div>
      </header>

      {error && <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "12px", borderRadius: "8px" }}>⚠️ {error}</div>}

      <input
        type="text"
        placeholder={t("search_placeholder")}
        onChange={(e) => setSearchInput(e.target.value)}
        style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#0f172a", border: "1px solid #334155", color: "#fff", marginBottom: "20px" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>{t("no_students")}</div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} style={{ background: "#1e293b", padding: "16px", borderRadius: "14px" }}>
               <div style={{ color: "#fff", fontWeight: "bold" }}>{student.name}</div>
               {/* باقي تفاصيل الطالب كما هي */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
