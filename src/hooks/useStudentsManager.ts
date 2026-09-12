import { useState, useMemo, useCallback, Dispatch, SetStateAction } from 'react';
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
  error?: string | null;
}

export type TranslateFunction = (key: string, fallback?: string) => string;

export interface UseStudentsManagerProps {
  students?: Student[];
  setStudents?: Dispatch<SetStateAction<Student[]>>;
  onDeleteStudent?: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  isRtl?: boolean;
  t?: TranslateFunction;
  currentLang?: string;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
}

// ── Helper Function for Multilingual Search ─────────────────────

const extractAllNames = (nameField: any): string => {
  if (!nameField) return '';
  if (typeof nameField === 'string') return nameField;
  if (typeof nameField === 'object' && nameField !== null) {
    return Object.values(nameField)
      .filter((v): v is string => typeof v === 'string')
      .join(' ');
  }
  return '';
};

// ── Main Hook ───────────────────────────────────────────────────

export const useStudentsManager = ({
  students = [],
  setStudents,
  onDeleteStudent,
  isRtl = true,
  t,
  currentLang = 'ar',
}: UseStudentsManagerProps = {}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [halaqaFilter, setHalaqaFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
    isOpen: false,
    student: null,
    type: null,
    isLoading: false,
    error: null,
  });

  const translate = useCallback(
    (key: string, fallback: string) => (t ? t(key, fallback) : fallback),
    [t]
  );

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

  // 2. منطق الفلترة والترتيب الداعم لجميع اللغات (AR, EN, TR, FR, UR, ID)
  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      const allStudentNames = extractAllNames((student as any).name || (student as any).full_name);
      const parentName = formatName(student.parent_name || (student as any).guardian_name || '');
      const studentCode = student.student_code || '';
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        allStudentNames.toLowerCase().includes(query) ||
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

      // استخراج الاسم المعتمد بحسب اللغة الحالية لجميع اللغات المدعومة
      const getLocalizedName = (s: Student) => {
        const rawName = (s as any).name || (s as any).full_name;
        if (typeof rawName === 'object' && rawName !== null) {
          return (
            rawName[currentLang] ||
            rawName.ar ||
            rawName.en ||
            rawName.tr ||
            rawName.fr ||
            rawName.ur ||
            rawName.id ||
            Object.values(rawName).find((v) => typeof v === 'string' && v.trim() !== '') ||
            ''
          );
        }
        return formatName(rawName || '');
      };

      const nameA = getLocalizedName(a);
      const nameB = getLocalizedName(b);
      return nameA.localeCompare(nameB, currentLang);
    });
  }, [students, searchQuery, statusFilter, halaqaFilter, sortBy, currentLang]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setHalaqaFilter('all');
    setSortBy('name');
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setEditingStudent(null);
    setIsAddModalOpen(true);
    setActionError(null);
  }, []);

  const handleOpenEditModal = useCallback((studentToEdit: Student) => {
    setEditingStudent(studentToEdit);
    setIsAddModalOpen(true);
    setActionError(null);
  }, []);

  const handleRequestArchive = useCallback((student: Student) => {
    const isCurrentlyArchived = student.is_archived || (student as any).status === 'graduated';
    setConfirmModalState({
      isOpen: true,
      student,
      type: isCurrentlyArchived ? 'unarchive' : 'archive',
      isLoading: false,
      error: null,
    });
  }, []);

  const handleRequestDelete = useCallback(
    (studentId: string) => {
      const student = students.find((s) => s.id === studentId) || selectedStudent;
      setConfirmModalState({
        isOpen: true,
        student: student || { id: studentId },
        type: 'delete',
        isLoading: false,
        error: null,
      });
    },
    [students, selectedStudent]
  );

  const handleConfirmAction = useCallback(async () => {
    const { student, type } = confirmModalState;
    if (!student) return;

    setConfirmModalState((prev) => ({ ...prev, isLoading: true, error: null }));
    setActionError(null);

    try {
      if (type === 'archive' || type === 'unarchive') {
        const newArchivedState = type === 'archive';
        const { error } = await supabase
          .from('students')
          .update({
            is_archived: newArchivedState,
            updated_at: new Date().toISOString(),
          })
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
            throw new Error(res?.error || translate('common.delete_failed', 'فشل الحذف من قاعدة البيانات'));
          }
        } else {
          const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', student.id);

          if (error) throw error;

          if (setStudents) setStudents((prev) => prev.filter((s) => s.id !== student.id));
          if (selectedStudent && selectedStudent.id === student.id) setSelectedStudent(null);
        }
      }

      setConfirmModalState({ isOpen: false, student: null, type: null, isLoading: false, error: null });
    } catch (err: any) {
      const errMsg = err?.message || translate('common.update_failed', 'فشل تنفيذ الإجراء');
      setActionError(errMsg);
      setConfirmModalState((prev) => ({ ...prev, isLoading: false, error: errMsg }));
    }
  }, [confirmModalState, setStudents, selectedStudent, onDeleteStudent, translate]);

  const handleModalSuccess = useCallback(
    (savedStudent: Student) => {
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
    },
    [setStudents, selectedStudent]
  );

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
    actionError,
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
