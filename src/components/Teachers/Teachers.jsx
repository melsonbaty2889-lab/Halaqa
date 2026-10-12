import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, UserCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddStaffModal from './AddStaffModal';
import TeacherCard from './TeacherCard';
import TeacherFilter from './TeacherFilter';
import TeacherAvailabilityManager from './TeacherAvailabilityManager';

export default function Teachers({ 
  academyId, 
  teachers = [], 
  setTeachers, 
  halaqas = [], 
  onRefresh
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('all');
  const [selectedIjaza, setSelectedIjaza] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherForAvailability, setSelectedTeacherForAvailability] = useState(null);

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

  useEffect(() => {
    if (academyId && teachers.length === 0 && !setTeachers) {
      fetchStaff();
    }
  }, [academyId, teachers.length, setTeachers, fetchStaff]);

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
    <div className={`px-3 sm:px-5 space-y-6 ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'} font-['Cairo',sans-serif]`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-semantic-textPrimary">
            <Users className="w-6 h-6 text-semantic-actionPrimary" /> 
            {t('teachers.title', 'الكادر التعليمي والإداري')}
          </h2>
          <p className="text-xs text-semantic-textSecondary mt-1">
            {t('teachers.description', 'إدارة المعلمين والمشرفين ومدراء الأكاديمية')}
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full md:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 
          {t('teachers.addStaff', 'إضافة كادر جديد')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-surface flex items-center justify-between">
          <div>
            <p className="text-xs text-semantic-textSecondary">{t('teachers.totalStaff', 'إجمالي الكادر')}</p>
            <p className="text-2xl font-bold text-semantic-textPrimary mt-1">
              <bdi>{teachers.length}</bdi>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="card-surface flex items-center justify-between">
          <div>
            <p className="text-xs text-semantic-textSecondary">{t('teachers.activeTeaching', 'المعلمون المباشرون للحلقات')}</p>
            <p className="text-2xl font-bold text-semantic-success mt-1">
              <bdi>{teachers.filter(s => s.is_teaching).length}</bdi>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="card-surface flex items-center justify-between">
          <div>
            <p className="text-xs text-semantic-textSecondary">{t('teachers.activeAccounts', 'الحسابات النشطة')}</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">
              <bdi>{teachers.filter(s => s.is_active).length}</bdi>
            </p>
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
        t={t}
      />

      {/* Availability Manager Drawer */}
      {selectedTeacherForAvailability && (
        <div className="card-surface relative border-semantic-actionPrimary/40">
          <button 
            onClick={() => setSelectedTeacherForAvailability(null)}
            className="absolute top-4 left-4 text-xs text-semantic-textSecondary hover:text-semantic-textPrimary cursor-pointer"
          >
            ✕ {t('common.close', 'إغلاق')}
          </button>
          <TeacherAvailabilityManager teacherId={selectedTeacherForAvailability} />
        </div>
      )}

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-semantic-textSecondary text-xs">{t('common.loading', 'جاري تحميل البيانات...')}</div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 card-surface border-dashed text-semantic-textSecondary text-xs">
          {t('teachers.noTeachersFound', 'لا توجد نتائج تطابق خيارات البحث')}
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
