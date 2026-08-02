/* src/components/Reports.jsx */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
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
  Sparkles
} from 'lucide-react';

export default function Reports({ students = [], academyId }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');

  // 🛡️ دالة آمنة لمعالجة وتحويل أي نص لمنع خطأ toLowerCase is not a function
  const safeString = useCallback((val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val.ar || val.en || Object.values(val).find(v => typeof v === 'string') || '';
    }
    return String(val);
  }, []);

  // تاريخ اليوم كافتراضي لربط التقارير بجلسة الرصد
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // حالات تخزين البيانات والتصفية والبحث
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'present' | 'absent'
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null); // لتتبع أي طالب تم نسخ تقريره مؤخراً
  
  // ذاكرة الإرسال لتتبع الطلاب الذين تم مراسلة أولياء أمورهم اليوم (Session Memory)
  const [sentLogs, setSentLogs] = useState({});

  // قالب الرسالة الافتراضي المرن وقابل للتعديل
  const defaultTemplate = useMemo(() => {
    return isRtl 
      ? `السلام عليكم ورحمة الله وبركاته، تحية طيبة من أكاديميتنا. 🌸\n\nنود إطلاعكم على تقرير أداء الابن(ة) *[اسم_الطالب]* ليوم [التاريخ]:\n\n📌 الحالة: [الحالة]\n📖 الحفظ الجديد: [الحفظ]\n🔄 المراجعة القريبة: [المراجعة]\n📚 المراجعة البعيدة: [الماضي]\n🌟 التقييم اليومي: [التقييم]\n📝 ملاحظات الحلقة: [الملاحظات]\n\nنسأل الله أن يبارك فيه وينبته نباتاً حسناً. 🤲✨`
      : `Peace be upon you. Standard update from our academy. 🌸\n\nPerformance report for *[اسم_الطالب]* on [التاريخ]:\n\n📌 Status: [الحالة]\n📖 New Memorization: [الحفظ]\n🔄 Revision: [المراجعة]\n📚 Distant Revision: [الماضي]\n🌟 Daily Grade: [التقييم]\n📝 Notes: [الملاحظات]\n\nMay Allah bless them. 🤲✨`;
  }, [isRtl]);

  const [messageTemplate, setMessageTemplate] = useState(defaultTemplate);

  useEffect(() => {
    setMessageTemplate(defaultTemplate);
  }, [defaultTemplate]);

  // جلب سجلات الحضور لليوم المحدد فوراً لتوليد التقارير بناءً عليها
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

  // إدارة وتتبع ذاكرة الإرسال عبر الـ localStorage لتجنب تكرار المراسلة
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

  // معالج تحويل النصوص الموحد (Unified Parser) المربوط بقاعدة البيانات مباشرة وآمن تماماً
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

  // دالة لتوليد رابط الواتساب الجاهز
  const generateWhatsAppLink = (student, record) => {
    const parsedMessage = getParsedMessage(student, record);
    let phone = safeString(student?.parent_phone || student?.phone);
    phone = phone.replace(/\s+/g, '').replace(/[+\-]/g, '');
    
    if (phone.startsWith('01') && phone.length === 11) {
      phone = '20' + phone;
    }
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(parsedMessage)}`;
  };

  // ميزة التنافسية: دالة النسخ السريع للحافظة بنقرة واحدة
  const handleCopyToClipboard = (student, record) => {
    const text = getParsedMessage(student, record);
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    markAsSent(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // إدراج التاج التلقائي عند نقر المعلم عليه
  const handleTagClick = (tag) => {
    setMessageTemplate(prev => prev + " " + tag);
  };

  // 🛡️ تصفية الطلاب ديناميكياً باستخدام safeString لحظر أي انهيار في التطبيق
  const filteredStudents = useMemo(() => {
    const cleanSearch = safeString(searchTerm).toLowerCase().trim();

    return (students || []).filter(student => {
      const rec = attendanceRecords[student.id];
      const status = rec?.status || 'present';

      // فلترة التبويبات
      let matchesTab = true;
      if (activeTab === 'present') matchesTab = (status === 'present' || status === 'late');
      else if (activeTab === 'absent') matchesTab = (status === 'absent' || status === 'excused');

      // فلترة البحث الآمنة
      const studentName = safeString(student?.name || student?.student_name).toLowerCase();
      const parentPhone = safeString(student?.parent_phone || student?.phone).toLowerCase();

      const matchesSearch = !cleanSearch || studentName.includes(cleanSearch) || parentPhone.includes(cleanSearch);

      return matchesTab && matchesSearch;
    });
  }, [students, attendanceRecords, activeTab, searchTerm, safeString]);

  // حساب مؤشرات الإنجاز والشريط البصري
  const totalInCurrentTab = filteredStudents.length;
  const sentInCurrentTab = filteredStudents.filter(s => sentLogs[s.id]).length;
  const completionPercentage = totalInCurrentTab > 0 ? Math.round((sentInCurrentTab / totalInCurrentTab) * 100) : 0;

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* الجزء العلوي: الهيدر والتحكم بالتاريخ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: C?.gold || '#C9A84C', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {isRtl ? "مركز تقارير أولياء الأمور 📲" : "Parent Reporting Center 📲"}
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px' }}>
            {isRtl ? "توليد وإرسال حصاد اليوم القرآني والأكاديمي عبر الواتساب" : "Generate and send daily Quranic results via WhatsApp"}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#162030', padding: '10px 16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <Calendar size={18} style={{ color: C?.gold || '#C9A84C' }} />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          />
        </div>
      </div>

      {/* 📝 صندوق تعديل قالب الرسالة المرن */}
      <div style={{ background: C?.surface || '#111C2A', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: C?.gold || '#C9A84C' }}>
          <Edit3 size={16} />
          <span style={{ fontWeight: '700', fontSize: '14px' }}>{isRtl ? "تخصيص صيغة رسالة التقرير الافتراضية" : "Customize Default Report Template"}</span>
        </div>
        <textarea 
          rows={5}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          style={{ width: '100%', background: '#0F172A', border: '1px solid #233247', color: '#fff', borderRadius: '8px', padding: '12px', fontSize: '13px', outline: 'none', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          {['[اسم_الطالب]', '[التاريخ]', '[الحالة]', '[الحفظ]', '[المراجعة]', '[الماضي]', '[التقييم]', '[الملاحظات]'].map(tag => (
            <span 
              key={tag} 
              onClick={() => handleTagClick(tag)}
              style={{ background: 'rgba(201, 168, 76, 0.08)', color: C?.gold || '#C9A84C', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', border: '1px solid rgba(201, 168, 76, 0.15)', cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(201, 168, 76, 0.18)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)'}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 🔍 شريط البحث الذكي المدمج في التقارير */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0F172A', padding: '10px 14px', borderRadius: '10px', border: '1px solid #233247', marginBottom: '16px' }}>
        <Search style={{ color: '#64748b' }} size={16} />
        <input 
          type="text"
          placeholder={isRtl ? "بحث سريع باسم الطالب أو رقم الهاتف..." : "Quick search by name or phone..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px' }}
        />
      </div>

      {/* 🏆 شريط الإنجاز والمتابعة البصري */}
      {totalInCurrentTab > 0 && (
        <div style={{ background: '#111C2A', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: '700' }}>
            <span style={{ color: '#94a3b8' }}>📈 {isRtl ? "معدل إنجاز إرسال تقارير القائمة الحالية:" : "Current List Reporting Progress:"}</span>
            <span style={{ color: C?.gold || '#C9A84C' }}>{sentInCurrentTab} {isRtl ? "من" : "of"} {totalInCurrentTab} ({completionPercentage}%)</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#0F172A', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: `linear-gradient(90deg, ${C?.gold || '#C9A84C'}, #10B981)`, transition: 'width 0.4s ease-out' }} />
          </div>
        </div>
      )}

      {/* 🗂️ أزرار التصفية والتبويبات الذكية */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#0F172A', padding: '4px', borderRadius: '10px', border: '1px solid #233247' }}>
        <button onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'all' ? '#162030' : 'transparent', color: activeTab === 'all' ? (C?.gold || '#C9A84C') : '#94a3b8' }}>
          <Users size={16} /> {isRtl ? "كل الطلاب" : "All"} ({students.length})
        </button>
        <button onClick={() => setActiveTab('present')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'present' ? '#10B981' : '#94a3b8' }}>
          <UserCheck size={16} /> {isRtl ? "الحاضرين" : "Present"}
        </button>
        <button onClick={() => setActiveTab('absent')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'absent' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'absent' ? '#EF4444' : '#94a3b8' }}>
          <UserX size={16} /> {isRtl ? "الغائبين" : "Absent"}
        </button>
      </div>

      {/* عرض قائمة الطلاب للتقارير */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.05)', borderTop: `3px solid ${C?.gold || '#C9A84C'}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px auto' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span>{isRtl ? "جاري تجهيز التقارير الحية..." : "Preparing live reports..."}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredStudents.length === 0 ? (
            <p style={{ color: '#94a3b8', opacity: 0.6, textAlign: 'center', padding: '20px', fontSize: '13px' }}>
              {isRtl ? "لا يوجد طلاب يطابقون خيار التصفية المختار حالياً." : "No students match the current filter selection."}
            </p>
          ) : (
            filteredStudents.map(student => {
              const record = attendanceRecords[student.id];
              const isSent = sentLogs[student.id];
              const studentName = safeString(student?.name || student?.student_name);
              const parentPhone = safeString(student?.parent_phone || student?.phone);

              return (
                <div key={student.id} style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: C?.surface || '#111C2A', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: isSent ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.02)', 
                  gap: '14px',
                  opacity: isSent ? 0.65 : 1,
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}>
                  {/* معلومات الطالب السريعة لليوم */}
                  <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{studentName}</span>
                      {isSent && (
                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12}/> {isRtl ? "تم الإرسال" : "Sent"}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      {isRtl ? "رقم ولي الأمر:" : "Parent Phone:"} <span style={{ color: '#cbd5e1' }}>{parentPhone || (isRtl ? 'غير مسجل' : 'Not registered')}</span>
                    </p>
                  </div>

                  {/* معلومات الأداء السريع */}
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                    <div>{isRtl ? "حفظ جديد:" : "New Memorization:"} <span style={{ color: '#fff', fontWeight: '600' }}>{safeString(record?.new_memorization || record?.memorization) || '---'}</span></div>
                    <div>{isRtl ? "مراجعة:" : "Revision:"} <span style={{ color: '#fff', fontWeight: '600' }}>{safeString(record?.retention_assignment || record?.revision) || '---'}</span></div>
                    <div>{isRtl ? "تقييم:" : "Grade:"} <span style={{ color: C?.gold || '#C9A84C', fontWeight: '700' }}>{safeString(record?.session_grade) || '---'}</span></div>
                  </div>

                  {/* إجراءات الإرسال والتحكم الذكي */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {isSent && (
                      <button 
                        onClick={() => resetSentLog(student.id)}
                        title={isRtl ? "إعادة تعيين كغير مرسل" : "Reset as unsent"}
                        style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}

                    {/* زر النسخ البديل السريع */}
                    <button
                      onClick={() => handleCopyToClipboard(student, record)}
                      title={isRtl ? "نسخ نص التقرير بالكامل" : "Copy full report text"}
                      style={{ 
                        padding: '10px 12px', 
                        background: copiedId === student.id ? '#10B981' : 'rgba(255,255,255,0.06)', 
                        border: 'none', 
                        borderRadius: '8px', 
                        color: copiedId === student.id ? '#fff' : (C?.gold || '#C9A84C'), 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copiedId === student.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === student.id && <span style={{ fontSize: '10px', marginRight: '4px', marginLeft: '4px', fontWeight: 'bold' }}>{isRtl ? "تم!" : "Copied!"}</span>}
                    </button>
                    
                    <a 
                      href={generateWhatsAppLink(student, record)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => markAsSent(student.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '6px', 
                        padding: '10px 16px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        background: isSent ? '#334155' : '#25D366', 
                        color: isSent ? '#94a3b8' : '#fff', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <MessageCircle size={16} /> 
                      {isSent ? (isRtl ? "تكرار الإرسال" : "Resend") : (isRtl ? "إرسال التقرير" : "Send Report")}
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
