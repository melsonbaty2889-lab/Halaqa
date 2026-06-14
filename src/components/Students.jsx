import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { 
  FaUserPlus, FaSearch, FaGraduationCap, FaPhone, FaCheckCircle, 
  FaTimesCircle, FaBookOpen, FaUserShield, FaStickyNote, FaEdit, 
  FaTimes, FaSave, FaArchive, FaEye, FaEyeSlash, FaInbox
} from 'react-icons/fa';

export default function Students({ students = [], setStudents, academyId }) {
  const { t } = useTranslation();
  
  // الحالات المحلية لإدارة الواجهة والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false); // تبديل عرض المؤرشفين
  
  // حالات نموذج الإضافة
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [currentSurah, setCurrentSurah] = useState('');
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('male');

  // حالة التعديل الشامل للطالب
  const [editingStudent, setEditingStudent] = useState(null);

  // حالات التحميل والرسائل
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); 
  const [message, setMessage] = useState({ text: '', type: '' });

  // 📝 دالة توحيد الحروف العربية لجعل البحث فائق الذكاء والمرونة
  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .trim()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  };

  // ➕ دالة إضافة طالب جديد 
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

    setIsAdding(true);
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
            status: 'active',
            is_archived: false
          }
        ])
        .select();

      if (error) throw error;

      if (data && setStudents) {
        setStudents(prev => [data[0], ...prev]); // إضافة الطالب الجديد في بداية القائمة
      }

      setMessage({ text: t('student_added_success', 'تم تسجيل الطالب بنجاح واحترافية! 🎉'), type: 'success' });
      
      // إعادة تعيين الحقول بعد النجاح
      setNewStudentName('');
      setNewStudentPhone('');
      setParentName('');
      setCurrentSurah('');
      setNotes('');
      setGender('male');
      setShowAddForm(false);
    } catch (error) {
      console.error("🚨 خطأ أثناء إضافة الطالب:", error);
      setMessage({ text: `${t('student_added_failed', 'فشل التسجيل:')} ${error.message}`, type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  // 💾 دالة حفظ تعديلات الطالب الشاملة
  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent.name.trim()) {
      alert(t('error_enter_student_name', 'اسم الطالب مطلوب'));
      return;
    }

    setUpdatingId(editingStudent.id);
    setMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: editingStudent.name.trim(),
          parent_phone: editingStudent.parent_phone?.trim() || null,
          parent_name: editingStudent.parent_name?.trim() || null,
          current_surah: editingStudent.current_surah?.trim() || null,
          notes: editingStudent.notes?.trim() || null,
          gender: editingStudent.gender,
          status: editingStudent.status
        })
        .eq('id', editingStudent.id);

      if (error) throw error;

      setStudents(prev => prev.map(st => st.id === editingStudent.id ? editingStudent : st));
      setEditingStudent(null); 
      setMessage({ text: t('student_updated_success', 'تم تحديث بيانات الطالب بنجاح! ✏️'), type: 'success' });
    } catch (error) {
      console.error("🚨 خطأ في تحديث بيانات الطالب:", error);
      alert(`${t('error_updating_student', 'تعذر تحديث البيانات:')} ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 🗄️ دالة أرشفة أو استعادة الطالب
  const handleToggleArchive = async (studentId, currentArchiveStatus) => {
    const confirmationMsg = currentArchiveStatus 
      ? t('confirm_unarchive', 'هل تريد إلغاء أرشفة هذا الطالب وإعادته للقائمة النشطة؟')
      : t('confirm_archive', 'هل أنت متأكد من أرشفة هذا الطالب؟ سيتم إخفاؤه من القائمة الرئيسية.');

    if (!window.confirm(confirmationMsg)) return;

    setMessage({ text: '', type: '' });

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

  // 🔍 تصفية وفلترة الطلاب بناءً على نص البحث وحالة الأرشفة
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
      
      {/* القسم العلوي: العنوان وأزرار التحكم */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: C.gold, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px' }}>
          <FaGraduationCap /> {showArchived ? t('archived_students_title', 'أرشيف الطلاب والموقوفين') : t('students_management_title', 'إدارة الطلاب والشؤون التعليمية')}
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'space-between', smJustifyContent: 'flex-end', flexWrap: 'nowrap' }}>
          {/* زر تبديل عرض الأرشيف */}
          <button
            onClick={() => { 
              setShowArchived(!showArchived); 
              setEditingStudent(null); 
              setShowAddForm(false); 
              setSearchTerm(''); 
              setMessage({ text: '', type: '' }); // تصفير التنبيهات فوراً عند الانتقال
            }}
            style={{ background: 'rgba(255,255,255,0.05)', color: showArchived ? C.gold : C.text, border: `1px solid ${C.border}`, padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '14px', flex: 1, justifyContent: 'center' }}
          >
            {showArchived ? <FaEyeSlash /> : <FaArchive />}
            {showArchived ? t('show_active_students', 'عرض الطلاب النشطين') : t('show_archive', 'عرض الأرشيف')}
          </button>

          {/* زر إضافة طالب جديد (يختفي في شاشة الأرشيف) */}
          {!showArchived && (
            <button 
              onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); }}
              style={{ background: showAddForm ? C.danger : C.gold, color: '#000', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', flex: 1, justifyContent: 'center' }}
            >
              <FaUserPlus /> {showAddForm ? t('cancel', 'إلغاء') : t('add_new_student', 'إضافة طالب جديد')}
            </button>
          )}
        </div>
      </div>

      {/* لافتة التنبيهات والنجاح */}
      {message.text && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: message.type === 'success' ? '#10B981' : '#EF4444', border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`, fontWeight: '500', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      {/* ➕ نموذج إضافة طالب جديد */}
      {showAddForm && !showArchived && (
        <form onSubmit={handleAddStudent} style={{ background: C.surface, padding: '25px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: C.gold, margin: '0 0 10px 0', fontSize: '18px', borderBottom: `1px solid ${C.border}`, paddingBottom: '10px' }}>{t('registration_data_title', 'بيانات التسجيل الأساسية والقرآنية')}</h3>
          
          <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}>{t('student_name_label', 'اسم الطالب الثنائي أو الثلاثي *')}</label>
              <input 
                type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)}
                placeholder={t('student_name_placeholder', 'أدخل اسم الطالب الكامل')}
                style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '15px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: C.text, fontSize: '14px' }}>{t('gender_label', 'الجنس')}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '15px' }}>
                <option value="male">{t('male', 'ذكر')}</option>
                <option value="female">{t('female', 'أنثى')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}><FaBookOpen size={12} style={{color: C.gold}} /> {t('current_surah_label', 'السورة أو الجزء الحالي (الورد)')}</label>
            <input 
              type="text" value={currentSurah} onChange={(e) => setCurrentSurah(e.target.value)}
              placeholder={t('current_surah_placeholder', 'مثال: سورة البقرة / جزء عمّ')}
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}><FaUserShield size={12} /> {t('parent_name_label', 'اسم ولي الأمر (اختياري)')}</label>
            <input 
              type="text" value={parentName} onChange={(e) => setParentName(e.target.value)}
              placeholder={t('parent_name_placeholder', 'أدخل اسم الوالد أو ولي الأمر')}
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}><FaPhone size={12} /> {t('contact_phone_label', 'رقم هاتف التواصل')}</label>
            <input 
              type="tel" value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', textAlign: 'left', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: C.text, fontSize: '14px' }}><FaStickyNote size={12} /> {t('teacher_notes_label', 'ملاحظات المعلم التوجيهية')}</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notes_placeholder', 'اكتب أي ملاحظات تخص خطة حفظ الطالب أو حالته الحالية هنا...')}
              style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: '8px', outline: 'none', height: '80px', resize: 'none', fontSize: '14px' }}
            />
          </div>

          <button type="submit" disabled={isAdding} style={{ background: C.gold, color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '5px' }}>
            {isAdding ? t('saving_progress', 'جاري الحفظ...') : t('confirm_add_student', 'تأكيد إضافة الطالب في الحلقة')}
          </button>
        </form>
      )}

      {/* 🔍 شريط البحث الذكي */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surface, padding: '12px 15px', borderRadius: '8px', border: `1px solid ${C.border}`, marginBottom: '20px' }}>
        <FaSearch style={{ color: C.text, opacity: 0.5 }} />
        <input 
          type="text" placeholder={showArchived ? t('search_archive_placeholder', 'ابحث في الأرشيف باسم الطالب أو الهاتف...') : t('search_placeholder', 'ابحث عن طالب بالاسم، الهاتف، أو السورة الحالية...')}
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '15px' }}
        />
      </div>

      {/* 📋 عرض قائمة الطلاب ببطاقات تفاعلية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredStudents.length === 0 ? (
          <p style={{ color: C.text, opacity: 0.6, textAlign: 'center', padding: '40px 20px', background: C.surface, borderRadius: '10px', border: `1px dashed ${C.border}`, fontSize: '15px' }}>
            {showArchived ? t('no_archived_students', 'لا يوجد طلاب في الأرشيف حالياً.') : t('no_students_registered', 'لا يوجد طلاب مسجلين حالياً.')}
          </p>
        ) : (
          filteredStudents.map(student => {
            const isCurrentEditing = editingStudent?.id === student.id;
            const isLocalSaving = updatingId === student.id;

            return (
              <div key={student.id} style={{ background: C.surface, padding: '20px', borderRadius: '12px', border: isCurrentEditing ? `1px solid ${C.gold}` : `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                
                {/* 📝 نموذج التعديل النشط داخل البطاقة */}
                {isCurrentEditing ? (
                  <form onSubmit={handleUpdateStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                      <input 
                        type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                        style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', fontSize: '15px' }}
                        required
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, fontSize: '14px' }}>
                          <option value="male">{t('male', 'ذكر')}</option>
                          <option value="female">{t('female', 'أنثى')}</option>
                        </select>
                        <select value={editingStudent.status} onChange={(e) => setEditingStudent({...editingStudent, status: e.target.value})} style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, fontSize: '14px' }}>
                          <option value="active">{t('status_active', 'نشط')}</option>
                          <option value="inactive">{t('status_inactive', 'متوقف')}</option>
                        </select>
                      </div>
                    </div>

                    <input 
                      type="text" value={editingStudent.current_surah || ''} onChange={(e) => setEditingStudent({...editingStudent, current_surah: e.target.value})}
                      placeholder={t('current_surah_label', 'الحفظ الحالي')}
                      style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                    />

                    <input 
                      type="text" value={editingStudent.parent_name || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_name: e.target.value})}
                      placeholder={t('parent_name_label', 'اسم ولي الأمر')}
                      style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                    />

                    <input 
                      type="tel" value={editingStudent.parent_phone || ''} onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})}
                      placeholder={t('contact_phone_label', 'رقم الهاتف')}
                      style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', textAlign: 'left', fontSize: '14px' }}
                    />

                    <input 
                      type="text" value={editingStudent.notes || ''} onChange={(e) => setEditingStudent({...editingStudent, notes: e.target.value})}
                      placeholder={t('teacher_notes_label', 'ملاحظات المعلم التوجيهية')}
                      style={{ background: '#0C1520', border: `1px solid ${C.border}`, color: '#fff', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                    />

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '5px' }}>
                      <button type="button" onClick={() => setEditingStudent(null)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', flex: 1, justifyContent: 'center' }}>
                        <FaTimes /> {t('cancel', 'إلغاء')}
                      </button>
                      <button type="submit" disabled={isLocalSaving} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', flex: 1, justifyContent: 'center' }}>
                        <FaSave /> {isLocalSaving ? t('saving', 'جاري الحفظ...') : t('save', 'حفظ التغييرات')}
                      </button>
                    </div>
                  </form>
                ) : (
                  
                  // 👁️ وضع العرض الطبيعي المتجاوب للبطاقة
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      {/* السطر الأول: الاسم وشارة الجنس */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>{student.name}</span>
                        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: (student.gender === 'female' || student.gender === 'أنثى') ? '#EC4899' : '#3B82F6', color: '#fff', fontWeight: '500' }}>
                          {(student.gender === 'female' || student.gender === 'أنثى') ? t('female', 'أنثى') : t('male', 'ذكر')}
                        </span>
                      </div>

                      {/* السطر الثاني: الهاتف والوالد */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: C.text, opacity: 0.85 }}>
                        {student.parent_phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaPhone size={12} style={{ color: C.text, opacity: 0.6 }} /> <span style={{ direction: 'ltr' }}>{student.parent_phone}</span>
                          </span>
                        )}
                        {student.parent_name && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <FaUserShield size={13} style={{ color: C.gold }} /> {t('parent_prefix', 'ولي الأمر:')} {student.parent_name}
                          </span>
                        )}
                      </div>

                      {/* الملاحظات التوجيهية (تظهر فقط في حال وجودها) */}
                      {student.notes && (
                        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', background: '#0F172A', padding: '8px 12px', borderRadius: '6px', borderRight: `3px solid ${C.gold}` }}>
                          📝 {student.notes}
                        </p>
                      )}
                    </div>

                    {/* القسم السفلي للبطاقة: شارات الحفظ والحالة + أزرار التفاعل المباشر */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: '12px' }}>
                      
                      {/* الشارات الملونة */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 163, 89, 0.1)', color: C.gold, padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>
                          <FaBookOpen size={13} />
                          <span>{t('memorization_prefix', 'الحفظ:')} {student.current_surah || t('not_specified_yet', 'لم يحدد بعد')}</span>
                        </div>

                        {student.is_archived && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                            <FaInbox size={12} /> {t('archived_badge', 'مؤرشف')}
                          </span>
                        )}

                        {student.status === 'active' || student.status === 'نشط' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                            <FaCheckCircle size={12} /> {t('status_active', 'نشط')}
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                            <FaTimesCircle size={12} /> {t('status_inactive', 'متوقف')}
                          </span>
                        )}
                      </div>

                      {/* أزرار العمليات (تعديل - أرشفة/استعادة) متناسقة تماماً مع الصور */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {/* زر التعديل الشامل */}
                        <button 
                          onClick={() => { setEditingStudent({ ...student }); setShowAddForm(false); }}
                          style={{ background: 'transparent', color: C.gold, border: `1px solid ${C.gold}40`, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', flex: 1, justifyContent: 'center', transition: '0.2s' }}
                        >
                          <FaEdit size={13} /> {t('edit', 'تعديل')}
                        </button>

                        {/* زر الأرشفة أو الاستعادة الذكي */}
                        <button
                          onClick={() => handleToggleArchive(student.id, student.is_archived)}
                          style={{ 
                            background: 'transparent', 
                            color: student.is_archived ? '#10B981' : C.danger, 
                            border: `1px solid ${student.is_archived ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontSize: '13px',
                            fontWeight: '500',
                            flex: 1,
                            justifyContent: 'center',
                            transition: '0.2s'
                          }}
                        >
                          {student.is_archived ? <FaEye size={13} /> : <FaArchive size={13} />}
                          <span>{student.is_archived ? t('restore', 'استعادة') : t('archive', 'أرشفة')}</span>
                        </button>
                      </div>

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
