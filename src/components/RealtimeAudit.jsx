import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Download, 
  Code2, 
  User, 
  Clock, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Loader2,
  Layers,
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Eraser,
  Sparkles,
  Code,
  X,
  Copy,
  Check,
  Filter,
  Calendar
} from 'lucide-react';
import CustomDatePicker from './UI/CustomDatePicker';
import { supabase } from '@/lib/supabase';

// 1. ترجمة أسماء الجداول
const TABLE_TRANSLATIONS = {
  students: "بيانات الطلاب",
  attendance: "سجل الحضور والغياب",
  subscriptions: "الاشتراكات والمدفوعات",
  halaqat: "الحلقات القرآنية",
  teachers: "بيانات المعلمين",
  profiles: "الملفات الشخصية وحسابات المستخدمين",
  groups: "المجموعات والدورات"
};

// 2. ترجمة الحقول
const JSON_TRANSLATIONS = {
  student_id: "معرف الطالب",
  full_name: "الاسم الكامل",
  name: "الاسم",
  status: "الحالة",
  notes: "ملاحظات",
  amount: "المبلغ",
  phone: "رقم الهاتف",
  parent_phone: "رقم ولي الأمر",
  parent_name: "اسم ولي الأمر",
  gender: "الجنس",
  points: "النقاط",
  country: "الدولة",
  current_juz: "الجزء الحالي",
  created_at: "تاريخ الإنشاء",
  updated_at: "تاريخ التحديث"
};

// 3. حقول تقنية تُخفى دائماً في وضع المدير
const HIDDEN_FIELDS_IN_BASIC_VIEW = [
  'id', 'created_at', 'updated_at', 'student_id', 'group_id', 
  'halaqa_id', 'academy_id', 'user_id', 'changed_by', 'parent_id',
  'added_by', 'avatar_url', 'level_score', 'current_surah_id', 
  'last_payment_date', 'next_payment_date', 'last_activity_date',
  'current_quarter_index', 'freeze_cards_remaining', 'badges'
];

const safeRenderValue = (val) => {
  if (val === null || val === undefined || val === '') return 'لا يوجد';
  if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
  if (typeof val === 'object') {
    if (Array.isArray(val) && val.length === 0) return 'لا يوجد';
    if (val.ar) return String(val.ar);
    if (val.en) return String(val.en);
    return JSON.stringify(val);
  }
  return String(val);
};

export default function RealtimeAudit({ isArabic = true }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showRawJsonMap, setShowRawJsonMap] = useState({});

  // وضع العرض: false = وضع المدير (مبسط) | true = وضع المطور
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [onlyChanged, setOnlyChanged] = useState(true);

  // Toast System
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Purge Modal
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeDays, setPurgeDays] = useState(30);
  const [purging, setPurging] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        .limit(200);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err.message);
      showToast('حدث خطأ أثناء جلب السجلات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    const channel = supabase
      .channel('realtime_audit_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        async (payload) => {
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
          showToast('تم استقبال سجل جديد', 'info');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOperation, selectedUser, dateRange]);

  const toggleRawJson = (id) => {
    setShowRawJsonMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportCSV = () => {
    if (!filteredLogs.length) {
      showToast('لا توجد بيانات للتصدير', 'error');
      return;
    }

    const headers = ['المعرف', 'الجدول', 'العملية', 'المشرف', 'التاريخ'];
    const rows = filteredLogs.map(log => [
      log.id,
      TABLE_TRANSLATIONS[log.table_name] || log.table_name,
      log.operation,
      log.profiles?.full_name || 'النظام',
      new Date(log.created_at).toLocaleString('ar-EG')
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير ملف CSV بنجاح', 'success');
  };

  const uniqueUsers = useMemo(() => {
    const userMap = new Map();
    logs.forEach((log) => {
      if (log.changed_by) {
        const name = log.profiles?.full_name ? safeRenderValue(log.profiles.full_name) : `مستخدم (#${log.changed_by.substring(0, 6)})`;
        userMap.set(log.changed_by, name);
      }
    });
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
  }, [logs]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.created_at && l.created_at.startsWith(today));

    return {
      todayTotal: todayLogs.length,
      inserts: todayLogs.filter(l => l.operation === 'INSERT').length,
      updates: todayLogs.filter(l => l.operation === 'UPDATE').length,
      deletes: todayLogs.filter(l => l.operation === 'DELETE').length
    };
  }, [logs]);

  const handlePurgeLogs = async () => {
    setPurging(true);
    try {
      const { data, error } = await supabase.rpc('delete_old_audit_logs', {
        days_older: parseInt(purgeDays)
      });

      if (error) throw error;
      showToast(`تم تنظيف ${data || 0} سجل بنجاح.`, 'success');
      setIsPurgeModalOpen(false);
      fetchAuditLogs();
    } catch (err) {
      showToast('حدث خطأ أثناء تنظيف السجلات: ' + err.message, 'error');
    } finally {
      setPurging(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const tableName = safeRenderValue(log.table_name);
      const userName = safeRenderValue(log.profiles?.full_name);
      const recordTitle = TABLE_TRANSLATIONS[tableName] ? safeRenderValue(TABLE_TRANSLATIONS[tableName]) : tableName;

      const matchesSearch =
        recordTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOp = selectedOperation === 'ALL' || log.operation === selectedOperation;
      const matchesUser = selectedUser === 'ALL' || log.changed_by === selectedUser;

      // تصفية التاريخ باستخدام CustomDatePicker
      let matchesDate = true;
      if (startDate && endDate && log.created_at) {
        const logDate = new Date(log.created_at);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = logDate >= start && logDate <= end;
      }

      return matchesSearch && matchesOp && matchesUser && matchesDate;
    });
  }, [logs, searchTerm, selectedOperation, selectedUser, startDate, endDate]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-5 space-y-4 dir-rtl font-sans text-slate-100">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl bg-slate-900 border border-slate-700 text-xs">
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold">سجل العمليات المباشر</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">متابعة التغييرات في الأكاديمية لحظة بلحظة</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Realtime
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleExportCSV} 
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-500/20 transition-all"
            >
              <Download size={13} />
              <span className="hidden sm:inline">تصدير (CSV)</span>
            </button>
            <button onClick={fetchAuditLogs} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setIsPurgeModalOpen(true)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              <Eraser size={14} />
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center justify-between gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsAdvancedMode(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              !isAdvancedMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles size={13} />
            <span>وضع المدير</span>
          </button>
          <button
            onClick={() => setIsAdvancedMode(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isAdvancedMode ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Code size={13} />
            <span>وضع المطور</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div 
          onClick={() => setSelectedOperation('ALL')}
          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
            selectedOperation === 'ALL' ? 'bg-slate-800 border-emerald-500/50' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className="text-[10px] text-slate-400 block">عمليات اليوم</span>
          <span className="text-base font-bold text-slate-100">{stats.todayTotal}</span>
        </div>
        <div 
          onClick={() => setSelectedOperation('UPDATE')}
          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
            selectedOperation === 'UPDATE' || selectedOperation === 'INSERT' ? 'bg-slate-800 border-sky-500/50' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className="text-[10px] text-slate-400 block">إضافات وتعديلات اليوم</span>
          <span className="text-base font-bold text-sky-400">{stats.inserts + stats.updates}</span>
        </div>
        <div 
          onClick={() => setSelectedOperation('DELETE')}
          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
            selectedOperation === 'DELETE' ? 'bg-slate-800 border-rose-500/50' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className="text-[10px] text-slate-400 block">حالات الحذف اليوم</span>
          <span className="text-base font-bold text-rose-400">{stats.deletes}</span>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم القسم أو المشرف..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pr-8 pl-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>

          {/* User Select */}
          <div className="relative flex items-center">
            <Users size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pr-8 pl-7 text-xs text-slate-200 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">جميع المشرفين ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* 🗓️ التقويم المخصص CustomDatePicker */}
        <div className="w-full">
          <CustomDatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholderText="اختر نطاق التاريخ..."
            isArabic={isArabic}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
          />
        </div>

        {/* Operation Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {['ALL', 'INSERT', 'UPDATE', 'DELETE'].map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperation(op)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedOperation === op 
                  ? 'bg-emerald-500 text-slate-950 font-bold' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {op === 'ALL' ? 'الكل' : op === 'INSERT' ? 'إضافة' : op === 'UPDATE' ? 'تعديل' : 'حذف'}
            </button>
          ))}

          {!isAdvancedMode && (
            <button
              onClick={() => setOnlyChanged(!onlyChanged)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap mr-auto transition-all flex items-center gap-1 ${
                onlyChanged ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              <Filter size={11} />
              <span>إخفاء الحقول غير المعدلة</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Loader2 size={20} className="animate-spin text-emerald-400" />
            <span>جاري التحميل...</span>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
            لا توجد سجلات تطابق البحث
          </div>
        ) : (
          paginatedLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const userName = log.profiles?.full_name ? safeRenderValue(log.profiles.full_name) : "النظام/آلي";
            const tableName = safeRenderValue(log.table_name);
            const translatedTable = TABLE_TRANSLATIONS[tableName] || tableName;
            const showRaw = showRawJsonMap[log.id];

            return (
              <div key={log.id} className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <OperationBadge operation={log.operation} />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {log.operation === 'INSERT' ? 'إضافة في ' : log.operation === 'UPDATE' ? 'تعديل في ' : 'حذف من '}
                        <span className="text-emerald-400">{translatedTable}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-emerald-300 truncate">{userName}</span>
                        <span>•</span>
                        <span>{new Date(log.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Details Container */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2.5">
                    
                    {/* Mode Toggle inside Record for Developer Raw View */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-[10px] text-slate-400 font-mono">ID: #{log.id}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleRawJson(log.id); }}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      >
                        <Code2 size={11} />
                        <span>{showRaw ? "عرض التنسيق المنسق" : "عرض JSON الخام"}</span>
                      </button>
                    </div>

                    {showRaw ? (
                      <div className="relative bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] overflow-x-auto text-emerald-400 dir-ltr">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                            showToast('تم نسخ كود JSON بنجاح', 'success');
                          }}
                          className="absolute top-2 right-2 p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                          title="نسخ"
                        >
                          <Copy size={12} />
                        </button>
                        <pre>{JSON.stringify(log, null, 2)}</pre>
                      </div>
                    ) : (
                      <CompactDiffViewer 
                        log={log} 
                        isAdvancedMode={isAdvancedMode} 
                        onlyChanged={onlyChanged}
                        showToast={showToast} 
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredLogs.length > 0 && (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>صفحة {currentPage} من {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Purge Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-rose-400">تنظيف السجلات القديمة</h3>
            <p className="text-xs text-slate-400">اختر القِدم المسموح به للسجلات:</p>
            <select
              value={purgeDays}
              onChange={(e) => setPurgeDays(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value={15}>أقدم من 15 يوم</option>
              <option value={30}>أقدم من 30 يوم</option>
              <option value={60}>أقدم من 60 يوم</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsPurgeModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">إلغاء</button>
              <button onClick={handlePurgeLogs} disabled={purging} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold">تأكيد التنظيف</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Compact Table Component
function CompactDiffViewer({ log, isAdvancedMode, onlyChanged, showToast }) {
  const isUpdate = log.operation === 'UPDATE' && log.old_data && log.new_data;

  if (isUpdate) {
    const allKeys = Array.from(new Set([...Object.keys(log.old_data || {}), ...Object.keys(log.new_data || {})]));
    
    const filteredKeys = allKeys.filter((key) => {
      if (!isAdvancedMode && HIDDEN_FIELDS_IN_BASIC_VIEW.includes(key)) return false;

      const oldVal = safeRenderValue(log.old_data?.[key]);
      const newVal = safeRenderValue(log.new_data?.[key]);
      const isChanged = oldVal !== newVal;

      if (onlyChanged && !isChanged) return false;
      return true;
    });

    if (filteredKeys.length === 0) {
      return (
        <div className="text-[11px] text-slate-400 text-center py-2">
          لا توجد تغييرات ظاهرة في هذا السجل (تغييرات تقنية/مخفية)
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <div className="text-[10px] text-slate-400 font-bold mb-1">التغييرات التي تمت:</div>
        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden">
          {filteredKeys.map((key) => {
            const oldVal = safeRenderValue(log.old_data?.[key]);
            const newVal = safeRenderValue(log.new_data?.[key]);
            const label = JSON_TRANSLATIONS[key] || key;

            return (
              <div key={key} className="p-2 text-xs flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-slate-400 font-medium text-[11px]">{label}:</span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="line-through text-rose-400 bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-900/30">
                    {oldVal}
                  </span>
                  <span className="text-slate-500">←</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/30">
                    {newVal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const displayData = log.new_data || log.old_data || {};
  const entries = Object.entries(displayData).filter(([key, val]) => {
    if (!isAdvancedMode) {
      if (HIDDEN_FIELDS_IN_BASIC_VIEW.includes(key)) return false;
      const strVal = safeRenderValue(val);
      if (strVal === 'لا يوجد' || strVal === 'false' || strVal === '0') return false;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">{JSON_TRANSLATIONS[key] || key}</span>
          <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[180px]">
            {safeRenderValue(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

function OperationBadge({ operation }) {
  switch (operation) {
    case 'INSERT':
      return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">إضافة</span>;
    case 'UPDATE':
      return <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-bold border border-sky-500/20">تعديل</span>;
    case 'DELETE':
      return <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">حذف</span>;
    default:
      return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">عملية</span>;
  }
}
