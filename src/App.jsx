import { useState, useEffect } from "react";
import { C, g } from './constants/colors';
import { supabase } from './lib/supabase';

// 1. استيراد المكونات الاحترافية الخارجية ومنع التضارب
import Payments from './components/Payments';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

import {
  Badge,
  Btn,
  Card,
  Input,
  Select,
  Modal,
  PageHeader,
  TH,
  TD
} from "./components/UI";

const SECURITY_CONFIG = {
  allowedHostSuffix: "vercel.app",
  watermark: "Licensed to The Win Route © 2026",
  demoDaysLimit: 14
};

const QURAN_JUZS = Array.from({ length: 30 }, (_, i) => "الجزء " + (i + 1));
const QURAN_SURAS = ["الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"];

// --- المكونات الداخلية المحدثة سحابياً بالكامل ---

const Students = ({ students, setStudents, onSendReminder, isFullyActivated, teacherPhone, academyId }) => {
  const [search, setSearch] = useState(""); 
  const [modal, setModal] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  
  const empty = { name:"", parent:"", phone:"", age:"", surah:"", juz:"", page:"", notes:"" };
  const [form, setForm] = useState(empty);
  
  const filtered = students.filter(s => (s.name || "").includes(search) || (s.parent || "").includes(search));

  const openAdd = () => { setForm(empty); setModal("add"); };
  const openEdit = (student) => { setForm(student); setModal(student); };

  const doSave = async () => {
    if (!form.name || !form.phone) {
      alert("يرجى إدخال اسم الطالب ورقم الهاتف الأساسي");
      return;
    }
    if (!academyId) {
      alert("خطأ في صلاحيات الحساب: لم يتم العثور على معرف الأكاديمية الحالية.");
      return;
    }

    setBtnLoading(true);
    const studentPayload = {
      name: form.name,
      parent: form.parent,
      phone: form.phone,
      age: +form.age || 0,
      surah: form.surah || "",
      juz: form.juz || "",
      page: +form.page || 0,
      notes: form.notes || "",
      academy_id: academyId 
    };

    try {
      if (modal === "add") {
        const { data, error } = await supabase
          .from('students')
          .insert([studentPayload])
          .select();

        if (error) throw error;
        if (data) setStudents(p => [data[0], ...p]);
      } else {
        const { data, error } = await supabase
          .from('students')
          .update(studentPayload)
          .eq('id', modal.id)
          .select();

        if (error) throw error;
        if (data) setStudents(p => p.map(s => s.id === modal.id ? data[0] : s));
      }
      setModal(null);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات سحابياً: " + err.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب نهائياً من السيرفر السحابي؟")) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setStudents(p => p.filter(s => s.id !== id));
      } catch (err) {
        alert("فشل الحذف: " + err.message);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="دليل الحلقات والمحفوظ"
        sub="إدارة شؤون الطلاب الحاليين"
        action={<Btn onClick={openAdd}>+ إضافة طالب جديد</Btn>}
      />
      
      <Card style={{ marginBottom: 16, padding: "10px 16px" }}>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="بحث سريع باسم الطالب أو ولي الأمر..." 
          style={{ width: "100%", padding: "8px", background: "transparent", border: "none", color: "#fff", outline: "none", fontFamily: "'Cairo'" }} 
        />
      </Card>

      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              <TH>اسم الطالب</TH>
              <TH>ولي الأمر</TH>
              <TH>رقم الهاتف</TH>
              <TH>المستوى الحالي</TH>
              <TH>إجراءات</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <TD colSpan={5} style={{ textAlign: "center", color: C.muted, padding: 32 }}>لا توجد بيانات طلاب متوفرة حالياً بالبحث.</TD>
              </tr>
            ) : filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <TD style={{ fontWeight: 700, color: C.gold }}>{s.name}</TD>
                <TD>{s.parent || "—"}</TD>
                <TD>{s.phone}</TD>
                <TD>
                  <Badge color="gold">{s.juz || "لم يحدد جزء"}</Badge>
                  {s.surah && <span style={{ fontSize: "0.8rem", marginRight: 6, color: C.muted }}>{s.surah} (ص {s.page})</span>}
                </TD>
                <TD>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="secondary" onClick={() => openEdit(s)}>تعديل ⚙️</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(s.id)}>حذف 🗑️</Btn>
                    <Btn size="sm" onClick={() => onSendReminder(s)}>واتساب 💬</Btn>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={modal === "add" ? "إضافة طالب جديد للحلقة" : "تعديل بيانات الطالب"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Input label="اسم الطالب الرباعي" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="أحمد محمد علي..." required />
            <Input label="اسم ولي الأمر" value={form.parent} onChange={e => setForm({...form, parent: e.target.value})} placeholder="محمد علي..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Input label="رقم هاتف الواتساب المعرّف" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01xxxxxxxxx" required />
            <Input label="عمر الطالب" type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="12" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <Select label="الجزء الحالي" value={form.juz} onChange={e => setForm({...form, juz: e.target.value})} options={QURAN_JUZS} />
            <Select label="السورة الحالية" value={form.surah} onChange={e => setForm({...form, surah: e.target.value})} options={QURAN_SURAS} />
            <Input label="رقم الصفحة الحالية" type="number" value={form.page} onChange={e => setForm({...form, page: e.target.value})} placeholder="1" />
          </div>
          <Input label="ملاحظات توجيهية خاصة بالمعلم" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="يحتاج لتكرار أحكام الإخفاء الحقيقي..." />
          
          <div style={{ marginTop: 24, textAlign: "left" }}>
            <Btn onClick={doSave} disabled={btnLoading}>
              {btnLoading ? "جاري الحفظ بالسيرفر السحابي... ⏳" : "حفظ البيانات ومزامنتها سحابياً 💾"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Attendance = ({ students, attendance, setAttendance }) => { return <div style={{padding: 24}}><Card><h3>سجل الحضور والغياب قيد التشغيل 📝</h3><p style={{color: C.muted, marginTop: 8}}>جاري إعداد البنية البرمجية المتكاملة لربط الحصص اليومية سحابياً.</p></Card></div>; };
const Settings = ({ teacher, setTeacher }) => { return <div style={{padding: 24}}><Card><h3>إعدادات الأكاديمية وحفظ البيانات ⚙️</h3><p style={{color: C.muted, marginTop: 8}}>إعدادات ترخيص النظام، وتحديث بيانات السداد الحالية لمعلم الحلقة.</p></Card></div>; };

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isFullyActivated, setIsFullyActivated] = useState(true);

  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teacher, setTeacher] = useState({ name: "جاري المزامنة...", phone: "" });
  const [academyId, setAcademyId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const loadCloudAcademyData = async () => {
      setLoading(true);
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('academy_id, full_name, phone')
          .eq('user_id', session.user.id)
          .single();

        if (staffError) throw staffError;

        if (staffData) {
          setAcademyId(staffData.academy_id);
          setTeacher({
            name: staffData.full_name,
            phone: staffData.phone || "",
            fee: 999
          });

          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', staffData.academy_id)
            .order('created_at', { ascending: false });

          if (studentsError) throw studentsError;
          setStudents(studentsData || []);
        }
      } catch (err) {
        console.error("Error sync cloud data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCloudAcademyData();
  }, [session]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && !hostname.endsWith(SECURITY_CONFIG.allowedHostSuffix)) {
        document.body.innerHTML = `<div style="background:#0C1520;color:#EF4444;text-align:center;padding:100px;font-family:'Cairo';direction:rtl;"><h2>⚠️ خطأ في ترخيص النظام ومصداقية البناء</h2><p>هذه النسخة البرمجية غير مصرح لها بالعمل خارج النطاق الرسمي للتطبيق. يرجى مراجعة المهندس المطور لتعديل مسار الإطلاق.</p></div>`;
      }
    }
  }, []);

  const sendWhatsAppReminder = (student) => {
    const message = `السلام عليكم ورحمة الله وبركاته، نود تذكيركم بموعد سداد اشتراك الحلقة المخصص للابن الكريم: *${student.name}* \nشاكرين لكم عونكم وحرصكم الدائم.`;
    window.open(`https://wa.me/2${student.phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) return <div style={{ color: C.gold, textAlign: 'center', marginTop: '20%', fontFamily: "'Cairo'", fontSize: '1.2rem' }}>جاري تشغيل نظام الحلقة السحابي الذكي ومزامنة البيانات السيرفر... ⏳</div>;

  if (!session) return <LoginPage />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Cairo', sans-serif", direction: "rtl", display: "flex" }}>
      
      {/* Sidebar */}
      <aside style={{ width: 260, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", justifyBetween: "space-between", padding: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
            <span style={{ fontSize: 24 }}>🕌</span>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: C.gold, lineHeight: 1 }}>الحلقة الذكية</h2>
              <span style={{ fontSize: "0.68rem", color: C.muted }}>منصة الـ SaaS السحابية</span>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "dashboard", label: "لوحة التحكم الرئيسية", icon: "📊" },
              { id: "students", label: "دليل الطلاب والحفظ", icon: "👥" },
              { id: "attendance", label: "الحضور والغياب اليومي", icon: "📝" },
              { id: "payments", label: "الخزينة والمالية والعوائد", icon: "💰" },
              { id: "settings", label: "إعدادات الأكاديمية المعلم", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", borderRadius: 12, border: "none",
                  background: activeTab === tab.id ? g.gold : "transparent",
                  color: activeTab === tab.id ? "#1A1208" : C.text,
                  cursor: "pointer", fontFamily: "'Cairo'", fontSize: "0.85rem", fontWeight: activeTab === tab.id ? 700 : 500, textAlign: "right",
                  transition: "all 0.2s"
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div style={{ fontSize: "0.7rem", color: C.muted, textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div>{SECURITY_CONFIG.watermark}</div>
        </div>
      </aside>

      {/* منطقة العرض الديناميكي ومفاتيح التحويل */}
      <main style={{ flex: 1, padding: 32, boxSizing: "border-box", overflowY: "auto", maxHeight: "100vh" }}>
        {/* 👈 تم التعديل هنا لتمرير دالة التنقل للوحة التحكم بنجاح */}
        {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
        
        {activeTab === "students" && (
          <Students 
            students={students} 
            setStudents={setStudents} 
            onSendReminder={sendWhatsAppReminder} 
            isFullyActivated={isFullyActivated} 
            teacherPhone={teacher.phone}
            academyId={academyId} 
          />
        )}
        {/* منطقة العرض الديناميكي ومفاتيح التحويل المحدثة */}
{activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}

{activeTab === "students" && (
  <Students 
    students={students} 
    setStudents={setStudents} 
    onSendReminder={sendWhatsAppReminder} 
    isFullyActivated={isFullyActivated} 
    teacherPhone={teacher.phone}
    academyId={academyId} 
  />
)}

{activeTab === "attendance" && (
  <Attendance 
    students={students} 
    academyId={academyId} 
  />
)}

{activeTab === "payments" && (
  <Payments 
    students={students} 
    academyId={academyId} 
  />
)}

{activeTab === "settings" && <Settings teacher={teacher} setTeacher={setTeacher} />}

      </main>
    </div>
  );
}
