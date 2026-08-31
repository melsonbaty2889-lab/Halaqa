// src/components/Student/StudentsList.jsx

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Users, UserCheck, UserX, AlertCircle, 
  FilterX, ListFilter, Archive 
} from 'lucide-react';
import StudentItemCard from './StudentItemCard';
import StudentProfile from './StudentProfile';
import AddStudentModal from './AddStudentModal';
import ConfirmModal from '@/components/UI/ConfirmModal';
import CustomSelect from '@/components/UI/CustomSelect';
import { formatName } from '@/utils/formatters';
import { useAcademy } from '@/context/AcademyContext';
import { supabase } from '@/lib/supabase';

/**
 * دالة توحيد وتصنيف حالات الطالب المعتمدة في الواجهة مع الحفاظ على قيم قاعدة البيانات
 */
const getStudentStatusCategory = (student) => {
  if (student.is_archived || student.status === 'graduated') {
    return 'archived';
  }
  if (student.status === 'inactive' || student.status === 'paused') {
    return 'inactive';
  }
  return 'active';
};

const StudentsList = ({ 
  students = [], 
  setStudents, 
  academyId, 
  halaqas = [], 
  isLoading,
  onDeleteStudent,
  academySettings
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const { academy } = useAcademy?.() || {};
  const calendarType = academySettings?.calendar_type || academy?.calendar_type || 'gregorian';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [halaqaFilter, setHalaqaFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // حالة التحكم بنموذج التأكيد المخصص (ConfirmModal)
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    student: null,
    type: null, // 'archive' | 'unarchive' | 'delete'
    isLoading: false,
  });

  // 1. حساب إحصائيات الطلاب بأسلوب موحد
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter((s) => getStudentStatusCategory(s) === 'active').length,
      inactive: students.filter((s) => getStudentStatusCategory(s) === 'inactive').length,
      archived: students.filter((s) => getStudentStatusCategory(s) === 'archived').length,
    };
  }, [students]);

  // 2. الفلترة والترتيب للنتائج المعروضة
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

  const getStatusBadge = (student) => {
    const category = getStudentStatusCategory(student);

    if (category === 'archived') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Archive className="w-3.5 h-3.5" />
          <span>{student.status === 'graduated' ? t('common.graduated', 'متخرج') : t('common.archived', 'مؤرشف')}</span>
        </span>
      );
    }

    if (category === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <UserCheck className="w-3.5 h-3.5" />
          <span>{t('common.active', 'نشط')}</span>
        </span>
      );
    }

    if (category === 'inactive') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <UserX className="w-3.5 h-3.5" />
          <span>{student.status === 'paused' ? t('common.paused', 'موقوف') : t('common.inactive', 'غير نشط')}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dark-input text-appText-sub border border-appBorder-input">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{t('common.unspecified', 'غير محدد')}</span>
      </span>
    );
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (studentToEdit) => {
    setEditingStudent(studentToEdit);
    setIsAddModalOpen(true);
  };

  // فتح نافذة تأكيد الأرشفة / إلغاء الأرشفة
  const handleRequestArchive = (student) => {
    const isCurrentlyArchived = student.is_archived || student.status === 'graduated';
    setConfirmModalState({
      isOpen: true,
      student,
      type: isCurrentlyArchived ? 'unarchive' : 'archive',
      isLoading: false,
    });
  };

  // فتح نافذة تأكيد الحذف
  const handleRequestDelete = (studentId) => {
    const student = students.find((s) => s.id === studentId) || selectedStudent;
    setConfirmModalState({
      isOpen: true,
      student: student || { id: studentId },
      type: 'delete',
      isLoading: false,
    });
  };

  // دالة تنفيذ الإجراء التأكيدي (أرشفة أو حذف)
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
            if (setStudents) {
              setStudents((prev) => prev.filter((s) => s.id !== student.id));
            }
            if (selectedStudent && selectedStudent.id === student.id) {
              setSelectedStudent(null);
            }
          } else {
            alert(t('common.delete_failed', 'فشل الحذف من قاعدة البيانات: ') + (res?.error || ''));
          }
        } else {
          if (setStudents) {
            setStudents((prev) => prev.filter((s) => s.id !== student.id));
          }
          if (selectedStudent && selectedStudent.id === student.id) {
            setSelectedStudent(null);
          }
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
        if (exists) {
          return prev.map((s) => (s.id === savedStudent.id ? savedStudent : s));
        }
        return [savedStudent, ...prev];
      });
    }

    if (selectedStudent && selectedStudent.id === savedStudent.id) {
      setSelectedStudent(savedStudent);
    }

    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  // عرض صفحة الطالب في حال اختياره
  if (selectedStudent) {
    return (
      <>
        <StudentProfile
          student={selectedStudent}
          academyId={academyId}
          halaqas={halaqas}
          onBack={() => setSelectedStudent(null)}
          onEdit={(studentToEdit) => handleOpenEditModal(studentToEdit)}
          onArchive={(studentToArchive) => handleRequestArchive(studentToArchive)}
          onDelete={(studentId) => handleRequestDelete(studentId)}
        />

        {/* إضافة النافذة المنبثقة هنا تضمن فتحها فوراً فوق صفحة البروفايل */}
        {isAddModalOpen && (
          <AddStudentModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingStudent(null);
            }}
            studentToEdit={editingStudent}
            academyId={academyId}
            halaqas={halaqas}
            onSuccess={handleModalSuccess}
          />
        )}

        <ConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={() => setConfirmModalState({ isOpen: false, student: null, type: null, isLoading: false })}
          onConfirm={handleConfirmAction}
          isLoading={confirmModalState.isLoading}
          variant={confirmModalState.type === 'delete' ? 'danger' : confirmModalState.type === 'unarchive' ? 'info' : 'warning'}
          title={
            confirmModalState.type === 'unarchive'
              ? t('students.unarchive_title', 'إلغاء أرشفة الطالب')
              : confirmModalState.type === 'archive'
              ? t('students.archive_title', 'أرشفة الطالب')
              : t('students.delete_title', 'حذف الطالب')
          }
          message={
            confirmModalState.type === 'unarchive'
              ? t('students.confirm_unarchive', 'هل ترغب في إلغاء أرشفة هذا الطالب وإعادته للقائمة النشطة؟')
              : confirmModalState.type === 'archive'
              ? t('students.confirm_archive', 'هل أنت متأكد من أرشفة هذا الطالب؟')
              : t('students.confirm_delete', 'هل أنت متأكد من حذف هذا الطالب نهائياً؟')
          }
          confirmText={
            confirmModalState.type === 'unarchive'
              ? t('common.unarchive', 'إلغاء الأرشفة')
              : confirmModalState.type === 'archive'
              ? t('common.archive', 'أرشفة')
              : t('common.delete', 'حذف')
          }
        />
      </>
    );
  }

  const statusOptions = [
    { label: t('students.filter_all', 'جميع الحالات'), value: 'all' },
    { label: t('students.filter_active', 'نشط'), value: 'active' },
    { label: t('students.filter_inactive', 'غير نشط'), value: 'inactive' },
    { label: t('students.filter_archived', 'مؤرشف'), value: 'archived' },
  ];

  const halaqaOptions = [
    { label: t('students.filter_all_halaqas', 'جميع الحلقات'), value: 'all' },
    ...halaqas.map((h) => ({
      value: h.id,
      label: typeof h.name === 'object' && h.name !== null
        ? (isRtl ? h.name.ar || h.name.en : h.name.en || h.name.ar)
        : h.name_ar || h.name || '',
    })),
  ];

  const sortOptions = [
    { label: t('students.sort_name', 'ترتيب أبجدي'), value: 'name' },
    { label: t('students.sort_newest', 'الأحدث إضافةً'), value: 'newest' },
  ];

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || halaqaFilter !== 'all' || sortBy !== 'name';

  return (
    <div className="space-y-4 text-appText-main" dir={i18n.dir()}>
      {/* 1. رأس الصفحة */}
      <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-start w-full sm:w-auto">
          <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-appText-main leading-snug">
              {t('students.title', 'قائمة الطلاب')}
            </h1>
            <p className="text-xs text-appText-sub">
              {t('students.subtitle', 'إدارة وتنظيم بيانات الطلاب والمتابعة اليومية')}
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleOpenAddModal} 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-appText-main font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-primary-glow active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('students.add_new', 'إضافة طالب جديد')}</span>
        </button>
      </div>

      {/* 2. كروت الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'all' ? 'border-primary ring-1 ring-primary' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
        >
          <div className="absolute top-0 start-0 end-0 h-1 bg-primary"></div>
          <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('students.total_count', 'إجمالي الطلاب')}</p>
          <p className="text-base sm:text-xl font-bold text-appText-main mt-1">{stats.total}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('active')}
          className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'active' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
        >
          <div className="absolute top-0 start-0 end-0 h-1 bg-emerald-500"></div>
          <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('students.active_count', 'النشطون')}</p>
          <p className="text-base sm:text-xl font-bold text-emerald-400 mt-1">{stats.active}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('inactive')}
          className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'inactive' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
        >
          <div className="absolute top-0 start-0 end-0 h-1 bg-rose-500"></div>
          <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('students.inactive_count', 'غير النشطين')}</p>
          <p className="text-base sm:text-xl font-bold text-rose-400 mt-1">{stats.inactive}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('archived')}
          className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'archived' ? 'border-sky-500 ring-1 ring-sky-500' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
        >
          <div className="absolute top-0 start-0 end-0 h-1 bg-sky-500"></div>
          <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('students.archived_count', 'المؤرشفون')}</p>
          <p className="text-base sm:text-xl font-bold text-sky-400 mt-1">{stats.archived}</p>
        </div>
      </div>

      {/* 3. شريط البحث والفلترة والترتيب */}
      <div className="bg-dark-card/60 p-3 sm:p-4 rounded-2xl border border-appBorder-card space-y-3 shadow-md relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="relative w-full col-span-2 md:col-span-1 z-10">
            <Search className="w-4 h-4 text-appText-muted absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('students.search_placeholder_expanded', 'بحث بالاسم، الكود، أو الهاتف...')}
              className="w-full bg-dark-input border border-appBorder-input rounded-xl ps-9 pe-3 py-2 text-xs sm:text-sm text-appText-main placeholder-appText-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="relative z-40 col-span-1">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={statusOptions}
              placeholder={t('students.filter_all', 'جميع الحالات')}
            />
          </div>

          <div className="relative z-30 col-span-1">
            <CustomSelect
              value={halaqaFilter}
              onChange={(val) => setHalaqaFilter(val)}
              options={halaqaOptions}
              placeholder={t('students.filter_all_halaqas', 'جميع الحلقات')}
            />
          </div>

          <div className="relative z-20 col-span-2 md:col-span-1">
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              options={sortOptions}
              placeholder={t('students.sort_by', 'ترتيب حسب')}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-appText-sub pt-2 px-1 border-t border-appBorder-card/40 relative z-0">
          <span className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-primary" />
            <span>
              {t('students.results_count', 'عرض {{count}} من إجمالي {{total}} طالب', {
                count: filteredStudents.length,
                total: stats.total,
              })}
            </span>
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-primary hover:underline font-medium transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>{t('common.reset_filters', 'إلغاء الفلاتر')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. قائمة الطلاب */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-appText-sub">
          {t('common.loading', 'جاري تحميل الطلاب...')}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-2xl border border-appBorder-card space-y-2">
          <Users className="w-10 h-10 text-appText-muted mx-auto" />
          <p className="text-appText-main font-medium text-sm">
            {t('students.no_match', 'لا يوجد طلاب مطابقون للبحث')}
          </p>
          <p className="text-xs text-appText-sub">
            {t('students.no_match_hint', 'جرّب تغيير البحث أو إضافة طالب جديد')}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary underline"
            >
              <FilterX className="w-3 h-3" />
              <span>{t('common.reset_filters', 'إلغاء الفلاتر')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-0">
          {filteredStudents.map((student) => (
            <StudentItemCard
              key={student.id}
              student={student}
              onClick={() => setSelectedStudent(student)}
              getStatusBadge={() => getStatusBadge(student)}
              calendarType={calendarType}
            />
          ))}
        </div>
      )}

      {/* 5. نافذة إضافة / تعديل الطالب */}
      {isAddModalOpen && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          studentToEdit={editingStudent}
          academyId={academyId}
          halaqas={halaqas}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* 6. نافذة التأكيد المخصصة (ConfirmModal) للأرشفة والحذف */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, student: null, type: null, isLoading: false })}
        onConfirm={handleConfirmAction}
        isLoading={confirmModalState.isLoading}
        variant={confirmModalState.type === 'delete' ? 'danger' : confirmModalState.type === 'unarchive' ? 'info' : 'warning'}
        title={
          confirmModalState.type === 'unarchive'
            ? t('students.unarchive_title', 'إلغاء أرشفة الطالب')
            : confirmModalState.type === 'archive'
            ? t('students.archive_title', 'أرشفة الطالب')
            : t('students.delete_title', 'حذف الطالب')
        }
        message={
          confirmModalState.type === 'unarchive'
            ? t('students.confirm_unarchive', 'هل ترغب في إلغاء أرشفة هذا الطالب وإعادته للقائمة النشطة؟')
            : confirmModalState.type === 'archive'
            ? t('students.confirm_archive', 'هل أنت متأكد من أرشفة هذا الطالب؟')
            : t('students.confirm_delete', 'هل أنت متأكد من حذف هذا الطالب نهائياً؟')
        }
        confirmText={
          confirmModalState.type === 'unarchive'
            ? t('common.unarchive', 'إلغاء الأرشفة')
            : confirmModalState.type === 'archive'
            ? t('common.archive', 'أرشفة')
            : t('common.delete', 'حذف')
        }
      />
    </div>
  );
};

export default StudentsList;
