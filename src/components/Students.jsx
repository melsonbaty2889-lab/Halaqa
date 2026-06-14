import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaSearch, FaGraduationCap, FaPhone, FaCheckCircle, FaTimesCircle, FaBookOpen, FaUserShield, FaStickyNote, FaEdit, FaCheck } from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  const { t } = useTranslation();
  
  // الحالات المحلية لإدارة الواجهة والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // حالات نموذج الإضافة المطور المتوافق مع قاعدة بياناتك
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [currentSurah, setCurrentSurah] = useState('');
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('ذكر');

  // حالات تعديل السورة الحالية مباشرة من البطاقة
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [updatingSurahText, setUpdatingSurahText] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 📝 دالة إضافة طالب جديد 
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!academyId) {
      setMessage({ text: t('error_no_academy_id', 'خطأ: لم يتم تحديد معرف الأكاديمية.'), type: 'error' });
      return;
    }
    if (!newStudentName.trim()) {
      setMessage({ text: t('error_enter_student_name', 'يرجى إدخال اسم الطالب أولاً'), type: 'error' });
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
            parent_phone: newStudentPhone.trim() || null,
            parent_name: parentName.trim() || null,       
            current_surah: currentSurah.trim() || null,   
            notes: notes.trim() || null,                 
            gender: gender,                               
            academy_id: academyId,
            status: 'active' 
          }
        ])
        .select();

      if (error) throw error;

      if (data && setStudents) {
        setStudents(prev => [...prev, data[0]]);
      }

      setMessage({ text: t('student_added_success', 'تم تسجيل الطالب بنجاح واحترافية! 🎉'), type: 'success' });
      
      // تفريغ الحقول بعد النجاح
      setNewStudentName('');
      setNewStudentPhone('');
      setParentName('');
      setCurrentSurah('');
      setNotes('');
      setShowAddForm(false);
    } catch (error) {
      console.error("🚨 خطأ أثناء إضافة الطالب:", error);
      setMessage({ text: `${t('student_added_failed', 'فشل التسجيل:')} ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // 🔄 دالة التحديث السريع للسورة الحالية للطالب
  const handleUpdateSurah = async (studentId) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ current_surah: updatingSurahText.trim() || null })
        .eq('id', studentId);

      if (error) throw error;

      setStudents(prev => prev.map(st => st.id === studentId ? { ...st, current_surah: updatingSurahText } : st));
      setEditingStudentId(null);
    } catch (error) {
      console.error("خطأ في تحديث السورة:", error);
      alert(t('error_updating_surah', 'تعذر تحديث السورة الحالية'));
    }
  };

  // 🔍 تصفية الطلاب بناءً على نص البحث
  const filteredStudents = Array.isArray(students) 
    ? students.filter(student => 
        student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.parent_phone?.includes(searchTerm) ||
        student?.current_surah?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div style={{ direction: 'inherit' }}>
      
      {/* القسم العلوي: العنوان وزر الإضافة المترجمين */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: C.gold, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaGraduationCap /> {t('students_management_title', 'إدارة الطلاب والشؤون التعليمية')}
        </h2>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ background: showAddForm ? C.danger : C.gold, color: '#000', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <FaUserPlus /> {showAddForm ? t('cancel', 'إلغاء') : t('add_new_student', 'إضافة طالب جديد')}
        </button>
      </div>

      {message.text && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}` }}>
          {message.text}
        </div>
      )}

      {/* ➕ نموذج إضافة طالب جديد المتكامل والمترجم بالكامل */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface, padding: '25px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: C.gold, margin: '0 0 10px 0', fontSize: '18px' }}>
            {t('registration_data_title', 'بيانات التسجيل الأساسية والقرآنية')}
          </h3>
          
          {/* حقل الاسم والجنس */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 2, minWidth: '200px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}>{t('student_name_label', 'اسم الطالب الثنائي أو الثلاثي *')}</label>
              <input 
                type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)}
                placeholder={t('student_name_placeholder', 'أدخل اسم الطالب الكامل')}
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '100px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}>{t('gender_label', 'الجنس')}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}>
                <option value="ذكر">{t('male', 'ذكر')}</option>
                <option value="أنثى">{t('female', 'أنثى')}</option>
              </select>
            </div>
          </div>

          {/* حقل السورة الحالية وولي الأمر */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}><FaBookOpen size={12} style={{color: C.gold}} /> {t('current_surah_label', 'السورة أو الجزء الحالي (الورد)')}</label>
              <input 
                type="text" value={currentSurah} onChange={(e) => setCurrentSurah(e.target.value)}
                placeholder={t('current_surah_placeholder', 'مثال: سورة البقرة / جزء عمّ')}
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}><FaUserShield size={12} /> {t('parent_name_label', 'اسم ولي الأمر (اختياري)')}</label>
              <input 
                type="text" value={parentName} onChange={(e) => setParentName(e.target.value)}
                placeholder={t('parent_name_placeholder', 'أدخل اسم الوالد أو ولي الأمر')}
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none' }}
              />
            </div>
          </div>

          {/* رقم الهاتف */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}><FaPhone size={12} /> {t('contact_phone_label', 'رقم هاتف التواصل')}</label>
            <input 
              type="tel" value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)}
              placeholder={t('phone_placeholder', 'مثال: 05xxxxxxxx')}
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'left' }}
            />
          </div>

          {/* ملاحظات المعلم */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}><FaStickyNote size={12} /> {t('teacher_notes_label', 'ملاحظات المعلم التوجيهية')}</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notes_placeholder', 'اكتب أي ملاحظات تخص خطة حفظ الطالب أو حالته الحالية هنا...')}
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', height: '70px', resize: 'none' }}
            />
          </div>

          <button 
            type="submit" disabled={isSaving}
            style={{ background: C.gold, color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, transition: '0.2s', marginTop: '10px' }}
          >
            {isSaving ? t('saving_progress', 'جاري الحفظ والتسجيل...') : t('confirm_add_student', 'تأكيد إضافة الطالب في الحلقة')}
          </button>
        </form>
      )}

      {/* 🔍 شريط البحث الذكي */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surface, padding: '10px 15px', borderRadius: '8px', border: `1px solid ${C.border}`, marginBottom: '20px' }}>
        <FaSearch style={{ color: C.text, opacity: 0.5 }} />
        <input 
          type="text"
          placeholder={t('search_placeholder', 'ابحث عن طالب بالاسم، الهاتف، أو السورة الحالية...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '15px' }}
        />
      </div>

      {/* 📋 عرض قائمة الطلاب ببطاقات تفاعلية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredStudents.length === 0 ? (
          <p style={{ color: C.text, opacity: 0.6, textAlign: 'center', padding: '20px' }}>
            {searchTerm ? t('no_search_results', 'لم يتم العثور على نتائج تطابق بحثك.') : t('no_students_registered', 'لا يوجد طلاب مسجلين حالياً.')}
          </p>
        ) : (
          filteredStudents.map(student => (
            <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, padding: '18px 20px', borderRadius: '10px', border: `1px solid ${C.border}`, flexWrap: 'wrap', gap: '15px' }}>
              
              {/* تفاصيل الطالب */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '17px', color: '#fff' }}>{student.name}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: student.gender === 'أنثى' ? '#EC4899' : '#3B82F6', color: '#fff' }}>
                    {student.gender === 'أنثى' ? t('female', 'أنثى') : t('male', 'ذكر')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '13px', color: C.text, opacity: 0.8 }}>
                  {student.parent_phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaPhone size={11} /> {student.parent_phone}
                    </span>
                  )}
                  {student.parent_name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaUserShield size={12} style={{ color: C.gold }} /> {t('parent_prefix', 'ولي الأمر:')} {student.parent_name}
                    </span>
                  )}
                </div>

                {student.notes && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', background: '#0F172A', padding: '5px 10px', borderRadius: '6px', width: 'fit-content' }}>
                    📝 {student.notes}
                  </p>
                )}
              </div>

              {/* 📖 قسم التتبع المباشر للسورة الحالية */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {editingStudentId === student.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input 
                      type="text" value={updatingSurahText} onChange={(e) => setUpdatingSurahText(e.target.value)}
                      style={{ background: '#0C1520', border: `1px solid ${C.gold}`, color: '#fff', padding: '6px 10px', borderRadius: '6px', width: '130px', fontSize: '13px' }}
                    />
                    <button onClick={() => handleUpdateSurah(student.id)} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                      <FaCheck size={12} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => { setEditingStudentId(student.id); setUpdatingSurahText(student.current_surah || ''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 163, 89, 0.1)', color: C.gold, padding: '6px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: '1px dashed rgba(212, 163, 89, 0.3)' }}
                    title={t('click_to_update_surah', 'اضغط للتحديث السريع للسورة')}
                  >
                    <FaBookOpen size={13} />
                    <span>{t('memorization_prefix', 'الحفظ:')} {student.current_surah || t('not_specified_yet', 'لم يحدد بعد')}</span>
                    <FaEdit size={11} style={{ opacity: 0.6 }} />
                  </div>
                )}

                {/* شارة حالة الطالب */}
                <div>
                  {student.status === 'active' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                      <FaCheckCircle size={12} /> {t('status_active', 'نشط')}
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                      <FaTimesCircle size={12} /> {t('status_inactive', 'متوقف')}
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
