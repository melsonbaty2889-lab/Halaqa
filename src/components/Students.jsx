import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, Badge, Btn, TH, TD } from './UI';
import { useTranslation } from 'react-i18next';
// استيراد قائمة الدول الموحدة والعالمية الجديدة
import { COUNTRIES_LIST } from '../constants/countries';

export default function StudentsAndTeachers({ academyId, refreshTrigger, halaqas = [] }) {
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
    parent_phone: '', subscription_type: 'monthly', juz_start: '1', quarter_start: '1', notes: '',
    halaqa_id: '' // إضافة الحقل الجديد في بنية الحالة
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
    // تنظيف الرقم من أي أصفار في البداية للحصول على رابط واتساب عالمي سليم
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
      halaqa_id: studentFormData.halaqa_id || null, // ربط معرف الحلقة ديناميكياً بقاعدة البيانات
      is_archived: false
    };

    const { data, error } = await supabase.from('students').insert(payload).select();
    if (!error && data) {
      setStudentsList(prev => [data[0], ...prev]);
      setShowStudentForm(false);
      setStudentFormData({
        name: '', gender: 'male', parent_name: '', country_code: 'EG',
        parent_phone: '', subscription_type: 'monthly', juz_start: '1', quarter_start: '1', notes: '', halaqa_id: ''
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
                
                {/* قائمة منسدلة جديدة لتعيين واختيار الحلقة المباشرة للطالب */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: C.gold, fontSize: '14px', fontWeight: '700' }}>{trans('lblStudentHalaqa', 'تنسيب وتعيين الحلقة القرآنية', 'Assign Quranic Halaqa')}</label>
                  <select value={studentFormData.halaqa_id} onChange={(e) => setStudentFormData({...studentFormData, halaqa_id: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                    <option value="">{trans('unassignedHalaqaOption', '🚫 بدون حلقة حالياً (غير مدرج)', 'No Halaqa (Unassigned)')}</option>
                    {halaqas.map(h => (
                      <option key={h.id} value={h.id}>
                        🔹 {isRtl ? h.name_ar : h.name_en}
                      </option>
                    ))}
                  </select>
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
              <div style={{ padding: '30px', textAlign: 'center', background: '#162030', borderRadius: '12px', border: '1px dashed #334155' }}>
                <p style={{ margin: 0, color: '#94a3b8' }}>{trans('noStudentsFound', 'لم يتم العثور على طلاب مسجلين مطبقين للبحث', 'No students found')}</p>
              </div>
            ) : !isMobile ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    <TH>{trans('thStudentName', 'الاسم / الحلقة', 'Name / Halaqa')}</TH>
                    <TH>{trans('thGender', 'الجنس', 'Gender')}</TH>
                    <TH>{trans('thParentContact', 'ولي الأمر والتواصل', 'Guardian & Contact')}</TH>
                    <TH>{trans('thSubscription', 'نظام الاشتراك', 'Subscription')}</TH>
                    <TH>{trans('thActions', 'التحكم الإجرائي', 'Actions')}</TH>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const matchedHalaqa = halaqas.find(h => h.id === student.halaqa_id);
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <TD>
                          <div style={{ fontWeight: '700', color: '#fff' }}>{student.name}</div>
                          <div style={{ fontSize: '11px', color: C.gold, marginTop: '2px', fontWeight: '600' }}>
                            📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassignedHalaqaText', 'غير مدرج بحلقة حالياً', 'Unassigned')}
                          </div>
                        </TD>
                        <TD>
                          <Badge color={student.gender === 'male' ? 'blue' : 'pink'}>
                            {student.gender === 'male' ? trans('genMale', 'ذكر', 'Male') : trans('genFemale', 'أنثى', 'Female')}
                          </Badge>
                        </TD>
                        <TD>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>{student.parent_name || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', direction: 'ltr', display: 'inline-block' }}>{student.parent_phone}</div>
                        </TD>
                        <TD>
                          <Badge color="orange">{student.subscription_system}</Badge>
                        </TD>
                        <TD>
                          <Btn onClick={() => toggleArchiveStudent(student.id, student.is_archived)} color={student.is_archived ? 'green' : 'red'}>
                            {student.is_archived ? trans('activateBtn', 'تنشيط ⚡', 'Activate ⚡') : trans('archiveBtn', 'أرشفة 📦', 'Archive 📦')}
                          </Btn>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredStudents.map(student => {
                  const matchedHalaqa = halaqas.find(h => h.id === student.halaqa_id);
                  return (
                    <Card key={student.id} style={{ padding: '16px', background: '#162030', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#fff' }}>{student.name}</span>
                        <Badge color={student.gender === 'male' ? 'blue' : 'pink'}>
                          {student.gender === 'male' ? '🧑' : '👧'}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '12px', color: C.gold, marginBottom: '6px', fontWeight: '600' }}>
                        📖 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassignedHalaqaText', 'غير مدرج بحلقة حالياً', 'Unassigned')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                        👤 {student.parent_name || '—'} | 📞 {student.parent_phone}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge color="orange">{student.subscription_system}</Badge>
                        <Btn onClick={() => toggleArchiveStudent(student.id, student.is_archived)} color={student.is_archived ? 'green' : 'red'}>
                          {student.is_archived ? '⚡' : '📦'}
                        </Btn>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟢 ثانياً: واجهة وقسم إدارة المعلمين والمحفظين */}
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
                  <span>{trans('addNewTeacher', 'إضافة معلم/محفظ جديد', 'Add New Teacher')}</span>
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
              📦 {teacherViewMode === 'active' ? trans('viewTeacherArchive', 'عرض أرشيف المعلمين', 'View Teachers Archive') : trans('viewTeacherActive', 'عرض المعلمين النشطين', 'View Active Teachers')}
            </button>
          </div>

          {showTeacherForm && (
            <Card style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblTeacherName', 'اسم المعلم بالكامل', 'Teacher Full Name')}</label>
                  <input type="text" placeholder={trans('phTeacherName', 'أدخل اسم المعلم/المحفظ الثلاثي...', 'Enter teacher name...')} value={teacherFormData.name} onChange={(e) => setTeacherFormData({...teacherFormData, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblGender', 'الجنس', 'Gender')}</label>
                    <select value={teacherFormData.gender} onChange={(e) => setTeacherFormData({...teacherFormData, gender: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                      <option value="male">{trans('genMale', 'ذكر 🧑', 'Male 🧑')}</option>
                      <option value="female">{trans('genFemale', 'أنثى 👧', 'Female 👧')}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblSalarySystem', 'نظام الاحتساب المالي للمرتب', 'Salary System')}</label>
                    <select value={teacherFormData.salary_type} onChange={(e) => setTeacherFormData({...teacherFormData, salary_type: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                      <option value="monthly">{trans('salMonthly', 'راتب شهري مقطوع ثابت', 'Fixed Monthly')}</option>
                      <option value="per_hour">{trans('salHour', 'احتساب مالي بالحصة/الساعة', 'Per Hour/Class')}</option>
                      <option value="volunteer">{trans('salVolunteer', 'عمل تطوعي (بدون مقابل)', 'Volunteer')}</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblTeacherPhone', 'رقم الاتصال الدولي والبلد', 'Contact Number & Country')}</label>
                  <div style={{ display: 'flex', gap: '10px', direction: 'ltr' }}>
                    <select value={teacherFormData.country_code} onChange={(e) => setTeacherFormData({...teacherFormData, country_code: e.target.value})} style={{ width: '130px', padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none' }}>
                      {COUNTRIES_LIST.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.dialCode} ({currentLang === 'ar' ? c.nameAr : c.nameEn})
                        </option>
                      ))}
                    </select>
                    <input type="tel" placeholder="123456789" value={teacherFormData.phone} onChange={(e) => setTeacherFormData({...teacherFormData, phone: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', textAlign: 'left' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{trans('lblNotes', 'ملاحظات وتوجيهات إدارية', 'Notes / Remarks')}</label>
                  <textarea rows="2" placeholder={trans('phTeacherNotes', 'اكتب أي ملاحظات تخص كفاءة المعلم هنا...', 'Any administrative remarks...')} value={teacherFormData.notes} onChange={(e) => setTeacherFormData({...teacherFormData, notes: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" style={{ padding: '14px', borderRadius: '10px', border: 'none', background: C.gold, color: '#0f172a', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
                  {trans('btnConfirmAddTeacher', 'اعتماد وحفظ المعلم الجديد في النظام 🚀', 'Save Teacher 🚀')}
                </button>
              </form>
            </Card>
          )}

          {/* حقل البحث للمعلمين */}
          <div style={{ marginBottom: '16px' }}>
            <input type="text" placeholder={trans('phSearchTeacher', 'ابحث باسم المعلم أو رقم الهاتف الفوري...', 'Search teacher...')} value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <Card style={{ padding: 0, background: 'transparent' }}>
            {teacherLoading ? (
              <p style={{ color: C.muted, textAlign: 'center', padding: '20px' }}>...</p>
            ) : filteredTeachers.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#162030', borderRadius: '12px', border: '1px dashed #334155' }}>
                <p style={{ margin: 0, color: '#94a3b8' }}>{trans('noTeachersFound', 'لم يتم العثور على معلمين مسجلين', 'No teachers found')}</p>
              </div>
            ) : !isMobile ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    <TH>{trans('thTeacherName', 'اسم المعلم/المحفظ', 'Teacher Name')}</TH>
                    <TH>{trans('thGender', 'الجنس', 'Gender')}</TH>
                    <TH>{trans('thTeacherPhone', 'رقم الاتصال الدولي', 'Phone Number')}</TH>
                    <TH>{trans('thSalarySystem', 'النظام المالي', 'Salary System')}</TH>
                    <TH>{trans('thActions', 'التحكم الإجرائي', 'Actions')}</TH>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <TD style={{ fontWeight: '700', color: '#fff' }}>{teacher.name}</TD>
                      <TD>
                        <Badge color={teacher.gender === 'male' ? 'blue' : 'pink'}>
                          {teacher.gender === 'male' ? trans('genMale', 'ذكر', 'Male') : trans('genFemale', 'أنثى', 'Female')}
                        </Badge>
                      </TD>
                      <TD style={{ direction: 'ltr', display: 'table-cell' }}>{teacher.phone}</TD>
                      <TD><Badge color="orange">{teacher.salary_system}</Badge></TD>
                      <TD>
                        <Btn onClick={() => toggleArchiveTeacher(teacher.id, teacher.is_archived)} color={teacher.is_archived ? 'green' : 'red'}>
                          {teacher.is_archived ? trans('activateBtn', 'تنشيط ⚡', 'Activate ⚡') : trans('archiveBtn', 'أرشفة 📦', 'Archive 📦')}
                        </Btn>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTeachers.map(teacher => (
                  <Card key={teacher.id} style={{ padding: '16px', background: '#162030', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#fff' }}>{teacher.name}</span>
                      <Badge color={teacher.gender === 'male' ? 'blue' : 'pink'}>
                        {teacher.gender === 'male' ? '🧑' : '👧'}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                      📞 {teacher.phone}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge color="orange">{teacher.salary_system}</Badge>
                      <Btn onClick={() => toggleArchiveTeacher(teacher.id, teacher.is_archived)} color={teacher.is_archived ? 'green' : 'red'}>
                        {teacher.is_archived ? '⚡' : '📦'}
                      </Btn>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
}
