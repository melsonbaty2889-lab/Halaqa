import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, UserCheck, ShieldCheck } from 'lucide-react';
import { colors as C } from '@/theme/colors';
import { Btn } from '@/components/UI/UI';
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

  const translate = (key, fallback) => {
    if (typeof t === 'function') {
      const res = t(key);
      if (res && typeof res === 'string') return res;
    }
    return fallback;
  };

  const fetchStaff = async () => {
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
  };

  useEffect(() => {
    if (academyId && teachers.length === 0) {
      fetchStaff();
    }
  }, [academyId]);

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
    const matchesIjaza = selectedIjaza === 'all' || (person.ijazas && person.ijazas.includes(selectedIjaza));

    return matchesSearch && matchesTitle && matchesIjaza;
  });

  return (
    <div className={`space-y-6 ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Users className="w-6 h-6" style={{ color: C.primary?.DEFAULT || '#F59E0B' }} /> 
            {translate('teachers_title', isRtl ? 'الكادر التعليمي والإداري' : 'Teaching & Administrative Staff')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {translate('teachers_desc', isRtl ? 'إدارة المعلمين والمشرفين ومدراء الأكاديمية' : 'Manage teachers, supervisors, and academy managers')}
          </p>
        </div>

        <Btn onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2 shadow-lg">
          <Plus className="w-4 h-4" /> 
          {translate('add_staff', isRtl ? 'إضافة كادر جديد' : 'Add New Staff')}
        </Btn>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{translate('total_staff', isRtl ? 'إجمالي الكادر' : 'Total Staff')}</p>
            <p className="text-2xl font-bold text-white mt-1">{teachers.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{translate('active_teaching', isRtl ? 'المعلمون المباشرون للحلقات' : 'Active Teaching Staff')}</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{teachers.filter(s => s.is_teaching).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{translate('active_accounts', isRtl ? 'الحسابات النشطة' : 'Active Accounts')}</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{teachers.filter(s => s.is_active).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
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
        <div className="p-4 bg-slate-900 rounded-2xl border border-amber-500/30 relative">
          <button 
            onClick={() => setSelectedTeacherForAvailability(null)}
            className="absolute top-4 left-4 text-xs text-slate-400 hover:text-white"
          >
            ✕ {translate('close', isRtl ? 'إغلاق' : 'Close')}
          </button>
          <TeacherAvailabilityManager teacherId={selectedTeacherForAvailability} />
        </div>
      )}

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">{translate('loading', isRtl ? 'جاري تحميل البيانات...' : 'Loading...')}</div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs">
          {translate('no_teachers_found', isRtl ? 'لا توجد نتائج تطابق خيارات البحث' : 'No records match search parameters')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((person) => (
            <TeacherCard 
              key={person.id}
              person={person}
              onToggleStatus={toggleStatus}
              onManageAvailability={(id) => setSelectedTeacherForAvailability(id)}
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
