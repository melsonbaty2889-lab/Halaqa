import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Users, UserCheck, UserX, AlertCircle, ArrowRight } from 'lucide-react';
import StudentItemCard from './StudentItemCard';
import StudentProfile from './StudentProfile';
import AddStudentModal from './AddStudentModal';
import { formatName } from '@/utils/formatters';

const StudentsList = ({ students = [], setStudents, academyId, halaqas = [], isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const formattedName = formatName(student.name || '');
      const matchesSearch = formattedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <AlertCircle className="w-3 h-3" />
            غير محدد
          </span>
        );
    }
  };

  // إذا تم اختيار طالب، نعرض بروفايل الطالب الشامل
  if (selectedStudent) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedStudent(null)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة الطلاب
        </button>
        <StudentProfile 
          student={selectedStudent} 
          academyId={academyId} 
          halaqas={halaqas}
          onUpdateStudent={(updated) => {
            if (setStudents) {
              setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
            }
            setSelectedStudent(updated);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الهيدر والإحصائيات السريعة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-400" />
            قائمة الطلاب
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            إدارة وتنظيم بيانات الطلاب والمتابعة اليومية
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          إضافة طالب جديد
        </button>
      </div>

      {/* كروت الإحصائيات المصغرة */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-slate-400">إجمالي الطلاب</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-100 mt-1">{stats.total}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-slate-400">النشطون</p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-slate-400">غير النشطين</p>
          <p className="text-lg sm:text-2xl font-bold text-rose-400 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* أدوات البحث والتصفية */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الطالب أو رقم الهاتف..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">غير نشط فقط</option>
          </select>
        </div>
      </div>

      {/* قائمة الطلاب */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">جاري تحميل الطلاب...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <p className="text-slate-300 font-medium">لا يوجد طلاب مطبقون للبحث</p>
          <p className="text-xs text-slate-500 mt-1">جرّب تغيير البحث أو إضافة طالب جديد</p>
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

      {/* مودال إضافة طالب جديد */}
      {isAddModalOpen && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          academyId={academyId}
          halaqas={halaqas}
          onStudentAdded={(newStudent) => {
            if (setStudents) {
              setStudents(prev => [newStudent, ...prev]);
            }
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default StudentsList;
