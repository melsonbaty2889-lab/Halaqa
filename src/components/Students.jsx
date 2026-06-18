import React, { useState, useEffect } from 'react';
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
  FaCalendarAlt, FaGlobe, FaMoneyBillWave, FaFileAlt, FaUser,
  FaCheckCircle, FaExclamationCircle, FaUsers, FaMars, FaVenus,
  FaSortAmountDown, FaChevronDown
} from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  // حالات التحكم الأساسية بالواجهة
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  // ميزات الفرز والتحكم في الأداء المستقبلي (SaaS Future-Proof)
  const [sortBy, setSortBy] = useState('newest'); // options: newest, alphabetical, progress
  const [visibleCount, setVisibleCount] = useState(10); // الحد الأولي لعرض الطلاب وتسريع التصفح
  
  // حالات استمارة إضافة طالب جديد
  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0); 
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('male');
  const [birthDate, setBirthDate] = useState(''); 
  const [paymentPlan, setPaymentPlan] = useState('شهري'); 
  const [countryCode, setCountryCode] = useState('EG');

  // حالات التحكم بالتعديل والتحميل
  const [editingStudent, setEditingStudent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); 
  
  // نظام التنبيهات الذكي المنبثق
  const [inlineMessage, setInlineMessage] = useState({ text: '', type: '' });

  const triggerToast = (text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage({ text: '', type: '' }), 4000);
  };

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

  // حساب الإحصائيات السريعة للوحة التحكم المصغرة
  const activeCount = students.filter(s => !s.is_archived).length;
  const archivedCount = students.filter(s => s.is_archived).length;
  const maleCount = students.filter(s => !s.is_archived && s.gender === 'male').length;
  const femaleCount = students.filter(s => !s.is_archived && s.gender === 'female').length;

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
      triggerToast(isArabic ? 'تم تسجيل الطالب بنجاح واحترافية! 🎉' : 'Student registered successfully!', 'success');
    } catch (error) {
      console.error(error);
      triggerToast(isArabic ? 'حدث خطأ أثناء إضافة الطالب' : 'Error adding student', 'error');
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
      triggerToast(isArabic ? 'تم تحديث بيانات الطالب بنجاح' : 'Student updated successfully!', 'success');
    } catch (error) {
      console.error(error);
      triggerToast(isArabic ? 'تعذر حفظ التعديلات' : 'Failed to update student', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleArchive = async (studentId, currentArchiveStatus) => {
    const confirmMsg = isArabic ? 'هل أنت متأكد من تغيير حالة أرشفة الطالب؟' : 'Are you sure you want to change archive status?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const { error } = await supabase.from('students').update({ is_archived: !currentArchiveStatus }).eq('id', studentId);
      if (error) throw error;
      setStudents(prev => prev.map(st => st.id === studentId ? { ...st, is_archived: !currentArchiveStatus } : st));
      triggerToast(isArabic ? 'تم نقل الطالب بنجاح' : 'Status updated successfully', 'success');
    } catch (error) {
      triggerToast('Error updating archive status', 'error');
    }
  };

  // محرك الفلترة والترتيب المتقدم والذكي
  const filteredAndSortedStudents = (() => {
    if (!Array.isArray(students)) return [];
    
    // 1. الفلترة حسب التبويب والبحث
    let result = students.filter(student => {
      if (showArchived && !student.is_archived) return false;
      if (!showArchived && student.is_archived) return false;
      
      const search = normalizeArabic(searchTerm);
      return (
        normalizeArabic(student?.name).includes(search) ||
        student?.parent_phone?.includes(searchTerm) ||
        normalizeArabic(student?.current_surah).includes(search)
      );
    });

    // 2. تطبيق الترتيب والفرز (Sorting Logic)
    if (sortBy === 'alphabetical') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || '', isArabic ? 'ar' : 'en'));
    } else if (sortBy === 'progress') {
      result.sort((a, b) => (b.current_quarter_index || 0) - (a.current_quarter_index || 0));
    } else {
      // الترتيب الافتراضي: الأحدث هبوطياً حسب الـ ID
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  })();

  // الطلاب المتاح عرضهم حالياً بناءً على العرض التدريجي لحماية الأداء
  const displayedStudents = filteredAndSortedStudents.slice(0, visibleCount);

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '12px', textAlign: isArabic ? 'right' : 'left', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* نظام التنبيهات الاحترافي العائم الذكي */}
      {inlineMessage.text && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: inlineMessage.type === 'success' ? '#059669' : '#DC2626', color: '#fff', padding: '12px 20px', borderRadius: '30px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', fontSize: '14px', fontWeight: 'bold', minWidth: '280px', justifyContent: 'center' }}>
          {inlineMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      {/* هيدر الصفحة */}
      <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '5px' }}>
        <h2 style={{ color: C.gold || '#C9A84C', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '20px', fontWeight: '800' }}>
          <span>🎓</span> {showArchived ? (isArabic ? 'أرشيف وحالات الطلاب المتوقفة' : 'Archived Students Database') : t('students_management_title')}
        </h2>
      </div>

      {/* لوحة التحكم والإحصاءات التعليمية السريعة */}
      <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: '12px', color: '#9CA3AF', border: `1px solid ${C.border || '#1E293B'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUsers style={{ color: C.gold }} /> <span>{isArabic ? 'النشطين:' : 'Active:'} <strong style={{ color: '#fff' }}>{activeCount}</strong></span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaMars style={{ color: '#3B82F6' }} /> <span>{isArabic ? 'ذكور:' : 'Males:'} <strong style={{ color: '#fff' }}>{maleCount}</strong></span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaVenus style={{ color: '#EC4899' }} /> <span>{isArabic ? 'إناث:' : 'Females:'} <strong style={{ color: '#fff' }}>{femaleCount}</strong></span></div>
        {archivedCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaArchive style={{ color: '#6B7280' }} /> <span>{isArabic ? 'أرشيف:' : 'Archived:'} <strong style={{ color: '#fff' }}>{archivedCount}</strong></span></div>}
      </div>

      {/* نظام التبويبات الفاخر المطور */}
      <div style={{ display: 'flex', background: '#0F172A', padding: '4px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => { setShowArchived(false); setEditingStudent(null); setShowAddForm(false); setVisibleCount(10); }}
          style={{ flex: 1, background: !showArchived ? '#1E293B' : 'transparent', color: !showArchived ? (C.gold || '#C9A84C') : '#9CA3AF', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <FaUsers size={14} /> {isArabic ? 'الطلاب النشطين' : 'Active Students'}
        </button>
        <button
          type="button"
          onClick={() => { setShowArchived(true); setEditingStudent(null); setShowAddForm(false); setSearchTerm(''); setVisibleCount(10); }}
          style={{ flex: 1, background: showArchived ? '#1E293B' : 'transparent', color: showArchived ? (C.gold || '#C9A84C') : '#9CA3AF', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <FaArchive size={13} /> {isArabic ? 'سجل الأرشيف' : 'Archived Records'}
        </button>
      </div>

      {/* زر إضافة طالب عائم وذكي */}
      {!showArchived && (
        <div style={{ marginBottom: '16px' }}>
          <button 
            type="button"
            onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
            style={{ width: '100%', background: showAddForm ? '#EF4444' : `linear-gradient(135deg, ${C.gold || '#C9A84C'} 0%, #B3923B 100%)`, color: showAddForm ? '#fff' : '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {showAddForm ? <><FaTimes /> {t('cancel')}</> : <><FaUserPlus /> {t('add_new_student')}</>}
          </button>
        </div>
      )}

      {/* استمارة إضافة طالب جديد */}
      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface || '#111827', padding: '16px', borderRadius: '14px', border: `1px solid ${C.border || '#1E293B'}`, marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* المجموعة الأولى: البيانات الشخصية */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0C1520', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}><FaUser size={11} style={{color: C.gold}} /> {t('student_name_label')}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('student_name_placeholder')} style={{ background: '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', outline: 'none', fontSize: '13px' }} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500' }}>{t('gender_label')}</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', height: '40px' }}>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><FaCalendarAlt size={11} /> {isArabic ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                <input type="date" value={birthDate} style={{ background: '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', height: '40px', boxSizing: 'border-box' }} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* المجموعة الثانية: بيانات الاتصال وأولياء الأمور */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0C1520', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}><FaUserShield size={11} /> {t('parent_name_label')}</label>
              <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder={t('parent_name_placeholder')} style={{ background: '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}><FaPhone size={10} /> {isArabic ? 'رقم هاتف التواصل' : 'Phone Number'}</label>
                <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder={t('phone_placeholder')} style={{ background: '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', textAlign: 'left', direction: 'ltr' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><FaGlobe size={11} /> {isArabic ? 'الدولة' : 'Country'}</label>
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ background: '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', height: '40px' }}>
                  {COUNTRIES_LIST.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* المجموعة الثالثة: الاشتراك المالي والحفظ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0C1520', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}><FaMoneyBillWave size={11} style={{color: '#10B981'}} /> {isArabic ? 'نظام السداد والاشتراك المالي' : 'Financial Plan'}</label>
              <select value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)} style={{ background: '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', height: '40px' }}>
                <option value="شهري">{isArabic ? 'اشتراك شهري دوري' : 'Monthly Subscription'}</option>
                <option value="فصلي">{isArabic ? 'اشتراك فصلي (كل 3 شهور)' : 'Quarterly (3 Months)'}</option>
                <option value="سنوي">{isArabic ? 'اشتراك سنوي كامل' : 'Yearly Plan'}</option>
                <option value="منحة">{isArabic ? 'منحة دراسية / إعفاء' : 'Scholarship / Free'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500' }}>{isArabic ? 'مستوى الحفظ الحالي (الورد الابتدائي)' : 'Current Quran Level'}</label>
              <div style={{ background: '#111827', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}` }}>
                <QuranProgressSelector initialIndex={currentQuarterIndex} onIndexChange={(newIndex) => setCurrentQuarterIndex(newIndex)} />
              </div>
            </div>
          </div>

          {/* ملاحظات المعلم */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '500' }}>{t('teacher_notes_label')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('notes_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '8px', outline: 'none', height: '55px', resize: 'none', fontSize: '13px' }} />
          </div>

          <button type="submit" disabled={isAdding} style={{ background: C.gold || '#C9A84C', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '5px' }}>
            {isAdding ? t('saving_progress') : t('confirm_add_student')}
          </button>
        </form>
      )}

      {/* قسم البحث والترتيب المدمج (Search & Sort Row) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(10); }} 
            style={{ width: '100%', background: C.surface || '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px 12px', borderRadius: '10px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} 
          />
          {searchTerm && (
            <span onClick={() => setSearchTerm('')} style={{ position: 'absolute', left: isArabic ? '12px' : 'auto', right: isArabic ? 'auto' : '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', cursor: 'pointer', fontSize: '12px' }}><FaTimes /></span>
          )}
        </div>

        {/* أداة خيارات الترتيب الذكية السريعة */}
        <div style={{ position: 'relative', background: C.surface || '#111827', border: `1px solid ${C.border || '#1E293B'}`, borderRadius: '10px', padding: '0 8px', display: 'flex', alignItems: 'center', height: '38px' }}>
          <FaSortAmountDown size={12} style={{ color: C.gold || '#C9A84C', marginLeft: isArabic ? '4px' : '0', marginRight: isArabic ? '0' : '4px' }} />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none', cursor: 'pointer', paddingRight: isArabic ? '0' : '14px', paddingLeft: isArabic ? '14px' : '0', appearance: 'none', fontWeight: '600' }}
          >
            <option value="newest" style={{ background: '#111827' }}>{isArabic ? 'الأحدث' : 'Newest'}</option>
            <option value="alphabetical" style={{ background: '#111827' }}>{isArabic ? 'أبجدي' : 'A-Z'}</option>
            <option value="progress" style={{ background: '#111827' }}>{isArabic ? 'التحضير' : 'Progress'}</option>
          </select>
          <FaChevronDown size={8} style={{ position: 'absolute', left: isArabic ? '8px' : 'auto', right: isArabic ? 'auto' : '8px', color: '#6B7280', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* قائمة كروت الطلاب الفاخرة المطورة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayedStudents.length === 0 ? (
          <div style={{ background: C.surface || '#111827', padding: '30px 15px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            <FaUsers size={24} style={{ color: '#4b5563', marginBottom: '8px' }} />
            <div>{t('no_search_results')}</div>
          </div>
        ) : (
          displayedStudents.map(student => {
            const isCurrentEditing = editingStudent?.id === student.id;
            const isLocalSaving = updatingId === student.id;
            const currentAge = calculateAge(student.birth_date);
            const matchedCountry = COUNTRIES_LIST.find(c => c.code === student.country_code);
            const currentStudentQuarterIndex = editingStudent ? (editingStudent.current_quarter_index ?? 0) : 0;

            return (
              <div key={student.id} style={{ background: C.surface || '#111827', padding: '14px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold || '#C9A84C'}` : `1px solid ${C.border || '#1E293B'}`, display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                
                {isCurrentEditing ? (
                  /* نموذج التعديل السريع المتجاوب المنظف والمطور بالكامل */
                  <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: C.gold, fontSize: '11px', fontWeight: 'bold' }}>{isArabic ? 'تعديل اسم الطالب:' : 'Edit Name:'}</label>
                      <input type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', fontSize: '13px' }} required />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', height: '38px' }}>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                      </select>
                      <input type="date" value={editingStudent.birth_date || ''} onChange={(e) => setEditingStudent({...editingStudent, birth_date: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', height: '38px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="text" value={editingStudent.parent_name || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_name: e.target.value})} placeholder={t('parent_name_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px' }} />
                      <input type="tel" value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})} placeholder={t('phone_placeholder')} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'left', direction: 'ltr', fontSize: '13px' }} />
                    </div>

                    <div style={{ background: '#0C1520', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}` }}>
                      <label style={{ color: '#9CA3AF', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{isArabic ? 'تحديث مستوى الحفظ الحالي:' : 'Update Progress:'}</label>
                      <QuranProgressSelector initialIndex={currentStudentQuarterIndex} onIndexChange={(newIndex) => setEditingStudent({ ...editingStudent, current_quarter_index: parseInt(newIndex) || 0 })} />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button type="submit" disabled={isLocalSaving} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '13px' }}>{isLocalSaving ? t('saving_progress') : (isArabic ? 'اعتماد وحفظ' : 'Save')}</button>
                      <button type="button" onClick={() => setEditingStudent(null)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', flex: 1, fontSize: '13px' }}>{t('cancel')}</button>
                    </div>
                  </form>
                ) : (
                  /* كارت عرض فائق الأناقة */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '15px' }}>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{student.name}</span>
                        {currentAge !== null && <span style={{ fontSize: '11px', color: C.gold || '#C9A84C', background: '#1e293b', padding: '1px 6px', borderRadius: '6px', fontWeight: '600' }}>{currentAge} {isArabic ? 'سنة' : 'yrs'}</span>}
                      </div>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: student.gender === 'female' ? '#EC4899' : '#3B82F6', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {student.gender === 'female' ? <FaVenus size={9} /> : <FaMars size={9} />}
                        {student.gender === 'female' ? t('female') : t('male')}
                      </span>
                    </div>

                    {/* تفاصيل سجل الكشف المدعومة بالأيقونات الفاخرة */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', color: '#9CA3AF', opacity: 0.9, background: '#0C1520', padding: '8px', borderRadius: '8px', marginTop: '2px' }}>
                      {student.parent_phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhone size={10} style={{color: C.gold}} /> <span style={{ direction: 'ltr', color: '#fff' }}>{student.parent_phone}</span></span>}
                      {student.parent_name && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUserShield size={11} /> {t('parent_prefix')} <span style={{color: '#fff'}}>{student.parent_name}</span></span>}
                      {student.payment_plan && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaMoneyBillWave size={11} style={{ color: '#10B981' }} /> {isArabic ? 'نظام الاشتراك:' : 'Plan:'} <span style={{color: '#fff'}}>{student.payment_plan}</span></span>}
                      {student.notes && <span style={{ color: '#6B7280', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', borderTop: '1px solid #1e293b', paddingTop: '4px' }}><FaFileAlt size={10} /> {student.notes}</span>}
                    </div>

                    {/* شريط التقدم التفاعلي للقرآن الكريم */}
                    <div style={{ marginTop: '4px', background: '#0F172A', padding: '6px', borderRadius: '8px' }}>
                      <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
                    </div>

                    {/* خيارات التحكم السفلية السلسة والسريعة */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border || '#1E293B'}`, paddingTop: '6px', marginTop: '4px' }}>
                      <button type="button" onClick={() => handleToggleArchive(student.id, student.is_archived)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px' }}>
                        <FaArchive size={10} /> {student.is_archived ? (isArabic ? 'تنشيط الطالب وعرضه' : 'Unarchive') : (isArabic ? 'أرشفة ونقل الطالب' : 'Archive')}
                      </button>
                      <button type="button" onClick={() => setEditingStudent({ ...student })} style={{ background: 'none', border: 'none', color: C.gold || '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px' }}>
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

      {/* زر العرض التدريجي عند تزايد البيانات (Load More Button) */}
      {filteredAndSortedStudents.length > visibleCount && (
        <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '8px' }}>
          <button 
            type="button" 
            onClick={() => setVisibleCount(prev => prev + 10)} 
            style={{ background: '#1E293B', color: C.gold || '#C9A84C', border: `1px solid ${C.border || '#1E293B'}`, padding: '8px 24px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {isArabic ? 'عرض المزيد من الطلاب 🔽' : 'Load More Students 🔽'}
          </button>
        </div>
      )}
    </div>
  );
}
