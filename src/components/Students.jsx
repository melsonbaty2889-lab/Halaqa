import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '../constants/countries'; 
import QuranProgressBar from './QuranProgressBar'; 
import QuranProgressSelector from './QuranProgressSelector';
import { getQuranProgress } from '../utils/quranUtils'; 
import { 
  FaUserPlus, FaGraduationCap, FaPhone, 
  FaUserShield, FaEdit, FaTimes, FaSave, FaArchive, 
  FaEyeSlash, FaGlobe, FaMoneyBillWave, FaFileAlt
} from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  // 🌟 استخراج i18n لمعرفة اللغة الحالية للموقع تلقائياً
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
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

      setName(''); setParentPhone(''); setParentName(''); setCurrentQuarterIndex(0); 
      setNotes(''); setBirthDate(''); setPaymentPlan('شهري'); setCountryCode('EG');
      setShowAddForm(false);
    } catch (error) {
      console.error(error);
      alert(isArabic ? 'حدث خطأ أثناء إضافة الطالب' : 'Error adding student');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    setUpdatingId(editingStudent.id);
    
    const selectedIndex = parseInt(editingStudent.current_quarter_index) || 0;
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
      setEditingStudent(null);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleArchive = async (studentId, currentArchiveStatus) => {
    const confirmMsg = isArabic ? 'هل أنت متأكد؟' : 'Are you sure?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const { error } = await supabase.from('students').update({ is_archived: !currentArchiveStatus }).eq('id', studentId);
      if (error) throw error;
      setStudents(prev => prev.map(st => st.id === studentId ? { ...st, is_archived: !currentArchiveStatus } : st));
    } catch (error) {
      alert('Error updating archive status');
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
    // 🌟 تحديد الاتجاه ومحاذاة النصوص ديناميكياً بناءً على لغة الموقع الحالية
    <div dir={isArabic ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '10px', textAlign: isArabic ? 'right' : 'left' }}>
      
      {/* هيدر الصفحة المستند للترجمة الذكية */}
      <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '15px' }}>
        <h2 style={{ color: C.gold || '#C9A84C', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold' }}>
          <span>🎓</span> {showArchived ? t('students.archive_title', 'أرشيف الطلاب') : t('students.title', 'إدارة الطلاب والشؤون التعليمية')}
        </h2>
      </div>

      {/* أزرار التحكم العلوية الثنائية */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
        <button
          type="button"
          onClick={() => { setShowArchived(!showArchived); setEditingStudent(null); setShowAddForm(false); setSearchTerm(''); }}
          style={{ background: '#1e293b', color: showArchived ? (C.gold || '#C9A84C') : '#fff', border: `1px solid ${C.border || '#1E293B'}`, padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px' }}
        >
          <FaArchive /> {showArchived ? t('students.view_active', 'عرض النشطين') : t('students.view_archive', 'عرض الأرشيف')}
        </button>

        <button 
          type="button"
          onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
          style={{ background: showAddForm ? (C.danger || '#EF4444') : (C.gold || '#C9A84C'), color: showAddForm ? '#fff' : '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}
        >
          {showAddForm ? <><FaTimes /> {t('students.cancel', 'إلغاء')}</> : <><FaUserPlus /> {t('students.add_new', 'إضافة طالب جديد')}</>}
        </button>
      </div>

      {/* استمارة إضافة طالب جديد - تدعم اللغتين بالكامل مع الحفاظ على التصميم العامودي الصارم */}
      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface || '#111827', padding: '20px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* اسم الطالب */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px', fontWeight: '500' }}>{t('students.name_label', '* اسم الطالب الكامل')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('students.name_placeholder', 'أدخل اسم الطالب ثلاثياً')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', textAlign: isArabic ? 'right' : 'left' }} required />
          </div>

          {/* الجنس وتاريخ الميلاد */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                <option value="male">{t('students.male', 'ذكر')}</option>
                <option value="female">{t('students.female', 'أنثى')}</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="date" value={birthDate} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>

          {/* اسم ولي الأمر */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>{t('students.parent_name_label', 'اسم ولي الأمر الثنائي')}</label>
            <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder={t('students.parent_placeholder', 'أدخل اسم المسؤول عن الطالب')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', textAlign: isArabic ? 'right' : 'left' }} />
          </div>

          {/* هاتف التواصل والدولة */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder={t('students.phone_placeholder', 'رقم الهاتف')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'left', direction: 'ltr' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* خطة السداد */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>{t('students.payment_plan_label', 'نظام السداد والاشتراك المالي')}</label>
            <select value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
              <option value="شهري">{t('students.monthly', 'اشتراك شهري دوري')}</option>
              <option value="فصلي">{t('students.quarterly', 'اشتراك فصلي (كل 3 شهور)')}</option>
              <option value="سنوي">{t('students.yearly', 'اشتراك سنوي كامل')}</option>
              <option value="منحة">{t('students.scholarship', 'منحة دراسية / إعفاء')}</option>
            </select>
          </div>

          {/* مستوى الحفظ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>{t('students.current_level_label', 'المستوى الحالي في الحفظ (الورد)')}</label>
            <div style={{ background: '#0C1520', padding: '12px', borderRadius: '8px', border: `1px solid ${C.border || '#1E293B'}` }}>
              <QuranProgressSelector initialIndex={currentQuarterIndex} onIndexChange={(newIndex) => setCurrentQuarterIndex(newIndex)} />
            </div>
          </div>

          {/* ملاحظات المعلم */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>{t('students.notes_label', 'ملاحظات المعلم أو الإدارة')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('students.notes_placeholder', 'أي ملاحظات خاصة...')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', height: '65px', resize: 'none', textAlign: isArabic ? 'right' : 'left' }} />
          </div>

          <button type="submit" disabled={isAdding} style={{ background: C.gold || '#C9A84C', color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
            {isAdding ? t('students.saving', 'جاري الحفظ...') : t('students.confirm_add', 'تأكيد إضافة الطالب')}
          </button>
        </form>
      )}

      {/* حقل البحث الذكي المتغير */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder={t('students.search_placeholder', 'ابحث عن طالب بالاسم، الهاتف، أو الحفظ...')} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', background: C.surface || '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '14px 16px', borderRadius: '10px', outline: 'none', fontSize: '14px', textAlign: isArabic ? 'right' : 'left', boxSizing: 'border-box' }} 
        />
      </div>

      {/* كروت كشف الطلاب المعربة والمترجمة ديناميكياً */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredStudents.length === 0 ? (
          <div style={{ background: C.surface || '#111827', padding: '25px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            {t('students.no_data', 'لا يوجد طلاب يطابقون خيارات البحث الحالية.')}
          </div>
        ) : (
          filteredStudents.map(student => {
            const isCurrentEditing = editingStudent?.id === student.id;
            const isLocalSaving = updatingId === student.id;
            const currentAge = calculateAge(student.birth_date);
            const matchedCountry = COUNTRIES_LIST.find(c => c.code === student.country_code);
            const currentStudentQuarterIndex = editingStudent ? (editingStudent.current_quarter_index ?? 0) : 0;

            return (
              <div key={student.id} style={{ background: C.surface || '#111827', padding: '18px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold || '#C9A84C'}` : `1px solid ${C.border || '#1E293B'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {isCurrentEditing ? (
                  /* نموذج التعديل السريع المتجاوب */
                  <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none' }} required />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px' }}>
                        <option value="male">{t('students.male', 'ذكر')}</option>
                        <option value="female">{t('students.female', 'أنثى')}</option>
                      </select>
                      <input type="date" value={editingStudent.birth_date || ''} onChange={(e) => setEditingStudent({...editingStudent, birth_date: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" value={editingStudent.parent_name || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_name: e.target.value})} placeholder={t('students.parent_name_label', 'اسم ولي الأمر')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px' }} />
                      <input type="tel" value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})} placeholder={t('students.phone_placeholder', 'رقم الهاتف')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'left', direction: 'ltr' }} />
                    </div>

                    <div style={{ background: '#0C1520', padding: '10px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}` }}>
                      <QuranProgressSelector initialIndex={currentStudentQuarterIndex} onIndexChange={(newIndex) => setEditingStudent({ ...editingStudent, current_quarter_index: parseInt(newIndex) || 0 })} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <button type="submit" disabled={isLocalSaving} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>{t('students.save', 'حفظ')}</button>
                      <button type="button" onClick={() => setEditingStudent(null)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>{t('students.cancel', 'إلغاء')}</button>
                    </div>
                  </form>
                ) : (
                  /* كارت العرض الذكي المرن المترجم */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{student.name}</span>
                        {currentAge !== null && <span style={{ fontSize: '12px', color: C.gold || '#C9A84C' }}>({currentAge} {t('students.years', 'سنة')})</span>}
                      </div>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: student.gender === 'female' ? '#EC4899' : '#3B82F6', color: '#fff' }}>
                        {student.gender === 'female' ? t('students.female', 'أنثى') : t('students.male', 'ذكر')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: C.text || '#9CA3AF', opacity: 0.9 }}>
                      {student.parent_phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhone size={11} /> <span style={{ direction: 'ltr' }}>{student.parent_phone}</span></span>}
                      {student.parent_name && <span><FaUserShield size={12} /> {t('students.parent', 'المسؤول')}: {student.parent_name}</span>}
                      {student.payment_plan && <span><FaMoneyBillWave size={12} style={{ color: '#10B981' }} /> {t('students.plan', 'الاشتراك')}: {student.payment_plan}</span>}
                      {student.notes && <span style={{ color: '#6B7280', fontSize: '12px' }}><FaFileAlt size={11} /> {student.notes}</span>}
                    </div>

                    <div style={{ marginTop: '5px' }}>
                      <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border || '#1E293B'}`, paddingTop: '10px', marginTop: '5px' }}>
                      <button type="button" onClick={() => handleToggleArchive(student.id, student.is_archived)} style={{ background: 'none', border: 'none', color: C.danger || '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <FaArchive size={11} /> {student.is_archived ? t('students.unarchive', 'إلغاء الأرشفة') : t('students.archive', 'أرشفة الطالب')}
                      </button>
                      <button type="button" onClick={() => setEditingStudent({ ...student })} style={{ background: 'none', border: 'none', color: C.gold || '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <FaEdit size={11} /> {t('students.edit', 'تعديل سريع')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
