// src/hooks/useStudentsManager.js
import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { formatName } from '@/utils/formatters';
import { getStudentStatusCategory } from '@/utils/studentUtils';

export const useStudentsManager = ({ students = [], setStudents, onDeleteStudent, isRtl, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [halaqaFilter, setHalaqaFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    student: null,
    type: null,
    isLoading: false,
  });

  // حساب الإحصائيات
  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter((s) => getStudentStatusCategory(s) === 'active').length,
    inactive: students.filter((s) => getStudentStatusCategory(s) === 'inactive').length,
    archived: students.filter((s) => getStudentStatusCategory(s) === 'archived').length,
  }), [students]);

  // منطق الفلترة والترتيب
  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      const formattedName = formatName(student.name || student.full_name || '');
      const parentName = formatName(student.parent_name || student.guardian_name || '');
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
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      const nameA = formatName(a.name || a.full_name || '');
      const nameB = formatName(b.name || b.full_name || '');
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

  const handleOpenEditModal = (studentToEdit) => {
    setEditingStudent(studentToEdit);
    setIsAddModalOpen(true);
  };

  const handleRequestArchive = (student) => {
    const isCurrentlyArchived = student.is_archived || student.status === 'graduated';
    setConfirmModalState({
      isOpen: true,
      student,
      type: isCurrentlyArchived ? 'unarchive' : 'archive',
      isLoading: false,
    });
  };

  const handleRequestDelete = (studentId) => {
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
        const updatedStudent = { ...student, is_archived: newArchivedState };

        if (setStudents) {
          setStudents((prev) => prev.map((s) => (s.id === student.id ? updatedStudent : s)));
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
            alert(t('common.delete_failed', 'فشل الحذف من قاعدة البيانات: ') + (res?.error || ''));
          }
        } else {
          if (setStudents) setStudents((prev) => prev.filter((s) => s.id !== student.id));
          if (selectedStudent && selectedStudent.id === student.id) setSelectedStudent(null);
        }
      }
    } catch (err) {
      alert(t('common.update_failed', 'فشل تنفيذ الإجراء: ') + (err?.message || ''));
    } finally {
      setConfirmModalState({ isOpen: false, student: null, type: null, isLoading: false });
    }
  };

  const handleModalSuccess = (savedStudent) => {
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
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    halaqaFilter, setHalaqaFilter,
    sortBy, setSortBy,
    selectedStudent, setSelectedStudent,
    isAddModalOpen, setIsAddModalOpen,
    editingStudent, setEditingStudent,
    confirmModalState, setConfirmModalState,
    stats, filteredStudents, resetFilters,
    handleOpenAddModal, handleOpenEditModal,
    handleRequestArchive, handleRequestDelete,
    handleConfirmAction, handleModalSuccess,
  };
};
