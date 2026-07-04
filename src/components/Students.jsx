import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, Badge, Btn, TH, TD } from './UI';
import { useTranslation } from 'react-i18next';
// استيراد قائمة الدول الموحدة والعالمية الجديدة
import { COUNTRIES_LIST } from '../constants/countries';

export default function StudentsAndTeachers({ academyId, refreshTrigger }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  // التبويب الرئيسي الموحد للتحكم بالواجهة (طلاب أم محفظون)
  const [mainTab, setMainTab] = useState('students'); // students | teachers

  // --- حالات قسم الطلاب ---
  const [studentViewMode, setStudentViewMode] = useState('active'); // active | archive
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: '', gender: 'male', parent_name: '', country_code: 'EG',
    parent_phone: '', subscription_type: 'monthly', juz_start: '1', quarter_start: '1', notes: ''
  });

  // --- حالات قسم المحفظين والمعلمين ---
  const [teacherViewMode, setTeacherViewMode] = useState('active'); // active | archive
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '', gender: 'male', country_code: 'EG', phone: '',
    salary_type: 'monthly', total_classes: '0', notes: ''
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // دالة حساب عرض التاريخ المزدوج الذكي والمعالج هندسياً من أخطاء الـ BC
  const getDualDateString = () => {
    const today = new Date();
    const gregOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const gregPart = today.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', gregOptions);
    try {
      const hijriOptions = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
      let hijriPart = today.toLocaleDateString(currentLang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', hijriOptions);
      
      // تصحيح فوري وذكي لثغرة ظهور مخرجات المتصفحات الغربية بعبارة (BC) الخاطئة بالتاريخ الهجري الإسلامي
      hijriPart = hijriPart.replace(/\bBC\b/g, 'AH').replace(/\bقبل الميلاد\b/g, 'هـ');
      
      return isRtl ? `${gregPart} مـ | 🗓️ هجري: ${hijriPart}` : `${gregPart} AD | 🗓️ Hijri: ${hijriPart}`;
    } catch (e) {
      return gregPart;
    }
  };

  // محرك الترجمة الفورية المحمي ضد غياب ملفات الترجمة الثابتة
  const trans = (key, fallbackAr, fallbackEn) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? fallbackAr : fallbackEn;
  };

  // تأثير جلب بيانات الطلاب من سوبابيس
  useEffect(() => {
    const fetchStudents = async () => {
      if (!academyId || mainTab !== 'students') return;
      setStudentLoading(true);
      const isArchivedStatus = studentViewMode === 'archive';
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('academy_id', academyId)
        .eq('is_archived', isArchivedStatus)
        .order('created_at', { ascending: false });

      if (!error && data) setStudentsList(data);
      setStudentLoading(false);
    };
    fetchStudents();
  }, [academyId, studentViewMode, mainTab, refreshTrigger]);

  // تأثير جلب بيانات المحفظين والمعلمين من سوبابيس
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!academyId || mainTab !== 'teachers') return;
      setTeacherLoading(true);
      const isArchivedStatus = teacherViewMode === 'archive';
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('academy_id', academyId)
        .eq('is_archived', isArchivedStatus)
        .order('created_at', { ascending: false });

      if (!error && data) setTeachersList(data);
      setTeacherLoading(false);
    };
    fetchTeachers();
  }, [academyId, teacherViewMode, mainTab, refreshTrigger]);

  // --- معالجة عمليات الطلاب ---
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!studentFormData.name.trim() || !studentFormData.parent_phone.trim()) {
      return alert(trans('requiredFieldsAlert', 'الرجاء ملء الحقول الإلزامية', 'Please fill in required fields'));
    }
    const selectedCountry = COUNTRIES_LIST.find(c => c.code === studentFormData.country_code);
    const fullPhone = `${selectedCountry?.dialCode || ''}${studentFormData.parent_phone.trim().replace(/^0+/, '')}`;

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
      is_archived: false
    };

    const { data, error } = await supabase.from('students').insert(payload).select();
    if (!error && data) {
      setStudentsList(prev => [data[0], ...prev]);
      setShowStudentForm(false);
      setStudentFormData({
        name: '', gender: 'male', parent_name: '', country_code: 'EG',
        parent_phone: '', subscription_type: 'monthly', juz_start: '1', quarter_start: '1', notes: ''
      });
    }
  };

  const toggleArchiveStudent = async (id, currentStatus) => {
    const { error } = await supabase.from('students').update({ is_archived: !currentStatus }).eq('id', id);
    if (!error) setStudentsList(prev => prev.filter(s => s.id !== id));
  };

  // --- معالجة عمليات المحفظين ---
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!teacherFormData.name.trim() || !teacherFormData.phone.trim()) {
      return alert(trans('requiredFieldsAlert', 'الرجاء ملء الحقول الإلزامية', 'Please fill in required fields'));
    }
    const selectedCountry = COUNTRIES_LIST.find(c => c.code === teacherFormData.country_code);
    const fullPhone = `${selectedCountry?.dialCode || ''}${teacherFormData.phone.trim().replace(/^0+/, '')}`;

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
    if (!error && data) {
      setTeachersList(prev => [data[0], ...prev]);
      setShowTeacherForm(false);
      setTeacherFormData({
        name: '', gender: 'male', country_code: 'EG', phone: '', salary_type: 'monthly', total_classes: '0', notes: ''
      });
    }
  };

  const toggleArchiveTeacher = async (id, currentStatus) => {
    const { error } = await supabase.from('teachers').update({ is_archived: !currentStatus }).eq('id', id);
    if (!error) setTeachersList(prev => prev.filter(t => t.id !== id));
  };

  const filteredStudents = studentsList.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.parent_phone && s.parent_phone.includes(studentSearch))
  );

  const filteredTeachers = teachersList.filter(t =>
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || (t.phone && t.phone.includes(teacherSearch))
  );

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", paddingBottom: '40px' }}>
      
      {/* رأس الصفحة مع التاريخ المزدوج المصلح ذكياً */}
      <div style={{ marginBottom: '20px', textAlign: isRtl ? 'right' : 'left' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: C.gold, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          {trans('mainModuleTitle', 'إدارة شؤون الأكاديمية العظمى', 'Academy Corporate Management')} 🎓
        </h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>
          {getDualDateString()}
        </p>
      </div>

      {/* التبويبات العلوية المحسنة لمنع تكرار الكلمات والارتباك البصري */}
      <div style={{ display: 'flex', background: '#162030', padding: '6px', borderRadius: '14px', marginBottom: '24px', gap: '6px' }}>
        <button
          onClick={() => setMainTab('students')}
          style={{
            flex: 1, padding: '12px 8px', borderRadius: '10px', border: 'none',
            background: mainTab === 'students' ? C.gold : 'transparent',
            color: mainTab === 'students' ? '#0f172a' : '#94a3b8',
            fontWeight: '800', fontSize: isMobile ? '13px' : '15px', cursor: 'pointer', transition: 'all 0.2s',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}
        >
          👨‍🎓 {trans('tabStudentsLabel', 'شؤون الطلاب', 'Students Division')}
        </button>
        <button
          onClick={() => setMainTab('teachers')}
          style={{
            flex: 1, padding: '12px 8px', borderRadius: '10px', border: 'none',
            background: mainTab === 'teachers' ? C.gold : 'transparent',
            color: mainTab === 'teachers' ? '#0f172a' : '#94a3b8',
            fontWeight: '800', fontSize: isMobile ? '13px' : '15px', cursor: 'pointer', transition: 'all 0.2s',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}
        >
          🕌 {trans('tabTeachersLabel', 'هيئة المحفظين والمعلمين', 'Teachers & Faculty')}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🔴 أولاً: واجهة وقسم إدارة الطلاب */}
      {/* ========================================================================= */}
      {mainTab === 'students' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
            <button
              onClick={() => setShowStudentForm(!showStudentForm)}
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: showStudentForm ? '#1e293b' : C.gold, color: showStudentForm ? '#fff' : '#0f172a', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }}
            >
              {showStudentForm ? trans('closeForm', 'إغلاق الاستمارة ✖', 'Close Form ✖') : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>➕</span>
                  <span>{trans('addNewStudent', 'إضافة طالب جديد للمنظومة', 'Add New Student')}</span>
                </span>
              )}
            </button>
            <button
              onClick={() => setStudentViewMode(studentViewMode === 'active' ? 'archive' : 'active')}
              style={{ 
                flex: 1, padding: '14px', borderRadius: '12px', 
                border: `1px solid ${studentViewMode === 'active' ? '#ef4444' : C.gold}`, 
                background: studentViewMode === 'active' ? 'transparent' : '#ef4444', 
                color: studentViewMode === 'active' ? '#ef4444' : '#fff', 
                fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s' 
              }}
            >
              📦 {studentViewMode === 'active' ? trans('viewArchive', 'عرض أرشيف الطلاب', 'View Students Archive') : trans('viewActive', 'عرض الطلاب النشطين', 'View Active Students')}
            </button>
          </div>

          {showStudentForm && (
            <Card style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblFullName', 'اسم الطالب بالكامل', 'Student Full Name')}</label>
                  <input type="text" placeholder={trans('phFullName', 'أدخل الاسم بالكامل وبمرونة هيكلية دولية...', 'Enter full name...')} value={studentFormData.name} onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblGender', 'الجنس', 'Gender')}</label>
                    <select value={studentFormData.gender} onChange={(e) => setStudentFormData({...studentFormData, gender: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                      <option value="male">{trans('genMale', 'ذكر 🧑', 'Male 🧑')}</option>
                      <option value="female">{trans('genFemale', 'أنثى 👧', 'Female 👧')}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblParentName', 'اسم ولي الأمر', 'Parent Name')}</label>
                    <input type="text" placeholder={trans('phParentName', 'اسم الأب أو الكفيل التعليمي...', 'Guardian name...')} value={studentFormData.parent_name} onChange={(e) => setStudentFormData({...studentFormData, parent_name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblPhone', 'رقم الهاتف وتحديد الدولة للتواصل الدولي', 'Country & Contact Number')}</label>
                  <div style={{ display: 'flex', gap: '10px', direction: 'ltr' }}>
                    <select value={studentFormData.country_code} onChange={(e) => setStudentFormData({...studentFormData, country_code: e.target.value})} style={{ width: '130px', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                      {COUNTRIES_LIST.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.dialCode} ({currentLang === 'ar' ? c.nameAr : c.nameEn})
                        </option>
                      ))}
                    </select>
                    <input type="tel" placeholder="123456789" value={studentFormData.parent_phone} onChange={(e) => setStudentFormData({...studentFormData, parent_phone: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', textAlign: 'left' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblSubSystem', 'نظام الاشتراك المالي', 'Subscription')}</label>
                  <select value={studentFormData.subscription_type} onChange={(e) => setStudentFormData({...studentFormData, subscription_type: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                    <option value="monthly">{trans('subMonthly', 'اشتراك شهري دوري منتظم', 'Monthly')}</option>
                    <option value="per_hour">{trans('subHour', 'نظام المحاسبة بالحصة', 'Per Hour')}</option>
                    <option value="free">{trans('subFree', 'منحة مجانية كاملة', 'Free')}</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <select value={studentFormData.juz_start} onChange={(e) => setStudentFormData({...studentFormData, juz_start: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(num => <option key={num} value={num}>{trans('juzLabel', 'الجزء', 'Juz')} {num}</option>)}
                  </select>
                  <select value={studentFormData.quarter_start} onChange={(e) => setStudentFormData({...studentFormData, quarter_start: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(num => <option key={num} value={num}>{trans('quarterLabel', 'الربع', 'Quarter')} {num}</option>)}
                  </select>
                </div>
                <button type="submit" style={{ padding: '14px', borderRadius: '10px', border: 'none', background: C.gold, color: '#0f172a', fontWeight: '700', cursor: 'pointer', fontSize: '15px', marginTop: '6px' }}>
                  {trans('btnConfirmAdd', 'تأكيد وحفظ بيانات الطالب 🚀', 'Save Student 🚀')}
                </button>
              </form>
            </Card>
          )}

          {/* حقل البحث المحمي من الاختناق على الموبايل */}
          <div style={{ marginBottom: '16px' }}>
            <input type="text" placeholder={trans('phSearchStudent', 'ابحث باسم الطالب أو رقم الهاتف الفوري...', 'Search student...')} value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <Card style={{ padding: 0, background: 'transparent' }}>
            {studentLoading ? (
              <p style={{ color: C.muted, textAlign: 'center', padding: '20px' }}>...</p>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: C.surface, borderRadius: '12px', border: '1px dashed #334155' }}><p style={{ margin: 0, color: C.muted }}>{trans('noStudentsFound', 'لا يوجد نتائج مطابقة', 'No results found')}</p></div>
            ) : isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredStudents.map(s => {
                  const country = COUNTRIES_LIST.find(c => c.code === s.country);
                  return (
                    <div key={s.id} style={{ background: C.surface, padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: C.gold, marginTop: '4px' }}>
                          {country ? `${country.flag} ${currentLang === 'ar' ? country.nameAr : country.nameEn}` : s.country} | {trans('juzShort', 'جزء', 'Juz')} {s.current_juz}
                        </div>
                      </div>
                      <Btn style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => toggleArchiveStudent(s.id, s.is_archived)}>
                        {studentViewMode === 'active' ? trans('btnArchive', 'أرشفة', 'Archive') : trans('btnActivate', 'تنشيط', 'Activate')}
                      </Btn>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: C.surface, borderRadius: '12px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <TH>{trans('thName', 'اسم الطالب', 'Name')}</TH>
                    <TH>{trans('thCountry', 'الدولة', 'Country')}</TH>
                    <TH>{trans('thLevel', 'المستوى الحالي', 'Level')}</TH>
                    <TH>{trans('thActions', 'العمليات', 'Actions')}</TH>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <TD style={{ color: '#fff', fontWeight: '600' }}>{s.name}</TD>
                      <TD style={{ color: '#94a3b8' }}>
                        {(() => {
                          const c = COUNTRIES_LIST.find(item => item.code === s.country);
                          return c ? `${c.flag} ${currentLang === 'ar' ? c.nameAr : c.nameEn}` : s.country;
                        })()}
                      </TD>
                      <TD style={{ color: C.gold }}>{trans('juzLabel', 'الجزء', 'Juz')} {s.current_juz}</TD>
                      <TD><Btn style={{ background: studentViewMode === 'active' ? '#ef4444' : '#10b981' }} onClick={() => toggleArchiveStudent(s.id, s.is_archived)}>{studentViewMode === 'active' ? trans('btnArchive', 'أرشفة', 'Archive') : trans('btnActivate', 'تنشيط', 'Activate')}</Btn></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟢 ثانياً: واجهة وقسم إدارة المحفظين والمعلمين */}
      {/* ========================================================================= */}
      {mainTab === 'teachers' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
            <button
              onClick={() => setShowTeacherForm(!showTeacherForm)}
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: showTeacherForm ? '#1e293b' : C.gold, color: showTeacherForm ? '#fff' : '#0f172a', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }}
            >
              {showTeacherForm ? trans('closeForm', 'إغلاق الاستمارة ✖', 'Close Form ✖') : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>➕</span>
                  <span>{trans('addNewTeacher', 'تعيين محفظ/معلم جديد', 'Recruit New Teacher')}</span>
                </span>
              )}
            </button>
            <button
              onClick={() => setTeacherViewMode(teacherViewMode === 'active' ? 'archive' : 'active')}
              style={{ 
                flex: 1, padding: '14px', borderRadius: '12px', 
                border: `1px solid ${teacherViewMode === 'active' ? '#ef4444' : C.gold}`, 
                background: teacherViewMode === 'active' ? 'transparent' : '#ef4444', 
                color: teacherViewMode === 'active' ? '#ef4444' : '#fff', 
                fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s' 
              }}
            >
              📦 {teacherViewMode === 'active' ? trans('viewTeacherArchive', 'عرض أرشيف المحفظين', 'View Teachers Archive') : trans('viewTeacherActive', 'عرض المحفظين النشطين', 'View Active Teachers')}
            </button>
          </div>

          {showTeacherForm && (
            <Card style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblTeacherName', 'اسم المحفظ/المعلم بالكامل', 'Teacher Full Name')}</label>
                  <input type="text" placeholder={trans('phTeacherName', 'أدخل اسم المعلم ثلاثياً أو كاملاً...', 'Enter teacher name...')} value={teacherFormData.name} onChange={(e) => setTeacherFormData({...teacherFormData, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblGender', 'الجنس', 'Gender')}</label>
                  <select value={teacherFormData.gender} onChange={(e) => setTeacherFormData({...teacherFormData, gender: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                    <option value="male">{trans('genMale', 'ذكر 🧑', 'Male 🧑')}</option>
                    <option value="female">{trans('genFemale', 'أنثى 👧', 'Female 👧')}</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblTeacherPhone', 'رقم هاتف المعلم الدولي الموحد', 'Teacher WhatsApp Phone')}</label>
                  <div style={{ display: 'flex', gap: '10px', direction: 'ltr' }}>
                    <select value={teacherFormData.country_code} onChange={(e) => setTeacherFormData({...teacherFormData, country_code: e.target.value})} style={{ width: '130px', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                      {COUNTRIES_LIST.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.dialCode} ({currentLang === 'ar' ? c.nameAr : c.nameEn})
                        </option>
                      ))}
                    </select>
                    <input type="tel" placeholder="100234567" value={teacherFormData.phone} onChange={(e) => setTeacherFormData({...teacherFormData, phone: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', textAlign: 'left' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblSalarySystem', 'هيكل مستحقات الراتب والرواتب الموظفين', 'Salary Structures System')}</label>
                  <select value={teacherFormData.salary_type} onChange={(e) => setTeacherFormData({...teacherFormData, salary_type: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                    <option value="monthly">{trans('salMonthly', 'راتب شهري مقطوع ومحدد ثابت', 'Fixed Monthly Salary')}</option>
                    <option value="per_hour">{trans('salHour', 'محاسبة إنتاجية بالساعة / الحصة المقررة', 'Pay Per Class / Hour')}</option>
                    <option value="volunteer">{trans('salVolunteer', 'عمل تطوعي / بدون أجر احتسابي', 'Volunteer / No Salary')}</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblNotes', 'ملاحظات الكفاءة والمقاصد التعليمية', 'Specialization & Skills Notes')}</label>
                  <textarea rows={3} placeholder={trans('phTeacherNotes', 'أدخل الروايات المسندة، التخصصات القرنائية، أو النطاقات الزمنية المتوافقة...', 'Enter achievements, certifications, narrations, or available shifts...')} value={teacherFormData.notes} onChange={(e) => setTeacherFormData({...teacherFormData, notes: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', resize: 'none' }} />
                </div>
                <button type="submit" style={{ padding: '14px', borderRadius: '10px', border: 'none', background: C.gold, color: '#0f172a', fontWeight: '700', cursor: 'pointer', fontSize: '15px', marginTop: '6px' }}>
                  {trans('btnConfirmAddTeacher', 'اعتماد وتعيين المعلم رسمياً في الأكاديمية 🚀', 'Save & Appoint Teacher 🚀')}
                </button>
              </form>
            </Card>
          )}

          {/* حقل بحث المحفظين المحمي */}
          <div style={{ marginBottom: '16px' }}>
            <input type="text" placeholder={trans('phSearchTeacher', 'ابحث باسم المحفظ أو رقم الاتصال الدولي فوري...', 'Search teacher...')} value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <Card style={{ padding: 0, background: 'transparent' }}>
            {teacherLoading ? (
              <p style={{ color: C.muted, textAlign: 'center', padding: '20px' }}>...</p>
            ) : filteredTeachers.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: C.surface, borderRadius: '12px', border: '1px dashed #334155' }}><p style={{ margin: 0, color: C.muted }}>{trans('noTeachersFound', 'لا يوجد معلمون مسجلون يطابقون البحث الحاضر', 'No teachers found')}</p></div>
            ) : isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTeachers.map(tch => {
                  const country = COUNTRIES_LIST.find(c => c.code === tch.country);
                  return (
                    <div key={tch.id} style={{ background: C.surface, padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{tch.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          {country ? `${country.flag} ${currentLang === 'ar' ? country.nameAr : country.nameEn}` : tch.country} | {tch.phone}
                        </div>
                      </div>
                      <Btn style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => toggleArchiveTeacher(tch.id, tch.is_archived)}>
                        {teacherViewMode === 'active' ? trans('btnArchive', 'أرشفة', 'Archive') : trans('btnActivate', 'تنشيط', 'Activate')}
                      </Btn>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: C.surface, borderRadius: '12px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <TH>{trans('thTeacherName', 'اسم المعلم/المحفظ', 'Teacher Name')}</TH>
                    <TH>{trans('thCountry', 'الدولة المنتمي لها', 'Country')}</TH>
                    <TH>{trans('thSalarySystem', 'نظام المستحقات المالي', 'Compensation')}</TH>
                    <TH>{trans('thActions', 'العمليات السيادية', 'Actions')}</TH>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map(tch => (
                    <tr key={tch.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <TD style={{ color: '#fff', fontWeight: '600' }}>{tch.name}</TD>
                      <TD style={{ color: '#94a3b8' }}>
                        {(() => {
                          const c = COUNTRIES_LIST.find(item => item.code === tch.country);
                          return c ? `${c.flag} ${currentLang === 'ar' ? c.nameAr : c.nameEn}` : tch.country;
                        })()}
                      </TD>
                      <TD style={{ color: C.gold }}>{tch.salary_system === 'monthly' ? trans('salMonthly', 'راتب شهري', 'Monthly') : tch.salary_system === 'per_hour' ? trans('salHour', 'بالحصة', 'Per Class') : trans('salVolunteer', 'تطوعي', 'Volunteer')}</TD>
                      <TD><Btn style={{ background: teacherViewMode === 'active' ? '#ef4444' : '#10b981' }} onClick={() => toggleArchiveTeacher(tch.id, tch.is_archived)}>{teacherViewMode === 'active' ? trans('btnArchive', 'أرشفة المعلم', 'Archive') : trans('btnActivate', 'تنشيط الحساب', 'Activate')}</Btn></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
