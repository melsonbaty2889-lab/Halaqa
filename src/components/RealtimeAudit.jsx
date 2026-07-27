/* src/components/RealtimeAudit.jsx - متوافق 100% مع جدول audit_logs في Supabase */
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
  FaUserCheck 
} from 'react-icons/fa';

export default function RealtimeAudit({ session, userRole }) {
  const { i18n } = useTranslation();
  const isArabic = !i18n.language || i18n.language.startsWith('ar');
  const isRtl = i18n.dir() === 'rtl' || isArabic;

  // 🏷️ أسماء الجداول مترجمة للغتين
  const tableLabels = {
    attendance: isArabic ? 'الحضور والتسميع' : 'Attendance',
    payments: isArabic ? 'الاشتراكات والمالية' : 'Payments',
    halaqas: isArabic ? 'الحلقات والمقارئ' : 'Halaqas',
    students: isArabic ? 'شؤون الطلاب' : 'Students',
    daily_progress: isArabic ? 'الإنجاز اليومي' : 'Daily Progress'
  };

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // جلب السجلات المتوافقة مع أعمدة audit_logs الحقيقية
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

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

    // اشتراك لحظي في جدول audit_logs
    const channel = supabase
      .channel('realtime-audit-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev.slice(0, 49)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAuditLogs]);

  // ترجمة أنواع العمليات (INSERT / UPDATE / DELETE)
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

  // تصفية السجلات للبحث (يشمل البحث بالاسم البرمجي أو المترجم)
  const filteredLogs = logs.filter((log) => {
    const tableLabel = tableLabels[log.table_name] || log.table_name || '';
    const text = `${log.table_name || ''} ${tableLabel} ${log.operation || ''} ${log.changed_by || ''}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ paddingBottom: '80px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1️⃣ الترويسة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHistory style={{ color: '#38BDF8' }} />
            <span>{isArabic ? 'سجل التدقيق والتتبع الفوري' : 'Realtime Audit Trail'}</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>
            {isArabic ? 'متابعة لحظية للتغيرات في قواعد البيانات (audit_logs)' : 'Live database mutation tracking'}
          </p>
        </div>

        <button 
          onClick={fetchAuditLogs}
          style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSyncAlt size={12} className={loading ? 'spinning' : ''} />
          <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {/* 2️⃣ عناصر الفلترة والبحث */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '0.85rem' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث عن اسم الجدول أو العملية...' : 'Search table or operation...'}
            style={{ width: '100%', padding: '10px 12px', paddingRight: isRtl ? '36px' : '12px', paddingLeft: isRtl ? '12px' : '36px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#FFF', fontSize: '0.82rem', outline: 'none' }}
          />
        </div>

        {/* فلترة حسب الجدول بالأسماء المترجمة */}
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          style={{ background: '#1E293B', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
          <option value="all">{isArabic ? 'جميع الجداول' : 'All Tables'}</option>
          {Object.entries(tableLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* 3️⃣ عرض السجلات */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
          {isArabic ? 'جاري تحميل سجل التغييرات...' : 'Loading audit logs...'}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '30px', borderRadius: '16px', textAlign: 'center', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.05)' }}>
          {isArabic ? 'لا توجد سجلات مطابقة حالياً' : 'No audit logs found'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredLogs.map((log) => {
            const badge = getOperationBadge(log.operation);
            const Icon = badge.icon;
            const timeFormatted = new Date(log.created_at).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateFormatted = new Date(log.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });

            return (
              <div 
                key={log.id} 
                style={{ background: '#1E293B', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ color: badge.color, fontSize: '1.1rem' }} />
                  </div>

                  <div>
                    <div style={{ color: '#F8FAFC', fontWeight: '700', fontSize: '0.85rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{badge.label}</span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '6px', color: '#38BDF8' }}>
                        {tableLabels[log.table_name] || log.table_name}
                      </span>
                    </div>
                    
                    <div style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaUserCheck size={11} style={{ color: '#64748B' }} />
                      <span>{isArabic ? 'بواسطة المعرّف:' : 'By ID:'} {log.changed_by ? log.changed_by.substring(0, 8) + '...' : (isArabic ? 'النظام' : 'System')}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                  <div style={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaClock size={10} />
                    <span>{timeFormatted}</span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '0.7rem', marginTop: '2px' }}>
                    {dateFormatted}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
                     }
