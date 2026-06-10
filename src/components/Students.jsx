import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { C } from "../constants/colors";

export default function Students({ students, setStudents }) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    parent_phone: "",
  });

  const [loadingId, setLoadingId] = useState(null);

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
      Filter Students
  ========================== */

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (student.is_archived) return false;

      const name = student.name?.toLowerCase() || "";
      const phone = student.parent_phone || "";

      return (
        name.includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm)
      );
    });
  }, [students, searchTerm]);

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

    setEditData({
      name: "",
      parent_phone: "",
    });
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
  }, []);

  /* ==========================
      Update
  ========================== */

  const handleUpdate = async (id) => {
    if (!editData.name.trim()) {
      alert("اسم الطالب مطلوب");
      return;
    }

    if (!validatePhone(editData.parent_phone)) {
      alert("رقم الهاتف غير صحيح");
      return;
    }

    setLoadingId(id);

    const payload = {
      name: editData.name.trim(),
      parent_phone: editData.parent_phone.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("students")
      .update(payload)
      .eq("id", id);

    if (error) {
      alert("خطأ أثناء التحديث:\n" + error.message);
    } else {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === id
            ? {
                ...student,
                ...payload,
              }
            : student
        )
      );

      resetEdit();

      alert("تم تحديث بيانات الطالب بنجاح");
    }

    setLoadingId(null);
  };

  /* ==========================
      Archive
  ========================== */

  const handleArchive = async (id) => {
    const confirmed = window.confirm(
      "هل تريد أرشفة هذا الطالب؟\nيمكن استعادته لاحقاً."
    );

    if (!confirmed) return;

    setLoadingId(id);

    const { error } = await supabase
      .from("students")
      .update({
        is_archived: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("خطأ أثناء الأرشفة:\n" + error.message);
    } else {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === id
            ? {
                ...student,
                is_archived: true,
              }
            : student
        )
      );

      alert("تمت أرشفة الطالب بنجاح");
    }

    setLoadingId(null);
  };

  return (
    <div
      style={{
        padding: "20px",
        direction: "rtl",
      }}
    >
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
        <h2 style={{ color: "#fff", margin: 0 }}>
          {t("students")}
        </h2>

        <div
          style={{
            background: C.surface,
            padding: "8px 16px",
            borderRadius: "20px",
            color: "#fff",
          }}
        >
          {filteredStudents.length} / {students.filter(s => !s.is_archived).length}
        </div>
      </header>

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
        }}
      />

      {/* Students */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {filteredStudents.length === 0 && (
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "14px",
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            لا يوجد طلاب
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
              borderRight: `6px solid ${
                student.is_paid ? "#22c55e" : "#ef4444"
              }`,
            }}
          >
            {/* Student Info */}

            <div style={{ flex: 1 }}>
              {editId === student.id ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        parent_phone: e.target.value,
                      }))
                    }
                    placeholder="رقم ولي الأمر"
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #475569",
                      background: "#0f172a",
                      color: "#fff",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => handleUpdate(student.id)}
                      disabled={loadingId === student.id}
                    >
                      {loadingId === student.id
                        ? "⌛"
                        : "💾 حفظ"}
                    </button>

                    <button
                      onClick={resetEdit}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    {student.name}
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                      marginTop: "6px",
                    }}
                  >
                    {student.parent_phone || "---"}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}

            {editId !== student.id && (
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => startEdit(student)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
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
                    opacity:
                      loadingId === student.id
                        ? 0.5
                        : 1,
                  }}
                >
                  {loadingId === student.id
                    ? "⌛"
                    : "🗂️"}
                </button>

                {student.parent_phone && (
                  <a
                    href={`https://wa.me/${getWhatsappNumber(
                      student.parent_phone
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      fontSize: "1.2rem",
                    }}
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
