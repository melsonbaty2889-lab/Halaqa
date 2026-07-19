/* src/components/ActiveHalaqas.jsx */
import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaClock, FaFolderOpen, FaPlus, FaArchive, 
  FaSearch, FaCheckCircle, FaTimes, FaBookOpen, FaFire, FaChartLine 
} from 'react-icons/fa';
import { supabase } from '../lib/supabase'; // للتعامل الفوري مع السور ونظام الحفظ

export default function ActiveHalaqas({ 
  halaqas = [], 
  teachers = [], 
  students = [], 
  isLoading = false, 
  error = null, 
  isRtl = true,
  isMobile = false,
  onCreateHalaqa, 
  onToggleArchiveHalaqa
}) {

  // حالات التحكم الواجهية
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('active'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🌟 حالة إدارة الرصد اليومي للحلقة المختارة (Slide-over Drawer)
  const [activeTrackingHalaqa, setActiveTrackingHalaqa] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [surahs, setSurahs] = useState([]);
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);
  const [trackingMessage, setTrackingMessage] = useState({ text: '', type: '' });

  // نموذج الحفظ والمراجعة الرقمي المتطابق تماماً مع قاعدة البيانات
  const [progressForm, setProgressForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hifz_surah_id: '',
    hifz_from_ayah: '',
    hifz_to_ayah: '',
    review_surah_id: '',
    review_from_ayah: '',
    review_to_ayah: '',
    grade: 'A',
    mistakes_count: 0,
    notes: ''
  });

  // حالة استمارة الحلقات الجديدة
  const [formData, setFormData] = useState({
    name_ar: '', name_en: '', teacher_id: '', start_time: '', end_time: '', status: 'upcoming'
  });

  const trans = (key, ar, en) => (isRtl ? ar : en);

  // جلب قائمة السور فوراً عند تفعيل لوحة الرصد
  useEffect(() => {
    async function loadSurahsRegistry() {
      const { data } = await supabase
        .from('surahs')
        .select('id, number, name_ar, name_en')
        .order('number', { ascending: true });
      if (data) setSurahs(data);
    }
    loadSurahsRegistry();
  }, []);

  // تصفية الطلاب المنتمين للحلقة المفتوحة حالياً فقط
  const currentHalaqaStudents = students.filter(student => 
    activeTrackingHalaqa && student.halaqa_id === activeTrackingHalaqa.id
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_ar || !formData.teacher_id) {
      alert(trans('errRequired', 'يرجى إدخال اسم الحلقة وتعيين المحفظ المسئول أولاً', 'Please fill name and assign a teacher'));
      return;
    }
    if (onCreateHalaqa) {
      onCreateHalaqa(formData);
      setFormData({ name_ar: '', name_en: '', teacher_id: '', start_time: '', end_time: '', status: 'upcoming' });
      setShowForm(false);
    }
  };

  // حفظ التقرير اليومي وتحديث الـ Streak تلقائياً من داخل الحلقة
  const handleSaveStudentProgress = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !activeTrackingHalaqa) return;

    setIsSubmittingProgress(true);
    setTrackingMessage({ text: '', type: '' });

    try {
      // 1️⃣ إدراج السجل في جدول daily_progress
      const { error: pError } = await supabase.from('daily_progress').insert([{
        academy_id: activeTrackingHalaqa.academy_id || null,
        student_id: selectedStudentId,
        teacher_id: activeTrackingHalaqa.teacher_id || null,
        halaqa_id: activeTrackingHalaqa.id,
        date: progressForm.date,
        hifz_surah_id: progressForm.hifz_surah_id ? parseInt(progressForm.hifz_surah_id) : null,
        hifz_from_ayah: progressForm.hifz_from_ayah ? parseInt(progressForm.hifz_from_ayah) : null,
        hifz_to_ayah: progressForm.hifz_to_ayah ? parseInt(progressForm.hifz_to_ayah) : null,
        review_surah_id: progressForm.review_surah_id ? parseInt(progressForm.review_surah_id) : null,
        review_from_ayah: progressForm.review_from_ayah ? parseInt(progressForm.review_from_ayah) : null,
        review_to_ayah: progressForm.review_to_ayah ? parseInt(progressForm.review_to_ayah) : null,
        grade: progressForm.grade,
        mistakes_count: parseInt(progressForm.mistakes_count) || 0,
        notes: progressForm.notes || null
      }]);

      if (pError) throw pError;

      // 2️⃣ تحديث خوارزمية الـ Streak للتعلم المستمر
      const { data: streakRecord } = await supabase
        .from('student_streaks')
        .select('*')
        .eq('student_id', selectedStudentId)
        .maybeSingle();

      const todayStr = progressForm.date;

      if (streakRecord) {
        let nextStreak = (streakRecord.current_streak || 0) + 1;
        if (streakRecord.last_activity_date === todayStr) nextStreak = streakRecord.current_streak;
        const maxStreak = nextStreak > (streakRecord.longest_streak || 0) ? nextStreak : streakRecord.longest_streak;

        await supabase.from('student_streaks').update({
          current_streak: nextStreak,
          longest_streak: maxStreak,
          last_activity_date: todayStr,
          total_active_days: (streakRecord.total_active_days || 0) + 1,
          updated_at: new Date().toISOString()
        }).eq('student_id', selectedStudentId);
      } else {
        await supabase.from('student_streaks').insert([{
          student_id: selectedStudentId,
          academy_id: activeTrackingHalaqa.academy_id || null,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: todayStr,
          total_active_days: 1
        }]);
      }

      setTrackingMessage({ text: trans('saved', 'تم رصد الإنجاز وتحديث المؤشرات بنجاح! 🔥', 'Progress logged & Streak updated! 🔥'), type: 'success' });
      setProgressForm(prev => ({
        ...prev, hifz_surah_id: '', hifz_from_ayah: '', hifz_to_ayah: '', review_surah_id: '', review_from_ayah: '', review_to_ayah: '', mistakes_count: 0, notes: ''
      }));
    } catch (err) {
      setTrackingMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  const filteredHalaqas = halaqas.filter(h => {
    const matchesView = viewMode === 'active' ? !h.is_archived : h.is_archived;
    const teacherName = h.teacher_name || '';
    return matchesView && (
      (h.name_ar && h.name_ar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.name_en && h.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-white/5 shadow-xl bg-[var(--surface)] flex flex-col gap-4 h-full animate-pulse">
        <div className="h-5 bg-white/10 rounded w-1/3"></div>
        <div className="flex flex-col gap-3.5 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/10 shadow-xl bg-[var(--surface)] flex flex-col items-center justify-center text-center py-12">
        <p className="text-red-400 text-sm font-medium">{trans('errLoad', 'حدث خطأ أثناء تحميل الحلقات الحية في المنظومة.', 'Failed to load active sessions.')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 h-full bg-[var(--surface)] relative overflow-hidden">
      
      {/* هيدر المنظومة الرئيسي */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🕌</span> {trans('halaqasManager', 'منظومة إدارة الحلقات القرآنية والتعليمية', 'Halaqas Management System')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{trans('halaqaSub', 'إدارة الصفوف، ربط المحفظين، ومتابعة معدلات الحضور المباشرة', 'Manage learning circles, assign teachers and track live attendance')}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${showForm ? 'bg-slate-800 text-white' : 'bg-amber-400 text-slate-950 hover:bg-amber-500'}`}
          >
            <FaPlus size={11} />
            {showForm ? trans('close', 'إغلاق ✖', 'Close ✖') : trans('addHalaqa', 'إنشاء حلقة جديدة', 'Create Halaqa')}
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'active' ? 'archived' : 'active')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-2 ${viewMode === 'active' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-amber-400 bg-amber-400/10 text-amber-400'}`}
          >
            <FaArchive size={11} />
            {viewMode === 'active' ? trans('viewArchived', 'أرشيف الحلقات', 'View Archive') : trans('viewActive', 'الحلقات النشطة', 'View Active')}
          </button>
        </div>
      </div>

      {/* استمارة إضافة حلقة جديدة */}
      {showForm && (
        <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] mt-2">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">*{trans('nameAr', 'اسم الحلقة (بالعربية)', 'Halaqa Name (Arabic)')}</label>
              <input type="text" required placeholder="حلقة الإمام عاصم" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{trans('nameEn', 'اسم الحلقة (بالإنجليزية)', 'Halaqa Name (English)')}</label>
              <input type="text" placeholder="Al-Asim Qur'an Circle" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">*{trans('assignTeacher', 'تعيين المعلم / المحفظ المسؤول', 'Assign Teacher')}</label>
              <select required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors">
                <option value="">{trans('selectTeacher', '-- اختر المعلم --', '-- Select Teacher --')}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{trans('halaqaStatus', 'الحالة التشغيلية الأولية', 'Initial Operational Status')}</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors">
                <option value="live">{trans('stLive', 'جارية الآن 🟢', 'Live Now 🟢')}</option>
                <option value="upcoming">{trans('stUpcoming', 'قادمة اليوم 🟡', 'Upcoming 🟡')}</option>
                <option value="finished">{trans('stFinished', 'مكتملة/منتهية ⚪', 'Finished ⚪')}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-300">{trans('startTime', 'وقت البدء', 'Start Time')}</label><input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none text-left"/></div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-300">{trans('endTime', 'وقت الانتهاء', 'End Time')}</label><input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none text-left"/></div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full p-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm transition-all hover:bg-amber-500 shadow-md">{trans('btnSave', 'اعتماد الحلقة وحفظ البيانات في النظام 🚀', 'Deploy Halaqa Live 🚀')}</button>
            </div>
          </form>
        </div>
      )}

      {/* حقل البحث الفوري */}
      <div className="relative">
        <span className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`}><FaSearch size={14} /></span>
        <input 
          type="text" 
          placeholder={trans('searchPh', 'ابحث باسم الحلقة أو اسم المحفظ المكلف...', 'Search by circle name or assigned teacher...')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`w-full p-3.5 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-sm rounded-xl bg-slate-900/60 border border-slate-800 text-white outline-none focus:border-slate-700 transition-colors placeholder:text-slate-500`}
        />
      </div>

      {/* عرض البيانات التفاعلية (جدول / بطاقات) */}
      {filteredHalaqas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
          <FaFolderOpen className="text-slate-600 mb-3" size={32} />
          <p className="text-slate-400 text-sm font-medium">{trans('noData', 'لا توجد حلقات قرآنية مسجلة تطابق التصفية والبحث حالياً', 'No learning circles match your active filters')}</p>
        </div>
      ) : isMobile ? (
        <div className="flex flex-col gap-3.5">
          {filteredHalaqas.map((halaqa) => (
            <div key={halaqa.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{isRtl ? (halaqa.name_ar || halaqa.name) : (halaqa.name_en || halaqa.name)}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <FaUser size={10} className="text-amber-400/80" />
                    <span>{halaqa.teacher_name || trans('noTeacher', 'غير معين', 'Unassigned')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTrackingHalaqa(halaqa)} 
                  className="px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[11px] font-bold flex items-center gap-1"
                >
                  <FaBookOpen size={10} /> {trans('track', 'رصد الحفظ', 'Track')}
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 mt-1">
                <span className="text-[11px] text-slate-400">⏰ {halaqa.start_time || '00:00'} - {halaqa.end_time || '00:00'}</span>
                <button onClick={() => onToggleArchiveHalaqa && onToggleArchiveHalaqa(halaqa.id, halaqa.is_archived)} className={`px-2 py-0.5 rounded text-[10px] border ${viewMode === 'active' ? 'border-red-500/30 text-red-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                  {viewMode === 'active' ? trans('archive', 'أرشفة', 'Archive') : trans('activate', 'تنشيط', 'Activate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full border-collapse bg-slate-900/20 text-right">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-slate-300 text-xs font-bold">
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tHalaqa', 'الحلقة / الفوج التعلمي', 'Halaqa Details')}</th>
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tTeach', 'المحفظ المسؤول', 'Assigned Teacher')}</th>
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tTime', 'التوقيت الزمني', 'Timing Schedule')}</th>
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tStatus', 'الحالة التشغيلية', 'Status')}</th>
                <th className="p-3 text-center">{trans('tAction', 'العمليات والتعديل', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-xs divide-y divide-white/[0.03]">
              {filteredHalaqas.map((halaqa) => (
                <tr key={halaqa.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-3 font-semibold text-white">{isRtl ? (halaqa.name_ar || halaqa.name) : (halaqa.name_en || halaqa.name)}</td>
                  <td className="p-3 text-slate-400">🧑‍🏫 {halaqa.teacher_name || trans('unassigned', 'لم يحدد بعد', 'Unassigned')}</td>
                  <td className="p-3 text-slate-400 font-mono">⏰ {halaqa.start_time || '00:00'} - {halaqa.end_time || '00:00'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${halaqa.status === 'live' || halaqa.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' : 'bg-amber-500/10 text-amber-400 border-amber-500/15'}`}>
                      {halaqa.status === 'live' || halaqa.status === 'active' ? trans('live', 'جارية الآن', 'Live Now') : trans('upc', 'قادمة اليوم', 'Upcoming')}
                    </span>
                  </td>
                  <td className="p-3 flex items-center justify-center gap-2">
                    {/* 🚀 الزر الإستراتيجي العالمي الجديد لفتح لوحة الرصد الفورية */}
                    <button
                      onClick={() => setActiveTrackingHalaqa(halaqa)}
                      className="px-3 py-1.5 rounded-lg font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <FaBookOpen size={12} />
                      {trans('logProgress', 'رصد الإنجاز اليومي', 'Log Daily Progress')}
                    </button>

                    <button
                      onClick={() => onToggleArchiveHalaqa && onToggleArchiveHalaqa(halaqa.id, halaqa.is_archived)}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${viewMode === 'active' ? 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'}`}
                    >
                      {viewMode === 'active' ? trans('btnArchive', 'أرشفة', 'Archive') : trans('btnActivate', 'تنشيط', 'Activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 👑 لوحة الرصد السينمائية الجانبية المتطورة (Slide-over Drawer Panel) */}
      {activeTrackingHalaqa && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className={`w-full max-w-xl bg-slate-950 border-l border-white/10 h-full flex flex-col p-6 shadow-2xl relative animate-slide-in ${isRtl ? 'text-right' : 'text-left'}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            
            {/* الهيدر المصغر للوحة الرصد */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 font-bold"><FaBookOpen /></div>
                <div>
                  <h4 className="text-md font-bold text-white">{trans('liveTracking', 'لوحة الرصد الذكي الفوري', 'Live Smart Logger')}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{isRtl ? activeTrackingHalaqa.name_ar : activeTrackingHalaqa.name_en}</p>
                </div>
              </div>
              <button onClick={() => { setActiveTrackingHalaqa(null); setTrackingMessage({text:'', type:''}); }} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"><FaTimes size={16} /></button>
            </div>

            {/* رسائل تأكيد العمليات */}
            {trackingMessage.text && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${trackingMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {trackingMessage.text}
              </div>
            )}

            {/* محتوى الاستمارة الذكية */}
            <form onSubmit={handleSaveStudentProgress} className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              {/* اختيار الطالب من طلاب هذه الحلقة حصراً */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{trans('selectStudent', 'اختر الطالب المستمع له حالياً', 'Select Active Student')}</label>
                <select 
                  required 
                  value={selectedStudentId} 
                  onChange={e => setSelectedStudentId(e.target.value)} 
                  className="w-full p-3 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="">{trans('chooseStOption', '-- اختر من طلاب الحلقة الحالية --', '-- Select from this Halaqa --')}</option>
                  {currentHalaqaStudents.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* التاريخ */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{trans('tDate', 'تاريخ جلسة التسميع', 'Session Date')}</label>
                <input type="date" required value={progressForm.date} onChange={e => setProgressForm({...progressForm, date: e.target.value})} className="w-full p-3 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
              </div>

              {/* قسم الحفظ الجديد التفاعلي */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1">📖 {trans('newHifz', 'الحفظ الجديد اليوم', 'New Memorization')}</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 sm:col-span-1">
                    <select value={progressForm.hifz_surah_id} onChange={e => setProgressForm({...progressForm, hifz_surah_id: e.target.value})} className="w-full p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white">
                      <option value="">{trans('surah', 'السورة...', 'Surah...')}</option>
                      {surahs.map(s => <option key={s.id} value={s.id}>{isRtl ? s.name_ar : s.name_en}</option>)}
                    </select>
                  </div>
                  <input type="number" placeholder={trans('fromA', 'من آية', 'From Ayah')} value={progressForm.hifz_from_ayah} onChange={e => setProgressForm({...progressForm, hifz_from_ayah: e.target.value})} className="p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white text-center" />
                  <input type="number" placeholder={trans('toA', 'إلى آية', 'To Ayah')} value={progressForm.hifz_to_ayah} onChange={e => setProgressForm({...progressForm, hifz_to_ayah: e.target.value})} className="p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white text-center" />
                </div>
              </div>

              {/* قسم المراجعة اليومية */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">🔄 {trans('dailyRev', 'المراجعة والورد الحالي', 'Current Review')}</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 sm:col-span-1">
                    <select value={progressForm.review_surah_id} onChange={e => setProgressForm({...progressForm, review_surah_id: e.target.value})} className="w-full p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white">
                      <option value="">{trans('surah', 'السورة...', 'Surah...')}</option>
                      {surahs.map(s => <option key={s.id} value={s.id}>{isRtl ? s.name_ar : s.name_en}</option>)}
                    </select>
                  </div>
                  <input type="number" placeholder={trans('fromA', 'من آية', 'From Ayah')} value={progressForm.review_from_ayah} onChange={e => setProgressForm({...progressForm, review_from_ayah: e.target.value})} className="p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white text-center" />
                  <input type="number" placeholder={trans('toA', 'إلى آية', 'To Ayah')} value={progressForm.review_to_ayah} onChange={e => setProgressForm({...progressForm, review_to_ayah: e.target.value})} className="p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white text-center" />
                </div>
              </div>

              {/* التقييم وعدد الأخطاء الدقيق */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{trans('grade', 'التقدير الإجمالي', 'Session Grade')}</label>
                  <select value={progressForm.grade} onChange={e => setProgressForm({...progressForm, grade: e.target.value})} className="w-full p-3 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white outline-none">
                    <option value="A+">A+ (ممتاز مرتفع)</option>
                    <option value="A">A (ممتاز)</option>
                    <option value="B">B (جيد جداً)</option>
                    <option value="C">C (جيد)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{trans('mistakes', 'عدد الأخطاء / التنبيهات', 'Mistakes Count')}</label>
                  <input type="number" min="0" value={progressForm.mistakes_count} onChange={e => setProgressForm({...progressForm, mistakes_count: e.target.value})} className="w-full p-3 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white outline-none" />
                </div>
              </div>

              {/* التوجيهات والملاحظات */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">{trans('notes', 'ملاحظات وتوجيهات المحفظ', 'Teacher Feedback & Notes')}</label>
                <textarea rows="2" placeholder={trans('notesPh', 'اكتب هنا توجيهات التجويد أو خطة التكليف القادمة للطالب...', 'Write any tajweed feedback or upcoming tasks...')} value={progressForm.notes} onChange={e => setProgressForm({...progressForm, notes: e.target.value})} className="w-full p-3 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white outline-none resize-none" />
              </div>

              {/* زر الحفظ النهائي */}
              <button 
                type="submit" 
                disabled={isSubmittingProgress}
                className="w-full p-3.5 rounded-xl bg-sky-400 hover:bg-sky-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-400/10 flex items-center justify-center gap-2"
              >
                {isSubmittingProgress ? trans('saving', 'جاري معالجة السجلات وتحديث النقاط...', 'Processing Assets...') : trans('submitProgress', '💾 اعتماد تقرير الجلسة وتحديث السلسلة اليومية', '💾 Log Session & Sync Streak')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
