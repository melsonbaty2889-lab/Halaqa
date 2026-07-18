import React, { useState } from 'react';
import { FaUser, FaClock, FaCircle, FaFolderOpen, FaPlus, FaArchive, FaCheckCircle, FaSearch, FaGlobe, FaGraduationCap } from 'react-icons/fa';

export default function ActiveHalaqas({ 
  halaqas = [], 
  teachers = [], // تم تمرير المعلمين المسجلين في المنظومة لربطهم بالحلقة
  students = [], // تم تمرير الطلاب لإحصائيات التوزيع
  isLoading = false, 
  error = null, 
  isRtl = true,
  isMobile = false,
  onCreateHalaqa, // دالة الإنشاء الفوري في Supabase
  onToggleArchiveHalaqa // دالة الأرشفة والتنشيط
}) {

  // حالات التحكم الواجهية الذكية
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('active'); // active | archived
  const [searchQuery, setSearchQuery] = useState('');

  // حالة استمارة الحلقات الجديدة
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    teacher_id: '',
    start_time: '',
    end_time: '',
    status: 'upcoming'
  });

  // قاموس المصطلحات الموحد والترجمة الفورية المباشرة
  const trans = (key, ar, en) => (isRtl ? ar : en);

  // معالجة إرسال استمارة الحلقة الجديدة
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_ar || !formData.teacher_id) {
      alert(trans('errRequired', 'يرجى إدخال اسم الحلقة وتعيين المحفظ المسئول أولاً', 'Please fill name and assign a teacher'));
      return;
    }
    if (onCreateHalaqa) {
      onCreateHalaqa(formData);
      // إعادة تعيين الاستمارة بعد الإرسال الناجح
      setFormData({ name_ar: '', name_en: '', teacher_id: '', start_time: '', end_time: '', status: 'upcoming' });
      setShowForm(false);
    }
  };

  // تصفية الحلقات بناءً على وضع العرض وأرشفة الحلقات وحقل البحث الذكي
  const filteredHalaqas = halaqas.filter(h => {
    const matchesView = viewMode === 'active' ? !h.is_archived : h.is_archived;
    const teacherName = h.teacher_name || '';
    const matchesSearch = 
      (h.name_ar && h.name_ar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.name_en && h.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (teacherName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesView && matchesSearch;
  });

  // 1️⃣ حالة التحميل الذكي (Skeleton Loading) لمنع وميض الشاشة
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

  // 2️⃣ حالة حدوث خطأ في الاتصال بقاعدة البيانات
  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/10 shadow-xl bg-[var(--surface)] flex flex-col items-center justify-center text-center py-12">
        <p className="text-red-400 text-sm font-medium">
          {trans('errLoad', 'حدث خطأ أثناء تحميل الحلقات الحية في المنظومة.', 'Failed to load active sessions.')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 h-full bg-[var(--surface)]">
      
      {/* أزرار التحكم والعمليات العلوية للمنظومة */}
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

      {/* استمارة إضافة حلقة جديدة المدمجة والمحميّة */}
      {showForm && (
        <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] mt-2">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">*{trans('nameAr', 'اسم الحلقة (بالعربية)', 'Halaqa Name (Arabic)')}</label>
              <input 
                type="text" 
                required
                placeholder="مثال: حلقة الإمام عاصم لحفظ القرآن"
                value={formData.name_ar} 
                onChange={e => setFormData({...formData, name_ar: e.target.value})}
                className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{trans('nameEn', 'اسم الحلقة (بالإنجليزية)', 'Halaqa Name (English)')}</label>
              <input 
                type="text" 
                placeholder="Example: Al-Asim Qur'an Circle"
                value={formData.name_en} 
                onChange={e => setFormData({...formData, name_en: e.target.value})}
                className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">*{trans('assignTeacher', 'تعيين المعلم / المحفظ المسؤول', 'Assign Teacher')}</label>
              <select
                required
                value={formData.teacher_id}
                onChange={e => setFormData({...formData, teacher_id: e.target.value})}
                className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors"
              >
                <option value="">{trans('selectTeacher', '-- اختر المعلم من القائمة --', '-- Select Teacher --')}</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{trans('halaqaStatus', 'الحالة التشغيلية الأولية', 'Initial Operational Status')}</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors"
              >
                <option value="live">{trans('stLive', 'جارية الآن 🟢', 'Live Now 🟢')}</option>
                <option value="upcoming">{trans('stUpcoming', 'قادمة اليوم 🟡', 'Upcoming 🟡')}</option>
                <option value="finished">{trans('stFinished', 'مكتملة/منتهية ⚪', 'Finished ⚪')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{trans('startTime', 'وقت بدء الحلقة', 'Start Time')}</label>
              <input 
                type="time" 
                value={formData.start_time} 
                onChange={e => setFormData({...formData, start_time: e.target.value})}
                className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors text-left"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">{trans('endTime', 'وقت انتهاء الحلقة', 'End Time')}</label>
              <input 
                type="time" 
                value={formData.end_time} 
                onChange={e => setFormData({...formData, end_time: e.target.value})}
                className="p-3 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400 transition-colors text-left"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button 
                type="submit" 
                className="w-full p-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm transition-all hover:bg-amber-500 shadow-md"
              >
                {trans('btnSave', 'اعتماد الحلقة وحفظ البيانات في النظام 🚀', 'Deploy Halaqa Live 🚀')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* حقل البحث الذكي الفوري في الحلقات */}
      <div className="relative">
        <span className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRtl ? 'right-4' : 'left-4'}`}>
          <FaSearch size={14} />
        </span>
        <input 
          type="text" 
          placeholder={trans('searchPh', 'ابحث باسم الحلقة أو اسم المحفظ المكلف...', 'Search by circle name or assigned teacher...')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`w-full p-3.5 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-sm rounded-xl bg-slate-900/60 border border-slate-800 text-white outline-none focus:border-slate-700 transition-colors placeholder:text-slate-500`}
        />
      </div>

      {/* 3️⃣ حالة الـ Empty State عدم وجود أي حلقات مطابقة للتصفية */}
      {filteredHalaqas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
          <FaFolderOpen className="text-slate-600 mb-3" size={32} />
          <p className="text-slate-400 text-sm font-medium">
            {trans('noData', 'لا توجد حلقات قرآنية مسجلة تطابق التصفية والبحث حالياً', 'No learning circles match your active filters')}
          </p>
        </div>
      ) : isMobile ? (
        /* 4️⃣ رندرة بطاقات الهواتف الذكية المتجاوبة تماماً */
        <div className="flex flex-col gap-3.5">
          {filteredHalaqas.map((halaqa) => (
            <div 
              key={halaqa.id}
              className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h4 className="text-sm font-bold text-slate-100">
                    {isRtl ? (halaqa.name_ar || halaqa.name) : (halaqa.name_en || halaqa.name)}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <FaUser size={10} className="text-amber-400/80" />
                    <span>{halaqa.teacher_name || trans('noTeacher', 'غير معين', 'Unassigned')}</span>
                  </div>
                </div>
                
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  halaqa.status === 'live' || halaqa.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' :
                  halaqa.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' : 'bg-slate-500/10 text-slate-400 border-white/5'
                }`}>
                  {halaqa.status === 'live' || halaqa.status === 'active' ? trans('live', 'جارية', 'Live') : halaqa.status === 'upcoming' ? trans('upc', 'قادمة', 'Upcoming') : trans('fin', 'منتهية', 'Ended')}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 mt-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <FaClock size={10} />
                  <span>{halaqa.start_time || '00:00'} - {halaqa.end_time || '00:00'}</span>
                </div>

                <button
                  onClick={() => onToggleArchiveHalaqa && onToggleArchiveHalaqa(halaqa.id, halaqa.is_archived)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${viewMode === 'active' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}
                >
                  {viewMode === 'active' ? trans('archive', 'أرشفة', 'Archive') : trans('activate', 'تنشيط', 'Activate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 5️⃣ عرض الجدول الشامل والحصين للشاشات الكبيرة */
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full border-collapse bg-slate-900/20 text-right">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-slate-300 text-xs font-bold">
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tHalaqa', 'الحلقة / الفوج التعلمي', 'Halaqa Details')}</th>
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tTeach', 'المحفظ المسؤول', 'Assigned Teacher')}</th>
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tTime', 'التوقيت الزمني', 'Timing Schedule')}</th>
                <th className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>{trans('tStatus', 'الحالة التشغيلية', 'Status')}</th>
                <th className={`p-3 ${isRtl ? 'text-center' : 'text-center'}`}>{trans('tAction', 'العمليات والتعديل', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-xs divide-y divide-white/[0.03]">
              {filteredHalaqas.map((halaqa) => (
                <tr key={halaqa.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-3 font-semibold text-white">
                    {isRtl ? (halaqa.name_ar || halaqa.name) : (halaqa.name_en || halaqa.name)}
                  </td>
                  <td className="p-3 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">🧑‍🏫</div>
                      <span>{halaqa.teacher_name || trans('unassigned', 'لم يحدد بعد', 'Unassigned')}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 font-mono">
                    ⏰ {halaqa.start_time || '00:00'} - {halaqa.end_time || '00:00'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border inline-flex items-center gap-1 ${
                      halaqa.status === 'live' || halaqa.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' :
                      halaqa.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' : 'bg-slate-500/10 text-slate-400 border-white/5'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      {halaqa.status === 'live' || halaqa.status === 'active' ? trans('live', 'جارية الآن', 'Live Now') : halaqa.status === 'upcoming' ? trans('upc', 'قادمة اليوم', 'Upcoming') : trans('fin', 'انتهت', 'Ended')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onToggleArchiveHalaqa && onToggleArchiveHalaqa(halaqa.id, halaqa.is_archived)}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${viewMode === 'active' ? 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'}`}
                    >
                      {viewMode === 'active' ? trans('btnArchive', 'أرشفة الحلقة', 'Archive') : trans('btnActivate', 'تنشيط العرض', 'Activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}