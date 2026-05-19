import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════
// STORAGE (إدارة البيانات المحلية)
// ═══════════════════════════════════════════════
const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ═══════════════════════════════════════════════
// SAMPLE DATA (البيانات التجريبية والافتراضية)
// ═══════════════════════════════════════════════
const DEMO_TEACHER = {
  name: "الشيخ أحمد محمود",
  phone: "01012345678",
  location: "مدينة نصر، القاهرة",
  bio: "حافظ للقرآن الكريم برواية حفص عن عاصم، خبرة ١٥ عامًا في تحفيظ القرآن للأطفال والكبار",
  schedule: "السبت والاثنين والأربعاء — ٤:٠٠ عصرًا",
  fee: 999,
  systemeLink: "https://systeme.io/halqa-register",
  vodafoneCash: "01012345678", // رقم فودافون كاش الخاص بك
  instaPayId: "teacher@instapay", // عنوان انستا باي الخاص بك
};

const SAMPLE_STUDENTS = [
  { id: 1, name: "أحمد محمد علي", parent: "محمد علي", phone: "01012345678", age: 10, joined: "2024-09-01", paid: true, paidDate: "2025-05-01", surah: "البقرة", memorized: 12, attendance: 90, notes: "" },
  { id: 2, name: "يوسف عبدالرحمن", parent: "عبدالرحمن سالم", phone: "01123456789", age: 9, joined: "2024-10-15", paid: false, paidDate: null, surah: "آل عمران", memorized: 8, attendance: 75, notes: "يحتاج متابعة" },
  { id: 3, name: "عمر خالد حسن", parent: "خالد حسن", phone: "01234567890", age: 11, joined: "2024-08-20", paid: true, paidDate: "2025-05-03", surah: "النساء", memorized: 20, attendance: 95, notes: "" },
  { id: 4, name: "إبراهيم سامي", parent: "سامي إبراهيم", phone: "01098765432", age: 8, joined: "2025-01-10", paid: true, paidDate: "2025-05-01", surah: "الفاتحة", memorized: 3, attendance: 85, notes: "" },
  { id: 5, name: "زياد طارق", parent: "طارق زياد", phone: "01187654321", age: 12, joined: "2024-07-01", paid: false, paidDate: null, surah: "المائدة", memorized: 25, attendance: 60, notes: "غياب متكرر" },
];

const SAMPLE_PAYMENTS = [
  { id: 1, studentId: 1, amount: 999, date: "2025-05-01", month: "مايو 2025", method: "فودافون كاش" },
  { id: 2, studentId: 3, amount: 999, date: "2025-05-03", month: "مايو 2025", method: "انستا باي" },
  { id: 3, studentId: 4, amount: 999, date: "2025-05-01", month: "مايو 2025", method: "فيزا / بطاقة" },
];

const SAMPLE_ATTENDANCE = [
  { id: 1, date: "2025-05-19", present: [1, 3, 4], absent: [2, 5] },
];

// تفعيل مسارات الدفع الجديدة بداخل الشات بوت الذكي
const BOT_FLOWS = {
  start: {
    msg: "السلام عليكم 🌙\nأهلًا بك في نظام حلقة القرآن الكريم\n\nاختر من القائمة:",
    options: [
      { label: "📝 تسجيل طالب جديد", next: "register" },
      { label: "💰 دفع الرسوم الشهرية", next: "payment_options" },
      { label: "📅 مواعيد الحلقة", next: "schedule" },
      { label: "📞 التواصل مع المحفظ", next: "contact" },
    ]
  },
  register: {
    msg: "ممتاز! 📝\n\nلتسجيل طالب جديد، يرجى الضغط على الرابط أدناه لملء استمارة الاشتراك وتحديد طريقة الدفع المفضلة لك:",
    options: [{ label: "🔗 فتح استمارة التسجيل", next: "registered", link: true }],
  },
  registered: {
    msg: "✅ تم فتح الاستمارة!\n\nبعد ملء البيانات وتحويل الرسوم، يرجى إرسال لقطة شاشة (Screenshot) للتأكيد.\n\nهل تحتاج شيئًا آخر؟",
    options: [{ label: "🏠 القائمة الرئيسية", next: "start" }],
  },
  payment_options: {
    msg: "💰 رسوم الاشتراك الشهري هي (٩٩٩ جنيه).\n\nيرجى اختيار وسيلة الدفع المناسبة لك لتعجيل التفعيل:",
    options: [
      { label: "💳 دفع إلكتروني (فيزا / كارت)", next: "pay_systeme" },
      { label: "📱 فودافون كاش (Vodafone Cash)", next: "pay_vodafone" },
      { label: "⚡ انستا باي (InstaPay)", next: "pay_instapay" },
      { label: "🏠 رجوع", next: "start" },
    ]
  },
  pay_systeme: {
    msg: "💳 للدفع الآمن عبر بطاقتك البنكية:\n\nاضغط على الرابط أدناه لإتمام العملية عبر بوابتنا الرقمية في Systeme:",
    options: [
      { label: "💳 ادفع الآن بالفيزا", next: "paid_confirm", link: true },
      { label: "🔄 تغيير طريقة الدفع", next: "payment_options" },
    ],
  },
  pay_vodafone: {
    msg: `📱 للدفع عبر فودافون كاش:\n\nيرجى تحويل مبلغ (٩٩٩ جنيه) إلى الرقم التالي:\n📞 ${DEMO_TEACHER.vodafoneCash}\n\n⚠️ بعد التحويل، يرجى التقاط صورة لإيصال التحويل وإرسالها للمحفظ لتفعيل الحساب فوراً.`,
    options: [
      { label: "📲 إرسال الإيصال عبر واتساب", next: "paid_confirm", link: true },
      { label: "🔄 رجوع", next: "payment_options" },
    ],
  },
  pay_instapay: {
    msg: `⚡ للدفع الفوري عبر انستا باي:\n\nيرجى التحويل إلى العنوان التالي:\n🆔 ${DEMO_TEACHER.instaPayId}\n\nأو تحويل للمبلغ (٩٩٩ جنيه) على رقم الهاتف المربوط بالحساب:\n📞 ${DEMO_TEACHER.phone}\n\nتأكد من إرسال تأكيد التحويل عبر المحادثة هنا لجرد الحساب المالي.`,
    options: [
      { label: "🏠 القائمة الرئيسية", next: "start" },
    ],
  },
  paid_confirm: {
    msg: "🎉 جزاكم الله خيراً! تم تسجيل طلب الدفع.\n\nيقوم النظام حالياً بمراجعة التحويلات، وسيتم إرسال إشعار التأكيد وتقرير الحفظ لولي الأمر خلال ساعات معدودة 🌟",
    options: [{ label: "🏠 القائمة الرئيسية", next: "start" }],
  },
  schedule: {
    msg: "📅 مواعيد الحلقة:\n\n🕓 السبت والاثنين والأربعاء\n⏰ الساعة ٤:٠٠ عصرًا\n📍 مدينة نصر، القاهرة",
    options: [{ label: "🏠 رجوع", next: "start" }],
  },
  contact: {
    msg: "📞 للتواصل المباشر مع الشيخ:\n\n👤 الشيخ أحمد محمود\n📱 ٠١٠١٢٣٤٥٦٧٨\n\nنحن في خدمتكم دائماً.",
    options: [{ label: "🏠 رجوع", next: "start" }],
  },
};

// ═══════════════════════════════════════════════
// DESIGN TOKENS (ألوان وهوية النظام)
// ═══════════════════════════════════════════════
const C = {
  bg: "#0C1520",
  surface: "#111C2A",
  card: "#162030",
  border: "rgba(201,168,76,0.12)",
  gold: "#C9A84C",
  text: "#E4DAC8",
  muted: "rgba(228,218,200,0.4)",
  green: "#34D399",
  red: "#EF4444",
  amber: "#F59E0B",
  blue: "#60A5FA",
  purple: "#A78BFA",
};

const g = { gold: "linear-gradient(135deg,#C9A84C,#E8C97A)" };

// ═══════════════════════════════════════════════
// REUSABLE COMPONENTS (العناصر المشتركة)
// ═══════════════════════════════════════════════
const Badge = ({ children, color = C.green }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:`${color}1A`, color, border:`1px solid ${color}33` }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled=false }) => {
  const styles = {
    primary: { background: g.gold, color:"#1A1208" },
    secondary: { background:`${C.gold}15`, color:C.gold, border:`1px solid ${C.gold}30` },
    ghost: { background:"rgba(255,255,255,0.05)", color:C.muted, border:"1px solid rgba(255,255,255,0.08)" },
    danger: { background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", fontWeight:600, opacity:disabled?0.5:1, ...styles[variant], ...style }}>
      {children}
    </button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, ...style }}>{children}</div>
);

const Input = ({ label, value, onChange, type="text", placeholder="", as="input" }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:"0.75rem", color:C.muted, marginBottom:5, display:"block", fontWeight:600 }}>{label}</label>}
    {as === "textarea"
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", resize:"vertical", minHeight:80 }} />
      : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none" }} />
    }
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:"0.75rem", color:C.muted, marginBottom:5, display:"block", fontWeight:600 }}>{label}</label>}
    <select value={value} onChange={onChange} style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none", cursor:"pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, width:"100%", maxWidth:480, maxHeight:"92vh", overflow:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:700, color:C.gold, fontSize:"1rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const PageHeader = ({ title, sub, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
    <div>
      <h2 style={{ fontSize:"1.25rem", fontWeight:800, color:C.gold, marginBottom:3 }}>{title}</h2>
      {sub && <p style={{ fontSize:"0.8rem", color:C.muted }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const TH = ({ children }) => <th style={{ padding:"10px 14px", textAlign:"right", fontSize:"0.72rem", color:C.muted, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{children}</th>;
const TD = ({ children }) => <td style={{ padding:"12px 14px", fontSize:"0.84rem", borderBottom:`1px solid rgba(255,255,255,0.04)`, color:C.text }}>{children}</td>;

// ═══════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo',sans-serif", direction:"rtl", padding:20 }}>
      <Card style={{ width:"100%", maxWidth:400, padding:32, textAlign:"center" }}>
        <div style={{ width:72, height:72, background:g.gold, borderRadius:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 16px" }}> Mosque 🕌 </div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:C.gold, marginBottom:20 }}>الحلقة الذكية</h1>
        <Input label="اسم المستخدم" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
        <Input label="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="1234" />
        <Btn onClick={onLogin} style={{ width:"100%", justifyContent:"center", marginTop:10 }}>دخول المعلم</Btn>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
const Dashboard = ({ students, payments, attendance, teacher, setPage }) => {
  const total = students.length;
  const paid = students.filter(s => s.paid).length;
  const monthRev = payments.reduce((a, p) => a + p.amount, 0);

  return (
    <div>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.gold }}>مرحباً بك {teacher.name} 👋</h1>
        <p style={{ fontSize:"0.82rem", color:C.muted }}>نظام الحلقة الذكية المطور — الباقة التجريبية</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:950, color:C.blue }}>{total} / 5</div><div style={{ fontSize:"0.8rem", color:C.muted, marginTop:4 }}>إجمالي الطلاب (حد تجريبي)</div></Card>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:950, color:C.green }}>{paid}</div><div style={{ fontSize:"0.8rem", color:C.muted, marginTop:4 }}>الطلاب المسددين</div></Card>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:950, color:C.gold }}>{monthRev.toLocaleString()} ج</div><div style={{ fontSize:"0.8rem", color:C.muted, marginTop:4 }}>مجموع الخزينة المالية</div></Card>
      </div>

      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>⚡ تحكم ومتابعة سريعة</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Btn variant="secondary" onClick={() => setPage("students")}>👨‍🎓 شؤون الطلاب</Btn>
          <Btn variant="secondary" onClick={() => setPage("payments")}>💰 إدارة الحسابات</Btn>
          <Btn variant="secondary" onClick={() => setPage("reminders")}>🤖 محاكاة الشات بوت</Btn>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// STUDENTS (إدارة الطلاب مع حماية الفوكس)
// ═══════════════════════════════════════════════
const Students = ({ students, setStudents }) => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); 
  const empty = { name:"", parent:"", phone:"", age:"", surah:"", memorized:"", notes:"" };
  const [form, setForm] = useState(empty);

  const filtered = students.filter(s => s.name.includes(search));

  const openAdd = () => { 
    if (students.length >= 5) {
      alert("⚠️ عذراً، لقد وصلت للحد الأقصى المسموح به في النسخة التجريبية (5 طلاب فقط)!");
      return;
    }
    setForm(empty); setModal("add"); 
  };

  const doSave = () => {
    if (!form.name || !form.phone) return;
    if (modal === "add") {
      if (students.length >= 5) return;
      setStudents(p => [...p, { id:Date.now(), ...form, age:+form.age||0, memorized:+form.memorized||0, joined:new Date().toISOString().split("T")[0], paid:false }]);
    } else {
      setStudents(p => p.map(s => s.id===modal.id ? { ...s, ...form } : s));
    }
    setModal(null);
  };

  const handleInputChange = (field, value) => { setForm(p => ({ ...p, [field]: value })); };

  return (
    <div>
      <PageHeader title="دليل الطلاب والتحفيظ" sub={`سعة الحساب الافتراضي: ${students.length} من 5 طلاب`} action={<Btn onClick={openAdd}>＋ إضافة طالب جديد</Btn>} />
      <Card style={{ marginBottom:14 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث هنا باسم الطالب بشكل مباشر..." style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontFamily:"'Cairo',sans-serif", outline:"none" }} />
      </Card>
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["الطالب","ولي الأمر","الهاتف","الحفظ","الحالة",""].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <TD>{s.name}</TD>
                <TD>{s.parent}</TD>
                <TD>{s.phone}</TD>
                <TD>{s.surah} ({s.memorized} ص)</TD>
                <TD><Badge color={s.paid?C.green:C.amber}>{s.paid?"✓ مدفوع":"⏳ معلق"}</Badge></TD>
                <TD><Btn variant="danger" style={{ padding:"4px 8px" }} onClick={() => setStudents(p => p.filter(x=>x.id!==s.id))}>×</Btn></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title="بيانات الطالب">
        <Input label="اسم الطالب *" value={form.name} onChange={e => handleInputChange("name", e.target.value)} />
        <Input label="اسم ولي الأمر *" value={form.parent} onChange={e => handleInputChange("parent", e.target.value)} />
        <Input label="رقم الهاتف *" value={form.phone} onChange={e => handleInputChange("phone", e.target.value)} />
        <Input label="السورة الحالية" value={form.surah} onChange={e => handleInputChange("surah", e.target.value)} />
        <Btn onClick={doSave} style={{ width:"100%", marginTop:10 }}>حفظ التعديلات</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════
// PAYMENTS (دعم فودافون كاش وانستا باي في النظام)
// ═══════════════════════════════════════════════
const Payments = ({ students, payments, setPayments, setStudents, teacher }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId:"", amount:teacher.fee, month:"مايو 2025", method: "فودافون كاش" });

  const doSave = () => {
    if (!form.studentId) return;
    setPayments(p => [...p, { id:Date.now(), studentId:+form.studentId, amount:+form.amount, date:new Date().toISOString().split("T")[0], month:form.month, method:form.method }]);
    setStudents(p => p.map(s => s.id===+form.studentId ? { ...s, paid:true, paidDate:new Date().toISOString().split("T")[0] } : s));
    setModal(false);
  };

  const handleInputChange = (field, value) => { setForm(p => ({ ...p, [field]: value })); };

  return (
    <div>
      <PageHeader title="الخزينة والمدفوعات" sub="تسجيل المدفوعات الواردة يدوياً أو آلياً" action={<Btn onClick={() => setModal(true)}>＋ تسجيل عملية تحويل</Btn>} />
      
      <Card style={{ marginBottom:16 }}>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>سجل الحسابات والوسائل المستخدمة</h3>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["الطالب","المبلغ","الوسيلة","التاريخ","الشهر"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <TD>{students.find(s=>s.id===p.studentId)?.name || "طالب سابق"}</TD>
                <TD style={{ color:C.gold, fontWeight:700 }}>{p.amount} ج.م</TD>
                <TD><Badge color={p.method === "فودافون كاش" ? C.red : p.method === "انستا باي" ? C.green : C.blue}>{p.method}</Badge></TD>
                <TD>{p.date}</TD>
                <TD>{p.month}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="تسجيل دفعة جديدة للقروب">
        <Select label="اختر الطالب" value={form.studentId} onChange={e => handleInputChange("studentId", e.target.value)} options={[{ value:"", label:"اختر..." }, ...students.map(s=>({ value:s.id, label:s.name }))]} />
        <Input label="المبلغ المستلم" value={form.amount} onChange={e => handleInputChange("amount", e.target.value)} type="number" />
        <Select label="وسيلة استلام الأموال" value={form.method} onChange={e => handleInputChange("method", e.target.value)} options={[
          { value: "فودافون كاش", label: "📱 فودافون كاش (Vodafone Cash)" },
          { value: "انستا باي", label: "⚡ انستا باي (InstaPay)" },
          { value: "فيزا / بطاقة", label: "💳 بوابة الدفع الإلكتروني (فيزا)" },
          { value: "نقدي", label: "💵 نقدي في الحلقة" }
        ]} />
        <Btn onClick={doSave} disabled={!form.studentId} style={{ width:"100%", marginTop:12 }}>✓ إيداع وتحديث حالة الطالب</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════
// REMINDERS & CHATBOT (نظام الرسائل المطور)
// ═══════════════════════════════════════════════
const Reminders = ({ students, teacher }) => {
  const [botState, setBotState] = useState("start");
  const currentBot = BOT_FLOWS[botState] || BOT_FLOWS.start;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <Card>
        <h3 style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:10, color:C.gold }}>📢 كفاءة الدفع الكاش والمحافظ</h3>
        <p style={{ fontSize:"0.82rem", lineHeight:1.6, color:C.text }}>
          في السوق المصري، يفضل 80% من أولياء الأمور التحويل المباشر. يتيح لك نظام الـ Chatbot المطور فرز طلبات التحويل وتوجيه أولياء الأمور إلى رقم فودافون كاش الخاص بك أو اسم مستخدم انستا باي تلقائيًا دون تدخل شخصي منك.
        </p>
        <div style={{ marginTop:14, background:"rgba(255,255,255,0.02)", padding:12, borderRadius:10, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:"0.8rem", color:C.gold, fontWeight:700 }}>⚙️ بيانات الاستقبال النشطة حالياً:</div>
          <div style={{ fontSize:"0.78rem", color:C.text, marginTop:6 }}>• محفظة كاش المربوطة: {teacher.vodafoneCash}</div>
          <div style={{ fontSize:"0.78rem", color:C.text, marginTop:4 }}>• معرف انستا باي: {teacher.instaPayId}</div>
        </div>
      </Card>

      <Card style={{ minHeight:420, display:"flex", flexDirection:"column" }}>
        <div style={{ marginBottom:10 }}><Badge color={C.purple}>🤖 واجهة العميل الذكية عبر iBots</Badge></div>
        <div style={{ flex:1, background:"#080F18", borderRadius:12, padding:14, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          <div style={{ background:C.card, padding:"10px 14px", borderRadius:"12px 12px 0 12px", maxWidth:"85%", alignSelf:"flex-start", marginBottom:12, whiteSpace:"pre-line", fontSize:"0.82rem", color:C.text, lineHeight:1.5 }}>
            {currentBot.msg}
          </div>
          {currentBot.options.map((o, i) => o.link && (
            <a key={i} href={o.next === "paid_confirm" ? `https://wa.me/2${teacher.phone}?text=${encodeURIComponent("السلام عليكم، قمت بتحويل الاشتراك ومرفق إيصال العملية 🌙")}` : teacher.systemeLink} target="_blank" rel="noreferrer" style={{ display:"inline-block", background:g.gold, color:"#111", padding:"8px 12px", borderRadius:8, fontSize:"0.78rem", fontWeight:700, textDecoration:"none", alignSelf:"flex-start", marginBottom:10 }}>
              {o.label}
            </a>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:10 }}>
          {currentBot.options.map((o, i) => !o.link && (
            <button key={i} onClick={() => setBotState(o.next)} style={{ width:"100%", background:C.surface, border:`1px solid ${C.gold}30`, color:C.gold, padding:"8px", borderRadius:8, fontFamily:"'Cairo',sans-serif", fontSize:"0.8rem", cursor:"pointer", textAlign:"right", paddingRight:14 }}>
              🔹 {o.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════
export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(SAMPLE_STUDENTS);
  const [payments, setPayments] = useState(SAMPLE_PAYMENTS);
  const [attendance, setAttendance] = useState(SAMPLE_ATTENDANCE);
  const teacher = DEMO_TEACHER;

  if (!isLogged) return <LoginPage onLogin={() => setIsLogged(true)} />;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Cairo',sans-serif", display:"flex", direction:"rtl" }}>
      {/* Sidebar الاختيارات اليمنى */}
      <div style={{ width:240, background:C.surface, borderLeft:`1px solid ${C.border}`, padding:"20px 10px", display:"flex", flexDirection:"column", gap:6 }}>
        <h3 style={{ color:C.gold, fontWeight:900, textAlign:"center", marginBottom:20 }}>🕌 الحلقة الذكية</h3>
        <button onClick={() => setPage("dashboard")} style={{ width:"100%", padding:10, background:page==="dashboard"?"rgba(201,168,76,0.1)":"transparent", color:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'" }}>📊 لوحة الإشراف</button>
        <button onClick={() => setPage("students")} style={{ width:"100%", padding:10, background:page==="students"?"rgba(201,168,76,0.1)":"transparent", color:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'" }}>👨‍🎓 إدارة الطلاب</button>
        <button onClick={() => setPage("payments")} style={{ width:"100%", padding:10, background:page==="payments"?"rgba(201,168,76,0.1)":"transparent", color:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'" }}>💰 خزانة الأموال</button>
        <button onClick={() => setPage("reminders")} style={{ width:"100%", padding:10, background:page==="reminders"?"rgba(201,168,76,0.1)":"transparent", color:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'" }}>🤖 شات بوت iBots</button>
      </div>

      {/* Main Content الحاوية اليسرى */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ height:58, background:"#080F18", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 22px" }}>
          <Badge color={C.green}>● باقة الديمو (5 طلاب)</Badge>
          <button onClick={() => setIsLogged(false)} style={{ marginRight:"auto", background:"transparent", border:`1px solid ${C.red}40`, color:C.red, padding:"4px 10px", borderRadius:6, cursor:"pointer", fontFamily:"'Cairo'" }}>خروج</button>
        </div>
        <div style={{ flex:1, padding:24, overflowY:"auto" }}>
          {page === "dashboard" && <Dashboard students={students} payments={payments} attendance={attendance} teacher={teacher} setPage={setPage} />}
          {page === "students" && <Students students={students} setStudents={setStudents} />}
          {page === "payments" && <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacher} />}
          {page === "reminders" && <Reminders students={students} teacher={teacher} />}
        </div>
      </div>
    </div>
  );
}
