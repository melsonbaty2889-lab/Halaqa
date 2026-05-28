import { useState, useEffect } from "react";
import { C, g } from "./constants/colors";
import { supabase } from "./lib/supabase";
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

const CRYPTO = {
  encrypt: (str) => {
    try {
      if (!str) return "";
      return btoa(encodeURIComponent(String(str)));
    } catch (e) {
      console.error("Encryption error:", e);
      return "";
    }
  },
  decrypt: (str) => {
    try {
      if (!str || typeof str !== "string") return "";
      return decodeURIComponent(atob(str));
    } catch (e) {
      console.error("Decryption error:", e);
      return "";
    }
  }
};

const LS = {
  get: (k, d) => {
    try {
      const enc = localStorage.getItem(k);
      if (!enc) return d;
      const dec = CRYPTO.decrypt(enc);
      if (!dec || dec.trim() === "") return d;
      
      if (dec.startsWith("{") || dec.startsWith("[")) {
        return JSON.parse(dec);
      }
      return dec;
    } catch (e) {
      console.error("LS Get Error:", e);
      return d;
    }
  },
  set: (k, v) => {
    try {
      if (v === undefined || v === null) return;
      const str = typeof v === "object" ? JSON.stringify(v) : String(v);
      const enc = CRYPTO.encrypt(str);
      if (enc) {
        localStorage.setItem(k, enc);
      }
    } catch (e) {
      console.error("LS Set Error:", e);
    }
  }
};

// قائمة الأجزاء (1 إلى 30)
const QURAN_JUZS = Array.from({ length: 30 }, (_, i) => "الجزء " + (i + 1));

// قائمة سور القرآن الكريم كاملة مرتبة
const QURAN_SURAS = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء",
  "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان",
  "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى",
  "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور",
  "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة",
  "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن",
  "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير",
  "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون",
  "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
];

const DEFAULT_TEACHER_CONFIG = {
  name: "الشيخ أحمد محمود",
  phone: "01012345678",
  location: "مدينة نصر، القاهرة",
  bio: "حافظ للقرآن الكريم برواية حفص عن عاصم، خبرة 15 عاماً في تحفيظ القرآن للأطفال والكبار",
  schedule: "السبت والاثنين والأربعاء - 4:00 عصراً",
  fee: 999,
  systemeLink: "https://systeme.io/halqa-register",
  vodafoneCash: "01012345678",
  instaPayId: "teacher@instapay"
};

const SAMPLE_STUDENTS = [
  { id: 1, name: "أحمد محمد علي", parent: "محمد علي", phone: "01012345678", age: 10, joined: "2026-05-01", paid: true, paidDate: "2026-05-01", surah: "البقرة", juz: "الجزء 1", page: 12, attendance: 90, notes: "" },
  { id: 2, name: "يوسف عبدالرحمن", parent: "عبدالرحمن سالم", phone: "01123456789", age: 9, joined: "2026-05-02", paid: false, paidDate: null, surah: "آل عمران", juz: "الجزء 3", page: 55, attendance: 75, notes: "يحتاج متابعة" },
  { id: 3, name: "عمر خالد حسن", parent: "خالد حسن", phone: "01234567890", age: 11, joined: "2026-04-20", paid: true, paidDate: "2026-05-03", surah: "النساء", juz: "الجزء 5", page: 100, attendance: 95, notes: "" },
  { id: 4, name: "إبراهيم سامي", parent: "سامي إبراهيم", phone: "01098765432", age: 8, joined: "2026-05-10", paid: true, paidDate: "2026-05-01", surah: "الفاتحة", juz: "الجزء 1", page: 3, attendance: 85, notes: "" },
  { id: 5, name: "زياد طارق", parent: "طارق زياد", phone: "01187654321", age: 12, joined: "2026-04-01", paid: false, paidDate: null, surah: "المائدة", juz: "الجزء 6", page: 115, attendance: 60, notes: "غياب متكرر" },
];

const SAMPLE_PAYMENTS = [
  { id: 1, studentId: 1, amount: 999, date: "2026-05-01", month: "مايو 2026", method: "فودافون كاش" },
  { id: 2, studentId: 3, amount: 999, date: "2026-05-03", month: "مايو 2026", method: "انستا باي" },
  { id: 3, studentId: 4, amount: 999, date: "2026-05-01", month: "مايو 2026", method: "فيزا / بطاقة" },
];

const SAMPLE_ATTENDANCE = [{ id: 1, date: "2026-05-19", present: [1, 3, 4], absent: [2, 5] }];


const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState(""); const [pass, setPass] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(user, pass);
  };
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", direction:"rtl", padding:16, boxSizing:"border-box" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380 }}>
        <Card style={{ padding:32, textAlign:"center" }}>
          <div style={{ width:70, height:70, background:g.gold, borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px" }}>🕌</div>
          <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.gold, marginBottom:6 }}>الحلقة الذكية</h1>
          <p style={{ fontSize:"0.82rem", color:C.muted, marginBottom:24 }}>لوحة تحكم وإشراف معلمين القرآن الكريم</p>
          <Input label="اسم المستخدم" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
          <Input label="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="1234" />
          <Btn type="submit" style={{ width:"100%", marginTop:12 }}>دخول لوحة التحكم</Btn>
        </Card>
      </form>
    </div>
  );
};

const Dashboard = ({ students, payments, teacher, onSendReminder, isFullyActivated }) => {
  const total = students.length; const paid = students.filter(s => s.paid).length;
  const monthRev = payments.reduce((a, p) => a + p.amount, 0);
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.gold }}>مرحباً بك، {teacher.name} 👋</h1>
        <p style={{ fontSize:"0.82rem", color:C.muted }}>إليك ملخص سريع لأداء وإحصائيات الحلقة القرآنية اليوم</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:24 }}>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:900, color:C.blue }}>{isFullyActivated ? `${total} طالب` : `${total} من إجمالي 5 طلاب`}</div><div style={{ fontSize:"0.8rem", color:C.muted, marginTop:6 }}>إجمالي الطلاب الحاليين</div></Card>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:900, color:C.green }}>{paid} طلاب</div><div style={{ fontSize:"0.8rem", color:C.muted, marginTop:6 }}>الطلاب المسددين هذا الشهر</div></Card>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:900, color:C.gold }}>{monthRev.toLocaleString()} ج.م</div><div style={{ fontSize:"0.8rem", color:C.muted, marginTop:6 }}>مداخيل شهر مايو</div></Card>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
        <Card style={{ overflowX:"auto", padding: 20 }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14, color: C.text }}>📋 نظرة على الحفظ والمتابعة</h3>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>اسم الطالب</TH><TH>المحفوظ الحالي</TH><TH style={{ textAlign:"center" }}>الحالة / التذكير</TH></tr></thead>
            <tbody>
              {students.slice(0, 3).map(s => (
                <tr key={s.id}>
                  <TD style={{ fontWeight: 600 }}>{s.name}</TD>
                  <TD>
                    <div style={{ fontSize: "0.82rem" }}>
                      {s.surah ? <span style={{ color: C.gold, fontWeight: "bold" }}>سورة {s.surah}</span> : "—"}
                      <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 2 }}>{s.juz || ""} {s.page ? `• صـ ${s.page}` : ""}</div>
                    </div>
                  </TD>
                  <TD style={{ textAlign:"center" }}>
                    {s.paid ? (
                      <Badge color={C.green}>مسدد</Badge>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                        <Badge color={C.amber}>معلق</Badge>
                        <button onClick={() => onSendReminder(s)} style={{ background:"transparent", border:"none", color:C.green, cursor:"pointer", fontSize:"0.8rem", padding:0, fontFamily:"'Cairo'", fontWeight: 600 }} title="إرسال تذكير سداد بالواتساب">📱 تذكير</button>
                      </div>
                    )}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h4 style={{ fontSize:"0.9rem", color:C.gold, fontWeight:700, marginBottom:10 }}>ℹ️ تفاصيل بطاقة المعلم الإعلانية</h4>
            <p style={{ fontSize:"0.82rem", color:C.text, lineHeight:1.6, marginBottom:16 }}>{teacher.bio}</p>
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, fontSize:"0.8rem", color:C.muted, display:"flex", flexDirection:"column", gap: 4 }}>
            <div>📅 <b>المواعيد:</b> {teacher.schedule}</div>
            <div>📍 <b>المكان:</b> {teacher.location}</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Students = ({ students, setStudents, onSendReminder, isFullyActivated, teacherPhone }) => {
  const [search, setSearch] = useState(""); const [modal, setModal] = useState(null);
  const empty = { name:"", parent:"", phone:"", age:"", surah:"", juz:"", page:"", notes:"" };
  const [form, setForm] = useState(empty);
  const filtered = students.filter(s => s.name.includes(search) || s.parent.includes(search));

  const doSave = () => {
    if (!form.name || !form.phone) return;
    if (modal === "add") {
      setStudents(p => [...p, { id:Date.now(), ...form, age:+form.age||0, page:+form.page||0, joined:new Date().toISOString().split("T")[0], paid:false }]);
    } else {
      setStudents(p => p.map(s => s.id === modal.id ? { ...s, ...form, age:+form.age||0, page:+form.page||0 } : s));
    }
    setModal(null);
  };

  const handleAddStudentClick = () => {
    if (!isFullyActivated && students.length >= 5) {
      alert("⚠️ لقد استهلكت الحد الأقصى للنسخة التجريبية (5 طلاب).\n\nيرجى التواصل لتفعيل النسخة الكاملة لفتح عدد غير محدود من الطلاب! 🚀");
      window.open(`https://wa.me/2${teacherPhone}?text=` + encodeURIComponent("مرحباً، أود ترقية نظام الحلقة الذكية للاشتراك في النسخة الكاملة لفتح حد الطلاب."), "_blank");
      return;
    }
    setForm(empty);
    setModal("add");
  };

  const handleEditStudentClick = (student) => {
    setForm({ ...student });
    setModal(student);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب نهائياً؟")) {
      setStudents(p => p.filter(s => s.id !== id));
    }
  };

  const handleMarkAsPaid = (id) => {
    setStudents(p => p.map(s => s.id === id ? { ...s, paid: true, paidDate: new Date().toISOString().split("T")[0] } : s));
  };

  const exportToExcel = (filterType = "all") => {
    const dataToExport = filterType === "paid" ? students.filter(s => s.paid) : students;
    if (dataToExport.length === 0) { alert("لا توجد بيانات للتصدير!"); return; }
    const headers = ["اسم الطالب", "ولي الأمر", "الهاتف", "العمر", "السورة", "الجزء", "الصفحة", "الحالة"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(s => [`"${s.name}"`, `"${s.parent}"`, `"${s.phone}"`, s.age, `"${s.surah || ''}"`, `"${s.juz || ''}"`, s.page || 0, s.paid ? "مسدد" : "معلق"].join(","))
    ].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Students_${filterType}_${new Date().toLocaleDateString('ar-EG')}.csv`;
    link.click();
  };

  return (
    <div>
      <PageHeader
        title="دليل الحلقات والمحفوظ"
        sub={isFullyActivated ? `إدارة شؤون الطلاب الحاليين (${students.length})` : `إدارة شؤون الطلاب الحاليين (${students.length} من أصل 5 طُلاب في النسخة التجريبية)`}
        action={
          <>
            <Btn variant="secondary" onClick={() => exportToExcel("all")} style={{ fontSize: "0.75rem" }}>📥 تصدير الكل</Btn>
            <Btn variant="secondary" onClick={() => exportToExcel("paid")} style={{ fontSize: "0.75rem" }}>🔥 المدفوعين</Btn>
            <Btn onClick={handleAddStudentClick}>+ إضافة طالب</Btn>
          </>
        }
      />

      <Card style={{ marginBottom: 16, padding: "10px 16px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم الطالب أو رقم الهاتف..." style={{ width: "100%", padding: "6px", background: "transparent", border: "none", color: "#fff", outline: "none", fontFamily: "'Cairo'" }} />
      </Card>

      <Card style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <TH>الطالب</TH>
              <TH>ولي الأمر</TH>
              <TH>الهاتف</TH>
              <TH>المحفوظ الحالي</TH>
              <TH style={{ textAlign: "center" }}>الحالة</TH>
              <TH style={{ textAlign: "center" }}>الإجراءات</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <TD>
                  <b style={{ color: C.text }}>{s.name}</b>
                  <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 2 }}>العمر: {s.age || "-"} سنوات</div>
                </TD>
                <TD>{s.parent}</TD>
                <TD style={{ fontFamily: "monospace" }}>{s.phone}</TD>
                <TD>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {s.surah && <span style={{ color: "#C9A84C", fontWeight: "bold" }}>📖 سورة {s.surah}</span>}
                    <div style={{ display: "flex", gap: "8px", fontSize: "0.75rem", color: C.muted }}>
                      {s.juz && <span>{s.juz}</span>}
                      {s.page ? <span>📄 صـ {s.page}</span> : null}
                    </div>
                    {!s.surah && !s.juz && !s.page && <span style={{ color: C.muted }}>-</span>}
                  </div>
                </TD>
                <TD style={{ textAlign: "center" }}>
                  {s.paid ? (
                    <Badge color={C.green}>مُسدد</Badge>
                  ) : (
                    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
                      <Badge color={C.amber}>معلق</Badge>
                      <Btn variant="ghost" style={{ padding: "4px 8px", fontSize: "0.7rem", borderColor: C.green, color: C.green }} onClick={() => handleMarkAsPaid(s.id)}>تفعيل</Btn>
                    </div>
                  )}
                </TD>
                <TD style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <Btn variant="ghost" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={() => handleEditStudentClick(s)}>تعديل</Btn>
                    <Btn variant="ghost" style={{ padding: "6px 10px", fontSize: "0.75rem", borderColor: C.red, color: C.red }} onClick={() => handleDeleteStudent(s.id)}>حذف</Btn>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "add" ? "سجل طالب جديد" : "تعديل بيانات الطالب"}>
        <Input label="اسم الطالب رباعي *" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="اسم ولي الأمر" value={form.parent || ""} onChange={e => setForm({ ...form, parent: e.target.value })} />
        <Input label="رقم الهاتف (واتساب) *" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", color: C.gold, fontSize: "0.8rem", marginBottom: "6px", fontWeight: "bold" }}>📖 السورة الحالية:</label>
          <select 
            value={form.surah || ""} 
            onChange={(e) => setForm({...form, surah: e.target.value})}
            style={{ width: "100%", padding: "12px", background: "#1A2638", color: "#fff", borderRadius: "10px", border: "1px solid rgba(201, 168, 76, 0.25)", outline: "none", fontFamily:"'Cairo'", fontSize: "0.85rem" }}
          >
            <option value="">اختر السورة...</option>
            {QURAN_SURAS.map((sura) => (
              <option key={sura} value={sura}>{sura}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "0.78rem", color: C.muted, display: "block", marginBottom: "6px", fontWeight: 600 }}>الجزء</span>
            <select 
              value={form.juz || ""} 
              onChange={(e) => setForm({...form, juz: e.target.value})}
              style={{ width: "100%", padding: "12px", background: "#1A2638", color: "#fff", borderRadius: "10px", border: "1px solid rgba(201, 168, 76, 0.25)", outline: "none", fontFamily:"'Cairo'", fontSize: "0.85rem" }}
            >
              <option value="">اختر...</option>
              {QURAN_JUZS.map((juz) => (
                <option key={juz} value={juz}>{juz}</option>
              ))}
            </select>
          </div>

          <div>
            <span style={{ fontSize: "0.78rem", color: C.muted, display: "block", marginBottom: "6px", fontWeight: 600 }}>رقم الصفحة</span>
            <input 
              type="number" 
              min="1" 
              max="604"
              placeholder="1-604"
              value={form.page || ""} 
              onChange={(e) => setForm({...form, page: e.target.value})}
              style={{ width: "100%", padding: "12px", background: "#1A2638", color: "#fff", borderRadius: "10px", border: "1px solid rgba(201, 168, 76, 0.25)", textAlign: "center", outline: "none", fontFamily:"'Cairo'", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <span style={{ fontSize: "0.78rem", color: C.muted, display: "block", marginBottom: "6px", fontWeight: 600 }}>العمر</span>
            <input 
              type="number" 
              placeholder="سنوات"
              value={form.age || ""} 
              onChange={(e) => setForm({...form, age: e.target.value})}
              style={{ width: "100%", padding: "12px", background: "#1A2638", color: "#fff", borderRadius: "10px", border: "1px solid rgba(201, 168, 76, 0.25)", textAlign: "center", outline: "none", fontFamily:"'Cairo'", fontSize: "0.85rem" }}
            />
          </div>
        </div>

        <Btn onClick={doSave} style={{ width: "100%", justifyContent: "center", marginTop: 4, padding: "12px" }}>حفظ البيانات 💾</Btn>
      </Modal>
    </div>
  );
};

const Attendance = ({ students, attendance, setAttendance }) => {
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split("T")[0]);
  const current = attendance.find(a => a.date === activeDate) || { present: [], absent: [] };

  const toggle = (id, type) => {
    setAttendance(prev => {
      const rest = prev.filter(a => a.date !== activeDate);
      let r = prev.find(a => a.date === activeDate) || { id: Date.now(), date: activeDate, present: [], absent: [] };
      
      r.present = (r.present || []).filter(x => x !== id); 
      r.absent = (r.absent || []).filter(x => x !== id);
      
      if (type === "p") r.present.push(id); 
      if (type === "a") r.absent.push(id);
      
      return [...rest, r];
    });
  };

  const exportMonthlyReport = () => {
    const allDates = [...new Set(attendance.map(a => a.date))].sort();
    if (allDates.length === 0) { alert("لا توجد سجلات حضور لتصديرها!"); return; }
    const headers = ["اسم الطالب", ...allDates];
    const rows = students.map(student => {
      const studentRow = [student.name];
      allDates.forEach(date => {
        const dayRecord = attendance.find(a => a.date === date);
        if (dayRecord) {
          if (dayRecord.present?.includes(student.id)) studentRow.push("حاضر");
          else if (dayRecord.absent?.includes(student.id)) studentRow.push("غائب");
          else studentRow.push("—");
        } else { studentRow.push("—"); }
      });
      return studentRow;
    });
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Monthly_Attendance_Report.csv`;
    link.click();
  };

  const exportStudentAttendance = (studentId, studentName) => {
    const studentAttendance = attendance
      .filter(a => (a.present && a.present.includes(studentId)) || (a.absent && a.absent.includes(studentId)))
      .map(a => ({
        date: a.date,
        status: a.present.includes(studentId) ? "حاضر" : "غائب"
      }));

    if (studentAttendance.length === 0) { 
      alert(`لا توجد سجلات حضور أو غياب مسجلة للتاريخ الحالي لـ ${studentName}`); 
      return; 
    }
    
    const headers = ["التاريخ", "الحالة"];
    const csvContent = [headers.join(","), ...studentAttendance.map(a => [`"${a.date}"`, `"${a.status}"`].join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Attendance_${studentName.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <div>
      <PageHeader 
        title="سجل الحضور والغياب" 
        action={
          <>
            <Btn variant="secondary" onClick={exportMonthlyReport}>📊 تصدير التقرير الشامل</Btn>
            <input 
              type="date" 
              value={activeDate} 
              onChange={e => setActiveDate(e.target.value)} 
              style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, padding:"10px 14px", borderRadius:10, fontFamily:"'Cairo'", outline: "none", fontSize: "0.85rem" }} 
            />
          </>
        } 
      />
      <Card style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>اسم الطالب</TH><TH>رقم التواصل</TH><TH style={{ textAlign:"center" }}>التحضير اليومي</TH></tr></thead>
          <tbody>
            {students.map(s => {
              const isPresent = current.present && current.present.includes(s.id);
              const isAbsent = current.absent && current.absent.includes(s.id);

              return (
                <tr key={s.id}>
                  <TD>
                    <b style={{ color: C.text }}>{s.name}</b>
                    <button onClick={() => exportStudentAttendance(s.id, s.name)} style={{ background: "transparent", border: "none", color: C.blue, cursor: "pointer", marginRight: "12px", fontSize: "0.75rem", fontFamily:"'Cairo'", fontWeight: 600 }} title="تصدير سجل حضور الطالب">📋 كشف فردي</button>
                  </TD>
                  <TD style={{ fontFamily: "monospace" }}>{s.phone}</TD>
                  <TD style={{ textAlign:"center", whiteSpace:"nowrap" }}>
                    <Btn 
                      variant={isPresent ? "success" : "ghost"} 
                      style={{ padding:"6px 14px", fontSize:"0.8rem", marginLeft:8, border: isPresent ? "none" : `1px solid ${C.green}`, color: isPresent ? "#0C1520" : C.green }} 
                      onClick={() => toggle(s.id, "p")}
                    >
                      ✓ حاضر
                    </Btn>
                    <Btn 
                      variant={isAbsent ? "failed" : "ghost"} 
                      style={{ padding:"6px 14px", fontSize:"0.8rem", border: isAbsent ? "none" : `1px solid ${C.red}`, color: isAbsent ? "#fff" : C.red }} 
                      onClick={() => toggle(s.id, "a")}
                    >
                      × غائب
                    </Btn>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// --- إكمال كود صفحة المدفوعات الناقص وإنشاء الـ Main App ---

const Payments = ({ students, payments, setPayments, setStudents, teacher }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId:"", amount:teacher.fee, month:"مايو 2026", method:"فودافون كاش" });

  const doSave = () => {
    if (!form.studentId) return;
    setPayments(p => [...p, { id:Date.now(), studentId:+form.studentId, amount:+form.amount, date:new Date().toISOString().split("T")[0], month:form.month, method:form.method }]);
    setStudents(p => p.map(s => s.id === +form.studentId ? { ...s, paid:true } : s));
    setModal(false);
  };

  return (
    <div>
      <PageHeader title="الخزينة والمدفوعات" sub="إدارة ومراجعة التحويلات المالية للمشتركين" action={<Btn onClick={() => setModal(true)}>＋ تسجيل تحويل مالي</Btn>} />
      <Card style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>اسم الطالب</TH><TH>المبلغ</TH><TH style={{ textAlign: "center" }}>وسيلة الدفع</TH><TH>التاريخ</TH><TH>الاشتراك</TH></tr></thead>
          <tbody>
            {payments.map(p => {
              const st = students.find(s => s.id === p.studentId);
              return (
                <tr key={p.id}>
                  <TD style={{ fontWeight: 600 }}>{st ? st.name : "طالب محذوف"}</TD>
                  <TD style={{ color: C.green, fontWeight: "bold" }}>{p.amount} ج.م</TD>
                  <TD style={{ textAlign: "center" }}><Badge color={C.purple}>{p.method}</Badge></TD>
                  <TD style={{ fontFamily: "monospace" }}>{p.date}</TD>
                  <TD>{p.month}</TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="تسجيل عملية تحويل جديدة">
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize:"0.8rem", color:C.gold, marginBottom:6, display:"block", fontWeight:600 }}>اختر الطالب *</label>
          <select value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} style={{ width:"100%", background:"#1A2638", border:`1px solid rgba(201,168,76,0.25)`, borderRadius:10, padding:"12px 14px", color:C.text, fontFamily:"'Cairo'", fontSize:"0.85rem", outline:"none" }}>
            <option value="">اختر طالباً من الحلقة...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <Input label="المبلغ المسدد (ج.م)" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
        <Select label="شهر الاشتراك" value={form.month} onChange={e => setForm({...form, month: e.target.value})} options={[{value:"مايو 2026", label:"مايو 2026"}, {value:"يونيو 2026", label:"يونيو 2026"}]} />
        <Select label="طريقة التحويل" value={form.method} onChange={e => setForm({...form, method: e.target.value})} options={[{value:"فودافون كاش", label:"فودافون كاش"}, {value:"انستا باي", label:"انستا باي"}, {value:"فيزا / بطاقة", label:"فيزا / بطاقة"}, {value:"نقداً", label:"نقداً"}]} />
        <Btn onClick={doSave} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>تأكيد وحفظ المعاملة 💰</Btn>
      </Modal>
    </div>
  );
};

const Settings = ({ teacher, setTeacher, isFullyActivated, teacherPhone }) => {
  const [form, setForm] = useState({ ...teacher });
  const handleSave = () => {
    setTeacher(form);
    alert("تم حفظ إعدادات وبيانات المعلم بنجاح! ✨");
  };

  return (
    <div>
      <PageHeader title="إعدادات الحلقة وحساب المعلم" sub="تحديث بيانات وبطاقة التعريف التسويقية للمعلم" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <Card>
          <h3 style={{ fontSize: "1rem", color: C.gold, marginBottom: 16, fontWeight: 700 }}>⚙️ البيانات الأساسية</h3>
          <Input label="اسم الشيخ / المعلم *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Input label="رقم الهاتف (الواتساب للتذكير) *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="العنوان / المقر الرئيسي" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <Input label="قيمة الاشتراك الشهري الثابت (ج.م)" type="number" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} />
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1rem", color: C.gold, marginBottom: 16, fontWeight: 700 }}>📄 النبذة الإعلانية ومنافذ الدفع</h3>
            <Input label="النبذة التعريفية (تظهر للطلاب الجدد)" as="textarea" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
            <Input label="رقم محفظة فودافون كاش" value={form.vodafoneCash} onChange={e => setForm({...form, vodafoneCash: e.target.value})} />
            <Input label="عنوان انستا باي (InstaPay ID)" value={form.instaPayId} onChange={e => setForm({...form, instaPayId: e.target.value})} />
          </div>
          <Btn onClick={handleSave} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>حفظ كافة التغييرات 💾</Btn>
        </Card>
      </div>
      {!isFullyActivated && (
        <Card style={{ marginTop: 20, borderColor: C.amber, background: "rgba(245,158,11,0.03)" }}>
          <h3 style={{ color: C.amber, fontSize: "0.95rem", fontWeight: 700, marginBottom: 6 }}>🔒 النسخة التجريبية نشطة</h3>
          <p style={{ fontSize: "0.82rem", color: C.text, lineHeight: 1.6 }}>أنت تعمل حالياً بالحد الأقصى (5 طلاب). للترقية وفتح عدد غير محدود من الطلاب وتخصيص الدومين، تواصل مع الدعم الفني لتفعيل النظام بالكامل.</p>
          <Btn variant="secondary" style={{ marginTop: 12, borderColor: C.amber, color: C.amber }} onClick={() => window.open(`https://wa.me/2${teacherPhone}?text=` + encodeURIComponent("أود تفعيل النسخة الكاملة لنظام الحلقة الذكية"), "_blank")}>طلب الترقية الفورية 🚀</Btn>
        </Card>
      )}
    </div>
  );
};

// --- المكون الرئيسي الرابط لجميع أجزاء لوحة التحكم والـ Security Check ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isFullyActivated, setIsFullyActivated] = useState(false); // تعديلها لـ true يفعل النظام بالكامل بدون ليميت

  // استرجاع البيانات المخزنة والمشفرة أو استخدام الـ Samples في حال عدم وجودها
  const [students, setStudents] = useState(() => LS.get("halqa_students", SAMPLE_STUDENTS));
  const [payments, setPayments] = useState(() => LS.get("halqa_payments", SAMPLE_PAYMENTS));
  const [attendance, setAttendance] = useState(() => LS.get("halqa_attendance", SAMPLE_ATTENDANCE));
  const [teacher, setTeacher] = useState(() => LS.get("halqa_teacher", DEFAULT_TEACHER_CONFIG));

  // الحفظ التلقائي المشفر عند حدوث أي تعديل
  useEffect(() => { LS.set("halqa_students", students); }, [students]);
  useEffect(() => { LS.set("halqa_payments", payments); }, [payments]);
  useEffect(() => { LS.set("halqa_attendance", attendance); }, [attendance]);
  useEffect(() => { LS.set("halqa_teacher", teacher); }, [teacher]);

  // الحماية البرمجية للتحقق من الاستضافة الشرعية (Security & Anti-piracy host check)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && !hostname.endsWith(SECURITY_CONFIG.allowedHostSuffix)) {
        document.body.innerHTML = `<div style="background:#0C1520;color:#EF4444;text-align:center;padding:100px;font-family:'Cairo';direction:rtl;"><h2>⚠️ خطأ في ترخيص النظام</h2><p>هذه النسخة غير مصرح لها بالعمل على هذا النطاق الخارجي. يرجى التواصل مع إدارة <b>The Win Route</b>.</p></div>`;
      }
    }
  }, []);

  const handleLogin = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error);
      alert("بيانات الدخول غير صحيحة");
      return;
    }

    if (data?.user) {
      setIsLoggedIn(true);
    }

  } catch (err) {
    console.log(err);
    alert("حدث خطأ غير متوقع");
  }
};
  const sendWhatsAppReminder = (student) => {
    const message = `السلام عليكم ورحمة الله وبركاته،\nنود تذكيركم بموعد سداد اشتراك حلقة القرآن الكريم لشهر مايو للابن/الابنة: *${student.name}*.\nالمبلغ المطلوب: *${teacher.fee} ج.م*.\nيمكنكم التحويل عبر:\n- فودافون كاش: ${teacher.vodafoneCash}\n- انستا باي: ${teacher.instaPayId}\nشاكرين ومقدرين حسن تعاونكم وجزاكم الله خيراً.`;
    window.open(`https://wa.me/2${student.phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Cairo', sans-serif", direction: "rtl", display: "flex" }}>
      {/* Sidebar القائمة الجانبية للتنقل الذكي */}
      <aside style={{ width: 260, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
            <span style={{ fontSize: 24 }}>🕌</span>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: C.gold, lineHeight: 1 }}>الحلقة الذكية</h2>
              <span style={{ fontSize: "0.68rem", color: C.muted }}>إصدار 2026 المستقر</span>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "dashboard", label: "لوحة التحكم", icon: "📊" },
              { id: "students", label: "دليل الطلاب والحفظ", icon: "👥" },
              { id: "attendance", label: "الحضور والغياب", icon: "📝" },
              { id: "payments", label: "الخزينة والمالية", icon: "💰" },
              { id: "settings", label: "إعدادات المعلم", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: activeTab === tab.id ? g.gold : "transparent",
                  color: activeTab === tab.id ? "#1A1208" : C.text,
                  cursor: "pointer",
                  fontFamily: "'Cairo'",
                  fontSize: "0.85rem",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  textAlign: "right",
                  transition: "all 0.2s"
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* التذييل والعلامة المائية للأمان وحفظ الحقوق */}
        <div style={{ fontSize: "0.7rem", color: C.muted, textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div>{SECURITY_CONFIG.watermark}</div>
        </div>
      </aside>

      {/* منطقة عرض المحتوى النشط والديناميكي */}
      <main style={{ flex: 1, padding: 32, boxSizing: "border-box", overflowY: "auto", maxHeight: "100vh" }}>
        {activeTab === "dashboard" && <Dashboard students={students} payments={payments} teacher={teacher} onSendReminder={sendWhatsAppReminder} isFullyActivated={isFullyActivated} />}
        {activeTab === "students" && <Students students={students} setStudents={setStudents} onSendReminder={sendWhatsAppReminder} isFullyActivated={isFullyActivated} teacherPhone={teacher.phone} />}
        {activeTab === "attendance" && <Attendance students={students} attendance={attendance} setAttendance={setAttendance} />}
        {activeTab === "payments" && <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacher} />}
        {activeTab === "settings" && <Settings teacher={teacher} setTeacher={setTeacher} isFullyActivated={isFullyActivated} teacherPhone={teacher.phone} />}
      </main>
    </div>
  );
}
