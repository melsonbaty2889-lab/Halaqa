// src/components/Reports.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import ReportDateSelector from './UI/ReportDateSelector';
import { 
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
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sliders,
  Edit3
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
  
  // التحكم في ظهور المحرر والمعاينة (طي افتراضي لتوفير المساحة)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const defaultTemplate = useMemo(() => {
    return isRtl 
      ? `السلام عليكم ورحمة الله وبركاته، تحية طيبة من أسرَة الحلقة الذكية. 🌸\n\nنود إطلاعكم على تقرير أداء الابن(ة) *[اسم_الطالب]* ليوم [التاريخ]:\n\n📌 الحالة: [الحالة]\n📖 الحفظ الجديد: [الحفظ]\n🔄 المراجعة القريبة: [المراجعة]\n📚 المراجعة البعيدة: [الماضي]\n🌟 التقييم اليومي: [التقييم]\n📝 ملاحظات الحلقة: [الملاحظات]\n\n( خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ ) 🤲✨`
      : `Peace be upon you. Warm greetings from Smart Halaqa. 🌸\n\nDaily report for *[اسم_الطالب]* on [التاريخ]:\n\n📌 Status: [الحالة]\n📖 New Memorization: [الحفظ]\n🔄 Revision: [المراجعة]\n📚 Distant Revision: [الماضي]\n🌟 Daily Grade: [التقييم]\n📝 Notes: [الملاحظات]\n\nMay Allah bless their journey. 🤲✨`;
  }, [isRtl]);

  const [messageTemplate, setMessageTemplate] = useState(defaultTemplate);

  useEffect(() => {
    setMessageTemplate(defaultTemplate);
  }, [defaultTemplate]);

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
  }, [academyId]);

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

  const sampleStudent = students[0] || { id: 'demo', name: isRtl ? 'عاصم محمد السنباطي' : 'Student Name', parent_phone: '01000000000' };
  const sampleRecord = reportsData[sampleStudent.id] || {};
  const previewText = getParsedMessage(sampleStudent, sampleRecord);

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', width: '100%', boxSizing: 'border-box', padding: '14px 10px', background: '#0a0f1d', minHeight: '100vh', color: '#f8fafc' }}>
      
      {/* 1. الترويسة الرئيسية */}
      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(245, 158, 11, 0.4)'
            }}>
              <BookOpen size={18} style={{ color: '#f59e0b' }} />
            </div>

            <div>
              <h1 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                {isRtl ? "تقارير الحلقة الذكية" : "Smart Halaqa Reports"}
              </h1>
              <p style={{ fontSize: '10.5px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {isRtl ? "إرسال النتائج القرآنية عبر الواتساب بهوية رسمية" : "Send Quranic achievements via WhatsApp"}
              </p>
            </div>
          </div>

          <ReportDateSelector 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
          />
        </div>
      </div>

      {/* 2. بطاقات الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: '#111c2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '8px 6px', textAlign: 'center' }}>
          <Users size={15} style={{ color: '#10b981', marginBottom: '2px' }} />
          <span style={{ fontSize: '9.5px', color: '#94a3b8', display: 'block' }}>{isRtl ? "الإجمالي" : "Total"}</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>{totalCount}</span>
        </div>

        <div style={{ background: '#111c2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '8px 6px', textAlign: 'center' }}>
          <TrendingUp size={15} style={{ color: '#22c55e', marginBottom: '2px' }} />
          <span style={{ fontSize: '9.5px', color: '#94a3b8', display: 'block' }}>{isRtl ? "المرسل" : "Sent"}</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#22c55e' }}>{completionPercentage}%</span>
        </div>

        <div style={{ background: '#111c2e', border: '1px solid #1e293b', borderRadius: '12px', padding: '8px 6px', textAlign: 'center' }}>
          <Clock size={15} style={{ color: '#f59e0b', marginBottom: '2px' }} />
          <span style={{ fontSize: '9.5px', color: '#94a3b8', display: 'block' }}>{isRtl ? "المتبقي" : "Remaining"}</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b' }}>{remainingCount}</span>
        </div>
      </div>

      {/* 3. محرر القوالب القابل للطي (Collapsible Template Editor) */}
      <div style={{ background: '#111c2e', border: '1px solid #1e293b', borderRadius: '12px', marginBottom: '14px', overflow: 'hidden' }}>
        
        {/* شريط التحكم القابل للضغط */}
        <div 
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          style={{ 
            padding: '10px 12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            background: isEditorOpen ? '#16233b' : 'transparent',
            transition: 'background 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
              {isRtl ? "إعدادات قالب الرسالة" : "Template Settings"}
            </span>
            {!isEditorOpen && (
              <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                {isRtl ? "اضغط للتعديل" : "Click to edit"}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditorOpen && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(!showPreview);
                }} 
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Smartphone size={11} /> {showPreview ? (isRtl ? "إخفاء المعاينة" : "Hide") : (isRtl ? "المعاينة" : "Preview")}
              </button>
            )}
            {isEditorOpen ? <ChevronUp size={16} style={{ color: '#94a3b8' }} /> : <ChevronDown size={16} style={{ color: '#94a3b8' }} />}
          </div>
        </div>

        {/* جسم المحرر والمعاينة (يظهر فقط عند الفتح) */}
        {isEditorOpen && (
          <div style={{ padding: '12px', borderTop: '1px solid #1e293b', background: '#0b1320' }}>
            <textarea 
              ref={textareaRef}
              rows={4}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              dir="auto"
              style={{ 
                width: '100%', 
                background: '#111c2e', 
                border: '1px solid #1e293b', 
                color: '#f8fafc', 
                borderRadius: '8px', 
                padding: '10px', 
                fontSize: '11.5px', 
                outline: 'none', 
                resize: 'vertical', 
                lineHeight: '1.5',
                boxSizing: 'border-box'
              }}
            />

            {/* شريط الأوسمة */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {['[اسم_الطالب]', '[التاريخ]', '[الحالة]', '[الحفظ]', '[المراجعة]', '[الماضي]', '[التقييم]', '[الملاحظات]'].map(tag => (
                <span 
                  key={tag} 
                  onClick={() => insertTagAtCursor(tag)} 
                  style={{ cursor: 'pointer', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: '600' }}
                >
                  + {tag}
                </span>
              ))}
            </div>

            {/* المعاينة المباشرة */}
            {showPreview && (
              <div style={{ marginTop: '12px', background: '#111c2e', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <MessageSquare size={13} style={{ color: '#22c55e' }} />
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8' }}>
                    {isRtl ? "معاينة الرسالة الحية" : "Live Preview"}
                  </span>
                </div>
                
                <div 
                  dir="auto"
                  style={{ 
                    background: '#0b141a', 
                    border: '1px solid #1f2c34', 
                    borderRadius: '6px', 
                    padding: '8px 10px', 
                    fontSize: '11px', 
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
        )}
      </div>

      {/* 4. البحث والتصفية */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        <input 
          type="text"
          placeholder={isRtl ? "بحث باسم الطالب أو رقم الهاتف..." : "Search student..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', background: '#111c2e', border: '1px solid #1e293b', color: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
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
                  background: isActive ? '#10b981' : '#111c2e',
                  color: isActive ? '#0a0f1d' : '#94a3b8',
                  border: '1px solid #1e293b',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
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

      {/* 5. بطاقات الطلاب */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#10b981' }}>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: '#111c2e', borderRadius: '10px', border: '1px solid #1e293b', color: '#94a3b8', fontSize: '12px' }}>
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
                    background: '#111c2e', 
                    border: `1px solid ${isSent ? '#22c55e40' : '#1e293b'}`, 
                    borderRadius: '12px', 
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#ffffff' }}>{studentName}</span>
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#0b1320', padding: '6px', borderRadius: '8px', textAlign: 'center', fontSize: '10px' }}>
                    <div><span style={{ color: '#94a3b8', display: 'block' }}>{isRtl ? "حفظ" : "Mem"}</span><span style={{ color: '#ffffff', fontWeight: '600' }}>{safeString(record?.new_memorization) || '---'}</span></div>
                    <div><span style={{ color: '#94a3b8', display: 'block' }}>{isRtl ? "مراجعة" : "Rev"}</span><span style={{ color: '#ffffff', fontWeight: '600' }}>{safeString(record?.review) || '---'}</span></div>
                    <div><span style={{ color: '#94a3b8', display: 'block' }}>{isRtl ? "تقييم" : "Grade"}</span><span style={{ color: '#f59e0b', fontWeight: '700' }}>{safeString(record?.session_grade) || '---'}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleCopyToClipboard(student, record)}
                      style={{ background: '#1e293b', border: 'none', color: '#ffffff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                      <button style={{ 
                        width: '100%', 
                        background: isSent ? '#1e293b' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', 
                        color: isSent ? '#94a3b8' : '#0a0f1d', 
                        border: 'none', 
                        padding: '7px 10px', 
                        borderRadius: '6px', 
                        fontWeight: '800', 
                        fontSize: '11px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '6px', 
                        cursor: 'pointer',
                        boxShadow: isSent ? 'none' : '0 2px 10px rgba(245, 158, 11, 0.2)'
                      }}>
                        <Send size={12} />
                        {isSent ? (isRtl ? "إعادة إرسال" : "Resend") : (isRtl ? "إرسال عبر الواتساب" : "Send WhatsApp")}
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
