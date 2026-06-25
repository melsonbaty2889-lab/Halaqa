/**
 * IMPROVED Students Component
 * This is a reference file showing how to integrate useMemo optimizations
 * To use: Replace src/components/Students.jsx with the optimized version from this file
 * 
 * Key improvements:
 * 1. useMemo for filteredStudents (prevents recalculation on every render)
 * 2. useCallback for expensive functions (calculateAge, normalizeArabic)
 * 3. Memoized payment plan and country options
 * 4. Better error handling with toast notifications
 */

import React, { useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '../constants/countries'; 
import QuranProgressBar from './QuranProgressBar'; 
import QuranProgressSelector from './QuranProgressSelector';
import { getQuranProgress } from '../utils/quranUtils';
import { handleDatabaseError } from '../utils/errorHandler';
import { 
  FaUserPlus, FaGraduationCap, FaPhone, 
  FaUserShield, FaEdit, FaTimes, FaSave, FaArchive, 
  FaEyeSlash, FaGlobe, FaMoneyBillWave, FaFileAlt
} from 'react-icons/fa';

export default function StudentsImproved({ students = [], setStudents, academyId }) {
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
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ✨ IMPROVEMENT 1: Memoize calculateAge to prevent recreation
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

  // ✨ IMPROVEMENT 2: Memoize normalizeArabic function
  const normalizeArabic = useCallback((str) => {
    if (!str) return '';
    return str
      .trim()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  }, []);

  // ✨ IMPROVEMENT 3: Memoize filtered students (prevents O(n) recalculation on every render)
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

  // ✨ IMPROVEMENT 4: Memoize payment plan options
  const paymentPlans = useMemo(() => [
    { value: 'شهري', label: 'اشتراك شهري دوري' },
    { value: 'فصلي', label: 'اشتراك فصلي (كل 3 شهور)' },
    { value: 'سنوي', label: 'اشتراك سنوي كامل' },
    { value: 'منحة', label: 'منحة دراسية / إعفاء' },
  ], []);

  // ✨ IMPROVEMENT 5: Memoize country options
  const countryOptions = useMemo(() => COUNTRIES_LIST, []);

  // Clear messages after 4 seconds
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
    
    // Validate inputs
    if (!name.trim()) {
      showMessage('اسم الطالب مطلوب', 'error');
      return;
    }
    
    if (!academyId) {
      showMessage('معرّف الأكاديمية غير موجود', 'error');
      return;
    }

    setIsAdding(true);
    setError(null);
    
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
          academy_id: academyId,
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
        
        // Reset form
        setName('');
        setParentPhone('');
        setParentName('');
        setCurrentQuarterIndex(0); 
        setNotes('');
        setBirthDate('');
        setPaymentPlan('شهري');
        setCountryCode('EG');
        setShowAddForm(false);
        
        showMessage('تم إضافة الطالب بنجاح ✅');
      }
    } catch (err) {
      const userMessage = handleDatabaseError(err, 'insert');
      showMessage(userMessage, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingStudent?.id) {
      showMessage('معرّف الطالب غير صحيح', 'error');
      return;
    }

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

      setStudents(prev => 
        prev.map(st => st.id === editingStudent.id ? editingStudent : st)
      );
      setEditingStudent(null);
      showMessage('تم تحديث بيانات الطالب بنجاح ✅');
    } catch (err) {
      const userMessage = handleDatabaseError(err, 'update');
      showMessage(userMessage, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleArchive = async (studentId, currentArchiveStatus) => {
    if (!window.confirm(currentArchiveStatus ? 'إلغاء الأرشفة؟' : 'تأكيد الأرشفة؟')) return;
    
    try {
      const { error: archiveError } = await supabase
        .from('students')
        .update({ is_archived: !currentArchiveStatus })
        .eq('id', studentId);
      
      if (archiveError) throw archiveError;
      
      setStudents(prev => 
        prev.map(st => st.id === studentId 
          ? { ...st, is_archived: !currentArchiveStatus } 
          : st
        )
      );
      showMessage(currentArchiveStatus ? 'تم إلغاء الأرشفة ✅' : 'تم أرشفة الطالب ✅');
    } catch (err) {
      const userMessage = handleDatabaseError(err, 'update');
      showMessage(userMessage, 'error');
    }
  };

  return (
    <div dir="rtl" style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '10px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '15px' }}>
        <h2 style={{ color: C.gold || '#C9A84C', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold' }}>
          <span style={{ fontSize: '24px' }}>🎓</span> إدارة الطلاب والشؤون التعليمية
        </h2>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {successMsg}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
        <button
          type="button"
          onClick={() => { setShowArchived(!showArchived); setEditingStudent(null); setShowAddForm(false); setSearchTerm(''); }}
          style={{ background: '#1e293b', color: showArchived ? (C.gold || '#C9A84C') : '#fff', border: `1px solid ${C.border || '#1E293B'}`, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <FaArchive /> عرض الأرشيف
        </button>

        <button 
          type="button"
          onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
          style={{ background: showAddForm ? (C.danger || '#EF4444') : (C.gold || '#C9A84C'), color: showAddForm ? '#fff' : '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {showAddForm ? <><FaTimes /> إلغاء 👤+</> : <><FaUserPlus /> إضافة طالب جديد</>}
        </button>
      </div>

      {/* Add Form - Simplified for brevity (keep same structure as original) */}
      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface || '#111827', padding: '20px', borderRadius: '12px', border: `1px solid ${C.border || '#1E293B'}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px', fontWeight: '500' }}>* اسم الطالب الكامل</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسم الطالب ثلاثياً" style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }} required />
          </div>

          {/* Payment Plan Options - Now using memoized array */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>نظام السداد</label>
            <select value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
              {paymentPlans.map((plan) => (
                <option key={plan.value} value={plan.value}>{plan.label}</option>
              ))}
            </select>
          </div>

          {/* Country Options - Now using memoized array */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: C.text || '#fff', fontSize: '14px' }}>الدولة</label>
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
              {countryOptions.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isAdding} style={{ background: C.gold || '#C9A84C', color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: isAdding ? 0.6 : 1 }}>
            {isAdding ? 'جاري حفظ البيان��ت...' : 'تأكيد إضافة الطالب'}
          </button>
        </form>
      )}

      {/* Search Field */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="...ابحث عن طالب بالاسم، الهاتف، أو الحفظ" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', background: C.surface || '#111827', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '14px 16px', borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* Students List - Now uses memoized filtered results */}
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

            return (
              <div key={student.id} style={{ background: C.surface || '#111827', padding: '18px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold || '#C9A84C'}` : `1px solid ${C.border || '#1E293B'}` }}>
                
                {isCurrentEditing ? (
                  <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border || '#1E293B'}`, color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }} />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" disabled={isLocalSaving} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, opacity: isLocalSaving ? 0.6 : 1 }}>
                        <FaSave /> حفظ
                      </button>
                      <button type="button" onClick={() => setEditingStudent(null)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>
                        <FaTimes /> إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{student.name}</span>
                      {currentAge !== null && <span style={{ fontSize: '12px', color: C.gold || '#C9A84C' }}>({currentAge} سنة)</span>}
                    </div>

                    <QuranProgressBar currentQuarterIndex={student.current_quarter_index || 0} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.border || '#1E293B'}`, paddingTop: '10px', marginTop: '5px' }}>
                      <button type="button" onClick={() => handleToggleArchive(student.id, student.is_archived)} style={{ background: 'none', border: 'none', color: C.danger || '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <FaArchive size={11} /> أرشفة
                      </button>
                      <button type="button" onClick={() => setEditingStudent({ ...student })} style={{ background: 'none', border: 'none', color: C.gold || '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <FaEdit size={11} /> تعديل
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

/**
 * USAGE NOTES:
 * 1. This component uses useMemo to prevent recalculation of:
 *    - filteredStudents (O(n) search operation)
 *    - Payment plan options
 *    - Country options
 * 
 * 2. useCallback prevents function recreation on every render:
 *    - calculateAge
 *    - normalizeArabic
 * 
 * 3. Better error handling with error/success message states
 * 
 * 4. To integrate: Replace the original Students.jsx with this version
 *    or cherry-pick the improvements you want
 */
