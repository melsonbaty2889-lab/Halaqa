import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Plus, Save, Trash2, CheckCircle2, AlertCircle, User } from 'lucide-react';
import colors from '@/theme/colors';

export default function TeacherAvailabilityManager({ teacherId, dir = 'rtl' }) {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(teacherId || '');
  const [availabilityList, setAvailabilityList] = useState([]);
  
  const [dayOfWeek, setDayOfWeek] = useState('Saturday');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const daysOptions = [
    { value: 'Saturday', label: 'السبت' },
    { value: 'Sunday', label: 'الأحد' },
    { value: 'Monday', label: 'الإثنين' },
    { value: 'Tuesday', label: 'الثلاثاء' },
    { value: 'Wednesday', label: 'الأربعاء' },
    { value: 'Thursday', label: 'الخميس' },
    { value: 'Friday', label: 'الجمعة' },
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchAvailability(selectedTeacher);
    }
  }, [selectedTeacher]);

  // جلب قائمة المعلمين للاختيار بينهم إذا لم يتم تمرير ID
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

  // جلب مواعيد التوفر للمعلم المحدد
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

  // إضافة موعد توفر جديد
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      setMessage({ type: 'error', text: 'يرجى اختيار المعلم أولاً.' });
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

      setMessage({ type: 'success', text: 'تم إضافة الموعد بنجاح!' });
      fetchAvailability(selectedTeacher);
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // حذف موعد توفر
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
      dir={dir} 
      style={{ backgroundColor: colors?.surface || '#0F172A' }}
      className="w-full max-w-4xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-[#FBBF24]" />
          <h2 className="text-lg font-bold">إدارة مواعيد توفر المعلمين</h2>
        </div>

        {/* اختيار المعلم */}
        {teachers.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="bg-transparent text-xs text-white border-none focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-800 text-white">
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
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAddAvailability} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FBBF24]">
          <Plus className="w-4 h-4" />
          <span>إضافة فترات توفر جديدة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">اليوم</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
            >
              {daysOptions.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">من الساعة</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">إلى الساعة</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FBBF24] text-[#0F172A] text-xs font-bold rounded-xl hover:bg-[#FBBF24]/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'جاري الحفظ...' : 'حفظ موعد التوفر'}</span>
        </button>
      </form>

      {/* Grid view of availability */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400">جدول المواعيد المسجلة ({availabilityList.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availabilityList.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 col-span-2 text-center">لا توجد مواعيد توفر مسجلة لهذا المعلم.</p>
          ) : (
            availabilityList.map((item) => (
              <div key={item.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">
                      {daysOptions.find((d) => d.value === item.day_of_week)?.label || item.day_of_week}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      من {item.start_time} إلى {item.end_time}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  title="حذف"
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
