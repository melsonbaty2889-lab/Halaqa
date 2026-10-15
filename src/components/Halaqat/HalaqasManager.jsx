// src/components/Halaqat/HalaqasManager.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, CheckCircle, Users, Archive, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageLayout from '@/components/UI/PageLayout';
import Select from '@/components/UI/Select';

import HalaqaCardItem from './HalaqaCardItem';
import HalaqaFormModal from './HalaqaFormModal';

export default function HalaqasManager({ academyId, onRefresh }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;

  const [halaqas, setHalaqas] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // حالات الفلترة والبحث
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // active, no_teacher, archived, all
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHalaqa, setEditingHalaqa] = useState(null);

  // جلب البيانات من Supabase مع دعم التحديث الصامت في الخلفية
  const fetchData = useCallback(async (isBackground = false) => {
    if (!academyId) return;
    
    // 💡 لا تفعل حالة التحميل الكامل إذا كان التحديث في الخلفية
    if (!isBackground) {
      setLoading(true);
    }

    try {
      const [halaqasRes, teachersRes] = await Promise.all([
        supabase.from('halaqas').select('*, teacher:teachers(id, name)').eq('academy_id', academyId),
        supabase.from('teachers').select('id, name').eq('academy_id', academyId)
      ]);

      if (halaqasRes.error) throw halaqasRes.error;
      if (teachersRes.error) throw teachersRes.error;

      setHalaqas(halaqasRes.data || []);
      setTeachers(teachersRes.data || []);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('🚨 Error fetching halaqas data:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId, onRefresh]);

  useEffect(() => {
    fetchData(false); // أول تحميل فقط يظهر الهيكل العظمي/التحميل
  }, [fetchData]);

  // حساب الإحصائيات
  const stats = {
    total: halaqas.length,
    active: halaqas.filter(h => h.is_active !== false && !h.is_archived).length,
    noTeacher: halaqas.filter(h => !h.teacher_id && !h.is_archived).length,
    archived: halaqas.filter(h => h.is_archived === true).length
  };

  // تصفية الحلقات
  const filteredHalaqas = halaqas.filter(item => {
    const name = typeof item.name === 'object' ? (isRtl ? item.name?.ar : item.name?.en) : item.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = item.is_active !== false && !item.is_archived;
    if (statusFilter === 'no_teacher') matchesStatus = !item.teacher_id && !item.is_archived;
    if (statusFilter === 'archived') matchesStatus = item.is_archived === true;

    return matchesSearch && matchesStatus;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  const statusOptions = [
    { label: t('halaqas.all_status', 'جميع الحلقات'), value: 'all' },
    { label: t('halaqas.active', 'الحلقات النشطة'), value: 'active' },
    { label: t('halaqas.no_teacher', 'بدون معلم'), value: 'no_teacher' },
    { label: t('common.archived', 'المؤرشفة'), value: 'archived' }
  ];

  return (
    <>
      <PageLayout
        title={t('halaqas.title', 'إدارة الحلقات والفصول')}
        subtitle={t('halaqas.subtitle', 'تنظيم وتوزيع الطلاب والمعلمين على الحلقات')}
        icon={BookOpen}
        actionButtonText={t('halaqas.add_new', 'إنشاء حلقة جديدة')}
        onActionButtonClick={() => {
          setEditingHalaqa(null);
          setIsAddModalOpen(true);
        }}
        statsGrid={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div 
              onClick={() => setStatusFilter('all')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'all' ? 'border-semantic-actionPrimary ring-1 ring-semantic-actionPrimary' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-actionPrimary"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('halaqas.total', 'إجمالي الحلقات')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-textPrimary mt-1">{stats.total}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('active')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'active' ? 'border-semantic-success ring-1 ring-semantic-success' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-success"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('halaqas.active', 'الحلقات النشطة')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-success mt-1">{stats.active}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('no_teacher')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'no_teacher' ? 'border-semantic-warning ring-1 ring-semantic-warning' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-warning"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('halaqas.no_teacher', 'بدون معلم')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-warning mt-1">{stats.noTeacher}</p>
            </div>

            <div 
              onClick={() => setStatusFilter('archived')}
              className={`bg-semantic-surfaceCard border rounded-xl p-2.5 sm:p-3 text-center relative overflow-hidden shadow-sm cursor-pointer transition-all ${statusFilter === 'archived' ? 'border-semantic-error ring-1 ring-semantic-error' : 'border-semantic-borderCard hover:border-semantic-borderCard/80'}`}
            >
              <div className="absolute top-0 start-0 end-0 h-1 bg-semantic-error"></div>
              <p className="text-[10px] sm:text-xs text-semantic-textSecondary whitespace-nowrap font-medium">{t('common.archived', 'المؤرشفة')}</p>
              <p className="text-base sm:text-xl font-bold text-semantic-error mt-1">{stats.archived}</p>
            </div>
          </div>
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('halaqas.search_placeholder', 'ابحث باسم الحلقة...')}
        filtersChildren={
          <div className="relative z-30 col-span-2 md:col-span-1">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder={t('halaqas.all_status', 'حالة الحلقة')}
            />
          </div>
        }
        totalCount={stats.total}
        filteredCount={filteredHalaqas.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onRefresh={() => fetchData(true)} // 👈 تحديث صامت في الخلفية
        countUnitText="حلقة"
        isLoading={loading}
        isRtl={isRtl}
        t={t}
      >
        {/* قائمة بطاقات الحلقات */}
        {filteredHalaqas.length === 0 ? (
          <div className="text-center py-12 bg-semantic-surfaceCard rounded-2xl border border-semantic-borderCard space-y-2">
            <BookOpen className="w-10 h-10 text-semantic-textSecondary mx-auto" />
            <p className="text-semantic-textPrimary font-medium text-sm">
              {t('no_search_results', 'لم يتم العثور على حلقات تطابق البحث.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-0">
            {filteredHalaqas.map((halaqa) => (
              <HalaqaCardItem
                key={halaqa.id}
                halaqa={halaqa}
                onEdit={(item) => {
                  setEditingHalaqa(item);
                  setIsAddModalOpen(true);
                }}
                onRefresh={() => fetchData(true)} // 👈 تحديث صامت في الخلفية
              />
            ))}
          </div>
        )}
      </PageLayout>

      {/* نافذة إنشاء/تعديل حلقة */}
      {isAddModalOpen && (
        <HalaqaFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingHalaqa(null);
          }}
          halaqaToEdit={editingHalaqa}
          academyId={academyId}
          teachers={teachers}
          onSuccess={() => fetchData(true)}
        />
      )}
    </>
  );
}
