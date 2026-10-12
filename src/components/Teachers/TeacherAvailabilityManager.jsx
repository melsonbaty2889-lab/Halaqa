/* src/components/Teachers/TeacherAvailabilityManager.jsx */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Plus, Save, Trash2, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';

export default function TeacherAvailabilityManager({ teacherId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(teacherId || '');
  const [availabilityList, setAvailabilityList] = useState([]);
  
  const [dayOfWeek, setDayOfWeek] = useState('Saturday');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const daysOptions = [
    { value: 'Saturday', label: t('days.saturday', 'السبت') },
    { value: 'Sunday', label: t('days.sunday', 'الأحد') },
    { value: 'Monday', label: t('days.monday', 'الإثنين') },
    { value: 'Tuesday', label: t('days.tuesday', 'الثلاثاء') },
    { value: 'Wednesday', label: t('days.wednesday', 'الأربعاء') },
    { value: 'Thursday', label: t('days.thursday', 'الخميس') },
    { value: 'Friday', label: t('days.friday', 'الجمعة') },
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchAvailability(selectedTeacher);
    }
  }, [selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setTeachers(data);
        if (!selectedTeacher) setSelectedTeacher(data[0].id);
      }
    } catch (err) {
      console.error('خطأ في جلب قائمة المعلمين:', err.message);
    }
  };

  const fetchAvailability = async (tId) => {
    try {
      const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', tId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailabilityList(data || []);
    } catch (err) {
      console.error('خطأ في جلب مواعيد التوفر:', err.message);
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      setMessage({ type: 'error', text: t('teachers.selectTeacherFirst', 'يرجى اختيار المعلم أولاً.') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('teacher_availability')
        .insert([
          {
            teacher_id: selectedTeacher,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            is_available: true,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setMessage({ type: 'success', text: t('teachers.availabilityAddedSuccess', 'تم إضافة الموعد بنجاح!') });
      fetchAvailability(selectedTeacher);
    } catch (err) {
      setMessage({ type: 'error', text: t('common.errorOccurred', 'حدث خطأ أثناء الحفظ: ') + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('teacher_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAvailability(selectedTeacher);
    } catch (err) {
      console.error('خطأ في الحذف:', err.message);
    }
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`${UI.card} w-full max-w-4xl flex flex-col gap-6`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-semantic-borderCard pb-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-semantic-actionPrimary" />
          <h2 className="text-lg font-bold text-semantic-textPrimary">{t('teachers.availabilityManagerTitle', 'إدارة مواعيد توفر المعلمين')}</h2>
        </div>

        {/* اختيار المعلم */}
        {teachers.length > 0 && (
          <div className="flex items-center gap-2 bg-semantic-surfaceInput px-3 py-1.5 rounded-xl border border-semantic-borderInput">
            <User className="w-4 h-4 text-semantic-textSecondary" />
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="bg-transparent text-xs text-semantic-textPrimary border-none focus:outline-none cursor-pointer"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold ${
          message.type === 'success' 
            ? 'bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30' 
            : 'bg-semantic-dangerBg text-semantic-danger border border-semantic-danger/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAddAvailability} className="bg-semantic-surfaceInput/40 p-4 rounded-xl border border-semantic-borderCard space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-semantic-actionPrimary">
          <Plus className="w-4 h-4" />
          <span>{t('teachers.addNewSlot', 'إضافة فترات توفر جديدة')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.day', 'اليوم')}</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className={UI.input}
            >
              {daysOptions.map((day) => (
                <option key={day.value} value={day.value} className="bg-slate-900 text-white">
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.fromTime', 'من الساعة')}</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`${UI.input} text-start`}
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.toTime', 'إلى الساعة')}</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`${UI.input} text-start`}
              dir="ltr"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${UI.btnPrimary} flex items-center justify-center gap-1.5 cursor-pointer`}
        >
          <Save className="variable w-4 h-4" />
          <span>{loading ? t('common.saving', 'جاري الحفظ...') : t('teachers.saveSlot', 'حفظ موعد التوفر')}</span>
        </button>
      </form>

      {/* Grid view of availability */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-semantic-textSecondary">
          {t('teachers.registeredSlots', 'جدول المواعيد المسجلة')} (<bdi>{availabilityList.length}</bdi>)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availabilityList.length === 0 ? (
            <p className="text-xs text-semantic-textMuted py-4 col-span-2 text-center">
              {t('teachers.noSlotsFound', 'لا توجد مواعيد توفر مسجلة لهذا المعلم.')}
            </p>
          ) : (
            availabilityList.map((item) => (
              <div key={item.id} className="p-3.5 card-surface border-semantic-borderCard flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-semantic-actionPrimary/10 text-semantic-actionPrimary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-semantic-textPrimary">
                      {daysOptions.find((d) => d.value === item.day_of_week)?.label || item.day_of_week}
                    </span>
                    <span className="text-[11px] text-semantic-textSecondary">
                      <bdi>{item.start_time}</bdi> - <bdi>{item.end_time}</bdi>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-semantic-dangerBg text-semantic-danger hover:bg-semantic-danger/20 transition-colors cursor-pointer"
                  title={t('common.delete', 'حذف')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
