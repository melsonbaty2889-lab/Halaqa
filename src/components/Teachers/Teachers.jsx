import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, UserCheck, ShieldCheck } from 'lucide-react';
import AddStaffModal from './AddStaffModal';
import TeacherCard from './TeacherCard';
import TeacherFilter from './TeacherFilter';
import TeacherAvailabilityManager from './TeacherAvailabilityManager';

export default function Teachers({ 
  academyId, 
  teachers = [], 
  setTeachers, 
  halaqas = [], 
  onRefresh, 
  t, 
  isRtl = true 
}) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('all');
  const [selectedIjaza, setSelectedIjaza] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherForAvailability, setSelectedTeacherForAvailability] = useState(null);

  const translate = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      const res = t(key);
      if (res && typeof res === 'string' && res !== key) return res;
    }
    return fallback;
  }, [t]);

  const fetchStaff = useCallback(async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    if (!academyId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('academy_id', academyId);

      if (error) throw error;
      if (setTeachers) {
        setTeachers(data || []);
      }
    } catch (err) {
      console.error('🚨 Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId, onRefresh, setTeachers]);

  // جلب البيانات فقط عند الحاجة وعدم وجود بيانات ممررة
  useEffect(() => {
    if (academyId && (!teachers || teachers.length === 0) && !onRefresh) {
      fetchStaff();
    }
  }, [academyId, teachers, onRefresh, fetchStaff]);

  const toggleStatus = async (teacherId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: !currentStatus })
        .eq('id', teacherId);

      if (error) throw error;
      if (setTeachers) {
        setTeachers(prev => prev.map(item => item.id === teacherId ? { ...item, is_active: !currentStatus } : item));
      }
    } catch (err) {
      console.error('🚨 Error updating teacher status:', err);
    }
  };

  const filteredStaff = (teachers || []).filter(person => {
    const matchesSearch = (person.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (person.phone || '').includes(searchTerm);
    const matchesTitle = selectedTitle === 'all' || person.title === selectedTitle;
    const matchesIjaza = selectedIjaza === 'all' || 
                         (Array.isArray(person.ijazas) && person.ijazas.includes(selectedIjaza));

    return matchesSearch && matchesTitle && matchesIjaza;
  });

  return (
    <div className={`space-y-6 ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'} font-['Cairo',sans-serif]`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Users className="w-6 h-6 text-[#E07A00]" /> 
            {translate('teachers_title', 'الكادر التعليمي والإداري')}
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            {translate('teachers_desc', 'إدارة المعلمين والمشرفين ومدراء الأكاديمية')}
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#E07A00] hover:bg-[#C66B00] transition-colors shadow-lg shadow-[#E07A00]/10 active:scale-95"
        >
          <Plus className="w-4 h-4" /> 
          {translate('add_staff', 'إضافة كادر جديد')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A]/85 border border-[#1B2738] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#94A3B8]">{translate('total_staff', 'إجمالي الكادر')}</p>
            <p className="text-2xl font-bold text-white mt-1">{teachers.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#E07A00]/10 text-[#E07A00]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A]/85 border border-[#1B2738] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#94A3B8]">{translate('active_teaching', 'المعلمون المباشرون للحلقات')}</p>
            <p className="text-2xl font-bold text-[#10B981] mt-1">{teachers.filter(s => s.is_teaching).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#09332C] text-[#10B981] border border-[#0D5C4D]">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A]/85 border border-[#1B2738] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#94A3B8]">{translate('active_accounts', 'الحسابات النشطة')}</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{teachers.filter(s => s.is_active).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <TeacherFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTitle={selectedTitle}
        setSelectedTitle={setSelectedTitle}
        selectedIjaza={selectedIjaza}
        setSelectedIjaza={setSelectedIjaza}
        onRefresh={fetchStaff}
        t={translate}
      />

      {/* Availability Manager Drawer */}
      {selectedTeacherForAvailability && (
        <div className="p-4 bg-[#0F172A] rounded-2xl border border-[#E07A00]/40 relative">
          <button 
            onClick={() => setSelectedTeacherForAvailability(null)}
            className="absolute top-4 left-4 text-xs text-[#94A3B8] hover:text-white"
          >
            ✕ {translate('close', 'إغلاق')}
          </button>
          <TeacherAvailabilityManager teacherId={selectedTeacherForAvailability} />
        </div>
      )}

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-[#94A3B8] text-xs">{translate('loading', 'جاري تحميل البيانات...')}</div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-[#0F172A]/40 rounded-2xl border border-dashed border-[#1B2738] text-[#94A3B8] text-xs">
          {translate('no_teachers_found', 'لا توجد نتائج تطابق خيارات البحث')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((person) => (
            <TeacherCard 
              key={person.id}
              person={person}
              onToggleStatus={toggleStatus}
              onManageAvailability={(id) => setSelectedTeacherForAvailability(prev => prev === id ? null : id)}
              t={translate}
            />
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <AddStaffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStaff}
        academyId={academyId}
      />
    </div>
  );
}
