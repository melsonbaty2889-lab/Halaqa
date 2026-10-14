/* src/components/Teachers/Teachers.jsx */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, UserCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';

// استيراد المكونات الفرعية لصفحة الكادر
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

  return (
    <div className={`px-3 sm:px-5 space-y-6 ${isRtl ? 'text-right' : 'text-left'} font-cairo`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. الترويسة الرئيسية وزر الإضافة (مطابقة تماماً لصفحة الحلقات) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-surface bg-gradient-to-r from-semantic-surfaceCard via-semantic-surfaceSecondary to-semantic-surfaceCard">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-semantic-actionPrimary/15 text-semantic-actionPrimary border border-semantic-actionPrimary/30">
              <Users className="w-5 h-5" />
            </span>
            <h2 className={UI.title}>
              {t('teachers.title', 'الكادر التعليمي والإداري')}
            </h2>
          </div>
          <p className={UI.subtitle}>
            {t('teachers.description', 'إدارة المعلمين والمشرفين ومدراء الأكاديمية باحترافية عالية')}
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)} 
          className={`${UI.btnPrimary} w-full sm:w-auto cursor-pointer`}
        >
          <Plus className="w-4 h-4" /> 
          <span>{t('teachers.addStaff', 'إضافة كادر جديد')}</span>
        </button>
      </div>

      {/* 2. بطاقات الإحصائيات الثلاثية (مطابقة لصفحة الحلقات تماماً) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${UI.card} flex items-center justify-between`}>
          <div>
            <p className="text-xs text-semantic-textSecondary">{t('teachers.totalStaff', 'إجمالي الكادر')}</p>
            <p className="text-2xl font-extrabold text-semantic-textPrimary mt-1">
              <bdi>{teachers.length}</bdi>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className={`${UI.card} flex items-center justify-between`}>
          <div>
            <p className="text-xs text-semantic-textSecondary">{t('teachers.activeTeaching', 'المعلمون المباشرون للحلقات')}</p>
            <p className="text-2xl font-extrabold text-semantic-success mt-1">
              <bdi>{teachers.filter(s => s.is_teaching).length}</bdi>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-semantic-successBg text-semantic-success border border-semantic-successBorder/40">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className={`${UI.card} flex items-center justify-between`}>
          <div>
            <p className="text-xs text-semantic-textSecondary">{t('teachers.activeAccounts', 'الحسابات النشطة')}</p>
            <p className="text-2xl font-extrabold text-sky-400 mt-1">
              <bdi>{teachers.filter(s => s.is_active).length}</bdi>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. شريط الفلترة والبحث المخصص */}
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

      {/* 5. شبكة عرض بطاقات الكادر أو حالات التحميل والفراغ */}
      {loading ? (
        <div className="text-center py-16 text-semantic-textSecondary text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-semantic-actionPrimary border-t-transparent animate-spin"></div>
          <span>{t('common.loading', 'جاري تحميل البيانات...')}</span>
        </div>
      ) : filteredStaff.length === 0 ? (
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
    </div>
  );
}
