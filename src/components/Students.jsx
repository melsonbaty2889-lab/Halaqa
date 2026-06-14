import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
// تـم اسـتبدال FaUserGrad بـ FaGraduationCap لضمان قبول البناء في Vercel
import { FaUserPlus, FaSearch, FaGraduationCap, FaPhone, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  const { t } = useTranslation();
  
  // الحالات المحلية (State) لإدارة الإدخال والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 📝 دالة إضافة طالب جديد إلى قاعدة البيانات
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!academyId) {
      setMessage({ text: "خطأ: لم يتم تحديد معرف الأكاديمية بعد، يرجى تحديث الصفحة.", type: 'error' });
      return;
    }
    if (!newStudentName.trim()) {
      setMessage({ text: "يرجى إدخال اسم الطالب أولاً", type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          { 
            name: newStudentName.trim(), 
            phone: newStudentPhone.trim() || null, 
            academy_id: academyId,
            status: 'active' // الحالة الافتراضية للطالب الجديد
          }
        ])
        .select();

      if (error) throw error;

      // تحديث القائمة المحلية فوراً بدون الحاجة لإعادة تحميل الصفحة بالكامل
      if (data && setStudents) {
        setStudents(prev => [...prev, data[0]]);
      }

      setMessage({ text: "تم تسجيل الطالب بنجاح واحترافية! 🎉", type: 'success' });
      setNewStudentName('');
      setNewStudentPhone('');
      setShowAddForm(false);
    } catch (error) {
      console.error("🚨 خطأ أثناء إضافة الطالب:", error);
      setMessage({ text: `فشل التسجيل: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // 🔍 تصفية الطلاب بناءً على نص البحث (بشكل آمن)
  const filteredStudents = Array.isArray(students) 
    ? students.filter(student => 
        student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.phone?.includes(searchTerm)
      )
    : [];

  return (
    <div style={{ direction: 'inherit' }}>
      
      {/* القسم العلوي: العنوان وزر الإضافة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: C.gold, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaGraduationCap /> {t('students') || 'إدارة الطلاب'}
        </h2>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ background: showAddForm ? C.danger : C.gold, color: showAddForm ? '#fff' : '#000', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <FaUserPlus /> {showAddForm ? "إلغاء" : "إضافة طالب جديد"}
        </button>
      </div>

      {/* رسائل التنبيه والنجاح */}
      {message.text && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}` }}>
          {message.text}
        </div>
      )}

      {/* ➕ نموذج إضافة طالب جديد التفاعلي */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface, padding: '20px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#fff', margin: '0 0 10px 0' }}>تسجيل طالب جديد في الحلقة</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}>اسم الطالب الثنائي أو الثلاثي *</label>
            <input 
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="أدخل اسم الطالب الكامل"
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}>رقم هاتف ولي الأمر (اختياري)</label>
            <input 
              type="tel"
              value={newStudentPhone}
              onChange={(e) => setNewStudentPhone(e.target.value)}
              placeholder="مثال: 05xxxxxxxx"
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'left' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            style={{ background: C.gold, color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, transition: '0.2s', marginTop: '10px' }}
          >
            {isSaving ? "جاري الحفظ والتسجيل..." : "تأكيد إضافة الطالب"}
          </button>
        </form>
      )}

      {/* 🔍 شريط البحث الذكي */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surface, padding: '10px 15px', borderRadius: '8px', border: `1px solid ${C.border}`, marginBottom: '20px' }}>
        <FaSearch style={{ color: C.text, opacity: 0.5 }} />
        <input 
          type="text"
          placeholder="ابحث عن طالب بالاسم أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '15px' }}
        />
      </div>

      {/* 📋 عرض قائمة الطلاب بطاقات تفاعلية مميزة وعصرية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredStudents.length === 0 ? (
          <p style={{ color: C.text, opacity: 0.6, textAlign: 'center', padding: '20px' }}>
            {searchTerm ? "لم يتم العثور على نتائج تطابق بحثك." : "لا يوجد طلاب مسجلين حالياً."}
          </p>
        ) : (
          filteredStudents.map(student => (
            <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, padding: '15px 20px', borderRadius: '10px', border: `1px solid ${C.border}`, flexWrap: 'wrap', gap: '15px' }}>
              
              {/* تفاصيل الطالب الإسم والهاتف */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{student.name}</span>
                {student.phone && (
                  <span style={{ fontSize: '13px', color: C.text, opacity: 0.7, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaPhone size={11} /> {student.phone}
                  </span>
                )}
              </div>

              {/* شارة حالة الطالب (نشط / غير نشط) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {student.status === 'active' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '5px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                    <FaCheckCircle size={12} /> نشط
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '5px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                    <FaTimesCircle size={12} /> منتظم جزئياً
                  </span>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
