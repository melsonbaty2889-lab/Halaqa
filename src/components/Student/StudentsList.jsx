// src/components/Student/StudentsList.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Users, FilterX, ListFilter 
} from 'lucide-react';
import StudentItemCard from './StudentItemCard';
import StudentProfile from './StudentProfile';
import AddStudentModal from './AddStudentModal';
import ConfirmModal from '@/components/UI/ConfirmModal';
import CustomSelect from '@/components/UI/CustomSelect';
import { useAcademy } from '@/context/AcademyContext';
import { useStudentsManager } from '@/hooks/useStudentsManager';
import { renderStatusBadge } from '@/utils/studentUtils';

// 🟢 دالة آمنة لاستخراج اسم الحلقة بناءً على اللغة
const getHalaqaName = (h, isRtl) => {
  if (!h) return '';
  if (typeof h.name === 'object' && h.name !== null) {
    return isRtl ? (h.name.ar || h.name.en || '') : (h.name.en || h.name.ar || '');
  }
  return h.name_ar || h.name_en || h.name || '';
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

  // إدارة حالات الطلاب والفلترة عبر الهوك المخصص
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

  const statusOptions = useMemo(() => [
    { label: t('students.filter_all', 'جميع الحالات'), value: 'all' },
    { label: t('status_active', 'نشط'), value: 'active' },
    { label: t('status_inactive', 'غير نشط'), value: 'inactive' },
    { label: t('common.archived', 'مؤرشف'), value: 'archived' },
  ], [t]);

  const halaqaOptions = useMemo(() => [
    { label: t('students.filter_all_halaqas', 'جميع الحلقات'), value: 'all' },
    ...halaqas.map((h) => ({
      value: h.id,
      label: getHalaqaName(h, isRtl)
    })),
  ], [halaqas, isRtl, t]);

  const sortOptions = useMemo(() => [
    { label: t('students.sort_name', 'ترتيب أبجدي'), value: 'name' },
    { label: t('students.sort_newest', 'الأحدث إضافةً'), value: 'newest' },
  ], [t]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || halaqaFilter !== 'all' || sortBy !== 'name';

  return (
    <div className="space-y-4 text-appText-main" dir={i18n.dir()}>
      {selectedStudent ? (
        <StudentProfile
          student={selectedStudent}
          academyId={academyId}
          halaqas={halaqas}
          onBack={() => setSelectedStudent(null)}
          onEdit={(studentToEdit) => handleOpenEditModal(studentToEdit)}
          onArchive={(studentToArchive) => handleRequestArchive(studentToArchive)}
          onDelete={(studentId) => handleRequestDelete(studentId)}
        />
      ) : (
        <>
          {/* 1. رأس الصفحة */}
          <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-start w-full sm:w-auto">
              <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-appText-main leading-snug">
                  {t('students_management_title', 'شؤون الطلاب والمسار التعليمي')}
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
              <span>{t('add_new_student', 'إضافة طالب جديد')}</span>
            </button>
          </div>

          {/* 2. كروت الإحصائيات */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div 
              onClick={() => setStatusFilter('all')}
              className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'all' ? 'border-primary ring-1 ring-primary' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-primary"></div>
              <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('total_students', 'إجمالي الطلاب')}</p>
              <p className="text-base sm:text-xl font-bold text-appText-main mt-1">{stats.total}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('active')}
              className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'active' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-emerald-500"></div>
              <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('status_active', 'النشطون')}</p>
              <p className="text-base sm:text-xl font-bold text-emerald-400 mt-1">{stats.active}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('inactive')}
              className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'inactive' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-rose-500"></div>
              <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('status_inactive', 'غير النشطين')}</p>
              <p className="text-base sm:text-xl font-bold text-rose-400 mt-1">{stats.inactive}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('archived')}
              className={`bg-dark-card border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'archived' ? 'border-sky-500 ring-1 ring-sky-500' : 'border-appBorder-card hover:border-appBorder-card/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-sky-500"></div>
              <p className="text-[10px] sm:text-xs text-appText-sub whitespace-nowrap font-medium">{t('common.archived', 'المؤرشفون')}</p>
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
                  placeholder={t('search_placeholder', 'ابحث عن طالب بالاسم، الهاتف، أو السورة الحالية...')}
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
                  type="button"
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
              {t('loading', 'جاري تحميل البيانات...')}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-dark-card rounded-2xl border border-appBorder-card space-y-2">
              <Users className="w-10 h-10 text-appText-muted mx-auto" />
              <p className="text-appText-main font-medium text-sm">
                {t('no_search_results', 'لم يتم العثور على نتائج تطابق بحثك.')}
              </p>
              <p className="text-xs text-appText-sub">
                {t('students.no_match_hint', 'جرّب تغيير البحث أو إضافة طالب جديد')}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
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
                  getStatusBadge={() => renderStatusBadge(student, t)}
                  calendarType={calendarType}
                />
              ))}
            </div>
          )}
        </>
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
