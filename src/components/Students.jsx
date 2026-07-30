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
  FaUserClock, FaMars, FaVenus, FaEye, FaUndo
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
  const [studentLoading, setStudentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // نموذج الإضافة
  const [studentFormData, setStudentFormData] = useState({
    name: '', 
    gender: 'male', 
    parent_name: '', 
    country_code: 'EG',
    parent_phone: '', 
    subscription_type: 'monthly', 
    quarter_index: 1, 
    notes: '', 
    halaqa_id: ''
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

  // 1️⃣ جلب بيانات الطلاب من قاعدة البيانات
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
      setErrorMessage(trans('saveError', 'فشل حفظ بيانات الطالب، يرجى المحاولة لاحقاً', 'Failed to save student data'));
    } else if (data) {
      setStudentsList(prev => [data[0], ...prev]);
      setShowStudentForm(false);
      setStudentFormData({
        name: '', gender: 'male', parent_name: '', country_code: 'EG',
        parent_phone: '', subscription_type: 'monthly', quarter_index: 1, notes: '', halaqa_id: ''
      });
    }
  };

  // 3️⃣ أرشفة وتنشيط الطالب
  const toggleArchiveStudent = async (id, currentStatus) => {
    setErrorMessage('');
    const { error } = await supabase.from('students').update({ is_archived: !currentStatus }).eq('id', id);
    if (error) {
      setErrorMessage(trans('archiveError', 'فشلت عملية تغيير حالة أرشيف الطالب', 'Failed to change student archive status'));
    } else {
      setStudentsList(prev => prev.filter(s => s.id !== id));
    }
  };

  // 4️⃣ تصفية الفلترة السريعة والبحث
  const filteredStudents = useMemo(() => {
    return studentsList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                            (s.parent_phone && s.parent_phone.includes(studentSearch));
      const matchesHalaqa = selectedHalaqaFilter === 'all' || 
                            (selectedHalaqaFilter === 'unassigned' ? !s.halaqa_id : s.halaqa_id === selectedHalaqaFilter);
      const matchesGender = selectedGenderFilter === 'all' || s.gender === selectedGenderFilter;

      return matchesSearch && matchesHalaqa && matchesGender;
    });
  }, [studentsList, studentSearch, selectedHalaqaFilter, selectedGenderFilter]);

  // 5️⃣ إحصائيات سريعة
  const stats = useMemo(() => {
    const total = studentsList.length;
    const unassigned = studentsList.filter(s => !s.halaqa_id).length;
    const males = studentsList.filter(s => s.gender === 'male').length;
    const females = studentsList.filter(s => s.gender === 'female').length;
    return { total, unassigned, males, females };
  }, [studentsList]);

  // 6️⃣ فتح مراسلة واتساب
  const openWhatsApp = (e, phone, name) => {
    e.stopPropagation();
    if (!phone) return;
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(isRtl ? `السلام عليكم ورحمة الله، بشأن الطالب: ${name}` : `Hello, regarding student: ${name}`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. رأس الصفحة الموحد (PageHeader) */}
      <PageHeader 
        title={trans('studentsManagement', 'إدارة شؤون الطلاب والدارسين', 'Students Management')}
        sub={trans('studentsSubHeading', 'متابعة بيانات الطلاب، الحلقات المنتسبين إليها، وتحديث الحالة الحفظية', 'Manage student records, assigned halaqas, and quranic progress')}
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Btn 
              variant={showStudentForm ? "ghost" : "primary"}
              onClick={() => setShowStudentForm(!showStudentForm)}
            >
              <FaUserPlus /> 
              {showStudentForm 
                ? trans('closeForm', 'إغلاق الاستمارة', 'Close Form') 
                : trans('addNewStudent', 'إضافة طالب جديد', 'Add New Student')}
            </Btn>

            <Btn 
              variant={studentViewMode === 'active' ? "danger" : "ghost"}
              onClick={() => setStudentViewMode(studentViewMode === 'active' ? 'archive' : 'active')}
            >
              <FaArchive /> 
              {studentViewMode === 'active' 
                ? trans('viewArchive', 'أرشيف الطلاب', 'View Archive') 
                : trans('viewActive', 'الطلاب النشطين', 'Active Students')}
            </Btn>
          </div>
        }
      />

      {/* تنبيه الأخطاء */}
      {errorMessage && (
        <Card style={{ 
          background: 'rgba(239, 68, 68, 0.12)', 
          border: `1px solid ${C.danger}`, 
          color: C.danger, 
          padding: '12px 16px', 
          marginBottom: '20px', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center' 
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaExclamationTriangle /> {errorMessage}
          </span>
          <button onClick={() => setErrorMessage('')} style={{ background: 'transparent', border: 'none', color: C.danger, cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
        </Card>
      )}

      {/* 2. بطاقات الإحصائيات الذكية والتكيفية */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUsers style={{ color: C.gold }} />
            <span>{trans('totalDisplayCount', 'العدد المعروض', 'Displayed Total')}</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: C.text }}>
            {stats.total}
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUserClock style={{ color: stats.unassigned > 0 ? C.warning : C.success }} />
            <span>{trans('unassignedCount', 'بدون حلقة', 'Unassigned')}</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: stats.unassigned > 0 ? C.warning : C.success }}>
            {stats.unassigned}
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaMars style={{ color: '#60A5FA' }} />
            <span>{trans('malesCount', 'الطلاب الذكور', 'Male Students')}</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#60A5FA' }}>
            {stats.males}
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaVenus style={{ color: '#F472B6' }} />
            <span>{trans('femalesCount', 'الطالبات الإناث', 'Female Students')}</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#F472B6' }}>
            {stats.females}
          </div>
        </Card>
      </div>

      {/* 3. استمارة إضافة طالب جديد */}
      {showStudentForm && (
        <Card style={{ padding: '24px', marginBottom: '24px', border: `1px solid ${C.gold}` }}>
          <h3 style={{ color: C.gold, margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700' }}>
            {trans('formAddStudentHeader', 'بيانات تسجيل طالب جديد', 'New Student Information')}
          </h3>
          <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <Input 
              label={`* ${trans('lblFullName', 'اسم الطالب بالكامل', 'Student Full Name')}`}
              type="text" 
              required 
              value={studentFormData.name} 
              onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})} 
            />

            <Select 
              label={trans('lblStudentHalaqa', 'تنسيب وتعيين الحلقة القرآنية', 'Assign Quranic Halaqa')}
              value={studentFormData.halaqa_id} 
              onChange={(e) => setStudentFormData({...studentFormData, halaqa_id: e.target.value})}
            >
              <option value="">{trans('unassignedHalaqaOption', '🚫 بدون حلقة حالياً', 'No Halaqa Assigned')}</option>
              {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
            </Select>

            {/* محدد مستوى القرآن */}
            <div style={{ background: C.cardBgLight || '#1e293b', padding: '14px', borderRadius: '10px', border: `1px solid ${C.border}` }}>
              <QuranProgressSelector 
                initialIndex={studentFormData.quarter_index}
                onIndexChange={(newIndex) => setStudentFormData({ ...studentFormData, quarter_index: newIndex })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <Select 
                label={trans('lblGender', 'الجنس', 'Gender')}
                value={studentFormData.gender} 
                onChange={(e) => setStudentFormData({...studentFormData, gender: e.target.value})}
              >
                <option value="male">{trans('genMale', 'ذكر 🧑', 'Male 🧑')}</option>
                <option value="female">{trans('genFemale', 'أنثى 👧', 'Female 👧')}</option>
              </Select>

              <Input 
                label={trans('lblParentName', 'اسم ولي الأمر', 'Parent Name')}
                type="text" 
                value={studentFormData.parent_name} 
                onChange={(e) => setStudentFormData({...studentFormData, parent_name: e.target.value})} 
              />
            </div>

            <div>
              <label style={{ color: C.text, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                *{trans('lblPhone', 'رقم الهاتف وتحديد الدولة', 'Country & Contact')}
              </label>
              <div style={{ display: 'flex', gap: '10px', direction: 'ltr' }}>
                <Select 
                  value={studentFormData.country_code} 
                  onChange={(e) => setStudentFormData({...studentFormData, country_code: e.target.value})} 
                  style={{ width: '130px' }}
                >
                  {COUNTRIES_LIST.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.dialCode} ({currentLang === 'ar' ? c.nameAr : c.nameEn})
                    </option>
                  ))}
                </Select>
                <Input 
                  type="tel" 
                  required 
                  value={studentFormData.parent_phone} 
                  onChange={(e) => setStudentFormData({...studentFormData, parent_phone: e.target.value})} 
                  style={{ flex: 1, textAlign: 'left' }} 
                />
              </div>
            </div>

            <Btn type="submit" variant="primary" style={{ marginTop: '8px', padding: '12px' }}>
              {trans('btnConfirmAdd', 'تأكيد وحفظ بيانات الطالب 🚀', 'Save Student 🚀')}
            </Btn>
          </form>
        </Card>
      )}

      {/* 4. شريط التصفية والبحث المتقدم */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <Input 
          type="text" 
          placeholder={trans('phSearchStudent', 'ابحث باسم الطالب أو رقم الهاتف...', 'Search by student name or phone...')} 
          value={studentSearch} 
          onChange={(e) => setStudentSearch(e.target.value)} 
        />

        <Select 
          value={selectedHalaqaFilter} 
          onChange={(e) => setSelectedHalaqaFilter(e.target.value)}
        >
          <option value="all">📂 {trans('allHalaqasFilter', 'جميع الحلقات', 'All Halaqas')}</option>
          <option value="unassigned">🚫 {trans('unassignedOnly', 'بدون حلقة فقط', 'Unassigned Only')}</option>
          {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
        </Select>

        <Select 
          value={selectedGenderFilter} 
          onChange={(e) => setSelectedGenderFilter(e.target.value)}
        >
          <option value="all">👥 {trans('allGendersFilter', 'جميع الجنسين', 'All Genders')}</option>
          <option value="male">🧑 {trans('malesOnly', 'الذكور', 'Males')}</option>
          <option value="female">👧 {trans('femalesOnly', 'الإناث', 'Females')}</option>
        </Select>
      </div>

      {/* 5. عرض قائمة الجدول والبطاقات */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {studentLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: C.gold }}>
            ⚡ {trans('loadingData', 'جاري جلب بيانات الطلاب...', 'Loading students...')}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: C.textSub, margin: 0, fontSize: '0.95rem' }}>
              {trans('noStudentsFound', 'لم يتم العثور على نتائج مطابقة للبحث', 'No students match your criteria')}
            </p>
          </div>
        ) : !isMobile ? (
          /* عرض شاشات الحاسوب/اللوحي: جدول منظم */
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}`, background: C.cardBgLight || 'rgba(255,255,255,0.02)' }}>
                <TH>{trans('thStudentName', 'الاسم / الحلقة', 'Name / Halaqa')}</TH>
                <TH>{trans('thGender', 'الجنس', 'Gender')}</TH>
                <TH>{trans('thParentContact', 'ولي الأمر واتساب', 'Guardian / WhatsApp')}</TH>
                <TH>{trans('thSubscription', 'الاشتراك', 'Subscription')}</TH>
                <TH>{trans('thActions', 'الإجراءات', 'Actions')}</TH>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const matchedHalaqa = halaqas.find(h => h.id === student.halaqa_id);
                return (
                  <tr 
                    key={student.id} 
                    onClick={() => onSelectStudent && onSelectStudent(student)}
                    style={{ 
                      borderBottom: `1px solid ${C.border}`, 
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <TD>
                      <div style={{ fontWeight: '700', color: C.text, fontSize: '0.95rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: matchedHalaqa ? C.gold : C.warning, marginTop: '2px' }}>
                        📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassigned', 'بدون حلقة', 'Unassigned')}
                      </div>
                    </TD>
                    <TD>
                      <Badge variant={student.gender === 'female' ? 'danger' : 'primary'}>
                        {student.gender === 'female' ? trans('genFemale', 'أنثى 👧', 'Female') : trans('genMale', 'ذكر 🧑', 'Male')}
                      </Badge>
                    </TD>
                    <TD>
                      <div style={{ fontSize: '0.85rem', color: C.text }}>{student.parent_name || '-'}</div>
                      {student.parent_phone && (
                        <div 
                          onClick={(e) => openWhatsApp(e, student.parent_phone, student.name)}
                          style={{ fontSize: '0.8rem', color: C.success, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '2px', direction: 'ltr' }}
                        >
                          <FaWhatsapp /> {student.parent_phone}
                        </div>
                      )}
                    </TD>
                    <TD>
                      <Badge variant="ghost">
                        {student.subscription_system || 'monthly'}
                      </Badge>
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <Btn 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onSelectStudent && onSelectStudent(student)}
                          title={trans('viewDetails', 'عرض التقرير والتفاصيل', 'View Details')}
                        >
                          <FaEye />
                        </Btn>
                        <Btn 
                          variant={student.is_archived ? "success" : "danger"} 
                          size="sm" 
                          onClick={() => toggleArchiveStudent(student.id, student.is_archived)}
                          title={student.is_archived ? trans('restore', 'إعادة للنشطين', 'Restore') : trans('archive', 'أرشفة', 'Archive')}
                        >
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
          /* عرض شاشات الموبايل: بطاقات أنيقة */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
            {filteredStudents.map(student => {
              const matchedHalaqa = halaqas.find(h => h.id === student.halaqa_id);
              return (
                <Card 
                  key={student.id} 
                  onClick={() => onSelectStudent && onSelectStudent(student)}
                  style={{ padding: '14px', border: `1px solid ${C.border}`, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: C.text, fontSize: '1rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: matchedHalaqa ? C.gold : C.warning, marginTop: '2px' }}>
                        📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassigned', 'بدون حلقة', 'Unassigned')}
                      </div>
                    </div>
                    <Badge variant={student.gender === 'female' ? 'danger' : 'primary'}>
                      {student.gender === 'female' ? '👧' : '🧑'}
                    </Badge>
                  </div>

                  {student.parent_phone && (
                    <div 
                      onClick={(e) => openWhatsApp(e, student.parent_phone, student.name)}
                      style={{ fontSize: '0.85rem', color: C.success, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', direction: 'ltr', justifyContent: 'flex-end' }}
                    >
                      <span>{student.parent_phone}</span>
                      <FaWhatsapp />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                    <Btn 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); onSelectStudent && onSelectStudent(student); }}
                    >
                      <FaEye /> {trans('details', 'التفاصيل', 'Details')}
                    </Btn>

                    <Btn 
                      variant={student.is_archived ? "success" : "danger"} 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); toggleArchiveStudent(student.id, student.is_archived); }}
                    >
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
