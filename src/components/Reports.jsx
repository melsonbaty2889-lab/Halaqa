// src/components/Reports.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { Btn, Card, Input, Badge, PageHeader } from './UI/UI.jsx';
import { 
  Calendar, 
  MessageCircle, 
  CheckCircle2, 
  Users, 
  UserCheck, 
  UserX, 
  Edit3, 
  RotateCcw, 
  Copy, 
  Search,
  Check,
  Loader2,
  Sparkles,
  Smartphone,
  TrendingUp,
  Clock,
  Send,
  AlertCircle
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

  // 1. جلب البيانات والقالب المفعل من Supabase
  const fetchReportsAndTemplate = useCallback(async () => {
    if (!academyId) return;
    setLoading(true);

    try {
      // جلب القالب المفعل للأكاديمية
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

      // جلب سجل التقارير من الـ View
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
      console.error("🚨 خطأ أثناء جلب البيانات من Supabase:", err);
    } finally {
      setLoading(false);
    }
  }, [academyId, defaultTemplate]);

  useEffect(() => {
    fetchReportsAndTemplate();
  }, [fetchReportsAndTemplate, selectedDate]);

  // 2. تسجيل الإرسال الحقيقي في قاعدة البيانات (notification_logs)
  const markAsSentInDB = async (studentId, reportText) => {
    // تحديث الواجهة فوراً (Optimistic UI)
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
      console.error("🚨 خطأ أثناء حفظ السجل في قاعدة البيانات:", err);
    }
  };

  const resetSentLog = (studentId) => {
    setSentLogs(prev => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  // 3. بناء نص الرسالة الديناميكي
  const getParsedMessage = useCallback((student, record) => {
    const studentName = safeString(student?.name || student?.student_name || record?.student_name);
    const statusVal = record?.attendance_status || record?.status;

    const statusText = () => {
      if (!record || !statusVal) return isRtl ? 'حاضر ✅' : 'Present ✅';
      switch (statusVal) {
        case 'present': return isRtl ? 'حاضر ✅' : 'Present ✅';
        case 'absent': return isRtl ? 'غائب ❌' : 'Absent ❌';
        case 'late': return isRtl ? 'متأخر ⏳' : 'Late ⏳';
        case 'excused': return isRtl ? 'غائب بعذر 📝' : 'Excused 📝';
        default: return isRtl ? 'حاضر ✅' : 'Present ✅';
      }
    };

    const gradeText = () => {
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

    return messageTemplate
      .replace(/\[اسم_الطالب\]/g, studentName || (isRtl ? "اسم الطالب" : "Student Name"))
      .replace(/\[التاريخ\]/g, selectedDate)
      .replace(/\[الحالة\]/g, statusText())
      .replace(/\[الحفظ\]/g, newMemorization || (statusVal === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')))
      .replace(/\[المراجعة\]/g, retention || '---')
      .replace(/\[الماضي\]/g, '---')
      .replace(/\[التقييم\]/g, gradeText())
      .replace(/\[الملاحظات\]/g, notes || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.'));
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

  // 4. إدراج المتغيرات عند موضع المؤشر
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

  // 5. التصفية والإحصائيات
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

      const matchesSearch = !cleanSearch || studentName.includes(cleanSearch) || parentPhone.includes(cleanSearch);

      return matchesTab && matchesSearch;
    });
  }, [students, reportsData, activeTab, searchTerm, sentLogs, safeString]);

  const totalCount = students.length;
  const sentCount = Object.keys(sentLogs).length;
  const remainingCount = Math.max(0, totalCount - sentCount);
  const completionPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  const sampleStudent = students[0] || { name: 'عمر أحمد', parent_phone: '01000000000' };
  const sampleRecord = reportsData[sampleStudent.id] || {};
  const previewText = getParsedMessage(sampleStudent, sampleRecord);

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "inherit" }}>
      
      {/* 1. الترويسة والتحكم بالتاريخ */}
      <PageHeader 
        title={isRtl ? "مركز تقارير أولياء الأمور 📲" : "Parent Reporting Center 📲"}
        sub={isRtl ? "توليد وإرسال حصاد اليوم القرآني والأكاديمي عبر الواتساب" : "Generate and send daily Quranic results via WhatsApp"}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.surface, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}` }}>
            <Calendar size={16} style={{ color: C.primary }} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            />
          </div>
        }
      />

      {/* 2. بطاقات الإحصائيات السريعة (KPI Mini-Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <Card style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: `${C.primary}15`, color: C.primary }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: C.textSub, display: 'block' }}>{isRtl ? "إجمالي الطلاب اليوم" : "Total Students Today"}</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: C.text }}>{totalCount}</span>
          </div>
        </Card>

        <Card style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: `${C.success}15`, color: C.success }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: C.textSub, display: 'block' }}>{isRtl ? "نسبة الإرسال" : "Sent Progress"}</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: C.success }}>{completionPercentage}% ({sentCount})</span>
          </div>
        </Card>

        <Card style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: `${C.warning || '#f59e0b'}15`, color: C.warning || '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: C.textSub, display: 'block' }}>{isRtl ? "المتبقي للإرسال" : "Remaining"}</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: C.text }}>{remainingCount}</span>
          </div>
        </Card>
      </div>

      {/* 3. تخصيص محرر القالب والمعاينة المباشرة للواتساب */}
      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 340px' : '1fr', gap: '16px', marginBottom: '20px' }}>
        
        {/* محرر القالب */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.primary, fontWeight: 700, fontSize: '14px' }}>
              <Sparkles size={18} />
              <span>{isRtl ? "محرر قوالب التقارير الذكي" : "Smart Report Template Editor"}</span>
            </div>
            <Btn onClick={() => setShowPreview(!showPreview)} variant="ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
              <Smartphone size={14} /> {showPreview ? (isRtl ? "إخفاء المعاينة" : "Hide Preview") : (isRtl ? "معاينة الواتساب" : "WhatsApp Preview")}
            </Btn>
          </div>

          <textarea 
            ref={textareaRef}
            rows={5}
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            style={{ 
              width: '100%', 
              background: C.surface, 
              border: `1px solid ${C.border}`, 
              color: C.text, 
              borderRadius: '10px', 
              padding: '12px', 
              fontSize: '13px', 
              outline: 'none', 
              resize: 'vertical', 
              lineHeight: '1.6', 
              boxSizing: 'border-box' 
            }}
          />

          {/* متغيرات تفاعلية تُحقن عند موقع المؤشر */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
            {['[اسم_الطالب]', '[التاريخ]', '[الحالة]', '[الحفظ]', '[المراجعة]', '[الماضي]', '[التقييم]', '[الملاحظات]'].map(tag => (
              <Badge key={tag} onClick={() => insertTagAtCursor(tag)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                + {tag}
              </Badge>
            ))}
          </div>
        </Card>

        {/* محاكي المعاينة المباشرة للواتساب (Live WhatsApp Mockup) */}
        {showPreview && (
          <Card style={{ background: '#0b141a', borderColor: '#222d34', color: '#e9edef', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #222d34', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366' }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#8696a0' }}>
                {isRtl ? "معاينة الرسالة الحية للولي الأمر" : "Live Parent WhatsApp Preview"}
              </span>
            </div>
            
            <div style={{ 
              background: '#005c4b', 
              borderRadius: '8px', 
              padding: '12px', 
              fontSize: '12px', 
              lineHeight: '1.6', 
              whiteSpace: 'pre-wrap', 
              boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
              color: '#e9edef',
              flex: 1
            }}>
              {previewText}
            </div>
          </Card>
        )}
      </div>

      {/* 4. البحث والتصفية */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input 
            type="text"
            placeholder={isRtl ? "بحث باسم الطالب أو رقم الهاتف..." : "Search by student name or phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn onClick={() => setActiveTab('all')} variant={activeTab === 'all' ? "primary" : "ghost"}>
            <Users size={14} /> {isRtl ? "الكل" : "All"} ({students.length})
          </Btn>
          <Btn onClick={() => setActiveTab('unsent')} variant={activeTab === 'unsent' ? "primary" : "ghost"}>
            <Clock size={14} /> {isRtl ? "غير مرسل" : "Unsent"} ({remainingCount})
          </Btn>
          <Btn onClick={() => setActiveTab('present')} variant={activeTab === 'present' ? "primary" : "ghost"}>
            <UserCheck size={14} /> {isRtl ? "الحاضرون" : "Present"}
          </Btn>
          <Btn onClick={() => setActiveTab('absent')} variant={activeTab === 'absent' ? "primary" : "ghost"}>
            <UserX size={14} /> {isRtl ? "الغائبون" : "Absent"}
          </Btn>
        </div>
      </div>

      {/* 5. قائمة الطلاب والتقارير */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.textSub }}>
          <Loader2 size={24} className="spin-icon" style={{ margin: '0 auto 10px auto', display: 'block' }} />
          <span>{isRtl ? "جاري جلب بيانات التقارير من السحابة..." : "Fetching live report data..."}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredStudents.length === 0 ? (
            <Card style={{ textAlign: 'center', color: C.textSub, padding: '24px' }}>
              <AlertCircle size={24} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
              {isRtl ? "لا يوجد طلاب يطابقون خيار التصفية والبحث حالياً." : "No students match current search or filter."}
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
                    flexWrap: 'wrap',
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: '14px',
                    opacity: isSent ? 0.75 : 1,
                    padding: '14px 16px',
                    borderRight: isRtl && isSent ? `4px solid ${C.success}` : undefined,
                    borderLeft: !isRtl && isSent ? `4px solid ${C.success}` : undefined,
                  }}
                >
                  <div style={{ textAlign: isRtl ? 'right' : 'left', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: C.text }}>{studentName}</span>
                      {isSent && (
                        <Badge color={C.success}>
                          <CheckCircle2 size={12}/> {isRtl ? "تم الإرسال" : "Sent"}
                        </Badge>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: C.textSub }}>
                      {isRtl ? "الهاتف:" : "Phone:"} <span style={{ color: C.text }}>{parentPhone || (isRtl ? 'غير مسجل' : 'N/A')}</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: C.textSub, flexWrap: 'wrap' }}>
                    <div>{isRtl ? "حفظ:" : "Memorization:"} <span style={{ color: C.text, fontWeight: '600' }}>{safeString(record?.new_memorization || record?.memorization) || '---'}</span></div>
                    <div>{isRtl ? "مراجعة:" : "Revision:"} <span style={{ color: C.text, fontWeight: '600' }}>{safeString(record?.review || record?.retention_assignment || record?.revision) || '---'}</span></div>
                    <div>{isRtl ? "تقييم:" : "Grade:"} <span style={{ color: C.primary, fontWeight: '700' }}>{safeString(record?.session_grade) || '---'}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {isSent && (
                      <Btn onClick={() => resetSentLog(student.id)} variant="ghost" style={{ padding: '8px' }} title={isRtl ? "إعادة تعيين" : "Reset"}>
                        <RotateCcw size={14} />
                      </Btn>
                    )}

                    <Btn 
                      onClick={() => handleCopyToClipboard(student, record)} 
                      variant={copiedId === student.id ? "success" : "ghost"}
                      style={{ padding: '8px 12px' }}
                    >
                      {copiedId === student.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === student.id && <span style={{ fontSize: '10px', marginRight: '4px', marginLeft: '4px' }}>{isRtl ? "نسخ!" : "Copied!"}</span>}
                    </Btn>
                    
                    <a 
                      href={generateWhatsAppLink(student, record)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => markAsSentInDB(student.id, messageText)}
                      style={{ textDecoration: 'none' }}
                    >
                      <Btn variant={isSent ? "secondary" : "success"}>
                        <Send size={15} /> 
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
