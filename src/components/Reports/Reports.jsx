import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, UserCheck, UserX, RotateCcw, Loader2, Search } from 'lucide-react';

// إصلاح مسارات الاستيراد واعتماد النمط المعياري الموحد للمشروع
import { supabase } from '@/lib/supabase';
import { C } from '@/theme/colors';
import { Card, Btn, Input } from '@/components/UI/UI';

import ReportDateSelector from '@/components/UI/ReportDateSelector';
import TemplateSettings from '@/components/Reports/TemplateSettings';
import ReportMetrics from '@/components/Reports/ReportMetrics';
import StudentReportCard from '@/components/Reports/StudentReportCard';
import { getParsedMessage, generateWhatsAppLink } from './ReportHelpers';

export default function Reports({ students = [], academyId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');

  // دالة الحماية والترجمة الديناميكية للنصوص
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

  // تنسيق التاريخ ديناميكياً بحسب ثقافة المنطقة ولغتها
  const formattedDateString = useMemo(() => {
    if (!selectedDate) return '';
    try {
      return new Intl.DateTimeFormat(currentLang, { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }).format(new Date(selectedDate));
    } catch { 
      return selectedDate; 
    }
  }, [selectedDate, currentLang]);

  // جلب البيانات مع حماية الاتصال واستعمال استعلامات آمنة
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
    const text = getParsedMessage({ 
      student, 
      record, 
      template: messageTemplate, 
      formattedDate: formattedDateString, 
      locale: currentLang, 
      safeString 
    });
    const phone = localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone || record?.parent_phone);
    const link = generateWhatsAppLink(phone, text);
    markAsSentInDB(student.id, text);
    window.open(link, '_blank');
  };

  const handleCopyToClipboard = (student, record) => {
    const text = getParsedMessage({ 
      student, 
      record, 
      template: messageTemplate, 
      formattedDate: formattedDateString, 
      locale: currentLang, 
      safeString 
    });
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    markAsSentInDB(student.id, text);
    showToast(t('reports.copied_success', { defaultValue: isRtl ? "تم نسخ التقرير بنجاح" : "Report copied to clipboard" }));
    setTimeout(() => setCopiedId(null), 2000);
  };

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
      style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '16px' }}
    >
      {/* التنبيهات المنبثقة (Toast) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: C.success,
          color: '#ffffff',
          fontWeight: 'bold',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999
        }}>
          {toastMessage}
        </div>
      )}

      {/* الهيدر وعنصر اختيار التاريخ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: `${C.emerald}15`, 
            border: `1px solid ${C.emerald}30`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <BookOpen style={{ width: '20px', height: '20px', color: C.emerald }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: C.text, margin: 0 }}>
              {t('reports.title', { defaultValue: isRtl ? "تقارير الحلقة الذكية" : "Smart Halaqa Reports" })}
            </h1>
          </div>
        </div>
        
        <ReportDateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>

      {/* بطاقات الإحصائيات والمؤشرات */}
      <ReportMetrics 
        totalCount={totalCount} 
        completionPercentage={completionPercentage} 
        remainingCount={remainingCount} 
        unsentCount={unsentStudents.length} 
        onBulkSend={handleBulkSendNext} 
      />

      {/* إعدادات وتخصيص قالب الرسائل */}
      <TemplateSettings 
        templateText={messageTemplate} 
        setTemplateText={setMessageTemplate} 
        formattedDate={formattedDateString} 
      />

      {/* شريط البحث وتصفية التبويبات */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search style={{ 
            width: '16px', 
            height: '16px', 
            position: 'absolute', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: C.textSub,
            [isRtl ? 'right' : 'left']: '12px'
          }} />
          <Input 
            type="text" 
            placeholder={t('reports.search_placeholder', { defaultValue: isRtl ? "بحث باسم الطالب..." : "Search..." })} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ 
              paddingLeft: isRtl ? '12px' : '36px', 
              paddingRight: isRtl ? '36px' : '12px',
              fontSize: '0.8rem'
            }}
          />
        </div>

        {/* التبويبات التفاعلية */}
        <div style={{ display: 'flex', itemsCenter: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: t('reports.tabs.all', { defaultValue: isRtl ? "الكل" : "All" }), icon: Users }, 
            { id: 'unsent', label: t('reports.tabs.unsent', { defaultValue: isRtl ? "غير مرسل" : "Unsent" }), icon: RotateCcw }, 
            { id: 'present', label: t('reports.tabs.present', { defaultValue: isRtl ? "حاضر" : "Present" }), icon: UserCheck }, 
            { id: 'absent', label: t('reports.tabs.absent', { defaultValue: isRtl ? "غائب" : "Absent" }), icon: UserX }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Btn 
                key={tab.id} 
                variant={isActive ? 'primary' : 'outline'}
                onClick={() => setActiveTab(tab.id)} 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '0.75rem', 
                  whiteSpace: 'nowrap',
                  background: isActive ? C.emerald : C.card,
                  color: isActive ? '#ffffff' : C.textSub,
                  borderColor: isActive ? C.emerald : C.border
                }}
              >
                <IconComponent style={{ width: '14px', height: '14px' }} />
                <span>{tab.label}</span>
              </Btn>
            );
          })}
        </div>
      </div>

      {/* عرض حالات التحميل والنتائج والبطاقات */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: C.emerald }}>
          <Loader2 style={{ width: '28px', height: '28px', animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
          <span style={{ fontSize: '0.8rem', color: C.textSub }}>
            {t('reports.loading', { defaultValue: isRtl ? 'جاري تحميل التقارير...' : 'Loading reports...' })}
          </span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '32px', color: C.textSub, fontSize: '0.8rem' }}>
          {t('reports.no_data', { defaultValue: isRtl ? 'لا توجد نتائج مطابقة لليوم المحدد.' : 'No matching records found.' })}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  showToast(t('reports.phone_updated', { defaultValue: isRtl ? "تم تحديث رقم الهاتف بنجاح" : "Phone number updated" }));
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
