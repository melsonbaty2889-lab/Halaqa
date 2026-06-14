import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import { C } from "../constants/colors";
import QuranProgressSelector from './QuranProgressSelector'; // تأكد من استيراد المكون

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // دالة الحفظ مع معالجة البيانات المتقدمة
  const handleUpdate = async () => {
    setSaving(true);
    // يمكنك إضافة منطق "getQuarterText" هنا إذا أردت تحديث النص التلقائي عند الحفظ
    const { error } = await supabase
      .from("students")
      .update({
        name: student.name,
        birth_date: student.birth_date,
        gender: student.gender,
        notes: student.notes,
        current_quarter_index: student.current_quarter_index // تحديث الربع المختار
      })
      .eq("id", id);
    
    if (error) alert(error.message);
    else setIsEditing(false);
    setSaving(false);
  };

  if (loading) return <div style={{ color: C.text, textAlign: 'center', padding: '50px' }}>{t("جاري التحميل...")}</div>;

  return (
    <div style={{ padding: "20px", color: C.text, maxWidth: "600px", margin: "auto" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", marginBottom: "15px" }}>
        ← {t("عودة")}
      </button>
      
      <div style={{ background: C.surface, padding: "30px", borderRadius: "20px", border: `1px solid ${C.border}` }}>
        <h2 style={{ color: C.gold, marginBottom: "20px" }}>
          {isEditing ? <input value={student.name} onChange={(e) => setStudent({...student, name: e.target.value})} style={{ background: '#0C1520', color: '#fff', padding: '5px', borderRadius: '5px' }} /> : student.name}
        </h2>
        
        <div style={{ display: "grid", gap: "20px" }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>{t("تاريخ الميلاد")}: 
            <input type="date" value={student.birth_date || ""} onChange={(e) => setStudent({...student, birth_date: e.target.value})} disabled={!isEditing} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#0C1520', color: '#fff' }} />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>{t("النوع")}: 
            <select value={student.gender || ""} onChange={(e) => setStudent({...student, gender: e.target.value})} disabled={!isEditing} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#0C1520', color: '#fff' }}>
              <option value="male">{t("ذكر")}</option>
              <option value="female">{t("أنثى")}</option>
            </select>
          </label>

          {/* إضافة مكون اختيار الربع الذكي */}
          <div style={{ marginTop: '10px' }}>
            <label style={{ marginBottom: '10px', display: 'block' }}>{t("مستوى الحفظ الحالي")}:</label>
            <QuranProgressSelector 
              initialIndex={student.current_quarter_index} 
              onIndexChange={(idx) => setStudent({...student, current_quarter_index: idx})}
              disabled={!isEditing}
            />
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>{t("ملاحظات")}: 
            <textarea value={student.notes || ""} onChange={(e) => setStudent({...student, notes: e.target.value})} disabled={!isEditing} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#0C1520', color: '#fff', height: '100px' }} />
          </label>
        </div>

        <button onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} style={{ marginTop: "30px", width: '100%', background: C.gold, padding: "12px", border: "none", borderRadius: "10px", fontWeight: 'bold', cursor: 'pointer' }}>
          {saving ? t("جاري الحفظ...") : (isEditing ? t("حفظ التغييرات") : t("تعديل البيانات"))}
        </button>
      </div>
    </div>
  );
}
