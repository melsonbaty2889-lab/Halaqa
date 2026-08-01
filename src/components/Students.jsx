import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { 
  FaUserPlus, FaFileExcel, FaBoxArchive, 
  FaUserGraduate, FaVenus, FaMars, FaLayerGroup, 
  FaEye, FaWhatsapp, FaBookOpen, FaRotateLeft
} from 'react-icons/fa6';

export default function StudentsList() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [students, setStudents] = useState([]);
  const [halaqas, setHalaqas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHalaqa, setSelectedHalaqa] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');

  useEffect(() => {
    fetchData();
  }, []);

  // 🛠️ دالة مساعدة لاستخراج الاسم النصي سواء كان JSON أو String
  const formatName = (nameData) => {
    if (!nameData) return '';
    if (typeof nameData === 'string') return nameData;
    if (typeof nameData === 'object') {
      return isRtl 
        ? (nameData.ar || nameData.en || nameData.full_name || Object.values(nameData)[0] || '')
        : (nameData.en || nameData.ar || nameData.full_name || Object.values(nameData)[0] || '');
    }
    return String(nameData);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. جلب الحلقات باستخدام حقل name الجيسون الصحيح
      const { data: halaqasData } = await supabase
        .from('halaqas')
        .select('id, name');
      if (halaqasData) setHalaqas(halaqasData);

      // 2. جلب الطلاب مع بيانات الحلقة المرتبطة
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`*, halaqas ( id, name )`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(studentsData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check gender safely
  const checkIsMale = (student) => {
    const g = String(student.gender || '').trim().toLowerCase();
    return g === 'male' || g === 'ذكر' || g === 'm';
  };

  const checkIsFemale = (student) => {
    const g = String(student.gender || '').trim().toLowerCase();
    return g === 'female' || g === 'أنثى' || g === 'f';
  };

  // Dynamic Filtering Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const isArchived = student.is_archived || student.status === 'archived';
      
      // Status Filter
      if (selectedStatus === 'active' && isArchived) return false;
      if (selectedStatus === 'archived' && !isArchived) return false;

      // Halaqa Filter
      if (selectedHalaqa === 'no_halaqa' && student.halaqa_id) return false;
      if (selectedHalaqa !== 'all' && selectedHalaqa !== 'no_halaqa' && String(student.halaqa_id) !== String(selectedHalaqa)) return false;

      // Gender Filter
      if (selectedGender === 'male' && !checkIsMale(student)) return false;
      if (selectedGender === 'female' && !checkIsFemale(student)) return false;

      // Search Query (استخراج الاسم النصي بأمان للبحث)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const studentDisplayName = formatName(student.name).toLowerCase();
        const matchName = studentDisplayName.includes(query);
        const matchPhone = student.parent_phone?.includes(query);
        return matchName || matchPhone;
      }

      return true;
    });
  }, [students, selectedStatus, selectedHalaqa, selectedGender, searchTerm, isRtl]);

  // Statistics Calculation
  const stats = useMemo(() => {
    return {
      displayed: filteredStudents.length,
      noHalaqa: filteredStudents.filter(s => !s.halaqa_id).length,
      males: filteredStudents.filter(checkIsMale).length,
      females: filteredStudents.filter(checkIsFemale).length,
    };
  }, [filteredStudents]);

  // Toggle Archive Action
  const handleToggleArchive = async (e, studentId, currentStatus, currentIsArchived) => {
    e.stopPropagation();
    const willBeArchived = !(currentIsArchived || currentStatus === 'archived');
    const newStatus = willBeArchived ? 'archived' : 'active';

    // Optimistic UI Update
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus, is_archived: willBeArchived } : s));

    try {
      const { error } = await supabase
        .from('students')
        .update({ status: newStatus, is_archived: willBeArchived })
        .eq('id', studentId);

      if (error) {
        console.error('Supabase Update Error:', error);
        // Rollback on failure
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: currentStatus, is_archived: currentIsArchived } : s));
        alert(isRtl ? 'حدث خطأ أثناء التحديث في قاعدة البيانات' : 'Failed to update student status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '16px', 
        color: '#F8FAFC', 
        fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F59E0B', margin: '0 0 4px 0' }}>
          {isRtl ? 'إدارة شؤون الطلاب والدارسين' : 'Students Directory'}
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          {isRtl ? 'متابعة الطلاب، الحلقات المنتسبين إليها، والحالة الحفظية' : 'Manage enrolled students, halaqas and memorization status'}
        </p>
      </div>

      {/* Main Control Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '8px', marginBottom: '20px' }}>
        
        {/* Archive Toggle Button */}
        <button
          type="button"
          onClick={() => setSelectedStatus(prev => prev === 'active' ? 'archived' : 'active')}
          style={{
            padding: '10px 6px',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            border: '1px solid',
            borderColor: selectedStatus === 'archived' ? '#F59E0B' : '#334155',
            background: selectedStatus === 'archived' ? 'rgba(245, 158, 11, 0.15)' : '#1E293B',
            color: selectedStatus === 'archived' ? '#F59E0B' : '#CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <FaBoxArchive />
          {selectedStatus === 'active' ? (isRtl ? 'الأرشيف' : 'Archive') : (isRtl ? 'النشطين' : 'Active')}
        </button>

        {/* Add Student Button */}
        <button
          type="button"
          onClick={() => navigate('/students/new')}
          style={{
            padding: '10px 8px',
            fontSize: '13px',
            fontWeight: '700',
            borderRadius: '12px',
            cursor: 'pointer',
            border: 'none',
            background: '#F59E0B',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
          }}
        >
          <FaUserPlus size={15} />
          {isRtl ? 'إضافة طالب جديد' : 'Add Student'}
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={() => alert(isRtl ? 'جاري تجهيز الملف...' : 'Exporting...')}
          style={{
            padding: '10px 6px',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            border: '1px solid #334155',
            background: '#1E293B',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <FaFileExcel size={14} />
          {isRtl ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'العدد المعروض' : 'Displayed'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#F8FAFC', marginTop: '2px' }}>{stats.displayed}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '10px', borderRadius: '10px' }}>
            <FaUserGraduate size={18} />
          </div>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'بدون حلقة' : 'No Halaqa'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#F59E0B', marginTop: '2px' }}>{stats.noHalaqa}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '10px', borderRadius: '10px' }}>
            <FaLayerGroup size={18} />
          </div>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'ذكور' : 'Males'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#3B82F6', marginTop: '2px' }}>{stats.males}</div>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '10px', borderRadius: '10px' }}>
            <FaMars size={18} />
          </div>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'إناث' : 'Females'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#EC4899', marginTop: '2px' }}>{stats.females}</div>
          </div>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', padding: '10px', borderRadius: '10px' }}>
            <FaVenus size={18} />
          </div>
        </div>
      </div>

      {/* Search & Select Filters */}
      <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', marginBottom: '20px' }}>
        <input 
          type="text"
          placeholder={isRtl ? '🔍 ابحث باسم الطالب أو رقم الهاتف...' : '🔍 Search student name or phone...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '10px',
            color: '#FFF',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: '10px'
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              {isRtl ? 'تصفية بالحلقة' : 'Halaqa'}
            </label>
            <select
              value={selectedHalaqa}
              onChange={(e) => setSelectedHalaqa(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#CBD5E1',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="all">{isRtl ? 'جميع الحلقات' : 'All Halaqas'}</option>
              <option value="no_halaqa">{isRtl ? 'بدون حلقة' : 'Without Halaqa'}</option>
              {halaqas.map(h => (
                <option key={h.id} value={h.id}>
                  {formatName(h.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              {isRtl ? 'تصفية بالجنس' : 'Gender'}
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#CBD5E1',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="all">{isRtl ? 'الكل (ذكر / أنثى)' : 'All Genders'}</option>
              <option value="male">{isRtl ? 'ذكور فقط' : 'Males Only'}</option>
              <option value="female">{isRtl ? 'إناث فقط' : 'Females Only'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '14px' }}>
          {isRtl ? 'جاري التحميل...' : 'Loading students...'}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '30px', textAlign: 'center', borderRadius: '14px', border: '1px dashed #334155' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📬</div>
          <div style={{ color: '#CBD5E1', fontSize: '14px', fontWeight: 'bold' }}>
            {isRtl ? 'لم يتم العثور على نتائج مطابقة' : 'No matching results'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredStudents.map(student => {
            const isStudentArchived = student.is_archived || student.status === 'archived';
            const studentDisplayName = formatName(student.name);
            const halaqaDisplayName = student.halaqas ? formatName(student.halaqas.name) : '';

            return (
              <div 
                key={student.id} 
                style={{ 
                  background: '#1E293B', 
                  borderRadius: '14px', 
                  padding: '14px', 
                  border: '1px solid #334155',
                  opacity: isStudentArchived ? 0.75 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: '#0F172A', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '20px',
                    border: '1px solid #334155'
                  }}>
                    {checkIsFemale(student) ? '🧕' : '👨‍🎓'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', marginBottom: '4px' }}>
                      {studentDisplayName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px' }}>
                      <span style={{ 
                        color: student.halaqas ? '#F59E0B' : '#EF4444', 
                        background: student.halaqas ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        {student.halaqas ? halaqaDisplayName : (isRtl ? 'بدون حلقة' : 'No Halaqa')}
                      </span>

                      <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaBookOpen style={{ color: '#10B981' }} /> 
                        {isRtl ? `الجزء ${student.current_juz || 1}` : `Juz ${student.current_juz || 1}`}
                      </span>
                    </div>
                  </div>

                  {student.parent_phone && (
                    <a 
                      href={`https://wa.me/${student.parent_phone.replace(/\+/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        color: '#10B981', 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <FaWhatsapp size={18} />
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/students/${student.id}`)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      background: 'rgba(245, 158, 11, 0.05)',
                      color: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaEye size={13} />
                    {isRtl ? 'عرض التفاصيل' : 'View Details'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleArchive(e, student.id, student.status, student.is_archived)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid #334155',
                      background: 'transparent',
                      color: isStudentArchived ? '#10B981' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isStudentArchived ? <FaRotateLeft size={12} /> : <FaBoxArchive size={12} />}
                    {isStudentArchived ? (isRtl ? 'استعادة' : 'Restore') : (isRtl ? 'أرشفة' : 'Archive')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
