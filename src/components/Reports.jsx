// src/components/Reports.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Loader2
} from 'lucide-react';

export default function Reports({ students = [], academyId }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');

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
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [sentLogs, setSentLogs] = useState({});

  const defaultTemplate = useMemo(() => {
    return isRtl 
      ? `السلام عليكم ورحمة الله وبركاته، تحية طيبة من أكاديميتنا. 🌸\n\nنود إطلاعكم على تقرير أداء الابن(ة) *[اسم_الطالب]* ليوم [التاريخ]:\n\n📌 الحالة: [الحالة]\n📖 الحفظ الجديد: [الحفظ]\n🔄 المراجعة القريبة: [المراجعة]\n📚 المراجعة البعيدة: [الماضي]\n🌟 التقييم اليومي: [التقييم]\n📝 ملاحظات الحلقة: [الملاحظات]\n\nنسأل الله أن يبارك فيه وينبته نباتاً حسناً. 🤲✨`
      : `Peace be upon you. Standard update from our academy. 🌸\n\nPerformance report for *[اسم_الطالب]* on [التاريخ]:\n\n📌 Status: [الحالة]\n📖 New Memorization: [الحفظ]\n🔄 Revision: [المراجعة]\n📚 Distant Revision: [الماضي]\n🌟 Daily Grade: [التقييم]\n📝 Notes: [الملاحظات]\n\nMay Allah bless them. 🤲✨`;
  }, [isRtl]);

  const [messageTemplate, setMessageTemplate] = useState(defaultTemplate);

  useEffect(() => {
    setMessageTemplate(defaultTemplate);
  }, [defaultTemplate]);

  useEffect(() => {
    async function fetchDayAttendance() {
      if (!academyId || !selectedDate) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('academy_id', academyId)
          .eq('date', selectedDate);

        if (error) throw error;

        const mapped = {};
        if (data) {
          data.forEach(rec => {
            mapped[rec.student_id] = rec;
          });
        }
        setAttendanceRecords(mapped);
      } catch (err) {
        console.error("🚨 خطأ أثناء جلب سجلات التقارير:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDayAttendance();
  }, [selectedDate, academyId]);

  useEffect(() => {
    const storageKey = `sent_logs_${academyId}_${selectedDate}`;
    const savedLogs = localStorage.getItem(storageKey);
    if (savedLogs) {
      try {
        setSentLogs(JSON.parse(savedLogs));
      } catch (e) {
        setSentLogs({});
      }
    } else {
      setSentLogs({});
    }
  }, [selectedDate, academyId]);

  const markAsSent = (studentId) => {
    const storageKey = `sent_logs_${academyId}_${selectedDate}`;
    const updated = { ...sentLogs, [studentId]: true };
    setSentLogs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const resetSentLog = (studentId) => {
    const storageKey = `sent_logs_${academyId}_${selectedDate}`;
    const updated = { ...sentLogs };
    delete updated[studentId];
    setSentLogs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const getParsedMessage = (student, record) => {
    const studentName = safeString(student?.name || student?.student_name);
    
    const statusText = () => {
      if (!record) return isRtl ? 'حاضر ✅' : 'Present ✅';
      switch (record.status) {
        case 'present': return isRtl ? 'حاضر ✅' : 'Present ✅';
        case 'absent': return isRtl ? 'غائب ❌' : 'Absent ❌';
        case 'late': return isRtl ? 'متأخر ⏳' : 'Late ⏳';
        case 'excused': return isRtl ? 'غائب بعذر 📝' : 'Excused 📝';
        default: return isRtl ? 'حاضر ✅' : 'Present ✅';
      }
    };

    const gradeText = () => {
      if (!record || record.session_grade === null || record.session_grade === undefined) {
        return isRtl ? 'لم يحدد' : 'Not specified';
      }
      
      const grade = Number(record.session_grade);
      if (isNaN(grade)) return safeString(record.session_grade);
      
      if (grade >= 10) return isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐';
      if (grade >= 8)  return isRtl ? 'جيد جداً ⭐⭐' : 'Very Good ⭐⭐';
      if (grade >= 6)  return isRtl ? 'يحتاج مزيد من التركيز 🎯' : 'Needs Focus 🎯';
      
      return isRtl ? 'ضعيف ⚠️' : 'Weak ⚠️';
    };

    const newMemorization = safeString(record?.new_memorization || record?.memorization);
    const retention = safeString(record?.retention_assignment || record?.revision);
    const notes = safeString(record?.notes);

    return messageTemplate
      .replace(/\[اسم_الطالب\]/g, studentName)
      .replace(/\[التاريخ\]/g, selectedDate)
      .replace(/\[الحالة\]/g, statusText())
      .replace(/\[الحفظ\]/g, newMemorization || (record?.status === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')))
      .replace(/\[المراجعة\]/g, retention || '---')
      .replace(/\[الماضي\]/g, '---')
      .replace(/\[التقييم\]/g, gradeText())
      .replace(/\[الملاحظات\]/g, notes || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.'));
  };

  const generateWhatsAppLink = (student, record) => {
    const parsedMessage = getParsedMessage(student, record);
    let phone = safeString(student?.parent_phone || student?.phone);
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
    markAsSent(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTagClick = (tag) => {
    setMessageTemplate(prev => prev + " " + tag);
  };

  const filteredStudents = useMemo(() => {
    const cleanSearch = safeString(searchTerm).toLowerCase().trim();

    return (students || []).filter(student => {
      const rec = attendanceRecords[student.id];
      const status = rec?.status || 'present';

      let matchesTab = true;
      if (activeTab === 'present') matchesTab = (status === 'present' || status === 'late');
      else if (activeTab === 'absent') matchesTab = (status === 'absent' || status === 'excused');

      const studentName = safeString(student?.name || student?.student_name).toLowerCase();
      const parentPhone = safeString(student?.parent_phone || student?.phone).toLowerCase();

      const matchesSearch = !cleanSearch || studentName.includes(cleanSearch) || parentPhone.includes(cleanSearch);

      return matchesTab && matchesSearch;
    });
  }, [students, attendanceRecords, activeTab, searchTerm, safeString]);

  const totalInCurrentTab = filteredStudents.length;
  const sentInCurrentTab = filteredStudents.filter(s => sentLogs[s.id]).length;
  const completionPercentage = totalInCurrentTab > 0 ? Math.round((sentInCurrentTab / totalInCurrentTab) * 100) : 0;

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

      {/* 2. تخصيص قالب الرسالة */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: C.primary, fontWeight: 700, fontSize: '14px' }}>
          <Edit3 size={16} />
          <span>{isRtl ? "تخصيص صيغة رسالة التقرير الافتراضية" : "Customize Default Report Template"}</span>
        </div>
        <textarea 
          rows={4}
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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
          {['[اسم_الطالب]', '[التاريخ]', '[الحالة]', '[الحفظ]', '[المراجعة]', '[الماضي]', '[التقييم]', '[الملاحظات]'].map(tag => (
            <Badge key={tag} onClick={() => handleTagClick(tag)} style={{ cursor: 'pointer' }}>
              {tag}
            </Badge>
          ))}
        </div>
      </Card>

      {/* 3. شريط البحث */}
      <Input 
        type="text"
        placeholder={isRtl ? "بحث سريع باسم الطالب أو رقم الهاتف..." : "Quick search by name or phone..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 4. شريط نسبة الإنجاز */}
      {totalInCurrentTab > 0 && (
        <Card style={{ padding: '12px 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: '700' }}>
            <span style={{ color: C.textSub }}>📈 {isRtl ? "معدل إنجاز إرسال تقارير القائمة الحالية:" : "Current List Reporting Progress:"}</span>
            <span style={{ color: C.primary }}>{sentInCurrentTab} {isRtl ? "من" : "of"} {totalInCurrentTab} ({completionPercentage}%)</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: C.surface, borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: C.primary, transition: 'width 0.4s ease-out' }} />
          </div>
        </Card>
      )}

      {/* 5. أزرار التصفية */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Btn onClick={() => setActiveTab('all')} variant={activeTab === 'all' ? "primary" : "ghost"} style={{ flex: 1 }}>
          <Users size={16} /> {isRtl ? "كل الطلاب" : "All"} ({students.length})
        </Btn>
        <Btn onClick={() => setActiveTab('present')} variant={activeTab === 'present' ? "primary" : "ghost"} style={{ flex: 1 }}>
          <UserCheck size={16} /> {isRtl ? "الحاضرين" : "Present"}
        </Btn>
        <Btn onClick={() => setActiveTab('absent')} variant={activeTab === 'absent' ? "primary" : "ghost"} style={{ flex: 1 }}>
          <UserX size={16} /> {isRtl ? "الغائبين" : "Absent"}
        </Btn>
      </div>

      {/* 6. قائمة الطلاب */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.textSub }}>
          <Loader2 size={24} className="spin-icon" style={{ margin: '0 auto 10px auto', display: 'block' }} />
          <span>{isRtl ? "جاري تجهيز التقارير الحية..." : "Preparing live reports..."}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredStudents.length === 0 ? (
            <Card style={{ textAlign: 'center', color: C.textSub, padding: '20px' }}>
              {isRtl ? "لا يوجد طلاب يطابقون خيار التصفية المختار حالياً." : "No students match the current filter selection."}
            </Card>
          ) : (
            filteredStudents.map(student => {
              const record = attendanceRecords[student.id];
              const isSent = sentLogs[student.id];
              const studentName = safeString(student?.name || student?.student_name);
              const parentPhone = safeString(student?.parent_phone || student?.phone);

              return (
                <Card 
                  key={student.id} 
                  style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: '14px',
                    opacity: isSent ? 0.65 : 1,
                    padding: '16px'
                  }}
                >
                  <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: C.text }}>{studentName}</span>
                      {isSent && (
                        <Badge color={C.success}>
                          <CheckCircle2 size={12}/> {isRtl ? "تم الإرسال" : "Sent"}
                        </Badge>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: C.textSub }}>
                      {isRtl ? "رقم ولي الأمر:" : "Parent Phone:"} <span style={{ color: C.text }}>{parentPhone || (isRtl ? 'غير مسجل' : 'Not registered')}</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: C.textSub, flexWrap: 'wrap' }}>
                    <div>{isRtl ? "حفظ جديد:" : "New Memorization:"} <span style={{ color: C.text, fontWeight: '600' }}>{safeString(record?.new_memorization || record?.memorization) || '---'}</span></div>
                    <div>{isRtl ? "مراجعة:" : "Revision:"} <span style={{ color: C.text, fontWeight: '600' }}>{safeString(record?.retention_assignment || record?.revision) || '---'}</span></div>
                    <div>{isRtl ? "تقييم:" : "Grade:"} <span style={{ color: C.primary, fontWeight: '700' }}>{safeString(record?.session_grade) || '---'}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {isSent && (
                      <Btn onClick={() => resetSentLog(student.id)} variant="ghost" style={{ padding: '8px' }}>
                        <RotateCcw size={14} />
                      </Btn>
                    )}

                    <Btn 
                      onClick={() => handleCopyToClipboard(student, record)} 
                      variant={copiedId === student.id ? "success" : "ghost"}
                      style={{ padding: '8px 12px' }}
                    >
                      {copiedId === student.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === student.id && <span style={{ fontSize: '10px', marginRight: '4px', marginLeft: '4px' }}>{isRtl ? "تم!" : "Copied!"}</span>}
                    </Btn>
                    
                    <a 
                      href={generateWhatsAppLink(student, record)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => markAsSent(student.id)}
                      style={{ textDecoration: 'none' }}
                    >
                      <Btn variant={isSent ? "secondary" : "success"}>
                        <MessageCircle size={16} /> 
                        {isSent ? (isRtl ? "تكرار الإرسال" : "Resend") : (isRtl ? "إرسال التقرير" : "Send Report")}
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
