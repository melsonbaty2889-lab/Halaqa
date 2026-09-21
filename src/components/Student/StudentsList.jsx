// src/components/Student/StudentsList.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Users, FilterX, ListFilter 
} from 'lucide-react';
import StudentItemCard from './StudentItemCard';
import StudentProfile from './StudentProfile';
import AddStudentModal from './AddStudentModal';
import ConfirmModal from '@/components/UI/ConfirmModal';
import Select from '@/components/UI/Select';
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
  academySettings
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;

  const { academy } = useAcademy?.() || {};
  const calendarType = academySettings?.calendar_type || academy?.calendar_type || 'gregorian';

  // استدعاء إدارة حالات الطلاب والفلترة من الهوك المخصص
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

  // في حالة تحديد طالب لعرض الملف الشخصي الكامل
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
    <div className="space-y-4 text-semantic-textPrimary" dir={i18n?.dir ? i18n.dir() : 'rtl'}>
      {/* 1. رأس الصفحة */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-start w-full sm:w-auto">
          <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-semantic-textPrimary leading-snug">
              {t('students_management_title', 'شؤون الطلاب والمسار التعليمي')}
            </h1>
            <p className="text-xs text-semantic-textSecondary">
              {t('students.subtitle', 'إدارة وتنظيم بيانات الطلاب والمتابعة اليومية')}
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleOpenAddModal} 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-semantic-actionPrimary text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('add_new_student', 'إضافة طالب جديد')}</span>
        </button>
      </div>

      {/* 2. كروت الإحصائيات */}
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

      {/* 3. شريط البحث والفلترة والترتيب */}
      <div className="bg-semantic-surfaceCard/60 p-3 sm:p-4 rounded-2xl border border-semantic-borderCard space-y-3 shadow-md relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="relative w-full col-span-2 md:col-span-1 z-10">
            <Search className="w-4 h-4 text-semantic-textSecondary absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', 'ابحث عن طالب بالاسم، الهاتف...')}
              className="w-full bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl ps-9 pe-3 py-2 text-xs sm:text-sm text-semantic-textPrimary placeholder-semantic-textSecondary focus:outline-none focus:border-semantic-actionPrimary transition-colors"
            />
          </div>

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
        </div>

        <div className="flex items-center justify-between text-xs text-semantic-textSecondary pt-2 px-1 border-t border-semantic-borderCard/40 relative z-0">
          <span className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-semantic-actionPrimary" />
            <span>
              {t('students.results_count', 'عرض {{count}} من إجمالي {{total}} طالب', {
                count: filteredStudents?.length || 0,
                total: stats?.total || 0,
              })}
            </span>
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-semantic-actionPrimary hover:underline font-medium transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>{t('common.reset_filters', 'إلغاء الفلاتر')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. قائمة الطلاب */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-semantic-textSecondary">
          {t('loading', 'جاري تحميل البيانات...')}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-semantic-surfaceCard rounded-2xl border border-semantic-borderCard space-y-2">
          <Users className="w-10 h-10 text-semantic-textSecondary mx-auto" />
          <p className="text-semantic-textPrimary font-medium text-sm">
            {t('no_search_results', 'لم يتم العثور على نتائج تطابق بحثك.')}
          </p>
          <p className="text-xs text-semantic-textSecondary">
            {t('students.no_match_hint', 'جرّب تغيير البحث أو إضافة طالب جديد')}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1 text-xs text-semantic-actionPrimary underline"
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
              getStatusBadge={() => renderStatusBadge(student, t)}
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
