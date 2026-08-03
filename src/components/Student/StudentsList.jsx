/* src/components/Student/StudentsList.jsx */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { 
  UserPlus, FileSpreadsheet, Archive, 
  GraduationCap, Layers, Eye, BookOpen, RotateCcw,
  Flame, Star, Search, X, MessageSquare
} from 'lucide-react';
import QuranProgressBar from '../QuranProgressBar';

export default function StudentsList({ 
  academyId, 
  students: propStudents, 
  halaqas: propHalaqas,
  setStudents: propSetStudents 
}) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const [internalStudents, setInternalStudents] = useState([]);
  const [internalHalaqas, setInternalHalaqas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const students = propStudents || internalStudents;
  const halaqas = propHalaqas || internalHalaqas;
  const setStudents = propSetStudents || setInternalStudents;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHalaqa, setSelectedHalaqa] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');

  const formatName = useCallback((nameData) => {
    if (!nameData) return '';
    if (typeof nameData === 'string') {
      try {
        const parsed = JSON.parse(nameData);
        if (typeof parsed === 'object' && parsed !== null) {
          return isRtl 
            ? (parsed.ar || parsed.en || parsed.full_name || Object.values(parsed)[0] || '')
            : (parsed.en || parsed.ar || parsed.full_name || Object.values(parsed)[0] || '');
        }
      } catch {
        return nameData;
      }
      return nameData;
    }
    if (typeof nameData === 'object') {
      return isRtl 
        ? (nameData.ar || nameData.en || nameData.full_name || Object.values(nameData)[0] || '')
        : (nameData.en || nameData.ar || nameData.full_name || Object.values(nameData)[0] || '');
    }
    return String(nameData);
  }, [isRtl]);

  const getQuranProgress = useCallback((quarterIndex) => {
    const qIndex = Math.max(0, Math.min(240, Number(quarterIndex) || 0));
    const juz = Math.min(30, Math.floor(qIndex / 8) + 1);
    const percentage = Math.round((qIndex / 240) * 100);
    return { juz, percentage, qIndex };
  }, []);

  const fetchData = useCallback(async () => {
    if (!academyId || propStudents) return;
    
    try {
      setLoading(true);
      setFetchError(null);

      const { data: halaqasData, error: halaqasErr } = await supabase
        .from('halaqas')
        .select('id, name')
        .eq('academy_id', academyId);
        
      if (halaqasErr) throw halaqasErr;
      if (halaqasData) setInternalHalaqas(halaqasData);

      const { data: studentsData, error: studentsErr } = await supabase
        .from('students')
        .select(`*, halaqas ( id, name )`)
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (studentsErr) throw studentsErr;
      setInternalStudents(studentsData || []);

    } catch (err) {
      console.error('🚨 Error fetching data:', err);
      setFetchError(isRtl ? 'حدث خطأ أثناء تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [academyId, isRtl, propStudents]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const checkIsMale = (student) => {
    const g = String(student.gender || '').trim().toLowerCase();
    return g === 'male' || g === 'ذكر' || g === 'm';
  };

  const checkIsFemale = (student) => {
    const g = String(student.gender || '').trim().toLowerCase();
    return g === 'female' || g === 'أنثى' || g === 'f';
  };

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    return students.filter(student => {
      const isArchived = student.is_archived || student.status === 'archived';
      
      if (selectedStatus === 'active' && isArchived) return false;
      if (selectedStatus === 'archived' && !isArchived) return false;

      if (selectedHalaqa === 'no_halaqa' && student.halaqa_id) return false;
      if (selectedHalaqa !== 'all' && selectedHalaqa !== 'no_halaqa' && String(student.halaqa_id) !== String(selectedHalaqa)) return false;

      if (selectedGender === 'male' && !checkIsMale(student)) return false;
      if (selectedGender === 'female' && !checkIsFemale(student)) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const studentDisplayName = formatName(student.name).toLowerCase();
        const codeMatch = student.student_code ? String(student.student_code).toLowerCase().includes(query) : false;
        const matchName = studentDisplayName.includes(query);
        const matchPhone = student.parent_phone ? String(student.parent_phone).includes(query) : false;
        return matchName || matchPhone || codeMatch;
      }

      return true;
    });
  }, [students, selectedStatus, selectedHalaqa, selectedGender, searchTerm, formatName]);

  const stats = useMemo(() => {
    return {
      displayed: filteredStudents.length,
      noHalaqa: filteredStudents.filter(s => !s.halaqa_id).length,
      males: filteredStudents.filter(checkIsMale).length,
      females: filteredStudents.filter(checkIsFemale).length,
    };
  }, [filteredStudents]);

  const handleToggleArchive = async (e, studentId, currentStatus, currentIsArchived) => {
    e.stopPropagation();
    const willBeArchived = !(currentIsArchived || currentStatus === 'archived');
    const newStatus = willBeArchived ? 'archived' : 'active';

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus, is_archived: willBeArchived } : s));

    try {
      const { error } = await supabase
        .from('students')
        .update({ status: newStatus, is_archived: willBeArchived, updated_at: new Date().toISOString() })
        .eq('id', studentId);

      if (error) {
        console.error('🚨 Supabase Update Error:', error);
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: currentStatus, is_archived: currentIsArchived } : s));
        alert(isRtl ? 'حدث خطأ أثناء تحديث حالة الطالب' : 'Failed to update student status');
      }
    } catch (err) {
      console.error(err);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: currentStatus, is_archived: currentIsArchived } : s));
    }
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      style={{ 
        maxWidth: '720px', 
        margin: '0 auto', 
        padding: '16px', 
        color: '#F8FAFC', 
        fontFamily: "'Cairo', system-ui, -apple-system, sans-serif" 
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F59E0B', margin: '0 0 4px 0' }}>
          {isRtl ? 'إدارة شؤون الطلاب والدارسين' : 'Students Directory'}
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          {isRtl ? 'متابعة الطلاب، الحلقات المنتسبين إليها، والحالة الحفظية' : 'Manage enrolled students, halaqas and memorization status'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '8px', marginBottom: '20px' }}>
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
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Archive size={14} />
          {selectedStatus === 'active' ? (isRtl ? 'الأرشيف' : 'Archive') : (isRtl ? 'النشطين' : 'Active')}
        </button>

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
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          <UserPlus size={16} />
          {isRtl ? 'إضافة طالب جديد' : 'Add Student'}
        </button>

        <button
          type="button"
          onClick={() => alert(isRtl ? 'ميزة تصدير الملفات ستتوفر قريباً...' : 'Export coming soon...')}
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
          <FileSpreadsheet size={15} />
          {isRtl ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* لوحة الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '12px 14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'العدد المعروض' : 'Displayed'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#F8FAFC', marginTop: '2px' }}>{stats.displayed}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '10px', borderRadius: '10px' }}>
            <GraduationCap size={18} />
          </div>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '12px 14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'بدون حلقة' : 'No Halaqa'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#EF4444', marginTop: '2px' }}>{stats.noHalaqa}</div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px', borderRadius: '10px' }}>
            <Layers size={18} />
          </div>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '12px 14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'ذكور' : 'Males'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#3B82F6', marginTop: '2px' }}>{stats.males}</div>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
            ♂ {isRtl ? 'ذكور' : 'M'}
          </div>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '14px', padding: '12px 14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{isRtl ? 'إناث' : 'Females'}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#EC4899', marginTop: '2px' }}>{stats.females}</div>
          </div>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
            ♀ {isRtl ? 'إناث' : 'F'}
          </div>
        </div>
      </div>

      {/* البحث والتصفية */}
      <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input 
            type="text"
            placeholder={isRtl ? 'ابحث باسم الطالب، رقم الهاتف، أو كود الطالب...' : 'Search student name, phone or code...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: isRtl ? '12px 38px 12px 12px' : '12px 12px 12px 38px',
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '10px',
              color: '#FFF',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search 
            size={16}
            style={{ 
              position: 'absolute', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              [isRtl ? 'right' : 'left']: '12px', 
              color: '#64748B' 
            }} 
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                [isRtl ? 'left' : 'right']: '12px',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

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

      {/* بطاقات الطلاب */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          {isRtl ? 'جاري تحميل قائمة الطلاب...' : 'Loading students...'}
        </div>
      ) : fetchError ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '16px', borderRadius: '12px', color: '#F87171', textAlign: 'center' }}>
          {fetchError}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '40px 20px', textAlign: 'center', borderRadius: '14px', border: '1px dashed #334155' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📬</div>
          <div style={{ color: '#CBD5E1', fontSize: '14px', fontWeight: 'bold' }}>
            {isRtl ? 'لم يتم العثور على نتائج مطابقة' : 'No matching results'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredStudents.map(student => {
            const isStudentArchived = student.is_archived || student.status === 'archived';
            const studentDisplayName = formatName(student.name);
            const linkedHalaqa = student.halaqas || (Array.isArray(halaqas) ? halaqas.find(h => String(h.id) === String(student.halaqa_id)) : null);
            const halaqaDisplayName = linkedHalaqa ? formatName(linkedHalaqa.name) : '';
            const { juz, qIndex } = getQuranProgress(student.current_quarter_index);
            const streakDays = student.current_streak || 0;
            const points = student.points || 0;
            const cleanPhone = student.parent_phone ? String(student.parent_phone).replace(/\D/g, '') : null;

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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '12px', 
                    background: '#0F172A', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '22px',
                    border: '1px solid #334155',
                    flexShrink: 0
                  }}>
                    {checkIsFemale(student) ? '🧕' : '👨‍🎓'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {studentDisplayName}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {streakDays > 0 && (
                          <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '2px 6px', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Flame size={12} /> {streakDays}d
                          </span>
                        )}
                        {points > 0 && (
                          <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Star size={11} /> {points}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px', fontSize: '11px' }}>
                      <span style={{ 
                        color: linkedHalaqa ? '#F59E0B' : '#EF4444', 
                        background: linkedHalaqa ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        {linkedHalaqa ? halaqaDisplayName : (isRtl ? 'بدون حلقة' : 'No Halaqa')}
                      </span>

                      <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={13} style={{ color: '#10B981' }} /> 
                        {isRtl ? `الجزء ${juz}` : `Juz ${juz}`}
                      </span>
                    </div>
                  </div>

                  {cleanPhone && (
                    <a 
                      href={`https://wa.me/${cleanPhone}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      title={isRtl ? 'تواصل عبر واتساب' : 'WhatsApp Contact'}
                      style={{ 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        color: '#10B981', 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        textDecoration: 'none',
                        flexShrink: 0
                      }}
                    >
                      <MessageSquare size={17} />
                    </a>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <QuranProgressBar currentQuarterIndex={qIndex} showDetails={true} />
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
                    <Eye size={14} />
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
                    {isStudentArchived ? <RotateCcw size={13} /> : <Archive size={13} />}
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
