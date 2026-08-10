import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import ReportDateSelector from '../UI/ReportDateSelector';
import TemplateSettings from './TemplateSettings';
import ReportMetrics from './ReportMetrics';
import StudentReportCard from './StudentReportCard';
import { getParsedMessage, generateWhatsAppLink } from './reportHelpers';
import { BookOpen, Users, UserCheck, UserX, RotateCcw, Loader2 } from 'lucide-react';

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

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const formattedDateString = useMemo(() => {
    if (!selectedDate) return '';
    try {
      return new Date(selectedDate).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return selectedDate; }
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

      const { data: viewData } = await supabase
        .from('v_daily_reports_status')
        .select('*')
        .eq('academy_id', academyId)
        .eq('date', selectedDate);

      const mappedData = {};
      const logsMap = {};
      if (viewData) {
        viewData.forEach(rec => {
          mappedData[rec.student_id] = rec;
          if (rec.is_sent) logsMap[rec.student_id] = true;
        });
      }
      setReportsData(mappedData);
      setSentLogs(logsMap);
    } catch (err) {
      console.error(err);
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
    } catch (err) { console.error(err); }
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
    showToast(isRtl ? "تم نسخ التقرير بنجاح" : "Report copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = useMemo(() => {
    const cleanSearch = safeString(searchTerm).toLowerCase().trim();
    return (students || []).filter(student => {
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
  }, [students, reportsData, activeTab, searchTerm, sentLogs, safeString, localPhoneMap]);

  const unsentStudents = useMemo(() => {
    return (students || []).filter(student => {
      const phone = localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone);
      return !sentLogs[student.id] && phone;
    });
  }, [students, sentLogs, localPhoneMap, safeString]);

  const handleBulkSendNext = () => {
    if (unsentStudents.length === 0) return;
    const nextStudent = unsentStudents[0];
    const rec = reportsData[nextStudent.id] || {};
    handleSendWhatsApp(nextStudent, rec);
  };

  const totalCount = students.length;
  const sentCount = Object.keys(sentLogs).length;
  const remainingCount = Math.max(0, totalCount - sentCount);
  const completionPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', width: '100%', padding: '16px 12px', background: '#090d16', minHeight: '100vh', color: '#f1f5f9' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#090d16', padding: '8px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} style={{ color: '#10b981' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
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

      <TemplateSettings templateText={messageTemplate} setTemplateText={setMessageTemplate} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        <input 
          type="text" 
          placeholder={isRtl ? "بحث باسم الطالب..." : "Search..."} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px', outline: 'none' }} 
        />
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'all', label: isRtl ? "الكل" : "All", icon: Users }, 
            { id: 'unsent', label: isRtl ? "غير مرسل" : "Unsent", icon: RotateCcw }, 
            { id: 'present', label: isRtl ? "حاضر" : "Present", icon: UserCheck }, 
            { id: 'absent', label: isRtl ? "غائب" : "Absent", icon: UserX }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={{ 
                background: activeTab === tab.id ? '#10b981' : '#0f172a', 
                color: activeTab === tab.id ? '#090d16' : '#94a3b8', 
                border: '1px solid #1e293b', 
                padding: '5px 10px', 
                borderRadius: '6px', 
                fontSize: '11px', 
                cursor: 'pointer' 
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#10b981' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              onResetSent={(id) => setSentLogs(p => { const c = {...p}; delete c[id]; return c; })}
              onStartEditPhone={(id, p) => { setEditingPhoneStudentId(id); setTempPhoneValue(p || ''); }}
              onSavePhone={async (id) => {
                setSavingPhone(true);
                await supabase.from('students').update({ parent_phone: tempPhoneValue.trim() }).eq('id', id);
                setLocalPhoneMap(p => ({ ...p, [id]: tempPhoneValue.trim() }));
                setEditingPhoneStudentId(null);
                setSavingPhone(false);
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
