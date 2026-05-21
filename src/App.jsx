import { useState, useEffect } from "react";

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

const C = { bg: "#0C1520", surface: "#111C2A", card: "#162030", border: "rgba(201,168,76,0.12)", gold: "#C9A84C", text: "#E4DAC8", muted: "rgba(228,218,200,0.4)", green: "#34D399", red: "#EF4444", amber: "#F59E0B", blue: "#60A5FA", purple: "#A78BFA" };
const g = { gold: "linear-gradient(135deg, #C9A84C, #E8C97A)" };

const Badge = ({ children, color = C.green }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:`${color}1A`, color, border:`1px solid ${color}33`, whiteSpace:"nowrap" }}>{children}</span>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled=false, type="button" }) => {
  const styles = {
    primary: { background: g.gold, color:"#1A1208" },
    secondary: { background:`${C.gold}15`, color:C.gold, border:`1px solid ${C.gold}30` },
    ghost: { background:"rgba(255,255,255,0.04)", color:C.text, border:"1px solid rgba(255,255,255,0.08)" },
    danger: { background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30` },
    success: { background: C.green, color: "#0C1520", fontWeight: "bold" },
    failed: { background: C.red, color: "#fff", fontWeight: "bold" }
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 16px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontFamily:"'Cairo',sans-serif", fontSize:"0.8rem", fontWeight:600, opacity:disabled?0.5:1, transition: "all 0.2s ease", ...styles[variant], ...style }}>{children}</button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, width:"100%", boxSizing:"border-box", ...style }}>{children}</div>
);

const Input = ({ label, value, onChange, type="text", placeholder="", as="input" }) => (
  <div style={{ marginBottom:16, width:"100%", boxSizing:"border-box" }}>
    {label && <label style={{ fontSize:"0.8rem", color:C.gold, marginBottom:6, display:"block", fontWeight:600 }}>{label}</label>}
    {as === "textarea"
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", background:"#1A2638", border:`1px solid rgba(201,168,76,0.25)`, borderRadius:10, padding:"12px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:80, boxSizing:"border-box" }} />
      : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", background:"#1A2638", border:`1px solid rgba(201,168,76,0.25)`, borderRadius:10, padding:"12px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", boxSizing:"border-box" }} />
    }
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:16, width:"100%", boxSizing:"border-box" }}>
    {label && <label style={{ fontSize:"0.8rem", color:C.gold, marginBottom:6, display:"block", fontWeight:600 }}>{label}</label>}
    <select value={value} onChange={onChange} style={{ width:"100%", background:"#1A2638", border:`1px solid rgba(201,168,76,0.25)`, borderRadius:10, padding:"12px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", cursor:"pointer", boxSizing:"border-box" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1100, padding:16 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:24, width:"100%", maxWidth:460, maxHeight:"85vh", overflowY:"auto", boxSizing:"border-box", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:800, color:C.gold, fontSize:"1.05rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:28, cursor:"pointer", padding:0, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const PageHeader = ({ title, sub, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16, marginBottom:24 }}>
    <div>
      <h2 style={{ fontSize:"1.3rem", fontWeight:800, color:C.gold }}>{title}</h2>
      {sub && <p style={{ fontSize:"0.82rem", color:C.muted, marginTop:4 }}>{sub}</p>}
    </div>
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems: "center" }}>{action}</div>
  </div>
);

const TH = ({ children, style={} }) => <th style={{ padding:"14px 12px", textAlign:"right", fontSize:"0.75rem", color:C.gold, fontWeight:700, borderBottom:`2px solid ${C.border}`, whiteSpace:"nowrap", ...style }}>{children}</th>;
const TD = ({ children, style={} }) => <td style={{ padding:"14px 12px", fontSize:"0.85rem", borderBottom:`1px solid rgba(255,255,255,0.04)`, color:C.text, whiteSpace:"nowrap", textAlign:"right", ...style }}>{children}</td>;

const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState(""); const [pass, setPass] = useState("");
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", direction:"rtl", padding:16, boxSizing:"border-box" }}>
      <Card style={{ maxWidth:380, padding:32, textAlign:"center" }}>
        <div style={{ width:70, height:70, background:g.gold, borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px" }}>🕌</div>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.gold, marginBottom:6 }}>الحلقة الذكية</h1>
        <p style={{ fontSize:"0.82rem", color:C.muted, marginBottom:24 }}>لوحة تحكم وإشراف معلمين القرآن الكريم</p>
        <Input label="اسم المستخدم" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
        <Input label="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="1234" />
        <Btn onClick={onLogin} style={{ width:"100%", marginTop:12, py: 12 }}>دخول لوحة التحكم</Btn>
      </Card>
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

      {/* النافذة المنبثقة لإضافة وتعديل بيانات الطلاب باحترافية وتنسيقات الـ UX المحسنة */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "add" ? "سجل طالب جديد" : "تعديل بيانات الطالب"}>
        <Input label="اسم الطالب رباعي *" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="اسم ولي الأمر" value={form.parent || ""} onChange={e => setForm({ ...form, parent: e.target.value })} />
        <Input label="رقم الهاتف (واتساب) *" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
        
        {/* حقل اختيار السورة المنسدل */}
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

        {/* سطر الحفظ الرقمي والعمر */}
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
  
  // تأمين جلب البيانات لليوم الحالي بشكل صحيح لتجنب الـ undefined
  const current = attendance.find(a => a.date === activeDate) || { present: [], absent: [] };

  const toggle = (id, type) => {
    setAttendance(prev => {
      const rest = prev.filter(a => a.date !== activeDate);
      let r = prev.find(a => a.date === activeDate) || { id: Date.now(), date: activeDate, present: [], absent: [] };
      
      // تنظيف المعرف من القائمتين أولاً لمنع التكرار
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

  // 🛠️ تم إصلاح المنطق هنا لفحص مصفوفات الحضور والغياب بدقة لتشغيل الكشف الفردي
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
              // التحقق من حالة الطالب الحالية في اليوم المختار لشغل ألوان الأزرار بكفاءة
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
            {payments.map(p => (
              <tr key={p.id}>
                <TD style={{ fontWeight: 600 }}>{students.find(s => s.id === p.studentId)?.name || "طالب نشط"}</TD>
                <TD style={{ color:C.gold, fontWeight:800 }}>{p.amount} ج.م</TD>
                <TD style={{ textAlign: "center" }}><Badge color={p.method==="فودافون كاش"?C.red:p.method==="انستا باي"?C.green:C.blue}>{p.method}</Badge></TD>
                <TD style={{ fontFamily: "monospace" }}>{p.date}</TD>
                <TD>{p.month}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="تسجيل عملية سداد">
        <Select label="اختر الطالب" value={form.studentId} onChange={e => setForm({...form, studentId:e.target.value})} options={[{ value:"", label:"اختر الطالب من القائمة..." }, ...students.map(s => ({ value:s.id, label:s.name }))]} />
        <Input label="المبلغ المستحق" type="number" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} />
        <Select label="وسيلة التحويل المالي" value={form.method} onChange={e => setForm({...form, method:e.target.value})} options={[{value:"فودافون كاش", label:"📱 فودافون كاش"}, {value:"انستا باي", label:"⚡ انستا باي"}, {value:"فيزا / بطاقة", label:"💳 فيزا"}]} />
        <Btn onClick={doSave} disabled={!form.studentId} style={{ width:"100%", marginTop:12, padding: "12px" }}>تأكيد وعمل الحفظ للتحصيل 💸</Btn>
      </Modal>
    </div>
  );
};

const Reminders = ({ teacher, botState, setBotState, botFlows }) => {
  const currentBot = botFlows[botState] || botFlows.start;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
      <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize:"0.95rem", fontWeight:700, color:C.gold, marginBottom:10 }}>📢 أتمتة قنوات التحويل الذكي</h3>
          <p style={{ fontSize:"0.82rem", lineHeight:1.6, color:C.text }}>يقوم البوت بتزويد أولياء الأمور ببيانات محفظة فودافون كاش وانستا باي تلقائياً لضمان التحصيل الفوري السريع للحلقة.</p>
        </div>
        <div style={{ marginTop:16, padding:14, background:"rgba(0, 0, 0, 0.2)", borderRadius:10, fontSize:"0.8rem", display: "flex", flexDirection: "column", gap: 6, border: `1px solid ${C.border}` }}>
          <div>📱 <b>فودافون كاش:</b> <span style={{ fontFamily: "monospace", color: C.gold }}>{teacher.vodafoneCash}</span></div>
          <div>⚡ <b>انستا باي:</b> <span style={{ fontFamily: "monospace", color: C.gold }}>{teacher.instaPayId}</span></div>
        </div>
      </Card>
      
      <Card style={{ minHeight:360, display:"flex", flexDirection:"column", padding: 20 }}>
        <h3 style={{ fontSize: "0.9rem", color: C.text, marginBottom: 12, fontWeight: 700 }}>🤖 محاكاة واجهة الشات بوت الذكي</h3>
        <div style={{ flex:1, background:"#080F18", borderRadius:12, padding:16, display:"flex", flexDirection:"column", overflowY:"auto", gap: 12, border: "1px solid rgba(255,255,255,0.02)" }}>
          <div style={{ background:C.card, padding:12, borderRadius:"12px 12px 0 12px", maxWidth:"85%", fontSize:"0.85rem", whiteSpace:"pre-line", lineHeight:1.5, color: C.text, border: `1px solid ${C.border}`, alignSelf: "flex-start" }}>
            {currentBot.msg}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, width: "100%" }}>
            {currentBot.options.map((o, i) => o.link ? (
              <a key={i} href={o.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Btn variant="secondary" style={{ width: "100%", justifyContent: "center" }}>{o.text}</Btn>
              </a>
            ) : (
              <Btn key={i} variant="ghost" onClick={() => setBotState(o.next)} style={{ width: "100%", justifyContent: "center" }}>{o.text}</Btn>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
