import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import StudentItemCard from './StudentItemCard';
import StudentProfile from './StudentProfile';
import AddStudentModal from './AddStudentModal';
import { formatName } from '@/utils/formatters';

const StudentsList = ({ students = [], setStudents, academyId, halaqas = [], isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // حالة التحكم في فتح المودال والطالب المراد تعديله
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const formattedName = formatName(student.name || '');
      const matchesSearch =
        formattedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.phone && student.phone.includes(searchQuery));
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter((s) => s.status === 'active').length,
      inactive: students.filter((s) => s.status === 'inactive').length,
    };
  }, [students]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brandEmerald-bg text-brandEmerald border border-brandEmerald-border">
            <UserCheck className="w-3 h-3" />
            نشط
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <UserX className="w-3 h-3" />
            غير نشط
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-dark-input text-appText-sub border border-appBorder-input">
            <AlertCircle className="w-3 h-3" />
            غير محدد
          </span>
        );
    }
  };

  // دالة التعامل مع فتح مودال الإضافة
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  // دالة التعامل مع فتح مودال التعديل
  const handleOpenEditModal = (studentToEdit) => {
    setEditingStudent(studentToEdit);
    setIsAddModalOpen(true);
  };

  // دالة النجاح الموحدة للإضافة والتعديل
  const handleModalSuccess = (savedStudent) => {
    if (!savedStudent) return;

    if (setStudents) {
      setStudents((prev) => {
        const exists = prev.some((s) => s.id === savedStudent.id);
        if (exists) {
          // تحديث بيانات طالب موجود
          return prev.map((s) => (s.id === savedStudent.id ? savedStudent : s));
        }
        // إضافة طالب جديد
        return [savedStudent, ...prev];
      });
    }

    // إذا كان الطالب المندرج حالياً هو المفتوح في صفحة العرض التفصيلية، نحدث بياناته
    if (selectedStudent && selectedStudent.id === savedStudent.id) {
      setSelectedStudent(savedStudent);
    }

    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  // عرض ملف الطالب الشخصي عند الاختيار
  if (selectedStudent) {
    return (
      <StudentProfile
        student={selectedStudent}
        academyId={academyId}
        halaqas={halaqas}
        onBack={() => setSelectedStudent(null)}
        onEdit={(studentToEdit) => handleOpenEditModal(studentToEdit)}
        onDelete={(studentId) => {
          if (setStudents) {
            setStudents((prev) => prev.filter((s) => s.id !== studentId));
          }
          setSelectedStudent(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* الهيدر وزر الإضافة */}
      <div className="card-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            قائمة الطلاب
          </h1>
          <p className="text-sm text-appText-sub mt-1">
            إدارة وتنظيم بيانات الطلاب والمتابعة اليومية
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn-primary w-fit">
          <Plus className="w-5 h-5" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* كروت الإحصائيات السريعة */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card-surface text-center p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-appText-sub">إجمالي الطلاب</p>
          <p className="text-lg sm:text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="card-surface text-center p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-appText-sub">النشطون</p>
          <p className="text-lg sm:text-2xl font-bold text-brandEmerald mt-1">{stats.active}</p>
        </div>
        <div className="card-surface text-center p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-appText-sub">غير النشطين</p>
          <p className="text-lg sm:text-2xl font-bold text-rose-400 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* أدوات البحث والتصفية */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-appText-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الطالب أو رقم الهاتف..."
            className="app-input pr-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-appText-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="app-input max-w-[160px]"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">غير نشط فقط</option>
          </select>
        </div>
      </div>

      {/* قائمة الطلاب */}
      {isLoading ? (
        <div className="text-center py-12 text-appText-sub">جاري تحميل الطلاب...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-dark-card/50 rounded-2xl border border-dashed border-appBorder-card">
          <Users className="w-12 h-12 text-appText-muted mx-auto mb-3 opacity-50" />
          <p className="text-white font-medium">لا يوجد طلاب مطبقون للبحث</p>
          <p className="text-xs text-appText-sub mt-1">جرّب تغيير البحث أو إضافة طالب جديد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* مودال الإضافة / التعديل */}
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
