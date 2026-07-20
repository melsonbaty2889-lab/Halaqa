import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, Badge, Btn, TH, TD } from './UI';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '../constants/countries';

// دالة حساب التاريخ المزدوج المستقلة
const getDualDateString = (lang, isRtl) => {
  const today = new Date();
  const gregOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const gregPart = today.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', gregOptions);
  
  try {
    const hijriOptions = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
    let hijriPart = today.toLocaleDateString(
      lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', 
      hijriOptions
    );
    hijriPart = hijriPart.replace(/\bBC\b/g, 'AH').replace(/\bقبل الميلاد\b/g, 'هـ');
    return isRtl ? `${gregPart} مـ | 🗓️ هجري: ${hijriPart}` : `${gregPart} AD | 🗓️ Hijri: ${hijriPart}`;
  } catch (e) {
    return gregPart;
  }
};

// =========================================================================
// 1. المكون الرئيسي الموحد (Orchestrator Component)
// =========================================================================
export default function StudentsAndTeachers({ academyId, refreshTrigger, halaqas = [] }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const dualDateString = useMemo(() => getDualDateString(currentLang, isRtl), [currentLang, isRtl]);
  const [mainTab, setMainTab] = useState('students');
  const [errorMessage, setErrorMessage] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const trans = (key, fallbackAr, fallbackEn) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? fallbackAr : fallbackEn;
  };

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", paddingBottom: '40px' }}>
      
      {/* رأس الصفحة */}
      <div style={{ marginBottom: '20px', textAlign: isRtl ? 'right' : 'left' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: C.gold, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          {trans('mainModuleTitle', 'إدارة شؤون الأكاديمية العظمى', 'Academy Corporate Management')} 🎓
        </h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>
          {dualDateString}
        </p>
      </div>

      {/* شريط الإشعارات والتحذيرات الاحترافي */}
      {errorMessage && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginRight: 'auto', marginLeft: isRtl ? '0' : 'auto' }}>✖</button>
        </div>
      )}

      {/* التبويبات العلوية */}
      <div style={{ display: 'flex', background: '#162030', padding: '6px', borderRadius: '14px', marginBottom: '24px', gap: '6px' }}>
        <button
          onClick={() => { setMainTab('students'); setErrorMessage(''); }}
          style={{
            flex: 1, padding: '12px 8px', borderRadius: '10px', border: 'none',
            background: mainTab === 'students' ? C.gold : 'transparent',
            color: mainTab === 'students' ? '#0f172a' : '#94a3b8',
            fontWeight: '800', fontSize: isMobile ? '13px' : '15px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          👨‍🎓 {trans('tabStudentsLabel', 'شؤون الطلاب', 'Students Division')}
        </button>
        <button
          onClick={() => { setMainTab('teachers'); setErrorMessage(''); }}
          style={{
            flex: 1, padding: '12px 8px', borderRadius: '10px', border: 'none',
            background: mainTab === 'teachers' ? C.gold : 'transparent',
            color: mainTab === 'teachers' ? '#0f172a' : '#94a3b8',
            fontWeight: '800', fontSize: isMobile ? '13px' : '15px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          🕌 {trans('tabTeachersLabel', 'هيئة المحفظين والمعلمين', 'Teachers & Faculty')}
        </button>
      </div>

      {/* استدعاء المكونات الفرعية بناءً على التبويب النشط */}
      {mainTab === 'students' ? (
        <StudentsSection 
          academyId={academyId} 
          refreshTrigger={refreshTrigger} 
          halaqas={halaqas} 
          isMobile={isMobile} 
          isRtl={isRtl} 
          trans={trans}
          setExternalError={setErrorMessage}
          currentLang={currentLang}
        />
      ) : (
        <TeachersSection 
          academyId={academyId} 
          refreshTrigger={refreshTrigger} 
          isMobile={isMobile} 
          isRtl={isRtl} 
          trans={trans}
          setExternalError={setErrorMessage}
          currentLang={currentLang}
        />
      )}
    </div>
  );
}

// =========================================================================
// 2. مكون إدارة الطلاب الفرعي (Students Section Component)
// =========================================================================
function StudentsSection({ academyId, refreshTrigger, halaqas, isMobile, isRtl, trans, setExternalError, currentLang }) {
  const [studentViewMode, setStudentViewMode] = useState('active');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: '', gender: 'male', parent_name: '', country_code: 'EG',
    parent_phone: '', subscription_type: 'monthly', juz_start: '1', quarter_start: '1', notes: '', halaqa_id: ''
  });

  useEffect(() => {
    const fetchStudents = async () => {
      if (!academyId) return;
      setStudentLoading(true);
      setExternalError('');
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('academy_id', academyId)
        .eq('is_archived', studentViewMode === 'archive')
        .order('created_at', { ascending: false });

      if (error) {
        setExternalError(trans('fetchError', 'حدث خطأ أثناء جلب البيانات من السيرفر', 'Error fetching data'));
      } else if (data) {
        setStudentsList(data);
      }
      setStudentLoading(false);
    };
    fetchStudents();
  }, [academyId, studentViewMode, refreshTrigger]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setExternalError('');
    if (!studentFormData.name.trim() || !studentFormData.parent_phone.trim()) {
      return setExternalError(trans('requiredFieldsAlert', 'الرجاء ملء الحقول الإلزامية (*)', 'Fill required fields (*)'));
    }
    
    const selectedCountry = COUNTRIES_LIST.find(c => c.code === studentFormData.country_code);
    const cleanPhone = studentFormData.parent_phone.trim().replace(/^0+/, '').replace(/\D/g, '');
    const fullPhone = `${selectedCountry?.dialCode || ''}${cleanPhone}`;

    const payload = {
      academy_id: academyId,
      name: studentFormData.name.trim(),
      gender: studentFormData.gender,
      parent_name: studentFormData.parent_name.trim(),
      country: studentFormData.country_code,
      parent_phone: fullPhone,
      subscription_system: studentFormData.subscription_type,
      current_juz: parseInt(studentFormData.juz_start),
      current_quarter: parseInt(studentFormData.quarter_start),
      notes: studentFormData.notes.trim(),
      halaqa_id: studentFormData.halaqa_id || null,
      is_archived: false
    };

    const { data, error } = await supabase.from('students').insert(payload).select();
    if (error) {
      setExternalError(trans('saveError', 'فشل في حفظ البيانات، يرجى المحاولة لاحقاً', 'Failed to save data'));
    } else if (data) {
      setStudentsList(prev => [data[0], ...prev]);
      setShowStudentForm(false);
      setStudentFormData({
        name: '', gender: 'male', parent_name: '', country_code: 'EG',
        parent_phone: '', subscription_type: 'monthly', juz_start: '1', quarter_start: '1', notes: '', halaqa_id: ''
      });
    }
  };

  const toggleArchiveStudent = async (id, currentStatus) => {
    setExternalError('');
    const { error } = await supabase.from('students').update({ is_archived: !currentStatus }).eq('id', id);
    if (error) {
      setExternalError(trans('archiveError', 'فشلت عملية نقل السجل لإجراء الأرشفة', 'Failed to change archive status'));
    } else {
      setStudentsList(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredStudents = studentsList.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.parent_phone && s.parent_phone.includes(studentSearch))
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
        <button onClick={() => setShowStudentForm(!showStudentForm)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: showStudentForm ? '#1e293b' : C.gold, color: showStudentForm ? '#fff' : '#0f172a', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
          {showStudentForm ? trans('closeForm', 'إغلاق الاستمارة ✖', 'Close Form ✖') : `➕ ${trans('addNewStudent', 'إضافة طالب جديد للمنظومة', 'Add New Student')}`}
        </button>
        <button onClick={() => setStudentViewMode(studentViewMode === 'active' ? 'archive' : 'active')} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${studentViewMode === 'active' ? '#ef4444' : C.gold}`, background: studentViewMode === 'active' ? 'transparent' : '#ef4444', color: studentViewMode === 'active' ? '#ef4444' : '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
          📦 {studentViewMode === 'active' ? trans('viewArchive', 'عرض أرشيف الطلاب', 'View Students Archive') : trans('viewActive', 'عرض الطلاب النشطين', 'View Active Students')}
        </button>
      </div>

      {showStudentForm && (
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblFullName', 'اسم الطالب بالكامل', 'Student Full Name')}</label>
              <input type="text" value={studentFormData.name} onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: C.gold, fontSize: '14px', fontWeight: '700' }}>{trans('lblStudentHalaqa', 'تنسيب وتعيين الحلقة القرآنية', 'Assign Quranic Halaqa')}</label>
              <select value={studentFormData.halaqa_id} onChange={(e) => setStudentFormData({...studentFormData, halaqa_id: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}>
                <option value="">{trans('unassignedHalaqaOption', '🚫 بدون حلقة حالياً', 'No Halaqa')}</option>
                {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '14px' }}>{trans('lblGender', 'الجنس', 'Gender')}</label>
                <select value={studentFormData.gender} onChange={(e) => setStudentFormData({...studentFormData, gender: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}>
                  <option value="male">{trans('genMale', 'ذكر 🧑', 'Male 🧑')}</option>
                  <option value="female">{trans('genFemale', 'أنثى 👧', 'Female 👧')}</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '14px' }}>{trans('lblParentName', 'اسم ولي الأمر', 'Parent Name')}</label>
                <input type="text" value={studentFormData.parent_name} onChange={(e) => setStudentFormData({...studentFormData, parent_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }} />
              </div>
            </div>

            <div>
              <label style={{ color: '#fff', fontSize: '14px' }}>*{trans('lblPhone', 'رقم الهاتف وتحديد الدولة', 'Country & Contact')}</label>
              <div style={{ display: 'flex', gap: '10px', direction: 'ltr' }}>
                <select value={studentFormData.country_code} onChange={(e) => setStudentFormData({...studentFormData, country_code: e.target.value})} style={{ width: '130px', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}>
                  {COUNTRIES_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dialCode} ({currentLang === 'ar' ? c.nameAr : c.nameEn})</option>)}
                </select>
                <input type="tel" value={studentFormData.parent_phone} onChange={(e) => setStudentFormData({...studentFormData, parent_phone: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', textAlign: 'left' }} />
              </div>
            </div>

            <button type="submit" style={{ padding: '14px', borderRadius: '10px', border: 'none', background: C.gold, color: '#0f172a', fontWeight: '700', cursor: 'pointer' }}>
              {trans('btnConfirmAdd', 'تأكيد وحفظ بيانات الطالب 🚀', 'Save Student 🚀')}
            </button>
          </form>
        </Card>
      )}

      <div style={{ marginBottom: '16px' }}>
        <input type="text" placeholder={trans('phSearchStudent', 'ابحث باسم الطالب...', 'Search student...')} value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#162030', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} />
      </div>

      <Card style={{ padding: 0, background: 'transparent' }}>
        {studentLoading ? <p style={{ color: C.muted, textAlign: 'center' }}>...</p> : filteredStudents.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', background: '#162030', borderRadius: '12px', border: '1px dashed #334155' }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>{trans('noStudentsFound', 'لم يتم العثور على طلاب', 'No students found')}</p>
          </div>
        ) : !isMobile ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #334155' }}>
                <TH>{trans('thStudentName', 'الاسم / الحلقة', 'Name / Halaqa')}</TH>
                <TH>{trans('thGender', 'الجنس', 'Gender')}</TH>
                <TH>{trans('thParentContact', 'ولي الأمر', 'Guardian')}</TH>
                <TH>{trans('thSubscription', 'الاشتراك', 'Subscription')}</TH>
                <TH>{trans('thActions', 'الإجراءات', 'Actions')}</TH>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const matchedHalaqa = halaqas.find(h => h.id === student.halaqa_id);
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <TD>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{student.name}</div>
                      <div style={{ fontSize: '11px', color: C.gold, marginTop: '2px' }}>
                        📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassignedHalaqaText', 'غير مدرج بحلقة', 'Unassigned')}
                      </div>
                    </TD>
                    <TD><Badge color={student.gender === 'male' ? 'blue' : 'pink'}>{student.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge></TD>
                    <TD>
                      <div>{student.parent_name || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', direction: 'ltr' }}>{student.parent_phone}</div>
                    </TD>
                    <TD><Badge color="orange">{student.subscription_system}</Badge></TD>
                    <TD><Btn onClick={() => toggleArchiveStudent(student.id, student.is_archived)} color={student.is_archived ? 'green' : 'red'}>{student.is_archived ? 'تنشيط ⚡' : 'أرشفة 📦'}</Btn></TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredStudents.map(student => (
              <Card key={student.id} style={{ padding: '16px', background: '#162030', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{student.name}</span>
                  <Badge color={student.gender === 'male' ? 'blue' : 'pink'}>{student.gender === 'male' ? '🧑' : '👧'}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge color="orange">{student.subscription_system}</Badge>
                  <Btn onClick={() => toggleArchiveStudent(student.id, student.is_archived)} color={student.is_archived ? 'green' : 'red'}>{student.is_archived ? '⚡' : '📦'}</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// =========================================================================
// 3. مكون إدارة المعلمين الفرعي (Teachers Section Component)
// =========================================================================
function TeachersSection({ academyId, refreshTrigger, isMobile, isRtl, trans, setExternalError, currentLang }) {
  const [teacherViewMode, setTeacherViewMode] = useState('active');
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '', gender: 'male', country_code: 'EG', phone: '', salary_type: 'monthly', notes: ''
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!academyId) return;
      setTeacherLoading(true);
      setExternalError('');
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('academy_id', academyId)
        .eq('is_archived', teacherViewMode === 'archive')
        .order('created_at', { ascending: false });

      if (error) {
        setExternalError(trans('fetchError', 'حدث خطأ أثناء جلب البيانات', 'Error fetching data'));
      } else if (data) {
        setTeachersList(data);
      }
      setTeacherLoading(false);
    };
    fetchTeachers();
  }, [academyId, teacherViewMode, refreshTrigger]);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setExternalError('');
    if (!teacherFormData.name.trim() || !teacherFormData.phone.trim()) {
      return setExternalError(trans('requiredFieldsAlert', 'الرجاء ملء الحقول الإلزامية (*)', 'Fill required fields (*)'));
    }
    
    const selectedCountry = COUNTRIES_LIST.find(c => c.code === teacherFormData.country_code);
    const cleanPhone = teacherFormData.phone.trim().replace(/^0+/, '').replace(/\D/g, '');
    const fullPhone = `${selectedCountry?.dialCode || ''}${cleanPhone}`;

    const payload = {
      academy_id: academyId,
      name: teacherFormData.name.trim(),
      gender: teacherFormData.gender,
      country: teacherFormData.country_code,
      phone: fullPhone,
      salary_system: teacherFormData.salary_type,
      notes: teacherFormData.notes.trim(),
      is_archived: false
    };

    const { data, error } = await supabase.from('teachers').insert(payload).select();
    if (error) {
      setExternalError(trans('saveError', 'فشل في حفظ البيانات', 'Failed to save data'));
    } else if (data) {
      setTeachersList(prev => [data[0], ...prev]);
      setShowTeacherForm(false);
      setTeacherFormData({ name: '', gender: 'male', country_code: 'EG', phone: '', salary_type: 'monthly', notes: '' });
    }
  };

  const toggleArchiveTeacher = async (id, currentStatus) => {
    setExternalError('');
    const { error } = await supabase.from('teachers').update({ is_archived: !currentStatus }).eq('id', id);
    if (error) {
      setExternalError(trans('archiveError', 'فشلت أرشفة السجل', 'Failed to archive record'));
    } else {
      setTeachersList(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTeachers = teachersList.filter(t =>
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || (t.phone && t.phone.includes(teacherSearch))
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
        <button onClick={() => setShowTeacherForm(!showTeacherForm)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: showTeacherForm ? '#1e293b' : C.gold, color: showTeacherForm ? '#fff' : '#0f172a', fontWeight: '700', fontSize: '14px' }}>
          {showTeacherForm ? trans('closeForm', 'إغلاق الاستمارة ✖', 'Close Form ✖') : `➕ ${trans('addNewTeacher', 'إضافة معلم/محفظ جديد', 'Add New Teacher')}`}
        </button>
        <button onClick={() => setTeacherViewMode(teacherViewMode === 'active' ? 'archive' : 'active')} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${teacherViewMode === 'active' ? '#ef4444' : C.gold}`, background: teacherViewMode === 'active' ? 'transparent' : '#ef4444', color: teacherViewMode === 'active' ? '#ef4444' : '#fff', fontWeight: '700', fontSize: '14px' }}>
          📦 {teacherViewMode === 'active' ? trans('viewTeacherArchive', 'عرض أرشيف المعلمين', 'View Teachers Archive') : trans('viewTeacherActive', 'عرض المعلمين النشطين', 'View Active Teachers')}
        </button>
      </div>

      {showTeacherForm && (
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: '#fff', fontSize: '14px' }}>*{trans('lblTeacherName', 'اسم المعلم بالكامل', 'Teacher Full Name')}</label>
              <input type="text" value={teacherFormData.name} onChange={(e) => setTeacherFormData({...teacherFormData, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '14px' }}>{trans('lblGender', 'الجنس', 'Gender')}</label>
                <select value={teacherFormData.gender} onChange={(e) => setTeacherFormData({...teacherFormData, gender: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}>
                  <option value="male">ذكر 🧑</option>
                  <option value="female">أنثى 👧</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '14px' }}>{trans('lblSalarySystem', 'نظام المرتب', 'Salary System')}</label>
                <select value={teacherFormData.salary_type} onChange={(e) => setTeacherFormData({...teacherFormData, salary_type: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}>
                  <option value="monthly">راتب شهري ثابت</option>
                  <option value="per_hour">بالحصة/الساعة</option>
                  <option value="volunteer">عمل تطوعي</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ color: '#fff', fontSize: '14px' }}>*{trans('lblTeacherPhone', 'رقم الاتصال', 'Contact')}</label>
              <div style={{ display: 'flex', gap: '10px', direction: 'ltr' }}>
                <select value={teacherFormData.country_code} onChange={(e) => setTeacherFormData({...teacherFormData, country_code: e.target.value})} style={{ width: '130px', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}>
                  {COUNTRIES_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dialCode} ({currentLang === 'ar' ? c.nameAr : c.nameEn})</option>)}
                </select>
                <input type="tel" value={teacherFormData.phone} onChange={(e) => setTeacherFormData({...teacherFormData, phone: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', textAlign: 'left' }} />
              </div>
            </div>

            <button type="submit" style={{ padding: '14px', borderRadius: '10px', border: 'none', background: C.gold, color: '#0f172a', fontWeight: '700' }}>
              {trans('btnConfirmAddTeacher', 'حفظ المعلم الجديد 🚀', 'Save Teacher 🚀')}
            </button>
          </form>
        </Card>
      )}

      <div style={{ marginBottom: '16px' }}>
        <input type="text" placeholder={trans('phSearchTeacher', 'ابحث باسم المعلم...', 'Search teacher...')} value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#162030', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} />
      </div>

      <Card style={{ padding: 0, background: 'transparent' }}>
        {teacherLoading ? <p style={{ color: C.muted, textAlign: 'center' }}>...</p> : filteredTeachers.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', background: '#162030', borderRadius: '12px', border: '1px dashed #334155' }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>{trans('noTeachersFound', 'لم يتم العثور على معلمين', 'No teachers found')}</p>
          </div>
        ) : !isMobile ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #334155' }}>
                <TH>{trans('thTeacherName', 'اسم المعلم', 'Teacher Name')}</TH>
                <TH>{trans('thGender', 'الجنس', 'Gender')}</TH>
                <TH>{trans('thTeacherPhone', 'رقم الاتصال', 'Phone')}</TH>
                <TH>{trans('thSalarySystem', 'النظام المالي', 'Salary System')}</TH>
                <TH>{trans('thActions', 'الإجراءات', 'Actions')}</TH>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <TD style={{ fontWeight: '700', color: '#fff' }}>{teacher.name}</TD>
                  <TD><Badge color={teacher.gender === 'male' ? 'blue' : 'pink'}>{teacher.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge></TD>
                  <TD style={{ direction: 'ltr' }}>{teacher.phone}</TD>
                  <TD><Badge color="orange">{teacher.salary_system}</Badge></TD>
                  <TD><Btn onClick={() => toggleArchiveTeacher(teacher.id, teacher.is_archived)} color={teacher.is_archived ? 'green' : 'red'}>{teacher.is_archived ? 'تنشيط ⚡' : 'أرشفة 📦'}</Btn></TD>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTeachers.map(teacher => (
              <Card key={teacher.id} style={{ padding: '16px', background: '#162030', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{teacher.name}</span>
                  <Badge color={teacher.gender === 'male' ? 'blue' : 'pink'}>{teacher.gender === 'male' ? '🧑' : '👧'}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge color="orange">{teacher.salary_system}</Badge>
                  <Btn onClick={() => toggleArchiveTeacher(teacher.id, teacher.is_archived)} color={teacher.is_archived ? 'green' : 'red'}>{teacher.is_archived ? '⚡' : '📦'}</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
