// src/components/Teachers/Teachers.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageLayout from '@/components/UI/PageLayout';
import Select from '@/components/UI/Select';

import TeacherStats from './TeacherStats';
import TeacherFilter from './TeacherFilter';
import TeacherGrid from './TeacherGrid';
import AddStaffModal from './AddStaffModal';
import TeacherAvailabilityManager from './TeacherAvailabilityManager';
import { getStaffTitles } from '@/constants/staffTitles';
import { getIjazatOptions } from '@/constants/ijazat';

export default function Teachers({ academyId, teachers = [], setTeachers, onRefresh }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [titleFilter, setTitleFilter] = useState('all');
  const [ijazaFilter, setIjazaFilter] = useState('all');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeacherForAvailability, setSelectedTeacherForAvailability] = useState(null);

  const fetchStaff = useCallback(async () => {
    if (onRefresh) return onRefresh();
    if (!academyId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from('teachers').select('*').eq('academy_id', academyId);
      if (error) throw error;
      if (setTeachers) setTeachers(data || []);
    } catch (err) {
      console.error('🚨 Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId, onRefresh, setTeachers]);

  useEffect(() => {
    if (academyId && teachers.length === 0 && !setTeachers) fetchStaff();
  }, [academyId, teachers.length, setTeachers, fetchStaff]);

  const toggleStatus = async (teacherId, currentStatus) => {
    try {
      const { error } = await supabase.from('teachers').update({ is_active: !currentStatus }).eq('id', teacherId);
      if (error) throw error;
      if (setTeachers) {
        setTeachers(prev => prev.map(item => item.id === teacherId ? { ...item, is_active: !currentStatus } : item));
      }
    } catch (err) {
      console.error('🚨 Error updating status:', err);
    }
  };

  const filteredTeachers = (teachers || []).filter(person => {
    const matchesSearch = (person.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (person.phone || '').includes(searchQuery);
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = person.is_active === true;
    if (statusFilter === 'teaching') matchesStatus = person.is_teaching === true;

    const matchesTitle = titleFilter === 'all' || person.title === titleFilter;
    const matchesIjaza = ijazaFilter === 'all' || (person.ijazas && person.ijazas.includes(ijazaFilter));

    return matchesSearch && matchesStatus && matchesTitle && matchesIjaza;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTitleFilter('all');
    setIjazaFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || titleFilter !== 'all' || ijazaFilter !== 'all';

  const titlesList = getStaffTitles(t);
  const titleOptions = [
    { label: t('teachers.allTitles', 'جميع المسميات'), value: 'all' },
    ...titlesList.map(item => ({ value: item.value, label: item.label }))
  ];

  const ijazatOptions = getIjazatOptions(t);
  const ijazaOptions = [
    { label: t('teachers.allIjazat', 'جميع الإجازات'), value: 'all' },
    ...ijazatOptions.map(item => ({ value: item.id, label: item.label }))
  ];

  const statusOptions = [
    { label: t('teachers.filter_status', 'جميع الحالات'), value: 'all' },
    { label: t('status_active', 'حسابات نشطة'), value: 'active' },
    { label: t('teachers.activeTeaching', 'معلمون مباشرون'), value: 'teaching' },
  ];

  return (
    <>
      <PageLayout
        title={t('teachers.title', 'الكادر التعليمي والإداري')}
        subtitle={t('teachers.subtitle', 'إدارة وتنظيم بيانات المعلمين والمشرفين')}
        icon={Users}
        actionButtonText={t('teachers.addStaff', 'إضافة كادر جديد')}
        onActionButtonClick={() => setIsAddModalOpen(true)}
        statsGrid={
          <TeacherStats 
            teachers={teachers} 
            statusFilter={statusFilter} 
            setStatusFilter={setStatusFilter} 
            t={t} 
          />
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('teachers.searchPlaceholder', 'البحث بالاسم، الهاتف...')}
        filtersChildren={
          <>
            <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder={t('teachers.filter_status', 'حالة الحساب')} />
            <Select value={titleFilter} onChange={setTitleFilter} options={titleOptions} placeholder={t('teachers.allTitles', 'جميع المسميات')} />
            <Select value={ijazaFilter} onChange={setIjazaFilter} options={ijazaOptions} placeholder={t('teachers.allIjazat', 'جميع الإجازات')} />
          </>
        }
        totalCount={teachers.length}
        filteredCount={filteredTeachers.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onRefresh={fetchStaff}
        countUnitText="فرد"
        isLoading={loading}
        isRtl={isRtl}
        t={t}
      >
        {/* قسم إدارة أوقات التفرغ */}
        {selectedTeacherForAvailability && (
          <div className="bg-semantic-surfaceCard border border-semantic-actionPrimary/40 rounded-2xl p-4 relative animate-fade-in mb-4">
            <button 
              onClick={() => setSelectedTeacherForAvailability(null)}
              className="absolute top-4 end-4 text-xs font-bold text-semantic-textSecondary hover:text-semantic-textPrimary cursor-pointer bg-semantic-surfaceInput px-2.5 py-1 rounded-lg border border-semantic-borderCard"
            >
              ✕ {t('common.close', 'إغلاق')}
            </button>
            <TeacherAvailabilityManager teacherId={selectedTeacherForAvailability} />
          </div>
        )}

        {/* شبكة عرض البطاقات */}
        <TeacherGrid 
          teachers={filteredTeachers}
          loading={loading}
          onToggleStatus={toggleStatus}
          onManageAvailability={(id) => setSelectedTeacherForAvailability(id)}
          onResetFilters={resetFilters}
          t={t}
        />
      </PageLayout>

      {/* نافذة إضافة كادر جديد */}
      {isAddModalOpen && (
        <AddStaffModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          academyId={academyId}
          onSuccess={fetchStaff}
        />
      )}
    </>
  );
}
