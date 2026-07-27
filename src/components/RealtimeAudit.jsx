/* src/components/RealtimeAudit.jsx - النسخة المتقدمة المحسنة */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  FaHistory, 
  FaSearch, 
  FaSyncAlt, 
  FaClock, 
  FaDatabase, 
  FaPlusCircle, 
  FaEdit, 
  FaTrashAlt, 
  FaUserCheck,
  FaTimes,
  FaFileDownload,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

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

  const searchKeywordsMap = {
    attendance: 'attendance الحضور والتسميع حضور تسميع',
    payments: 'payments الاشتراكات والمالية دفع مالية اشتراكات',
    halaqas: 'halaqas الحلقات والمقارئ حلقة مقارئ',
    students: 'students شؤون الطلاب الطلاب طالب طالبة',
    daily_progress: 'daily_progress الإنجاز اليومي انجاز إنجاز'
  };

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  // 1️⃣ جلب البيانات مع ربط جدول profiles لجلب الاسم الحقيقي
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          performer:profiles!changed_by (
            full_name,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedTable !== 'all') {
        query = query.eq('table_name', selectedTable);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    fetchAuditLogs();

    // الاستماع للبث المباشر (Realtime)
    const channel = supabase
      .channel('realtime-audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
        // إعادة التنشيط الخفيف عند ورود سجل جديد لجلب تفاصيل المستخدم المربوطة
        fetchAuditLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAuditLogs]);

  // 2️⃣ دالة استخراج اسم المستخدم الظاهر
  const getUserDisplayName = (log) => {
    if (log.performer?.full_name) return log.performer.full_name;
    if (log.performer?.name) return log.performer.name;
    if (log.performer?.email) return log.performer.email;
    if (log.changed_by) return `${isArabic ? 'المستخدم' : 'User'}: ${log.changed_by.substring(0, 8)}...`;
    return isArabic ? 'النظام التلقائي' : 'System Automated';
  };

  // 3️⃣ تصدير السجلات لملف CSV يدعم الحروف العربية بامتياز (UTF-8 BOM)
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

    // إضافة \uFEFF لضمان فتح الملف في Excel بالحروف العربية الصحيحة
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
        return { icon: FaPlusCircle, color: '#34D399', bg: 'rgba(52, 211, 153, 0.15)', label: isArabic ? 'إضافة' : 'Insert' };
      case 'UPDATE':
        return { icon: FaEdit, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', label: isArabic ? 'تعديل' : 'Update' };
      case 'DELETE':
        return { icon: FaTrashAlt, color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)', label: isArabic ? 'حذف' : 'Delete' };
      default:
        return { icon: FaDatabase, color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)', label: operation || 'Op' };
    }
  };

  // 4️⃣ الفلترة الذكية بالاسم والعملية والجدول
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const rawTable = (log.table_name || '').toLowerCase();
    const tableKeywords = (searchKeywordsMap[log.table_name] || rawTable).toLowerCase();
    const operation = (log.operation || '').toLowerCase();
    const opArabic = operation === 'insert' ? 'إضافة' : operation === 'update' ? 'تعديل' : operation === 'delete' ? 'حذف' : '';
    const userName = getUserDisplayName(log).toLowerCase();

    return `${rawTable} ${tableKeywords} ${operation} ${opArabic} ${userName}`.includes(query);
  });

  return (
    <div style={{ paddingBottom: '80px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1️⃣ الترويسة الرئيسية + زر التصدير والإنعاش */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHistory style={{ color: '#38BDF8' }} />
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
            <FaFileDownload size={12} />
            <span>{isArabic ? 'تصدير Tsv/CSV' : 'Export Report'}</span>
          </button>

          <button 
            onClick={fetchAuditLogs}
            style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaSyncAlt size={12} className={loading ? 'spinning' : ''} />
            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2️⃣ حقل البحث والفلترة */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '0.85rem' }} />
          
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث باسم الطالب، المشرف، أو العملية...' : 'Search table, user, or operation...'}
            style={{ 
              width: '100%', 
              padding: '10px 32px', 
              paddingRight: isRtl ? '36px' : '32px', 
              paddingLeft: isRtl ? '32px' : '36px', 
              background: '#1E293B', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px', 
              color: '#FFF', 
              fontSize: '0.82rem', 
              outline: 'none' 
            }}
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
              <FaTimes size={12} />
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

      {/* 3️⃣ قائمة السجلات التفاعلية */}
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
          {isArabic ? `لا توجد نتائج تطابق "${searchQuery}"` : `No results matching "${searchQuery}"`}
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
              <div 
                key={log.id} 
                style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                
                {/* الجزء الظاهر للبطاقة */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ color: badge.color, fontSize: '1.1rem' }} />
                    </div>

                    <div>
                      <div style={{ color: '#F8FAFC', fontWeight: '700', fontSize: '0.85rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{badge.label}</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '6px', color: '#38BDF8' }}>
                          {tableDisplayNames[log.table_name] || log.table_name}
                        </span>
                      </div>
                      
                      <div style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaUserCheck size={11} style={{ color: '#38BDF8' }} />
                        <span>{isArabic ? 'بواسطة:' : 'By:'} <strong style={{ color: '#CBD5E1' }}>{userName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                      <div style={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={10} />
                        <span>{timeFormatted}</span>
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem', marginTop: '2px' }}>
                        {dateFormatted}
                      </div>
                    </div>

                    {isExpanded ? <FaChevronUp size={12} color="#94A3B8" /> : <FaChevronDown size={12} color="#94A3B8" />}
                  </div>
                </div>

                {/* التفاصيل عند النقر (Diff Viewer) */}
                {isExpanded && (
                  <div style={{ padding: '12px 14px', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>
                    <div style={{ color: '#94A3B8', marginBottom: '6px', fontWeight: '600' }}>
                      {isArabic ? 'بيانات العملية المسجلة:' : 'Payload Details:'}
                    </div>
                    <pre style={{ background: '#0F172A', padding: '10px', borderRadius: '8px', color: '#34D399', overflowX: 'auto', margin: 0, fontSize: '0.7rem', fontFamily: 'monospace' }}>
                      {JSON.stringify(log.new_data || log.old_data || log.record_data || { id: log.id, action: log.operation }, null, 2)}
                    </pre>
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
