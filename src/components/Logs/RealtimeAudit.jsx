// src/components/Logs/RealtimeAudit.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import { supabase } from '@/lib/supabase';

// استيراد الإعدادات والمكونات المقسمة محلياً
import { toHumanValue } from './logs.config';
import OperationBadge from './OperationBadge';
import CompactDiffViewer from './CompactDiffViewer';

export default function RealtimeAudit() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.language === 'ar';

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
    setToast({ message: String(message), type });
    setTimeout(() => setToast(null), 3500);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const safeTranslate = (key, fallback = '') => {
    if (!t || typeof t !== 'function') return String(fallback || key || '');
    const res = t(key, { defaultValue: fallback || key });
    if (typeof res === 'object') {
      return res?.ar || res?.en || String(fallback || key || '');
    }
    return String(res || fallback || key || '');
  };

  const parseName = (rawName) => {
    if (!rawName) return null;
    if (typeof rawName === 'object') {
      return rawName.ar || rawName.en || Object.values(rawName)[0] || null;
    }
    if (typeof rawName === 'string') {
      const trimmed = rawName.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return parsed.ar || parsed.en || Object.values(parsed)[0] || null;
        } catch (e) {}
      }
      return trimmed !== '' ? trimmed : null;
    }
    return null;
  };

  const getProfileName = (log) => {
    if (!log) return safeTranslate('logs.systemUser', 'النظام الآلي');
    
    const profile = log.profiles;
    const academyName = parseName(log.academies?.name) || parseName(profile?.academies?.name);

    if (profile && typeof profile === 'object') {
      const name = parseName(profile.full_name) || parseName(profile.name);

      if (profile.role === 'admin') {
        if (academyName) return `مدير أكاديمية ${academyName}`;
        return 'مدير الأكاديمية';
      }

      if (name && !name.includes('أكاديمية الفرقان')) return name;

      switch (profile.role) {
        case 'super_admin': return 'سوبر أدمن';
        case 'teacher': return 'معلم';
        case 'student': return 'طالب';
        case 'parent': return 'ولي أمر';
        default: return name || 'مستخدم';
      }
    }

    if (log.changed_by && typeof log.changed_by === 'string') {
      return `مشرف (${log.changed_by.substring(0, 4)})`;
    }

    return safeTranslate('logs.systemUser', 'النظام الآلي');
  };

  const getTableName = (tableName) => {
    if (!tableName) return '';
    if (typeof tableName !== 'string') return String(tableName);
    const translated = safeTranslate(`tables.${tableName}`, tableName);
    return typeof translated === 'string' ? translated : String(tableName);
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          academies:academy_id ( id, name ),
          profiles:changed_by ( id, full_name, role )
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

    // تصحيح إنشاء القناة والبث المباشر المضمون مع Supabase v2
    const channel = supabase
      .channel('realtime_audit_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        async (payload) => {
          let userProfile = null;
          let academyData = null;

          try {
            if (payload.new?.academy_id) {
              const { data } = await supabase
                .from('academies')
                .select('id, name')
                .eq('id', payload.new.academy_id)
                .maybeSingle();
              academyData = data;
            }

            if (payload.new?.changed_by) {
              const { data } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', payload.new.changed_by)
                .maybeSingle();
              userProfile = data;
            }
          } catch (e) {
            console.error("Realtime fetch details failed:", e);
          }

          setLogs((prev) => [{ ...payload.new, profiles: userProfile, academies: academyData }, ...prev]);
          showToast(`${safeTranslate('logs.realtime', 'مباشر')}: ${safeTranslate('logs.title', 'سجل العمليات')}`, 'info');
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOperation, selectedUser, startDate, endDate]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.created_at && String(l.created_at).startsWith(today));
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
        const name = getProfileName(log);
        userMap.set(String(log.changed_by), String(name));
      }
    });
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const tableName = String(log.table_name || '');
      const translatedTable = safeTranslate(`tables.${tableName}`, tableName);
      const userName = String(getProfileName(log));

      const matchesSearch =
        translatedTable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOp = selectedOperation === 'ALL' || log.operation === selectedOperation;
      const matchesUser = selectedUser === 'ALL' || String(log.changed_by) === String(selectedUser);

      let matchesDate = true;
      if (startDate && endDate && log.created_at) {
        const logDate = new Date(log.created_at);
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
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

  const formatHumanActionSentence = (log) => {
    const userName = getProfileName(log);
    const tableName = getTableName(log.table_name);
    
    const getTitle = (obj) => {
      if (!obj || typeof obj !== 'object') return '';
      if (typeof obj.full_name === 'string') return obj.full_name;
      if (typeof obj.name === 'string') return obj.name;
      if (typeof obj.title === 'string') return obj.title;
      return '';
    };

    const entityTitle = getTitle(log.new_data) || getTitle(log.old_data);
    const entityText = entityTitle ? ` (${entityTitle})` : '';

    if (log.operation === 'INSERT') {
      return (
        <span>
          قام <strong className="text-[var(--text-main,#FFFFFF)] font-semibold">{userName}</strong> بإضافة سجل جديد في <strong className="text-[var(--primary)]">{tableName}</strong>{entityText}
        </span>
      );
    }
    if (log.operation === 'UPDATE') {
      return (
        <span>
          قام <strong className="text-[var(--text-main,#FFFFFF)] font-semibold">{userName}</strong> بتحديث <strong className="text-[var(--primary)]">{tableName}</strong>{entityText}
        </span>
      );
    }
    if (log.operation === 'DELETE') {
      return (
        <span>
          قام <strong className="text-[var(--text-main,#FFFFFF)] font-semibold">{userName}</strong> بحذف عنصر من <strong className="text-red-400">{tableName}</strong>{entityText}
        </span>
      );
    }
    return `${log.operation} - ${tableName}`;
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen p-2.5 sm:p-6 bg-transparent text-[var(--text-main,#FFFFFF)] select-none relative space-y-3 sm:space-y-4"
    >
      {toast && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl bg-[var(--surface-card,rgba(15,23,42,0.95))] border border-[var(--primary)]/30 text-xs font-medium text-[var(--text-main,#FFFFFF)] backdrop-blur-md">
          <CheckCircle2 size={15} className="text-[var(--primary)]" />
          <span>{toast.message}</span>
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
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-[var(--text-main,#FFFFFF)]">{safeTranslate('logs.title', 'سجل العمليات المباشر')}</h1>
              <p className="text-[11px] text-[var(--text-sub,#94A3B8)] hidden sm:block">{safeTranslate('logs.subtitle', 'متابعة التغييرات في الأكاديمية لحظة بلحظة')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={fetchAuditLogs} 
              className="p-2 rounded-xl bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)] transition-all"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
              title={safeTranslate('logs.purgeOld', 'تنظيف السجلات القديمة')}
            >
              <Eraser size={15} />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-[var(--surface-card,rgba(15,23,42,0.85))] p-1 rounded-xl border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md">
          <button
            onClick={() => setIsAdvancedMode(false)}
            className={`py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              !isAdvancedMode 
                ? 'bg-[var(--primary)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_12px_rgba(224,122,0,0.3)]' 
                : 'text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
            }`}
          >
            <Sparkles size={14} />
            <span>{safeTranslate('logs.managerMode', 'وضع المدير (مبسط)')}</span>
          </button>
          <button
            onClick={() => setIsAdvancedMode(true)}
            className={`py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isAdvancedMode 
                ? 'bg-[var(--primary)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_12px_rgba(224,122,0,0.3)]' 
                : 'text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
            }`}
          >
            <Code size={14} />
            <span>{safeTranslate('logs.developerMode', 'وضع المطور (متقدم)')}</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2">
        <div 
          onClick={() => setSelectedOperation('ALL')}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
            selectedOperation === 'ALL' 
              ? 'bg-[var(--surface-card,rgba(15,23,42,0.95))] border-[var(--primary)] shadow-[0_0_12px_rgba(224,122,0,0.2)]' 
              : 'bg-[var(--surface-card,rgba(15,23,42,0.85))] border-[var(--border-card,rgba(255,255,255,0.08))]'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] block truncate">{safeTranslate('logs.todayTotal', 'إجمالي اليوم')}</span>
          <span className="text-sm sm:text-xl font-black text-[var(--text-main,#FFFFFF)]">{stats.todayTotal}</span>
        </div>
        <div 
          onClick={() => setSelectedOperation('UPDATE')}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
            selectedOperation === 'UPDATE' || selectedOperation === 'INSERT' 
              ? 'bg-[var(--surface-card,rgba(15,23,42,0.95))] border-[var(--primary)] shadow-[0_0_12px_rgba(224,122,0,0.2)]' 
              : 'bg-[var(--surface-card,rgba(15,23,42,0.85))] border-[var(--border-card,rgba(255,255,255,0.08))]'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] block truncate">{safeTranslate('logs.todayModifications', 'تعديلات اليوم')}</span>
          <span className="text-sm sm:text-xl font-black text-[var(--text-main,#FFFFFF)]">{stats.inserts + stats.updates}</span>
        </div>
        <div 
          onClick={() => setSelectedOperation('DELETE')}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
            selectedOperation === 'DELETE' 
              ? 'bg-[var(--surface-card,rgba(15,23,42,0.95))] border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
              : 'bg-[var(--surface-card,rgba(15,23,42,0.85))] border-[var(--border-card,rgba(255,255,255,0.08))]'
          }`}
        >
          <span className="text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] block truncate">{safeTranslate('logs.todayDeletes', 'حذف اليوم')}</span>
          <span className="text-sm sm:text-xl font-black text-red-400">{stats.deletes}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md space-y-2.5 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative flex items-center">
            <Search size={14} className={`absolute ${isRtl ? 'right-3' : 'left-3'} text-[var(--text-sub,#94A3B8)] pointer-events-none`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={safeTranslate('logs.searchPlaceholder', 'بحث باسم القسم، الطالب، أو المشرف...')}
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
              <option value="ALL">{safeTranslate('logs.allUsers', 'جميع المشرفين')} ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={String(u.id)} value={String(u.id)}>
                  {String(u.name)}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className={`absolute ${isRtl ? 'left-3' : 'right-3'} text-[var(--text-sub,#94A3B8)] pointer-events-none`} />
          </div>
        </div>

        <div className="relative z-30">
          <CustomDatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholderText={safeTranslate('logs.dateRangePlaceholder', 'اختر نطاق التاريخ...')}
            isArabic={isRtl}
            className="w-full bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] text-xs text-[var(--text-main,#FFFFFF)] rounded-xl py-2 px-3 focus:outline-none"
          />
        </div>

        {/* Operations & Filter Toggles */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: safeTranslate('logs.allOps', 'الكل') },
              { id: 'INSERT', label: safeTranslate('logs.insertOp', 'إضافة') },
              { id: 'UPDATE', label: safeTranslate('logs.updateOp', 'تعديل') },
              { id: 'DELETE', label: safeTranslate('logs.deleteOp', 'حذف') }
            ].map((op) => (
              <button
                key={op.id}
                onClick={() => setSelectedOperation(op.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedOperation === op.id 
                    ? 'bg-[var(--primary)] text-[var(--text-main,#FFFFFF)] font-bold shadow-[0_0_10px_rgba(224,122,0,0.3)]' 
                    : 'bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] border border-[var(--border-input,#1B2738)] hover:text-[var(--text-main,#FFFFFF)]'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {!isAdvancedMode && (
            <button
              onClick={() => setOnlyChanged(!onlyChanged)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                onlyChanged 
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30' 
                  : 'bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] border border-[var(--border-input,#1B2738)]'
              }`}
            >
              <Filter size={12} />
              <span>{onlyChanged ? safeTranslate('logs.hideUnchanged', 'الحقول المعدلة فقط') : safeTranslate('logs.showUnchanged', 'جميع الحقول')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feed Area */}
      <div className="space-y-2 relative z-10">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-sub,#94A3B8)] flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
            <span>{safeTranslate('logs.loading', 'جاري تحميل البيانات...')}</span>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-sub,#94A3B8)] bg-[var(--surface-card,rgba(15,23,42,0.85))] rounded-xl border border-dashed border-[var(--border-card,rgba(255,255,255,0.08))]">
            {safeTranslate('logs.noLogs', 'لا توجد سجلات تطابق خيارات البحث الحالية')}
          </div>
        ) : (
          paginatedLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const showRaw = showRawJsonMap[log.id];

            return (
              <div key={log.id} className="rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] overflow-hidden shadow-sm backdrop-blur-md">
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--surface-input,#0A101D)]/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <OperationBadge operation={log.operation} t={t} />
                    <div className="truncate">
                      <div className="text-xs sm:text-sm text-[var(--text-main,#FFFFFF)] truncate">
                        {formatHumanActionSentence(log)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[var(--text-sub,#94A3B8)] mt-0.5">
                        <span className="font-mono">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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
                        <span>{showRaw ? safeTranslate('logs.showFormatted', 'عرض التنسيق المنسق') : safeTranslate('logs.showRaw', 'عرض JSON الخام')}</span>
                      </button>
                    </div>

                    {showRaw ? (
                      <div className="relative bg-[var(--surface-input,#0A101D)]/90 backdrop-blur-md p-3 rounded-xl border border-[var(--border-input,#1B2738)] font-mono text-[11px] overflow-x-auto text-[var(--primary)] dir-ltr">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                            showToast(safeTranslate('logs.copied', 'تم نسخ كود JSON'), 'success');
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
        <div className="p-3 rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md flex items-center justify-between text-xs text-[var(--text-sub,#94A3B8)] relative z-10">
          <span>{safeTranslate('logs.page', 'صفحة')} {currentPage} {safeTranslate('logs.of', 'من')} {totalPages}</span>
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
