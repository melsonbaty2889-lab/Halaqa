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
  BookOpen,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Edit,
  Save,
  X,
  SendHorizontal,
  PartyPopper
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
      return val[currentLang] || val.ar || val.en || Object.values(val).find(v => typeof v === 'string') || '';
    }
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
  
  const [isEditorOpen, setIsEditorOpen] = useState(() => {
    return localStorage.getItem('reports_editor_open') === 'true';
  });
  const [showPreview, setShowPreview] = useState(false);

  const [editingPhoneStudentId, setEditingPhoneStudentId] = useState(null);
  const [tempPhoneValue, setTempPhoneValue] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [localPhoneMap, setLocalPhoneMap] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const toggleEditor = () => {
    setIsEditorOpen(prev => {
      const nextState = !prev;
      localStorage.setItem('reports_editor_open', String(nextState));
      return nextState;
    });
  };

  const dynamicTags = useMemo(() => {
    if (isRtl) {
      return [
        { label: '+ [اسم_الطالب]', tag: '[اسم_الطالب]' },
        { label: '+ [التاريخ]', tag: '[التاريخ]' },
        { label: '+ [الحالة]', tag: '[الحالة]' },
        { label: '+ [الحفظ]', tag: '[الحفظ]' },
        { label: '+ [المراجعة]', tag: '[المراجعة]' },
        { label: '+ [الماضي]', tag: '[الماضي]' },
        { label: '+ [التقييم]', tag: '[التقييم]' },
        { label: '+ [الملاحظات]', tag: '[الملاحظات]' },
      ];
    }
    return [
      { label: '+ [Student_Name]', tag: '[Student_Name]' },
      { label: '+ [Date]', tag: '[Date]' },
      { label: '+ [Status]', tag: '[Status]' },
      { label: '+ [Memorization]', tag: '[Memorization]' },
      { label: '+ [Revision]', tag: '[Revision]' },
      { label: '+ [Distant_Revision]', tag: '[Distant_Revision]' },
      { label: '+ [Grade]', tag: '[Grade]' },
      { label: '+ [Notes]', tag: '[Notes]' },
    ];
  }, [isRtl]);

  const defaultTemplate = useMemo(() => {
    return isRtl 
      ? `السلام عليكم ورحمة الله وبركاته، تحية طيبة من أكاديميتنا. 🌸\n\nنود إطلاعكم على تقرير أداء الابن(ة) *[اسم_الطالب]* ليوم [التاريخ]:\n\n📌 الحالة: [الحالة]\n📖 الحفظ الجديد: [الحفظ]\n🔄 المراجعة القريبة: [المراجعة]\n📚 المراجعة البعيدة: [الماضي]\n🌟 التقييم اليومي: [التقييم]\n📝 ملاحظات الحلقة: [الملاحظات]\n\nنسأل الله أن يبارك فيه وينبته نباتاً حسناً. 🤲✨`
      : `Peace be upon you. Warm greetings from our academy. 🌸\n\nDaily performance report for *[Student_Name]* on [Date]:\n\n📌 Status: [Status]\n📖 New Memorization: [Memorization]\n🔄 Revision: [Revision]\n📚 Distant Revision: [Distant_Revision]\n🌟 Daily Grade: [Grade]\n📝 Class Notes: [Notes]\n\nMay Allah bless their journey. 🤲✨`;
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

  const handleSavePhone = async (studentId) => {
    if (!tempPhoneValue.trim()) return;
    setSavingPhone(true);

    try {
      const { error } = await supabase
        .from('students')
        .update({ parent_phone: tempPhoneValue.trim() })
        .eq('id', studentId);

      if (error) throw error;

      setLocalPhoneMap(prev => ({ ...prev, [studentId]: tempPhoneValue.trim() }));
      setEditingPhoneStudentId(null);
      setTempPhoneValue('');
      showToast(isRtl ? "تم حفظ الرقم بنجاح" : "Phone saved successfully");
    } catch (err) {
      console.error("Failed to update phone:", err);
      alert(isRtl ? "حدث خطأ أثناء حفظ الرقم" : "Error saving phone number");
    } finally {
      setSavingPhone(false);
    }
  };

  const formattedDateString = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const d = new Date(selectedDate);
      return d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  }, [selectedDate, isRtl]);

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
      return isRtl ? 'ضعيف ⚠️' : 'Needs Improvement ⚠️';
    };

    let parsed = messageTemplate;
    
    parsed = parsed.replace(/\[اسم_الطالب\]|\[Student_Name\]/g, studentName || (isRtl ? "اسم الطالب" : "Student Name"));
    parsed = parsed.replace(/\[التاريخ\]|\[Date\]/g, formattedDateString);
    parsed = parsed.replace(/\[الحالة\]|\[Status\]/g, getStatusText());
    parsed = parsed.replace(/\[الحفظ\]|\[Memorization\]/g, safeString(record?.new_memorization) || (statusVal === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')));
    parsed = parsed.replace(/\[المراجعة\]|\[Revision\]/g, safeString(record?.review) || '---');
    parsed = parsed.replace(/\[الماضي\]|\[Distant_Revision\]/g, '---');
    parsed = parsed.replace(/\[التقييم\]|\[Grade\]/g, getGradeText());
    parsed = parsed.replace(/\[الملاحظات\]|\[Notes\]/g, safeString(record?.session_notes) || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.'));

    return parsed;
  }, [messageTemplate, formattedDateString, isRtl, safeString]);

  const generateWhatsAppLink = (student, record) => {
    const parsedMessage = getParsedMessage(student, record);
    let phone = localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone || record?.parent_phone);
    phone = phone.replace(/\s+/g, '').replace(/[+\-]/g, '');
    if (phone.startsWith('01') && phone.length === 11) phone = '20' + phone;
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(parsedMessage)}`;
  };

  const handleCopyToClipboard = (student, record) => {
    const text = getParsedMessage(student, record);
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    markAsSentInDB(student.id, text);
    showToast(isRtl ? "تم نسخ التقرير بنجاح" : "Report copied to clipboard");
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
    const link = generateWhatsAppLink(nextStudent, rec);
    markAsSentInDB(nextStudent.id, getParsedMessage(nextStudent, rec));
    window.open(link, '_blank');
  };

  const totalCount = students.length;
  const sentCount = Object.keys(sentLogs).length;
  const remainingCount = Math.max(0, totalCount - sentCount);
  const completionPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  const sampleStudent = students[0] || { id: 'demo', name: isRtl ? 'عاصم محمد مصطفى السنباطي' : 'Student Name', parent_phone: '01000000000' };
  const sampleRecord = reportsData[sampleStudent.id] || {};
  const previewText = getParsedMessage(sampleStudent, sampleRecord);

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', width: '100%', boxSizing: 'border-box', padding: '16px 12px', background: '#090d16', minHeight: '100vh', color: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: '#090d16',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* 1. Header Area */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}>
            <BookOpen size={18} style={{ color: '#10b981' }} />
          </div>

          <div>
            <h1 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              {isRtl ? "تقارير الحلقة الذكية" : "Smart Halaqa Reports"}
            </h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
              {isRtl ? "إرسال النتائج عبر الواتساب" : "Send achievements via WhatsApp"}
            </p>
          </div>
        </div>

        <ReportDateSelector 
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate} 
        />
      </div>

      {/* 2. Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '500' }}>{isRtl ? "الإجمالي" : "Total"}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginTop: '2px', display: 'block' }}>{totalCount}</span>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '500' }}>{isRtl ? "المرسل" : "Sent"}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', marginTop: '2px', display: 'block' }}>{completionPercentage}%</span>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: '500' }}>{isRtl ? "المتبقي" : "Remaining"}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#f59e0b', marginTop: '2px', display: 'block' }}>{remainingCount}</span>
        </div>
      </div>

      {/* Batch Send Button */}
      {unsentStudents.length > 0 && (
        <button
          onClick={handleBulkSendNext}
          style={{
            width: '100%',
            marginBottom: '14px',
            background: '#10b981',
            color: '#090d16',
            border: 'none',
            padding: '9px 12px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <SendHorizontal size={15} />
          {isRtl ? `بدء الإرسال المتتابع للمتبقين (${unsentStudents.length})` : `Batch Send Unsent (${unsentStudents.length})`}
        </button>
      )}

      {/* 3. Collapsible Template Editor */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', marginBottom: '14px', overflow: 'hidden' }}>
        <div 
          onClick={toggleEditor}
          style={{ 
            padding: '10px 12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            background: isEditorOpen ? '#1e293b50' : 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc' }}>
              {isRtl ? "إعدادات القالب" : "Template Settings"}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditorOpen && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(!showPreview);
                }} 
                style={{ background: '#1e293b', border: 'none', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Smartphone size={11} /> {showPreview ? (isRtl ? "إخفاء" : "Hide") : (isRtl ? "المعاينة" : "Preview")}
              </button>
            )}
            {isEditorOpen ? <ChevronUp size={15} style={{ color: '#64748b' }} /> : <ChevronDown size={15} style={{ color: '#64748b' }} />}
          </div>
        </div>

        {isEditorOpen && (
          <div style={{ padding: '12px', borderTop: '1px solid #1e293b', background: '#090d16' }}>
            <textarea 
              ref={textareaRef}
              rows={4}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              dir="auto"
              style={{ 
                width: '100%', 
                background: '#0f172a', 
                border: '1px solid #1e293b', 
                color: '#f8fafc', 
                borderRadius: '6px', 
                padding: '8px 10px', 
                fontSize: '11px', 
                outline: 'none', 
                resize: 'none', 
                lineHeight: '1.5',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {dynamicTags.map(item => (
                <span 
                  key={item.tag} 
                  onClick={() => insertTagAtCursor(item.tag)} 
                  style={{ 
                    cursor: 'pointer', 
                    background: 'rgba(16, 185, 129, 0.08)', 
                    color: '#10b981', 
                    border: '1px solid rgba(16, 185, 129, 0.2)', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            {showPreview && (
              <div style={{ marginTop: '10px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#64748b' }}>
                    {isRtl ? "معاينة الرسالة" : "Live Preview"}
                  </span>
                </div>
                
                <div 
                  dir="auto"
                  style={{ 
                    background: '#070a12', 
                    border: '1px solid #1e293b', 
                    borderRadius: '6px', 
                    padding: '8px', 
                    fontSize: '11px', 
                    lineHeight: '1.5', 
                    whiteSpace: 'pre-wrap', 
                    color: '#cbd5e1'
                  }}
                >
                  {previewText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        <input 
          type="text"
          placeholder={isRtl ? "بحث باسم الطالب أو الرقم..." : "Search student or phone..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px', outline: 'none', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {[
            { id: 'all', label: isRtl ? "الكل" : "All", icon: Users },
            { id: 'unsent', label: isRtl ? "غير مرسل" : "Unsent", icon: RotateCcw },
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
                  background: isActive ? '#10b981' : '#0f172a',
                  color: isActive ? '#090d16' : '#94a3b8',
                  border: '1px solid #1e293b',
                  padding: '5px 10px',
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

      {/* 5. Student List or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#10b981' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', color: '#94a3b8' }}>
              {activeTab === 'unsent' && sentCount > 0 && remainingCount === 0 ? (
                <>
                  <PartyPopper size={22} style={{ color: '#10b981', display: 'block', margin: '0 auto 6px auto' }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block' }}>
                    {isRtl ? "تم إرسال جميع تقارير اليوم بنجاح! 🎉" : "All daily reports sent successfully! 🎉"}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '11px' }}>
                  {isRtl ? "لا يوجد نتائج مطابقة." : "No matching records found."}
                </span>
              )}
            </div>
          ) : (
            filteredStudents.map(student => {
              const record = reportsData[student.id];
              const isSent = !!sentLogs[student.id];
              const studentName = safeString(student?.name || student?.student_name);
              const parentPhone = localPhoneMap[student.id] || safeString(student?.parent_phone || student?.phone || record?.parent_phone);
              const isEditingThisPhone = editingPhoneStudentId === student.id;

              return (
                <div 
                  key={student.id} 
                  style={{ 
                    background: '#0f172a', 
                    border: `1px solid ${isSent ? 'rgba(16, 185, 129, 0.25)' : '#1e293b'}`, 
                    borderRadius: '8px', 
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', fontSize: '12px', color: '#ffffff' }}>{studentName}</span>
                        {isSent && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 size={9} /> {isRtl ? "مرسل" : "Sent"}
                          </span>
                        )}
                      </div>

                      {isEditingThisPhone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <input 
                            type="tel"
                            placeholder="010xxxxxxx"
                            value={tempPhoneValue}
                            onChange={(e) => setTempPhoneValue(e.target.value)}
                            autoFocus
                            style={{ 
                              background: '#090d16', 
                              border: '1px solid #10b981', 
                              color: '#ffffff', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '11px', 
                              outline: 'none', 
                              width: '120px' 
                            }}
                          />
                          <button 
                            onClick={() => handleSavePhone(student.id)} 
                            disabled={savingPhone}
                            style={{ background: '#10b981', border: 'none', color: '#090d16', padding: '3px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                          >
                            {savingPhone ? <Loader2 size={9} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={9} />}
                            {isRtl ? "حفظ" : "Save"}
                          </button>
                          <button 
                            onClick={() => setEditingPhoneStudentId(null)} 
                            style={{ background: '#1e293b', border: 'none', color: '#94a3b8', padding: '3px 5px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '10px', color: parentPhone ? '#64748b' : '#f59e0b' }}>
                            {parentPhone || (isRtl ? 'لا يوجد رقم' : 'No Phone')}
                          </span>
                          <button 
                            onClick={() => {
                              setEditingPhoneStudentId(student.id);
                              setTempPhoneValue(parentPhone || '');
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#f59e0b', padding: 0, fontSize: '9px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                          >
                            <Edit size={8} />
                            {parentPhone ? (isRtl ? "تعديل" : "Edit") : (isRtl ? "+ إضافة" : "+ Add")}
                          </button>
                        </div>
                      )}
                    </div>

                    {isSent && (
                      <button onClick={() => resetSentLog(student.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}>
                        <RotateCcw size={11} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#090d16', padding: '5px 8px', borderRadius: '6px', textAlign: 'center', fontSize: '10px' }}>
                    <div><span style={{ color: '#64748b', display: 'block' }}>{isRtl ? "حفظ" : "Mem"}</span><span style={{ color: '#f8fafc', fontWeight: '500' }}>{safeString(record?.new_memorization) || '---'}</span></div>
                    <div><span style={{ color: '#64748b', display: 'block' }}>{isRtl ? "مراجعة" : "Rev"}</span><span style={{ color: '#f8fafc', fontWeight: '500' }}>{safeString(record?.review) || '---'}</span></div>
                    <div><span style={{ color: '#64748b', display: 'block' }}>{isRtl ? "تقييم" : "Grade"}</span><span style={{ color: '#f59e0b', fontWeight: '600' }}>{safeString(record?.session_grade) || '---'}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleCopyToClipboard(student, record)}
                      style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {copiedId === student.id ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                    </button>

                    {parentPhone ? (
                      <a 
                        href={generateWhatsAppLink(student, record)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => markAsSentInDB(student.id, getParsedMessage(student, record))}
                        style={{ textDecoration: 'none', flex: 1 }}
                      >
                        <button style={{ 
                          width: '100%', 
                          background: isSent ? '#1e293b' : '#f59e0b', 
                          color: isSent ? '#64748b' : '#090d16', 
                          border: 'none', 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          fontWeight: '700', 
                          fontSize: '11px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px', 
                          cursor: 'pointer'
                        }}>
                          {isSent ? (isRtl ? "إعادة إرسال" : "Resend") : (isRtl ? "إرسال عبر الواتساب" : "Send WhatsApp")}
                        </button>
                      </a>
                    ) : (
                      <button 
                        onClick={() => {
                          setEditingPhoneStudentId(student.id);
                          setTempPhoneValue('');
                        }}
                        style={{ 
                          flex: 1, 
                          background: '#1e293b50', 
                          color: '#f59e0b', 
                          border: '1px dashed #f59e0b40', 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          fontWeight: '600', 
                          fontSize: '10.5px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px', 
                          cursor: 'pointer' 
                        }}
                      >
                        <PhoneCall size={11} />
                        {isRtl ? "أضف رقم الهاتف" : "Add Phone"}
                      </button>
                    )}
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
