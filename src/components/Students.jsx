import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { C } from '../constants/colors'; // تأكد من مسار الألوان الخاص بك
import { Btn, Input, Select } from './UI'; // تأكد من مسار مكونات الواجهة
import { 
  FaUserPlus, FaFileExcel, FaBoxArchive, 
  FaUserGraduate, FaVenus, FaMars, FaLayerGroup, 
  FaEye, FaWhatsapp, FaBookOpen 
} from 'react-icons/fa6';

export default function StudentsList() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // State Management
  const [students, setStudents] = useState([]);
  const [halaqas, setHalaqas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHalaqa, setSelectedHalaqa] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: halaqasData } = await supabase
        .from('halaqas')
        .select('id, name_ar, name_en');
      if (halaqasData) setHalaqas(halaqasData);

      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`*, halaqas ( id, name_ar, name_en )`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (studentsData) setStudents(studentsData);

    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Advanced Filtering Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // 1. Status Filter
      if (selectedStatus === 'active' && student.status === 'archived') return false;
      if (selectedStatus === 'archived' && student.status !== 'archived') return false;

      // 2. Halaqa Filter
      if (selectedHalaqa === 'no_halaqa' && student.halaqa_id) return false;
      if (selectedHalaqa !== 'all' && selectedHalaqa !== 'no_halaqa' && student.halaqa_id !== selectedHalaqa) return false;

      // 3. Gender Filter
      if (selectedGender !== 'all' && student.gender !== selectedGender) return false;

      // 4. Search Filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        return (
          student.name?.toLowerCase().includes(query) || 
          student.parent_phone?.includes(query)
        );
      }

      return true;
    });
  }, [students, selectedStatus, selectedHalaqa, selectedGender, searchTerm]);

  // Real-time Statistics based on current view
  const stats = useMemo(() => {
    return {
      displayed: filteredStudents.length,
      noHalaqa: filteredStudents.filter(s => !s.halaqa_id).length,
      males: filteredStudents.filter(s => s.gender === 'male').length,
      females: filteredStudents.filter(s => s.gender === 'female').length,
    };
  }, [filteredStudents]);

  // Action: Toggle Archive
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
      console.error('Error updating status:', err);
    }
  };

  // Filter Options
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
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: '640px', margin: '0 auto', padding: '16px', boxSizing: 'border-box' }}>
      
      {/* 1. Header Section */}
      <div style={{ marginBottom: '24px', textAlign: 'start' }}>
        <h1 style={{ color: '#EAB308', fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          {isRtl ? 'إدارة شؤون الطلاب والدارسين' : 'Students Management'}
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
          {isRtl ? 'متابعة بيانات الطلاب، الحلقات المنتسبين إليها، وتحديث الحالة الحفظية' : 'Manage student details, halaqas, and memorization status'}
        </p>
      </div>

      {/* 2. Top Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <Btn 
          variant={selectedStatus === 'archived' ? 'warning' : 'ghost'} 
          onClick={() => setSelectedStatus(prev => prev === 'active' ? 'archived' : 'active')}
          style={{ padding: '10px 4px', fontSize: '12px', borderRadius: '12px', background: selectedStatus === 'archived' ? 'rgba(245, 158, 11, 0.15)' : '#1E293B', color: selectedStatus === 'archived' ? '#F59E0B' : '#CBD5E1', border: `1px solid ${selectedStatus === 'archived' ? 'rgba(245, 158, 11, 0.3)' : '#334155'}` }}
        >
          <FaBoxArchive /> {selectedStatus === 'active' ? (isRtl ? 'الأرشيف' : 'Archive') : (isRtl ? 'النشطين' : 'Active')}
        </Btn>

        <Btn 
          variant="primary" 
          onClick={() => navigate('/students/new')}
          style={{ padding: '10px 4px', fontSize: '13px', fontWeight: 'bold', borderRadius: '12px', background: '#EAB308', color: '#111827', border: 'none', boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)' }}
        >
          <FaUserPlus size={16} /> {isRtl ? 'إضافة طالب جديد' : 'Add New Student'}
        </Btn>

        <Btn 
          variant="ghost" 
          onClick={() => alert(isRtl ? 'جاري التصدير...' : 'Exporting...')}
          style={{ padding: '10px 4px', fontSize: '12px', borderRadius: '12px', background: '#1E293B', color: '#10B981', border: '1px solid #334155' }}
        >
          <FaFileExcel size={14} /> {isRtl ? 'تصدير' : 'Export'}
        </Btn>
      </div>

      {/* 3. KPI Statistics Cards (Modern Design) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        
        <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '500' }}>{isRtl ? 'العدد المعروض' : 'Displayed'}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#F8FAFC' }}>{stats.displayed}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <FaUserGraduate style={{ color: '#EAB308', fontSize: '20px' }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '500' }}>{isRtl ? 'بدون حلقة' : 'No Halaqa'}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#F59E0B' }}>{stats.noHalaqa}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaLayerGroup style={{ color: '#F59E0B', fontSize: '20px' }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '500' }}>{isRtl ? 'ذكور' : 'Males'}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#3B82F6' }}>{stats.males}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaMars style={{ color: '#3B82F6', fontSize: '22px' }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '500' }}>{isRtl ? 'إناث' : 'Females'}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#EC4899' }}>{stats.females}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaVenus style={{ color: '#EC4899', fontSize: '22px' }} />
          </div>
        </div>
      </div>

      {/* 4. Search and Filters */}
      <div style={{ background: '#1E293B', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #334155' }}>
        <Input 
          placeholder={isRtl ? '🔍 ابحث باسم الطالب أو الهاتف...' : '🔍 Search by name or phone...'} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '12px', background: '#0F172A', border: '1px solid #334155', padding: '12px', borderRadius: '10px' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Select 
            label={isRtl ? 'تصفية بالحلقة' : 'Filter by Halaqa'} 
            value={selectedHalaqa} 
            onChange={(e) => setSelectedHalaqa(e.target.value)}
            options={halaqaOptions}
            style={{ marginBottom: 0, background: '#0F172A' }}
          />

          <Select 
            label={isRtl ? 'تصفية بالجنس' : 'Filter by Gender'} 
            value={selectedGender} 
            onChange={(e) => setSelectedGender(e.target.value)}
            options={genderOptions}
            style={{ marginBottom: 0, background: '#0F172A' }}
          />
        </div>
      </div>

      {/* 5. Students List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '15px' }}>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>⏳</span>
          {isRtl ? 'جاري تحميل قائمة الطلاب...' : 'Loading students...'}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '40px 20px', textAlign: 'center', borderRadius: '16px', border: '1px dashed #334155' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📭</div>
          <div style={{ color: '#CBD5E1', fontSize: '15px', fontWeight: 'bold' }}>
            {isRtl ? 'لم يتم العثور على نتائج مطابقة' : 'No matching results found'}
          </div>
          <div style={{ color: '#64748B', fontSize: '13px', marginTop: '6px' }}>
            {isRtl ? 'حاول تغيير كلمات البحث أو الفلاتر' : 'Try adjusting your search or filters'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredStudents.map(student => (
            <div key={student.id} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '16px', transition: 'transform 0.2s ease', position: 'relative', overflow: 'hidden' }}>
              
              {/* شريط جانبي صغير للدلالة على حالة الأرشفة */}
              {student.status === 'archived' && (
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', background: '#EF4444' }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                
                {/* Avatar */}
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: student.gender === 'female' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${student.gender === 'female' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(59, 130, 246, 0.3)'}` }}>
                  {student.gender === 'female' ? '🧕' : '🙋‍♂️'}
                </div>

                {/* Details */}
                <div style={{ flex: 1, textAlign: 'start' }}>
                  <div style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {student.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: student.halaqas ? '#EAB308' : '#EF4444', background: student.halaqas ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                      📢 {student.halaqas ? (isRtl ? student.halaqas.name_ar : student.halaqas.name_en) : (isRtl ? 'بدون حلقة' : 'No Halaqa')}
                    </span>
                    
                    <span style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaBookOpen style={{ color: '#10B981' }} /> {isRtl ? `الجزء ${student.current_juz || 1}` : `Juz ${student.current_juz || 1}`}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Button */}
                {student.parent_phone && (
                  <a 
                    href={`https://wa.me/${student.parent_phone.replace(/\+/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)', transition: '0.2s' }}
                  >
                    <FaWhatsapp size={20} />
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <Btn 
                  variant="ghost" 
                  onClick={() => navigate(`/students/${student.id}`)}
                  style={{ flex: 1, padding: '10px', fontSize: '13px', background: '#0F172A', color: '#EAB308', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '10px' }}
                >
                  <FaEye size={14} /> {isRtl ? 'عرض التفاصيل' : 'View Details'}
                </Btn>
                
                <Btn 
                  variant="ghost" 
                  onClick={() => handleToggleArchive(student.id, student.status)}
                  style={{ padding: '10px 16px', fontSize: '13px', background: 'transparent', color: student.status === 'archived' ? '#10B981' : '#64748B', border: '1px solid #334155', borderRadius: '10px' }}
                >
                  <FaBoxArchive /> {student.status === 'archived' ? (isRtl ? 'إستعادة' : 'Restore') : (isRtl ? 'أرشفة' : 'Archive')}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
