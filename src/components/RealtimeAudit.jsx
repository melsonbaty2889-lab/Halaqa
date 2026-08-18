import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  X,
  Globe,
  Filter,
  Check
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

export default function ProfessionalAuditLog() {
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
  const [showFilters, setShowFilters] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const formatValue = useCallback((key, val) => {
    if (val === null || val === undefined || val === '') return <span className="text-slate-500 font-normal">—</span>;
    if (typeof val === 'object') {
      if (Object.keys(val).length === 0) return <span className="text-slate-500 font-normal">—</span>;
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
          color: 'text-emerald-400', 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/20', 
          label: currentLang === 'ar' ? 'إضافة' : 'Insert' 
        };
      case 'UPDATE':
        return { 
          icon: Edit, 
          color: 'text-blue-400', 
          bg: 'bg-blue-500/10', 
          border: 'border-blue-500/20', 
          label: currentLang === 'ar' ? 'تعديل' : 'Update' 
        };
      case 'DELETE':
        return { 
          icon: Trash2, 
          color: 'text-rose-400', 
          bg: 'bg-rose-500/10', 
          border: 'border-rose-500/20', 
          label: currentLang === 'ar' ? 'حذف' : 'Delete' 
        };
      default:
        return { 
          icon: Database, 
          color: 'text-sky-400', 
          bg: 'bg-sky-500/10', 
          border: 'border-sky-500/20', 
          label: operation || 'Op' 
        };
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">
              {currentLang === 'ar' ? 'سجل العمليات والأنشطة المباشر' : 'Global Live Audit Log'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {currentLang === 'ar' ? 'متابعة شفافة وفورية لكافة التغييرات والإجراءات' : 'Real-time transparent activity tracking'}
          </p>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
          >
            <Download size={14} />
            <span>{currentLang === 'ar' ? 'تصدير التقرير' : 'Export CSV'}</span>
          </button>

          <button 
            onClick={fetchAuditLogs}
            className="p-2 rounded-xl text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95"
            title={currentLang === 'ar' ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* لوحة البحث والتصفية المجهزة للموبايل */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          
          {/* حقل البحث الرئيسي */}
          <div className="relative flex-1">
            <Search size={14} className={`absolute top-3 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input 
              type="text"
              placeholder={currentLang === 'ar' ? 'بحث بالاسم أو الجدول...' : 'Search by name or table...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 transition-all ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>

          {/* زر إظهار/إخفاء التصفية المتقدمة */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${showFilters ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/70 text-slate-300 border-slate-700'}`}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">{currentLang === 'ar' ? 'خيارات التصفية' : 'Filters'}</span>
          </button>
        </div>

        {/* الفلاتر المتقدمة (تظهر وتختفي بسلاسة) */}
        {showFilters && (
          <div className="pt-3 mt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* اختيار القطاع/الجدول بتصميم Custom */}
            <div className="relative">
              <label className="block text-[10px] text-slate-400 mb-1 font-medium">
                {currentLang === 'ar' ? 'اختر القطاع' : 'Select Category'}
              </label>
              <button 
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="w-full flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <span>{selectedTable === 'all' ? (currentLang === 'ar' ? 'جميع الجداول والقطاعات' : 'All Modules') : (TABLE_DISPLAY_NAMES[currentLang][selectedTable] || selectedTable)}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isSelectOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <div 
                    onClick={() => { setSelectedTable('all'); setIsSelectOpen(false); }}
                    className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between hover:bg-slate-800 ${selectedTable === 'all' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
                  >
                    <span>{currentLang === 'ar' ? 'جميع الجداول والقطاعات' : 'All Modules'}</span>
                    {selectedTable === 'all' && <Check size={13} />}
                  </div>
                  {Object.entries(TABLE_DISPLAY_NAMES[currentLang]).map(([key, label]) => (
                    <div 
                      key={key}
                      onClick={() => { setSelectedTable(key); setIsSelectOpen(false); }}
                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between hover:bg-slate-800 ${selectedTable === key ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
                    >
                      <span>{label}</span>
                      {selectedTable === key && <Check size={13} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* نطاق التاريخ */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-medium">
                {currentLang === 'ar' ? 'نطاق التاريخ' : 'Date Range'}
              </label>
              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <CalendarIcon size={13} className="text-emerald-400 shrink-0" />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[11px] text-slate-200 focus:outline-none w-full"
                />
                <span className="text-slate-600 text-xs">-</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[11px] text-slate-200 focus:outline-none w-full"
                />
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-rose-400 p-0.5">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* قائمة السجلات المحدثة */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Loader2 size={22} className="animate-spin text-emerald-400" />
            <span>{currentLang === 'ar' ? 'جاري التحميل...' : 'Syncing data...'}</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs font-medium bg-slate-900/40 rounded-2xl border border-slate-800">
            {currentLang === 'ar' ? 'لا توجد سجلات تطابق الفلتر' : 'No logs found'}
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
                className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-150"
              >
                {/* رأس البطاقة */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${badge.bg} ${badge.color} border ${badge.border}`}>
                      <IconComponent size={17} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-xs text-slate-100">
                          {badge.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
                          {TABLE_DISPLAY_NAMES[currentLang][log.table_name] || log.table_name}
                        </span>
                      </div>
                      
                      <div className="text-slate-400 text-[11px] truncate flex items-center gap-1">
                        <UserCheck size={12} className="text-slate-500 shrink-0" />
                        <span className="truncate">{currentLang === 'ar' ? 'بواسطة:' : 'By:'} <strong className="text-slate-200 font-medium">{userName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right text-[10px] sm:text-xs">
                      <div className="text-slate-300 font-medium flex items-center justify-end gap-1">
                        <Clock size={10} className="text-emerald-400" />
                        <span>{timeFormatted}</span>
                      </div>
                      <div className="text-slate-500">{dateFormatted}</div>
                    </div>

                    <div className="p-1 rounded-lg bg-slate-800/60 text-slate-400">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* التفاصيل المفرودة */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-950/70 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-slate-300 font-semibold text-[11px]">
                        {currentLang === 'ar' ? 'تفاصيل البيانات المسجلة' : 'Logged Details'}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRawJson(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                        }}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 transition-colors"
                      >
                        <Code size={11} />
                        <span>{showRawJson[log.id] ? (currentLang === 'ar' ? 'عرض منظم' : 'Friendly') : 'JSON'}</span>
                      </button>
                    </div>

                    {showRawJson[log.id] ? (
                      <pre className="p-2.5 bg-slate-900 rounded-xl overflow-x-auto text-[10px] font-mono text-emerald-400 border border-slate-800 text-left dir-ltr">
                        {JSON.stringify(log.new_data || log.old_data || {}, null, 2)}
                      </pre>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(log.new_data || log.record_data || log.old_data || {}).map(([key, value]) => {
                          if (key.endsWith('_id') || key === 'id' || key.endsWith('_at') || value === null) return null;
                          return (
                            <div key={key} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2">
                              <span className="text-slate-400 text-[10px]">
                                {FIELD_LABELS[currentLang][key] || key}
                              </span>
                              <span className="text-slate-200 font-semibold text-[11px] truncate max-w-[160px]">
                                {formatValue(key, value)}
                              </span>
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
