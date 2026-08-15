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
  const isArabic = !i18n.language || i18n.language.startsWith('ar');
  const isRtl = i18n.dir() === 'rtl' || isArabic;

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
        <pre style={{ background: C.input, padding: 12, borderRadius: 12, color: C.success, overflowX: 'auto', margin: 0, fontSize: '0.72rem', fontFamily: 'monospace', border: `1px solid ${C.border}` }}>
          {JSON.stringify(newData || oldData, null, 2)}
        </pre>
      );
    }

    const keysToDisplay = Object.keys(newData).filter(k => 
      !k.endsWith('_id') && k !== 'id' && !k.endsWith('_at') && newData[k] !== null
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {log.operation === 'UPDATE' && Object.keys(oldData).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
            {Object.keys(newData).map(key => {
              if (JSON.stringify(oldData[key]) === JSON.stringify(newData[key])) return null;
              if (key.endsWith('_id') || key === 'id' || key.endsWith('_at')) return null;

              return (
                <div key={key} style={{ background: C.input, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ color: C.textMuted, fontSize: '0.7rem', marginBottom: 4 }}>
                    {fieldLabels[key] || key}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ color: C.danger, textDecoration: 'line-through' }}>{formatValue(key, oldData[key])}</span>
                    <span style={{ color: C.textMuted }}>➔</span>
                    <span style={{ color: C.success, fontWeight: 700 }}>{formatValue(key, newData[key])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {keysToDisplay.map(key => (
              <div key={key} style={{ background: C.input, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.textMuted, fontSize: '0.7rem', marginBottom: 2 }}>
                  {fieldLabels[key] || key}
                </div>
                <div style={{ color: C.text, fontWeight: 600, fontSize: '0.78rem' }}>
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
    <div style={{ padding: '24px 16px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* الترويسة الموحدة */}
        <PageHeader 
          title={isArabic ? 'سجل الأنشطة والتغييرات' : 'Live Activity Log'}
          sub={isArabic ? 'متابعة فورية لكافة الإضافات والتعديلات والعمليات داخل النظام' : 'Real-time tracking of all updates and changes across the system'}
          action={
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="secondary" onClick={exportToCSV} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <Download size={15} />
                <span>{isArabic ? 'تصدير CSV' : 'Export Report'}</span>
              </Btn>

              <Btn variant="secondary" onClick={fetchAuditLogs} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
              </Btn>
            </div>
          }
        />

        {/* أدوات البحث والفلترة */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
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

            {/* فلتر التاريخ */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: C.input, padding: '10px 14px', borderRadius: 12, border: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.primary, fontSize: '0.8rem', fontWeight: 700 }}>
                <Calendar size={15} />
                <span>{isArabic ? 'النطاق الزمني:' : 'Date Range:'}</span>
              </div>
              
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: '6px 10px', borderRadius: 8, fontSize: '0.78rem', outline: 'none' }} 
              />
              
              <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>{isArabic ? 'إلى' : 'to'}</span>
              
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: '6px 10px', borderRadius: 8, fontSize: '0.78rem', outline: 'none' }} 
              />

              {(startDate || endDate) && (
                <Btn variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ color: C.danger, padding: '4px 8px', fontSize: '0.75rem' }}>
                  {isArabic ? 'إلغاء الفلترة' : 'Clear'}
                </Btn>
              )}
            </div>
          </div>
        </Card>

        {/* قائمة السجلات */}
        <Card>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.textSub, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={18} className="animate-spin" style={{ color: C.primary }} />
              <span>{isArabic ? 'جاري تحميل سجل التغييرات...' : 'Loading audit logs...'}</span>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: C.textSub }}>
              {isArabic ? 'لا توجد أنشطة مسجلة في قاعدة البيانات بعد' : 'No activities recorded in database yet'}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: C.textSub }}>
              {isArabic ? 'لا توجد نتائج تطابق خيارات البحث' : 'No results matching search filters'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredLogs.map((log) => {
                const badge = getOperationBadge(log.operation);
                const IconComponent = badge.icon;
                const isExpanded = expandedLogId === log.id;
                const userName = getUserDisplayName(log);
                const timeFormatted = new Date(log.created_at).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                const dateFormatted = new Date(log.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={log.id} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                    <div 
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComponent size={18} style={{ color: badge.color }} />
                        </div>

                        <div>
                          <div style={{ color: C.text, fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{badge.label}</span>
                            <Badge color={C.primary}>
                              {tableDisplayNames[log.table_name] || log.table_name}
                            </Badge>
                          </div>
                          
                          <div style={{ color: C.textSub, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <UserCheck size={13} style={{ color: C.primary }} />
                            <span>{isArabic ? 'بواسطة:' : 'By:'} <strong style={{ color: C.text }}>{userName}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                          <div style={{ color: C.primary, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} />
                            <span>{timeFormatted}</span>
                          </div>
                          <div style={{ color: C.textMuted, fontSize: '0.7rem', marginTop: 2 }}>
                            {dateFormatted}
                          </div>
                        </div>

                        {isExpanded ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '14px 16px', background: C.input, borderTop: `1px solid ${C.border}`, fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ color: C.textSub, fontWeight: 700 }}>
                            {isArabic ? 'تفاصيل العملية:' : 'Payload Details:'}
                          </span>
                          
                          <Btn 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRawJson(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                            }}
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            <Code size={13} />
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
