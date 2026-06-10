import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { C } from "../constants/colors";

export default function Students({ students, setStudents, session }) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", parent_phone: "" });
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  // Get current academy_id from session
  const academyId = useMemo(() => {
    return session?.user?.user_metadata?.academy_id || null;
  }, [session]);

  /* ==========================
      Debounce Search
  ========================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ==========================
      Filter Students - Academy Scoped
  ========================== */
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Critical: Only show students from current academy
      if (student.academy_id!== academyId) return false;
      if (student.is_archived) return false;

      const name = student.name?.toLowerCase() || "";
      const phone = student.parent_phone || "";
      const term = searchTerm.toLowerCase();

      return name.includes(term) || phone.includes(term);
    });
  }, [students, searchTerm, academyId]);

  /* ==========================
      Helpers
  ========================== */
  const validatePhone = (phone) => {
    if (!phone) return true;
    return /^(01\d{9}|20\d{10})$/.test(phone);
  };

  const getWhatsappNumber = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "20" + cleaned.slice(1);
    }
    return cleaned;
  };

  const resetEdit = () => {
    setEditId(null);
    setEditData({ name: "", parent_phone: "" });
    setError(null);
  };

  /* ==========================
      Edit
  ========================== */
  const startEdit = useCallback((student) => {
    setEditId(student.id);
    setEditData({
      name: student.name || "",
      parent_phone: student.parent_phone || "",
    });
    setError(null);
  }, []);

  /* ==========================
      Update
  ========================== */
  const handleUpdate = async (id) => {
    if (!editData.name.trim()) {
      setError("اسم الطالب مطلوب");
      return;
    }

    if (!validatePhone(editData.parent_phone)) {
      setError("رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم");
      return;
    }

    setLoadingId(id);
    setError(null);

    const payload = {
      name: editData.name.trim(),
      parent_phone: editData.parent_phone.trim(),
      updated_at: new Date().toISOString(),
    };

    // Save old data for rollback
    const oldStudent = students.find(s => s.id === id);

    // Optimistic update
    setStudents((prev) =>
      prev.map((student) => (student.id === id? {...student,...payload } : student))
    );

    const { error: updateError } = await supabase
     .from("students")
     .update(payload)
     .eq("id", id)
     .eq("academy_id", academyId); // RLS safety: only update own academy

    if (updateError) {
      // Rollback on error
      setStudents((prev) =>
        prev.map((student) => (student.id === id? oldStudent : student))
      );
      setError("فشل التحديث: " + updateError.message);
    } else {
      resetEdit();
    }

    setLoadingId(null);
  };

  /* ==========================
      Archive
  ========================== */
  const handleArchive = async (id) => {
    const confirmed = window.confirm(
      "هل تريد أرشفة هذا الطالب؟\nيمكن استعادته لاحقاً من قسم الأرشيف."
    );
    if (!confirmed) return;

    setLoadingId(id);
    setError(null);

    const oldStudent = students.find(s => s.id === id);

    // Optimistic update
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id? {...student, is_archived: true } : student
      )
    );

    const { error: archiveError } = await supabase
     .from("students")
     .update({
        is_archived: true,
        updated_at: new Date().toISOString(),
      })
     .eq("id", id)
     .eq("academy_id", academyId); // RLS safety

    if (archiveError) {
      // Rollback
      setStudents((prev) =>
        prev.map((student) => (student.id === id? oldStudent : student))
      );
      setError("فشل الأرشفة: " + archiveError.message);
    }

    setLoadingId(null);
  };

  return (
    <div style={{ padding: "20px", direction: "rtl", fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h2 style={{ color: "#fff", margin: 0 }}>{t("students")}</h2>
        <div
          style={{
            background: C.surface,
            padding: "8px 16px",
            borderRadius: "20px",
            color: "#fff",
            fontSize: "0.9rem"
          }}
        >
          {filteredStudents.length} / {students.filter(s =>!s.is_archived && s.academy_id === academyId).length}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: "#7f1d1d",
          color: "#fca5a5",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          border: "1px solid #991b1b"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="🔍 بحث بالاسم أو رقم ولي الأمر..."
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          background: "#0f172a",
          border: "1px solid #334155",
          color: "#fff",
          marginBottom: "20px",
          boxSizing: "border-box"
        }}
      />

      {/* Students List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredStudents.length === 0 && (
          <div
            style={{
              background: "#1e293b",
              padding: "40px 20px",
              borderRadius: "14px",
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            {searchTerm? "لا توجد نتائج للبحث" : "لا يوجد طلاب مسجلين"}
          </div>
        )}

        {filteredStudents.map((student) => (
          <div
            key={student.id}
            style={{
              background: "#1e293b",
              padding: "16px",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              borderRight: `6px solid ${student.is_paid? "#22c55e" : "#ef4444"}`,
            }}
          >
            {/* Student Info */}
            <div style={{ flex: 1 }}>
              {editId === student.id? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData((prev) => ({...prev, name: e.target.value }))}
                    placeholder="اسم الطالب"
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #475569",
                      background: "#0f172a",
                      color: "#fff",
                    }}
                  />
                  <input
                    value={editData.parent_phone}
                    onChange={(e) => setEditData((prev) => ({...prev, parent_phone: e.target.value }))}
                    placeholder="رقم ولي الأمر"
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #475569",
                      background: "#0f172a",
                      color: "#fff",
                      direction: "ltr",
                      textAlign: "left"
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleUpdate(student.id)}
                      disabled={loadingId === student.id}
                      style={{
                        padding: "8px 16px",
                        background: C.green,
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      {loadingId === student.id? "⌛" : "💾 حفظ"}
                    </button>
                    <button
                      onClick={resetEdit}
                      style={{
                        padding: "8px 16px",
                        background: "#475569",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}>
                    {student.name}
                  </div>
                  <div style={{ color: "#94a3b8", marginTop: "6px", direction: "ltr", textAlign: "right" }}>
                    {student.parent_phone || "لا يوجد رقم"}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            {editId!== student.id && (
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <button
                  onClick={() => startEdit(student)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleArchive(student.id)}
                  disabled={loadingId === student.id}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    opacity: loadingId === student.id? 0.5 : 1,
                  }}
                >
                  {loadingId === student.id? "⌛" : "🗂️"}
                </button>
                {student.parent_phone && (
                  <a
                    href={`https://wa.me/${getWhatsappNumber(student.parent_phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none", fontSize: "1.2rem" }}
                  >
                    💬
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
