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
  { id: 1, name: "أحمد محمد علي", parent: "محمد علي", phone: "01012345678", age: 10, joined: "2026-05-01", paid: true, paidDate: "2026-05-01", surah: "البقرة", memorized: 12, attendance: 90, notes: "" },
  { id: 2, name: "يوسف عبدالرحمن", parent: "عبدالرحمن سالم", phone: "01123456789", age: 9, joined: "2026-05-02", paid: false, paidDate: null, surah: "آل عمران", memorized: 8, attendance: 75, notes: "يحتاج متابعة" },
  { id: 3, name: "عمر خالد حسن", parent: "خالد حسن", phone: "01234567890", age: 11, joined: "2026-04-20", paid: true, paidDate: "2026-05-03", surah: "النساء", memorized: 20, attendance: 95, notes: "" },
  { id: 4, name: "إبراهيم سامي", parent: "سامي إبراهيم", phone: "01098765432", age: 8, joined: "2026-05-10", paid: true, paidDate: "2026-05-01", surah: "الفاتحة", memorized: 3, attendance: 85, notes: "" },
  { id: 5, name: "زياد طارق", parent: "طارق زياد", phone: "01187654321", age: 12, joined: "2026-04-01", paid: false, paidDate: null, surah: "المائدة", memorized: 25, attendance: 60, notes: "غياب متكرر" },
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
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:`${color}1A`, color, border:`1px solid ${color}33`, whiteSpace:"nowrap" }}>{children}</span>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled=false, type="button" }) => {
  const styles = {
    primary: { background: g.gold, color:"#1A1208" },
    secondary: { background:`${C.gold}15`, color:C.gold, border:`1px solid ${C.gold}30` },
    ghost: { background:"rgba(255,255,255,0.05)", color:C.text, border:"1px solid rgba(255,255,255,0.08)" },
    danger: { background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontFamily:"'Cairo',sans-serif", fontSize:"0.8rem", fontWeight:600, opacity:disabled?0.5:1, ...styles[variant], ...style }}>{children}</button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, width:"100%", boxSizing:"border-box", ...style }}>{children}</div>
);

const Input = ({ label, value, onChange, type="text", placeholder="", as="input" }) => (
  <div style={{ marginBottom:12, width:"100%", boxSizing:"border-box" }}>
    {label && <label style={{ fontSize:"0.75rem", color:C.muted, marginBottom:5, display:"block", fontWeight:600 }}>{label}</label>}
    {as === "textarea"
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:60, boxSizing:"border-box" }} />
      : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", boxSizing:"border-box" }} />
    }
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:12, width:"100%", boxSizing:"border-box" }}>
    {label && <label style={{ fontSize:"0.75rem", color:C.muted, marginBottom:5, display:"block", fontWeight:600 }}>{label}</label>}
    <select value={value} onChange={onChange} style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", cursor:"pointer", boxSizing:"border-box" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1100, padding:16 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:20, width:"100%", maxWidth:440, maxHeight:"90vh", overflowY:"auto", boxSizing:"border-box" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontWeight:700, color:C.gold, fontSize:"0.95rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:24, cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const PageHeader = ({ title, sub, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:"1.2rem", fontWeight:800, color:C.gold }}>{title}</h2>
      {sub && <p style={{ fontSize:"0.78rem", color:C.muted, marginTop:2 }}>{sub}</p>}
    </div>
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{action}</div>
  </div>
);

const TH = ({ children }) => <th style={{ padding:"12px", textAlign:"right", fontSize:"0.72rem", color:C.muted, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{children}</th>;
const TD = ({ children }) => <td style={{ padding:"12px", fontSize:"0.82rem", borderBottom:`1px solid rgba(255,255,255,0.03)`, color:C.text, whiteSpace:"nowrap" }}>{children}</td>;

const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState(""); const [pass, setPass] = useState("");
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", direction:"rtl", padding:16, boxSizing:"border-box" }}>
      <Card style={{ maxWidth:360, padding:24, textAlign:"center" }}>
        <div style={{ width:60, height:60, background:g.gold, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 12px" }}>🕌</div>
        <h1 style={{ fontSize:"1.3rem", fontWeight:800, color:C.gold, marginBottom:4 }}>الحلقة الذكية</h1>
        <p style={{ fontSize:"0.78rem", color:C.muted, marginBottom:20 }}>لوحة تحكم وإشراف معلمين القرآن الكريم</p>
        <Input label="اسم المستخدم" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
        <Input label="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="1234" />
        <Btn onClick={onLogin} style={{ width:"100%", marginTop:10 }}>دخول لوحة التحكم</Btn>
      </Card>
    </div>
  );
};

const Dashboard = ({ students, payments, teacher, onSendReminder }) => {
  const total = students.length; const paid = students.filter(s => s.paid).length;
  const monthRev = payments.reduce((a, p) => a + p.amount, 0);
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:"1.25rem", fontWeight:800, color:C.gold }}>مرحباً بك، {teacher.name} 👋</h1>
        <p style={{ fontSize:"0.78rem", color:C.muted }}>إليك ملخص سريع لأداء وإحصائيات الحلقة القرآنية اليوم</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12, marginBottom:20 }}>
        <Card><div style={{ fontSize:"1.6rem", fontWeight:900, color:C.blue }}>{total} / 5</div><div style={{ fontSize:"0.75rem", color:C.muted, marginTop:4 }}>إجمالي الطلاب (الحد التجريبي)</div></Card>
        <Card><div style={{ fontSize:"1.6rem", fontWeight:900, color:C.green }}>{paid}</div><div style={{ fontSize:"0.75rem", color:C.muted, marginTop:4 }}>الطلاب المسددين this month</div></Card>
        <Card><div style={{ fontSize:"1.6rem", fontWeight:900, color:C.gold }}>{monthRev.toLocaleString()} ج.م</div><div style={{ fontSize:"0.75rem", color:C.muted, marginTop:4 }}>مداخيل شهر مايو</div></Card>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:14 }}>
        <Card style={{ overflowX:"auto" }}>
          <h3 style={{ fontSize:"0.85rem", fontWeight:700, marginBottom:10 }}>📋 نظرة على الحفظ والمتابعة</h3>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>اسم الطالب</TH><TH>السورة</TH><TH>الإنجاز</TH><TH>الحالة / التذكير</TH></tr></thead>
            <tbody>
              {students.slice(0, 3).map(s => (
                <tr key={s.id}>
                  <TD>{s.name}</TD>
                  <TD>{s.surah || "—"}</TD>
                  <TD><Badge color={C.purple}>{s.memorized} ص</Badge></TD>
                  <TD>
                    {s.paid ? (
                      <Badge color={C.green}>مسدد</Badge>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Badge color={C.amber}>معلق</Badge>
                        <button onClick={() => onSendReminder(s)} style={{ background:"transparent", border:"none", color:C.green, cursor:"pointer", fontSize:"0.75rem", padding:0, fontFamily:"'Cairo'" }} title="إرسال تذكير سداد بالواتساب">📱 تذكير</button>
                      </div>
                    )}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <h4 style={{ fontSize:"0.82rem", color:C.gold, fontWeight:700, marginBottom:6 }}>ℹ️ تفاصيل بطاقة المعلم الإعلانية</h4>
          <p style={{ fontSize:"0.78rem", color:C.text, lineHeight:1.5, marginBottom:10 }}>{teacher.bio}</p>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:8, fontSize:"0.75rem", color:C.muted }}>
            <div>📅 المواعيد: {teacher.schedule}</div><div style={{ marginTop:2 }}>📍 المكان: {teacher.location}</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Students = ({ students, setStudents, onSendReminder }) => {
  const [search, setSearch] = useState(""); const [modal, setModal] = useState(null);
  const empty = { name:"", parent:"", phone:"", age:"", surah:"", memorized:"", notes:"" };
  const [form, setForm] = useState(empty);
  const filtered = students.filter(s => s.name.includes(search) || s.parent.includes(search));

  const doSave = () => {
    if (!form.name || !form.phone) return;
    if (modal === "add") {
      setStudents(p => [...p, { id:Date.now(), ...form, age:+form.age||0, memorized:+form.memorized||0, joined:new Date().toISOString().split("T")[0], paid:false }]);
    } else {
      setStudents(p => p.map(s => s.id === modal.id ? { ...s, ...form, age:+form.age||0, memorized:+form.memorized||0 } : s));
    }
    setModal(null);
  };

  const handleAddStudentClick = () => {
    if (students.length >= 5) {
      alert("⚠️ لقد استهلكت الحد الأقصى للنسخة التجريبية (5 طلاب).\n\nيرجى التواصل مع الدعم الفني لشركة (The Win Route) لتفعيل النسخة المدفوعة وفتح عدد غير محدود من الطلاب! 🚀");
      window.open("https://wa.me/201017403485?text=" + encodeURIComponent("مرحباً، أود ترقية نظام الحلقة الذكية للاشتراك في النسخة المدفوعة لفتح حد الطلاب."), "_blank");
      return;
    }
    setForm(empty);
    setModal("add");
  };

  const exportToExcel = (filterType = "all") => {
    const dataToExport = filterType === "paid" ? students.filter(s => s.paid) : students;
    if (dataToExport.length === 0) { alert("لا توجد بيانات للتصدير!"); return; }
    const headers = ["اسم الطالب", "ولي الأمر", "الهاتف", "العمر", "السورة", "الحفظ", "الحالة"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(s => [`"${s.name}"`, `"${s.parent}"`, `"${s.phone}"`, s.age, `"${s.surah}"`, s.memorized, s.paid ? "مسدد" : "معلق"].join(","))
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
        title="دليل الطلاب والتحفيظ" 
        sub={`إدارة شؤون الطلاب الحاليين (${students.length}/5)`} 
        action={
          <>
            <Btn variant="secondary" onClick={() => exportToExcel("all")} style={{ fontSize: "0.75rem" }}>📥 تصدير الكل</Btn>
            <Btn variant="secondary" onClick={() => exportToExcel("paid")} style={{ fontSize: "0.75rem" }}>💰 المسددون</Btn>
            <Btn onClick={handleAddStudentClick}>＋ إضافة طالب</Btn>
          </>
        } 
      />
      <Card style={{ marginBottom:14, padding:"8px 16px" }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث باسم الطالب أو ولي الأمر..." style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontFamily:"'Cairo'", fontSize:"0.82rem", outline:"none" }} /></Card>
      <Card style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>الطالب</TH><TH>ولي الأمر</TH><TH>الهاتف</TH><TH>السورة</TH><TH>الحفظ</TH><TH>السداد والتحصيل</TH><TH></TH></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <TD><b>{s.name}</b><div style={{ fontSize:"0.7rem", color:C.muted }}>العمر: {s.age}</div></TD>
                <TD>{s.parent}</TD><TD>{s.phone}</TD><TD>{s.surah || "—"}</TD>
                <TD><Badge color={C.purple}>{s.memorized} ص</Badge></TD>
                <TD>
                  {s.paid ? (
                    <Badge color={C.green}>مسدد</Badge>
                  ) : (
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <Badge color={C.amber}>معلق</Badge>
                      <Btn variant="ghost" style={{ padding:"2px 6px", fontSize:"0.7rem", borderColor:C.green, color:C.green }} onClick={() => onSendReminder(s)}>📱 تذكير سداد</Btn>
                    </div>
                  )}
                </TD>
                <TD><div style={{ display:"flex", gap:4 }}><Btn variant="ghost" style={{ padding:"4px 8px", fontSize:"0.72rem" }} onClick={() => { setForm(s); setModal(s); }}>تعديل</Btn><Btn variant="danger" style={{ padding:"4px 8px", fontSize:"0.72rem" }} onClick={() => setStudents(p => p.filter(x => x.id !== s.id))}>حذف</Btn></div></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "add" ? "إضافة طالب جديد" : "تعديل طالب"}>
        <Input label="اسم الطالب رباعي *" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
        <Input label="اسم ولي الأمر *" value={form.parent} onChange={e => setForm({...form, parent:e.target.value})} />
        <Input label="رقم الهاتف (واتساب) *" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
        <Input label="السورة الحالية" value={form.surah} onChange={e => setForm({...form, surah:e.target.value})} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Input label="العمر" type="number" value={form.age} onChange={e => setForm({...form, age:e.target.value})} />
          <Input label="الصفحات المحفوظة" type="number" value={form.memorized} onChange={e => setForm({...form, memorized:e.target.value})} />
        </div>
        <Btn onClick={doSave} style={{ width:"100%", justifyContent:"center", marginTop:8 }}>حفظ البيانات</Btn>
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
      r.present = r.present.filter(x => x !== id); r.absent = r.absent.filter(x => x !== id);
      if (type === "p") r.present.push(id); if (type === "a") r.absent.push(id);
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
          if (dayRecord.present.includes(student.id)) studentRow.push("حاضر");
          else if (dayRecord.absent.includes(student.id)) studentRow.push("غائب");
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
      .filter(a => a.present.includes(studentId))
      .map(a => ({ date: a.date, status: "حاضر" }));
    if (studentAttendance.length === 0) { alert(`لا توجد سجلات حضور مسجلة لـ ${studentName}`); return; }
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
            <input type="date" value={activeDate} onChange={e => setActiveDate(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, padding:"6px 12px", borderRadius:10, fontFamily:"'Cairo'" }} />
          </>
        } 
      />
      <Card style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>اسم الطالب</TH><TH>رقم التواصل</TH><TH style={{ textAlign:"center" }}>التحضير اليومي</TH></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <TD>
                  <b>{s.name}</b>
                  <button onClick={() => exportStudentAttendance(s.id, s.name)} style={{ background: "transparent", border: "none", color: C.blue, cursor: "pointer", marginRight: "10px", fontSize: "0.7rem", fontFamily:"'Cairo'" }} title="تصدير سجل حضور الطالب">📋 كشف فردي</button>
                </TD>
                <TD>{s.phone}</TD>
                <TD style={{ textAlign:"center", whiteSpace:"nowrap" }}>
                  <Btn variant={current.present.includes(s.id)?"primary":"ghost"} style={{ padding:"4px 10px", fontSize:"0.75rem", marginLeft:6 }} onClick={() => toggle(s.id, "p")}>✓ حاضر</Btn>
                  <Btn variant={current.absent.includes(s.id)?"danger":"ghost"} style={{ padding:"4px 10px", fontSize:"0.75rem" }} onClick={() => toggle(s.id, "a")}>× غائب</Btn>
                </TD>
              </tr>
            ))}
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
      <PageHeader title="الخزينة والمدفوعات" sub="إدارة ومراجعة التحويلات المالية" action={<Btn onClick={() => setModal(true)}>＋ تسجيل تحويل</Btn>} />
      <Card style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>اسم الطالب</TH><TH>المبلغ</TH><TH>وسيلة الدفع</TH><TH>التاريخ</TH><TH>الاشتراك</TH></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <TD>{students.find(s => s.id === p.studentId)?.name || "طالب نشط"}</TD>
                <TD style={{ color:C.gold, fontWeight:700 }}>{p.amount} ج.م</TD>
                <TD><Badge color={p.method==="فودافون كاش"?C.red:p.method==="انستا باي"?C.green:C.blue}>{p.method}</Badge></TD>
                <TD>{p.date}</TD><TD>{p.month}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="تسجيل عملية سداد">
        <Select label="اختر الطالب" value={form.studentId} onChange={e => setForm({...form, studentId:e.target.value})} options={[{ value:"", label:"اختر الطالب..." }, ...students.map(s => ({ value:s.id, label:s.name }))]} />
        <Input label="المبلغ" type="number" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} />
        <Select label="الوسيلة" value={form.method} onChange={e => setForm({...form, method:e.target.value})} options={[{value:"فودافون كاش", label:"📱 فودافون كاش"}, {value:"انستا باي", label:"⚡ انستا باي"}, {value:"فيزا / بطاقة", label:"💳 فيزا"}]} />
        <Btn onClick={doSave} disabled={!form.studentId} style={{ width:"100%", marginTop:10 }}>تأكيد التحصيل</Btn>
      </Modal>
    </div>
  );
};

const Reminders = ({ teacher, botState, setBotState, botFlows }) => {
  const currentBot = botFlows[botState] || botFlows.start;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:C.gold, marginBottom:8 }}>📢 أتمتة قنوات التحويل الذكي</h3>
        <p style={{ fontSize:"0.78rem", lineHeight:1.5, color:C.text }}>يقوم البوت بتزويد أولياء الأمور ببيانات محفظة فودافون كاش وانستا باي تلقائياً لضمان التحصيل الفوري السريع.</p>
        <div style={{ marginTop:12, padding:10, background:"rgba(0,0,0,0.15)", borderRadius:8, fontSize:"0.75rem" }}>
          <div>• فودافون كاش: {teacher.vodafoneCash}</div><div style={{ marginTop:2 }}>• انستا باي: {teacher.instaPayId}</div>
        </div>
      </Card>
      <Card style={{ minHeight:340, display:"flex", flexDirection:"column" }}>
        <div style={{ minHeight: 240, flex:1, background:"#080F18", borderRadius:12, padding:12, display:"flex", flexDirection:"column", overflowY:"auto" }}>
          <div style={{ background:C.card, padding:10, borderRadius:"10px 10px 0 10px", maxWidth:"85%", fontSize:"0.8rem", whiteSpace:"pre-line", lineHeight:1.4, marginBottom:10 }}>{currentBot.msg}</div>
          {currentBot.options.map((o, i) => o.link && (
            <a key={i} href={o.next==="paid_confirm"?`https://wa.me/2${teacher.phone}`:teacher.systemeLink} target="_blank" rel="noreferrer" style={{ background:g.gold, color:"#111", padding:"6px 12px", borderRadius:8, fontSize:"0.75rem", fontWeight:700, textDecoration:"none", alignSelf:"flex-start", marginBottom:8 }}>{o.label}</a>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
          {currentBot.options.map((o, i) => !o.link && <button key={i} onClick={() => setBotState(o.next)} style={{ background:C.surface, border:`1px solid ${C.gold}20`, color:C.gold, padding:8, borderRadius:8, fontFamily:"'Cairo'", fontSize:"0.78rem", cursor:"pointer", textAlign:"right" }}>🔹 {o.label}</button>)}
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [isLogged, setIsLogged] = useState(false); const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(() => LS.get("halqa_v_students", SAMPLE_STUDENTS));
  const [payments, setPayments] = useState(() => LS.get("halqa_v_payments", SAMPLE_PAYMENTS));
  const [attendance, setAttendance] = useState(() => LS.get("halqa_v_attendance", SAMPLE_ATTENDANCE));
  const [menuOpen, setMenuOpen] = useState(false);

  const [teacherConfig, setTeacherConfig] = useState(() => {
    return LS.get('halqa_teacher_config', DEFAULT_TEACHER_CONFIG);
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [formData, setFormData] = useState({ ...teacherConfig });

  const [botState, setBotState] = useState("start");
  
  const BOT_FLOWS = {
    start: { msg: "السلام عليكم 🌙\nأهلًا بك في نظام حلقة القرآن الكريم\n\nاختر من القائمة المتاحة لتلبية طلبك فوراً:", options: [{ label: "📝 تسجيل طالب جديد", next: "register" }, { label: "💰 دفع الرسوم الشهرية", next: "payment_options" }, { label: "📅 مواعيد الحلقة", next: "schedule" }, { label: "📞 التواصل مع المحفظ", next: "contact" }] },
    register: { msg: "ممتاز! 📝\n\nلتسجيل طالب جديد، يرجى الضغط على الرابط أدناه لملء استمارة الاشتراك وتحديد طريقة الدفع المفضلة لك:", options: [{ label: "🔗 فتح استمارة التسجيل", next: "registered", link: true }] },
    registered: { msg: "✅ تم فتح الاستمارة!\n\nبعد ملء البيانات وتحويل الرسوم، يرجى إرسال لقطة شاشة (Screenshot) للتأكيد.\n\nهل تحتاج شيئاً آخر؟", options: [{ label: "🏠 القائمة الرئيسية", next: "start" }] },
    payment_options: { msg: `💰 رسوم الاشتراك الشهري هي (${teacherConfig.fee} جنيه).\n\nيرجى اختيار وسيلة الدفع المناسبة لك لتعجيل التفعيل:`, options: [{ label: "💳 دفع إلكتروني (فيزا / كارت)", next: "pay_systeme" }, { label: "📱 فودافون كاش (Vodafone Cash)", next: "pay_vodafone" }, { label: "⚡ انستا باي (InstaPay)", next: "pay_instapay" }, { label: "🏠 رجوع", next: "start" }] },
    pay_systeme: { msg: "💳 للدفع الآمن عبر بطاقتك البنكية:\n\nاضغط على الرابط أدناه لإتمام العملية عبر بوابتنا الرقمية في Systeme:", options: [{ label: "💳 ادفع الآن بالفيزا", next: "paid_confirm", link: true }, { label: "🔄 تغيير طريقة الدفع", next: "payment_options" }] },
    pay_vodafone: { msg: `📱 للدفع عبر فودافون كاش:\n\nيرجى تحويل مبلغ (${teacherConfig.fee} جنيه) إلى الرقم التالي:\n📞 ${teacherConfig.vodafoneCash}\n\n⚠️ بعد التحويل، يرجى التقاط صورة لإيصال التحويل وإرسالها للمحفظ لتفعيل الحساب فوراً.`, options: [{ label: "📲 إرسال الإيصال عبر واتساب", next: "paid_confirm", link: true }, { label: "🔄 رجوع", next: "payment_options" }] },
    pay_instapay: { msg: `⚡ للدفع الفوري عبر انستا باي:\n\nيرجى التحويل إلى العنوان التالي:\n🆔 ${teacherConfig.instaPayId}\n\nتأكد من إرسال تأكيد التحويل عبر المحادثة هنا لجرد الحساب المالي.`, options: [{ label: "🏠 القائمة الرئيسية", next: "start" }] },
    paid_confirm: { msg: "🎉 جزاكم الله خيراً! تم تسجيل طلب الدفع.\n\nيقوم النظام حالياً بمراجعة التحويلات وسيقوم المحفظ بالتفعيل فوراً 🌟", options: [{ label: "🏠 القائمة الرئيسية", next: "start" }] },
    schedule: { msg: `📅 مواعيد الحلقة:\n\n🕓 ${teacherConfig.schedule}\n📍 المكان: ${teacherConfig.location}`, options: [{ label: "🏠 رجوع", next: "start" }] },
    contact: { msg: `📞 للتواصل المباشر مع الشيخ:\n\n👤 ${teacherConfig.name}\n📱 ${teacherConfig.phone}\n\nنحن في خدمتكم دائماً.`, options: [{ label: "🏠 رجوع", next: "start" }] }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setTeacherConfig(formData);
    LS.set('halqa_teacher_config', formData);
    setIsSettingsOpen(false);
    alert("✔️ تم حفظ وتشفير إعدادات الحساب بنجاح!");
  };

  const handleSendWhatsAppReminder = (student) => {
    const message = `السلام عليكم يا فندم، نود تذكيركم بمصروفات الحلقة الذكية المستحقة للطالب (${student.name}) لشهر مايو.\n\nالمبلغ المستحق: ${teacherConfig.fee} ج.م\n\nيمكنكم التحويل الفوري لتجديد الاشتراك عبر:\n📱 فودافون كاش: ${teacherConfig.vodafoneCash}\n⚡ انستا باي: ${teacherConfig.instaPayId}\n\nجزاكم الله خيراً وجعله في ميزان حسناتكم! ✨`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = student.phone.trim();
    const whatsappUrl = `https://wa.me/2${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleExportBackup = () => {
    const backupData = {
      version: "2026.1",
      exportDate: new Date().toISOString(),
      teacher: teacherConfig,
      students: students,
      payments: payments,
      attendance: attendance
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `halqa_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;
    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (parsedData.students && parsedData.payments && parsedData.teacher) {
          setTeacherConfig(parsedData.teacher); setStudents(parsedData.students); setPayments(parsedData.payments);
          if (parsedData.attendance) setAttendance(parsedData.attendance);
          LS.set('halqa_teacher_config', parsedData.teacher); LS.set('halqa_v_students', parsedData.students);
          LS.set('halqa_v_payments', parsedData.payments); if (parsedData.attendance) LS.set('halqa_v_attendance', parsedData.attendance);
          alert("✔️ تم استعادة النسخة الاحتياطية بنجاح!"); window.location.reload();
        } else { alert("❌ خطأ: ملف النسخة الاحتياطية غير صالحة!"); }
      } catch (error) { alert("❌ فشل قراءة الملف!"); }
    };
    fileReader.readAsText(file);
  };

  const isPirated = typeof window !== "undefined" && 
                    window.location.hostname !== "localhost" && 
                    !window.location.hostname.endsWith(SECURITY_CONFIG.allowedHostSuffix);
                    
    // 1. التأكد من قراءة وحفظ تاريخ التثبيت بشكل صحيح باستخدام دالة LS المحدثة
  const [installDate, setInstallDate] = useState(() => {
    const saved = LS.get("halqa_security_init");
    if (saved) return saved;
    const today = new Date().toISOString().split("T")[0];
    LS.set("halqa_security_init", today);
    return today;
  });

  // 2. مزامنة البيانات الأخرى في الـ localStorage
  useEffect(() => { LS.set("halqa_v_students", students); }, [students]);
  useEffect(() => { LS.set("halqa_v_payments", payments); }, [payments]);
  useEffect(() => { LS.set("halqa_v_attendance", attendance); }, [attendance]);

  // 3. دالة حساب الأيام المتبقية مع حماية ضد الـ NaN
  const getDaysLeft = () => {
    if (!installDate) return SECURITY_CONFIG.demoDaysLimit;
    try {
      const diff = Math.abs(new Date() - new Date(installDate));
      const daysUsed = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const daysLeft = SECURITY_CONFIG.demoDaysLimit - daysUsed;
      return isNaN(daysLeft) ? SECURITY_CONFIG.demoDaysLimit : Math.max(0, daysLeft);
    } catch (e) {
      return SECURITY_CONFIG.demoDaysLimit;
    }
  };


  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard students={students} payments={payments} teacher={teacherConfig} onSendReminder={handleSendWhatsAppReminder} />;
      case "students":
        return <Students students={students} setStudents={setStudents} onSendReminder={handleSendWhatsAppReminder} />;
      case "attendance":
        return <Attendance students={students} attendance={attendance} setAttendance={setAttendance} />;
      case "payments":
        return <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacherConfig} />;
      case "reminders":
        return <Reminders teacher={teacherConfig} botState={botState} setBotState={setBotState} botFlows={BOT_FLOWS} />;
      default:
        return <Dashboard students={students} payments={payments} teacher={teacherConfig} onSendReminder={handleSendWhatsAppReminder} />;
    }
  };

  if (isPirated) return <div style={{ background:"#050A10", color:C.red, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo'", direction:"rtl" }}><Card style={{ maxWidth:400, textAlign:"center" }}><h2>🚫 خطأ في ترخيص النظام</h2></Card></div>;
  if (getDaysLeft() <= 0) return <div style={{ background:C.bg, color:C.text, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo'", direction:"rtl", padding:16 }}><Card style={{ maxWidth:400, textAlign:"center" }}><h2>⏳ انتهت صلاحية الديمو</h2><Btn onClick={() => window.open(teacherConfig.systemeLink)} style={{ width:"100%", marginTop:12 }}>🚀 ترقية الحساب الآن</Btn></Card></div>;
  if (!isLogged) return <LoginPage onLogin={() => setIsLogged(true)} />;

  const navItems = [
    { id: "dashboard", label: "📊 لوحة التحكم" }, { id: "students", label: "👨‍🎓 دليل الطلاب" },
    { id: "attendance", label: "📅 كشف الحضور" }, { id: "payments", label: "💰 الحسابات والمحافظ" },
    { id: "reminders", label: "🤖 شات بوت iBots" }
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Cairo',sans-serif", direction:"rtl", display:"flex", boxSizing:"border-box" }}>
      <div style={{ width: menuOpen ? 240 : 70, background:C.surface, borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transition:"all 0.3s ease", position:"relative", zIndex:1000 }}>
        <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:menuOpen?"space-between":"center" }}>
            {menuOpen && <span style={{ fontWeight:800, color:C.gold, fontSize:"0.95rem" }}>🕌 الحلقة الذكية</span>}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background:"none", border:"none", color:C.gold, fontSize:20, cursor:"pointer" }}>☰</button>
          </div>
          <div style={{ background: "rgba(235,166,60,0.1)", border: "1px solid rgba(235,166,60,0.2)", borderRadius: 8, padding: "6px 4px", textAlign: "center", color: C.amber, fontSize: "0.72rem", fontWeight: 700, marginTop: 4 }}>
            {menuOpen ? `⏳ النسخة التجريبية: متبقي ${getDaysLeft()} يوم` : `⏳ ${getDaysLeft()}ي`}
          </div>
        </div>
        <div style={{ flex:1, padding:"12px 6px", display:"flex", flexDirection:"column", gap:6 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px", borderRadius:12, border:"none", background:page===item.id?`${C.gold}15`:"transparent", color:page===item.id?C.gold:C.text, fontSize:"0.85rem", fontWeight:600, cursor:"pointer", textAlign:"right" }}>
              {menuOpen ? item.label : item.label.split(" ")[0]}
            </button>
          ))}
          <hr style={{ border:"none", borderTop:`1px solid ${C.border}`, margin:"10px 0" }} />
          <button onClick={() => { setFormData({ ...teacherConfig }); setIsSettingsOpen(true); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px", borderRadius:12, border:"none", background:"transparent", color:C.amber, fontSize:"0.85rem", fontWeight:600, cursor:"pointer", textAlign:"right" }}>
            {menuOpen ? "⚙️ إعدادات الحساب" : "⚙️"}
          </button>
        </div>
        <div style={{ padding:12, fontSize:"0.65rem", color:C.muted, textAlign:"center", borderTop:`1px solid ${C.border}` }}>
          {SECURITY_CONFIG.watermark.split(" ").slice(-1)[0]}
        </div>
      </div>

      <div style={{ flex:1, padding:24, overflowX:"hidden", boxSizing:"border-box" }}>
        {renderPage()}
      </div>

      <Modal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="⚙️ إعدادات الحساب والنسخ الاحتياطي">
        <div style={{ padding:12, background:"rgba(201,168,76,0.05)", border:`1px dashed ${C.border}`, borderRadius:12, marginBottom:16, display:"flex", flexDirection:"column", gap:10 }}>
          <span style={{ fontSize:"0.78rem", fontWeight:700, color:C.gold }}>📦 أدوات حماية وإدارة البيانات محلياً:</span>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Btn variant="secondary" onClick={handleExportBackup} style={{ fontSize:"0.75rem", padding:"6px 10px" }}>📥 تحميل نسخة (.json)</Btn>
            <label style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:"6px 10px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:C.text, fontSize:"0.75rem", fontWeight:600, cursor:"pointer" }}>
              ⚡ استعادة نسخة
              <input type="file" accept=".json" onChange={handleImportBackup} style={{ display:"none" }} />
            </label>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <h4 style={{ fontSize:"0.78rem", color:C.gold, borderBottom:`1px solid ${C.border}`, paddingBottom:4, margin:0 }}>البيانات الشخصية والإعلانية</h4>
          <Input label="اسم المحفظ / الشيخ" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} />
          <Input label="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone:e.target.value})} />
          <Input label="العنوان والمنطقة" value={formData.location} onChange={e => setFormData({...formData, location:e.target.value})} />
          <Input label="نبذة تعريفية (Bio)" as="textarea" value={formData.bio} onChange={e => setFormData({...formData, bio:e.target.value})} />
          <Input label="مواعيد الحلقات الرسمية" value={formData.schedule} onChange={e => setFormData({...formData, schedule:e.target.value})} />
          
          <h4 style={{ fontSize:"0.78rem", color:C.gold, borderBottom:`1px solid ${C.border}`, paddingBottom:4, margin:"10px 0 0 0" }}>المحافظ والاشتراكات الفورية</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="قيمة الاشتراك (ج.م)" type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: +e.target.value || 0})} />
            <Input label="رقم فودافون كاش" value={formData.vodafoneCash} onChange={e => setFormData({...formData, vodafoneCash:e.target.value})} />
          </div>
          <Input label="معرّف انستا باي (InstaPay ID)" value={formData.instaPayId} onChange={e => setFormData({...formData, instaPayId:e.target.value})} />
          <Input label="رابط صفحة الهبوط والتسجيل (Systeme.io)" value={formData.systemeLink} onChange={e => setFormData({...formData, systemeLink:e.target.value})} />
          
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <Btn type="submit" style={{ flex:1 }}>حفظ وتشفير البيانات 💾</Btn>
            <Btn type="button" variant="ghost" onClick={() => setIsSettingsOpen(false)}>إلغاء</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
