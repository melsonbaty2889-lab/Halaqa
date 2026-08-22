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
      console.error('🚨 Error fetching students:', err);
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
      console.error('🚨 Error transferring student:', err);
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-4 text-[#F8FAFC] font-['Cairo',sans-serif] ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold text-[#E07A00]">
          {isRtl ? 'إدارة شؤون الطلاب والدارسين' : 'Students Directory'}
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          {isRtl ? 'متابعة الطلاب، الحلقات المنتسبين إليها، والحالة الحفظية' : 'Manage enrolled students, halaqas and memorization status'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button 
          type="button" 
          onClick={() => setSelectedStatus(prev => prev === 'active' ? 'archived' : 'active')} 
          className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
            selectedStatus === 'archived' 
              ? 'border-[#E07A00] bg-[#E07A00]/15 text-[#E07A00]' 
              : 'border-[#1B2738] bg-[#0F172A] text-[#CBD5E1] hover:bg-[#1B2738]'
          }`}
        >
          <Archive className="w-3.5 h-3.5" /> 
          {selectedStatus === 'active' ? (isRtl ? 'الأرشيف' : 'Archive') : (isRtl ? 'النشطين' : 'Active')}
        </button>

        <button 
          type="button" 
          onClick={() => setIsAddModalOpen(true)} 
          className="py-2 px-2 text-xs md:text-sm font-bold rounded-xl bg-[#E07A00] text-white hover:bg-[#C66B00] flex items-center justify-center gap-1.5 shadow-lg shadow-[#E07A00]/10 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" /> 
          {isRtl ? 'إضافة طالب' : 'Add Student'}
        </button>

        <button 
          type="button" 
          onClick={() => alert(isRtl ? 'ميزة التصدير ستتوفر قريباً...' : 'Export coming soon...')} 
          className="py-2 px-2 text-xs font-semibold rounded-xl border border-[#1B2738] bg-[#0F172A] text-[#10B981] hover:bg-[#09332C] transition-all flex items-center justify-center gap-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> 
          {isRtl ? 'تصدير' : 'Export'}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#0F172A]/85 rounded-2xl p-3.5 border border-[#1B2738] mb-5 space-y-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder={isRtl ? 'ابحث باسم الطالب، رقم الهاتف، أو كود الطالب...' : 'Search student name, phone or code...'} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full py-2.5 px-9 bg-[#0A101D] border border-[#1B2738] rounded-xl text-white text-xs outline-none focus:border-[#E07A00] transition-colors"
          />
          <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-[#475569] ${isRtl ? 'right-3' : 'left-3'}`} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className={`absolute top-1/2 -translate-y-1/2 text-[#475569] hover:text-white ${isRtl ? 'left-3' : 'right-3'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select 
            value={selectedHalaqa} 
            onChange={(e) => setSelectedHalaqa(e.target.value)} 
            className="p-2 bg-[#0A101D] border border-[#1B2738] rounded-xl text-[#CBD5E1] text-xs outline-none focus:border-[#E07A00]"
          >
            <option value="all">{isRtl ? 'جميع الحلقات' : 'All Halaqas'}</option>
            <option value="no_halaqa">{isRtl ? 'بدون حلقة' : 'Without Halaqa'}</option>
            {halaqas.map(h => <option key={h.id} value={h.id}>{formatName(h.name, isRtl ? 'ar' : 'en')}</option>)}
          </select>

          <select 
            value={selectedGender} 
            onChange={(e) => setSelectedGender(e.target.value)} 
            className="p-2 bg-[#0A101D] border border-[#1B2738] rounded-xl text-[#CBD5E1] text-xs outline-none focus:border-[#E07A00]"
          >
            <option value="all">{isRtl ? 'الكل (ذكر / أنثى)' : 'All Genders'}</option>
            <option value="male">{isRtl ? 'ذكور فقط' : 'Males Only'}</option>
            <option value="female">{isRtl ? 'إناث فقط' : 'Females Only'}</option>
          </select>
        </div>
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="text-center py-12 text-[#94A3B8] text-xs">⏳ {isRtl ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-[#0F172A]/40 p-10 text-center rounded-2xl border border-dashed border-[#1B2738] text-[#94A3B8] text-xs">
          {isRtl ? 'لم يتم العثور على نتائج' : 'No results found'}
        </div>
      ) : (
        <div className="space-y-3">
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

      {/* Transfer Modal */}
      {transferStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[#1B2738] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? `نقل الطالب: ${formatName(transferStudent.name, 'ar')}` : `Transfer Student`}
            </h3>
            <select 
              value={selectedNewHalaqa} 
              onChange={(e) => setSelectedNewHalaqa(e.target.value)} 
              className="w-full p-2.5 bg-[#0A101D] border border-[#1B2738] rounded-xl text-white text-xs outline-none focus:border-[#E07A00]"
            >
              <option value="">{isRtl ? 'بدون حلقة (إزالة)' : 'No Halaqa'}</option>
              {halaqas.map(h => <option key={h.id} value={h.id}>{formatName(h.name, isRtl ? 'ar' : 'en')}</option>)}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setTransferStudent(null)} 
                className="px-4 py-2 bg-transparent border border-[#1B2738] rounded-xl text-xs text-[#94A3B8] hover:text-white"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                type="button" 
                onClick={handleConfirmTransfer} 
                disabled={transferLoading} 
                className="px-4 py-2 bg-[#E07A00] hover:bg-[#C66B00] rounded-xl text-xs text-white font-bold transition-colors"
              >
                {transferLoading ? (isRtl ? 'جاري النقل...' : 'Transferring...') : (isRtl ? 'تأكيد' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
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

// Student Card Item
function StudentItemCard({ student, halaqas, getQuranProgress, onToggleArchive, onOpenTransferModal, onEditStudent, isRtl, navigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isStudentArchived = student.is_archived || student.status === 'archived';
  const studentName = formatName(student.name, isRtl ? 'ar' : 'en');
  const linkedHalaqa = student.halaqas || (Array.isArray(halaqas) ? halaqas.find(h => String(h.id) === String(student.halaqa_id)) : null);
  const halaqaName = linkedHalaqa ? formatName(linkedHalaqa.name, isRtl ? 'ar' : 'en') : '';
  const { juz, qIndex } = getQuranProgress(student.current_quarter_index);
  const cleanPhone = student.parent_phone ? String(student.parent_phone).replace(/\D/g, '') : null;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isStudentArchived ? 'bg-[#0F172A]/40 border-rose-500/20 opacity-70' : 'bg-[#0F172A]/85 border-[#1B2738] hover:border-[#2E3E56]'
    }`}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#0A101D] border border-[#1B2738] flex items-center justify-center text-xl shrink-0">
          {['female', 'أنثى', 'f'].includes(String(student.gender).toLowerCase()) ? '🧕' : '👨‍🎓'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-white truncate">
              {studentName}
            </span>
            <div className="flex gap-1 shrink-0">
              {student.current_streak > 0 && (
                <span className="text-[10px] bg-[#E07A00]/15 text-[#E07A00] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {student.current_streak}d
                </span>
              )}
              {student.points > 0 && (
                <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" /> {student.points}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
              linkedHalaqa ? 'bg-[#E07A00]/10 text-[#E07A00]' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {linkedHalaqa ? halaqaName : (isRtl ? 'بدون حلقة' : 'No Halaqa')}
            </span>
            <span className="text-[#94A3B8] flex items-center gap-1 text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-[#10B981]" /> {isRtl ? `الجزء ${juz}` : `Juz ${juz}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {cleanPhone && (
            <a 
              href={`https://wa.me/${cleanPhone}`} 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-xl bg-[#09332C] border border-[#0D5C4D] text-[#10B981] flex items-center justify-center hover:bg-[#10B981] hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          )}

          <div className="relative">
            <button 
              type="button" 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="w-9 h-9 rounded-xl bg-[#0A101D] border border-[#1B2738] text-[#CBD5E1] flex items-center justify-center hover:border-[#E07A00] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className={`absolute top-10 w-36 bg-[#0A101D] border border-[#1B2738] rounded-xl z-50 p-1 shadow-xl flex flex-col gap-1 ${
                  isRtl ? 'left-0' : 'right-0'
                }`}>
                  <button 
                    type="button" 
                    onClick={() => { setIsMenuOpen(false); navigate(`/students/${student.id}`); }} 
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#CBD5E1] hover:bg-[#1B2738] flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#E07A00]" /> {isRtl ? 'التفاصيل' : 'Details'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsMenuOpen(false); if (onEditStudent) onEditStudent(student); else navigate(`/students/${student.id}?edit=true`); }} 
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#CBD5E1] hover:bg-[#1B2738] flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-400" /> {isRtl ? 'تعديل' : 'Edit'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsMenuOpen(false); onOpenTransferModal(student); }} 
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#CBD5E1] hover:bg-[#1B2738] flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#10B981]" /> {isRtl ? 'نقل' : 'Transfer'}
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => { setIsMenuOpen(false); onToggleArchive(e, student.id, student.status, student.is_archived); }} 
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-[#1B2738] ${
                      isStudentArchived ? 'text-[#10B981]' : 'text-rose-400'
                    }`}
                  >
                    {isStudentArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />} 
                    {isStudentArchived ? (isRtl ? 'استعادة' : 'Restore') : (isRtl ? 'أرشفة' : 'Archive')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#1B2738]">
        <QuranProgressBar currentQuarterIndex={qIndex} showDetails={true} />
      </div>
    </div>
  );
}
