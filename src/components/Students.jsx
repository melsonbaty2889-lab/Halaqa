import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, Badge, Btn, TH, TD } from './UI';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '../constants/countries';
import QuranProgressSelector from './QuranProgressSelector';
import { getQuranProgress } from '../utils/quranUtils';
import { 
  FaUserPlus, FaArchive, FaSearch, FaWhatsapp, 
  FaUserGraduate, FaUsers, FaExclamationTriangle, FaFilter 
} from 'react-icons/fa';

export default function Students({ academyId, refreshTrigger, halaqas = [] }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

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

  // جلب بيانات الطلاب من قاعدة البيانات
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

  // إضافة طالب جديد
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

  // أرشفة وتنشيط
  const toggleArchiveStudent = async (id, currentStatus) => {
    setErrorMessage('');
    const { error } = await supabase.from('students').update({ is_archived: !currentStatus }).eq('id', id);
    if (error) {
      setErrorMessage(trans('archiveError', 'فشلت عملية نقل سجل الطالب للأرشيف', 'Failed to change student archive status'));
    } else {
      setStudentsList(prev => prev.filter(s => s.id !== id));
    }
  };

  // تصفية الفلترة السريعة
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

  // إحصائيات سريعة
  const stats = useMemo(() => {
    const total = studentsList.length;
    const unassigned = studentsList.filter(s => !s.halaqa_id).length;
    const males = studentsList.filter(s => s.gender === 'male').length;
    const females = studentsList.filter(s => s.gender === 'female').length;
    return { total, unassigned, males, females };
  }, [studentsList]);

  // فتح مراسلة واتساب
  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(isRtl ? `السلام عليكم ورحمة الله، بشأن الطالب: ${name}` : `Hello, regarding student: ${name}`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* 1. رأس الصفحة */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: C.gold, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUserGraduate /> {trans('studentsManagement', 'إدارة شؤون الطلاب والدارسين', 'Students Management')}
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
            {trans('studentsSubHeading', 'متابعة بيانات الطلاب، الحلقات المنتسبين إليها، وتحديث الحالة الحفظية', 'Manage student records, assigned halaqas, and quranic progress')}
          </p>
        </div>
      </div>

      {/* تنبيه الأخطاء */}
      {errorMessage && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><FaExclamationTriangle style={{ marginLeft: '6px' }} /> {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✖</button>
        </div>
      )}

      {/* 2. بطاقات الإحصائيات الذكية */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <Card style={{ padding: '14px', background: '#162030', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{trans('totalDisplayCount', 'العدد المعروض', 'Displayed Total')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>{stats.total}</div>
        </Card>

        <Card style={{ padding: '14px', background: '#162030', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{trans('unassignedCount', 'بدون حلقة حالياً', 'Unassigned')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: stats.unassigned > 0 ? '#f59e0b' : '#10b981', marginTop: '4px' }}>{stats.unassigned}</div>
        </Card>

        <Card style={{ padding: '14px', background: '#162030', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{trans('malesCount', 'الطلاب الذكور', 'Male Students')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#60a5fa', marginTop: '4px' }}>{stats.males}</div>
        </Card>

        <Card style={{ padding: '14px', background: '#162030', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{trans('femalesCount', 'الطالبات الإناث', 'Female Students')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#f472b6', marginTop: '4px' }}>{stats.females}</div>
        </Card>
      </div>

      {/* 3. أزرار الإجراءات الرئيسية */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
        <button 
          onClick={() => setShowStudentForm(!showStudentForm)} 
          style={{ 
            flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
            background: showStudentForm ? '#1e293b' : C.gold, 
            color: showStudentForm ? '#fff' : '#0f172a', fontWeight: '800', 
            cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
          }}
        >
          {showStudentForm ? trans('closeForm', 'إغلاق الاستمارة ✖', 'Close Form ✖') : <><FaUserPlus /> {trans('addNewStudent', 'إضافة طالب جديد للمنظومة', 'Add New Student')}</>}
        </button>

        <button 
          onClick={() => setStudentViewMode(studentViewMode === 'active' ? 'archive' : 'active')} 
          style={{ 
            flex: 1, padding: '14px', borderRadius: '12px', 
            border: `1px solid ${studentViewMode === 'active' ? '#ef4444' : C.gold}`, 
            background: studentViewMode === 'active' ? 'transparent' : '#ef4444', 
            color: studentViewMode === 'active' ? '#ef4444' : '#fff', fontWeight: '800', 
            cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
          }}
        >
          <FaArchive /> {studentViewMode === 'active' ? trans('viewArchive', 'عرض أرشيف الطلاب', 'View Students Archive') : trans('viewActive', 'عرض الطلاب النشطين', 'View Active Students')}
        </button>
      </div>

      {/* 4. استمارة الإضافة والتعديل */}
      {showStudentForm && (
        <Card style={{ padding: '24px', marginBottom: '24px', border: `1px solid ${C.gold}` }}>
          <h3 style={{ color: C.gold, margin: '0 0 16px 0', fontSize: '16px' }}>{trans('formAddStudentHeader', 'بيانات تسجيل طالب جديد', 'New Student Information')}</h3>
          <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>*{trans('lblFullName', 'اسم الطالب بالكامل', 'Student Full Name')}</label>
              <input type="text" required value={studentFormData.name} onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ color: C.gold, fontSize: '14px', fontWeight: '700' }}>{trans('lblStudentHalaqa', 'تنسيب وتعيين الحلقة القرآنية', 'Assign Quranic Halaqa')}</label>
              <select value={studentFormData.halaqa_id} onChange={(e) => setStudentFormData({...studentFormData, halaqa_id: e.target.value})} style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}>
                <option value="">{trans('unassignedHalaqaOption', '🚫 بدون حلقة حالياً', 'No Halaqa Assigned')}</option>
                {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
              </select>
            </div>

            {/* محدد مستوى القرآن */}
            <div style={{ background: '#162030', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <QuranProgressSelector 
                initialIndex={studentFormData.quarter_index}
                onIndexChange={(newIndex) => setStudentFormData({ ...studentFormData, quarter_index: newIndex })}
              />
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
                <input type="tel" required value={studentFormData.parent_phone} onChange={(e) => setStudentFormData({...studentFormData, parent_phone: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', textAlign: 'left' }} />
              </div>
            </div>

            <button type="submit" style={{ padding: '14px', borderRadius: '10px', border: 'none', background: C.gold, color: '#0f172a', fontWeight: '800', cursor: 'pointer', marginTop: '6px' }}>
              {trans('btnConfirmAdd', 'تأكيد وحفظ بيانات الطالب 🚀', 'Save Student 🚀')}
            </button>
          </form>
        </Card>
      )}

      {/* 5. شريط التصفية والبحث المتقدم */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder={trans('phSearchStudent', 'ابحث باسم الطالب أو رقم الهاتف...', 'Search by student name or phone...')} 
            value={studentSearch} 
            onChange={(e) => setStudentSearch(e.target.value)} 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
          />
        </div>

        <select 
          value={selectedHalaqaFilter} 
          onChange={(e) => setSelectedHalaqaFilter(e.target.value)}
          style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}
        >
          <option value="all">📂 {trans('allHalaqasFilter', 'جميع الحلقات', 'All Halaqas')}</option>
          <option value="unassigned">🚫 {trans('unassignedOnly', 'بدون حلقة فقط', 'Unassigned Only')}</option>
          {halaqas.map(h => <option key={h.id} value={h.id}>🔹 {isRtl ? h.name_ar : h.name_en}</option>)}
        </select>

        <select 
          value={selectedGenderFilter} 
          onChange={(e) => setSelectedGenderFilter(e.target.value)}
          style={{ padding: '12px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff' }}
        >
          <option value="all">👥 {trans('allGendersFilter', 'جميع الجنسين', 'All Genders')}</option>
          <option value="male">🧑 {trans('malesOnly', 'الذكور', 'Males')}</option>
          <option value="female">👧 {trans('femalesOnly', 'الإناث', 'Females')}</option>
        </select>
      </div>

      {/* 6. قائمة الجدول والبطاقات */}
      <Card style={{ padding: 0, background: 'transparent' }}>
        {studentLoading ? (
          <p style={{ color: C.gold, textAlign: 'center', padding: '30px' }}>⚡ {trans('loadingData', 'جاري جيل بيانات الطلاب...', 'Loading students...')}</p>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#162030', borderRadius: '12px', border: '1px dashed #334155' }}>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>{trans('noStudentsFound', 'لم يتم العثور على نتائج مطابقة للبحث', 'No students match your criteria')}</p>
          </div>
        ) : !isMobile ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #334155', background: '#162030' }}>
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
                  <tr key={student.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <TD>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>{student.name}</div>
                      <div style={{ fontSize: '11px', color: matchedHalaqa ? C.gold : '#f59e0b', marginTop: '2px' }}>
                        📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassignedHalaqaText', 'غير مدرج بحلقة', 'Unassigned')}
                      </div>
                    </TD>
                    <TD><Badge color={student.gender === 'male' ? 'blue' : 'pink'}>{student.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge></TD>
                    <TD>
                      <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{student.parent_name || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22c55e', direction: 'ltr', marginTop: '2px' }}>
                        <span style={{ color: '#94a3b8' }}>{student.parent_phone}</span>
                        {student.parent_phone && (
                          <button onClick={() => openWhatsApp(student.parent_phone, student.name)} title="واتساب" style={{ background: 'transparent', border: 'none', color: '#22c55e', cursor: 'pointer', padding: 0 }}>
                            <FaWhatsapp size={15} />
                          </button>
                        )}
                      </div>
                    </TD>
                    <TD><Badge color="orange">{student.subscription_system}</Badge></TD>
                    <TD>
                      <Btn onClick={() => toggleArchiveStudent(student.id, student.is_archived)} color={student.is_archived ? 'green' : 'red'}>
                        {student.is_archived ? 'تنشيط ⚡' : 'أرشفة 📦'}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: matchedHalaqa ? C.gold : '#f59e0b', marginTop: '2px' }}>
                        📢 {matchedHalaqa ? (isRtl ? matchedHalaqa.name_ar : matchedHalaqa.name_en) : trans('unassignedHalaqaText', 'غير مدرج بحلقة', 'Unassigned')}
                      </div>
                    </div>
                    <Badge color={student.gender === 'male' ? 'blue' : 'pink'}>{student.gender === 'male' ? '🧑' : '👧'}</Badge>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                    <button 
                      onClick={() => openWhatsApp(student.parent_phone, student.name)}
                      style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <FaWhatsapp /> واتساب
                    </button>
                    
                    <Btn onClick={() => toggleArchiveStudent(student.id, student.is_archived)} color={student.is_archived ? 'green' : 'red'}>
                      {student.is_archived ? 'تنشيط ⚡' : 'أرشفة 📦'}
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
