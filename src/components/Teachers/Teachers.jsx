import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, UserCheck, ShieldCheck } from 'lucide-react';
import { C } from '@/theme/colors';
import { Btn } from '@/components/UI/UI';
import AddStaffModal from './AddStaffModal';
import TeacherCard from './TeacherCard';
import TeacherFilter from './TeacherFilter';
import TeacherAvailabilityManager from './TeacherAvailabilityManager';

export default function Teachers({ academyId, t = (s) => s }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('all');
  const [selectedIjaza, setSelectedIjaza] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherForAvailability, setSelectedTeacherForAvailability] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id, name, email, phone, title, is_teaching, ijazas,
          employment_type, hourly_rate, monthly_salary, timezone, is_active,
          academy_teachers!inner(academy_id)
        `)
        .eq('academy_teachers.academy_id', academyId)
        .eq('academy_teachers.is_active', true);

      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('🚨 Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (academyId) fetchStaff();
  }, [academyId]);

  const toggleStatus = async (teacherId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: !currentStatus })
        .eq('id', teacherId);

      if (error) throw error;
      setStaff(prev => prev.map(item => item.id === teacherId ? { ...item, is_active: !currentStatus } : item));
    } catch (err) {
      console.error('🚨 Error updating status:', err);
    }
  };

  const filteredStaff = staff.filter(person => {
    const matchesSearch = (person.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (person.phone || '').includes(searchTerm);
    const matchesTitle = selectedTitle === 'all' || person.title === selectedTitle;
    const matchesIjaza = selectedIjaza === 'all' || (person.ijazas && person.ijazas.includes(selectedIjaza));

    return matchesSearch && matchesTitle && matchesIjaza;
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Users className="w-6 h-6" style={{ color: C.primary }} /> {t('الكادر التعليمي والإداري')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{t('إدارة المعلمين والمشرفين ومدراء الأكاديمية')}</p>
        </div>

        <Btn onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2 shadow-lg">
          <Plus className="w-4 h-4" /> {t('إضافة كادر جديد')}
        </Btn>
      </div>

      {/* 2. Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{t('إجمالي الكادر')}</p>
            <p className="text-2xl font-bold text-white mt-1">{staff.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{t('المعلمون المباشرون للحلقات')}</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{staff.filter(s => s.is_teaching).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{t('الحسابات النشطة')}</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{staff.filter(s => s.is_active).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <TeacherFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTitle={selectedTitle}
        setSelectedTitle={setSelectedTitle}
        selectedIjaza={selectedIjaza}
        setSelectedIjaza={setSelectedIjaza}
        onRefresh={fetchStaff}
        t={t}
      />

      {/* 4. Availability Modal / Inline Drawer */}
      {selectedTeacherForAvailability && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-amber-500/30 relative">
          <button 
            onClick={() => setSelectedTeacherForAvailability(null)}
            className="absolute top-4 left-4 text-xs text-slate-400 hover:text-white"
          >
            ✕ إغلاق
          </button>
          <TeacherAvailabilityManager teacherId={selectedTeacherForAvailability} />
        </div>
      )}

      {/* 5. Teachers Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">{t('جاري تحميل البيانات...')}</div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs">
          {t('لا توجد نتائج تطابق خيارات البحث')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((person) => (
            <TeacherCard 
              key={person.id}
              person={person}
              onToggleStatus={toggleStatus}
              onManageAvailability={(id) => setSelectedTeacherForAvailability(id)}
              t={t}
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
