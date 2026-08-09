// src/components/Reports.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
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
  MessageSquare
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
          if (rec.is_sent) logsMap[rec.student_id] = true;
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
      await supabase.from('notification_logs').insert([{
        academy_id: academyId,
        recipient_user_id: studentId,
        channel_used: 'whatsapp',
        status: 'sent',
        sent_text: reportText,
        template_id: templateId
      }]);
    } catch (err) {
      console.error("Error logging notification:", err);
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

    let parsed = messageTemplate;
    parsed = parsed.replace(/\[اسم_الطالب\]/g, studentName || (isRtl ? "عاصم محمد السنباطي" : "Student Name"));
    parsed = parsed.replace(/\[التاريخ\]/g, selectedDate);
    parsed = parsed.replace(/\[الحالة\]/g, getStatusText());
    parsed = parsed.replace(/\[الحفظ\]/g, safeString(record?.new_memorization) || (statusVal === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')));
    parsed = parsed.replace(/\[المراجعة\]/g, safeString(record?.review) || '---');
    parsed = parsed.replace(/\[الماضي\]/g, '---');
    parsed = parsed.replace(/\[التقييم\]/g, getGradeText());
    parsed = parsed.replace(/\[الملاحظات\]/g, safeString(record?.session_notes) || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.'));

    return parsed;
  }, [messageTemplate, selectedDate, isRtl, safeString]);

  const generateWhatsAppLink = (student, record) => {
    const parsedMessage = getParsedMessage(student, record);
    let phone = safeString(student?.parent_phone || student?.phone || record?.parent_phone);
    phone = phone.replace(/\s+/g, '').replace(/[+\-]/g, '');
    if (phone.startsWith('01') && phone.length === 11) phone = '20' + phone;
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
    setMessageTemplate(text.substring(0, start) + tag + text.substring(end));
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
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', width: '100%', boxSizing: 'border-box', padding: '12px 8px' }}>
      
      {/* 1. ترويسة رئيسية عصرية ومتجاوبة مع الجوال */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', margin: 0, lineHeight: '1.3' }}>
              {isRtl ? "مركز تقارير أولياء الأمور" : "Parent Reporting Center"}
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              {isRtl ? "توليد وإرسال حصاد اليوم القرآني والأكاديمي عبر الواتساب" : "Generate and send daily Quranic results via WhatsApp"}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '6px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
            <Calendar size={14} style={{ color: '#38bdf8' }} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
            />
          </div>
        </div>
      </div>

      {/* 2. كروت الإحصائيات - منظم بشكل أفقي ممتاز للشاشات الصغيرة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <Users size={16} style={{ color: '#38bdf8', marginBottom: '4px' }} />
          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{isRtl ? "الجمالي" : "Total"}</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc' }}>{totalCount}</span>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <TrendingUp size={16} style={{ color: '#22c55e', marginBottom: '4px' }} />
          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{isRtl ? "المرسل" : "Sent"}</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#22c55e' }}>{completionPercentage}%</span>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <Clock size={16} style={{ color: '#f59e0b', marginBottom: '4px' }} />
          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{isRtl ? "المتبقي" : "Remaining"}</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b' }}>{remainingCount}</span>
        </div>
      </div>

      {/* 3. محرر القوالب والمعاينة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        
        {/* صندوق التعديل */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: '700', fontSize: '12px' }}>
              <Sparkles size={14} />
              <span>{isRtl ? "محرر القوالب" : "Template Editor"}</span>
            </div>
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              style={{ background: '#334155', border: 'none', color: '#f8fafc', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <Smartphone size={12} /> {showPreview ? (isRtl ? "إخفاء" : "Hide") : (isRtl ? "معاينة" : "Preview")}
            </button>
          </div>

          <textarea 
            ref={textareaRef}
            rows={5}
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            style={{ 
              width: '100%', 
              background: '#0f172a', 
              border: '1px solid #334155', 
              color: '#f8fafc', 
              borderRadius: '8px', 
              padding: '8px', 
              fontSize: '12px', 
              outline: 'none', 
              resize: 'vertical', 
              lineHeight: '1.5',
              boxSizing: 'border-box'
            }}
          />

          {/* الوسوم التفاف مرن */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {['[اسم_الطالب]', '[التاريخ]', '[الحالة]', '[الحفظ]', '[المراجعة]', '[الماضي]', '[التقييم]', '[الملاحظات]'].map(tag => (
              <span 
                key={tag} 
                onClick={() => insertTagAtCursor(tag)} 
                style={{ cursor: 'pointer', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}
              >
                + {tag}
              </span>
            ))}
          </div>
        </div>

        {/* المعاينة الحية بتنسيق فقرة واتساب حقيقية */}
        {showPreview && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
              <MessageSquare size={14} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>
                {isRtl ? "معاينة رسالة الواتساب" : "WhatsApp Live Preview"}
              </span>
            </div>
            
            <div 
              dir="auto"
              style={{ 
                background: '#0b141a', 
                border: '1px solid #1f2c34', 
                borderRadius: '8px', 
                padding: '10px', 
                fontSize: '11.5px', 
                lineHeight: '1.5', 
                whiteSpace: 'pre-wrap', 
                color: '#e9edef',
                textAlign: isRtl ? 'right' : 'left'
              }}
            >
              {previewText}
            </div>
          </div>
        )}
      </div>

      {/* 4. البحث وفلترة القائمة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        <input 
          type="text"
          placeholder={isRtl ? "بحث باسم الطالب..." : "Search student..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: isRtl ? "الكل" : "All", icon: Users },
            { id: 'unsent', label: isRtl ? "غير مرسل" : "Unsent", icon: Clock },
            { id: 'present', label: isRtl ? "حاضر" : "Present", icon: UserCheck },
            { id: 'absent', label: isRtl ? "غائب" : "Absent", icon: UserX }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isActive ? '#38bdf8' : '#1e293b',
                  color: isActive ? '#0f172a' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. قائمة الطلاب كروت مرتبة */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ textAlignment: 'center', padding: '20px', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#94a3b8', fontSize: '12px' }}>
              <AlertCircle size={16} style={{ display: 'block', margin: '0 auto 4px auto' }} />
              {isRtl ? "لا يوجد طلاب يطابقون خيار البحث." : "No matching students found."}
            </div>
          ) : (
            filteredStudents.map(student => {
              const record = reportsData[student.id];
              const isSent = !!sentLogs[student.id];
              const studentName = safeString(student?.name || student?.student_name);
              const parentPhone = safeString(student?.parent_phone || student?.phone || record?.parent_phone);

              return (
                <div 
                  key={student.id} 
                  style={{ 
                    background: '#1e293b', 
                    border: `1px solid ${isSent ? '#22c55e40' : '#334155'}`, 
                    borderRadius: '10px', 
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#f8fafc' }}>{studentName}</span>
                        {isSent && (
                          <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 size={9} /> {isRtl ? "تم الإرسال" : "Sent"}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: parentPhone ? '#94a3b8' : '#ef4444' }}>
                        {parentPhone || (isRtl ? 'الهاتف غير مسجل' : 'No Phone')}
                      </span>
                    </div>

                    {isSent && (
                      <button onClick={() => resetSentLog(student.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>

                  {/* تفاصيل الدرجات والتسميع */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#0f172a', padding: '6px', borderRadius: '6px', textAlign: 'center', fontSize: '10px' }}>
                    <div><span style={{ color: '#94a3b8', display: 'block' }}>{isRtl ? "حفظ" : "Mem"}</span><span style={{ color: '#f8fafc', fontWeight: '600' }}>{safeString(record?.new_memorization) || '---'}</span></div>
                    <div><span style={{ color: '#94a3b8', display: 'block' }}>{isRtl ? "مراجعة" : "Rev"}</span><span style={{ color: '#f8fafc', fontWeight: '600' }}>{safeString(record?.review) || '---'}</span></div>
                    <div><span style={{ color: '#94a3b8', display: 'block' }}>{isRtl ? "تقييم" : "Grade"}</span><span style={{ color: '#38bdf8', fontWeight: '700' }}>{safeString(record?.session_grade) || '---'}</span></div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleCopyToClipboard(student, record)}
                      style={{ background: '#334155', border: 'none', color: '#f8fafc', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {copiedId === student.id ? <Check size={13} style={{ color: '#22c55e' }} /> : <Copy size={13} />}
                    </button>

                    <a 
                      href={generateWhatsAppLink(student, record)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => markAsSentInDB(student.id, getParsedMessage(student, record))}
                      style={{ textDecoration: 'none', flex: 1 }}
                    >
                      <button style={{ width: '100%', background: isSent ? '#334155' : '#22c55e', color: isSent ? '#94a3b8' : '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
                        <Send size={12} />
                        {isSent ? (isRtl ? "إعادة إرسال" : "Resend") : (isRtl ? "إرسال الواتساب" : "Send WhatsApp")}
                      </button>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
