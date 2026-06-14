import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import { C } from "../constants/colors";
import QuranProgressSelector from './QuranProgressSelector';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // حقول الحالات (States) لإدارة بيانات الطالب، التحميل، التعديل، والحفظ
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. جلب بيانات الطالب من قاعدة البيانات Supabase عند تحميل المكون
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", id)
          .single();
        if (data) setStudent(data);
      } catch (err) {
        console.error("Error fetching student:", err);
      } finally {
        setLoading(false); // إيقاف مؤشر التحميل في كل الأحوال
      }
    };
    fetchStudent();
  }, [id]);

  // 2. دالة تحديث بيانات الطالب وإرسالها إلى قاعدة البيانات
  const handleUpdate = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' }); // تصفير الرسائل السابقة قبل البدء

    try {
      const { error } = await supabase
        .from("students")
        .update({
          name: student.name,
          birth_date: student.birth_date,
          gender: student.gender,
          notes: student.notes,
          current_quarter_index: student.current_quarter_index
        })
        .eq("id", id);
      
      if (error) throw error;

      // تحديث حالة الواجهة عند نجاح العملية
      setMessage({ text: "تم تحديث بيانات الطالب بنجاح! ✏️", type: 'success' });
      setIsEditing(false); // إغلاق وضع التعديل والعودة لوضع العرض
      
      // مؤقت زمني لإخفاء الرسالة تلقائياً بعد 4 ثوانٍ مريح للمستخدم
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);

    } catch (error) {
      console.error("Error updating student:", error);
      setMessage({ text: "خطأ أثناء الحفظ: " + error.message, type: 'error' });
    } finally {
      setSaving(false); // إعادة الزر لحالته القابلة للضغط
    }
  };

  // واجهة التحميل الأولية قبل ظهور البيانات
  if (loading) return <div style={{ color: C.text, textAlign: 'center', padding: '50px' }}>{t("جاري التحميل...")}</div>;

  return (
    <div style={{ padding: "20px", color: C.text, maxWidth: "600px", margin: "auto" }}>
      {/* زر العودة الذكي للخلف */}
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", marginBottom: "15px", fontSize: "16px" }}>
        ← {t("عودة")}
      </button>
      
      {/* بطاقة عرض وتعديل بيانات الطالب المعزولة */}
      <div style={{ background: C.surface, padding: "30px", borderRadius: "20px", border: `1px solid ${C.border}` }}>
        <h2 style={{ color: C.gold, marginBottom: "20px" }}>
          {isEditing ? (
            <input 
              value={student.name || ""} 
              onChange={(e) => setStudent({...student, name: e.target.value})} 
              style={{ background: '#0C1520', color: '#fff', padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, width: '100%', boxSizing: 'border-box' }} 
            />
          ) : student.name}
        </h2>
        
        <div style={{ display: "grid", gap: "20px" }}>
          {/* حقل تاريخ الميلاد */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'right' }}>{t("تاريخ الميلاد")}: 
            <input type="date" value={student.birth_date || ""} onChange={(e) => setStudent({...student, birth_date: e.target.value})} disabled={!isEditing} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#0C1520', color: '#fff', textAlign: 'right' }} />
          </label>
          
          {/* حقل اختيار الجنس */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'right' }}>{t("النوع")}: 
            <select value={student.gender || ""} onChange={(e) => setStudent({...student, gender: e.target.value})} disabled={!isEditing} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#0C1520', color: '#fff', direction: 'rtl' }}>
              <option value="male">{t("ذكر")}</option>
              <option value="female">{t("أنثى")}</option>
            </select>
          </label>

          {/* مكون اختيار الربع والحزب الحالي من القرآن الكريم */}
          <div style={{ marginTop: '10px' }}>
            <QuranProgressSelector 
              initialIndex={student.current_quarter_index || 0} 
              onIndexChange={(idx) => {
                setStudent(prev => ({ ...prev, current_quarter_index: idx }));
              }}
              disabled={!isEditing}
            />
          </div>

          {/* حقل كتابة الملاحظات */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'right' }}>{t("ملاحظات")}: 
            <textarea value={student.notes || ""} onChange={(e) => setStudent({...student, notes: e.target.value})} disabled={!isEditing} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: '#0C1520', color: '#fff', height: '100px', resize: 'none', textAlign: 'right' }} />
          </label>
        </div>

        {/* زر الحفظ التفاعلي والذكي */}
        <button 
          onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} 
          disabled={saving}
          style={{ 
            marginTop: "30px", width: '100%', background: C.gold, padding: "12px", border: "none", borderRadius: "10px", fontWeight: 'bold', 
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, color: '#000'
          }}
        >
          {saving ? t("جاري الحفظ...") : (isEditing ? t("حفظ التغييرات") : t("تعديل البيانات"))}
        </button>

        {/* مكان ظهور رسالة النجاح أو الخطأ المعزول أسفل الزر مباشرة */}
        {message.text && (
          <div style={{ 
            marginTop: '15px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: message.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`
          }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
