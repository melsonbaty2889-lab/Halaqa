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

import { Card, Btn, Input, Select, PageHeader, Badge } from '@/components/UI/UI';
import { C } from '@/theme/colors';

// ----------------------------------------------------------------------
// Mappings & Localizations
// ----------------------------------------------------------------------
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
    current_quarter: 'الربع الحالي',
    current_quarter_index: 'مؤشر الربع',
    subscription_system: 'نظام الاشتراك',
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
    current_quarter: 'Current Quarter',
    current_quarter_index: 'Quarter Index',
    subscription_system: 'Subscription System',
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
    EG: 'مصر 🇪🇬'
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
    EG: 'Egypt 🇪🇬'
  }
};

export default function RealtimeAudit({ session, userRole }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language && i18n.language.startsWith('ar') ? 'ar' : 'en';
  const isRtl = i18n.dir() === 'rtl' || currentLang === 'ar';

  // State Management
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showRawJson, setShowRawJson] = useState({});

  // Safe Localization Extraction Engine
  const formatValue = useCallback((key, val) => {
    if (val === null || val === undefined || val === '') {
      return <span style={{ color: C.textMuted }}>—</span>;
    }

    if (typeof val === 'object') {
      if (Object.keys(val).length === 0) return <span style={{ color: C.textMuted }}>—</span>;
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

  // Fetch Audit Logs
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

  // Extract User Name Safely
  const getUserDisplayName = useCallback((log) => {
    if (log.performer?.full_name) return log.performer.full_name;
    if (log.performer?.name) return log.performer.name;
    if (log.performer?.email) return log.performer.email;
    if (log.changed_by) return `${currentLang === 'ar' ? 'مستخدم' : 'User'}: ${log.changed_by.substring(0, 8)}...`;
    return currentLang === 'ar' ? 'النظام التلقائي' : 'System Automated';
  }, [currentLang]);

  // Memoized Filtered Logs
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

  // CSV Export Engine
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
        return { icon: PlusCircle, color: C.success, bg: `${C.success}18`, label: currentLang === 'ar' ? 'إضافة' : 'Insert' };
      case 'UPDATE':
        return { icon: Edit, color: C.primary, bg: `${C.primary}18`, label: currentLang === 'ar' ? 'تعديل' : 'Update' };
      case 'DELETE':
        return { icon: Trash2, color: C.danger, bg: `${C.danger}18`, label: currentLang === 'ar' ? 'حذف' : 'Delete' };
      default:
        return { icon: Database, color: C.primary, bg: `${C.primary}18`, label: operation || 'Op' };
    }
  };

  // Render Smart Responsive Payload
  const renderFriendlyPayload = (log) => {
    const isRaw = showRawJson[log.id];
    const oldData = log.old_data || {};
    const newData = log.new_data || log.record_data || {};

    if (isRaw) {
      return (
        <pre style={{ 
          background: C.bg || '#0f172a', 
          padding: 12, 
          borderRadius: 12, 
          color: C.success, 
          overflowX: 'auto', 
          margin: 0, 
          fontSize: '0.72rem', 
          fontFamily: 'monospace', 
          border: `1px solid ${C.border}` 
        }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {Object.keys(newData).map(key => {
              if (JSON.stringify(oldData[key]) === JSON.stringify(newData[key])) return null;
              if (key.endsWith('_id') || key === 'id' || key.endsWith('_at')) return null;

              return (
                <div key={key} style={{ background: C.input, padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ color: C.textMuted, fontSize: '0.72rem', marginBottom: 6, fontWeight: 600 }}>
                    {FIELD_LABELS[currentLang][key] || key}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', flexWrap: 'wrap' }}>
                    <span style={{ color: C.danger, textDecoration: 'line-through' }}>{formatValue(key, oldData[key])}</span>
                    <ArrowRight size={12} style={{ color: C.textMuted, transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                    <span style={{ color: C.success, fontWeight: 700 }}>{formatValue(key, newData[key])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {keysToDisplay.map(key => (
              <div key={key} style={{ background: C.input, padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.textMuted, fontSize: '0.72rem', marginBottom: 4, fontWeight: 600 }}>
                  {FIELD_LABELS[currentLang][key] || key}
                </div>
                <div style={{ color: C.text, fontWeight: 600, fontSize: '0.8rem' }}>
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
    ...Object.entries(TABLE_DISPLAY_NAMES[currentLang]).map(([key, label]) => ({ value: key, label }))
  ], [currentLang]);

  return (
    <div style={{ padding: '24px 16px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* الترويسة الموحدة */}
        <PageHeader 
          title={currentLang === 'ar' ? 'سجل الأنشطة والتغييرات' : 'Live Activity Log'}
          sub={currentLang === 'ar' ? 'متابعة فورية لكافة الإضافات والتعديلات والعمليات داخل النظام' : 'Real-time tracking of all updates and changes across the system'}
          action={
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="secondary" onClick={exportToCSV} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <Download size={15} />
                <span>{currentLang === 'ar' ? 'تصدير CSV' : 'Export Report'}</span>
              </Btn>

              <Btn variant="secondary" onClick={fetchAuditLogs} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                <span>{currentLang === 'ar' ? 'تحديث' : 'Refresh'}</span>
              </Btn>
            </div>
          }
        />

        {/* أدوات البحث والفلترة */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <Input 
                placeholder={currentLang === 'ar' ? 'ابحث باسم المشرف، أو الجدول، أو العملية...' : 'Search table, user, or operation...'}
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

            {/* فلتر التاريخ الهجين */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: C.input, padding: '10px 14px', borderRadius: 12, border: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.primary, fontSize: '0.8rem', fontWeight: 700 }}>
                <Calendar size={15} />
                <span>{currentLang === 'ar' ? 'النطاق الزمني:' : 'Date Range:'}</span>
              </div>
              
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                style={{ 
                  background: C.surface, 
                  border: `1px solid ${C.border}`, 
                  color: C.text, 
                  padding: '6px 12px', 
                  borderRadius: 8, 
                  fontSize: '0.8rem', 
                  outline: 'none',
                  colorScheme: 'dark' // لضمان ظهور أيقونة التاريخ المدمجة باللون الأبيض في Theme الداكن
                }} 
              />
              
              <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>{currentLang === 'ar' ? 'إلى' : 'to'}</span>
              
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                style={{ 
                  background: C.surface, 
                  border: `1px solid ${C.border}`, 
                  color: C.text, 
                  padding: '6px 12px', 
                  borderRadius: 8, 
                  fontSize: '0.8rem', 
                  outline: 'none',
                  colorScheme: 'dark'
                }} 
              />

              {(startDate || endDate) && (
                <Btn variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ color: C.danger, padding: '4px 8px', fontSize: '0.75rem' }}>
                  <FilterX size={14} />
                  <span>{currentLang === 'ar' ? 'إلغاء الفلترة' : 'Clear'}</span>
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
              <span>{currentLang === 'ar' ? 'جاري تحميل سجل التغييرات...' : 'Loading audit logs...'}</span>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: C.textSub }}>
              {currentLang === 'ar' ? 'لا توجد أنشطة مسجلة في قاعدة البيانات بعد' : 'No activities recorded in database yet'}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: C.textSub }}>
              {currentLang === 'ar' ? 'لا توجد نتائج تطابق خيارات البحث' : 'No results matching search filters'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredLogs.map((log) => {
                const badge = getOperationBadge(log.operation);
                const IconComponent = badge.icon;
                const isExpanded = expandedLogId === log.id;
                const userName = getUserDisplayName(log);
                const timeFormatted = new Date(log.created_at).toLocaleTimeString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                const dateFormatted = new Date(log.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={log.id} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'all 0.2s ease' }}>
                    <div 
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComponent size={20} style={{ color: badge.color }} />
                        </div>

                        <div>
                          <div style={{ color: C.text, fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span>{badge.label}</span>
                            <Badge color={C.primary}>
                              {TABLE_DISPLAY_NAMES[currentLang][log.table_name] || log.table_name}
                            </Badge>
                          </div>
                          
                          <div style={{ color: C.textSub, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <UserCheck size={13} style={{ color: C.primary }} />
                            <span>{currentLang === 'ar' ? 'بواسطة:' : 'By:'} <strong style={{ color: C.text }}>{userName}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                          <div style={{ color: C.primary, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ color: C.textSub, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Layers size={14} style={{ color: C.primary }} />
                            {currentLang === 'ar' ? 'تفاصيل العملية والتغيرات:' : 'Payload Details & Changes:'}
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
                            <span>{showRawJson[log.id] ? (currentLang === 'ar' ? 'عرض كارت مبسط' : 'View Friendly') : (currentLang === 'ar' ? 'عرض كود JSON' : 'View Raw JSON')}</span>
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
