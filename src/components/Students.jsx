import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { C } from '../constants/colors';
import { Btn, Card, Input, Select, PageHeader } from '../components/UI';
import { 
  FaUserPlus, FaFileExcel, FaBoxArchive, FaSearch, 
  FaUserGraduate, FaVenus, FaMars, FaLayerGroup, 
  FaEye, FaBoxArchive, FaWhatsapp, FaBookOpen 
} from 'react-icons/fa6';

export default function StudentsList() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // الحالات الرئيسية
  const [students, setStudents] = useState([]);
  const [halaqas, setHalaqas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // الفلاتر
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHalaqa, setSelectedHalaqa] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active'); // active | archived

  // 1. جلب البيانات من Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب الحلقات للفلاتر
      const { data: halaqasData } = await supabase
        .from('halaqas')
        .select('id, name_ar, name_en');
      if (halaqasData) setHalaqas(halaqasData);

      // جلب الطلاب مع بيانات الحلقة
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          *,
          halaqas ( id, name_ar, name_en )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (studentsData) setStudents(studentsData);

    } catch (err) {
      console.error('Error fetching students list:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. تصفية الطلاب حسب خيارات البحث والتصفية
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // فلتر الأرشيف / النشط
      if (selectedStatus === 'active' && student.status === 'archived') return false;
      if (selectedStatus === 'archived' && student.status !== 'archived') return false;

      // فلتر الحلقة
      if (selectedHalaqa === 'no_halaqa' && student.halaqa_id) return false;
      if (selectedHalaqa !== 'all' && selectedHalaqa !== 'no_halaqa' && student.halaqa_id !== selectedHalaqa) return false;

      // فلتر الجنس
      if (selectedGender !== 'all' && student.gender !== selectedGender) return false;

      // فلتر البحث بالاسم أو الهاتف
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = student.name?.toLowerCase().includes(query);
        const matchPhone = student.parent_phone?.includes(query);
        const matchCode = student.student_code?.toLowerCase().includes(query);
        return matchName || matchPhone || matchCode;
      }

      return true;
    });
  }, [students, selectedStatus, selectedHalaqa, selectedGender, searchTerm]);

  // 3. حساب الإحصائيات الحقيقية
  const stats = useMemo(() => {
    const activeList = students.filter(s => s.status !== 'archived');
    return {
      displayed: filteredStudents.length,
      noHalaqa: activeList.filter(s => !s.halaqa_id).length,
      males: activeList.filter(s => s.gender === 'male').length,
      females: activeList.filter(s => s.gender === 'female').length,
    };
  }, [students, filteredStudents]);

  // تغيير حالة الأرشفة للطالب
  const handleToggleArchive = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
    try {
      const { error } = await supabase
        .from('students')
        .update({ status: newStatus })
        .eq('id', studentId);

      if (error) throw error;
      
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
    } catch (err) {
      console.error('Error archiving student:', err);
    }
  };

  // خيارات الفلاتر مع عناوين واضحة
  const halaqaOptions = [
    { value: 'all', label: isRtl ? 'جميع الحلقات' : 'All Halaqas' },
    { value: 'no_halaqa', label: isRtl ? 'بدون حلقة' : 'Without Halaqa' },
    ...halaqas.map(h => ({
      value: h.id,
      label: isRtl ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)
    }))
  ];

  const genderOptions = [
    { value: 'all', label: isRtl ? 'الكل (ذكر / أنثى)' : 'All Genders' },
    { value: 'male', label: isRtl ? 'ذكور فقط' : 'Males Only' },
    { value: 'female', label: isRtl ? 'إناث فقط' : 'Females Only' }
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '12px', boxSizing: 'border-box' }}>
      
      {/* هيدر الصفحة والتحكم الرئيسي */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ color: C.gold || '#EAB308', fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', textAlign: 'start' }}>
          {isRtl ? 'إدارة شؤون الطلاب والدارسين' : 'Students Management'}
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0, textAlign: 'start' }}>
          {isRtl ? 'متابعة بيانات الطلاب، الحلقات المنتسبين إليها، وتحديث الحالة الحفظية' : 'Manage student details, halaqas, and status'}
        </p>
      </div>

      {/* أزرار الإجراءات العلوية */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <Btn 
          variant={selectedStatus === 'archived' ? 'warning' : 'ghost'} 
          onClick={() => setSelectedStatus(prev => prev === 'active' ? 'archived' : 'active')}
          style={{ padding: '8px 4px', fontSize: '11px', borderRadius: '10px' }}
        >
          <FaArchive /> {selectedStatus === 'active' ? (isRtl ? 'الأرشيف' : 'Archive') : (isRtl ? 'النشطين' : 'Active')}
        </Btn>

        <Btn 
          variant="primary" 
          onClick={() => navigate('/students/new')}
          style={{ padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', borderRadius: '10px', background: C.gold, color: '#000' }}
        >
          <FaUserPlus /> {isRtl ? 'إضافة طالب' : 'Add Student'}
        </Btn>

        <Btn 
          variant="ghost" 
          onClick={() => alert(isRtl ? 'جاري تصدير الملف...' : 'Exporting...')}
          style={{ padding: '8px 4px', fontSize: '11px', borderRadius: '10px' }}
        >
          <FaFileExcel style={{ color: '#10B981' }} /> {isRtl ? 'تصدير' : 'Export'}
        </Btn>
      </div>

      {/* بطاقات الإحصائيات (KPI Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <div style={{ background: '#0F172A', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{isRtl ? 'العدد المعروض' : 'Displayed'}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{stats.displayed}</div>
          </div>
          <FaUserGraduate style={{ color: C.gold, fontSize: '20px', opacity: 0.8 }} />
        </div>

        <div style={{ background: '#0F172A', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{isRtl ? 'بدون حلقة' : 'No Halaqa'}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F59E0B' }}>{stats.noHalaqa}</div>
          </div>
          <FaLayerGroup style={{ color: '#F59E0B', fontSize: '20px', opacity: 0.8 }} />
        </div>

        <div style={{ background: '#0F172A', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{isRtl ? 'ذكور' : 'Males'}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3B82F6' }}>{stats.males}</div>
          </div>
          <FaMars style={{ color: '#3B82F6', fontSize: '20px', opacity: 0.8 }} />
        </div>

        <div style={{ background: '#0F172A', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{isRtl ? 'إناث' : 'Females'}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#EC4899' }}>{stats.females}</div>
          </div>
          <FaVenus style={{ color: '#EC4899', fontSize: '20px', opacity: 0.8 }} />
        </div>
      </div>

      {/* قسم البحث والتصفية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <Input 
          placeholder={isRtl ? 'ابحث باسم الطالب أو الهاتف...' : 'Search by name or phone...'} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 0 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Select 
            label={isRtl ? 'تصفية بالحلقة' : 'Halaqa Filter'} 
            value={selectedHalaqa} 
            onChange={(e) => setSelectedHalaqa(e.target.value)}
            options={halaqaOptions}
            style={{ marginBottom: 0 }}
          />

          <Select 
            label={isRtl ? 'تصفية بالجنس' : 'Gender Filter'} 
            value={selectedGender} 
            onChange={(e) => setSelectedGender(e.target.value)}
            options={genderOptions}
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>

      {/* قائمة الطلاب */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
          ⏳ {isRtl ? 'جاري تحميل قائمة الطلاب...' : 'Loading students...'}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>
          {isRtl ? 'لم يتم العثور على نتائج مطابقة' : 'No matching students found'}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredStudents.map(student => (
            <Card key={student.id} style={{ padding: '12px', border: `1px solid ${C.border}`, borderRadius: '12px', background: '#0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                
                {/* رمز جنس الطالب */}
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: student.gender === 'female' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: `1px solid ${student.gender === 'female' ? '#EC4899' : '#3B82F6'}` }}>
                  {student.gender === 'female' ? '🧕' : '🙋‍♂️'}
                </div>

                {/* التفاصيل الأساسية */}
                <div style={{ flex: 1, textAlign: 'start' }}>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{student.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', marginTop: '3px' }}>
                    <span style={{ color: student.halaqas ? C.gold : '#EF4444', fontWeight: 'bold' }}>
                      📢 {student.halaqas ? (isRtl ? student.halaqas.name_ar : student.halaqas.name_en) : (isRtl ? 'بدون حلقة' : 'No Halaqa')}
                    </span>
                    {student.current_juz && (
                      <span style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        • <FaBookOpen style={{ color: '#10B981' }} /> {isRtl ? `الجزء ${student.current_juz}` : `Juz ${student.current_juz}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* زر واتساب إن وجد */}
                {student.parent_phone && (
                  <a 
                    href={`https://wa.me/${student.parent_phone.replace(/\+/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                  >
                    <FaWhatsapp size={16} />
                  </a>
                )}
              </div>

              {/* أزرار الإجراءات السريعة */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Btn 
                  variant="ghost" 
                  onClick={() => navigate(`/students/${student.id}`)}
                  style={{ flex: 2, padding: '6px 12px', fontSize: '12px', background: C.surface, color: '#fff', border: `1px solid ${C.border}` }}
                >
                  <FaEye /> {isRtl ? 'التفاصيل' : 'Details'}
                </Btn>
                
                <Btn 
                  variant="ghost" 
                  onClick={() => handleToggleArchive(student.id, student.status)}
                  style={{ flex: 1, padding: '6px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                  <FaBoxArchive /> {student.status === 'archived' ? (isRtl ? 'إعادة' : 'Restore') : (isRtl ? 'أرشفة' : 'Archive')}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
