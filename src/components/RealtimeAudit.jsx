import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Code2, 
  User, 
  Clock, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import CustomDatePicker from './UI/CustomDatePicker';
import { supabase } from '@/lib/supabase';

// ترجمة الجداول وأسماء الحقول لمدير الأكاديمية
const TABLE_TRANSLATIONS = {
  students: "الطالب",
  attendance: "تسجيل الحضور",
  subscriptions: "الاشتراكات المالية",
  halaqat: "الحلقات القرآنية",
  teachers: "المعلمين",
  profiles: "الملفات الشخصية"
};

const JSON_TRANSLATIONS = {
  student_id: "معرف الطالب",
  full_name: "الاسم الكامل",
  name: "الاسم",
  status: "الحالة",
  notes: "ملاحظات",
  amount: "المبلغ",
  phone: "رقم الهاتف",
  group_id: "رقم المجموعة/الحلقة",
  created_at: "تاريخ الإنشاء",
  updated_at: "تاريخ التحديث"
};

export default function RealtimeAudit({ isArabic = true }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('ALL');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showRawJsonMap, setShowRawJsonMap] = useState({});

  // 1️⃣ جلب البيانات الحقيقية مع جلب بيانات المشرف من جدول profiles
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:changed_by (
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    // 2️⃣ البث المباشر Realtime عند إضافة أي سجل جديد
    const channel = supabase
      .channel('realtime_audit_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        async (payload) => {
          // جلب اسم المستخدم صاحب الإجراء للـ Log الجديد
          let userProfile = null;
          if (payload.new.changed_by) {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', payload.new.changed_by)
              .single();
            userProfile = data;
          }

          const newLogWithProfile = {
            ...payload.new,
            profiles: userProfile
          };

          setLogs((prevLogs) => [newLogWithProfile, ...prevLogs]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleRawJson = (logId) => {
    setShowRawJsonMap((prev) => ({ ...prev, [logId]: !prev[logId] }));
  };

  // تصفية السجلات حسب التحديد والبحث
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const tableName = log.table_name || '';
      const userName = log.profiles?.full_name || '';
      const recordTitle = TABLE_TRANSLATIONS[tableName] || tableName;

      const matchesSearch =
        recordTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOp = selectedOperation === 'ALL' || log.operation === selectedOperation;

      return matchesSearch && matchesOp;
    });
  }, [logs, searchTerm, selectedOperation]);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-4">
      
      {/* 🟢 ترويسة الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">
              {isArabic ? 'سجل العمليات والأنشطة المباشر' : 'Live Realtime Audit Log'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic ? 'متابعة كافة التعديلات والتغييرات في النظام لحظة بلحظة' : 'Monitor system changes in real-time'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchAuditLogs} 
            disabled={loading}
            className="btn-secondary text-xs !py-2 !px-3 flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
          </button>
          <button className="btn-primary text-xs !py-2 !px-3 flex items-center gap-1.5">
            <Download size={14} />
            <span>{isArabic ? 'تصدير التقرير' : 'Export Log'}</span>
          </button>
        </div>
      </div>

      {/* 🟢 شريط الفلترة والبحث */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        <div className="relative flex items-center">
          <Search size={16} className="absolute right-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isArabic ? "بحث في الجداول أو المشرفين..." : "Search logs or users..."}
            className="app-input !py-2 !pr-9 text-xs w-full"
          />
        </div>

        <div className="relative flex items-center">
          <Filter size={15} className="absolute right-3 text-slate-400 pointer-events-none" />
          <select
            value={selectedOperation}
            onChange={(e) => setSelectedOperation(e.target.value)}
            className="app-input !py-2 !pr-9 text-xs appearance-none cursor-pointer w-full"
          >
            <option value="ALL">{isArabic ? "جميع العمليات (INSERT / UPDATE / DELETE)" : "All Operations"}</option>
            <option value="INSERT">{isArabic ? "إضافة جديدة (INSERT)" : "INSERT"}</option>
            <option value="UPDATE">{isArabic ? "تعديل بيانات (UPDATE)" : "UPDATE"}</option>
            <option value="DELETE">{isArabic ? "حذف (DELETE)" : "DELETE"}</option>
          </select>
        </div>

        <CustomDatePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          isArabic={isArabic}
        />
      </div>

      {/* 🟢 عرض قائمة البطاقات من البيانات الحقيقية */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-emerald-400" />
            <span>{isArabic ? 'جاري جلب السجلات المباشرة من قواعد البيانات...' : 'Fetching live audit records...'}</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-500 text-xs">
            {isArabic ? 'لا توجد سجلات حقيقية مسجلة حالياً' : 'No real audit logs found'}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isRawJson = !!showRawJsonMap[log.id];
            const displayData = log.new_data || log.old_data || {};
            const userName = log.profiles?.full_name || (log.changed_by ? `مستخدم (#${log.changed_by.substring(0, 6)})` : "النظام/آلي");

            return (
              <div 
                key={log.id} 
                className="rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all overflow-hidden shadow-lg"
              >
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <OperationBadge operation={log.operation} />
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">
                        {TABLE_TRANSLATIONS[log.table_name] ? `تعديل في ${TABLE_TRANSLATIONS[log.table_name]}` : `عملية على ${log.table_name}`}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-slate-500" />
                          <span className="text-emerald-400 font-medium">{userName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag size={13} className="text-slate-500" />
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono text-[10px]">{log.table_name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-500" />
                          <span>{new Date(log.created_at).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80 justify-end">
                    <button
                      onClick={() => toggleRawJson(log.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1 transition-all ${
                        isRawJson 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code2 size={13} />
                      <span>JSON</span>
                    </button>

                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* تفاصيل السجل */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
                    {isRawJson ? (
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto dir-ltr">
                        {JSON.stringify({ old_data: log.old_data, new_data: log.new_data }, null, 2)}
                      </pre>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {Object.entries(displayData).map(([key, value]) => (
                          <div 
                            key={key} 
                            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/60 flex flex-col justify-between"
                          >
                            <span className="text-[11px] text-slate-400 font-medium">
                              {JSON_TRANSLATIONS[key] || key}
                            </span>
                            <span className="text-xs font-semibold text-slate-200 mt-1 truncate">
                              {value !== null && value !== undefined ? String(value) : 'لا يوجد'}
                            </span>
                          </div>
                        ))}
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

function OperationBadge({ operation }) {
  switch (operation) {
    case 'INSERT':
      return (
        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
          <PlusCircle size={13} />
          <span>إضافة</span>
        </span>
      );
    case 'UPDATE':
      return (
        <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-bold flex items-center gap-1">
          <Edit3 size={13} />
          <span>تعديل</span>
        </span>
      );
    case 'DELETE':
      return (
        <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold flex items-center gap-1">
          <Trash2 size={13} />
          <span>حذف</span>
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1">
          <CheckCircle2 size={13} />
          <span>{operation || 'عملية'}</span>
        </span>
      );
  }
}
