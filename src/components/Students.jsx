import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '../constants/countries'; 
import QuranProgressBar from './QuranProgressBar'; 
import QuranProgressSelector from './QuranProgressSelector';
import { getQuranProgress } from '../utils/quranUtils'; // 🌟 استيراد الدالة الموحدة للنصوص
import { 
  FaUserPlus, FaGraduationCap, FaPhone, 
  FaUserShield, FaEdit, FaTimes, FaSave, FaArchive, 
  FaEyeSlash
} from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  const { t } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0); 
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('male');
  const [birthDate, setBirthDate] = useState(''); 
  const [paymentPlan, setPaymentPlan] = useState('شهري'); 
  const [countryCode, setCountryCode] = useState('EG');

  const [editingStudent, setEditingStudent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); 
  
  const [inlineMessage, setInlineMessage] = useState({ studentId: null, text: '', type: '' });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .trim()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!academyId) return;
    setIsAdding(true);
    setInlineMessage({ studentId: null, text: '', type: '' });
    
    // 🌟 استخدام الدالة الموحدة لضمان التطابق التام في قاعدة البيانات
    const autoSurahText = getQuranProgress(currentQuarterIndex).text;

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{ 
          name: name.trim(), 
          parent_phone: parentPhone.trim() || null,
          parent_name: parentName.trim() || null,       
          current_surah: autoSurahText,             
          notes: notes.trim() || null,                 
          gender: gender,                              
          academy_id: academyId,
          status: 'active',
          is_archived: false,
          birth_date: birthDate || null, 
          payment_plan: paymentPlan,     
          country_code: countryCode.trim() || null, 
          current_quarter_index: currentQuarterIndex   
        }]).select();

      if (error) throw error;
      if (data && setStudents) setStudents(prev => [data[0], ...prev]);

      setName(''); setParentPhone(''); setParentName(''); setCurrentQuarterIndex(0); setNotes(''); setShowAddForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    setUpdatingId(editingStudent.id);
    setInlineMessage({ studentId: null, text: '', type: '' });
    
    const selectedIndex = parseInt(editingStudent.current_quarter_index) || 0;
    // 🌟 استخدام الدالة الموحدة
    const autoSurahText = getQuranProgress(selectedIndex).text;

    const updatedStudentData = { 
      ...editingStudent, 
      current_surah: autoSurahText,
      current_quarter_index: selectedIndex
    };

    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: updatedStudentData.name.trim(),
          parent_phone: updatedStudentData.parent_phone?.trim() || null,
          parent_name: updatedStudentData.parent_name?.trim() || null,
          current_surah: autoSurahText,                     
          current_quarter_index: selectedIndex,             
          notes: updatedStudentData.notes?.trim() || null,
          gender: updatedStudentData.gender,
          birth_date: updatedStudentData.birth_date || null,
          payment_plan: updatedStudentData.payment_plan,
          country_code: updatedStudentData.country_code || null, 
          last_test_score: updatedStudentData.last_test_score ? parseInt(updatedStudentData.last_test_score) : 0,
          level_score: updatedStudentData.level_score ? parseInt(updatedStudentData.level_score) : 0
        })
        .eq('id', updatedStudentData.id);

      if (error) throw error;

      setStudents(prev => prev.map(st => st.id === updatedStudentData.id ? updatedStudentData : st));
      
      setInlineMessage({
        studentId: updatedStudentData.id,
        text: 'تم تحديث بيانات الطالب بنجاح! 📝',
        type: 'success'
      });

      setEditingStudent(null);

      setTimeout(() => {
        setInlineMessage({ studentId: null, text: '', type: '' });
      }, 4000);

    } catch (error) {
      console.error("🚨 خطأ أثناء التحديث:", error);
      setInlineMessage({
        studentId: editingStudent.id,
        text: `تعذر حفظ التعديلات: ${error.message}`,
        type: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleArchive = async (studentId, currentArchiveStatus) => {
    if (!window.confirm(currentArchiveStatus ? 'إلغاء الأرشفة؟' : 'تأكيد الأرشفة::')) return;
    try {
      const { error } = await supabase.from('students').update({ is_archived: !currentArchiveStatus }).eq('id', studentId);
      if (error) throw error;
      setStudents(prev => prev.map(st => st.id === studentId ? { ...st, is_archived: !currentArchiveStatus } : st));
    } catch (error) {
      alert('حدث خطأ أثناء تعديل الأرشفة');
    }
  };

  const filteredStudents = Array.isArray(students) 
    ? students.filter(student => {
        if (showArchived && !student.is_archived) return false;
        if (!showArchived && student.is_archived) return false;
        const search = normalizeArabic(searchTerm);
        return (
          normalizeArabic(student?.name).includes(search) ||
          student?.parent_phone?.includes(searchTerm) ||
          normalizeArabic(student?.current_surah).includes(search)
        );
      })
    : [];

  return (
    <div style={{ direction: 'inherit' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: C.gold, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px' }}>
          <FaGraduationCap /> {showArchived ? 'أرشيف الطلاب والموقوفين' : 'إدارة الطلاب والشؤون التعليمية'}
        </h2>
        
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
          <button
            type="button"
            onClick={() => { setShowArchived(!showArchived); setEditingStudent(null); setShowAddForm(false); setSearchTerm(''); }}
            style={{ background: '#1e293b', color: showArchived ? C.gold : '#fff', border: `1px solid ${C.border}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '14px', flex: 1, justifyContent: 'center' }}
          >
            {showArchived ? <FaEyeSlash /> : <FaArchive />}
            {showArchived ? 'عرض النشطين' : 'عرض الأرشيف'}
          </button>

          {!showArchived && (
            <button 
              type="button"
              onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
              style={{ background: showAddForm ? C.danger : C.gold, color: '#000', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', flex: 1, justifyContent: 'center' }}
            >
              <FaUserPlus /> {showAddForm ? 'إلغاء' : 'إضافة طالب جديد'}
            </button>
          )}
        </div>
      </div>

      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface, padding: '25px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}>اسم الطالب الكامل *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسم الطالب ثلاثياً" style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }} required />
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', flex: 1 }}><option value="male">ذكر</option><option value="female">أنثى</option></select>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', flex: 1 }} />
          </div>
          <div style={{ background: '#0C1520', padding: '10px', borderRadius: '6px', border: `1px solid ${C.border}` }}>
            <QuranProgressSelector initialIndex={currentQuarterIndex} onIndexChange={(newIndex) => setCurrentQuarterIndex(newIndex)} />
          </div>
          <button type="submit" disabled={isAdding} style={{ background: C.gold, color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isAdding ? 'جاري الحفظ...' : 'تأكيد إضافة الطالب'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surface, padding: '12px 15px', borderRadius: '8px', border: `1px solid ${C.border}`, marginBottom: '20px' }}>
        <input type="text" placeholder="ابحث عن طالب بالاسم، الهاتف، أو الحفظ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '15px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredStudents.map(student => {
          const isCurrentEditing = editingStudent?.id === student.id;
          const isLocalSaving = updatingId === student.id;
          const currentAge = calculateAge(student.birth_date);
          const matchedCountry = COUNTRIES_LIST.find(c => c.code === student.country_code);
          const currentStudentQuarterIndex = editingStudent ? (editingStudent.current_quarter_index ?? 0) : 0;

          return (
            <div key={student.id} style={{ background: C.surface, padding: '20px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold}` : `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {isCurrentEditing ? (
                <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px' }} required />
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1 }}><option value="male">ذكر</option><option value="female">أنثى</option></select>
                    <input type="date" value={editingStudent.birth_date || ''} onChange={(e) => setEditingStudent({...editingStudent, birth_date: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1 }} />
                  </div>

                  <input type="text" value={editingStudent.parent_name || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_name: e.target.value})} placeholder="اسم ولي الأمر" style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px' }} />
                  <input type="tel" value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})} placeholder="رقم هاتف التواصل" style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', textAlign: 'left' }} />

                  <label style={{ color: C.gold, fontSize: '13px', marginBottom: '-5px', fontWeight: '500' }}>المستوى الحالي في الحفظ (الورد):</label>
                  <div style={{ background: '#0C1520', padding: '10px', borderRadius: '6px', border: `1px solid ${C.border}` }}>
                    <QuranProgressSelector 
                      initialIndex={currentStudentQuarterIndex} 
                      onIndexChange={(newIndex) => setEditingStudent({ ...editingStudent, current_quarter_index: parseInt(newIndex) || 0 })} 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="درجة آخر اختبار" value={editingStudent.last_test_score || ''} onChange={(e) => setEditingStudent({...editingStudent, last_test_score: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1 }} />
                    <input type="number" placeholder="درجة المستوى العام" value={editingStudent.level_score || ''} onChange={(e) => setEditingStudent({...editingStudent, level_score: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1 }} />
                  </div>

                  <textarea value={editingStudent.notes || ''} onChange={(e) => setEditingStudent({...editingStudent, notes: e.target.value})} placeholder="الملاحظات..." style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', height: '65px', resize: 'none' }} />

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', width: '100%', marginTop: '5px' }}>
                    <button 
                      type="submit" 
                      disabled={isLocalSaving} 
                      style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px', flex: 1 }}
                    >
                      <FaSave /> {isLocalSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditingStudent(null)} 
                      style={{ background: '#475569', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500', fontSize: '15px', flex: 1 }}
                    >
                      <FaTimes /> إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{matchedCountry ? matchedCountry.flag : ''}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>{student.name}</span>
                        {currentAge !== null && <span style={{ fontSize: '13px', color: C.gold }}>({currentAge} سنة)</span>}
                      </div>
                      <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: student.gender === 'female' ? '#EC4899' : '#3B82F6', color: '#fff' }}>{student.gender === 'female' ? 'أنثى' : 'ذكر'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: C.text, opacity: 0.85 }}>
                      {student.parent_phone && <span style={{ direction: 'ltr', textAlign: 'right' }}><FaPhone size={12} /> {student.parent_phone}</span>}
                      {student.parent_name && <span><FaUserShield size={13} /> ولي الأمر: {student.parent_name}</span>}
                    </div>

                    {/* 🌟 تمرير الخاصية الصحيحة للـ ProgressBar لمنع ظهور الصفر */}
                    <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: '12px' }}>
                    <button type="button" onClick={() => handleToggleArchive(student.id, student.is_archived)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                      <FaArchive size={12} /> نقل للأرشيف
                    </button>
                    <button type="button" onClick={() => setEditingStudent({ ...student })} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                      <FaEdit size={12} /> تعديل البيانات بسرعة
                    </button>
                  </div>

                  {inlineMessage.studentId === student.id && inlineMessage.text && (
                    <div style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      marginTop: '10px', 
                      backgroundColor: inlineMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                      color: inlineMessage.type === 'success' ? '#10B981' : '#EF4444', 
                      border: `1px solid ${inlineMessage.type === 'success' ? '#10B981' : '#EF4444'}`, 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      fontSize: '14px'
                    }}>
                      {inlineMessage.text}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
