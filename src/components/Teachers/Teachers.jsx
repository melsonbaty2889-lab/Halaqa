/* src/components/Teachers/Teachers.jsx */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import PageLayout from '@/components/UI/PageLayout'; 

import AddStaffModal from './AddStaffModal';
import TeacherFilter from './TeacherFilter';
import TeacherStats from './TeacherStats';
import TeacherGrid from './TeacherGrid';
import TeacherAvailabilityManager from './TeacherAvailabilityManager';

export default function Teachers({ 
  academyId, 
  teachers = [], 
  setTeachers, 
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

  // جلب بيانات الكادر من Supabase عند الحاجة
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

  // تحديث حالة المعلم (نشط / غير نشط)
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

  // فلترة الكادر بناءً على البحث، المسمى، والإجازة
  const filteredStaff = (teachers || []).filter(person => {
    const matchesSearch = (person.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (person.phone || '').includes(searchTerm);
    
    // مطابقة المسمى أو الحالة بناءً على الفلتر المختار
    let matchesTitle = true;
    if (selectedTitle === 'quran_teacher') {
      matchesTitle = person.is_teaching === true;
    } else if (selectedTitle === 'active') {
      matchesTitle = person.is_active === true;
    } else if (selectedTitle !== 'all') {
      matchesTitle = person.title === selectedTitle;
    }

    const matchesIjaza = selectedIjaza === 'all' || (person.ijazas && person.ijazas.includes(selectedIjaza));

    return matchesSearch && matchesTitle && matchesIjaza;
  });

  // 1. زر الإضافة الرئيسي
  const actionButton = (
    <button 
      onClick={() => setIsModalOpen(true)} 
      className={`${UI.btnPrimary} w-full sm:w-auto cursor-pointer`}
    >
      <Plus className="w-4 h-4" /> 
      <span>{t('teachers.addStaff', 'إضافة كادر جديد')}</span>
    </button>
  );

  // 2. بطاقات الإحصائيات المستقلة
  const statsGrid = (
    <TeacherStats 
      teachers={teachers} 
      selectedTitle={selectedTitle} 
      setSelectedTitle={setSelectedTitle} 
      t={t} 
    />
  );

  // 3. شريط الفلترة والبحث
  const filterBar = (
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
  );

  return (
    <PageLayout
      title={t('teachers.title', 'الكادر التعليمي والإداري')}
      description={t('teachers.description', 'إدارة المعلمين والمشرفين ومدراء الأكاديمية باحترافية عالية')}
      icon={Users}
      actionButton={actionButton}
      statsGrid={statsGrid}
      filterBar={filterBar}
      loading={loading}
      isRtl={isRtl}
      t={t}
    >
      {/* 4. قسم إدارة أوقات التفرغ */}
      {selectedTeacherForAvailability && (
        <div className={`${UI.card} relative border-semantic-actionPrimary/40 animate-fade-in`}>
          <button 
            onClick={() => setSelectedTeacherForAvailability(null)}
            className="absolute top-4 end-4 text-xs font-bold text-semantic-textSecondary hover:text-semantic-textPrimary cursor-pointer bg-semantic-surfaceInput px-2.5 py-1 rounded-lg border border-semantic-borderCard transition-colors"
          >
            ✕ {t('common.close', 'إغلاق')}
          </button>
          <TeacherAvailabilityManager teacherId={selectedTeacherForAvailability} />
        </div>
      )}

      {/* 5. شبكة عرض بطاقات الكادر */}
      <TeacherGrid 
        teachers={filteredStaff}
        onToggleStatus={toggleStatus}
        onManageAvailability={(id) => setSelectedTeacherForAvailability(id)}
        t={t}
      />

      {/* 6. نافذة إضافة كادر جديد */}
      <AddStaffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStaff}
        academyId={academyId}
      />
    </PageLayout>
  );
}
