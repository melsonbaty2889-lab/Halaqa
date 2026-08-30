// src/components/Student/StudentsList.jsx

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Users, UserCheck, UserX, AlertCircle, 
  FilterX, LayoutGrid, ListFilter, BookOpen 
} from 'lucide-react';
import StudentItemCard from './StudentItemCard';
import StudentProfile from './StudentProfile';
import AddStudentModal from './AddStudentModal';
import CustomSelect from '@/components/UI/CustomSelect';
import { formatName } from '@/utils/formatters';

const StudentsList = ({ 
  students = [], 
  setStudents, 
  academyId, 
  halaqas = [], 
  isLoading,
  onDeleteStudent
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [halaqaFilter, setHalaqaFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // تصفية الطلاب حسب البحث، الحالة، والحلقة
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const formattedName = formatName(student.name || student.full_name || '');
      const matchesSearch =
        formattedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.parent_phone && student.parent_phone.includes(searchQuery)) ||
        (student.phone && student.phone.includes(searchQuery));

      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesHalaqa = halaqaFilter === 'all' || student.halaqa_id === halaqaFilter;

      return matchesSearch && matchesStatus && matchesHalaqa;
    });
  }, [students, searchQuery, statusFilter, halaqaFilter]);

  // إحصائيات سريعة
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter((s) => s.status === 'active').length,
      inactive: students.filter((s) => s.status === 'inactive').length,
    };
  }, [students]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setHalaqaFilter('all');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('common.active', 'نشط')}</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <UserX className="w-3.5 h-3.5" />
            <span>{t('common.inactive', 'غير نشط')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dark-input text-appText-sub border border-appBorder-input">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t('common.unspecified', 'غير محدد')}</span>
          </span>
        );
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (studentToEdit) => {
    setEditingStudent(studentToEdit);
    setIsAddModalOpen(true);
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

  if (selectedStudent) {
    return (
      <StudentProfile
        student={selectedStudent}
        academyId={academyId}
        halaqas={halaqas}
        onBack={() => setSelectedStudent(null)}
        onEdit={(studentToEdit) => handleOpenEditModal(studentToEdit)}
        onDelete={async (studentId) => {
          if (window.confirm(t('students.confirm_delete', 'هل أنت متأكد من حذف هذا الطالب؟'))) {
            if (onDeleteStudent) {
              const res = await onDeleteStudent(studentId);
              if (res?.success) {
                if (setStudents) {
                  setStudents((prev) => prev.filter((s) => s.id !== studentId));
                }
                setSelectedStudent(null);
              } else {
                alert(t('common.delete_failed', 'فشل الحذف من قاعدة البيانات: ') + (res?.error || ''));
              }
            } else {
              if (setStudents) {
                setStudents((prev) => prev.filter((s) => s.id !== studentId));
              }
              setSelectedStudent(null);
            }
          }
        }}
      />
    );
  }

  const statusOptions = [
    { label: t('students.filter_all', 'جميع الحالات'), value: 'all' },
    { label: t('students.filter_active', 'نشط فقط'), value: 'active' },
    { label: t('students.filter_inactive', 'غير نشط فقط'), value: 'inactive' },
  ];

  const halaqaOptions = [
    { label: t('students.filter_all_halaqas', 'جميع الحلقات'), value: 'all' },
    ...halaqas.map((h) => ({
      value: h.id,
      label: typeof h.name === 'object' && h.name !== null
        ? (isRtl ? h.name.ar || h.name.en : h.name.en || h.name.ar)
        : h.name_ar || h.name,
    })),
  ];

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || halaqaFilter !== 'all';

  return (
    <div className="space-y-5 text-appText-main" dir={i18n.dir()}>
      {/* 1. الهيدر الرئيسي وزر الإضافة */}
      <div className="bg-dark-card border border-appBorder-card rounded-2xl p-6 text-center relative overflow-hidden space-y-3 shadow-xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-appText-main">
          {t('students.title', 'قائمة الطلاب')}
        </h1>
        <p className="text-xs text-appText-sub max-w-md mx-auto">
          {t('students.subtitle', 'إدارة وتنظيم بيانات الطلاب والمتابعة اليومية')}
        </p>

        <div className="pt-2">
          <button 
            type="button"
            onClick={handleOpenAddModal} 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-appText-main font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary-glow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('students.add_new', 'إضافة طالب جديد')}</span>
          </button>
        </div>
      </div>

      {/* 2. كروت الإحصائيات المحدثة */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 text-center relative overflow-hidden shadow-md">
          <div className="absolute top-0 start-0 end-0 h-1 bg-primary/40"></div>
          <p className="text-xs text-appText-sub font-medium">{t('students.total_count', 'إجمالي الطلاب')}</p>
          <p className="text-lg sm:text-2xl font-bold text-appText-main mt-1">{stats.total}</p>
        </div>
        <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 text-center relative overflow-hidden shadow-md">
          <div className="absolute top-0 start-0 end-0 h-1 bg-emerald-500/50"></div>
          <p className="text-xs text-appText-sub font-medium">{t('students.active_count', 'النشطون')}</p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
        </div>
        <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 text-center relative overflow-hidden shadow-md">
          <div className="absolute top-0 start-0 end-0 h-1 bg-rose-500/50"></div>
          <p className="text-xs text-appText-sub font-medium">{t('students.inactive_count', 'غير النشطين')}</p>
          <p className="text-lg sm:text-2xl font-bold text-rose-400 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* 3. شريط البحث والتصفية المتقدم */}
      <div className="bg-dark-card/60 p-4 rounded-2xl border border-appBorder-card space-y-3 shadow-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-appText-muted absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('students.search_placeholder', 'البحث باسم الطالب أو رقم الهاتف...')}
            className="w-full bg-dark-input border border-appBorder-input rounded-xl ps-10 pe-4 py-2.5 text-sm text-appText-main placeholder-appText-muted focus:outline-none focus:border-appBorder-hover transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={statusOptions}
            placeholder={t('students.filter_all', 'جميع الحالات')}
          />

          <CustomSelect
            value={halaqaFilter}
            onChange={(val) => setHalaqaFilter(val)}
            options={halaqaOptions}
            placeholder={t('students.filter_all_halaqas', 'جميع الحلقات')}
          />
        </div>

        {/* شريط معلومات الفلترة وزر التصفير */}
        <div className="flex items-center justify-between text-xs text-appText-sub pt-1 px-1 border-t border-appBorder-card/50">
          <span className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-primary" />
            <span>
              {t('students.results_count', 'عرض {{count}} من إجمالي {{total}} طالب', {
                count: filteredStudents.length,
                total: students.length,
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

      {/* 4. قائمة الطلاب المفلترة */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-appText-sub">
          {t('common.loading', 'جاري تحميل الطلاب...')}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-2xl border border-appBorder-card space-y-2">
          <Users className="w-10 h-10 text-appText-muted mx-auto" />
          <p className="text-appText-main font-medium text-sm">
            {t('students.no_match', 'لا يوجد طلاب مطبقون للبحث')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredStudents.map((student) => (
            <StudentItemCard
              key={student.id}
              student={student}
              onClick={() => setSelectedStudent(student)}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* 5. مودال الإضافة والتعديل */}
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
    </div>
  );
};

export default StudentsList;
