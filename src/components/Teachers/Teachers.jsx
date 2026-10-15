/* src/components/Teachers/Teachers.jsx */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, UserCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import PageLayout from '@/components/UI/PageLayout'; 

import AddStaffModal from './AddStaffModal';
import TeacherCard from './TeacherCard';
import TeacherFilter from './TeacherFilter';
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
    const matchesTitle = selectedTitle === 'all' || person.title === selectedTitle;
    const matchesIjaza = selectedIjaza === 'all' || (person.ijazas && person.ijazas.includes(selectedIjaza));

    return matchesSearch && matchesTitle && matchesIjaza;
  });

  // 1. زر الإضافة الرئيسي الممرر للقالب
  const actionButton = (
    <button 
      onClick={() => setIsModalOpen(true)} 
      className={`${UI.btnPrimary} w-full sm:w-auto cursor-pointer`}
    >
      <Plus className="w-4 h-4" /> 
      <span>{t('teachers.addStaff', 'إضافة كادر جديد')}</span>
    </button>
  );

  // 2. بطاقات الإحصائيات المدمجة والتفاعلية (تغير الفلتر عند الضغط عليها)
  const statsGrid = (
    <>
      <button
        type="button"
        onClick={() => setSelectedTitle('all')}
        className={`${UI.card} !p-3 flex items-center justify-between text-start cursor-pointer transition-all hover:scale-[1.02] ${
          selectedTitle === 'all' ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary/40' : ''
        }`}
      >
        <div>
          <p className="text-[11px] text-semantic-textSecondary">{t('teachers.totalStaff', 'إجمالي الكادر')}</p>
          <p className="text-lg sm:text-2xl font-extrabold text-semantic-textPrimary mt-0.5">
            <bdi>{teachers.length}</bdi>
          </p>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </button>

      <button
        type="button"
        onClick={() => setSelectedTitle('quran_teacher')}
        className={`${UI.card} !p-3 flex items-center justify-between text-start cursor-pointer transition-all hover:scale-[1.02] ${
          selectedTitle === 'quran_teacher' ? 'border-semantic-success ring-1 ring-semantic-success/40' : ''
        }`}
      >
        <div>
          <p className="text-[11px] text-semantic-textSecondary">{t('teachers.activeTeaching', 'المعلمون المباشرون')}</p>
          <p className="text-lg sm:text-2xl font-extrabold text-semantic-success mt-0.5">
            <bdi>{teachers.filter(s => s.is_teaching).length}</bdi>
          </p>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-semantic-successBg text-semantic-success shrink-0">
          <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </button>

      <button
        type="button"
        onClick={() => setSelectedTitle('admin')}
        className={`${UI.card} !p-3 flex items-center justify-between text-start cursor-pointer transition-all hover:scale-[1.02] col-span-2 sm:col-span-1 ${
          selectedTitle === 'admin' ? 'border-sky-400 ring-1 ring-sky-400/40' : ''
        }`}
      >
        <div>
          <p className="text-[11px] text-semantic-textSecondary">{t('teachers.activeAccounts', 'الحسابات النشطة')}</p>
          <p className="text-lg sm:text-2xl font-extrabold text-sky-400 mt-0.5">
            <bdi>{teachers.filter(s => s.is_active).length}</bdi>
          </p>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </button>
    </>
  );

  // 3. شريط الفلترة والبحث الممرر للقالب
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
      {/* 4. قسم إدارة أوقات التفرغ (إن وجد معلم محدد) */}
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

      {/* 5. شبكة عرض بطاقات الكادر أو حالات الفراغ */}
      {filteredStaff.length === 0 ? (
        <div className={`text-center py-16 ${UI.card} border-dashed text-semantic-textSecondary text-xs flex flex-col items-center justify-center gap-2`}>
          <Users className="w-10 h-10 text-semantic-textMuted/50 mb-1" />
          <span className="font-bold text-semantic-textPrimary text-sm">{t('teachers.noTeachersFound', 'لا توجد نتائج تطابق خيارات البحث')}</span>
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
