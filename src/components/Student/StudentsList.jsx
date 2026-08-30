// src/components/Student/StudentsList.jsx

import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
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

  // شارات الحالة المتوافقة مع ألوان الهوية الرسمية (brandEmerald)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brandEmerald-bg text-brandEmerald border border-brandEmerald-border">
            <UserCheck className="w-3.5 h-3.5" />
            نشط
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <UserX className="w-3.5 h-3.5" />
            غير نشط
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-dark-input text-appText-sub border border-appBorder-input">
            <AlertCircle className="w-3.5 h-3.5" />
            غير محدد
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
          if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
            if (onDeleteStudent) {
              const res = await onDeleteStudent(studentId);
              if (res?.success) {
                if (setStudents) {
                  setStudents((prev) => prev.filter((s) => s.id !== studentId));
                }
                setSelectedStudent(null);
              } else {
                alert('فشل الحذف من قاعدة البيانات: ' + (res?.error || 'حدث خطأ غير معروف'));
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
    { label: 'جميع الحالات', value: 'all' },
    { label: 'نشط فقط', value: 'active' },
    { label: 'غير نشط فقط', value: 'inactive' },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* 1. كارت الهيدر الرئيسي */}
      <div className="bg-dark-card border border-appBorder-card rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
        <h1 className="text-2xl font-bold text-appText-main flex items-center justify-center gap-2">
          قائمة الطلاب
          <Users className="w-7 h-7 text-primary" />
        </h1>
        <p className="text-sm text-appText-sub mt-2">
          إدارة وتنظيم بيانات الطلاب والمتابعة اليومية
        </p>

        {/* زر إضافة طالب جديد المعتمد على متغيّرات primary */}
        <button 
          onClick={handleOpenAddModal} 
          className="mt-5 w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-appText-main font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-glow active:scale-95 mx-auto"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* 2. كروت الإحصائيات (إجمالي الطلاب - النشطون - غير النشطين) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 text-center">
          <p className="text-xs text-appText-sub">إجمالي الطلاب</p>
          <p className="text-xl sm:text-2xl font-bold text-appText-main mt-1">{stats.total}</p>
        </div>
        <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 text-center">
          <p className="text-xs text-appText-sub">النشطون</p>
          <p className="text-xl sm:text-2xl font-bold text-brandEmerald mt-1">{stats.active}</p>
        </div>
        <div className="bg-dark-card border border-appBorder-card rounded-2xl p-4 text-center">
          <p className="text-xs text-appText-sub">غير النشطين</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* 3. أدوات البحث والتصفية */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الطالب أو رقم الهاتف..."
            className="w-full bg-dark-input border border-appBorder-input focus:border-appBorder-hover text-appText-main placeholder-appText-muted rounded-2xl px-4 py-3 pl-11 focus:outline-none text-right transition-colors"
          />
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-appText-muted" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={statusOptions}
              placeholder="جميع الحالات"
            />
          </div>
          <button className="p-3 bg-dark-card border border-appBorder-card rounded-2xl text-appText-sub hover:text-appText-main transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4. قائمة الطلاب المفلترة */}
      {isLoading ? (
        <div className="text-center py-12 text-appText-sub">جاري تحميل الطلاب...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-dark-card/50 rounded-2xl border border-dashed border-appBorder-card">
          <Users className="w-12 h-12 text-appText-muted mx-auto mb-3" />
          <p className="text-appText-main font-medium">لا يوجد طلاب مطبقون للبحث</p>
          <p className="text-xs text-appText-sub mt-1">جرّب تغيير البحث أو إضافة طالب جديد</p>
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
