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
  Calendar,
  Code,
  Loader2,
  FilterX,
  Layers,
  ArrowRight
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
      return <span className="text-slate-500">—</span>;
    }
    if (typeof val === 'object') {
      if (Object.keys(val).length === 0) return <span className="text-slate-500">—</span>;
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
        return { icon: PlusCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', label: currentLang === 'ar' ? 'إضافة' : 'Insert' };
      case 'UPDATE':
        return { icon: Edit, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', label: currentLang === 'ar' ? 'تعديل' : 'Update' };
      case 'DELETE':
        return { icon: Trash2, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', label: currentLang === 'ar' ? 'حذف' : 'Delete' };
      default:
        return { icon: Database, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9', label: operation || 'Op' };
    }
  };

  const renderFriendlyPayload = (log) => {
    const isRaw = showRawJson[log.id];
    const oldData = log.old_data || {};
    const newData = log.new_data || log.record_data || {};

    if (isRaw) {
      return (
        <pre className="bg-slate-950 p-3 rounded-lg text-emerald-400 overflow-x-auto text-xs border border-slate-800 dir-ltr text-left">
          {JSON.stringify(newData || oldData, null, 2)}
        </pre>
      );
    }

    const keysToDisplay = Object.keys(newData).filter(k => 
      !k.endsWith('_id') && k !== 'id' && !k.endsWith('_at') && newData[k] !== null
    );

    return (
      <div className="flex flex-col gap-2">
        {log.operation === 'UPDATE' && Object.keys(oldData).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.keys(newData).map(key => {
              if (JSON.stringify(oldData[key]) === JSON.stringify(newData[key])) return null;
              if (key.endsWith('_id') || key === 'id' || key.endsWith('_at')) return null;

              return (
                <div key={key} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
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
              <div key={key} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 text-[11px] mb-1 font-medium">
                  {FIELD_LABELS[currentLang][key] || key}
                </div>
                <div className="text-slate-200 font-semibold text-xs">
                  {formatValue(key, newData[key])}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-4 max-w-4xl mx-auto text-slate-100 ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {currentLang === 'ar' ? 'سجل الأنشطة والتغييرات' : 'Live Activity Log'}
          </h1>
          <p className="text-xs text-slate-400">
            {currentLang === 'ar' ? 'متابعة فورية لكافة الإضافات والتعديلات والعمليات' : 'Real-time tracking of all updates and changes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-all">
            <Download size={14} />
            <span>{currentLang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button 
            onClick={fetchAuditLogs}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{currentLang === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* الفلاتر والبحث */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={15} className={`absolute top-3 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input 
                type="text"
                placeholder={currentLang === 'ar' ? 'ابحث باسم المشرف، أو الجدول...' : 'Search table or user...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-700/80 rounded-lg py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
              />
            </div>

            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500">
              <option value="all">{currentLang === 'ar' ? 'جميع الجداول' : 'All Tables'}</option>
              {Object.entries(TABLE_DISPLAY_NAMES[currentLang]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* اختيار النطاق الزمني بصناديق واضحة */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
              <Calendar size={14} />
              <span>{currentLang === 'ar' ? 'النطاق الزمني:' : 'Date Range:'}</span>
            </div>

            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 [color-scheme:dark]"
            />

            <span className="text-slate-500 text-xs">{currentLang === 'ar' ? 'إلى' : 'to'}</span>

            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500 [color-scheme:dark]"
            />

            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20">
                <FilterX size={12} />
                <span>{currentLang === 'ar' ? 'مسح' : 'Clear'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* قائمة البطاقات السفلية مع خلفية داكنة ثابتة */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-cyan-400" />
            <span>{currentLang === 'ar' ? 'جاري تحميل السجل...' : 'Loading audit logs...'}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {currentLang === 'ar' ? 'لا توجد أنشطة مسجلة بعد' : 'No activities recorded yet'}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {currentLang === 'ar' ? 'لا توجد نتائج تطابق البحث' : 'No matching results'}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
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
                  className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden transition-all"
                  style={{
                    borderRight: isRtl ? `3px solid ${badge.border}` : undefined,
                    borderLeft: !isRtl ? `3px solid ${badge.border}` : undefined,
                  }}
                >
                  <div 
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 transition-colors">
                    
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        <IconComponent size={16} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-xs text-slate-100">{badge.label}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-medium">
                            {TABLE_DISPLAY_NAMES[currentLang][log.table_name] || log.table_name}
                          </span>
                        </div>
                        
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <UserCheck size={11} className="text-cyan-400" />
                          <span>{currentLang === 'ar' ? 'بواسطة:' : 'By:'} <strong className="text-slate-200">{userName}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left rtl:text-right">
                        <div className="text-cyan-400 text-[11px] font-bold flex items-center gap-1 justify-end rtl:justify-start">
                          <Clock size={11} />
                          <span>{timeFormatted}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] mt-0.5">
                          {dateFormatted}
                        </div>
                      </div>

                      {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
                          <Layers size={13} className="text-cyan-400" />
                          {currentLang === 'ar' ? 'تفاصيل التغيير:' : 'Payload:'}
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRawJson(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
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
