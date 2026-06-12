import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import { C } from "../constants/colors";

export default function StudentProfile() {
  const { id } = useParams(); // لجلب الـ ID من الرابط
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // جلب بيانات الطالب
  useEffect(() => {
    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setStudent(data);
      setLoading(false);
    };
    fetchStudent();
  }, [id]);

  // تحديث البيانات
  const handleUpdate = async () => {
    const { error } = await supabase
      .from("students")
      .update(student)
      .eq("id", id);
    
    if (error) alert(error.message);
    else setIsEditing(false);
  };

  if (loading) return <div>{t("جاري التحميل...")}</div>;

  return (
    <div style={{ padding: "20px", color: "#fff", maxWidth: "600px", margin: "auto" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer" }}>← {t("عودة")}</button>
      
      <div style={{ background: "#1e293b", padding: "30px", borderRadius: "20px", marginTop: "20px" }}>
        <h2>{isEditing ? <input value={student.name} onChange={(e) => setStudent({...student, name: e.target.value})} /> : student.name}</h2>
        
        <div style={{ display: "grid", gap: "15px" }}>
          <label>{t("تاريخ الميلاد")}: <input type="date" value={student.birth_date || ""} onChange={(e) => setStudent({...student, birth_date: e.target.value})} disabled={!isEditing} /></label>
          <label>{t("النوع")}: 
            <select value={student.gender || ""} onChange={(e) => setStudent({...student, gender: e.target.value})} disabled={!isEditing}>
              <option value="male">{t("ذكر")}</option>
              <option value="female">{t("أنثى")}</option>
            </select>
          </label>
          <label>{t("ملاحظات")}: <textarea value={student.notes || ""} onChange={(e) => setStudent({...student, notes: e.target.value})} disabled={!isEditing} /></label>
        </div>

        <button onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} style={{ marginTop: "20px", background: C.gold, padding: "10px 20px", border: "none", borderRadius: "10px" }}>
          {isEditing ? t("حفظ") : t("تعديل")}
        </button>
      </div>
    </div>
  );
}
