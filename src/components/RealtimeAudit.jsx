import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Users,
  Eraser,
  Sparkles,
  Code,
  Copy,
  Filter,
  CheckCircle2
} from 'lucide-react';
import CustomDatePicker from './UI/CustomDatePicker';
import { supabase } from '@/lib/supabase';

const I18N_DICTIONARY = {
  ar: {
    title: "سجل العمليات المباشر",
    subtitle: "متابعة التغييرات في الأكاديمية لحظة بلحظة",
    realtime: "مباشر",
    managerMode: "وضع المدير (مبسط)",
    developerMode: "وضع المطور (متقدم)",
    todayTotal: "إجمالي عمليات اليوم",
    todayModifications: "إضافات وتعديلات اليوم",
    todayDeletes: "حالات الحذف اليوم",
    searchPlaceholder: "بحث باسم القسم، الطالب، أو المشرف...",
    allUsers: "جميع المشرفين",
    allOps: "الكل",
    insertOp: "إضافة",
    updateOp: "تعديل",
    deleteOp: "حذف",
    hideUnchanged: "إخفاء الحقول غير المعدلة",
    showUnchanged: "عرض جميع الحقول",
    noLogs: "لا توجد سجلات تطابق خيارات البحث الحالية",
    loading: "جاري تحميل البيانات...",
    page: "صفحة",
    of: "من",
    purgeOld: "تنظيف السجلات القديمة",
    purgeDesc: "اختر الفترة الزمنية للاحتفاظ بالسجلات:",
    days15: "أقدم من 15 يوم",
    days30: "أقدم من 30 يوم",
    days60: "أقدم من 60 يوم",
    cancel: "إلغاء",
    confirm: "تأكيد التنظيف",
    systemUser: "النظام الآلي",
    tables: {
      students: "بيانات الطلاب",
      attendance: "سجل الحضور والغياب",
      subscriptions: "الاشتراكات والمدفوعات",
      halaqat: "الحلقات القرآنية",
      teachers: "بيانات المعلمين",
      profiles: "حسابات المستخدمين",
      groups: "المجموعات والدورات"
    },
    fields: {
      full_name: "الاسم الكامل",
      name: "الاسم",
      status: "الحالة",
      notes: "الملاحظات",
      amount: "المبلغ",
      phone: "رقم الهاتف",
      parent_phone: "رقم ولي الأمر",
      parent_name: "اسم ولي الأمر",
      gender: "الجنس",
      points: "النقاط",
      country: "الدولة",
      current_juz: "الجزء الحالي",
      payment_status: "حالة الدفع"
    }
  },
  en: {
    title: "Realtime Audit Logs",
    subtitle: "Track academy system changes live",
    realtime: "Live",
    managerMode: "Manager Mode",
    developerMode: "Developer Mode",
    todayTotal: "Today's Operations",
    todayModifications: "Today's Edits & Additions",
    todayDeletes: "Today's Deletions",
    searchPlaceholder: "Search by module, entity, or user...",
    allUsers: "All Supervisors",
    allOps: "All",
    insertOp: "Created",
    updateOp: "Updated",
    deleteOp: "Deleted",
    hideUnchanged: "Hide Unchanged Fields",
    showUnchanged: "Show All Fields",
    noLogs: "No audit logs found matching criteria",
    loading: "Loading logs...",
    page: "Page",
    of: "of",
    purgeOld: "Purge Old Logs",
    purgeDesc: "Select retention period for logs:",
    days15: "Older than 15 days",
    days30: "Older than 30 days",
    days60: "Older than 60 days",
    cancel: "Cancel",
    confirm: "Confirm Purge",
    systemUser: "Automated System",
    tables: {
      students: "Student Records",
      attendance: "Attendance Logs",
      subscriptions: "Subscriptions & Payments",
      halaqat: "Quran Circles",
      teachers: "Teacher Records",
      profiles: "User Accounts",
      groups: "Groups & Courses"
    },
    fields: {
      full_name: "Full Name",
      name: "Name",
      status: "Status",
      notes: "Notes",
      amount: "Amount",
      phone: "Phone Number",
      parent_phone: "Parent Phone",
      parent_name: "Parent Name",
      gender: "Gender",
      points: "Points",
      country: "Country",
      current_juz: "Current Juz",
      payment_status: "Payment Status"
    }
  }
};

const TECHNICAL_KEYS = [
  'id', 'created_at', 'updated_at', 'student_id', 'group_id', 
  'halaqa_id', 'academy_id', 'user_id', 'changed_by', 'parent_id',
  'added_by', 'avatar_url', 'level_score', 'current_surah_id', 
  'last_payment_date', 'next_payment_date', 'last_activity_date',
  'current_quarter_index', 'freeze_cards_remaining', 'badges', 'record_id'
];

const toSafeString = (val) => {
  if (val === null || val === undefined || val === '' || val === '{}') return '';
  if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map(item => toSafeString(item)).filter(Boolean).join(', ');
    }
    if (val.ar) return toSafeString(val.ar);
    if (val.en) return toSafeString(val.en);
    
    try {
      return JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val);
};

export default function RealtimeAudit({ currentLang = 'ar' }) {
  const langKey = (currentLang === 'en') ? 'en' : 'ar';
  const t = I18N_DICTIONARY[langKey];
  const isRtl = langKey === 'ar';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showRawJsonMap, setShowRawJsonMap] = useState({});

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [onlyChanged, setOnlyChanged] = useState(true);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message: toSafeString(message), type });
    setTimeout(() => setToast(null), 3500);
  };

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
        .limit(250);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    const channel = supabase
      .channel('realtime_audit_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, async (payload) => {
        let userProfile = null;
        if (payload.new.changed_by) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.changed_by)
            .single();
          userProfile = data;
        }

        setLogs((prev) => [{ ...payload.new, profiles: userProfile }, ...prev]);
        showToast(toSafeString(t.realtime) + ': ' + toSafeString(t.title), 'info');
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

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

  const uniqueUsers = useMemo(() => {
    const userMap = new Map();
    logs.forEach((log) => {
      if (log.changed_by) {
        const rawName = log.profiles?.full_name || `#${log.changed_by.substring(0, 6)}`;
        userMap.set(log.changed_by, toSafeString(rawName));
      }
    });
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const tableName = log.table_name || '';
      const translatedTable = toSafeString(t.tables[tableName]) || tableName;
      const userName = toSafeString(log.profiles?.full_name) || toSafeString(t.systemUser);

      const matchesSearch =
        translatedTable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOp = selectedOperation === 'ALL' || log.operation === selectedOperation;
      const matchesUser = selectedUser === 'ALL' || log.changed_by === selectedUser;

      let matchesDate = true;
      if (startDate && endDate && log.created_at) {
        const logDate = new Date(log.created_at);
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        matchesDate = logDate >= start && logDate <= end;
      }

      return matchesSearch && matchesOp && matchesUser && matchesDate;
    });
  }, [logs, searchTerm, selectedOperation, selectedUser, startDate, endDate, langKey]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen p-3 sm:p-6 bg-[var(--bg-dark,#070B11)] text-[var(--text-main,#FFFFFF)] select-none relative space-y-4"
    >
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl bg-[var(--surface-card,rgba(15,23,42,0.95))] border border-[var(--primary)]/30 text-xs font-medium text-[var(--text-main,#FFFFFF)] backdrop-blur-md">
          <CheckCircle2 size={15} className="text-[var(--primary)]" />
          <span>{toSafeString(toast.message)}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[var(--border-card,rgba(255,255,255,0.08))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-[0_0_12px_rgba(224,122,0,0.15)]">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-[var(--text-main,#FFFFFF)]">{toSafeString(t.title)}</h1>
              <p className="text-[11px] text-[var(--text-sub,#94A3B8)] hidden sm:block">{toSafeString(t.subtitle)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchAuditLogs} 
              className="p-2 rounded-xl bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)] transition-all"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
              title={toSafeString(t.purgeOld)}
            >
              <Eraser size={15} />
            </button>
          </div>
        </div>

        {/* Unified Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-[var(--surface-card,rgba(15,23,42,0.85))] p-1 rounded-xl border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md">
          <button
            onClick={() => setIsAdvancedMode(false)}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              !isAdvancedMode 
                ? 'bg-[var(--primary)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_12px_rgba(224,122,0,0.3)]' 
                : 'text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
            }`}
          >
            <Sparkles size={14} />
            <span>{toSafeString(t.managerMode)}</span>
          </button>
          <button
            onClick={() => setIsAdvancedMode(true)}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              isAdvancedMode 
                ? 'bg-[var(--primary)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_12px_rgba(224,122,0,0.3)]' 
                : 'text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
            }`}
          >
            <Code size={14} />
            <span>{toSafeString(t.developerMode)}</span>
          </button>
        </div>
      </div>

      {/* Stats Section with Adaptive Borders */}
      <div className="grid grid-cols-3 gap-2">
        <div 
          onClick={() => setSelectedOperation('ALL')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedOperation === 'ALL' 
              ? 'bg-[var(--surface-card,rgba(15,23,42,0.95))] border-[var(--primary)] shadow-[0_0_12px_rgba(224,122,0,0.2)]' 
              : 'bg-[var(--surface-card,rgba(15,23,42,0.85))] border-[var(--border-card,rgba(255,255,255,0.08))]'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] block truncate">{toSafeString(t.todayTotal)}</span>
          <span className="text-base sm:text-xl font-black text-[var(--text-main,#FFFFFF)]">{stats.todayTotal}</span>
        </div>
        <div 
          onClick={() => setSelectedOperation('UPDATE')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedOperation === 'UPDATE' || selectedOperation === 'INSERT' 
              ? 'bg-[var(--surface-card,rgba(15,23,42,0.95))] border-[var(--primary)] shadow-[0_0_12px_rgba(224,122,0,0.2)]' 
              : 'bg-[var(--surface-card,rgba(15,23,42,0.85))] border-[var(--border-card,rgba(255,255,255,0.08))]'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] block truncate">{toSafeString(t.todayModifications)}</span>
          <span className="text-base sm:text-xl font-black text-[var(--text-main,#FFFFFF)]">{stats.inserts + stats.updates}</span>
        </div>
        <div 
          onClick={() => setSelectedOperation('DELETE')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedOperation === 'DELETE' 
              ? 'bg-[var(--surface-card,rgba(15,23,42,0.95))] border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
              : 'bg-[var(--surface-card,rgba(15,23,42,0.85))] border-[var(--border-card,rgba(255,255,255,0.08))]'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] block truncate">{toSafeString(t.todayDeletes)}</span>
          <span className="text-base sm:text-xl font-black text-red-400">{stats.deletes}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative flex items-center">
            <Search size={14} className={`absolute ${isRtl ? 'right-3' : 'left-3'} text-[var(--text-sub,#94A3B8)] pointer-events-none`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={toSafeString(t.searchPlaceholder)}
              className={`w-full bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl py-2 text-xs text-[var(--text-main,#FFFFFF)] placeholder:text-[var(--text-sub,#94A3B8)] focus:outline-none focus:border-[var(--primary)] ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          <div className="relative flex items-center">
            <Users size={14} className={`absolute ${isRtl ? 'right-3' : 'left-3'} text-[var(--text-sub,#94A3B8)] pointer-events-none`} />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className={`w-full bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl py-2 text-xs text-[var(--text-main,#FFFFFF)] focus:outline-none appearance-none cursor-pointer ${
                isRtl ? 'pr-9 pl-7' : 'pl-9 pr-7'
              }`}
            >
              <option value="ALL">{toSafeString(t.allUsers)} ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u.id} value={u.id}>{toSafeString(u.name)}</option>
              ))}
            </select>
            <ChevronDown size={13} className={`absolute ${isRtl ? 'left-3' : 'right-3'} text-[var(--text-sub,#94A3B8)] pointer-events-none`} />
          </div>
        </div>

        <CustomDatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          placeholderText="اختر نطاق التاريخ..."
          isArabic={isRtl}
          className="w-full bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] text-xs text-[var(--text-main,#FFFFFF)] rounded-xl py-2 px-3 focus:outline-none"
        />

        {/* Operations Buttons */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <div className="flex items-center gap-1.5">
            {['ALL', 'INSERT', 'UPDATE', 'DELETE'].map((op) => (
              <button
                key={op}
                onClick={() => setSelectedOperation(op)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedOperation === op 
                    ? 'bg-[var(--primary)] text-[var(--text-main,#FFFFFF)] font-bold shadow-[0_0_10px_rgba(224,122,0,0.3)]' 
                    : 'bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] border border-[var(--border-input,#1B2738)] hover:text-[var(--text-main,#FFFFFF)]'
                }`}
              >
                {toSafeString(op === 'ALL' ? t.allOps : op === 'INSERT' ? t.insertOp : op === 'UPDATE' ? t.updateOp : t.deleteOp)}
              </button>
            ))}
          </div>

          {!isAdvancedMode && (
            <button
              onClick={() => setOnlyChanged(!onlyChanged)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                onlyChanged 
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30' 
                  : 'bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] border border-[var(--border-input,#1B2738)]'
              }`}
            >
              <Filter size={12} />
              <span>{toSafeString(onlyChanged ? t.hideUnchanged : t.showUnchanged)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feed Area */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-sub,#94A3B8)] flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
            <span>{toSafeString(t.loading)}</span>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-sub,#94A3B8)] bg-[var(--surface-card,rgba(15,23,42,0.85))] rounded-xl border border-dashed border-[var(--border-card,rgba(255,255,255,0.08))]">
            {toSafeString(t.noLogs)}
          </div>
        ) : (
          paginatedLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const userName = toSafeString(log.profiles?.full_name) || toSafeString(t.systemUser);
            const tableName = log.table_name || '';
            const translatedTable = toSafeString(t.tables[tableName]) || tableName;
            const showRaw = showRawJsonMap[log.id];

            const entityTitle = toSafeString(log.new_data?.full_name || log.new_data?.name || log.old_data?.full_name || log.old_data?.name);

            return (
              <div key={log.id} className="rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] overflow-hidden shadow-sm backdrop-blur-md">
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--surface-input,#0A101D)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <OperationBadge operation={log.operation} t={t} />
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-bold text-[var(--text-main,#FFFFFF)] truncate">
                        {toSafeString(log.operation === 'INSERT' ? `${t.insertOp} في ` : log.operation === 'UPDATE' ? `${t.updateOp} في ` : `${t.deleteOp} من `)}
                        <span className="text-[var(--primary)] font-semibold">{translatedTable}</span>
                        {entityTitle && <span className="text-[var(--text-sub,#94A3B8)] font-normal ml-1">({entityTitle})</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] mt-1">
                        <span className="text-[var(--text-main,#FFFFFF)] font-medium">{userName}</span>
                        <span>•</span>
                        <span className="font-mono">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp size={18} className="text-[var(--text-sub,#94A3B8)]" /> : <ChevronDown size={18} className="text-[var(--text-sub,#94A3B8)]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3.5 border-t border-[var(--border-card,rgba(255,255,255,0.08))] bg-[var(--surface-input,#0A101D)] space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border-card,rgba(255,255,255,0.08))] pb-2">
                      <span className="text-[10px] text-[var(--text-sub,#94A3B8)] font-mono">ID: #{log.id}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRawJsonMap(prev => ({ ...prev, [log.id]: !prev[log.id] }));
                        }}
                        className="text-[10px] font-bold text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)] flex items-center gap-1 bg-[var(--surface-card,rgba(15,23,42,0.85))] px-2 py-1 rounded-lg border border-[var(--border-card,rgba(255,255,255,0.08))]"
                      >
                        <Code2 size={12} />
                        <span>{showRaw ? "عرض التنسيق المنسق" : "عرض JSON الخام"}</span>
                      </button>
                    </div>

                    {showRaw ? (
                      <div className="relative bg-[var(--bg-dark,#070B11)] p-3 rounded-xl border border-[var(--border-input,#1B2738)] font-mono text-[11px] overflow-x-auto text-[var(--primary)] dir-ltr">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                            showToast('تم نسخ كود JSON', 'success');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]"
                        >
                          <Copy size={13} />
                        </button>
                        <pre>{JSON.stringify(log, null, 2)}</pre>
                      </div>
                    ) : (
                      <CompactDiffViewer 
                        log={log} 
                        isAdvancedMode={isAdvancedMode} 
                        onlyChanged={onlyChanged}
                        t={t}
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
        <div className="p-3 rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md flex items-center justify-between text-xs text-[var(--text-sub,#94A3B8)]">
          <span>{toSafeString(t.page)} {currentPage} {toSafeString(t.of)} {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] disabled:opacity-30 hover:bg-[var(--border-input,#1B2738)]"
            >
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[var(--surface-input,#0A101D)] text-[var(--text-main,#FFFFFF)] disabled:opacity-30 hover:bg-[var(--border-input,#1B2738)]"
            >
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function CompactDiffViewer({ log, isAdvancedMode, onlyChanged, t }) {
  const isUpdate = log.operation === 'UPDATE' && log.old_data && log.new_data;

  if (isUpdate) {
    const allKeys = Array.from(new Set([...Object.keys(log.old_data || {}), ...Object.keys(log.new_data || {})]));
    
    const filteredKeys = allKeys.filter((key) => {
      if (!isAdvancedMode && TECHNICAL_KEYS.includes(key)) return false;

      const oldVal = toSafeString(log.old_data?.[key]);
      const newVal = toSafeString(log.new_data?.[key]);
      const isChanged = oldVal !== newVal;

      if (onlyChanged && !isChanged) return false;
      return true;
    });

    if (filteredKeys.length === 0) {
      return (
        <div className="text-[11px] text-[var(--text-sub,#94A3B8)] text-center py-2">
          جميع الحقول المعدلة ذات طابع تقني داخلي
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <div className="divide-y divide-[var(--border-card,rgba(255,255,255,0.08))] border border-[var(--border-card,rgba(255,255,255,0.08))] rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] overflow-hidden">
          {filteredKeys.map((key) => {
            const oldVal = toSafeString(log.old_data?.[key]) || '—';
            const newVal = toSafeString(log.new_data?.[key]) || '—';
            const label = toSafeString(t?.fields?.[key]) || key;

            return (
              <div key={key} className="p-2.5 text-xs flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[var(--text-sub,#94A3B8)] font-medium text-[11px]">
                  {label}:
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono dir-ltr">
                  <span className="line-through text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30">
                    {oldVal}
                  </span>
                  <span className="text-[var(--text-sub,#94A3B8)]">→</span>
                  <span className="text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20">
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
      if (TECHNICAL_KEYS.includes(key)) return false;
      const strVal = toSafeString(val);
      if (!strVal || strVal === 'false' || strVal === '0') return false;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {entries.map(([key, val]) => {
        const label = toSafeString(t?.fields?.[key]) || key;
        const formattedVal = toSafeString(val) || '—';

        return (
          <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] text-xs">
            <span className="text-[var(--text-sub,#94A3B8)] text-[11px] font-medium">
              {label}
            </span>
            <span className="font-semibold text-[var(--text-main,#FFFFFF)] text-[11px] truncate max-w-[180px]">
              {formattedVal}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OperationBadge({ operation, t }) {
  const opStr = operation === 'INSERT' ? toSafeString(t.insertOp) : operation === 'UPDATE' ? toSafeString(t.updateOp) : operation === 'DELETE' ? toSafeString(t.deleteOp) : 'Operation';

  switch (operation) {
    case 'INSERT':
      return <span className="px-2 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/20">{opStr}</span>;
    case 'UPDATE':
      return <span className="px-2 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/20">{opStr}</span>;
    case 'DELETE':
      return <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">{opStr}</span>;
    default:
      return <span className="px-2 py-1 rounded-lg bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] text-[10px]">{opStr}</span>;
  }
}
