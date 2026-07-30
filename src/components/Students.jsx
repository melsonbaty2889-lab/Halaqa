import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, Badge, Btn, Input, Select, PageHeader, TH, TD } from './UI';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '../constants/countries';
import QuranProgressSelector from './QuranProgressSelector';
import { getQuranProgress } from '../utils/quranUtils';
import { 
  FaUserPlus, FaArchive, FaSearch, FaWhatsapp, 
  FaUserGraduate, FaUsers, FaExclamationTriangle, FaFilter,
  FaUserClock, FaMars, FaVenus, FaEye, FaUndo,
  FaFileExcel, FaPrint, FaBookOpen, FaCheckSquare, FaSquare, FaTasks
} from 'react-icons/fa';

export default function Students({ academyId, refreshTrigger, halaqas = [], onSelectStudent }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = i18n.dir() === 'rtl';

  // حالات العرض والبحث والفلترة
  const [studentViewMode, setStudentViewMode] = useState('active'); // 'active' or 'archive'
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedHalaqaFilter, setSelectedHalaqaFilter] = useState('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'name', 'progress'
  const [studentLoading, setStudentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // تحديد جماعي (Bulk Actions)
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkHalaqaId, setBulkHalaqaId] = useState('');

  // نموذج الإضافة
  const [studentFormData, setStudentFormData] = useState({
    name: '', gender: 'male', parent_name: '', country_code: 'EG',
    parent_phone: '', subscription_type: 'monthly', quarter_index: 1, notes: '', halaqa_id: ''
  });

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

  // 1️⃣ جلب بيانات الطلاب
  useEffect(() => {
    const fetchStudents = async () => {
      if (!academyId) return;
      setStudentLoading(true);
      setErrorMessage('');
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('academy_id', academyId)
        .eq('is_archived', studentViewMode === 'archive')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(trans('fetchError', 'حدث خطأ أثناء جلب بيانات الطلاب', 'Error fetching students data'));
      } else if (data) {
        setStudentsList(data);
      }
      setStudentLoading(false);
      setSelectedStudentIds([]); // إعادة ضبط التحديد عند تغيير القائمة
    };
    fetchStudents();
  }, [academyId, studentViewMode, refreshTrigger]);

  // 2️⃣ إضافة طالب جديد
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!studentFormData.name.trim() || !studentFormData.parent_phone.trim()) {
      return setErrorMessage(trans('requiredFieldsAlert', 'الرجاء ملء الحقول الإلزامية (*)', 'Fill required fields (*)'));
    }
    
    const selectedCountry = COUNTRIES_LIST.find(c => c.code === studentFormData.country_code);
    const cleanPhone = studentFormData.parent_phone.trim().replace(/^0+/, '').replace(/\D/g, '');
    const fullPhone = `${selectedCountry?.dialCode || ''}${cleanPhone}`;

    const qProgress = getQuranProgress(studentFormData.quarter_index);

    const payload = {
      academy_id: academyId,
      name: studentFormData.name.trim(),
      gender: studentFormData.gender,
      parent_name: studentFormData.parent_name.trim(),
      country: studentFormData.country_code,
      parent_phone: fullPhone,
      subscription_system: studentFormData.subscription_type,
      current_juz: qProgress.juz,
      current_quarter: qProgress.quarterInHizb,
      current_quarter_index: studentFormData.quarter_index,
      notes: studentFormData.notes.trim(),
      halaqa_id: studentFormData.halaqa_id || null,
      is_archived: false
    };

    const { data, error } = await supabase.from('students').insert(payload).select();
    if (error) {
      setErrorMessage(trans('saveError', 'فشل حفظ بيانات الطالب', 'Failed to save student data'));
    } else if (data) {
      setStudentsList(prev => [data[0], ...prev]);
      setShowStudentForm(false);
      setStudentFormData({
        name: '', gender: 'male', parent_name: '', country_code: 'EG',
        parent_phone: '', subscription_type: 'monthly', quarter_index: 1, notes: '', halaqa_id: ''
      });
    }
  };

  // 3️⃣ أرشفة وتنشيط الطالب المفرد
  const toggleArchiveStudent = async (id, currentStatus) => {
    setErrorMessage('');
    const { error } = await supabase.from('students').update({ is_archived: !currentStatus }).eq('id', id);
    if (error) {
      setErrorMessage(trans('archiveError', 'فشلت عملية تغيير حالة أرشيف الطالب', 'Failed to change student archive status'));
    } else {
      setStudentsList(prev => prev.filter(s => s.id !== id));
      setSelectedStudentIds(prev => prev.filter(sId => sId !== id));
    }
  };

  // 4️⃣ الفلترة والترتيب التكيفي
  const filteredStudents = useMemo(() => {
    let list = studentsList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                            (s.parent_phone && s.parent_phone.includes(studentSearch));
      const matchesHalaqa = selectedHalaqaFilter === 'all' || 
                            (selectedHalaqaFilter === 'unassigned' ? !s.halaqa_id : s.halaqa_id === selectedHalaqaFilter);
      const matchesGender = selectedGenderFilter === 'all' || s.gender === selectedGenderFilter;

      return matchesSearch && matchesHalaqa && matchesGender;
    });

    // الترتيب
    return list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortBy === 'progress') return (b.current_quarter_index || 0) - (a.current_quarter_index || 0);
      return new Date(b.created_at) - new Date(a.created_at); // الأحدث
    });
  }, [studentsList, studentSearch, selectedHalaqaFilter, selectedGenderFilter, sortBy]);

  // 5️⃣ الإحصائيات الذكية
  const stats = useMemo(() => {
    const total = studentsList.length;
    const unassigned = studentsList.filter(s => !s.halaqa_id).length;
    const males = studentsList.filter(s => s.gender === 'male').length;
    const females = studentsList.filter(s => s.gender === 'female').length;
    return { total, unassigned, males, females };
  }, [studentsList]);

  // 6️⃣ عمليات التحديد الجماعي (Bulk Actions)
  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleBulkAssignHalaqa = async () => {
    if (!selectedStudentIds.length) return;
    setStudentLoading(true);
    const targetHalaqa = bulkHalaqaId === 'unassigned' ? null : bulkHalaqaId;
    const { error } = await supabase
      .from('students')
      .update({ halaqa_id: targetHalaqa })
      .in('id', selectedStudentIds);

    if (error) {
      setErrorMessage(trans('bulkError', 'فشلت عملية التنسيب الجماعي', 'Bulk assignment failed'));
    } else {
      setStudentsList(prev => prev.map(s => selectedStudentIds.includes(s.id) ? { ...s, halaqa_id: targetHalaqa } : s));
      setSelectedStudentIds([]);
      setBulkHalaqaId('');
    }
    setStudentLoading(false);
  };

  const handleBulkArchive = async () => {
    if (!selectedStudentIds.length) return;
    setStudentLoading(true);
    const newStatus = studentViewMode === 'active';
    const { error } = await supabase
      .from('students')
      .update({ is_archived: newStatus })
      .in('id', selectedStudentIds);

    if (error) {
      setErrorMessage(trans('bulkArchiveError', 'فشلت الأرشفة الجماعية', 'Bulk archive failed'));
    } else {
      setStudentsList(prev => prev.filter(s => !selectedStudentIds.includes(s.id)));
      setSelectedStudentIds([]);
    }
    setStudentLoading(false);
  };

  // 7️⃣ تصدير إلى Excel/CSV
  const exportToCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ['Name', 'Gender', 'Phone', 'Halaqa ID', 'Current Quarter Index'];
    const rows = filteredStudents.map(s => [
      `"${s.name}"`, s.gender, `"${s.parent_phone || ''}"`, `"${s.halaqa_id || 'None'}"`, s.current_quarter_index || 1
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 8️⃣ فتح واتساب
  const openWhatsApp = (e, phone, name) => {
    e.stopPropagation();
    if (!phone) return;
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(isRtl ? `السلام عليكم ورحمة الله، بشأن الطالب: ${name}` : `Hello, regarding student: ${name}`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. رأس الصفحة */}
      <PageHeader 
        title={trans('studentsManagement', 'إدارة شؤون الطلاب والدارسين', 'Students Management')}
        sub={trans('studentsSubHeading', 'متابعة بيانات الطلاب، الحلقات المنتسبين إليها، وتحديث الحالة الحفظية', 'Manage student records, assigned halaqas, and quranic progress')}
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Btn variant="ghost" onClick={exportToCSV} title={trans('exportCSV', 'تصدير إكسيل', 'Export Excel')}>
              <FaFileExcel style={{ color: C.success }} /> {trans('export', 'تصدير', 'Export')}
            </Btn>

            <Btn 
              variant={showStudentForm ? "ghost" : "primary"}
              onClick={() => setShowStudentForm(!showStudentForm)}
            >
              <FaUserPlus /> 
              {showStudentForm ? trans('closeForm', 'إغلاق', 'Close') : trans('addNewStudent', 'إضافة طالب', 'Add Student')}
            </Btn>

            <Btn 
              variant={studentViewMode === 'active' ? "danger" : "ghost"}
              onClick={() => setStudentViewMode(studentViewMode === 'active' ? 'archive' : 'active')}
            >
              <FaArchive /> 
              {studentViewMode === 'active' ? trans('archive', 'الأرشيف', 'Archive') : trans('active', 'النشطين', 'Active')}
            </Btn>
          </div>
        }
      />

      {/* تنبيه الأخطاء */}
      {errorMessage && (
        <Card style={{ background: 'rgba(239, 68, 68, 0.12)', border: `1px solid ${C.danger}`, color: C.danger, padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaExclamationTriangle /> {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} style={{ background: 'transparent', border: 'none', color: C.danger, cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
        </Card>
      )}

      {/* 2. الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUsers style={{ color: C.gold }} /> <span>{trans('total', 'العدد المعروض', 'Total')}</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: C.text }}>{stats.total}</div>
        </Card>

        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUserClock style={{ color: stats.unassigned > 0 ? C.warning : C.success }} /> <span>{trans('unassigned', 'بدون حلقة', 'Unassigned')}</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: stats.unassigned > 0 ? C.warning : C.success }}>{stats.unassigned}</div>
        </Card>

        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaMars style={{ color: '#60A5FA' }} /> <span>{trans('males', 'ذكور', 'Males')}</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#60A5FA' }}>{stats.males}</div>
        </Card>

        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaVenus style={{ color: '#F472B6' }} /> <span>{trans('females', 'إناث', 'Females')}</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#F472B6' }}>{stats.females}</div>
        </Card>
      </div>

      {/* 3. شريط التحكم التكيفي (التأشير الجماعي Bulk Bar) */}
      {selectedStudentIds.length > 0 && (
        <Card style={{ padding: '12px 16px', marginBottom: '16px', background: 'rgba(217, 119, 6, 0.1)', border: `1px solid ${C.gold}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', color: C.gold, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTasks /> {trans('selectedCount', 'تم تحديد:', 'Selected:')} {selectedStudentIds.length} {trans('studentsUnit', 'طالب', 'students')}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Select value={bulkHalaqaId} onChange={(e) => setBulkHalaqaId(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
              <option value="">{trans('selectHalaqaToAssign', 'اختر حلقة للتعيين الجماعي...', 'Assign to Halaqa...')}</option>
              <option value="unassigned">🚫 {trans('removeFromHalaqa', 'إلغاء التنسيب (بدون حلقة)', 'Remove Halaqa')}</option>
              {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
            </Select>
            {bulkHalaqaId && (
              <Btn variant="primary" size="sm" onClick={handleBulkAssignHalaqa}>{trans('apply', 'تطبيق', 'Apply')}</Btn>
            )}
            <Btn variant="danger" size="sm" onClick={handleBulkArchive}>
              {studentViewMode === 'active' ? trans('bulkArchive', 'أرشفة المحددين', 'Archive Selected') : trans('bulkRestore', 'استعادة المحددين', 'Restore Selected')}
            </Btn>
          </div>
        </Card>
      )}

      {/* 4. استمارة الإضافة */}
      {showStudentForm && (
        <Card style={{ padding: '24px', marginBottom: '24px', border: `1px solid ${C.gold}` }}>
          <h3 style={{ color: C.gold, margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700' }}>
            {trans('formAddStudentHeader', 'بيانات تسجيل طالب جديد', 'New Student Information')}
          </h3>
          <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label={`* ${trans('lblFullName', 'اسم الطالب بالكامل', 'Student Full Name')}`} type="text" required value={studentFormData.name} onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})} />
            
            <Select label={trans('lblStudentHalaqa', 'تنسيب الحلقة القرآنية', 'Assign Quranic Halaqa')} value={studentFormData.halaqa_id} onChange={(e) => setStudentFormData({...studentFormData, halaqa_id: e.target.value})}>
              <option value="">{trans('unassignedHalaqaOption', '🚫 بدون حلقة حالياً', 'No Halaqa Assigned')}</option>
              {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
            </Select>

            <div style={{ background: C.cardBgLight || '#1e293b', padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}` }}>
              <QuranProgressSelector initialIndex={studentFormData.quarter_index} onIndexChange={(newIndex) => setStudentFormData({ ...studentFormData, quarter_index: newIndex })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <Select label={trans('lblGender', 'الجنس', 'Gender')} value={studentFormData.gender} onChange={(e) => setStudentFormData({...studentFormData, gender: e.target.value})}>
                <option value="male">{trans('genMale', 'ذكر 🧑', 'Male 🧑')}</option>
                <option value="female">{trans('genFemale', 'أنثى 👧', 'Female 👧')}</option>
              </Select>
              <Input label={trans('lblParentName', 'اسم ولي الأمر', 'Parent Name')} type="text" value={studentFormData.parent_name} onChange={(e) => setStudentFormData({...studentFormData, parent_name: e.target.value})} />
            </div>

            <div>
              <label style={{ color: C.text, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>*{trans('lblPhone', 'رقم الهاتف وتحديد الدولة', 'Country & Contact')}</label>
              <div style={{ display: 'flex', gap: '10px', direction: 'ltr' }}>
                <Select value={studentFormData.country_code} onChange={(e) => setStudentFormData({...studentFormData, country_code: e.target.value})} style={{ width: '130px' }}>
                  {COUNTRIES_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dialCode} ({currentLang === 'ar' ? c.nameAr : c.nameEn})</option>)}
                </Select>
                <Input type="tel" required value={studentFormData.parent_phone} onChange={(e) => setStudentFormData({...studentFormData, parent_phone: e.target.value})} style={{ flex: 1, textAlign: 'left' }} />
              </div>
            </div>

            <Btn type="submit" variant="primary" style={{ marginTop: '8px', padding: '12px' }}>{trans('btnConfirmAdd', 'تأكيد وحفظ بيانات الطالب 🚀', 'Save Student 🚀')}</Btn>
          </form>
        </Card>
      )}

      {/* 5. شريط التصفية والفرز */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <Input type="text" placeholder={trans('phSearchStudent', 'ابحث باسم الطالب أو الهاتف...', 'Search name or phone...')} value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />

        <Select value={selectedHalaqaFilter} onChange={(e) => setSelectedHalaqaFilter(e.target.value)}>
          <option value="all">📂 {trans('allHalaqasFilter', 'جميع الحلقات', 'All Halaqas')}</option>
          <option value="unassigned">🚫 {trans('unassignedOnly', 'بدون حلقة', 'Unassigned Only')}</option>
          {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
        </Select>

        <Select value={selectedGenderFilter} onChange={(e) => setSelectedGenderFilter(e.target.value)}>
          <option value="all">👥 {trans('allGendersFilter', 'جميع الجنسين', 'All Genders')}</option>
          <option value="male">🧑 {trans('malesOnly', 'الذكور', 'Males')}</option>
          <option value="female">👧 {trans('femalesOnly', 'الإناث', 'Females')}</option>
        </Select>

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">⌛ {trans('sortNewest', 'الأحدث تسجيلاً', 'Newest')}</option>
          <option value="name">🔤 {trans('sortName', 'أبجدياً بالاسم', 'Alphabetical')}</option>
          <option value="progress">📖 {trans('sortProgress', 'الأعلى حفظاً', 'Highest Progress')}</option>
        </Select>
      </div>

      {/* 6. قائمة الطلاب */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {studentLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: C.gold }}>⚡ {trans('loadingData', 'جاري جلب البيانات...', 'Loading...')}</div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: C.textSub, margin: 0 }}>{trans('noStudentsFound', 'لم يتم العثور على نتائج مطابقة', 'No students match your criteria')}</p>
          </div>
        ) : !isMobile ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}`, background: C.cardBgLight || 'rgba(255,255,255,0.02)' }}>
                <TH style={{ width: '40px' }}>
                  <button onClick={toggleSelectAll} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', fontSize: '1rem' }}>
                    {selectedStudentIds.length === filteredStudents.length ? <FaCheckSquare /> : <FaSquare />}
                  </button>
                </TH>
                <TH>{trans('thStudentName', 'الاسم / الحلقة', 'Name / Halaqa')}</TH>
                <TH>{trans('thQuranProgress', 'التقدم الحفظي الحالي', 'Quran Progress')}</TH>
                <TH>{trans('thParentContact', 'ولي الأمر واتساب', 'Guardian / WhatsApp')}</TH>
                <TH>{trans('thActions', 'الإجراءات', 'Actions')}</TH>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const matchedHalaqa = halaqas.find(h => h.id === student.halaqa_id);
                const qProgress = getQuranProgress(student.current_quarter_index || 1);
                const isSelected = selectedStudentIds.includes(student.id);

                return (
                  <tr key={student.id} onClick={() => onSelectStudent && onSelectStudent(student)} style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: isSelected ? 'rgba(217, 119, 6, 0.05)' : 'transparent' }}>
                    <TD onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelectStudent(student.id)} style={{ background: 'transparent', border: 'none', color: isSelected ? C.gold : C.textSub, cursor: 'pointer', fontSize: '1rem' }}>
                        {isSelected ? <FaCheckSquare /> : <FaSquare />}
                      </button>
                    </TD>
                    <TD>
                      <div style={{ fontWeight: '700', color: C.text, fontSize: '0.95rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: matchedHalaqa ? C.gold : C.warning, marginTop: '2px' }}>
                        📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassigned', 'بدون حلقة', 'Unassigned')}
                      </div>
                    </TD>
                    <TD>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: C.cardBgLight || '#1e293b', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '0.8rem', color: C.gold }}>
                        <FaBookOpen /> {isRtl ? qProgress.ar : qProgress.en}
                      </div>
                    </TD>
                    <TD>
                      <div style={{ fontSize: '0.85rem', color: C.text }}>{student.parent_name || '-'}</div>
                      {student.parent_phone && (
                        <div onClick={(e) => openWhatsApp(e, student.parent_phone, student.name)} style={{ fontSize: '0.8rem', color: C.success, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '2px', direction: 'ltr' }}>
                          <FaWhatsapp /> {student.parent_phone}
                        </div>
                      )}
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <Btn variant="ghost" size="sm" onClick={() => onSelectStudent && onSelectStudent(student)} title={trans('viewDetails', 'عرض التفاصيل', 'View Details')}>
                          <FaEye />
                        </Btn>
                        <Btn variant={student.is_archived ? "success" : "danger"} size="sm" onClick={() => toggleArchiveStudent(student.id, student.is_archived)} title={student.is_archived ? trans('restore', 'إعادة', 'Restore') : trans('archive', 'أرشفة', 'Archive')}>
                          {student.is_archived ? <FaUndo /> : <FaArchive />}
                        </Btn>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
            {filteredStudents.map(student => {
              const matchedHalaqa = halaqas.find(h => h.id === student.halaqa_id);
              const qProgress = getQuranProgress(student.current_quarter_index || 1);
              const isSelected = selectedStudentIds.includes(student.id);

              return (
                <Card key={student.id} onClick={() => onSelectStudent && onSelectStudent(student)} style={{ padding: '14px', border: `1px solid ${isSelected ? C.gold : C.border}`, cursor: 'pointer', background: isSelected ? 'rgba(217, 119, 6, 0.05)' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={(e) => { e.stopPropagation(); toggleSelectStudent(student.id); }} style={{ background: 'transparent', border: 'none', color: isSelected ? C.gold : C.textSub, cursor: 'pointer', fontSize: '1.1rem' }}>
                        {isSelected ? <FaCheckSquare /> : <FaSquare />}
                      </button>
                      <div>
                        <div style={{ fontWeight: '700', color: C.text, fontSize: '1rem' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: matchedHalaqa ? C.gold : C.warning, marginTop: '2px' }}>
                          📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassigned', 'بدون حلقة', 'Unassigned')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={student.gender === 'female' ? 'danger' : 'primary'}>{student.gender === 'female' ? '👧' : '🧑'}</Badge>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: C.cardBgLight || '#1e293b', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', color: C.gold, marginBottom: '10px' }}>
                    <FaBookOpen /> {isRtl ? qProgress.ar : qProgress.en}
                  </div>

                  {student.parent_phone && (
                    <div onClick={(e) => openWhatsApp(e, student.parent_phone, student.name)} style={{ fontSize: '0.85rem', color: C.success, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', direction: 'ltr', justifyContent: 'flex-end' }}>
                      <span>{student.parent_phone}</span> <FaWhatsapp />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                    <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onSelectStudent && onSelectStudent(student); }}>
                      <FaEye /> {trans('details', 'التفاصيل', 'Details')}
                    </Btn>
                    <Btn variant={student.is_archived ? "success" : "danger"} size="sm" onClick={(e) => { e.stopPropagation(); toggleArchiveStudent(student.id, student.is_archived); }}>
                      {student.is_archived ? trans('restore', 'استعادة', 'Restore') : trans('archive', 'أرشفة', 'Archive')}
                    </Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}
