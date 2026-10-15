// src/components/Student/StudentsList.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import StudentItemCard from './StudentItemCard';
import StudentProfile from './StudentProfile';
import AddStudentModal from './AddStudentModal';
import ConfirmModal from '@/components/UI/ConfirmModal';
import Select from '@/components/UI/Select';
import PageLayout from '@/components/UI/PageLayout';
import { useAcademy } from '@/context/AcademyContext';
import { useStudentsManager } from '@/hooks/useStudentsManager';
import { renderStatusBadge } from '@/utils/studentUtils';

const StudentsList = ({ 
  students = [], 
  setStudents, 
  academyId, 
  halaqas = [], 
  isLoading,
  onDeleteStudent,
  academySettings,
  onRefresh
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;

  const { academy } = useAcademy?.() || {};
  const calendarType = academySettings?.calendar_type || academy?.calendar_type || 'gregorian';

  // إدارة حالات الطلاب والفلترة من الهوك المخصص
  const manager = useStudentsManager({
    students,
    setStudents,
    onDeleteStudent,
    isRtl,
    t,
  });

  const {
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
  } = manager;

  // في حالة عرض الملف الشخصي الكامل لطلب معين
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

  // خيارات القوائم المنسدلة للفلترة
  const statusOptions = [
    { label: t('students.filter_all', 'جميع الحالات'), value: 'all' },
    { label: t('status_active', 'نشط'), value: 'active' },
    { label: t('status_inactive', 'غير نشط'), value: 'inactive' },
    { label: t('common.archived', 'مؤرشف'), value: 'archived' },
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
    <>
      <PageLayout
        title={t('students_management_title', 'شؤون الطلاب والمسار التعليمي')}
        subtitle={t('students.subtitle', 'إدارة وتنظيم بيانات الطلاب والمتابعة اليومية')}
        icon={Users}
        actionButtonText={t('add_new_student', 'إضافة طالب جديد')}
        onActionButtonClick={handleOpenAddModal}
        statsGrid={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div 
              onClick={() => setStatusFilter('all')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'all' ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-actionPrimary"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('total_students', 'إجمالي الطلاب')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-textPrimary mt-1">{stats?.total || 0}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('active')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'active' ? 'border-semantic-success ring-1 ring-semantic-success' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-success"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('status_active', 'النشطون')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-success mt-1">{stats?.active || 0}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('inactive')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'inactive' ? 'border-semantic-error ring-1 ring-semantic-error' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-error"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('status_inactive', 'غير النشطين')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-error mt-1">{stats?.inactive || 0}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('archived')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'archived' ? 'border-semantic-warning ring-1 ring-semantic-warning' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-warning"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('common.archived', 'المؤرشفون')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-warning mt-1">{stats?.archived || 0}</p>
            </div>
          </div>
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('search_placeholder', 'ابحث عن طالب بالاسم، الهاتف...')}
        filtersChildren={
          <>
            <div className="relative z-40 col-span-1">
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={statusOptions}
                placeholder={t('students.filter_all', 'جميع الحالات')}
              />
            </div>

            <div className="relative z-30 col-span-1">
              <Select
                value={halaqaFilter}
                onChange={(val) => setHalaqaFilter(val)}
                options={halaqaOptions}
                placeholder={t('students.filter_all_halaqas', 'جميع الحلقات')}
              />
            </div>

            <div className="relative z-20 col-span-2 md:col-span-1">
              <Select
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={sortOptions}
                placeholder={t('students.sort_by', 'ترتيب حسب')}
              />
            </div>
          </>
        }
        totalCount={stats?.total || 0}
        filteredCount={filteredStudents?.length || 0}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onRefresh={onRefresh}
        countUnitText="طالب"
        isLoading={isLoading}
        isRtl={isRtl}
        t={t}
      >
        {/* عرض شبكة بطاقات الطلاب أو حالة عدم وجود نتائج */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-semantic-surfaceCard rounded-2xl border border-semantic-borderCard space-y-2">
            <Users className="w-10 h-10 text-semantic-textSecondary mx-auto" />
            <p className="text-semantic-textPrimary font-medium text-sm">
              {t('no_search_results', 'لم يتم العثور على نتائج تطابق بحثك.')}
            </p>
            <p className="text-xs text-semantic-textSecondary">
              {t('students.no_match_hint', 'جرّب تغيير البحث أو إضافة طالب جديد')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-0">
            {filteredStudents.map((student) => (
              <StudentItemCard
                key={student.id}
                student={student}
                onClick={() => setSelectedStudent(student)}
                getStatusBadge={() => renderStatusBadge(student, t)}
                calendarType={calendarType}
              />
            ))}
          </div>
        )}
      </PageLayout>

      {/* نافذة إضافة / تعديل الطالب */}
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

      {/* نافذة التأكيد (ConfirmModal) للأرشفة والحذف */}
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
};

export default StudentsList;
