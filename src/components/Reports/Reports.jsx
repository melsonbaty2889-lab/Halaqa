import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import ReportDateSelector from '../UI/ReportDateSelector';
import TemplateSettings from './TemplateSettings';
import ReportMetrics from './ReportMetrics';
import StudentReportCard from './StudentReportCard';
import { getParsedMessage, generateWhatsAppLink } from './ReportHelpers';
import { BookOpen, Users, UserCheck, UserX, RotateCcw, Loader2, Search } from 'lucide-react';

export default function Reports({ students = [], academyId }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');

  const safeString = useCallback((val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') return val[currentLang] || val.ar || val.en || '';
    return String(val);
  }, [currentLang]);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportsData, setReportsData] = useState({});
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [sentLogs, setSentLogs] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  
  const [editingPhoneStudentId, setEditingPhoneStudentId] = useState(null);
  const [tempPhoneValue, setTempPhoneValue] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [localPhoneMap, setLocalPhoneMap] = useState({});

  const [messageTemplate, setMessageTemplate] = useState('');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  }, []);

  const formattedDateString = useMemo(() => {
    if (!selectedDate) return '';
    try {
      return new Date(selectedDate).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch { 
      return selectedDate; 
    }
  }, [selectedDate, isRtl]);

  const fetchReportsAndTemplate = useCallback(async () => {
    if (!academyId) return;
    setLoading(true);
    try {
      const { data: tmplData } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('academy_id', academyId)
        .eq('trigger_event', 'daily_report')
        .eq('is_active', true)
        .maybeSingle();

      if (tmplData && tmplData.template_body) {
        setTemplateId(tmplData.id);
        setMessageTemplate(tmplData.template_body);
      }

      const { data: viewData, error } = await supabase
        .from('v_daily_reports_status')
        .select('*')
        .eq('academy_id', academyId)
        .eq('date', selectedDate);

      if (error) throw error;

      const mappedData = {};
      const logsMap = {};

      // حماية المصفوفة القادمة من الاستعلام
      const safeViewData = Array.isArray(viewData) ? viewData : [];
      safeViewData.forEach(rec => {
        if (rec && rec.student_id) {
          mappedData[rec.student_id] = rec;
          if (rec.is_sent) logsMap[rec.student_id] = true;
        }
      });

      setReportsData(mappedData);
      setSentLogs(logsMap);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setReportsData({});
      setSentLogs({});
    } finally {
      setLoading(false);
    }
  }, [academyId, selectedDate]);

  useEffect(() => {
    fetchReportsAndTemplate();
  }, [fetchReportsAndTemplate]);

  const markAsSentInDB = async (studentId, reportText) => {
    setSentLogs(prev => ({ ...prev, [studentId]: true }));
    try {
      await supabase.from('notification_logs').insert([{ 
        academy_id: academyId, 
        recipient_user_id: studentId, 
        channel_used: 'whatsapp', 
        status: 'sent', 
        sent_text: reportText, 
        template_id: templateId 
      }]);
    } catch (err) { 
      console.error('Error recording notification log:', err); 
    }
  };

  const handleSendWhatsApp = (student, record) => {
    const text = getParsedMessage({ student, record, template: messageTemplate, formattedDate: formattedDateString, isRtl, safeString });
    const phone = localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone || record?.parent_phone);
    const link = generateWhatsAppLink(phone, text);
    markAsSentInDB(student.id, text);
    window.open(link, '_blank');
  };

  const handleCopyToClipboard = (student, record) => {
    const text = getParsedMessage({ student, record, template: messageTemplate, formattedDate: formattedDateString, isRtl, safeString });
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    markAsSentInDB(student.id, text);
    showToast(isRtl ? "تم نسخ التقرير بنجاح" : "Report copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // حماية مصفوفة الطلاب
  const safeStudents = useMemo(() => Array.isArray(students) ? students : [], [students]);

  const filteredStudents = useMemo(() => {
    const cleanSearch = safeString(searchTerm).toLowerCase().trim();
    return safeStudents.filter(student => {
      if (!student) return false;
      const rec = reportsData[student.id];
      const status = rec?.attendance_status || rec?.status || 'present';
      
      let matchesTab = true;
      if (activeTab === 'present') matchesTab = (status === 'present' || status === 'late');
      else if (activeTab === 'absent') matchesTab = (status === 'absent' || status === 'excused');
      else if (activeTab === 'unsent') matchesTab = !sentLogs[student.id];

      const studentName = safeString(student?.name || student?.student_name).toLowerCase();
      const parentPhone = (localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone)).toLowerCase();

      return matchesTab && (!cleanSearch || studentName.includes(cleanSearch) || parentPhone.includes(cleanSearch));
    });
  }, [safeStudents, reportsData, activeTab, searchTerm, sentLogs, safeString, localPhoneMap]);

  const unsentStudents = useMemo(() => {
    return safeStudents.filter(student => {
      if (!student) return false;
      const phone = localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone);
      return !sentLogs[student.id] && phone;
    });
  }, [safeStudents, sentLogs, localPhoneMap, safeString]);

  const handleBulkSendNext = () => {
    if (unsentStudents.length === 0) return;
    const nextStudent = unsentStudents[0];
    const rec = reportsData[nextStudent.id] || {};
    handleSendWhatsApp(nextStudent, rec);
  };

  const totalCount = safeStudents.length;
  const sentCount = Object.keys(sentLogs).length;
  const remainingCount = Math.max(0, totalCount - sentCount);
  const completionPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="w-full min-h-screen bg-[#090d16] text-slate-100 p-3 sm:p-5 font-sans"
    >
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-full text-xs shadow-lg z-[9999]">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              {isRtl ? "تقارير الحلقة الذكية" : "Smart Halaqa Reports"}
            </h1>
          </div>
        </div>
        
        <ReportDateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>

      <ReportMetrics 
        totalCount={totalCount} 
        completionPercentage={completionPercentage} 
        remainingCount={remainingCount} 
        unsentCount={unsentStudents.length} 
        onBulkSend={handleBulkSendNext} 
        isRtl={isRtl} 
      />

      <TemplateSettings 
        templateText={messageTemplate} 
        setTemplateText={setMessageTemplate} 
        formattedDate={formattedDateString} 
      />

      <div className="flex flex-col gap-2.5 my-4">
        <div className="relative w-full">
          <Search className={`w-4 h-4 absolute top-3 text-slate-500 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input 
            type="text" 
            placeholder={isRtl ? "بحث باسم الطالب..." : "Search..."} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className={`w-full bg-slate-900 border border-slate-800 rounded-lg py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: isRtl ? "الكل" : "All", icon: Users }, 
            { id: 'unsent', label: isRtl ? "غير مرسل" : "Unsent", icon: RotateCcw }, 
            { id: 'present', label: isRtl ? "حاضر" : "Present", icon: UserCheck }, 
            { id: 'absent', label: isRtl ? "غائب" : "Absent", icon: UserX }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-emerald-400">
          <Loader2 className="w-7 h-7 animate-spin mb-2" />
          <span className="text-xs text-slate-400">{isRtl ? 'جاري تحميل التقارير...' : 'Loading reports...'}</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
          {isRtl ? 'لا توجد نتائج مطابقة لليوم المحدد.' : 'No matching records found.'}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredStudents.map(student => (
            <StudentReportCard
              key={student.id}
              student={student}
              record={reportsData[student.id]}
              isSent={!!sentLogs[student.id]}
              parentPhone={localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone)}
              isEditingPhone={editingPhoneStudentId === student.id}
              tempPhoneValue={tempPhoneValue}
              savingPhone={savingPhone}
              copiedId={copiedId}
              isRtl={isRtl}
              safeString={safeString}
              onCopy={handleCopyToClipboard}
              onSendWhatsApp={handleSendWhatsApp}
              onResetSent={(id) => setSentLogs(p => { const c = { ...p }; delete c[id]; return c; })}
              onStartEditPhone={(id, p) => { setEditingPhoneStudentId(id); setTempPhoneValue(p || ''); }}
              onSavePhone={async (id) => {
                setSavingPhone(true);
                try {
                  await supabase.from('students').update({ parent_phone: tempPhoneValue.trim() }).eq('id', id);
                  setLocalPhoneMap(p => ({ ...p, [id]: tempPhoneValue.trim() }));
                  setEditingPhoneStudentId(null);
                  showToast(isRtl ? "تم تحديث رقم الهاتف بنجاح" : "Phone number updated");
                } catch (err) {
                  console.error('Failed to update phone number:', err);
                } finally {
                  setSavingPhone(false);
                }
              }}
              onCancelEditPhone={() => setEditingPhoneStudentId(null)}
              setTempPhoneValue={setTempPhoneValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}
