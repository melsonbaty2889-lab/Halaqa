/* src/components/Students.jsx */

import React, { useState, useMemo, useCallback } from 'react';
import HijriDate from './HijriDate'; 
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '../constants/countries'; 
import QuranProgressBar from './QuranProgressBar'; 
import QuranProgressSelector from './QuranProgressSelector';
import { getQuranProgress } from '../utils/quranUtils';
import { handleDatabaseError } from '../utils/errorHandler';
import { 
  FaUserPlus, FaPhone, FaUserShield, FaEdit, 
  FaTimes, FaSave, FaArchive, FaMoneyBillWave, FaFileAlt, FaCheckCircle
} from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  const { t } = useTranslation();
  
  // حالات التحكم بالواجهة والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  // حالات نموذج إضافة طالب جديد
  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0); 
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('male');
  const [birthDate, setBirthDate] = useState(''); 
  const [paymentPlan, setPaymentPlan] = useState('شهري'); 
  const [countryCode, setCountryCode] = useState('EG');

  // حالات المعالجة والتعديل
  const [editingStudent, setEditingStudent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // حالة مودال التأكيد المخصص للأرشفة بدلاً من نافذة المتصفح
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, studentId: null, studentName: '', isArchived: false });

  // حساب العمر في الذاكرة
  const calculateAge = useCallback((dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, []);

  // معالجة النصوص العربية لمنع تكرار الحساب
  const normalizeArabic = useCallback((str) => {
    if (!str) return '';
    return str
      .trim()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  }, []);

  // فلترة الطلاب بذكاء عالي وحفظ النتيجة
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    return students.filter(student => {
      if (showArchived && !student.is_archived) return false;
      if (!showArchived && student.is_archived) return false;
      
      const search = normalizeArabic(searchTerm);
      return (
        normalizeArabic(student?.name).includes(search) ||
        student?.parent_phone?.includes(searchTerm) ||
        normalizeArabic(student?.current_surah).includes(search)
      );
    });
  }, [students, searchTerm, showArchived, normalizeArabic]);

  // حفظ مصفوفات الخيارات الثابتة
  const paymentPlans = useMemo(() => [
    { value: 'شهري', label: 'اشتراك شهري دوري' },
    { value: 'فصلي', label: 'اشتراك فصلي (كل 3 شهور)' },
    { value: 'سنوي', label: 'اشتراك سنوي كامل' },
    { value: 'منحة', label: 'منحة دراسية / إعفاء' },
  ], []);

  const countryOptions = useMemo(() => COUNTRIES_LIST, []);

  // إدارة رسائل التنبيه المؤقتة
  const showMessage = useCallback((message, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showMessage('اسم الطالب مطلوب', 'error');

    setIsAdding(true);
    setError(null);

    let activeAcademyId = academyId;
    let currentUserId = null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        
        if (!activeAcademyId) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('academy_id')
            .eq('id', user.id)
            .single();
          
          if (profileData?.academy_id) {
            activeAcademyId = profileData.academy_id;
          } else {
            const { data: staffData } = await supabase
              .from('staff')
              .select('academy_id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (staffData?.academy_id) {
              activeAcademyId = staffData.academy_id;
            } else if (user.user_metadata?.academy_id) {
              activeAcademyId = user.user_metadata.academy_id;
            }
          }
        }
      }
    } catch (err) {
      console.error('فشل جلب بيانات المستخدم والأكاديمية من جداول الصلاحيات:', err);
    }

    if (!activeAcademyId) {
      setIsAdding(false);
      return showMessage('معرّف الأكاديمية غير موجود، يرجى التحقق من ربط هذا الحساب بأكاديمية مفعلة', 'error');
    }
    
    const autoSurahText = getQuranProgress(currentQuarterIndex).text;

    try {
      const { data, error: insertError } = await supabase
        .from('students')
        .insert([{ 
          name: name.trim(), 
          parent_phone: parentPhone.trim() || null,
          parent_name: parentName.trim() || null,       
          current_surah: autoSurahText,             
          notes: notes.trim() || null,                 
          gender: gender,                              
          academy_id: activeAcademyId, 
          added_by: currentUserId, 
          teacher_id: null, 
          status: 'active',
          is_archived: false,
          birth_date: birthDate || null, 
          payment_plan: paymentPlan,     
          country_code: countryCode.trim() || null, 
          current_quarter_index: currentQuarterIndex   
        }]).select();

      if (insertError) throw insertError;
      
      if (data && data[0]) {
        if (setStudents) setStudents(prev => [data[0], ...prev]);
        
        setName(''); setParentPhone(''); setParentName(''); setCurrentQuarterIndex(0); 
        setNotes(''); setBirthDate(''); setPaymentPlan('شهري'); setCountryCode('EG');
        setShowAddForm(false);
        showMessage('تم إضافة الطالب بنجاح ✅');
      }
    } catch (err) {
      const userMessage = handleDatabaseError ? handleDatabaseError(err, 'insert') : err.message;
      showMessage(userMessage, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent?.id) return showMessage('معرّف الطالب غير صحيح', 'error');

    setUpdatingId(editingStudent.id);
    setError(null);
    
    const selectedIndex = parseInt(editingStudent.current_quarter_index) || 0;
    const autoSurahText = getQuranProgress(selectedIndex).text;

    try {
      const { error: updateError } = await supabase
        .from('students')
        .update({
          name: editingStudent.name.trim(),
          parent_phone: editingStudent.parent_phone?.trim() || null,
          parent_name: editingStudent.parent_name?.trim() || null,
          current_surah: autoSurahText,                     
          current_quarter_index: selectedIndex,             
          notes: editingStudent.notes?.trim() || null,
          gender: editingStudent.gender,
          birth_date: editingStudent.birth_date || null,
          payment_plan: editingStudent.payment_plan,
          country_code: editingStudent.country_code || null, 
          last_test_score: editingStudent.last_test_score ? parseInt(editingStudent.last_test_score) : 0,
          level_score: editingStudent.level_score ? parseInt(editingStudent.level_score) : 0
        })
        .eq('id', editingStudent.id);

      if (updateError) throw updateError;

      const updatedData = { ...editingStudent, current_surah: autoSurahText, current_quarter_index: selectedIndex };
      setStudents(prev => prev.map(st => st.id === editingStudent.id ? updatedData : st));
      setEditingStudent(null);
      showMessage('تم تحديث بيانات الطالب بنجاح ✅');
    } catch (err) {
      const userMessage = handleDatabaseError ? handleDatabaseError(err, 'update') : err.message;
      showMessage(userMessage, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // فتح مودال التأكيد المخصص بدلاً من التنبيه الافتراضي
  const triggerArchiveConfirm = (studentId, studentName, isArchived) => {
    setConfirmModal({
      isOpen: true,
      studentId,
      studentName,
      isArchived
    });
  };

  // تنفيذ الأرشفة الفعلي بعد موافقة المستخدم في المودال الأنيق
  const executeToggleArchive = async () => {
    const { studentId, isArchived } = confirmModal;
    setConfirmModal({ isOpen: false, studentId: null, studentName: '', isArchived: false });

    try {
      const { error: archiveError } = await supabase
        .from('students')
        .update({ is_archived: !isArchived })
        .eq('id', studentId);
      
      if (archiveError) throw archiveError;
      
      setStudents(prev => 
        prev.map(st => st.id === studentId ? { ...st, is_archived: !isArchived } : st)
      );
      showMessage(!isArchived ? 'تم أرشفة الطالب بنجاح 📦' : 'تم إعادة تنشيط الطالب بنجاح 🟢');
    } catch (err) {
      showMessage('حدث خطأ أثناء تعديل حالة الأرشفة', 'error');
    }
  };

  return (
    <div dir="rtl" style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '10px', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* الهيدر الرئيسى */}
      <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '15px' }}>
        <h2 style={{ color: C.gold || '#C9A84C', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold' }}>
          <span style={{ fontSize: '24px' }}>🎓</span> إدارة الطلاب والشؤون التعليمية
        </h2>
        
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#9CA3AF' }}>
          📅 هجري: <HijriDate style={{ color: C.gold || '#C9A84C', fontWeight: 'bold' }} />
        </div>
      </div>

      {/* رسائل الخطأ والنجاح المدمجة بالواجهة */}
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
      {successMsg && <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{successMsg}</div>}

      {/* أزرار التحكم العليا */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
        <button
          type="button"
          onClick={() => { setShowArchived(!showArchived); setEditingStudent(null); setShowAddForm(false); setSearchTerm(''); }}
          style={{ 
            background: showArchived ? 'rgba(239, 68, 68, 0.15)' : '#1e293b', 
            color: showArchived ? '#F87171' : '#fff', 
            border: `1px solid ${showArchived ? '#EF4444' : (C.border || '#1E293B')}`, 
            padding: '12px', 
            borderRadius: '10px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            fontWeight: 'bold', 
            fontSize: '15px',
            transition: 'all 0.3s ease'
          }}
        >
          <FaArchive style={{ color: showArchived ? '#EF4444' : 'inherit' }} /> 
          {showArchived ? 'عرض الطلاب النشطين' : 'عرض الأرشيف'}
        </button>

        <button 
          type="button"
          onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
          style={{ background: showAddForm ? (C.danger || '#EF4444') : (C.gold || '#C9A84C'), color: showAddForm ? '#fff' : '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}
        >
          {showAddForm ? <><FaTimes /> إلغاء 👤+</> : <><FaUserPlus /> إضافة طالب جديد</>}
        </button>
      </div>

      {/* استمارة إضافة طالب كاملة */}
      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface || '#111827', padding: '20px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px', fontWeight: '500' }}>* اسم الطالب الكامل</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسم الطالب ثلاثياً" style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'right' }} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>اسم ولي الأمر الثنائي</label>
            <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="أدخل اسم الأب أو المسؤول عن الطالب" style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'right' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="رقم الهاتف (واتساب)" style={{ width: '100%', boxSizing: 'border-box', background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'left', direction: 'ltr' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name_ar}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>نظام السداد والاشتراك المالي</label>
            <select value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
              {paymentPlans.map((plan) => (
                <option key={plan.value} value={plan.value}>{plan.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>المستوى الحالي في الحفظ (الورد):</label>
            <div style={{ background: '#0C1520', padding: '12px', borderRadius: '8px', border: `1px solid ${C.border || '#1E293B'}` }}>
              <QuranProgressSelector initialIndex={currentQuarterIndex} onIndexChange={(newIndex) => setCurrentQuarterIndex(newIndex)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>ملاحظات المعلم أو الإدارة</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي ملاحظات خاصة بالتوقيت أو الحفظ..." style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', height: '65px', resize: 'none', textAlign: 'right' }} />
          </div>

          <button type="submit" disabled={isAdding} style={{ background: C.gold || '#C9A84C', color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', opacity: isAdding ? 0.6 : 1 }}>
            {isAdding ? 'جاري حفظ البيانات...' : 'تأكيد إضافة الطالب'}
          </button>
        </form>
      )}

      {/* حقل البحث */}
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="...ابحث عن طالب بالاسم، الهاتف، أو الحفظ" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', background: C.surface || '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '14px 16px', borderRadius: '10px', outline: 'none', fontSize: '14px', textAlign: 'right', boxSizing: 'border-box' }} 
        />
      </div>

      {/* مؤشر الحالة الذكي الحالي والعدّاد الفوري */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 4px' }}>
        <h3 style={{ color: showArchived ? '#F87171' : '#10B981', margin: 0, fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {showArchived ? '📦 أرشيف الطلاب (غير النشطين)' : '🟢 الطلاب النشطون حالياً'}
        </h3>
        <span style={{ background: '#1e293b', color: '#9CA3AF', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', border: `1px solid ${C.border || '#1E293B'}` }}>
          العدد: {filteredStudents.length}
        </span>
      </div>

      {/* قائمة الطلاب */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredStudents.length === 0 ? (
          <div style={{ background: C.surface || '#111827', padding: '25px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            لا يوجد طلاب مسجلين يطابقون خيارات البحث الحالية.
          </div>
        ) : (
          filteredStudents.map(student => {
            const isCurrentEditing = editingStudent?.id === student.id;
            const isLocalSaving = updatingId === student.id;
            const currentAge = calculateAge(student.birth_date);
            const matchedCountry = countryOptions.find(c => c.code === student.country_code);
            const currentStudentQuarterIndex = editingStudent ? (editingStudent.current_quarter_index ?? 0) : 0;

            return (
              <div key={student.id} style={{ background: C.surface || '#111827', padding: '18px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold || '#C9A84C'}` : `1px solid ${C.border || '#1E293B'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {isCurrentEditing ? (
                  <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', width: '100%', boxSizing: 'border-box' }} required />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px' }}><option value="male">ذكر</option><option value="female">أنثى</option></select>
                      <input type="date" value={editingStudent.birth_date || ''} onChange={(e) => setEditingStudent({...editingStudent, birth_date: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', colorScheme: 'dark' }} />
                    </div>

                    <input type="text" value={editingStudent.parent_name || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_name: e.target.value})} placeholder="اسم ولي الأمر" style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
                    <input type="tel" value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})} placeholder="هاتف التواصل" style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'left', direction: 'ltr', width: '100%', boxSizing: 'border-box' }} />

                    <div style={{ background: '#0C1520', padding: '10px', borderRadius: '6px', border: `1px solid ${C.border || '#1E293B'}` }}>
                      <QuranProgressSelector initialIndex={currentStudentQuarterIndex} onIndexChange={(newIndex) => setEditingStudent({ ...editingStudent, current_quarter_index: parseInt(newIndex) || 0 })} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" placeholder="آخر اختبار" value={editingStudent.last_test_score || ''} onChange={(e) => setEditingStudent({...editingStudent, last_test_score: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, minWidth: 0 }} />
                      <input type="number" placeholder="المستوى العام" value={editingStudent.level_score || ''} onChange={(e) => setEditingStudent({...editingStudent, level_score: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, minWidth: 0 }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <button type="submit" disabled={isLocalSaving} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, opacity: isLocalSaving ? 0.6 : 1 }}><FaSave /> حفظ</button>
                      <button type="button" onClick={() => setEditingStudent(null)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', flex: 1 }}><FaTimes /> إلغاء</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{matchedCountry ? matchedCountry.flag : '🌐'}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{student.name}</span>
                        {currentAge !== null && <span style={{ fontSize: '12px', color: C.gold || '#C9A84C' }}>({currentAge} سنة)</span>}
                      </div>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: student.gender === 'female' ? '#EC4899' : '#3B82F6', color: '#fff' }}>{student.gender === 'female' ? 'أنثى' : 'ذكر'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: C.text || '#9CA3AF', opacity: 0.9 }}>
                      {student.parent_phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhone size={11} /> <span style={{ direction: 'ltr' }}>{student.parent_phone}</span></span>}
                      {student.parent_name && <span><FaUserShield size={12} /> المسؤول: {student.parent_name}</span>}
                      {student.payment_plan && <span><FaMoneyBillWave size={12} style={{ color: '#10B981' }} /> الاشتراك: {student.payment_plan}</span>}
                      {student.notes && <span style={{ color: '#6B7280', fontSize: '12px' }}><FaFileAlt size={11} /> {student.notes}</span>}
                    </div>

                    <div style={{ marginTop: '5px' }}>
                      <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border || '#1E293B'}`, paddingTop: '10px', marginTop: '5px' }}>
                      
                      {/* زر الأرشفة الديناميكي حسب حالة الملف */}
                      <button 
                        type="button" 
                        onClick={() => triggerArchiveConfirm(student.id, student.name, student.is_archived)} 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: student.is_archived ? '#10B981' : (C.danger || '#EF4444'), 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        <FaArchive size={12} /> 
                        {student.is_archived ? 'إعادة تنشيط الطالب' : 'أرشفة الطالب'}
                      </button>

                      <button type="button" onClick={() => setEditingStudent({ ...student })} style={{ background: 'none', border: 'none', color: C.gold || '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <FaEdit size={12} /> تعديل سريع
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 🌟 مودال التأكيد الداكن المخصص (Custom Dark Confirmation Modal) بديل رسائل المتصفح */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', boxSizing: 'border-box', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px', color: confirmModal.is_archived ? '#10B981' : '#EF4444' }}>
              ⚠️
            </div>
            <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
              {confirmModal.is_archived ? 'تأكيد إعادة التنشيط' : 'تأكيد أرشفة الطالب'}
            </h4>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              هل أنت متأكد من {confirmModal.is_archived ? 'إعادة تنشيط' : 'أرشفة'} الطالب <strong style={{ color: C.gold || '#C9A84C' }}>"{confirmModal.studentName}"</strong>؟ 
              {confirmModal.is_archived ? ' سيعود إلى قائمة الطلاب النشطين.' : ' لن يظهر في القائمة الرئيسية للطلاب النشطين.'}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                type="button" 
                onClick={executeToggleArchive} 
                style={{ 
                  background: confirmModal.is_archived ? '#10B981' : '#EF4444', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  fontSize: '14px' 
                }}
              >
                نعم، متأكد
              </button>
              <button 
                type="button" 
                onClick={() => setConfirmModal({ isOpen: false, studentId: null, studentName: '', isArchived: false })} 
                style={{ 
                  background: '#1E293B', 
                  color: '#fff', 
                  border: '1px solid #374151', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontSize: '14px' 
                }}
              >
                إلغاء التراجع
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
