import { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase';
import { formatName } from '@/utils/formatters';
import { getStudentStatusCategory } from '@/utils/studentUtils';
import { Student } from '@/types/student';

// ── Types & Interfaces ──────────────────────────────────────────

export type ConfirmActionType = 'archive' | 'unarchive' | 'delete' | null;

export interface ConfirmModalState {
  isOpen: boolean;
  student: Student | { id: string } | null;
  type: ConfirmActionType;
  isLoading: boolean;
}

export type TranslateFunction = (key: string, fallback?: string) => string;

export interface UseStudentsManagerProps {
  students?: Student[];
  setStudents?: Dispatch<SetStateAction<Student[]>>;
  onDeleteStudent?: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  isRtl?: boolean;
  t?: TranslateFunction;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
}

// ── Main Hook ───────────────────────────────────────────────────

export const useStudentsManager = ({
  students = [],
  setStudents,
  onDeleteStudent,
  isRtl = true,
  t,
}: UseStudentsManagerProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [halaqaFilter, setHalaqaFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
    isOpen: false,
    student: null,
    type: null,
    isLoading: false,
  });

  const translate = (key: string, fallback: string) =>
    t ? t(key, fallback) : fallback;

  // 1. حساب الإحصائيات
  const stats: StudentStats = useMemo(
    () => ({
      total: students.length,
      active: students.filter((s) => getStudentStatusCategory(s) === 'active').length,
      inactive: students.filter((s) => getStudentStatusCategory(s) === 'inactive').length,
      archived: students.filter((s) => getStudentStatusCategory(s) === 'archived').length,
    }),
    [students]
  );

  // 2. منطق الفلترة والترتيب
  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      const formattedName = formatName((student as any).name || (student as any).full_name || '');
      const parentName = formatName(student.parent_name || (student as any).guardian_name || '');
      const studentCode = student.student_code || '';
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        formattedName.toLowerCase().includes(query) ||
        parentName.toLowerCase().includes(query) ||
        studentCode.toLowerCase().includes(query) ||
        (student.parent_phone && student.parent_phone.includes(query)) ||
        (student.parent_whatsapp && student.parent_whatsapp.includes(query));

      const category = getStudentStatusCategory(student);
      const matchesStatus = statusFilter === 'all' || category === statusFilter;
      const matchesHalaqa = halaqaFilter === 'all' || student.halaqa_id === halaqaFilter;

      return matchesSearch && matchesStatus && matchesHalaqa;
    });

    return result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      const nameA = formatName((a as any).name || (a as any).full_name || '');
      const nameB = formatName((b as any).name || (b as any).full_name || '');
      return nameA.localeCompare(nameB, isRtl ? 'ar' : 'en');
    });
  }, [students, searchQuery, statusFilter, halaqaFilter, sortBy, isRtl]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setHalaqaFilter('all');
    setSortBy('name');
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (studentToEdit: Student) => {
    setEditingStudent(studentToEdit);
    setIsAddModalOpen(true);
  };

  const handleRequestArchive = (student: Student) => {
    const isCurrentlyArchived = student.is_archived || (student as any).status === 'graduated';
    setConfirmModalState({
      isOpen: true,
      student,
      type: isCurrentlyArchived ? 'unarchive' : 'archive',
      isLoading: false,
    });
  };

  const handleRequestDelete = (studentId: string) => {
    const student = students.find((s) => s.id === studentId) || selectedStudent;
    setConfirmModalState({
      isOpen: true,
      student: student || { id: studentId },
      type: 'delete',
      isLoading: false,
    });
  };

  const handleConfirmAction = async () => {
    const { student, type } = confirmModalState;
    if (!student) return;

    setConfirmModalState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (type === 'archive' || type === 'unarchive') {
        const newArchivedState = type === 'archive';
        const { error } = await supabase
          .from('students')
          .update({ is_archived: newArchivedState })
          .eq('id', student.id);

        if (error) throw error;
        const updatedStudent = { ...student, is_archived: newArchivedState } as Student;

        if (setStudents) {
          setStudents((prev) =>
            prev.map((s) => (s.id === student.id ? updatedStudent : s))
          );
        }
        if (selectedStudent && selectedStudent.id === student.id) {
          setSelectedStudent(updatedStudent);
        }
      } else if (type === 'delete') {
        if (onDeleteStudent) {
          const res = await onDeleteStudent(student.id);
          if (res?.success) {
            if (setStudents) setStudents((prev) => prev.filter((s) => s.id !== student.id));
            if (selectedStudent && selectedStudent.id === student.id) setSelectedStudent(null);
          } else {
            alert(
              translate('common.delete_failed', 'فشل الحذف من قاعدة البيانات: ') +
                (res?.error || '')
            );
          }
        } else {
          if (setStudents) setStudents((prev) => prev.filter((s) => s.id !== student.id));
          if (selectedStudent && selectedStudent.id === student.id) setSelectedStudent(null);
        }
      }
    } catch (err: any) {
      alert(
        translate('common.update_failed', 'فشل تنفيذ الإجراء: ') +
          (err?.message || '')
      );
    } finally {
      setConfirmModalState({ isOpen: false, student: null, type: null, isLoading: false });
    }
  };

  const handleModalSuccess = (savedStudent: Student) => {
    if (!savedStudent) return;
    if (setStudents) {
      setStudents((prev) => {
        const exists = prev.some((s) => s.id === savedStudent.id);
        return exists
          ? prev.map((s) => (s.id === savedStudent.id ? savedStudent : s))
          : [savedStudent, ...prev];
      });
    }
    if (selectedStudent && selectedStudent.id === savedStudent.id) {
      setSelectedStudent(savedStudent);
    }
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    halaqaFilter,
    setHalaqaFilter,
    sortBy,
    setSortBy,
    selectedStudent,
    setSelectedStudent,
    isAddModalOpen,
    setIsAddModalOpen,
    editingStudent,
    setEditingStudent,
    confirmModalState,
    setConfirmModalState,
    stats,
    filteredStudents,
    resetFilters,
    handleOpenAddModal,
    handleOpenEditModal,
    handleRequestArchive,
    handleRequestDelete,
    handleConfirmAction,
    handleModalSuccess,
  };
};

export default useStudentsManager;
