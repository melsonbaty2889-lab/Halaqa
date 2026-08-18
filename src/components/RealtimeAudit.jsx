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
    attendance: 'Attendance',
    payments: 'Payments',
    halaqas: 'Halaqas',
    students: 'Students',
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
    phone: 'Phone',
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
    false: 'Not Archived',
    true: 'Archived',
  }
};

// --- Custom Select المتوافق مع الهوية البصرية ---
function CustomSelect({ options, value, onChange, placeholder, isRtl }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between input-field border border-emerald-500/20 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs transition-all duration-200"
        style={{
          backgroundColor: 'var(--bg-input, rgba(15, 23, 42, 0.6))',
          color: 'var(--text-main, #f8fafc)'
        }}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-emerald-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 border border-emerald-500/30 rounded-xl shadow-2xl backdrop-blur-xl max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--bg-card, #0b1320)',
            borderColor: 'var(--border-color, rgba(16, 185, 129, 0.2))'
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs ${isRtl ? 'text-right' : 'text-left'} transition-colors ${
                value === opt.value 
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold' 
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={13} className="text-emerald-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Custom Date Picker المتوافق مع الهوية البصرية ---
function CustomDatePicker({ value, onChange, placeholder }) {
  const inputRef = useRef(null);

  return (
    <div className="relative flex-1">
      <input 
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
        className="w-full flex items-center justify-between input-field border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl px-3 py-2 text-xs transition-all duration-200"
        style={{
          backgroundColor: 'var(--bg-input, rgba(15, 23, 42, 0.6))',
          color: 'var(--text-main, #f8fafc)'
        }}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={13} className="text-emerald-400 shrink-0" />
          <span className={value ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
            {value || placeholder}
          </span>
        </div>
        {value && (
          <X 
            size={12} 
            className="text-slate-400 hover:text-rose-400 transition-colors shrink-0" 
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
          />
        )}
      </button>
    </div>
  );
}

export default function RealtimeAudit() {
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

  const formatValue = useCallback((key, val) => {
    if (val === null || val === undefined || val === '') {
      return <span className="opacity-40">—</span>;
    }
    if (typeof val === 'object') {
      if (Object.keys(val).length === 0) return <span className="opacity-40">—</span>;
      if (val[currentLang]) return val[currentLang];
      if (val.ar || val.en) return val.ar || val.en;
      if (val.name) return typeof val.name === 'object' ? formatValue(key, val.name) : val.name;
      if (val.full_name) return val.full_name;
      return JSON.stringify(val);
    }
    const strVal = String(val);
    if (VALUE_TRANSLATIONS[currentLang][strVal] !== undefined) {
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
    if (log.changed_by) return `${currentLang === 'ar' ? 'مستخدم' : 'User'}: ${log.changed_by.substring(0, 8)}...`;
    return currentLang === 'ar' ? 'النظام التلقائي' : 'System Automated';
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
    link.setAttribute("download", `Audit_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOperationBadge = (operation) => {
    switch (operation?.toUpperCase()) {
      case 'INSERT':
        return { 
          icon: PlusCircle, 
          color: 'var(--color-emerald, #10b981)', 
          bg: 'rgba(16, 185, 129, 0.12)', 
          border: 'rgba(16, 185, 129, 0.4)', 
          label: currentLang === 'ar' ? 'إضافة' : 'Insert' 
        };
      case 'UPDATE':
        return { 
          icon: Edit, 
          color: 'var(--color-blue, #3b82f6)', 
          bg: 'rgba(59, 130, 246, 0.12)', 
          border: 'rgba(59, 130, 246, 0.4)', 
          label: currentLang === 'ar' ? 'تعديل' : 'Update' 
        };
      case 'DELETE':
        return { 
          icon: Trash2, 
          color: 'var(--color-rose, #ef4444)', 
          bg: 'rgba(239, 68, 68, 0.12)', 
          border: 'rgba(239, 68, 68, 0.4)', 
          label: currentLang === 'ar' ? 'حذف' : 'Delete' 
        };
      default:
        return { 
          icon: Database, 
          color: 'var(--color-cyan, #0ea5e9)', 
          bg: 'rgba(14, 165, 233, 0.12)', 
          border: 'rgba(14, 165, 233, 0.4)', 
          label: operation || 'Op' 
        };
    }
  };

  const renderFriendlyPayload = (log) => {
    const isRaw = showRawJson[log.id];
    const oldData = log.old_data || {};
    const newData = log.new_data || log.record_data || {};

    if (isRaw) {
      return (
        <pre 
          className="p-3 rounded-xl overflow-x-auto text-xs font-mono border dir-ltr text-left"
          style={{
            backgroundColor: 'var(--bg-input, #070d18)',
            borderColor: 'var(--border-color, rgba(16, 185, 129, 0.2))',
            color: 'var(--color-emerald, #10b981)'
          }}
        >
          {JSON.stringify(newData || oldData, null, 2)}
        </pre>
      );
    }

    const keysToDisplay = Object.keys(newData).filter(k => 
      !k.endsWith('_id') && k !== 'id' && !k.endsWith('_at') && newData[k] !== null
    );

    return (
      <div className="flex flex-col gap-2 pt-1">
        {log.operation === 'UPDATE' && Object.keys(oldData).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.keys(newData).map(key => {
              if (JSON.stringify(oldData[key]) === JSON.stringify(newData[key])) return null;
              if (key.endsWith('_id') || key === 'id' || key.endsWith('_at')) return null;

              return (
                <div 
                  key={key} 
                  className="p-2.5 rounded-xl border backdrop-blur-sm"
                  style={{
                    backgroundColor: 'var(--bg-input, rgba(15, 23, 42, 0.5))',
                    borderColor: 'var(--border-color, rgba(255, 255, 255, 0.08))'
                  }}
                >
                  <div className="text-slate-400 text-[11px] mb-1 font-medium">
                    {FIELD_LABELS[currentLang][key] || key}
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-rose-400 line-through">{formatValue(key, oldData[key])}</span>
                    <ArrowRight size={12} className={`text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                    <span className="text-emerald-400 font-bold">{formatValue(key, newData[key])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {keysToDisplay.map(key => (
              <div 
                key={key} 
                className="p-2.5 rounded-xl border backdrop-blur-sm"
                style={{
                  backgroundColor: 'var(--bg-input, rgba(15, 23, 42, 0.5))',
                  borderColor: 'var(--border-color, rgba(255, 255, 255, 0.08))'
                }}
              >
                <div className="text-slate-400 text-[11px] mb-1 font-medium">
                  {FIELD_LABELS[currentLang][key] || key}
                </div>
                <div className="font-bold text-xs" style={{ color: 'var(--text-main, #f8fafc)' }}>
                  {formatValue(key, newData[key])}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const tableOptions = useMemo(() => [
    { value: 'all', label: currentLang === 'ar' ? 'جميع الجداول' : 'All Tables' },
    ...Object.entries(TABLE_DISPLAY_NAMES[currentLang]).map(([key, label]) => ({
      value: key,
      label
    }))
  ], [currentLang]);

  return (
    <div className={`p-4 max-w-4xl mx-auto font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wide mb-1" style={{ color: 'var(--text-main, #ffffff)' }}>
            {currentLang === 'ar' ? 'سجل الأنشطة والتغييرات' : 'Live Activity Log'}
          </h1>
          <p className="text-xs text-slate-400">
            {currentLang === 'ar' ? 'متابعة فورية لكافة الإضافات والتعديلات والعمليات' : 'Real-time tracking of all updates and changes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold shadow-lg transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.8))',
              borderColor: 'var(--border-color, rgba(16, 185, 129, 0.2))',
              color: 'var(--text-main, #f8fafc)'
            }}
          >
            <Download size={14} className="text-emerald-400" />
            <span>{currentLang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button 
            onClick={fetchAuditLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold shadow-lg transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.8))',
              borderColor: 'var(--border-color, rgba(16, 185, 129, 0.2))',
              color: 'var(--text-main, #f8fafc)'
            }}
          >
            <RefreshCw size={14} className={`text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{currentLang === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* لوحة الفلاتر المخصصة */}
      <div 
        className="border rounded-2xl p-4 mb-5 shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--bg-card, rgba(11, 19, 32, 0.85))',
          borderColor: 'var(--border-color, rgba(16, 185, 129, 0.2))'
        }}
      >
        <div className="flex flex-col gap-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* مربع البحث */}
            <div className="relative">
              <Search size={15} className={`absolute top-3.5 text-emerald-400/80 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input 
                type="text"
                placeholder={currentLang === 'ar' ? 'ابحث باسم المشرف، أو الجدول...' : 'Search table or user...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-xl py-2.5 text-xs transition-all focus:outline-none ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                style={{
                  backgroundColor: 'var(--bg-input, rgba(15, 23, 42, 0.6))',
                  borderColor: 'var(--border-color, rgba(16, 185, 129, 0.2))',
                  color: 'var(--text-main, #f8fafc)'
                }}
              />
            </div>

            {/* القائمة المنسدلة المخصصة */}
            <CustomSelect 
              options={tableOptions} 
              value={selectedTable} 
              onChange={setSelectedTable} 
              placeholder={currentLang === 'ar' ? 'جميع الجداول' : 'All Tables'}
              isRtl={isRtl}
            />
          </div>

          {/* النطاق الزمني المخصص */}
          <div 
            className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--bg-input, rgba(15, 23, 42, 0.4))',
              borderColor: 'var(--border-color, rgba(255, 255, 255, 0.05))'
            }}
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CalendarIcon size={14} />
              <span>{currentLang === 'ar' ? 'النطاق الزمني:' : 'Date Range:'}</span>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <CustomDatePicker 
                value={startDate} 
                onChange={setStartDate} 
                placeholder={currentLang === 'ar' ? 'من تاريخ' : 'Start Date'} 
              />
              <span className="text-slate-500 text-xs font-bold">{currentLang === 'ar' ? 'إلى' : 'to'}</span>
              <CustomDatePicker 
                value={endDate} 
                onChange={setEndDate} 
                placeholder={currentLang === 'ar' ? 'إلى تاريخ' : 'End Date'} 
              />
            </div>

            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="flex items-center justify-center gap-1 text-rose-400 hover:text-rose-300 text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors shrink-0"
              >
                <FilterX size={13} />
                <span>{currentLang === 'ar' ? 'إعادة ضبط' : 'Clear'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* قائمة السجلات والكروت */}
      <div 
        className="border rounded-2xl p-3 shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--bg-card, rgba(11, 19, 32, 0.85))',
          borderColor: 'var(--border-color, rgba(16, 185, 129, 0.2))'
        }}
      >
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-emerald-400" />
            <span>{currentLang === 'ar' ? 'جاري تحميل السجل...' : 'Loading audit logs...'}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs font-medium">
            {currentLang === 'ar' ? 'لا توجد أنشطة مسجلة بعد' : 'No activities recorded yet'}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs font-medium">
            {currentLang === 'ar' ? 'لا توجد نتائج تطابق البحث' : 'No matching results'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredLogs.map((log) => {
              const badge = getOperationBadge(log.operation);
              const IconComponent = badge.icon;
              const isExpanded = expandedLogId === log.id;
              const userName = getUserDisplayName(log);
              const timeFormatted = new Date(log.created_at).toLocaleTimeString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
              const dateFormatted = new Date(log.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });

              return (
                <div 
                  key={log.id} 
                  className="border rounded-xl overflow-hidden transition-all duration-200 shadow-md"
                  style={{
                    backgroundColor: 'var(--bg-card, #0d1626)',
                    borderColor: 'var(--border-color, rgba(255, 255, 255, 0.08))',
                    borderRight: isRtl ? `3px solid ${badge.border}` : undefined,
                    borderLeft: !isRtl ? `3px solid ${badge.border}` : undefined,
                  }}
                >
                  <div 
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                      >
                        <IconComponent size={17} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-extrabold text-xs tracking-wide" style={{ color: 'var(--text-main, #ffffff)' }}>
                            {badge.label}
                          </span>
                          <span 
                            className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold border"
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              borderColor: 'rgba(16, 185, 129, 0.25)',
                              color: 'var(--color-emerald, #10b981)'
                            }}
                          >
                            {TABLE_DISPLAY_NAMES[currentLang][log.table_name] || log.table_name}
                          </span>
                        </div>
                        
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <UserCheck size={12} className="text-emerald-400" />
                          <span>{currentLang === 'ar' ? 'بواسطة:' : 'By:'} <strong style={{ color: 'var(--text-main, #f8fafc)' }}>{userName}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left rtl:text-right">
                        <div className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 justify-end rtl:justify-start">
                          <Clock size={11} />
                          <span>{timeFormatted}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] mt-0.5">
                          {dateFormatted}
                        </div>
                      </div>

                      {isExpanded ? <ChevronUp size={16} className="text-emerald-400" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div 
                      className="p-3.5 border-t text-xs animate-in fade-in duration-150"
                      style={{
                        backgroundColor: 'var(--bg-input, rgba(7, 13, 24, 0.7))',
                        borderColor: 'var(--border-color, rgba(255, 255, 255, 0.08))'
                      }}
                    >
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                          <Layers size={13} />
                          {currentLang === 'ar' ? 'تفاصيل التغيير:' : 'Payload:'}
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRawJson(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border transition-colors"
                          style={{
                            backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.8))',
                            borderColor: 'var(--border-color, rgba(255, 255, 255, 0.1))'
                          }}
                        >
                          <Code size={11} />
                          <span>{showRawJson[log.id] ? (currentLang === 'ar' ? 'عرض مبسط' : 'Friendly View') : (currentLang === 'ar' ? 'عرض JSON' : 'Raw JSON')}</span>
                        </button>
                      </div>

                      {renderFriendlyPayload(log)}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
