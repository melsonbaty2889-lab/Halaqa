import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { 
  History, 
  Search, 
  RefreshCw, 
  Clock, 
  Database, 
  PlusCircle, 
  Edit, 
  Trash2, 
  UserCheck, 
  X, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  Code,
  Loader2
} from 'lucide-react';

// استيراد مكونات الواجهة الموحدة ونظام الألوان
import { Card, Btn, Input, Select, PageHeader, Badge } from '@/components/UI/UI';
import { C } from '@/theme/colors';

export default function RealtimeAudit({ session, userRole }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isArabic = currentLang.startsWith('ar');
  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : isArabic;

  const tableDisplayNames = {
    attendance: isArabic ? 'الحضور والتسميع' : 'Attendance',
    payments: isArabic ? 'الاشتراكات والمالية' : 'Payments',
    halaqas: isArabic ? 'الحلقات والمقارئ' : 'Halaqas',
    students: isArabic ? 'شؤون الطلاب' : 'Students',
    daily_progress: isArabic ? 'الإنجاز اليومي' : 'Daily Progress'
  };

  const fieldLabels = {
    status: isArabic ? 'الحالة' : 'Status',
    notes: isArabic ? 'الملاحظات' : 'Notes',
    date: isArabic ? 'التاريخ' : 'Date',
    juz: isArabic ? 'الجزء' : 'Juz',
    amount: isArabic ? 'المبلغ' : 'Amount',
    full_name: isArabic ? 'الاسم الكامل' : 'Full Name',
    name: isArabic ? 'الاسم' : 'Name',
    phone: isArabic ? 'رقم الهاتف' : 'Phone',
    quarter_index: isArabic ? 'الربع' : 'Quarter',
    quarter_in_hizb: isArabic ? 'الربع في الحزب' : 'Quarter in Hizb',
    session_grade: isArabic ? 'الدرجة' : 'Grade',
    gender: isArabic ? 'النوع' : 'Gender',
    points: isArabic ? 'النقاط' : 'Points',
    country: isArabic ? 'الدولة' : 'Country',
    current_juz: isArabic ? 'الجزء الحالي' : 'Current Juz',
    is_archived: isArabic ? 'الأرشيف' : 'Archived',
    level_score: isArabic ? 'تقييم المستوى' : 'Level Score',
    student_code: isArabic ? 'كود الطالب' : 'Student Code',
    payment_status: isArabic ? 'حالة الدفع' : 'Payment Status',
    last_test_score: isArabic ? 'آخر اختبار' : 'Last Test Score',
    current_quarter: isArabic ? 'الربع الحالي' : 'Current Quarter',
    current_quarter_index: isArabic ? 'مؤشر الربع' : 'Quarter Index',
    subscription_system: isArabic ? 'نظام الاشتراك' : 'Subscription System'
  };

  const valueTranslations = {
    present: isArabic ? 'حاضر' : 'Present',
    absent: isArabic ? 'غائب' : 'Absent',
    late: isArabic ? 'متأخر' : 'Late',
    excused: isArabic ? 'مستأذن' : 'Excused',
    male: isArabic ? 'ذكر' : 'Male',
    female: isArabic ? 'أنثى' : 'Female',
    active: isArabic ? 'نشط' : 'Active',
    unpaid: isArabic ? 'غير مدفوع' : 'Unpaid',
    paid: isArabic ? 'مدفوع' : 'Paid',
    monthly: isArabic ? 'شهري' : 'Monthly',
    yearly: isArabic ? 'سنوي' : 'Yearly',
    false: isArabic ? 'غير مؤرشف' : 'Not Archived',
    true: isArabic ? 'مؤرشف' : 'Archived',
    EG: isArabic ? 'مصر 🇪🇬' : 'Egypt 🇪🇬'
  };

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showRawJson, setShowRawJson] = useState({});

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          performer:profiles(full_name, name, email)
        `)
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
    const channel = supabase
      .channel('realtime-audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
        fetchAuditLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAuditLogs]);

  const getUserDisplayName = (log) => {
    if (log.performer?.full_name) return log.performer.full_name;
    if (log.performer?.name) return log.performer.name;
    if (log.performer?.email) return log.performer.email;
    if (log.changed_by) return `${isArabic ? 'مستخدم' : 'User'}: ${log.changed_by.substring(0, 8)}...`;
    return isArabic ? 'النظام التلقائي' : 'System Automated';
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      isArabic ? "المعرف" : "ID", 
      isArabic ? "الجدول" : "Table", 
      isArabic ? "العملية" : "Operation", 
      isArabic ? "بواسطة" : "Changed By", 
      isArabic ? "التاريخ والتوقيت" : "Date & Time"
    ];

    const rows = filteredLogs.map(log => [
      `"${log.id}"`,
      `"${tableDisplayNames[log.table_name] || log.table_name}"`,
      `"${log.operation}"`,
      `"${getUserDisplayName(log)}"`,
      `"${new Date(log.created_at).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}"`
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
        return { icon: PlusCircle, color: C.success, bg: `${C.success}18`, label: isArabic ? 'إضافة' : 'Insert' };
      case 'UPDATE':
        return { icon: Edit, color: C.primary, bg: `${C.primary}18`, label: isArabic ? 'تعديل' : 'Update' };
      case 'DELETE':
        return { icon: Trash2, color: C.danger, bg: `${C.danger}18`, label: isArabic ? 'حذف' : 'Delete' };
      default:
        return { icon: Database, color: C.primary, bg: `${C.primary}18`, label: operation || 'Op' };
    }
  };

  const filteredLogs = logs.filter((log) => {
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
    const operation = (log.operation || '').toLowerCase();
    const userName = getUserDisplayName(log).toLowerCase();
    return `${rawTable} ${operation} ${userName}`.includes(query);
  });

  const formatValue = (key, val) => {
    if (val === null || val === undefined || val === '') return <span style={{ color: C.textMuted }}>—</span>;
    
    if (typeof val === 'object') {
      if (Object.keys(val).length === 0) return <span style={{ color: C.textMuted }}>—</span>;
      if (val.ar && isArabic) return val.ar;
      if (val.en && !isArabic) return val.en;
      if (val.name) return typeof val.name === 'object' ? formatValue(key, val.name) : val.name;
      if (val.full_name) return val.full_name;
      return JSON.stringify(val);
    }

    const strVal = String(val);
    if (valueTranslations[strVal] !== undefined) return valueTranslations[strVal];
    return strVal;
  };

  const renderFriendlyPayload = (log) => {
    const isRaw = showRawJson[log.id];
    const oldData = log.old_data || {};
    const newData = log.new_data || log.record_data || {};

    if (isRaw) {
      return (
        <pre className="bg-slate-900/90 p-3 rounded-xl text-emerald-400 overflow-x-auto m-0 text-[11px] font-mono border border-slate-800">
          {JSON.stringify(newData || oldData, null, 2)}
        </pre>
      );
    }

    const keysToDisplay = Object.keys(newData).filter(k => 
      !k.endsWith('_id') && k !== 'id' && !k.endsWith('_at') && newData[k] !== null
    );

    return (
      <div className="flex flex-col gap-2.5">
        {log.operation === 'UPDATE' && Object.keys(oldData).length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.keys(newData).map(key => {
              if (JSON.stringify(oldData[key]) === JSON.stringify(newData[key])) return null;
              if (key.endsWith('_id') || key === 'id' || key.endsWith('_at')) return null;

              return (
                <div key={key} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] mb-1">
                    {fieldLabels[key] || key}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                    <span className="text-rose-400 line-through">{formatValue(key, oldData[key])}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="text-emerald-400 font-bold">{formatValue(key, newData[key])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
            {keysToDisplay.map(key => (
              <div key={key} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-slate-400 text-[10px] mb-1">
                  {fieldLabels[key] || key}
                </div>
                <div className="text-slate-100 font-semibold text-[11px] truncate">
                  {formatValue(key, newData[key])}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const tableOptions = [
    { value: 'all', label: isArabic ? 'جميع الجداول' : 'All Tables' },
    ...Object.entries(tableDisplayNames).map(([key, label]) => ({ value: key, label }))
  ];

  return (
    <div 
      className="px-2.5 py-4 sm:px-6 sm:py-6 w-full max-w-full overflow-hidden box-border" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* الترويسة الموحدة */}
        <PageHeader 
          title={isArabic ? 'سجل الأنشطة والتغييرات' : 'Live Activity Log'}
          sub={isArabic ? 'متابعة فورية لكافة الإضافات والتعديلات والعمليات داخل النظام' : 'Real-time tracking of all updates and changes across the system'}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <Btn variant="secondary" onClick={exportToCSV} className="!px-3 !py-1.5 !text-xs">
                <Download size={14} />
                <span>{isArabic ? 'تصدير CSV' : 'Export Report'}</span>
              </Btn>

              <Btn variant="secondary" onClick={fetchAuditLogs} className="!px-3 !py-1.5 !text-xs">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
              </Btn>
            </div>
          }
        />

        {/* أدوات البحث والفلترة */}
        <Card className="!p-3 sm:!p-4">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input 
                placeholder={isArabic ? 'ابحث باسم المشرف، أو الجدول، أو العملية...' : 'Search table, user, or operation...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ margin: 0 }}
              />

              <Select
                value={selectedTable}
                options={tableOptions}
                onChange={(e) => setSelectedTable(e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            {/* فلتر التاريخ المحدث ليناسب الموبايل */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold shrink-0">
                <Calendar size={14} />
                <span>{isArabic ? 'النطاق الزمني:' : 'Date Range:'}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-slate-950 border border-slate-700/80 text-slate-100 px-2.5 py-1.5 rounded-lg text-xs outline-none flex-1 min-w-0"
                  style={{ colorScheme: 'dark' }}
                />
                
                <span className="text-slate-400 text-xs shrink-0">{isArabic ? 'إلى' : 'to'}</span>
                
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-slate-950 border border-slate-700/80 text-slate-100 px-2.5 py-1.5 rounded-lg text-xs outline-none flex-1 min-w-0"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {(startDate || endDate) && (
                <Btn 
                  variant="ghost" 
                  onClick={() => { setStartDate(''); setEndDate(''); }} 
                  className="!text-rose-400 !px-2 !py-1 !text-xs shrink-0"
                >
                  {isArabic ? 'إلغاء الفلترة' : 'Clear'}
                </Btn>
              )}
            </div>
          </div>
        </Card>

        {/* قائمة السجلات */}
        <Card className="!p-2 sm:!p-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-emerald-400" />
              <span>{isArabic ? 'جاري تحميل سجل التغييرات...' : 'Loading audit logs...'}</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد أنشطة مسجلة في قاعدة البيانات بعد' : 'No activities recorded in database yet'}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد نتائج تطابق خيارات البحث' : 'No results matching search filters'}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredLogs.map((log) => {
                const badge = getOperationBadge(log.operation);
                const IconComponent = badge.icon;
                const isExpanded = expandedLogId === log.id;
                const userName = getUserDisplayName(log);
                const timeFormatted = new Date(log.created_at).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                const dateFormatted = new Date(log.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });

                return (
                  <div 
                    key={log.id} 
                    className="bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden transition-all hover:border-slate-700"
                  >
                    {/* صف السجل الرئيسي المصمم بالتجاوب الكامل */}
                    <div 
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-2.5 sm:p-3.5 flex items-center justify-between gap-2 cursor-pointer select-none"
                    >
                      {/* الجهة اليمنى: الأيقونة والنصوص */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div 
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0" 
                          style={{ background: badge.bg }}
                        >
                          <IconComponent size={16} style={{ color: badge.color }} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-slate-100 font-bold text-xs shrink-0">
                              {badge.label}
                            </span>
                            <Badge color={C.primary} className="!px-1.5 !py-0.5 !text-[10px] truncate max-w-[120px]">
                              {tableDisplayNames[log.table_name] || log.table_name}
                            </Badge>
                          </div>
                          
                          <div className="text-slate-400 text-[11px] flex items-center gap-1 truncate">
                            <UserCheck size={12} className="text-emerald-400 shrink-0" />
                            <span className="shrink-0">{isArabic ? 'بواسطة:' : 'By:'}</span>
                            <strong className="text-slate-200 truncate">{userName}</strong>
                          </div>
                        </div>
                      </div>

                      {/* الجهة اليسرى: الوقت والسهم */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={isRtl ? "text-left" : "text-right"}>
                          <div className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 justify-end">
                            <Clock size={11} className="shrink-0" />
                            <span className="whitespace-nowrap">{timeFormatted}</span>
                          </div>
                          <div className="text-slate-500 text-[10px] mt-0.5 whitespace-nowrap">
                            {dateFormatted}
                          </div>
                        </div>

                        <div className="text-slate-500 p-0.5">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* القائمة المنسدلة للتفاصيل */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 text-xs">
                        <div className="flex justify-between items-center mb-2 gap-2">
                          <span className="text-slate-400 font-bold text-[11px]">
                            {isArabic ? 'تفاصيل العملية:' : 'Payload Details:'}
                          </span>
                          
                          <Btn 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRawJson(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                            }}
                            className="!px-2 !py-1 !text-[10px]"
                          >
                            <Code size={12} />
                            <span>{showRawJson[log.id] ? (isArabic ? 'عرض كارت مبسط' : 'View Friendly') : (isArabic ? 'عرض كود JSON' : 'View Raw JSON')}</span>
                          </Btn>
                        </div>

                        {renderFriendlyPayload(log)}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
