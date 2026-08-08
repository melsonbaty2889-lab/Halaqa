/* src/components/RealtimeAudit.jsx - النسخة الاحترافية المحسنة بالكامل */
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
  Code
} from 'lucide-react';

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

  // 1. قاموس شامل لترجمة مفاتيح وقيم قاعدة البيانات
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

  // 2. قاموس ترجمة القيم المخزنة بالإنجليزية
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
        return { icon: PlusCircle, color: '#34D399', bg: 'rgba(52, 211, 153, 0.15)', label: isArabic ? 'إضافة' : 'Insert' };
      case 'UPDATE':
        return { icon: Edit, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', label: isArabic ? 'تعديل' : 'Update' };
      case 'DELETE':
        return { icon: Trash2, color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)', label: isArabic ? 'حذف' : 'Delete' };
      default:
        return { icon: Database, color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)', label: operation || 'Op' };
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

  // 3. معالجة النصوص والكائنات لحل مشكلة [object Object] وعرض الكائنات الفارغة {}
  const formatValue = (key, val) => {
    if (val === null || val === undefined || val === '') return <span style={{ color: '#64748B' }}>—</span>;
    
    if (typeof val === 'object') {
      if (Object.keys(val).length === 0) return <span style={{ color: '#64748B' }}>—</span>;
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
        <pre style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', color: '#34D399', overflowX: 'auto', margin: 0, fontSize: '0.72rem', fontFamily: 'monospace' }}>
          {JSON.stringify(newData || oldData, null, 2)}
        </pre>
      );
    }

    const keysToDisplay = Object.keys(newData).filter(k => 
      !k.endsWith('_id') && k !== 'id' && !k.endsWith('_at') && newData[k] !== null
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {log.operation === 'UPDATE' && Object.keys(oldData).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
            {Object.keys(newData).map(key => {
              if (JSON.stringify(oldData[key]) === JSON.stringify(newData[key])) return null;
              if (key.endsWith('_id') || key === 'id' || key.endsWith('_at')) return null;

              return (
                <div key={key} style={{ background: '#0F172A', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.7rem', marginBottom: '4px' }}>
                    {fieldLabels[key] || key}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#F87171', textDecoration: 'line-through' }}>{formatValue(key, oldData[key])}</span>
                    <span style={{ color: '#64748B' }}>➔</span>
                    <span style={{ color: '#34D399', fontWeight: 'bold' }}>{formatValue(key, newData[key])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
            {keysToDisplay.map(key => (
              <div key={key} style={{ background: '#0F172A', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#94A3B8', fontSize: '0.7rem', marginBottom: '2px' }}>
                  {fieldLabels[key] || key}
                </div>
                <div style={{ color: '#F8FAFC', fontWeight: '600', fontSize: '0.78rem' }}>
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
    <div style={{ paddingBottom: '80px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1️⃣ الترويسة الرئيسية */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} style={{ color: '#38BDF8' }} />
            <span>{isArabic ? 'سجل الأنشطة والتغييرات' : 'Live Activity Log'}</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>
            {isArabic 
              ? 'متابعة فورية لكافة الإضافات والتعديلات والعمليات داخل النظام' 
              : 'Real-time tracking of all updates and changes across the system'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={exportToCSV}
            style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} />
            <span>{isArabic ? 'تصدير Tsv/CSV' : 'Export Report'}</span>
          </button>

          <button 
            onClick={fetchAuditLogs}
            style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2️⃣ أدوات البحث والفلترة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'ابحث باسم المشرف، أو الجدول، أو العملية...' : 'Search table, user, or operation...'}
              style={{ width: '100%', padding: '10px 32px', paddingRight: isRtl ? '36px' : '32px', paddingLeft: isRtl ? '32px' : '36px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#FFF', fontSize: '0.82rem', outline: 'none' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            style={{ background: '#1E293B', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
            <option value="all">{isArabic ? 'جميع الجداول' : 'All Tables'}</option>
            {Object.entries(tableDisplayNames).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* أدوات تصفية النطاق الزمني */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#1E293B', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.78rem' }}>
            <Calendar size={14} style={{ color: '#38BDF8' }} />
            <span>{isArabic ? 'تاريخ:' : 'Date:'}</span>
          </div>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', outline: 'none' }} />
          <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{isArabic ? 'إلى' : 'to'}</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', outline: 'none' }} />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '0.75rem', cursor: 'pointer' }}>
              {isArabic ? 'إلغاء الفلترة' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* 3️⃣ قائمة السجلات */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
          {isArabic ? 'جاري تحميل سجل التغييرات...' : 'Loading audit logs...'}
        </div>
      ) : logs.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '30px', borderRadius: '16px', textAlign: 'center', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.05)' }}>
          {isArabic ? 'لا توجد أنشطة مسجلة في قاعدة البيانات بعد' : 'No activities recorded in database yet'}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '30px', borderRadius: '16px', textAlign: 'center', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.05)' }}>
          {isArabic ? 'لا توجد نتائج تطابق خيارات البحث' : 'No results matching search filters'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredLogs.map((log) => {
            const badge = getOperationBadge(log.operation);
            const Icon = badge.icon;
            const isExpanded = expandedLogId === log.id;
            const userName = getUserDisplayName(log);
            const timeFormatted = new Date(log.created_at).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
            const dateFormatted = new Date(log.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });

            return (
              <div key={log.id} style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color: badge.color }} />
                    </div>

                    <div>
                      <div style={{ color: '#F8FAFC', fontWeight: '700', fontSize: '0.85rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{badge.label}</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '6px', color: '#38BDF8' }}>
                          {tableDisplayNames[log.table_name] || log.table_name}
                        </span>
                      </div>
                      
                      <div style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={12} style={{ color: '#38BDF8' }} />
                        <span>{isArabic ? 'بواسطة:' : 'By:'} <strong style={{ color: '#CBD5E1' }}>{userName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                      <div style={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>{timeFormatted}</span>
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem', marginTop: '2px' }}>
                        {dateFormatted}
                      </div>
                    </div>

                    {isExpanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '12px 14px', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#94A3B8', fontWeight: '600' }}>
                        {isArabic ? 'تفاصيل العملية:' : 'Payload Details:'}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRawJson(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                        }}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#38BDF8', borderRadius: '6px', padding: '2px 8px', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Code size={12} />
                        <span>{showRawJson[log.id] ? (isArabic ? 'عرض كارت مبسط' : 'View Friendly') : (isArabic ? 'عرض كود JSON' : 'View Raw JSON')}</span>
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
  );
}
