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
  FaCalendarAlt, FaGlobe, FaMoneyBillWave, FaFileAlt, FaUser
} from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  // 🌟 استخراج i18n ومزامنة مفاتيح الترجمة العالمية بالكامل
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
    <div dir={isArabic ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '10px', textAlign: isArabic ? 'right' : 'left', boxSizing: 'border-box' }}>
      
      {/* هيدر الصفحة المتجاوب المستند لملف اللغات الأساسي */}
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
        <h2 style={{ color: C.gold || '#C9A84C', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '22px', fontWeight: 'bold' }}>
          <span>🎓</span> {showArchived ? (isArabic ? 'أرشيف الطلاب' : 'Students Archive') : t('students_management_title')}
        </h2>
      </div>

      {/* أزرار التحكم العلوية الاحترافية مع معالجة الخلل المنطقي للأرشيف */}
      <div style={{ display: 'grid', gridTemplateColumns: showArchived ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => { setShowArchived(!showArchived); setEditingStudent(null); setShowAddForm(false); setSearchTerm(''); }}
          style={{ background: '#1e293b', color: showArchived ? (C.gold || '#C9A84C') : '#fff', border: `1px solid ${C.border || '#1E293B'}`, padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s' }}
        >
          <FaArchive /> {showArchived ? (isArabic ? 'عرض الطلاب النشطين' : 'View Active Students') : (isArabic ? 'عرض الأرشيف للمتوقفين' : 'View Archived') }
        </button>

        {/* زر الإضافة يختفي ذكياً داخل قسم الأرشيف لحماية تدفق البيانات من الأخطاء المنطقية */}
        {!showArchived && (
          <button 
            type="button"
            onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
            style={{ background: showAddForm ? '#EF4444' : (C.gold || '#C9A84C'), color: showAddForm ? '#fff' : '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s' }}
          >
            {showAddForm ? <><FaTimes /> {t('cancel')}</> : <><FaUserPlus /> {t('add_new_student')}</>}
          </button>
        )}
      </div>

      {/* نموذج إضافة طالب جديد بمفاتيح i18n دقيقة وتصميم متناسق */}
      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface || '#111827', padding: '18px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          
          {/* اسم الطالب */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser size={12} style={{color: C.gold}} /> {t('student_name_label')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('student_name_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', textAlign: isArabic ? 'right' : 'left' }} required />
          </div>

          {/* الجنس وتاريخ الميلاد المهيكل باحترافية لتجنب الفراغات */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500' }}>{t('gender_label')}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', height: '45px' }}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><FaCalendarAlt size={12} /> {isArabic ? 'تاريخ الميلاد' : 'Birth Date'}</label>
              <input type="date" value={birthDate} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', height: '45px', boxSizing: 'border-box' }} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>

          {/* اسم ولي الأمر */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><FaUserShield size={12} /> {t('parent_name_label')}</label>
            <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder={t('parent_name_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', textAlign: isArabic ? 'right' : 'left' }} />
          </div>

          {/* هاتف التواصل والدولة مع توحيد المسافات */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhone size={11} /> {isArabic ? 'رقم هاتف التواصل' : 'Phone Number'}</label>
              <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder={t('phone_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', textAlign: 'left', direction: 'ltr' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><FaGlobe size={11} /> {isArabic ? 'الدولة' : 'Country'}</label>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px', height: '45px' }}>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* خطة السداد */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><FaMoneyBillWave size={12} style={{color: '#10B981'}} /> {isArabic ? 'نظام السداد والاشتراك المالي' : 'Financial Plan'}</label>
            <select value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '14px' }}>
              <option value="شهري">{isArabic ? 'اشتراك شهري دوري' : 'Monthly Subscription'}</option>
              <option value="فصلي">{isArabic ? 'اشتراك فصلي (كل 3 شهور)' : 'Quarterly (3 Months)'}</option>
              <option value="سنوي">{isArabic ? 'اشتراك سنوي كامل' : 'Yearly Plan'}</option>
              <option value="منحة">{isArabic ? 'منحة دراسية / إعفاء' : 'Scholarship / Free'}</option>
            </select>
          </div>

          {/* الورد الابتدائي عند الإنشاء */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500' }}>{isArabic ? 'الورد الابتدائي المسجل حالياً' : 'Initial Quran Level'}</label>
            <div style={{ background: '#0C1520', padding: '4px 10px', borderRadius: '8px', border: `1px solid ${C.border || '#1E293B'}` }}>
              <QuranProgressSelector initialIndex={currentQuarterIndex} onIndexChange={(newIndex) => setCurrentQuarterIndex(newIndex)} />
            </div>
          </div>

          {/* ملاحظات المعلم */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '13px', fontWeight: '500' }}>{t('teacher_notes_label')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('notes_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', height: '65px', resize: 'none', fontSize: '14px', textAlign: isArabic ? 'right' : 'left' }} />
          </div>

          <button type="submit" disabled={isAdding} style={{ background: C.gold || '#C9A84C', color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', transition: 'opacity 0.2s' }}>
            {isAdding ? t('saving_progress') : t('confirm_add_student')}
          </button>
        </form>
      )}

      {/* حقل البحث الذكي الفائق المتناسب مع التصميم العامودي الصارم */}
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder={t('search_placeholder')} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', background: C.surface || '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px 16px', borderRadius: '10px', outline: 'none', fontSize: '14px', textAlign: isArabic ? 'right' : 'left', boxSizing: 'border-box' }} 
        />
      </div>

      {/* قائمة كروت الطلاب الفاخرة المطورة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredStudents.length === 0 ? (
          <div style={{ background: C.surface || '#111827', padding: '25px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            {t('no_search_results')}
          </div>
        ) : (
          filteredStudents.map(student => {
            const isCurrentEditing = editingStudent?.id === student.id;
            const isLocalSaving = updatingId === student.id;
            const currentAge = calculateAge(student.birth_date);
            const matchedCountry = COUNTRIES_LIST.find(c => c.code === student.country_code);
            const currentStudentQuarterIndex = editingStudent ? (editingStudent.current_quarter_index ?? 0) : 0;

            return (
              <div key={student.id} style={{ background: C.surface || '#111827', padding: '16px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold || '#C9A84C'}` : `1px solid ${C.border || '#1E293B'}`, display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                
                {isCurrentEditing ? (
                  /* نموذج التعديل السريع المتجاوب المنظف بالكامل */
                  <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', fontSize: '14px' }} required />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                      </select>
                      <input type="date" value={editingStudent.birth_date || ''} onChange={(e) => setEditingStudent({...editingStudent, birth_date: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '14px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" value={editingStudent.parent_name || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_name: e.target.value})} placeholder={t('parent_name_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '14px' }} />
                      <input type="tel" value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})} placeholder={t('phone_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'left', direction: 'ltr', fontSize: '14px' }} />
                    </div>

                    <div style={{ background: '#0C1520', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}` }}>
                      <QuranProgressSelector initialIndex={currentStudentQuarterIndex} onIndexChange={(newIndex) => setEditingStudent({ ...editingStudent, current_quarter_index: parseInt(newIndex) || 0 })} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <button type="submit" disabled={isLocalSaving} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '14px' }}>{isArabic ? 'حفظ التغييرات' : 'Save'}</button>
                      <button type="button" onClick={() => setEditingStudent(null)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', flex: 1, fontSize: '14px' }}>{t('cancel')}</button>
                    </div>
                  </form>
                ) : (
                  /* كارت عرض ذكي فائق الأناقة مع محاذاة ديناميكية كاملة للغات */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px' }}>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>{student.name}</span>
                        {currentAge !== null && <span style={{ fontSize: '12px', color: C.gold || '#C9A84C', fontWeight: '600' }}>({currentAge} {isArabic ? 'سنة' : 'yrs'})</span>}
                      </div>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: student.gender === 'female' ? '#EC4899' : '#3B82F6', color: '#fff', fontWeight: 'bold' }}>
                        {student.gender === 'female' ? t('female') : t('male')}
                      </span>
                    </div>

                    {/* تفاصيل الكشف المدعومة بالرموز التعبيرية الأنيقة */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: C.text || '#9CA3AF', opacity: 0.9 }}>
                      {student.parent_phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhone size={11} style={{color: '#9CA3AF'}} /> <span style={{ direction: 'ltr' }}>{student.parent_phone}</span></span>}
                      {student.parent_name && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUserShield size={12} /> {t('parent_prefix')} {student.parent_name}</span>}
                      {student.payment_plan && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaMoneyBillWave size={12} style={{ color: '#10B981' }} /> {isArabic ? 'نظام الاشتراك:' : 'Plan:'} {student.payment_plan}</span>}
                      {student.notes && <span style={{ color: '#6B7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}><FaFileAlt size={11} /> {student.notes}</span>}
                    </div>

                    {/* شريط التقدم التفاعلي للقرآن الكريم */}
                    <div style={{ marginTop: '4px' }}>
                      <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
                    </div>

                    {/* خط التحكم والتحويل السريع للأرشفة والتعديل */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border || '#1E293B'}`, paddingTop: '8px', marginTop: '4px' }}>
                      <button type="button" onClick={() => handleToggleArchive(student.id, student.is_archived)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 0' }}>
                        <FaArchive size={11} /> {student.is_archived ? (isArabic ? 'إلغاء الأرشفة' : 'Unarchive') : (isArabic ? 'أرشفة الطالب' : 'Archive')}
                      </button>
                      <button type="button" onClick={() => setEditingStudent({ ...student })} style={{ background: 'none', border: 'none', color: C.gold || '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 0' }}>
                        <FaEdit size={11} /> {isArabic ? 'تعديل سريع' : 'Quick Edit'}
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
