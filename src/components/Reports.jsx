// src/components/Reports.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { Btn, Card, Input, Badge, PageHeader } from './UI/UI.jsx';
import { 
  Calendar, 
  CheckCircle2, 
  Users, 
  UserCheck, 
  UserX, 
  RotateCcw, 
  Copy, 
  Check,
  Loader2,
  Sparkles,
  Smartphone,
  TrendingUp,
  Clock,
  Send,
  AlertCircle,
  MessageSquare,
  XCircle
} from 'lucide-react';

export default function Reports({ students = [], academyId }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');
  const textareaRef = useRef(null);

  const safeString = useCallback((val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val.ar || val.en || Object.values(val).find(v => typeof v === 'string') || '';
    }
    return String(val);
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportsData, setReportsData] = useState({});
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [sentLogs, setSentLogs] = useState({});
  const [showPreview, setShowPreview] = useState(true);

  const defaultTemplate = useMemo(() => {
    return isRtl 
      ? `السلام عليكم ورحمة الله وبركاته، تحية طيبة من أكاديميتنا. 🌸\n\nنود إطلاعكم على تقرير أداء الابن(ة) *[اسم_الطالب]* ليوم [التاريخ]:\n\n📌 الحالة: [الحالة]\n📖 الحفظ الجديد: [الحفظ]\n🔄 المراجعة القريبة: [المراجعة]\n📚 المراجعة البعيدة: [الماضي]\n🌟 التقييم اليومي: [التقييم]\n📝 ملاحظات الحلقة: [الملاحظات]\n\nنسأل الله أن يبارك فيه وينبته نباتاً حسناً. 🤲✨`
      : `Peace be upon you. Standard update from our academy. 🌸\n\nPerformance report for *[اسم_الطالب]* on [التاريخ]:\n\n📌 Status: [الحالة]\n📖 New Memorization: [الحفظ]\n🔄 Revision: [المراجعة]\n📚 Distant Revision: [الماضي]\n🌟 Daily Grade: [التقييم]\n📝 Notes: [الملاحظات]\n\nMay Allah bless them. 🤲✨`;
  }, [isRtl]);

  const [messageTemplate, setMessageTemplate] = useState(defaultTemplate);

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
      } else {
        setMessageTemplate(defaultTemplate);
      }

      const { data: viewData, error: viewError } = await supabase
        .from('v_daily_reports_status')
        .select('*')
        .eq('academy_id', academyId);

      if (viewError) throw viewError;

      const mappedData = {};
      const logsMap = {};

      if (viewData) {
        viewData.forEach(rec => {
          mappedData[rec.student_id] = rec;
          if (rec.is_sent) {
            logsMap[rec.student_id] = true;
          }
        });
      }

      setReportsData(mappedData);
      setSentLogs(logsMap);

    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  }, [academyId, defaultTemplate]);

  useEffect(() => {
    fetchReportsAndTemplate();
  }, [fetchReportsAndTemplate, selectedDate]);

  const markAsSentInDB = async (studentId, reportText) => {
    setSentLogs(prev => ({ ...prev, [studentId]: true }));

    try {
      await supabase
        .from('notification_logs')
        .insert([
          {
            academy_id: academyId,
            recipient_user_id: studentId,
            channel_used: 'whatsapp',
            status: 'sent',
            sent_text: reportText,
            template_id: templateId
          }
        ]);
    } catch (err) {
      console.error("Error logging sent notification:", err);
    }
  };

  const resetSentLog = (studentId) => {
    setSentLogs(prev => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  const getParsedMessage = useCallback((student, record) => {
    const studentName = safeString(student?.name || student?.student_name || record?.student_name);
    const statusVal = record?.attendance_status || record?.status;

    const getStatusText = () => {
      if (!record || !statusVal) return isRtl ? 'حاضر ✅' : 'Present ✅';
      switch (statusVal) {
        case 'present': return isRtl ? 'حاضر ✅' : 'Present ✅';
        case 'absent': return isRtl ? 'غائب ❌' : 'Absent ❌';
        case 'late': return isRtl ? 'متأخر ⏳' : 'Late ⏳';
        case 'excused': return isRtl ? 'غائب بعذر 📝' : 'Excused 📝';
        default: return isRtl ? 'حاضر ✅' : 'Present ✅';
      }
    };

    const getGradeText = () => {
      const rawGrade = record?.session_grade;
      if (!record || rawGrade === null || rawGrade === undefined) {
        return isRtl ? 'لم يحدد' : 'Not specified';
      }
      
      const grade = Number(rawGrade);
      if (isNaN(grade)) return safeString(rawGrade);
      
      if (grade >= 10) return isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐';
      if (grade >= 8)  return isRtl ? 'جيد جداً ⭐⭐' : 'Very Good ⭐⭐';
      if (grade >= 6)  return isRtl ? 'يحتاج مزيد من التركيز 🎯' : 'Needs Focus 🎯';
      
      return isRtl ? 'ضعيف ⚠️' : 'Weak ⚠️';
    };

    const newMemorization = safeString(record?.new_memorization || record?.memorization);
    const retention = safeString(record?.review || record?.retention_assignment || record?.revision);
    const notes = safeString(record?.session_notes || record?.notes);

    let parsed = messageTemplate;
    parsed = parsed.replace(/\[اسم_الطالب\]/g, studentName || (isRtl ? "عاصم محمد السنباطي" : "Student Name"));
    parsed = parsed.replace(/\[التاريخ\]/g, selectedDate);
    parsed = parsed.replace(/\[الحالة\]/g, getStatusText());
    parsed = parsed.replace(/\[الحفظ\]/g, newMemorization || (statusVal === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')));
    parsed = parsed.replace(/\[المراجعة\]/g, retention || '---');
    parsed = parsed.replace(/\[الماضي\]/g, '---');
    parsed = parsed.replace(/\[التقييم\]/g, getGradeText());
    parsed = parsed.replace(/\[الملاحظات\]/g, notes || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.'));

    return parsed;
  }, [messageTemplate, selectedDate, isRtl, safeString]);

  const generateWhatsAppLink = (student, record) => {
    const parsedMessage = getParsedMessage(student, record);
    let phone = safeString(student?.parent_phone || student?.phone || record?.parent_phone);
    phone = phone.replace(/\s+/g, '').replace(/[+\-]/g, '');
    
    if (phone.startsWith('01') && phone.length === 11) {
      phone = '20' + phone;
    }
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(parsedMessage)}`;
  };

  const handleCopyToClipboard = (student, record) => {
    const text = getParsedMessage(student, record);
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    markAsSentInDB(student.id, text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insertTagAtCursor = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessageTemplate(prev => prev + " " + tag);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = messageTemplate;
    const newText = text.substring(0, start) + tag + text.substring(end);
    
    setMessageTemplate(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
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
      const parentPhone = safeString(student?.parent_phone || student?.phone).toLowerCase();

      return matchesTab && (!cleanSearch || studentName.includes(cleanSearch) || parentPhone.includes(cleanSearch));
    });
  }, [students, reportsData, activeTab, searchTerm, sentLogs, safeString]);

  const totalCount = students.length;
  const sentCount = Object.keys(sentLogs).length;
  const remainingCount = Math.max(0, totalCount - sentCount);
  const completionPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  const sampleStudent = students[0] || { id: 'demo', name: 'عاصم محمد السنباطي', parent_phone: '01000000000' };
  const sampleRecord = reportsData[sampleStudent.id] || {};
  const previewText = getParsedMessage(sampleStudent, sampleRecord);

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "inherit" }}>
      
      {/* 1. الترويسة الرئيسية بدون أي رموز تعبيرية */}
      <PageHeader 
        title={isRtl ? "مركز تقارير أولياء الأمور" : "Parent Reporting Center"}
        sub={isRtl ? "توليد وإرسال حصاد اليوم القرآني والأكاديمي عبر الواتساب" : "Generate and send daily Quranic results via WhatsApp"}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.surface, padding: '6px 12px', borderRadius: '10px', border: `1px solid ${C.border}` }}>
            <Calendar size={15} strokeWidth={1.8} style={{ color: C.primary }} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            />
          </div>
        }
      />

      {/* 2. بطاقات الإحصائيات بأيقونات رسمية موحدة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <Card style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: `${C.primary}15`, color: C.primary }}>
            <Users size={18} strokeWidth={1.8} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.textSub, display: 'block' }}>{isRtl ? "إجمالي الطلاب" : "Total"}</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: C.text }}>{totalCount}</span>
          </div>
        </Card>

        <Card style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: `${C.success}15`, color: C.success }}>
            <TrendingUp size={18} strokeWidth={1.8} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.textSub, display: 'block' }}>{isRtl ? "نسبة الإرسال" : "Sent"}</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: C.success }}>{completionPercentage}%</span>
          </div>
        </Card>

        <Card style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: `${C.warning || '#f59e0b'}15`, color: C.warning || '#f59e0b' }}>
            <Clock size={18} strokeWidth={1.8} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.textSub, display: 'block' }}>{isRtl ? "المتبقي" : "Remaining"}</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: C.text }}>{remainingCount}</span>
          </div>
        </Card>
      </div>

      {/* 3. محرر القالب والمعاينة المباشرة */}
      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? 'repeat(auto-fit, minmax(290px, 1fr))' : '1fr', gap: '14px', marginBottom: '20px' }}>
        
        {/* محرّر النصوص */}
        <Card style={{ background: C.surface, border: `1px solid ${C.border}`, padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.primary, fontWeight: 700, fontSize: '13px' }}>
              <Sparkles size={16} strokeWidth={1.8} />
              <span>{isRtl ? "محرر قوالب التقارير" : "Report Template Editor"}</span>
            </div>
            <Btn onClick={() => setShowPreview(!showPreview)} variant="ghost" style={{ fontSize: '11px', padding: '4px 8px' }}>
              <Smartphone size={13} strokeWidth={1.8} /> {showPreview ? (isRtl ? "إخفاء المعاينة" : "Hide") : (isRtl ? "معاينة" : "Preview")}
            </Btn>
          </div>

          <textarea 
            ref={textareaRef}
            rows={5}
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            style={{ 
              width: '100%', 
              background: '#0d1322', 
              border: `1px solid ${C.border}`, 
              color: C.text, 
              borderRadius: '8px', 
              padding: '10px', 
              fontSize: '13px', 
              outline: 'none', 
              resize: 'vertical', 
              lineHeight: '1.5', 
              boxSizing: 'border-box' 
            }}
          />

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginTop: '8px' }}>
            {['[اسم_الطالب]', '[التاريخ]', '[الحالة]', '[الحفظ]', '[المراجعة]', '[الماضي]', '[التقييم]', '[الملاحظات]'].map(tag => (
              <Badge key={tag} onClick={() => insertTagAtCursor(tag)} style={{ cursor: 'pointer', whiteSpace: 'nowrap', background: `${C.primary}18`, color: C.primary, fontSize: '11px' }}>
                + {tag}
              </Badge>
            ))}
          </div>
        </Card>

        {/* محاكي المعاينة بأيقونة MessageSquare احترافية */}
        {showPreview && (
          <Card style={{ background: C.surface, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '14px' }}>
            <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} strokeWidth={1.8} style={{ color: C.success }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: C.textSub }}>
                {isRtl ? "معاينة الرسالة الحية" : "Live Parent Message Preview"}
              </span>
            </div>
            
            <div 
              dir="auto"
              style={{ 
                background: '#0d1912', 
                border: `1px solid ${C.success}30`, 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '12.5px', 
                lineHeight: '1.6', 
                whiteSpace: 'pre-wrap', 
                color: C.text,
                textAlign: isRtl ? 'right' : 'left',
                flex: 1
              }}
            >
              {previewText}
            </div>
          </Card>
        )}
      </div>

      {/* 4. تصفية وبحث */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexDirection: 'column' }}>
        <Input 
          type="text"
          placeholder={isRtl ? "بحث باسم الطالب أو الهاتف..." : "Search student or phone..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          <Btn onClick={() => setActiveTab('all')} variant={activeTab === 'all' ? "primary" : "ghost"} style={{ fontSize: '12px', padding: '6px 10px' }}>
            <Users size={13} strokeWidth={1.8} />
            {isRtl ? "الكل" : "All"} ({students.length})
          </Btn>
          <Btn onClick={() => setActiveTab('unsent')} variant={activeTab === 'unsent' ? "primary" : "ghost"} style={{ fontSize: '12px', padding: '6px 10px' }}>
            <Clock size={13} strokeWidth={1.8} />
            {isRtl ? "غير مرسل" : "Unsent"} ({remainingCount})
          </Btn>
          <Btn onClick={() => setActiveTab('present')} variant={activeTab === 'present' ? "primary" : "ghost"} style={{ fontSize: '12px', padding: '6px 10px' }}>
            <UserCheck size={13} strokeWidth={1.8} />
            {isRtl ? "حاضر" : "Present"}
          </Btn>
          <Btn onClick={() => setActiveTab('absent')} variant={activeTab === 'absent' ? "primary" : "ghost"} style={{ fontSize: '12px', padding: '6px 10px' }}>
            <UserX size={13} strokeWidth={1.8} />
            {isRtl ? "غائب" : "Absent"}
          </Btn>
        </div>
      </div>

      {/* 5. قائمة الطلاب بأزرار وأيقونات متناسقة */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: C.textSub }}>
          <Loader2 size={20} className="spin-icon" style={{ margin: '0 auto 8px auto', display: 'block' }} />
          <span style={{ fontSize: '13px' }}>{isRtl ? "جاري تحميل البيانات..." : "Loading report data..."}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredStudents.length === 0 ? (
            <Card style={{ textAlign: 'center', color: C.textSub, padding: '20px' }}>
              <AlertCircle size={20} strokeWidth={1.8} style={{ margin: '0 auto 6px auto', display: 'block', opacity: 0.5 }} />
              <span style={{ fontSize: '13px' }}>{isRtl ? "لا يوجد طلاب يطابقون خيار البحث." : "No matching students found."}</span>
            </Card>
          ) : (
            filteredStudents.map(student => {
              const record = reportsData[student.id];
              const isSent = !!sentLogs[student.id];
              const studentName = safeString(student?.name || student?.student_name);
              const parentPhone = safeString(student?.parent_phone || student?.phone || record?.parent_phone);
              const messageText = getParsedMessage(student, record);

              return (
                <Card 
                  key={student.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '10px',
                    opacity: isSent ? 0.75 : 1,
                    padding: '12px 14px',
                    borderRight: isRtl && isSent ? `3px solid ${C.success}` : undefined,
                    borderLeft: !isRtl && isSent ? `3px solid ${C.success}` : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: C.text }}>{studentName}</span>
                        {isSent && (
                          <Badge color={C.success} style={{ fontSize: '10px' }}>
                            <CheckCircle2 size={10} strokeWidth={1.8} /> {isRtl ? "تم الإرسال" : "Sent"}
                          </Badge>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: C.textSub }}>{parentPhone || (isRtl ? 'الهاتف غير مسجل' : 'No Phone')}</span>
                    </div>

                    {isSent && (
                      <Btn onClick={() => resetSentLog(student.id)} variant="ghost" style={{ padding: '4px' }} title={isRtl ? "إعادة تعيين" : "Reset"}>
                        <RotateCcw size={13} strokeWidth={1.8} />
                      </Btn>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: C.textSub, background: `${C.border}20`, padding: '6px 10px', borderRadius: '6px' }}>
                    <div>{isRtl ? "حفظ:" : "Mem:"} <span style={{ color: C.text }}>{safeString(record?.new_memorization || record?.memorization) || '---'}</span></div>
                    <div>{isRtl ? "مراجعة:" : "Rev:"} <span style={{ color: C.text }}>{safeString(record?.review || record?.revision) || '---'}</span></div>
                    <div>{isRtl ? "تقييم:" : "Grade:"} <span style={{ color: C.primary, fontWeight: '700' }}>{safeString(record?.session_grade) || '---'}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <Btn 
                      onClick={() => handleCopyToClipboard(student, record)} 
                      variant={copiedId === student.id ? "success" : "ghost"}
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      {copiedId === student.id ? <Check size={13} strokeWidth={1.8} /> : <Copy size={13} strokeWidth={1.8} />}
                    </Btn>
                    
                    <a 
                      href={generateWhatsAppLink(student, record)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => markAsSentInDB(student.id, messageText)}
                      style={{ textDecoration: 'none', flex: 1 }}
                    >
                      <Btn variant={isSent ? "secondary" : "success"} style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '6px 10px' }}>
                        <Send size={13} strokeWidth={1.8} /> 
                        {isSent ? (isRtl ? "إعادة إرسال" : "Resend") : (isRtl ? "إرسال الواتساب" : "Send WhatsApp")}
                      </Btn>
                    </a>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
