/* src/components/Student/StudentsList.jsx */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, FileSpreadsheet, Archive, 
  Search, X, Eye, BookOpen, Flame, Star, 
  MessageSquare, MoreVertical, Edit3, ArrowRightLeft, RotateCcw 
} from 'lucide-react';

import AddStudentModal from '@/components/Student/AddStudentModal';
import QuranProgressBar from '@/components/QuranProgress/QuranProgressBar';
import { formatName } from '@/utils/formatters';

export default function StudentsList({ 
  academyId, 
  students: propStudents, 
  halaqas: propHalaqas,
  setStudents: propSetStudents,
  onEditStudent
}) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const [internalStudents, setInternalStudents] = useState([]);
  const [internalHalaqas, setInternalHalaqas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transferStudent, setTransferStudent] = useState(null);
  const [selectedNewHalaqa, setSelectedNewHalaqa] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const students = propStudents || internalStudents;
  const halaqas = propHalaqas || internalHalaqas;
  const setStudents = propSetStudents || setInternalStudents;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHalaqa, setSelectedHalaqa] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');

  const getQuranProgress = useCallback((quarterIndex) => {
    const qIndex = Math.max(0, Math.min(240, Number(quarterIndex) || 0));
    const juz = Math.min(30, Math.floor(qIndex / 8) + 1);
    return { juz, qIndex };
  }, []);

  const fetchData = useCallback(async () => {
    if (!academyId || propStudents) return;
    try {
      setLoading(true);
      const { data: halaqasData } = await supabase.from('halaqas').select('id, name').eq('academy_id', academyId);
      if (halaqasData) setInternalHalaqas(halaqasData);

      const { data: studentsData } = await supabase
        .from('students')
        .select(`*, student_halaqas ( status, halaqas ( id, name ) )`)
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      const formatted = (studentsData || []).map(student => {
        const activeSH = Array.isArray(student.student_halaqas) ? student.student_halaqas.find(sh => sh.status === 'active') : null;
        const linkedHalaqa = activeSH?.halaqas || null;
        return { ...student, halaqa_id: linkedHalaqa?.id || student.halaqa_id || null, halaqas: linkedHalaqa };
      });

      setInternalStudents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [academyId, propStudents]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const checkIsMale = (s) => ['male', 'ذكر', 'm'].includes(String(s.gender || '').trim().toLowerCase());
  const checkIsFemale = (s) => ['female', 'أنثى', 'f'].includes(String(s.gender || '').trim().toLowerCase());

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
        const q = searchTerm.toLowerCase().trim();
        const matchName = formatName(student.name, isRtl ? 'ar' : 'en').toLowerCase().includes(q);
        const matchCode = student.student_code ? String(student.student_code).toLowerCase().includes(q) : false;
        const matchPhone = student.parent_phone ? String(student.parent_phone).includes(q) : false;
        return matchName || matchPhone || matchCode;
      }
      return true;
    });
  }, [students, selectedStatus, selectedHalaqa, selectedGender, searchTerm, isRtl]);

  const handleToggleArchive = async (e, studentId, currentStatus, currentIsArchived) => {
    if (e) e.stopPropagation();
    const willBeArchived = !(currentIsArchived || currentStatus === 'archived');
    const newStatus = willBeArchived ? 'archived' : 'active';

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus, is_archived: willBeArchived } : s));
    await supabase.from('students').update({ status: newStatus, is_archived: willBeArchived, updated_at: new Date().toISOString() }).eq('id', studentId);
  };

  const handleConfirmTransfer = async () => {
    if (!transferStudent) return;
    try {
      setTransferLoading(true);
      const newHalaqaObj = halaqas.find(h => String(h.id) === String(selectedNewHalaqa));
      await supabase.from('students').update({ halaqa_id: selectedNewHalaqa || null, updated_at: new Date().toISOString() }).eq('id', transferStudent.id);

      setStudents(prev => prev.map(s => s.id === transferStudent.id ? { ...s, halaqa_id: selectedNewHalaqa || null, halaqas: newHalaqaObj || null } : s));
      setTransferStudent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '720px', margin: '0 auto', padding: '16px', color: '#F8FAFC', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* 🏷️ الرأس */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F59E0B', margin: '0 0 4px 0' }}>
          {isRtl ? 'إدارة شؤون الطلاب والدارسين' : 'Students Directory'}
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          {isRtl ? 'متابعة الطلاب، الحلقات المنتسبين إليها، والحالة الحفظية' : 'Manage enrolled students, halaqas and memorization status'}
        </p>
      </div>

      {/* 🔘 الأزرار العلوية */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <button type="button" onClick={() => setSelectedStatus(prev => prev === 'active' ? 'archived' : 'active')} style={{ padding: '10px 6px', fontSize: '12px', fontWeight: '600', borderRadius: '12px', cursor: 'pointer', border: '1px solid', borderColor: selectedStatus === 'archived' ? '#F59E0B' : '#334155', background: selectedStatus === 'archived' ? 'rgba(245, 158, 11, 0.15)' : '#1E293B', color: selectedStatus === 'archived' ? '#F59E0B' : '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Archive size={14} /> {selectedStatus === 'active' ? (isRtl ? 'الأرشيف' : 'Archive') : (isRtl ? 'النشطين' : 'Active')}
        </button>

        <button type="button" onClick={() => setIsAddModalOpen(true)} style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '700', borderRadius: '12px', cursor: 'pointer', border: 'none', background: '#F59E0B', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}>
          <UserPlus size={16} /> {isRtl ? 'إضافة طالب جديد' : 'Add Student'}
        </button>

        <button type="button" onClick={() => alert(isRtl ? 'ميزة التصدير ستتوفر قريباً...' : 'Export coming soon...')} style={{ padding: '10px 6px', fontSize: '12px', fontWeight: '600', borderRadius: '12px', cursor: 'pointer', border: '1px solid #334155', background: '#1E293B', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <FileSpreadsheet size={15} /> {isRtl ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* 🔍 البحث والفلترة */}
      <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input type="text" placeholder={isRtl ? 'ابحث باسم الطالب، رقم الهاتف، أو كود الطالب...' : 'Search student name, phone or code...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: isRtl ? '12px 38px 12px 12px' : '12px 12px 12px 38px', background: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '12px', color: '#64748B' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'left' : 'right']: '12px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={15} /></button>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <select value={selectedHalaqa} onChange={(e) => setSelectedHalaqa(e.target.value)} style={{ padding: '10px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#CBD5E1', fontSize: '12px' }}>
            <option value="all">{isRtl ? 'جميع الحلقات' : 'All Halaqas'}</option>
            <option value="no_halaqa">{isRtl ? 'بدون حلقة' : 'Without Halaqa'}</option>
            {halaqas.map(h => <option key={h.id} value={h.id}>{formatName(h.name, isRtl ? 'ar' : 'en')}</option>)}
          </select>

          <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} style={{ padding: '10px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#CBD5E1', fontSize: '12px' }}>
            <option value="all">{isRtl ? 'الكل (ذكر / أنثى)' : 'All Genders'}</option>
            <option value="male">{isRtl ? 'ذكور فقط' : 'Males Only'}</option>
            <option value="female">{isRtl ? 'إناث فقط' : 'Females Only'}</option>
          </select>
        </div>
      </div>

      {/* 📋 قائمة البطاقات */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>⏳ {isRtl ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '40px', textAlign: 'center', borderRadius: '14px', border: '1px dashed #334155', color: '#CBD5E1' }}>
          {isRtl ? 'لم يتم العثور على نتائج' : 'No results found'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredStudents.map(student => (
            <StudentItemCard 
              key={student.id}
              student={student}
              halaqas={halaqas}
              getQuranProgress={getQuranProgress}
              onToggleArchive={handleToggleArchive}
              onOpenTransferModal={(s) => { setTransferStudent(s); setSelectedNewHalaqa(s.halaqa_id || ''); }}
              onEditStudent={onEditStudent}
              isRtl={isRtl}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* 🚚 نافذة النقل السريع بين الحلقات */}
      {transferStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', itemsCenter: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 12px 0' }}>
              {isRtl ? `نقل الطالب: ${formatName(transferStudent.name, 'ar')}` : `Transfer Student`}
            </h3>
            <select value={selectedNewHalaqa} onChange={(e) => setSelectedNewHalaqa(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #334155', borderRadius: '10px', color: '#FFF', fontSize: '13px', marginBottom: '16px' }}>
              <option value="">{isRtl ? 'بدون حلقة (إزالة)' : 'No Halaqa'}</option>
              {halaqas.map(h => <option key={h.id} value={h.id}>{formatName(h.name, isRtl ? 'ar' : 'en')}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setTransferStudent(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: '10px', color: '#94A3B8' }}>{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button type="button" onClick={handleConfirmTransfer} disabled={transferLoading} style={{ padding: '8px 16px', background: '#F59E0B', border: 'none', borderRadius: '10px', color: '#0F172A', fontWeight: '700' }}>
                {transferLoading ? (isRtl ? 'جاري النقل...' : 'Transferring...') : (isRtl ? 'تأكيد' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ➕ استخدام نافذة إضافة طالب الموجودة لديك أصلاً */}
      <AddStudentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        halaqasList={halaqas}
        academyId={academyId}
        onStudentAdded={(newStudent) => setStudents(prev => [newStudent, ...prev])}
      />
    </div>
  );
}

// 📇 بطاقة عرض الطالب داخل القائمة
function StudentItemCard({ student, halaqas, getQuranProgress, onToggleArchive, onOpenTransferModal, onEditStudent, isRtl, navigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isStudentArchived = student.is_archived || student.status === 'archived';
  const studentName = formatName(student.name, isRtl ? 'ar' : 'en');
  const linkedHalaqa = student.halaqas || (Array.isArray(halaqas) ? halaqas.find(h => String(h.id) === String(student.halaqa_id)) : null);
  const halaqaName = linkedHalaqa ? formatName(linkedHalaqa.name, isRtl ? 'ar' : 'en') : '';
  const { juz, qIndex } = getQuranProgress(student.current_quarter_index);
  const cleanPhone = student.parent_phone ? String(student.parent_phone).replace(/\D/g, '') : null;

  return (
    <div style={{ background: '#1E293B', borderRadius: '14px', padding: '14px', border: '1px solid #334155', opacity: isStudentArchived ? 0.75 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid #334155', flexShrink: 0 }}>
          {['female', 'أنثى', 'f'].includes(String(student.gender).toLowerCase()) ? '🧕' : '👨‍🎓'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {studentName}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {student.current_streak > 0 && <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '2px 6px', borderRadius: '6px', fontWeight: '700' }}><Flame size={12} inline /> {student.current_streak}d</span>}
              {student.points > 0 && <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '6px', fontWeight: '700' }}><Star size={11} inline /> {student.points}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '11px' }}>
            <span style={{ color: linkedHalaqa ? '#F59E0B' : '#EF4444', background: linkedHalaqa ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
              {linkedHalaqa ? halaqaName : (isRtl ? 'بدون حلقة' : 'No Halaqa')}
            </span>
            <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={13} style={{ color: '#10B981' }} /> {isRtl ? `الجزء ${juz}` : `Juz ${juz}`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {cleanPhone && (
            <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <MessageSquare size={17} />
            </a>
          )}

          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: '#0F172A', border: '1px solid #334155', color: '#CBD5E1', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsMenuOpen(false)} />
                <div style={{ position: 'absolute', [isRtl ? 'left' : 'right']: 0, top: '42px', width: '160px', background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', zIndex: 50, padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate(`/students/${student.id}`); }} style={menuStyle(isRtl)}><Eye size={14} style={{ color: '#F59E0B' }} /> {isRtl ? 'التفاصيل' : 'Details'}</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); if (onEditStudent) onEditStudent(student); else navigate(`/students/${student.id}?edit=true`); }} style={menuStyle(isRtl)}><Edit3 size={14} style={{ color: '#3B82F6' }} /> {isRtl ? 'تعديل' : 'Edit'}</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); onOpenTransferModal(student); }} style={menuStyle(isRtl)}><ArrowRightLeft size={14} style={{ color: '#10B981' }} /> {isRtl ? 'نقل' : 'Transfer'}</button>
                  <button type="button" onClick={(e) => { setIsMenuOpen(false); onToggleArchive(e, student.id, student.status, student.is_archived); }} style={{ ...menuStyle(isRtl), color: isStudentArchived ? '#10B981' : '#EF4444' }}>
                    {isStudentArchived ? <RotateCcw size={14} /> : <Archive size={14} />} {isStudentArchived ? (isRtl ? 'استعادة' : 'Restore') : (isRtl ? 'أرشفة' : 'Archive')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <QuranProgressBar currentQuarterIndex={qIndex} showDetails={true} />
      </div>
    </div>
  );
}

const menuStyle = (isRtl) => ({
  width: '100%',
  padding: '8px 10px',
  background: 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: '#CBD5E1',
  fontSize: '12px',
  textAlign: isRtl ? 'right' : 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});
