import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { 
  FaCalendarAlt, 
  FaWhatsapp, 
  FaCheckCircle, 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaEdit, 
  FaUndo,
  FaCopy,
  FaSearch
} from 'react-icons/fa';

export default function Reports({ students = [], academyId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

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
  const defaultTemplate = isRtl 
    ? `السلام عليكم ورحمة الله وبركاته، تحية طيبة من أكاديميتنا. 🌸\n\nنود إطلاعكم على تقرير أداء الابن(ة) *[اسم_الطالب]* ليوم [التاريخ]:\n\n📌 الحالة: [الحالة]\n📖 الحفظ الجديد: [الحفظ]\n🔄 المراجعة القريبة: [المراجعة]\n📚 المراجعة البعيدة: [الماضي]\n🌟 التقييم اليومي: [التقييم]\n📝 ملاحظات الحلقة: [الملاحظات]\n\nنسأل الله أن يبارك فيه وينبته نباتاً حسناً. 🤲✨`
    : `Peace be upon you. Standard update from our academy. 🌸\n\nPerformance report for *[اسم_الطالب]* on [التاريخ]:\n\n📌 Status: [الحالة]\n📖 New Memorization: [الحفظ]\n🔄 Revision: [المراجعة]\n📚 Distant Revision: [الماضي]\n🌟 Daily Grade: [التقييم]\n📝 Notes: [الملاحظات]\n\nMay Allah bless them. 🤲✨`;

  const [messageTemplate, setMessageTemplate] = useState(defaultTemplate);

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
      setSentLogs(JSON.parse(savedLogs));
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

  // معالج تحويل النصوص الموحد (Unified Parser) لتوليد الرسالة النهائية بدقة فائقة
  const getParsedMessage = (student, record) => {
    const statusText = () => {
      if (!record) return isRtl ? 'حاضر (افتراضي)' : 'Present (Default)';
      switch (record.status) {
        case 'present': return isRtl ? 'حاضر ✅' : 'Present ✅';
        case 'absent': return isRtl ? 'غائب ❌' : 'Absent ❌';
        case 'late': return isRtl ? 'متأخر ⏳' : 'Late ⏳';
        case 'excused': return isRtl ? 'غائب بعذر 📝' : 'Excused 📝';
        default: return isRtl ? 'حاضر ✅' : 'Present ✅';
      }
    };

    const gradeText = () => {
      if (!record?.daily_grade) return isRtl ? 'لم يحدد' : 'Not specified';
      switch (record.daily_grade) {
        case 'excellent': return isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐';
        case 'good': return isRtl ? 'جيد جداً ⭐⭐' : 'Good ⭐⭐';
        case 'needs_improvement': return isRtl ? 'يحتاج مزيد من التركيز 🎯' : 'Needs Focus 🎯';
        default: return record.daily_grade;
      }
    };

    // استخدام التعبيرات المنتظمة (Regex) للاستبدال الشامل والعالمي مهما تكرر الوسم بالقالب
    return messageTemplate
      .replace(/\[اسم_الطالب\]/g, student.name || '')
      .replace(/\[التاريخ\]/g, selectedDate)
      .replace(/\[الحالة\]/g, statusText())
      .replace(/\[الحفظ\]/g, record?.memorization || (record?.status === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')))
      .replace(/\[المراجعة\]/g, record?.revision || '---')
      .replace(/\[الماضي\]/g, record?.distant_revision || '---')
      .replace(/\[التقييم\]/g, gradeText())
      .replace(/\[الملاحظات\]/g, record?.notes || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.'));
  };

  // دالة لتوليد رابط الواتساب الجاهز
  const generateWhatsAppLink = (student, record) => {
    const parsedMessage = getParsedMessage(student, record);
    let phone = student.parent_phone || '';
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
    markAsSent(student.id); // نعتبره تم إرساله وحفظه تيسيراً للعمل
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ميزة التنافسية: إدراج التاج التلقائي عند نقر المعلم عليه لتوفير وقت الكتابة
  const handleTagClick = (tag) => {
    setMessageTemplate(prev => prev + " " + tag);
  };

  // تصفية الطلاب ديناميكياً بناءً على التبويب المختار، عملية رصد الحضور، ونص البحث السريع
  const filteredStudents = students.filter(student => {
    const rec = attendanceRecords[student.id];
    const status = rec?.status || 'present';

    // فلترة التبويبات
    let matchesTab = true;
    if (activeTab === 'present') matchesTab = (status === 'present' || status === 'late');
    else if (activeTab === 'absent') matchesTab = (status === 'absent' || status === 'excused');

    // فلترة البحث الذكي بالاسم أو الهاتف
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.parent_phone?.includes(searchTerm);

    return matchesTab && matchesSearch;
  });

  // حساب مؤشرات الإنجاز والشريط البصري العالمي للتقارير المرسلة اليوم
  const totalInCurrentTab = filteredStudents.length;
  const sentInCurrentTab = filteredStudents.filter(s => sentLogs[s.id]).length;
  const completionPercentage = totalInCurrentTab > 0 ? Math.round((sentInCurrentTab / totalInCurrentTab) * 100) : 0;

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* الجزء العلوي: الهيدر والتحكم بالتاريخ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexDirection: window.innerWidth < 768 ? 'column' : 'row', gap: '15px' }}>
        <div>
          <h2 style={{ color: C.gold || '#C9A84C', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {isRtl ? "مركز تقارير أولياء الأمور 📲" : "Parent Reporting Center 📲"}
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px' }}>
            {isRtl ? "توليد وإرسال حصاد اليوم القرآني والأكاديمي عبر الواتساب" : "Generate and send daily Quranic results via WhatsApp"}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#162030', padding: '10px 16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <FaCalendarAlt style={{ color: C.gold || '#C9A84C' }} />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          />
        </div>
      </div>

      {/* 📝 صندوق تعديل قالب الرسالة المرن */}
      <div style={{ background: C.surface || '#111C2A', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: C.gold }}>
          <FaEdit size={14} />
          <span style={{ fontWeight: '700', fontSize: '14px' }}>{isRtl ? "تخصيص صيغة رسالة التقرير الافتراضية" : "Customize Default Report Template"}</span>
        </div>
        <textarea 
          rows={5}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          style={{ width: '100%', background: '#0F172A', border: '1px solid #233247', color: '#fff', borderRadius: '8px', padding: '12px', fontSize: '13px', outline: 'none', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }}
        />
        {/* التحديث هنا: عند النقر على وسم يتم إضافته تلقائياً وتوسيع القائمة لتشمل كل الميزات الفعالة */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          {['[اسم_الطالب]', '[التاريخ]', '[الحالة]', '[الحفظ]', '[المراجعة]', '[الماضي]', '[التقييم]', '[الملاحظات]'].map(tag => (
            <span 
              key={tag} 
              onClick={() => handleTagClick(tag)}
              style={{ background: 'rgba(201, 168, 76, 0.08)', color: C.gold, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', border: '1px solid rgba(201, 168, 76, 0.15)', cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(201, 168, 76, 0.18)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)'}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 🔍 شريط البحث الذكي المدمج في التقارير لأداء صاروخي */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0F172A', padding: '10px 14px', borderRadius: '10px', border: '1px solid #233247', marginBottom: '16px' }}>
        <FaSearch style={{ color: '#64748b' }} size={14} />
        <input 
          type="text"
          placeholder={isRtl ? "بحث سريع باسم الطالب أو رقم الهاتف..." : "Quick search by name or phone..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px' }}
        />
      </div>

      {/* 🏆 شريط الإنجاز والمتابعة البصري الفائق والمنافس */}
      {totalInCurrentTab > 0 && (
        <div style={{ background: '#111C2A', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: '700' }}>
            <span style={{ color: '#94a3b8' }}>📈 {isRtl ? "معدل إنجاز إرسال تقارير القائمة الحالية:" : "Current List Reporting Progress:"}</span>
            <span style={{ color: C.gold }}>{sentInCurrentTab} {isRtl ? "من" : "of"} {totalInCurrentTab} ({completionPercentage}%)</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#0F172A', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold || '#C9A84C'}, #10B981)`, transition: 'width 0.4s ease-out' }} />
          </div>
        </div>
      )}

      {/* 🗂️ أزرار التصفية والتبويبات الذكية */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#0F172A', padding: '4px', borderRadius: '10px', border: '1px solid #233247' }}>
        <button onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'all' ? '#162030' : 'transparent', color: activeTab === 'all' ? C.gold : '#94a3b8' }}>
          <FaUsers size={14} /> {isRtl ? "كل الطلاب" : "All"} ({students.length})
        </button>
        <button onClick={() => setActiveTab('present')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'present' ? '#10B981' : '#94a3b8' }}>
          <FaUserCheck size={14} /> {isRtl ? "الحاضرين" : "Present"}
        </button>
        <button onClick={() => setActiveTab('absent')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === 'absent' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'absent' ? '#EF4444' : '#94a3b8' }}>
          <FaUserTimes size={14} /> {isRtl ? "الغائبين" : "Absent"}
        </button>
      </div>

      {/* عرض قائمة الطلاب للتقارير */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.05)', borderTop: `3px solid ${C.gold}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px auto' }}></div>
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
              
              return (
                <div key={student.id} style={{ 
                  display: 'flex', 
                  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                  justifyContent: 'space-between', 
                  alignItems: window.innerWidth < 768 ? 'stretch' : 'center', 
                  background: C.surface || '#111C2A', 
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
                      <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{student.name}</span>
                      {isSent && <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><FaCheckCircle size={10}/> {isRtl ? "تم الإرسال" : "Sent"}</span>}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      {isRtl ? "رقم ولي الأمر:" : "Parent Phone:"} <span style={{ color: '#cbd5e1' }}>{student.parent_phone || (isRtl ? 'غير مسجل' : 'Not registered')}</span>
                    </p>
                  </div>

                  {/* معلومات الأداء السريع في الكرت ليعرف الشيخ ماذا يرسل */}
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                    <div>{isRtl ? "حفظ جديد:" : "New Memorization:"} <span style={{ color: '#fff', fontWeight: '600' }}>{record?.memorization || '---'}</span></div>
                    <div>{isRtl ? "مراجعة:" : "Revision:"} <span style={{ color: '#fff', fontWeight: '600' }}>{record?.revision || '---'}</span></div>
                    <div>{isRtl ? "تقييم:" : "Grade:"} <span style={{ color: C.gold, fontWeight: '700' }}>{record?.daily_grade ? (isRtl ? (record.daily_grade === 'excellent' ? 'ممتاز ⭐' : record.daily_grade === 'good' ? 'جيد' : 'يحتاج تركيز') : record.daily_grade) : '---'}</span></div>
                  </div>

                  {/* إجراءات الإرسال والتحكم الذكي */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {isSent && (
                      <button 
                        onClick={() => resetSentLog(student.id)}
                        title={isRtl ? "إعادة تعيين كغير مرسل" : "Reset as unsent"}
                        style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      >
                        <FaUndo size={12} />
                      </button>
                    )}

                    {/* زر النسخ البديل السريع لحالات الطوارئ والأداء الفائق */}
                    <button
                      onClick={() => handleCopyToClipboard(student, record)}
                      title={isRtl ? "نسخ نص التقرير بالكامل" : "Copy full report text"}
                      style={{ 
                        padding: '10px 12px', 
                        background: copiedId === student.id ? '#10B981' : 'rgba(255,255,255,0.06)', 
                        border: 'none', 
                        borderRadius: '8px', 
                        color: copiedId === student.id ? '#fff' : C.gold || '#C9A84C', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FaCopy size={13} />
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
                        transition: 'all 0.2s',
                        flex: window.innerWidth < 768 ? 1 : 'none'
                      }}
                    >
                      <FaWhatsapp size={16} /> 
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
