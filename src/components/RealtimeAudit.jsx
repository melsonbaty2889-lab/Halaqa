import React, { useState, useMemo } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import CustomDatePicker from './UI/CustomDatePicker';

// قاموس ترجمة المفاتيح الناتجة من قاعدة البيانات للغة العربية
const JSON_TRANSLATIONS = {
  student_id: "معرف الطالب",
  student_name: "اسم الطالب",
  badges: "الشارات والأوسمة",
  current_streak: "سلسلة التواجد الحالية",
  longest_streak: "أطول سلسلة تواجد",
  subscription_system: "نظام الاشتراك",
  subscription_status: "حالة الاشتراك",
  points: "نقاط المكافأة",
  created_at: "تاريخ الإنشاء",
  updated_at: "تاريخ التحديث",
  phone: "رقم الهاتف",
  group_id: "معرف المجموعة",
  attendance_rate: "نسبة الحضور",
  notes: "ملاحظات",
  status: "الحالة",
  role: "الدور / الصلاحية",
  id: "المعرف",
  title: "العنوان",
  type: "النوع",
  description: "الوصف"
};

export default function RealtimeAudit({ isArabic = true }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showRawJsonMap, setShowRawJsonMap] = useState({});

  // نموذج بيانات للأنشطة
  const [logs] = useState([
    {
      id: "log_101",
      action: "UPDATE",
      table_name: "students",
      performed_by: "30d829e5-9f1a-4c20-b123-abc123def456",
      user_name: "أحمد عبد الله (مشرف)",
      record_title: "عاصم محمد مصطفى السنباطي",
      timestamp: new Date().toISOString(),
      changes: {
        badges: ["متميز", "حافز الحضور"],
        current_streak: 5,
        longest_streak: 12,
        subscription_system: "شهري",
        points: 150
      }
    },
    {
      id: "log_102",
      action: "INSERT",
      table_name: "attendance",
      performed_by: "88a109f2-2b3c-4d5e-a678-901234567890",
      user_name: "م. محمد علي",
      record_title: "تسجيل حضور - الحلقة الأولى",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      changes: {
        status: "حاضر",
        notes: "تم الحضور في الموعد المحدد"
      }
    },
    {
      id: "log_103",
      action: "DELETE",
      table_name: "subscriptions",
      performed_by: "30d829e5-9f1a-4c20-b123-abc123def456",
      user_name: "أحمد عبد الله (مشرف)",
      record_title: "اشتراك ملغي #4092",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      changes: {
        subscription_status: "ملغى"
      }
    }
  ]);

  // تنسيق عرض اسم المستخدم مع حجب الـ UUID المزعج
  const formatUserIdentity = (log) => {
    if (log.user_name) return log.user_name;
    if (log.performed_by && log.performed_by.length > 8) {
      return `مستخدم (#${log.performed_by.substring(0, 6)})`;
    }
    return "مستخدم النظام";
  };

  // تصفية القيم الفارغة لتقليل حجم البطاقة
  const filterCleanChanges = (changesObj) => {
    if (!changesObj || typeof changesObj !== 'object') return {};
    const clean = {};
    Object.entries(changesObj).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0)) {
        clean[key] = val;
      }
    });
    return clean;
  };

  const toggleRawJson = (logId) => {
    setShowRawJsonMap(prev => ({ ...prev, [logId]: !prev[logId] }));
  };

  // تصفية السجلات حسب البحث والعملية
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.record_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatUserIdentity(log).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, selectedAction]);

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
            {isArabic ? 'متابعة كافة التعديلات والتغييرات في النظام لحظة بلحظة' : 'Monitor all system modifications in real-time'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs !py-2 !px-3">
            <RefreshCw size={14} className="text-slate-400" />
            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
          </button>
          <button className="btn-primary text-xs !py-2 !px-3">
            <Download size={14} />
            <span>{isArabic ? 'تصدير التقرير' : 'Export Log'}</span>
          </button>
        </div>
      </div>

      {/* 🟢 شريط الفلترة المدمج به CustomDatePicker الصحيح */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        
        <div className="relative flex items-center">
          <Search size={16} className="absolute right-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isArabic ? "بحث في السجلات أو المستخدمين..." : "Search logs or users..."}
            className="app-input !py-2 !pr-9 text-xs"
          />
        </div>

        <div className="relative flex items-center">
          <Filter size={15} className="absolute right-3 text-slate-400 pointer-events-none" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="app-input !py-2 !pr-9 text-xs appearance-none cursor-pointer"
          >
            <option value="ALL">{isArabic ? "جميع العمليات (INSERT / UPDATE / DELETE)" : "All Actions"}</option>
            <option value="INSERT">{isArabic ? "إضافة جديدة (INSERT)" : "INSERT"}</option>
            <option value="UPDATE">{isArabic ? "تعديل بيانات (UPDATE)" : "UPDATE"}</option>
            <option value="DELETE">{isArabic ? "حذف (DELETE)" : "DELETE"}</option>
          </select>
        </div>

        {/* منتقي التواريخ المخصص الداكن */}
        <CustomDatePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          isArabic={isArabic}
        />
      </div>

      {/* 🟢 قائمة البطاقات */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-500 text-xs">
            {isArabic ? 'لا توجد سجلات تطابق خيارات البحث الحالية' : 'No audit logs found matching your criteria'}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const cleanChanges = filterCleanChanges(log.changes);
            const isExpanded = expandedLogId === log.id;
            const isRawJson = !!showRawJsonMap[log.id];

            return (
              <div 
                key={log.id} 
                className="rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all overflow-hidden shadow-lg"
              >
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ActionBadge action={log.action} />
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">
                        {log.record_title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-slate-500" />
                          <span className="text-emerald-400 font-medium">{formatUserIdentity(log)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag size={13} className="text-slate-500" />
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">{log.table_name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-500" />
                          <span>{new Date(log.timestamp).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
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

                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
                    {isRawJson ? (
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto dir-ltr">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {Object.entries(cleanChanges).map(([key, value]) => (
                          <div 
                            key={key} 
                            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/60 flex flex-col justify-between"
                          >
                            <span className="text-[11px] text-slate-400 font-medium">
                              {JSON_TRANSLATIONS[key] || key}
                            </span>
                            <span className="text-xs font-semibold text-slate-200 mt-1">
                              {Array.isArray(value) ? value.join(' ، ') : String(value)}
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

function ActionBadge({ action }) {
  switch (action) {
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
          <span>{action}</span>
        </span>
      );
  }
}
