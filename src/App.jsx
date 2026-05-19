import { useState, useEffect } from "react";
// 1. استيراد دالات التشفير وفك التشفير الآمنة من ملف securityUtils
import { encryptAndSave, getAndDecrypt } from "./securityUtils";

// ═══════════════════════════════════════════════
// 🔒 SECURITY & STORAGE (تأمين النسخة التجريبية وحفظ البيانات)
// ═══════════════════════════════════════════════
const SECURITY_CONFIG = {
  allowedHost: "smart-halaqa.vercel.app",
  watermark: "Licensed to The Win Route © 2026",
  demoDaysLimit: 14, 
};

const CRYPTO = {
  encrypt: (str) => btoa(encodeURIComponent(str)),
  decrypt: (str) => { try { return decodeURIComponent(atob(str)); } catch { return null; } }
};

const LS = {
  get: (k, d) => {
    try {
      // جلب البيانات وفك تشفيرها تلقائياً بـ AES عبر ملف المساعدة
      const decryptedData = getAndDecrypt(k);
      // إذا عثر على بيانات صحيحة أرجعها، وإلا أرجع القيمة الافتراضية d
      return decryptedData !== null ? decryptedData : d;
    } catch { 
      return d; 
    }
  },
  set: (k, v) => { 
    try { 
      // تشفير البيانات وحفظها بـ AES تلقائياً
      encryptAndSave(k, v);
    } catch {} 
  }
};

// ═══════════════════════════════════════════════
// DATA & CONFIG
// ═══════════════════════════════════════════════
const DEMO_TEACHER = {
  name: "الشيخ أحمد محمود",
  phone: "01012345678",
  location: "مدينة نصر، القاهرة",
  bio: "حافظ للقرآن الكريم برواية حفص عن عاصم، خبرة ١٥ عامًا في تحفيظ القرآن للأطفال والكبار",
  schedule: "السبت والاثنين والأربعاء — ٤:٠٠ عصرًا",
  fee: 999,
  systemeLink: "https://systeme.io/halqa-register",
  vodafoneCash: "01012345678", 
  instaPayId: "teacher@instapay", 
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

const BOT_FLOWS = {
  start: { msg: "السلام عليكم 🌙\nأهلًا بك في نظام حلقة القرآن الكريم\n\nاختر من القائمة المتاحة لتلبية طلبك فوراً:", options: [{ label: "📝 تسجيل طالب جديد", next: "register" }, { label: "💰 دفع الرسوم الشهرية", next: "payment_options" }, { label: "📅 مواعيد الحلقة", next: "schedule" }, { label: "📞 التواصل مع المحفظ", next: "contact" }] },
  register: { msg: "ممتاز! 📝\n\nلتسجيل طالب جديد، يرجى الضغط على الرابط أدناه لملء استمارة الاشتراك وتحديد طريقة الدفع المفضلة لك:", options: [{ label: "🔗 فتح استمارة التسجيل", next: "registered", link: true }] },
  registered: { msg: "✅ تم فتح الاستمارة!\n\nبعد ملء البيانات وتحويل الرسوم، يرجى إرسال لقطة شاشة (Screenshot) للتأكيد.\n\nهل تحتاج شيئًا آخر؟", options: [{ label: "🏠 القائمة الرئيسية", next: "start" }] },
  payment_options: { msg: "💰 رسوم الاشتراك الشهري هي (٩٩٩ جنيه).\n\nيرجى اختيار وسيلة الدفع المناسبة لك لتعجيل التفعيل:", options: [{ label: "💳 دفع إلكتروني (فيزا / كارت)", next: "pay_systeme" }, { label: "📱 فودافون كاش (Vodafone Cash)", next: "pay_vodafone" }, { label: "⚡ انستا باي (InstaPay)", next: "pay_instapay" }, { label: "🏠 رجوع", next: "start" }] },
  pay_systeme: { msg: "💳 للدفع الآمن عبر بطاقتك البنكية:\n\nاضغط على الرابط أدناه لإتمام العملية عبر بوابتنا الرقمية في Systeme:", options: [{ label: "💳 ادفع الآن بالفيزا", next: "paid_confirm", link: true }, { label: "🔄 تغيير طريقة الدفع", next: "payment_options" }] },
  pay_vodafone: { msg: `📱 للدفع عبر فودافون كاش:\n\nيرجى تحويل مبلغ (٩٩٩ جنيه) إلى الرقم التالي:\n📞 ${DEMO_TEACHER.vodafoneCash}\n\n⚠️ بعد التحويل، يرجى التقاط صورة لإيصال التحويل وإرسالها للمحفظ لتفعيل الحساب فوراً.`, options: [{ label: "📲 إرسال الإيصال عبر واتساب", next: "paid_confirm", link: true }, { label: "🔄 رجوع", next: "payment_options" }] },
  pay_instapay: { msg: `⚡ للدفع الفوري عبر انستا باي:\n\nيرجى التحويل إلى العنوان التالي:\n🆔 ${DEMO_TEACHER.instaPayId}\n\nتأكد من إرسال تأكيد التحويل عبر المحادثة هنا لجرد الحساب المالي.`, options: [{ label: "🏠 القائمة الرئيسية", next: "start" }] },
  paid_confirm: { msg: "🎉 جزاكم الله خيراً! تم تسجيل طلب الدفع.\n\nيقوم النظام حالياً بمراجعة التحويلات وسيقوم المحفظ بالتفعيل فوراً 🌟", options: [{ label: "🏠 القائمة الرئيسية", next: "start" }] },
  schedule: { msg: `📅 مواعيد الحلقة:\n\n🕓 ${DEMO_TEACHER.schedule}\n📍 المكان: ${DEMO_TEACHER.location}`, options: [{ label: "🏠 رجوع", next: "start" }] },
  contact: { msg: `📞 للتواصل المباشر مع الشيخ:\n\n👤 ${DEMO_TEACHER.name}\n📱 ${DEMO_TEACHER.phone}\n\nنحن في خدمتكم دائماً.`, options: [{ label: "🏠 رجوع", next: "start" }] }
};

const C = { bg: "#0C1520", surface: "#111C2A", card: "#162030", border: "rgba(201,168,76,0.12)", gold: "#C9A84C", text: "#E4DAC8", muted: "rgba(228,218,200,0.4)", green: "#34D399", red: "#EF4444", amber: "#F59E0B", blue: "#60A5FA", purple: "#A78BFA" };
const g = { gold: "linear-gradient(135deg, #C9A84C, #E8C97A)" };

// ═══════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════
const Badge = ({ children, color = C.green }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:`${color}1A`, color, border:`1px solid ${color}33`, whiteSpace:"nowrap" }}>{children}</span>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled=false }) => {
  const styles = {
    primary: { background: g.gold, color:"#1A1208" },
    secondary: { background:`${C.gold}15`, color:C.gold, border:`1px solid ${C.gold}30` },
    ghost: { background:"rgba(255,255,255,0.05)", color:C.text, border:"1px solid rgba(255,255,255,0.08)" },
    danger: { background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontFamily:"'Cairo',sans-serif", fontSize:"0.8rem", fontWeight:600, opacity:disabled?0.5:1, ...styles[variant], ...style }}>{children}</button>
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

// ═══════════════════════════════════════════════
// SECTIONS CODES
// ═══════════════════════════════════════════════
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

const Dashboard = ({ students, payments, teacher }) => {
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
        <Card><div style={{ fontSize:"1.6rem", fontWeight:900, color:C.green }}>{paid}</div><div style={{ fontSize:"0.75rem", color:C.muted, marginTop:4 }}>الطلاب المسددين هذا الشهر</div></Card>
        <Card><div style={{ fontSize:"1.6rem", fontWeight:900, color:C.gold }}>{monthRev.toLocaleString()} ج.م</div><div style={{ fontSize:"0.75rem", color:C.muted, marginTop:4 }}>مداخيل شهر مايو</div></Card>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:14 }}>
        <Card style={{ overflowX:"auto" }}>
          <h3 style={{ fontSize:"0.85rem", fontWeight:700, marginBottom:10 }}>📋 نظرة على الحفظ والمتابعة</h3>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>اسم الطالب</TH><TH>السورة</TH><TH>الإنجاز</TH><TH>الحالة</TH></tr></thead>
            <tbody>
              {students.slice(0, 3).map(s => (
                <tr key={s.id}><TD>{s.name}</TD><TD>{s.surah || "—"}</TD><TD><Badge color={C.purple}>{s.memorized} ص</Badge></TD><TD><Badge color={s.paid?C.green:C.amber}>{s.paid?"مسدد":"معلق"}</Badge></TD></tr>
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

const Students = ({ students, setStudents }) => {
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

  // 📥 دالة تصدير بيانات الطلاب المحدثة
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
            <Btn onClick={() => { if(students.length>=5){alert("⚠️ تجاوزت الحد!");return;} setForm(empty); setModal("add"); }}>＋ إضافة طالب</Btn>
          </>
        } 
      />
      <Card style={{ marginBottom:14, padding:"8px 16px" }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث باسم الطالب أو ولي الأمر..." style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontFamily:"'Cairo'", fontSize:"0.82rem", outline:"none" }} /></Card>
      <Card style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>الطالب</TH><TH>ولي الأمر</TH><TH>الهاتف</TH><TH>السورة</TH><TH>الحفظ</TH><TH>السداد</TH><TH></TH></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <TD><b>{s.name}</b><div style={{ fontSize:"0.7rem", color:C.muted }}>العمر: {s.age}</div></TD>
                <TD>{s.parent}</TD><TD>{s.phone}</TD><TD>{s.surah || "—"}</TD>
                <TD><Badge color={C.purple}>{s.memorized} ص</Badge></TD>
                <TD><Badge color={s.paid?C.green:C.amber}>{s.paid?"مسدد":"معلق"}</Badge></TD>
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

  // 📊 دالة تصدير التقرير الشهري الشامل لجميع الحضور
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

  // 📋 دالة تصدير حضور طالب فردي
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

const Reminders = ({ teacher }) => {
  const [botState, setBotState] = useState("start"); const currentBot = BOT_FLOWS[botState] || BOT_FLOWS.start;
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
        <div style={{ flex:1, background:"#080F18", borderRadius:12, padding:12, display:"flex", flexDirection:"column", overflowY:"auto" }}>
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

// ═══════════════════════════════════════════════
// MAIN COMPONENT WRAPPER (RESPONSIVE LAYOUT)
// ═══════════════════════════════════════════════
export default function App() {
  const [isLogged, setIsLogged] = useState(false); const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(() => LS.get("halqa_v_students", SAMPLE_STUDENTS));
  const [payments, setPayments] = useState(() => LS.get("halqa_v_payments", SAMPLE_PAYMENTS));
  const [attendance, setAttendance] = useState(() => LS.get("halqa_v_attendance", SAMPLE_ATTENDANCE));
  const [menuOpen, setMenuOpen] = useState(false);
  const teacher = DEMO_TEACHER;

  const isPirated = typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== SECURITY_CONFIG.allowedHost;
  const [installDate, setInstallDate] = useState(() => LS.get("halqa_security_init", null));
  
  useEffect(() => { if (!installDate) { const d = new Date().toISOString().split("T")[0]; LS.set("halqa_security_init", d); setInstallDate(d); } }, [installDate]);
  useEffect(() => { LS.set("halqa_v_students", students); }, [students]);
  useEffect(() => { LS.set("halqa_v_payments", payments); }, [payments]);
  useEffect(() => { LS.set("halqa_v_attendance", attendance); }, [attendance]);

  const getDaysLeft = () => {
    if (!installDate) return SECURITY_CONFIG.demoDaysLimit;
    const diff = Math.abs(new Date() - new Date(installDate));
    return Math.max(0, SECURITY_CONFIG.demoDaysLimit - Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (isPirated) return <div style={{ background:"#050A10", color:C.red, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo'", direction:"rtl" }}><Card style={{ maxWidth:400, textAlign:"center" }}><h2>🚫 خطأ في ترخيص النظام</h2></Card></div>;
  if (getDaysLeft() <= 0) return <div style={{ background:C.bg, color:C.text, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo'", direction:"rtl", padding:16 }}><Card style={{ maxWidth:400, textAlign:"center" }}><h2>⏳ انتهت صلاحية الديمو</h2><Btn onClick={() => window.open(teacher.systemeLink)} style={{ width:"100%", marginTop:12 }}>🚀 ترقية الحساب الآن</Btn></Card></div>;
  if (!isLogged) return <LoginPage onLogin={() => setIsLogged(true)} />;

  const navItems = [
    { id: "dashboard", label: "📊 لوحة التحكم" }, { id: "students", label: "👨‍🎓 دليل الطلاب" },
    { id: "attendance", label: "📅 كشف الحضور" }, { id: "payments", label: "💰 الحسابات والمحافظ" },
    { id: "reminders", label: "🤖 شات بوت iBots" }
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Cairo',sans-serif", display:"flex", flexDirection:"column", direction:"rtl", boxSizing:"border-box" }}>
      
      {/* Top Navbar */}
      <div style={{ height:60, background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", zIndex:1000 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background:"transparent", border:"none", color:C.gold, fontSize:22, cursor:"pointer", display:"block" }} className="menu-toggle-btn">☰</button>
          <h3 style={{ color:C.gold, fontWeight:900, fontSize:"1.1rem", margin:0 }}>🕌 الحلقة الذكية</h3>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Badge color={C.amber}>⌛ {getDaysLeft()} يوم</Badge>
          <Badge color={C.green}>{students.length}/5 طلاب</Badge>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", position:"relative" }}>
        {/* Sidebar */}
        <div style={{ 
          width: 230, background: C.surface, borderLeft: `1px solid ${C.border}`, padding: 12, 
          display: menuOpen ? "flex" : "none", flexDirection: "column", gap: 4,
          position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 999, height:"100%"
        }} className="responsive-sidebar">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false); }} style={{ width:"100%", padding:"10px 12px", background:page===item.id?"rgba(201,168,76,0.1)":"transparent", color:page===item.id?C.gold:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'", fontWeight:600, fontSize:"0.82rem" }}>{item.label}</button>
          ))}
          <button onClick={() => setIsLogged(false)} style={{ marginTop:"auto", background:"transparent", border:`1px solid ${C.red}30`, color:C.red, padding:6, borderRadius:8, cursor:"pointer", fontFamily:"'Cairo'", fontSize:"0.75rem" }}>تسجيل الخروج</button>
          <div style={{ fontSize:"0.65rem", color:C.muted, textAlign:"center", marginTop:10 }}>{SECURITY_CONFIG.watermark}</div>
        </div>

        {/* Workspace */}
        <div style={{ flex:1, padding:16, boxSizing:"border-box", width:"100%", overflowX:"hidden" }}>
          {page === "dashboard" && <Dashboard students={students} payments={payments} teacher={teacher} />}
          {page === "students" && <Students students={students} setStudents={setStudents} />}
          {page === "attendance" && <Attendance students={students} attendance={attendance} setAttendance={setAttendance} />}
          {page === "payments" && <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacher} />}
          {page === "reminders" && <Reminders teacher={teacher} />}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .responsive-sidebar { display: flex !important; position: static !important; height: auto !important; }
          .menu-toggle-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .responsive-sidebar { width: 100% !important; max-width: 240px; box-shadow: -5px 0 15px rgba(0,0,0,0.5); }
        }
      `}</style>
    </div>
  );
}
