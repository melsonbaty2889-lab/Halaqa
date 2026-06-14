import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
// استيراد قائمة الدول وقائمة أجزاء/أرباع القرآن (لأتمتة النصوص)
import { COUNTRIES_LIST } from '../constants/countries'; 
import QuranProgressBar from './QuranProgressBar'; 
import QuranProgressSelector from './QuranProgressSelector'; 
import { 
  FaUserPlus, FaSearch, FaGraduationCap, FaPhone, FaCheckCircle, 
  FaTimesCircle, FaBookOpen, FaUserShield, FaStickyNote, FaEdit, 
  FaTimes, FaSave, FaArchive, FaEye, FaEyeSlash,
  FaCalendarAlt, FaMoneyBillWave, FaStar
} from 'react-icons/fa';

// 💡 مصفوفة مرجعية سريعة لأسماء الأجزاء أو السور الكبرى لبناء النص التلقائي
const getQuarterText = (index) => {
  if (index === 0) return 'لم يبدأ بعد';
  const juzu = Math.floor((index - 1) / 8) + 1;
  const quarterInJuzu = ((index - 1) % 8) + 1;
  return `الجزء ${juzu} - الربع ${quarterInJuzu}`;
};

export default function Students({ students = [], setStudents, academyId }) {
  const { t } = useTranslation();
  
  // حقول إدارة حالة الواجهة والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  // حقول نموذج إضافة طالب جديد
  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0); 
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('male');
  const [birthDate, setBirthDate] = useState(''); 
  const [paymentPlan, setPaymentPlan] = useState('شهري'); 
  const [countryCode, setCountryCode] = useState('EG'); 
  const [isCustomCountry, setIsCustomCountry] = useState(false); 

  // حالة التعديل المؤقت للطالب
  const [editingStudent, setEditingStudent] = useState(null);

  // حالات التحميل والانتظار
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); 
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // حالة خاصة لعرض رسالة النجاح الموضعية داخل بطاقة الطالب نفسه بعد التعديل
  const [inlineMessage, setInlineMessage] = useState({ studentId: null, text: '', type: '' });

  // دالة حساب العمر تلقائياً
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

  // تصفية الحروف العربية لضمان دقة البحث
  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .trim()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  };

  // ➕ دالة إرسال البيانات وحفظ طالب جديد
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!academyId) {
      setMessage({ text: t('error_no_academy_id', 'خطأ: لم يتم تحديد معرف الأكاديمية.'), type: 'error' });
      return;
    }
    if (!name.trim()) {
      setMessage({ text: t('error_enter_student_name', 'يرجى إدخال اسم الطالب أولاً'), type: 'error' });
      return;
    }

    setIsAdding(true);
    setMessage({ text: '', type: '' });

    const autoSurahText = getQuarterText(currentQuarterIndex);

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          { 
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
          }
        ])
        .select();

      if (error) throw error;

      if (data && setStudents) {
        setStudents(prev => [data[0], ...prev]);
      }

      setMessage({ text: t('student_added_success', 'تم تسجيل الطالب بنجاح واحترافية! 🎉'), type: 'success' });
      
      setName('');
      setParentPhone('');
      setParentName('');
      setCurrentQuarterIndex(0); 
      setNotes('');
      setGender('male');
      setBirthDate('');
      setPaymentPlan('شهري');
      setCountryCode('EG');
      setIsCustomCountry(false);
      setShowAddForm(false);
    } catch (error) {
      console.error("🚨 خطأ أثناء إضافة الطالب:", error);
      setMessage({ text: `${t('student_added_failed', 'فشل التسجيل:')} ${error.message}`, type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  // 💾 دالة تحديث بيانات الطالب وحفظها (مع إظهار الرسالة بالأسفل موديولياً)
  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent.name.trim()) {
      alert(t('error_enter_student_name', 'اسم الطالب مطلوب'));
      return;
    }

    setUpdatingId(editingStudent.id);
    setInlineMessage({ studentId: null, text: '', type: '' });
    
    const autoSurahText = getQuarterText(editingStudent.current_quarter_index || 0);
    const updatedStudentData = { ...editingStudent, current_surah: autoSurahText };

    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: updatedStudentData.name.trim(),
          parent_phone: updatedStudentData.parent_phone?.trim() || null,
          parent_name: updatedStudentData.parent_name?.trim() || null,
          current_surah: updatedStudentData.current_surah, 
          notes: updatedStudentData.notes?.trim() || null,
          gender: updatedStudentData.gender,
          status: updatedStudentData.status,
          birth_date: updatedStudentData.birth_date || null,
          payment_plan: updatedStudentData.payment_plan,
          country_code: updatedStudentData.country_code || null, 
          last_test_score: updatedStudentData.last_test_score ? parseInt(updatedStudentData.last_test_score) : 0,
          level_score: updatedStudentData.level_score ? parseInt(updatedStudentData.level_score) : 0,
          current_quarter_index: updatedStudentData.current_quarter_index || 0 
        })
        .eq('id', updatedStudentData.id);

      if (error) throw error;

      setStudents(prev => prev.map(st => st.id === updatedStudentData.id ? updatedStudentData : st));
      
      // إظهار رسالة النجاح في الأسفل داخل نفس البطاقة قبل إغلاق النموذج
      setInlineMessage({
        studentId: updatedStudentData.id,
        text: t('student_updated_success', 'تم تحديث بيانات الطالب بنجاح! ✏️'),
        type: 'success'
      });

      // إغلاق نموذج التعديل تلقائياً بعد ثانيتين ليرى المستخدم رسالة النجاح بالأسفل
      setTimeout(() => {
        setEditingStudent(null);
        setInlineMessage({ studentId: null, text: '', type: '' });
      }, 1500);

    } catch (error) {
      console.error("🚨 خطأ في تحديث بيانات الطالب:", error);
      setInlineMessage({
        studentId: editingStudent.id,
        text: `${t('error_updating_student', 'تعذر تحديث البيانات:')} ${error.message}`,
        type: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // 🗄️ دالة التحكم في أرشفة الطالب واستعادته
  const handleToggleArchive = async (studentId, currentArchiveStatus) => {
    const confirmationMsg = currentArchiveStatus 
      ? t('confirm_unarchive', 'هل تريد إلغاء أرشفة هذا الطالب وإعادته للقائمة النشطة؟')
      : t('confirm_archive', 'هل أنت متأكد من أرشفة هذا الطالب؟ سيتم إخفاؤه من القائمة الرئيسية.');

    if (!window.confirm(confirmationMsg)) return;

    try {
      const { error } = await supabase
        .from('students')
        .update({ is_archived: !currentArchiveStatus })
        .eq('id', studentId);

      if (error) throw error;

      setStudents(prev => prev.map(st => st.id === studentId ? { ...st, is_archived: !currentArchiveStatus } : st));
      setMessage({ 
        text: currentArchiveStatus ? t('student_unarchived', 'تمت إعادة الطالب للقائمة بنجاح') : t('student_archived', 'تم نقل الطالب للأرشيف بنجاح'), 
        type: 'success' 
      });
    } catch (error) {
      console.error("🚨 خطأ في الأرشفة:", error);
      alert('حدث خطأ أثناء تغيير حالة الأرشفة');
    }
  };

  // تصفية الطلاب المبحوث عنهم
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
      
      {/* القسم العلوي: العناوين وأزرار التبديل الأصلية المتناسقة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: C.gold, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px' }}>
          <FaGraduationCap /> {showArchived ? t('archived_students_title', 'أرشيف الطلاب والموقوفين') : t('students_management_title', 'إدارة الطلاب والشؤون التعليمية')}
        </h2>
        
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
          <button
            type="button"
            onClick={() => { 
              setShowArchived(!showArchived); 
              setEditingStudent(null); 
              setShowAddForm(false); 
              setSearchTerm(''); 
              setMessage({ text: '', type: '' });
            }}
            style={{ background: '#1e293b', color: showArchived ? C.gold : '#fff', border: `1px solid ${C.border}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '14px', flex: 1, justifyContent: 'center' }}
          >
            {showArchived ? <FaEyeSlash /> : <FaArchive />}
            {showArchived ? t('show_active_students', 'عرض الطلاب النشطين') : t('show_archive', 'عرض الأرشيف')}
          </button>

          {!showArchived && (
            <button 
              type="button"
              onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
              style={{ background: showAddForm ? C.danger : C.gold, color: '#000', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', flex: 1, justifyContent: 'center' }}
            >
              <FaUserPlus /> {showAddForm ? t('cancel', 'إلغاء') : t('add_new_student', 'إضافة طالب جديد')}
            </button>
          )}
        </div>
      </div>

      {/* رسالة الحفظ العلوي مخصصة فقط لإضافة طالب جديد وليس للتعديل */}
      {message.text && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: message.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`, fontWeight: '500', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      {/* ➕ نموذج إضافة طالب */}
      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface, padding: '25px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: C.gold, margin: '0 0 10px 0', fontSize: '18px', borderBottom: `1px solid ${C.border}`, paddingBottom: '10px' }}>بيانات التسجيل التعليمية</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}>اسم الطالب الكامل *</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الطالب ثلاثياً"
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '140px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}>الجنس</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '140px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}><FaCalendarAlt size={12} /> تاريخ الميلاد</label>
              <input 
                type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '150px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}>الدولة وإقليم الطالب</label>
              <select 
                value={isCustomCountry ? 'OTHER' : countryCode} 
                onChange={(e) => {
                  if (e.target.value === 'OTHER') {
                    setIsCustomCountry(true);
                    setCountryCode('');
                  } else {
                    setIsCustomCountry(false);
                    setCountryCode(e.target.value);
                  }
                }} 
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
              >
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: '#0C1520' }}>
                    {c.flag} {c.name} ({c.dialCode})
                  </option>
                ))}
                <option value="OTHER" style={{ color: C.gold, background: '#0C1520' }}>🌐 دولة أخرى</option>
              </select>

              {isCustomCountry && (
                <input 
                  type="text" maxLength="3" value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())} 
                  placeholder="رمز الدولة الدولي (مثال: TR)" 
                  style={{ background: '#0C1520', border: `1px solid ${C.gold}`, color: '#fff', padding: '11px', borderRadius: '8px', marginTop: '5px', outline: 'none' }} 
                  required 
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: `1px dashed ${C.border}`, paddingTop: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}><FaUserShield size={12} /> اسم ولي الأمر</label>
              <input 
                type="text" value={parentName} onChange={(e) => setParentName(e.target.value)}
                placeholder="اسم والد الطالب أو المسؤول عنه"
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}><FaPhone size={12} /> رقم هاتف التواصل</label>
              <input 
                type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)}
                placeholder="01552518406"
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'left' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: `1px dashed ${C.border}`, paddingTop: '15px', alignItems: 'center' }}>
            <div style={{ flex: 2, minWidth: '280px' }}>
              <label style={{ color: C.gold, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                <FaBookOpen size={12} /> حدد الحفظ الحالي للطالب بدقة:
              </label>
              <QuranProgressSelector 
                initialIndex={currentQuarterIndex} 
                onIndexChange={(newIndex) => setCurrentQuarterIndex(newIndex)} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '180px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}><FaMoneyBillWave size={12} /> نظام الاشتراك الدفع</label>
              <select value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}>
                <option value="شهري">شهري</option>
                <option value="ربع سنوي">ربع سنوي</option>
                <option value="سنوي">سنوي</option>
                <option value="منحة/إعفاء">منحة/إعفاء</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}><FaStickyNote size={12} /> ملاحظات المعلم التوجيهية</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية بخصوص مستوى الحفظ والتلاوة..."
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', height: '70px', resize: 'none' }}
            />
          </div>

          <button type="submit" disabled={isAdding} style={{ background: C.gold, color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '5px' }}>
            {isAdding ? 'جاري الحفظ والإنشاء...' : 'تأكيد إضافة الطالب ومزامنة شريط التقدم'}
          </button>
        </form>
      )}

      {/* 🔍 شريط البحث الذكي */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surface, padding: '12px 15px', borderRadius: '8px', border: `1px solid ${C.border}`, marginBottom: '20px' }}>
        <FaSearch style={{ color: C.text, opacity: 0.5 }} />
        <input 
          type="text" placeholder={showArchived ? "ابحث في الأرشيف باسم الطالب أو الهاتف..." : "ابحث عن طالب بالاسم، الهاتف، أو الحفظ الحالي..."}
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '15px' }}
        />
      </div>

      {/* 📋 عرض بطاقات الطلاب */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredStudents.length === 0 ? (
          <p style={{ color: C.text, opacity: 0.6, textAlign: 'center', padding: '40px 20px', background: C.surface, borderRadius: '10px', border: `1px dashed ${C.border}` }}>
            لا توجد نتائج تطابق بحثك حالياً.
          </p>
        ) : (
          filteredStudents.map(student => {
            const isCurrentEditing = editingStudent?.id === student.id;
            const isLocalSaving = updatingId === student.id;
            const currentAge = calculateAge(student.birth_date);
            const matchedCountry = COUNTRIES_LIST.find(c => c.code === student.country_code);

            return (
              <div key={student.id} style={{ background: C.surface, padding: '20px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold}` : `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 📝 نموذج التعديل المدمج الاحترافي */}
                {isCurrentEditing ? (
                  <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <label style={{ color: C.gold, fontSize: '13px', marginBottom: '-5px', fontWeight: '500' }}>البيانات الأساسية:</label>
                    <input 
                      type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                      placeholder="اسم الطالب" style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px' }} required
                    />
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, minWidth: '100px' }}>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                      <input 
                        type="date" value={editingStudent.birth_date || ''} onChange={(e) => setEditingStudent({...editingStudent, birth_date: e.target.value})}
                        style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, minWidth: '120px' }}
                      />
                      <select value={editingStudent.country_code || ''} onChange={(e) => setEditingStudent({...editingStudent, country_code: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, minWidth: '130px' }}>
                        <option value="">-- بدون علم دولة --</option>
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <label style={{ color: C.gold, fontSize: '13px', marginBottom: '-5px', marginTop: '5px', fontWeight: '500' }}>بيانات التواصل والوالدين:</label>
                    <input 
                      type="text" value={editingStudent.parent_name || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_name: e.target.value})}
                      placeholder="اسم ولي الأمر" style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px' }}
                    />
                    <input 
                      type="tel" value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})}
                      placeholder="رقم هاتف التواصل" style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', textAlign: 'left' }}
                    />

                    <label style={{ color: C.gold, fontSize: '13px', marginBottom: '-5px', marginTop: '5px', fontWeight: '500' }}>المستوى التعليمي والدرجات والاشتراك:</label>
                    
                    <div style={{ background: '#0C1520', padding: '10px', borderRadius: '6px', border: `1px solid ${C.border}` }}>
                      <QuranProgressSelector 
                        initialIndex={editingStudent.current_quarter_index || 0} 
                        onIndexChange={(newIndex) => setEditingStudent({ ...editingStudent, current_quarter_index: newIndex })} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '11px', color: C.text, opacity: 0.7 }}>درجة آخر اختبار</span>
                        <input 
                          type="number" placeholder="0" value={editingStudent.last_test_score || ''} onChange={(e) => setEditingStudent({...editingStudent, last_test_score: e.target.value})}
                          style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '11px', color: C.text, opacity: 0.7 }}>درجة المستوى العام</span>
                        <input 
                          type="number" placeholder="0" value={editingStudent.level_score || ''} onChange={(e) => setEditingStudent({...editingStudent, level_score: e.target.value})}
                          style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <select value={editingStudent.payment_plan} onChange={(e) => setEditingStudent({...editingStudent, payment_plan: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', marginTop: '5px' }}>
                      <option value="شهري">شهري</option>
                      <option value="ربع سنوي">ربع سنوي</option>
                      <option value="سنوي">سنوي</option>
                      <option value="منحة/إعفاء">منحة/إعفاء</option>
                    </select>

                    <textarea 
                      value={editingStudent.notes || ''} onChange={(e) => setEditingStudent({...editingStudent, notes: e.target.value})}
                      placeholder="الملاحظات التوجيهية وتوصيات المعلم..." style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', height: '65px', resize: 'none' }}
                    />

                    {/* 🌟 هـنـا يـظـهـر صـندوق الرسالة الموضعية (inlineMessage) بالأسفل فوق أزرار الحفظ والإلغاء مباشرة للطالب نفسه */}
                    {inlineMessage.studentId === student.id && inlineMessage.text && (
                      <div style={{ padding: '10px', borderRadius: '6px', marginTop: '5px', backgroundColor: inlineMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: inlineMessage.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${inlineMessage.type === 'success' ? '#10B981' : '#EF4444'}`, fontWeight: '500', textAlign: 'center', fontSize: '13px' }}>
                        {inlineMessage.text}
                      </div>
                    )}

                    {/* 🔄 أزرار التحكم الخضراء والرمادية الممتلئة داخل نموذج التعديل */}
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
                  
                  // 👁️ وضع العرض الطبيعي للبطاقة
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>
                            {matchedCountry ? matchedCountry.flag : (student.country_code ? '🌐' : '')}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>
                            {student.name}
                          </span>
                          {currentAge !== null && (
                            <span style={{ fontSize: '13px', color: C.gold, background: 'rgba(212, 163, 89, 0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                              ({currentAge} سنة)
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: student.gender === 'female' ? '#EC4899' : '#3B82F6', color: '#fff', fontWeight: '500' }}>
                          {student.gender === 'female' ? 'أنثى' : 'ذكر'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: C.text, opacity: 0.85 }}>
                        {student.parent_phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaPhone size={12} style={{ opacity: 0.6 }} /> 
                            <span style={{ direction: 'ltr' }}>
                              {matchedCountry ? `(${matchedCountry.dialCode}) ` : ''}{student.parent_phone}
                            </span>
                          </span>
                        )}
                        {student.parent_name && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaUserShield size={13} style={{ color: C.gold }} /> ولي الأمر: {student.parent_name}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#A3E635' }}>
                          <FaMoneyBillWave size={12} /> الاشتراك: {student.payment_plan || 'شهري'} {matchedCountry && <span style={{color: '#94A3B8', fontSize: '12px'}}>| الإقليم: {matchedCountry.name}</span>}
                        </span>
                        {(student.last_test_score > 0 || student.level_score > 0) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#FBBF24', marginTop: '2px' }}>
                            <FaStar size={12} /> درجة الاختبار: {student.last_test_score || 0} | المستوى: {student.level_score || 0}
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '5px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '13px' }}>
                          <span style={{ color: C.gold, fontWeight: '500' }}>الورد الحالي: {student.current_surah || 'لم يحدد'}</span>
                          <span style={{ color: C.text, opacity: 0.6 }}>{Math.round(((student.current_quarter_index || 0) / 240) * 100)}%</span>
                        </div>
                        <QuranProgressBar currentIndex={student.current_quarter_index || 0} />
                      </div>

                      {student.notes && (
                        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', background: '#0F172A', padding: '8px 12px', borderRadius: '6px', borderRight: `3px solid ${C.gold}` }}>
                          {student.notes}
                        </p>
                      )}
                    </div>

                    {/* 🔄 الأزرار السفلية النصية الشفافة والذكية لليمين واليسار */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: '12px', marginTop: '5px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleArchive(student.id, student.is_archived)}
                        style={{ background: 'none', border: 'none', color: student.is_archived ? '#10B981' : C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500', padding: '4px 0' }}
                      >
                        <FaArchive size={12} /> {student.is_archived ? 'إلغاء الأرشفة' : 'نقل للأرشيف'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setEditingStudent({ ...student })}
                        style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500', padding: '4px 0' }}
                      >
                        <FaEdit size={12} /> تعديل البيانات بسرعة
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
