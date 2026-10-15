// src/components/Teachers/Teachers.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import TeacherStats from './TeacherStats';
import TeacherFilter from './TeacherFilter';
import TeacherGrid from './TeacherGrid';
import AddStaffModal from './AddStaffModal';
import TeacherAvailabilityManager from './TeacherAvailabilityManager';

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

  return (
    <div className="space-y-4 text-semantic-textPrimary" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. الترويسة الرئيسية */}
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-start w-full sm:w-auto">
          <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-semantic-textPrimary leading-snug">
              {t('teachers.title', 'الكادر التعليمي والإداري')}
            </h1>
            <p className="text-xs text-semantic-textSecondary">
              {t('teachers.subtitle', 'إدارة وتنظيم بيانات المعلمين والمشرفين')}
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => setIsAddModalOpen(true)} 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-semantic-actionPrimary text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('teachers.addStaff', 'إضافة كادر جديد')}</span>
        </button>
      </div>

      {/* 2. الإحصائيات في مكون مستقل */}
      <TeacherStats 
        teachers={teachers} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
        t={t} 
      />

      {/* 3. الفلترة في مكون مستقل */}
      <TeacherFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        titleFilter={titleFilter}
        setTitleFilter={setTitleFilter}
        ijazaFilter={ijazaFilter}
        setIjazaFilter={setIjazaFilter}
        totalCount={teachers.length}
        filteredCount={filteredTeachers.length}
        onRefresh={fetchStaff}
        t={t}
      />

      {/* 4. إدارة المواعيد والتفرغ */}
      {selectedTeacherForAvailability && (
        <div className="bg-semantic-surfaceCard border border-semantic-actionPrimary/40 rounded-2xl p-4 relative animate-fade-in">
          <button 
            onClick={() => setSelectedTeacherForAvailability(null)}
            className="absolute top-4 end-4 text-xs font-bold text-semantic-textSecondary hover:text-semantic-textPrimary cursor-pointer bg-semantic-surfaceInput px-2.5 py-1 rounded-lg border border-semantic-borderCard"
          >
            ✕ {t('common.close', 'إغلاق')}
          </button>
          <TeacherAvailabilityManager teacherId={selectedTeacherForAvailability} />
        </div>
      )}

      {/* 5. شبكة البطاقات في مكون مستقل */}
      <TeacherGrid 
        teachers={filteredTeachers}
        loading={loading}
        onToggleStatus={toggleStatus}
        onManageAvailability={(id) => setSelectedTeacherForAvailability(id)}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setTitleFilter('all');
          setIjazaFilter('all');
        }}
        t={t}
      />

      {/* 6. نافذة الإضافة */}
      {isAddModalOpen && (
        <AddStaffModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          academyId={academyId}
          onSuccess={fetchStaff}
        />
      )}
    </div>
  );
}
