import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  RefreshCw, 
  Clock, 
  Database, 
  PlusCircle, 
  Edit, 
  Trash2, 
  UserCheck, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Calendar as CalendarIcon,
  Code,
  Loader2,
  FilterX,
  Layers,
  ArrowRight,
  X,
  Check,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

const TABLE_DISPLAY_NAMES = {
  ar: {
    attendance: 'الحضور والتسميع',
    payments: 'الاشتراكات والمالية',
    halaqas: 'الحلقات والمقارئ',
    students: 'شؤون الطلاب',
    daily_progress: 'الإنجاز اليومي',
  },
  en: {
    attendance: 'Attendance & Recitation',
    payments: 'Subscriptions & Finance',
    halaqas: 'Halaqas & Circles',
    students: 'Student Affairs',
    daily_progress: 'Daily Progress',
  }
};

const FIELD_LABELS = {
  ar: {
    status: 'الحالة',
    notes: 'الملاحظات',
    date: 'التاريخ',
    juz: 'الجزء',
    amount: 'المبلغ',
    full_name: 'الاسم الكامل',
    name: 'الاسم',
    phone: 'رقم الهاتف',
    parent_phone: 'رقم هاتف ولي الأمر',
    quarter_index: 'الربع',
    quarter_in_hizb: 'الربع في الحزب',
    session_grade: 'الدرجة',
    gender: 'النوع',
    points: 'النقاط',
    country: 'الدولة',
    current_juz: 'الجزء الحالي',
    is_archived: 'الأرشيف',
    level_score: 'تقييم المستوى',
    student_code: 'كود الطالب',
    payment_status: 'حالة الدفع',
    last_test_score: 'آخر اختبار',
  },
  en: {
    status: 'Status',
    notes: 'Notes',
    date: 'Date',
    juz: 'Juz',
    amount: 'Amount',
    full_name: 'Full Name',
    name: 'Name',
    phone: 'Phone Number',
    parent_phone: 'Parent Phone',
    quarter_index: 'Quarter',
    quarter_in_hizb: 'Quarter in Hizb',
    session_grade: 'Grade',
    gender: 'Gender',
    points: 'Points',
    country: 'Country',
    current_juz: 'Current Juz',
    is_archived: 'Archived',
    level_score: 'Level Score',
    student_code: 'Student Code',
    payment_status: 'Payment Status',
    last_test_score: 'Last Test Score',
  }
};

const VALUE_TRANSLATIONS = {
  ar: {
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    excused: 'مستأذن',
    male: 'ذكر',
    female: 'أنثى',
    active: 'نشط',
    unpaid: 'غير مدفوع',
    paid: 'مدفوع',
    monthly: 'شهري',
    yearly: 'سنوي',
    false: 'غير مؤرشف',
    true: 'مؤرشف',
  },
  en: {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    excused: 'Excused',
    male: 'Male',
    female: 'Female',
    active: 'Active',
    unpaid: 'Unpaid',
    paid: 'Paid',
    monthly: 'Monthly',
    yearly: 'Yearly',
    false: 'Active',
    true: 'Archived',
  }
};

export default function GlobalQuranicAudit() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language && i18n.language.startsWith('ar') ? 'ar' : 'en';
  const isRtl = i18n.dir() === 'rtl' || currentLang === 'ar';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showRawJson, setShowRawJson] = useState({});
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const formatValue = useCallback((key, val) => {
    if (val === null || val === undefined || val === '') return <span className="text-slate-400 font-normal">—</span>;
    if (typeof val === 'object') {
      if (Object.keys(val).length === 0) return <span className="text-slate-400 font-normal">—</span>;
      if (val[currentLang]) return val[currentLang];
      if (val.ar || val.en) return val.ar || val.en;
      if (val.name) return typeof val.name === 'object' ? formatValue(key, val.name) : val.name;
      if (val.full_name) return val.full_name;
      return JSON.stringify(val);
    }
    const strVal = String(val);
    if (VALUE_TRANSLATIONS[currentLang]?.[strVal] !== undefined) {
      return VALUE_TRANSLATIONS[currentLang][strVal];
    }
    return strVal;
  }, [currentLang]);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`*, performer:profiles(full_name, name, email)`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedTable !== 'all') {
        query = query.eq('table_name', selectedTable);
      }

      let { data, error } = await query;

      if (error) {
        let fallbackQuery = supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (selectedTable !== 'all') {
          fallbackQuery = fallbackQuery.eq('table_name', selectedTable);
        }
        const fallbackResult = await fallbackQuery;
        data = fallbackResult.data;
      }

      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const getUserDisplayName = useCallback((log) => {
    if (log.performer?.full_name) return log.performer.full_name;
    if (log.performer?.name) return log.performer.name;
    if (log.performer?.email) return log.performer.email;
    if (log.changed_by) return `${currentLang === 'ar' ? 'مستخدم' : 'User'}: ${log.changed_by.substring(0, 8)}`;
    return currentLang === 'ar' ? 'النظام التلقائي' : 'Automated System';
  }, [currentLang]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const rawTable = (log.table_name || '').toLowerCase();
      const localizedTable = (TABLE_DISPLAY_NAMES[currentLang][log.table_name] || '').toLowerCase();
      const operation = (log.operation || '').toLowerCase();
      const userName = getUserDisplayName(log).toLowerCase();

      return `${rawTable} ${localizedTable} ${operation} ${userName}`.includes(query);
    });
  }, [logs, startDate, endDate, searchQuery, currentLang, getUserDisplayName]);

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      currentLang === 'ar' ? "المعرف" : "ID", 
      currentLang === 'ar' ? "الجدول" : "Table", 
      currentLang === 'ar' ? "العملية" : "Operation", 
      currentLang === 'ar' ? "بواسطة" : "Changed By", 
      currentLang === 'ar' ? "التاريخ والتوقيت" : "Date & Time"
    ];

    const rows = filteredLogs.map(log => [
      `"${log.id}"`,
      `"${TABLE_DISPLAY_NAMES[currentLang][log.table_name] || log.table_name}"`,
      `"${log.operation}"`,
      `"${getUserDisplayName(log)}"`,
      `"${new Date(log.created_at).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Quran_Academy_Audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOperationBadge = (operation) => {
    switch (operation?.toUpperCase()) {
      case 'INSERT':
        return { 
          icon: PlusCircle, 
          color: '#10B981', 
          bg: 'rgba(16, 185, 129, 0.12)', 
          border: 'rgba(16, 185, 129, 0.3)', 
          label: currentLang === 'ar' ? 'إضافة' : 'Insert' 
        };
      case 'UPDATE':
        return { 
          icon: Edit, 
          color: '#3B82F6', 
          bg: 'rgba(59, 130, 246, 0.12)', 
          border: 'rgba(59, 130, 246, 0.3)', 
          label: currentLang === 'ar' ? 'تعديل' : 'Update' 
        };
      case 'DELETE':
        return { 
          icon: Trash2, 
          color: '#EF4444', 
          bg: 'rgba(239, 68, 68, 0.12)', 
          border: 'rgba(239, 68, 68, 0.3)', 
          label: currentLang === 'ar' ? 'حذف' : 'Delete' 
        };
      default:
        return { 
          icon: Database, 
          color: '#0EA5E9', 
          bg: 'rgba(14, 165, 233, 0.12)', 
          border: 'rgba(14, 165, 233, 0.3)', 
          label: operation || 'Op' 
        };
    }
  };

  return (
    <div className={`w-full min-h-screen p-3 sm:p-6 lg:p-8 font-sans ${isRtl ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'var(--bg-main, #0A0F1D)', color: 'var(--text-main, #F8FAFC)' }}>
      
      {/* الترويسة الرئيسية الهادئة والاحترافية */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-500/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white">
              {currentLang === 'ar' ? 'سجل العمليات والأنشطة المباشر' : 'Global Live Audit Log'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {currentLang === 'ar' ? 'متابعة شفافة وفورية لكافة التغييرات والإجراءات في الأكاديمية' : 'Real-time transparent activity and change management'}
          </p>
        </div>

        {/* أزرار التحكم للتصدير والتحديث */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
          >
            <Download size={14} />
            <span>{currentLang === 'ar' ? 'تصدير التقرير' : 'Export CSV'}</span>
          </button>

          <button 
            onClick={fetchAuditLogs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
            <span>{currentLang === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* لوحة البحث والفلاتر - متجاوبة 100% مع الشاشات الصغيرة */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-5 mb-6 shadow-xl backdrop-blur-md">
        
        {/* زر التصفية للهواتف */}
        <div className="flex sm:hidden items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-emerald-400" />
            {currentLang === 'ar' ? 'خيارات التصفية' : 'Filter Logs'}
          </span>
          <button 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="text-xs text-emerald-400 font-semibold"
          >
            {showFiltersMobile ? (currentLang === 'ar' ? 'إخفاء' : 'Hide') : (currentLang === 'ar' ? 'عرض الفلاتر' : 'Show Filters')}
          </button>
        </div>

        <div className={`flex-col gap-3 ${showFiltersMobile ? 'flex' : 'hidden sm:flex'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* البحث النصي */}
            <div className="relative col-span-1 lg:col-span-1">
              <Search size={15} className={`absolute top-3.5 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input 
                type="text"
                placeholder={currentLang === 'ar' ? 'بحث باسم المستخدم أو الجدول...' : 'Search by user or table...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
              />
            </div>

            {/* تصفية الجدول */}
            <div className="relative">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">{currentLang === 'ar' ? 'جميع الجداول والقطاعات' : 'All Tables & Modules'}</option>
                {Object.entries(TABLE_DISPLAY_NAMES[currentLang]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown size={14} className={`absolute top-3.5 text-slate-400 pointer-events-none ${isRtl ? 'left-3.5' : 'right-3.5'}`} />
            </div>

            {/* نطاق التواريخ المدمج */}
            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
              <CalendarIcon size={14} className="text-emerald-400 shrink-0" />
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
              />
              <span className="text-slate-600 text-xs">-</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
              />
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-rose-400 p-1">
                  <X size={13} />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* قائمة السجلات المحدثة بطراز الكروت التكيفية */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Loader2 size={24} className="animate-spin text-emerald-400" />
            <span>{currentLang === 'ar' ? 'جاري جلب البيانات والتحديثات...' : 'Syncing audit logs...'}</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium bg-slate-900/40 rounded-2xl border border-slate-800">
            {currentLang === 'ar' ? 'لا توجد سجلات تطابق خيارات التصفية الحالية' : 'No logs match your current filter selection'}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getOperationBadge(log.operation);
            const IconComponent = badge.icon;
            const isExpanded = expandedLogId === log.id;
            const userName = getUserDisplayName(log);
            const timeFormatted = new Date(log.created_at).toLocaleTimeString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
            const dateFormatted = new Date(log.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div 
                key={log.id} 
                className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-200 shadow-md"
              >
                {/* رأس كرت النشاط */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0"
                      style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                    >
                      <IconComponent size={18} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-100">
                          {badge.label}
                        </span>
                        <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {TABLE_DISPLAY_NAMES[currentLang][log.table_name] || log.table_name}
                        </span>
                      </div>
                      
                      <div className="text-slate-400 text-xs flex items-center gap-1.5">
                        <UserCheck size={13} className="text-slate-500" />
                        <span>{currentLang === 'ar' ? 'بواسطة:' : 'By:'} <strong className="text-slate-200">{userName}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* التاريخ وأيقونة التوسع */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="text-slate-400 text-[11px] sm:text-xs flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Clock size={11} /> {timeFormatted}
                      </span>
                      <span className="text-slate-500">{dateFormatted}</span>
                    </div>

                    <div className="p-1 rounded-lg bg-slate-800/50 text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* تفاصيل التغييرات عند النقر */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                        <Layers size={14} />
                        {currentLang === 'ar' ? 'تفاصيل البيانات المسجلة:' : 'Payload Details:'}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRawJson(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                        }}
                        className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
                      >
                        <Code size={12} />
                        <span>{showRawJson[log.id] ? (currentLang === 'ar' ? 'عرض مبسط' : 'Friendly View') : (currentLang === 'ar' ? 'عرض JSON' : 'Raw JSON')}</span>
                      </button>
                    </div>

                    {/* بيانات الكرت */}
                    {showRawJson[log.id] ? (
                      <pre className="p-3 bg-slate-900 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-400 border border-slate-800 dir-ltr text-left">
                        {JSON.stringify(log.new_data || log.old_data || {}, null, 2)}
                      </pre>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {Object.entries(log.new_data || log.record_data || log.old_data || {}).map(([key, value]) => {
                          if (key.endsWith('_id') || key === 'id' || key.endsWith('_at') || value === null) return null;
                          return (
                            <div key={key} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                              <div className="text-slate-400 text-[10px] font-semibold mb-0.5">
                                {FIELD_LABELS[currentLang][key] || key}
                              </div>
                              <div className="text-slate-100 font-bold text-xs">
                                {formatValue(key, value)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
