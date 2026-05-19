import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════
// 🔒 SECURITY & STORAGE (تأمين النسخة التجريبية وحفظ البيانات)
// ═══════════════════════════════════════════════
const SECURITY_CONFIG = {
  allowedHost: window.location.hostname,
  watermark: "Licensed to The Win Route © 2026",
  demoDaysLimit: 14, // صلاحية الفترة التجريبية 14 يوم
};

const CRYPTO = {
  encrypt: (str) => btoa(encodeURIComponent(str)),
  decrypt: (str) => { try { return decodeURIComponent(atob(str)); } catch { return null; } }
};

const LS = {
  get: (k, d) => {
    try {
      const enc = localStorage.getItem(k);
      if (!enc) return d;
      const dec = CRYPTO.decrypt(enc);
      return dec ? JSON.parse(dec) : d;
    } catch { return d; }
  },
  set: (k, v) => { try { localStorage.setItem(k, CRYPTO.encrypt(JSON.stringify(v))); } catch{} }
};

// ═══════════════════════════════════════════════
// DATA & CONFIG (البيانات الثابتة وتدفق الشات بوت المطور)
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

const SAMPLE_ATTENDANCE = [
  { id: 1, date: "2026-05-19", present: [1, 3, 4], absent: [2, 5] },
];

const BOT_FLOWS = {
  start: {
    msg: "السلام عليكم 🌙\nأهلًا بك في نظام حلقة القرآن الكريم\n\nاختر من القائمة المتاحة لتلبية طلبك فوراً:",
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
    msg: `📅 مواعيد الحلقة:\n\n🕓 ${DEMO_TEACHER.schedule}\n📍 المكان: ${DEMO_TEACHER.location}`,
    options: [{ label: "🏠 رجوع", next: "start" }],
  },
  contact: {
    msg: `📞 للتواصل المباشر مع الشيخ:\n\n👤 ${DEMO_TEACHER.name}\n📱 ${DEMO_TEACHER.phone}\n\nنحن في خدمتكم دائماً.`,
    options: [{ label: "🏠 رجوع", next: "start" }],
  },
};

// ═══════════════════════════════════════════════
// DESIGN TOKENS (الألوان والهوية الكلاسيكية الفخمة)
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

const g = { gold: "linear-gradient(135deg, #C9A84C, #E8C97A)" };

// ═══════════════════════════════════════════════
// REUSABLE COMPONENTS
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
    <button onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", fontWeight:600, opacity:disabled?0.5:1, transition:"all 0.2s", ...styles[variant], ...style }}>
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
        <div style={{ width:72, height:72, background:g.gold, borderRadius:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 16px" }}>🕌</div>
        <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:C.gold, marginBottom:6 }}>الحلقة الذكية</h1>
        <p style={{ fontSize:"0.8rem", color:C.muted, marginBottom:24 }}>لوحة تحكم وإشراف معلمين القرآن الكريم</p>
        <Input label="اسم المستخدم" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
        <Input label="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="1234" />
        <Btn onClick={onLogin} style={{ width:"100%", justifyContent:"center", marginTop:10 }}>دخول لوحة التحكم</Btn>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// DASHBOARD SECTION
// ═══════════════════════════════════════════════
const Dashboard = ({ students, payments, attendance, teacher, setPage }) => {
  const total = students.length;
  const paid = students.filter(s => s.paid).length;
  const currentMonth = "مايو 2026";
  const monthRev = payments.filter(p => p.month === currentMonth).reduce((a, p) => a + p.amount, 0);

  return (
    <div>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.gold, marginBottom:4 }}>مرحباً بك، {teacher.name} 👋</h1>
        <p style={{ fontSize:"0.82rem", color:C.muted }}>إليك ملخص سريع لأداء وإحصائيات الحلقة القرآنية اليوم</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:24 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"1.8rem", fontWeight:950, color:C.blue }}>{total} / 5</div>
              <div style={{ fontSize:"0.8rem", color:C.muted, marginTop:4 }}>إجمالي الطلاب (الحد التجريبي)</div>
            </div>
            <div style={{ fontSize:28, opacity:0.3 }}>👨‍🎓</div>
          </div>
        </Card>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"1.8rem", fontWeight:950, color:C.green }}>{paid}</div>
              <div style={{ fontSize:"0.8rem", color:C.muted, marginTop:4 }}>الطلاب المسددين هذا الشهر</div>
            </div>
            <div style={{ fontSize:28, opacity:0.3 }}>💎</div>
          </div>
        </Card>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"1.8rem", fontWeight:950, color:C.gold }}>{monthRev.toLocaleString()} ج.م</div>
              <div style={{ fontSize:"0.8rem", color:C.muted, marginTop:4 }}>مداخيل شهر {currentMonth}</div>
            </div>
            <div style={{ fontSize:28, opacity:0.3 }}>💰</div>
          </div>
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, alignItems:"center" }}>
            <h3 style={{ fontSize:"0.9rem", fontWeight:700 }}>📋 نظرة على الحفظ والمتابعة الحالية</h3>
            <Btn variant="ghost" style={{ padding:"4px 10px", fontSize:"0.75rem" }} onClick={() => setPage("students")}>عرض الكل</Btn>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <TH>اسم الطالب</TH>
                <TH>السورة الحالية</TH>
                <TH>مقدار الإنجاز</TH>
                <TH>حالة السداد</TH>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 3).map(s => (
                <tr key={s.id}>
                  <TD>{s.name}</TD>
                  <TD>{s.surah || "لم تحدد"}</TD>
                  <TD><Badge color={C.purple}>{s.memorized || 0} صفحة</Badge></TD>
                  <TD><Badge color={s.paid ? C.green : C.amber}>{s.paid ? "مسدد" : "غير مسدد"}</Badge></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card style={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <h4 style={{ fontSize:"0.85rem", color:C.gold, fontWeight:700, marginBottom:8 }}>ℹ️ تفاصيل بطاقة المعلم الإعلانية</h4>
          <p style={{ fontSize:"0.8rem", color:C.text, lineHeight:1.6, marginBottom:12 }}>{teacher.bio}</p>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10, fontSize:"0.78rem", color:C.muted }}>
            <div>📅 المواعيد: {teacher.schedule}</div>
            <div style={{ marginTop:4 }}>📍 المكان: {teacher.location}</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// STUDENTS SECTION
// ═══════════════════════════════════════════════
const Students = ({ students, setStudents }) => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); 
  const empty = { name:"", parent:"", phone:"", age:"", surah:"", memorized:"", notes:"" };
  const [form, setForm] = useState(empty);

  const filtered = students.filter(s => s.name.includes(search) || s.parent.includes(search));

  const openAdd = () => { 
    if (students.length >= 5) {
      alert("⚠️ نظام الحماية: لقد بلغت الحد الأقصى للنسخة المجانية التجريبية (5 طلاب فقط)!");
      return;
    }
    setForm(empty); setModal("add"); 
  };

  const openEdit = (s) => { setForm(s); setModal(s); };

  const doSave = () => {
    if (!form.name || !form.phone) return;
    if (modal === "add") {
      if (students.length >= 5) return;
      setStudents(p => [...p, { id:Date.now(), ...form, age:+form.age||0, memorized:+form.memorized||0, joined:new Date().toISOString().split("T")[0], paid:false }]);
    } else {
      setStudents(p => p.map(s => s.id === modal.id ? { ...s, ...form, age:+form.age||0, memorized:+form.memorized||0 } : s));
    }
    setModal(null);
  };

  return (
    <div>
      <PageHeader title="دليل الطلاب والتحفيظ" sub={`إدارة شؤون الطلاب الحاليين (${students.length} من أصل 5 طلاب في الديمو)`} action={<Btn onClick={openAdd}>＋ إضافة طالب جديد</Btn>} />
      
      <Card style={{ marginBottom:16, padding:"12px 20px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث هنا باسم الطالب أو ولي الأمر بشكل مباشر..." style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", outline:"none" }} />
      </Card>

      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <TH>الطالب</TH>
              <TH>ولي الأمر</TH>
              <TH>رقم الهاتف</TH>
              <TH>المستند الحالي</TH>
              <TH>الصفحات</TH>
              <TH>السداد</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <TD><b>{s.name}</b><div style={{ fontSize:"0.7rem", color:C.muted }}>العمر: {s.age} سنوات</div></TD>
                <TD>{s.parent}</TD>
                <TD>{s.phone}</TD>
                <TD>{s.surah || "—"}</TD>
                <TD><Badge color={C.purple}>{s.memorized} ص</Badge></TD>
                <TD><Badge color={s.paid ? C.green : C.amber}>{s.paid ? "مسدد" : "معلق"}</Badge></TD>
                <TD style={{ whiteSpace:"nowrap" }}>
                  <Btn variant="ghost" style={{ padding:"5px 10px", marginLeft:6, fontSize:"0.75rem" }} onClick={() => openEdit(s)}>تعديل</Btn>
                  <Btn variant="danger" style={{ padding:"5px 10px", fontSize:"0.75rem" }} onClick={() => setStudents(p => p.filter(x => x.id !== s.id))}>حذف</Btn>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "add" ? "إضافة طالب جديد للحلقة" : "تعديل بيانات الطالب"}>
        <Input label="اسم الطالب الرباعي *" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="اسم ولي الأمر *" value={form.parent} onChange={e => setForm({...form, parent:e.target.value})} />
          <Input label="عمر الطالب" type="number" value={form.age} onChange={e => setForm({...form, age:e.target.value})} />
        </div>
        <Input label="رقم هاتف التواصل (واتساب) *" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="السورة الحالية" value={form.surah} onChange={e => setForm({...form, surah:e.target.value})} />
          <Input label="عدد الصفحات المحفوظة" type="number" value={form.memorized} onChange={e => setForm({...form, memorized:e.target.value})} />
        </div>
        <Input label="ملاحظات توجيهية" as="textarea" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
        <Btn onClick={doSave} style={{ width:"100%", justifyContent:"center", marginTop:10 }}>{modal === "add" ? "إدراج وتأكيد الطالب" : "حفظ التغييرات"}</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════
// PAYMENTS SECTION (دعم كامل لفودافون كاش وانستا باي والفرز)
// ═══════════════════════════════════════════════
const Payments = ({ students, payments, setPayments, setStudents, teacher }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId:"", amount:teacher.fee, month:"مايو 2026", method:"فودافون كاش" });

  const doSave = () => {
    if (!form.studentId) return;
    setPayments(p => [...p, { id:Date.now(), studentId:+form.studentId, amount:+form.amount, date:new Date().toISOString().split("T")[0], month:form.month, method:form.method }]);
    setStudents(p => p.map(s => s.id === +form.studentId ? { ...s, paid:true, paidDate:new Date().toISOString().split("T")[0] } : s));
    setModal(false);
  };

  return (
    <div>
      <PageHeader title="الخزينة والمدفوعات الرقمية" sub="تأكيد عمليات التحويل البنكي والمحافظ الإلكترونية يدويًا أو آليًا" action={<Btn onClick={() => setModal(true)}>＋ تسجيل عملية تحويل ورسوم</Btn>} />
      
      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>سجل المدفوعات والتحويلات المستقبلة</h3>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <TH>اسم الطالب</TH>
              <TH>المبلغ المستلم</TH>
              <TH>وسيلة وعلامة التحويل</TH>
              <TH>تاريخ التحويل</TH>
              <TH>دورة الاشتراك</TH>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <TD>{students.find(s => s.id === p.studentId)?.name || "طالب سابق"}</TD>
                <TD style={{ color:C.gold, fontWeight:700 }}>{p.amount} ج.م</TD>
                <TD><Badge color={p.method === "فودافون كاش" ? C.red : p.method === "انستا باي" ? C.green : C.blue}>{p.method}</Badge></TD>
                <TD>{p.date}</TD>
                <TD>{p.month}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="تسجيل دفعة يدوية جديدة">
        <Select label="اختر الطالب المسدد" value={form.studentId} onChange={e => setForm({...form, studentId:e.target.value})} options={[{ value:"", label:"اختر الطالب..." }, ...students.map(s => ({ value:s.id, label:s.name }))]} />
        <Input label="القيمة المالية المستلمة (ج.م)" type="number" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Select label="طريقة استقبال الأموال" value={form.method} onChange={e => setForm({...form, method:e.target.value})} options={[
            { value: "فودافون كاش", label: "📱 فودافون كاش" },
            { value: "انستا باي", label: "⚡ انستا باي (InstaPay)" },
            { value: "فيزا / بطاقة", label: "💳 فيزا / بوابة دفع إلكترونية" },
            { value: "نقدي", label: "💵 دفع نقدي باليد" }
          ]} />
          <Input label="الشهر الحالي للتحصيل" value={form.month} onChange={e => setForm({...form, month:e.target.value})} />
        </div>
        <Btn onClick={doSave} disabled={!form.studentId} style={{ width:"100%", justifyContent:"center", marginTop:10 }}>✓ تأكيد واستلام السداد</Btn>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════
// ATTENDANCE SECTION (إعادة نظام التحضير والغياب كالتصميم الأول)
// ═══════════════════════════════════════════════
const Attendance = ({ students, attendance, setAttendance }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [activeDate, setActiveDate] = useState(todayStr);

  const currentRecord = attendance.find(a => a.date === activeDate) || { present: [], absent: [] };

  const toggleStatus = (studentId, status) => {
    setAttendance(prev => {
      const filtered = prev.filter(a => a.date !== activeDate);
      let record = prev.find(a => a.date === activeDate) || { id: Date.now(), date: activeDate, present: [], absent: [] };
      
      record.present = record.present.filter(id => id !== studentId);
      record.absent = record.absent.filter(id => id !== studentId);

      if (status === "present") record.present.push(studentId);
      if (status === "absent") record.absent.push(studentId);

      return [...filtered, record];
    });
  };

  return (
    <div>
      <PageHeader title="سجل الحضور والغياب اليومي" sub="تحديد غياب وحضور طلاب حلقة التحفيظ بشكل مباشر" action={
        <input type="date" value={activeDate} onChange={e => setActiveDate(e.target.value)} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, padding:"8px 14px", borderRadius:10, fontFamily:"'Cairo'" }} />
      } />

      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <TH>اسم الطالب رباعي</TH>
              <TH>رقم هاتف ولي الأمر</TH>
              <TH style={{ textAlign:"center" }}>الحالة والتحضير السريع</TH>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const isPresent = currentRecord.present.includes(s.id);
              const isAbsent = currentRecord.absent.includes(s.id);
              return (
                <tr key={s.id}>
                  <TD><b>{s.name}</b></TD>
                  <TD>{s.phone}</TD>
                  <TD style={{ textAlign:"center" }}>
                    <Btn variant={isPresent ? "primary" : "ghost"} style={{ padding:"5px 14px", marginLeft:8, fontSize:"0.8rem" }} onClick={() => toggleStatus(s.id, "present")}>✓ حاضر</Btn>
                    <Btn variant={isAbsent ? "danger" : "ghost"} style={{ padding:"5px 14px", fontSize:"0.8rem" }} onClick={() => toggleStatus(s.id, "absent")}>× غائب</Btn>
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

// ═══════════════════════════════════════════════
// REMINDERS & CHATBOT SECTION
// ═══════════════════════════════════════════════
const Reminders = ({ teacher }) => {
  const [botState, setBotState] = useState("start");
  const currentBot = BOT_FLOWS[botState] || BOT_FLOWS.start;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <Card>
        <h3 style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:10, color:C.gold }}>📢 نظام أتمتة وتحويل الكاش الذكي</h3>
        <p style={{ fontSize:"0.82rem", lineHeight:1.6, color:C.text, marginBottom:12 }}>
          البوت معد ومبرمج بالكامل لتوجيه أولياء الأمور وحسم حجزهم عبر توفير خيارات فودافون كاش وانستا باي آلياً دون تشتيت المعلم بالمحادثات الطويلة والتقليدية.
        </p>
        <div style={{ background:"rgba(255,255,255,0.02)", padding:14, borderRadius:10, border:`1px solid ${C.border}`, fontSize:"0.78rem" }}>
          <div style={{ color:C.gold, fontWeight:700, marginBottom:4 }}>⚙️ قنوات الاستقبال النشطة:</div>
          <div>• محفظة فودافون كاش المربوطة: {teacher.vodafoneCash}</div>
          <div style={{ marginTop:4 }}>• معرف تطبيق انستا باي البنكي: {teacher.instaPayId}</div>
        </div>
      </Card>

      <Card style={{ minHeight:400, display:"flex", flexDirection:"column" }}>
        <div style={{ marginBottom:10 }}><Badge color={C.purple}>🤖 محاكاة شات بوت iBots الذكي للعملاء</Badge></div>
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
// MAIN APPLICATION COMPONENT
// ═══════════════════════════════════════════════
export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(() => LS.get("halqa_v_students", SAMPLE_STUDENTS));
  const [payments, setPayments] = useState(() => LS.get("halqa_v_payments", SAMPLE_PAYMENTS));
  const [attendance, setAttendance] = useState(() => LS.get("halqa_v_attendance", SAMPLE_ATTENDANCE));
  const teacher = DEMO_TEACHER;

  // 🔒 قفل وفحص الحماية والدومين المسموح له بتشغيل النظام لمنع السرقة
  const isPirated = window.location.hostname !== "localhost" && window.location.hostname !== SECURITY_CONFIG.allowedHost;

  const [installDate, setInstallDate] = useState(() => LS.get("halqa_security_init", null));
  
  useEffect(() => {
    if (!installDate) {
      const today = new Date().toISOString().split("T")[0];
      LS.set("halqa_security_init", today);
      setInstallDate(today);
    }
  }, [installDate]);

  useEffect(() => { LS.set("halqa_v_students", students); }, [students]);
  useEffect(() => { LS.set("halqa_v_payments", payments); }, [payments]);
  useEffect(() => { LS.set("halqa_v_attendance", attendance); }, [attendance]);

  const getDaysLeft = () => {
    if (!installDate) return SECURITY_CONFIG.demoDaysLimit;
    const diffTime = Math.abs(new Date() - new Date(installDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, SECURITY_CONFIG.demoDaysLimit - diffDays);
  };

  const isDemoExpired = getDaysLeft() <= 0;

  if (isPirated) {
    return (
      <div style={{ minHeight:"100vh", background:"#050A10", color:C.red, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo'", direction:"rtl", padding:20 }}>
        <Card style={{ maxWidth:450, textAlign:"center", border:`1px solid ${C.red}40` }}>
          <div style={{ fontSize:50 }}>🚫</div>
          <h2 style={{ marginTop:10 }}>خطأ في ترخيص النظام</h2>
          <p style={{ fontSize:"0.85rem", color:C.text, marginTop:10 }}>عذراً، هذه النسخة البرمجية غير مرخصة للعمل على هذا النطاق الإلكتروني. يرجى مراجعة المطور المعتمد لحل المشكلة.</p>
        </Card>
      </div>
    );
  }

  if (isDemoExpired) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo'", direction:"rtl", padding:20 }}>
        <Card style={{ maxWidth:450, textAlign:"center", border:`1px solid ${C.amber}40` }}>
          <div style={{ fontSize:50 }}>⏳</div>
          <h2 style={{ color:C.gold, marginTop:10 }}>انتهت صلاحية الفترة التجريبية</h2>
          <p style={{ fontSize:"0.85rem", marginTop:10, lineHeight:1.6 }}>لقد انتهت فترة الـ {SECURITY_CONFIG.demoDaysLimit} يوماً المخصصة لتجربة نظام الحلقة المجاني. يرجى الترقية الآن للاستمرار في جرد الحسابات وإدارة الحلقات بلا حدود.</p>
          <Btn onClick={() => window.open(teacher.systemeLink, "_blank")} style={{ width:"100%", marginTop:20, justifyContent:"center" }}>🚀 ترقية الحساب وتفعيل النظام الآن</Btn>
        </Card>
      </div>
    );
  }

  if (!isLogged) return <LoginPage onLogin={() => setIsLogged(true)} />;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Cairo',sans-serif", display:"flex", direction:"rtl" }}>
      {/* Sidebar القائمة اليمنى الكلاسيكية الأصلية */}
      <div style={{ width:240, background:C.surface, borderLeft:`1px solid ${C.border}`, padding:"20px 10px", display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ padding:"10px 0", textAlign:"center", marginBottom:14 }}>
          <h3 style={{ color:C.gold, fontWeight:900, fontSize:"1.15rem", letterSpacing:0.5 }}>🕌 الحلقة الذكية</h3>
          <div style={{ fontSize:"0.68rem", color:C.muted, marginTop:4 }}>نظام إدارة وتوجيه ذكي</div>
        </div>
        
        <button onClick={() => setPage("dashboard")} style={{ width:"100%", padding:"11px 14px", background:page==="dashboard"?"rgba(201,168,76,0.1)":"transparent", color:page==="dashboard"?C.gold:C.text, border:"none", borderRadius:10, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'", fontWeight:600, fontSize:"0.85rem" }}>📊 لوحة التحكم والإشراف</button>
        <button onClick={() => setPage("students")} style={{ width:"100%", padding:"11px 14px", background:page==="students"?"rgba(201,168,76,0.1)":"transparent", color:page==="students"?C.gold:C.text, border:"none", borderRadius:10, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'", fontWeight:600, fontSize:"0.85rem" }}>👨‍🎓 دليل شؤون الطلاب</button>
        <button onClick={() => setPage("attendance")} style={{ width:"100%", padding:"11px 14px", background:page==="attendance"?"rgba(201,168,76,0.1)":"transparent", color:page==="attendance"?C.gold:C.text, border:"none", borderRadius:10, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'", fontWeight:600, fontSize:"0.85rem" }}>📅 كشف الحضور والغياب</button>
        <button onClick={() => setPage("payments")} style={{ width:"100%", padding:"11px 14px", background:page==="payments"?"rgba(201,168,76,0.1)":"transparent", color:page==="payments"?C.gold:C.text, border:"none", borderRadius:10, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'", fontWeight:600, fontSize:"0.85rem" }}>💰 الحسابات والمحافظ</button>
        <button onClick={() => setPage("reminders")} style={{ width:"100%", padding:"11px 14px", background:page==="reminders"?"rgba(201,168,76,0.1)":"transparent", color:page==="reminders"?C.gold:C.text, border:"none", borderRadius:10, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'", fontWeight:600, fontSize:"0.85rem" }}>🤖 شات بوت iBots</button>
        
        <div style={{ marginTop:"auto", padding:10, background:"rgba(0,0,0,0.15)", borderRadius:10, fontSize:"0.7rem", color:C.muted, textAlign:"center", lineHeight:1.4, border:`1px solid rgba(255,255,255,0.02)` }}>
          {SECURITY_CONFIG.watermark}
        </div>
      </div>

      {/* Main Container المحتوى الأيسر المتكامل */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ height:58, background:"#080F18", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 22px" }}>
          <div style={{ display:"flex", gap:10 }}>
            <Badge color={C.amber}>⌛ متبقي {getDaysLeft()} أيام في التجربة</Badge>
            <Badge color={C.green}>الطلاب: {students.length} / 5</Badge>
          </div>
          <button onClick={() => setIsLogged(false)} style={{ marginRight:"auto", background:"transparent", border:`1px solid ${C.red}40`, color:C.red, padding:"4px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'Cairo'", fontSize:"0.78rem", fontWeight:600 }}>تسجيل الخروج</button>
        </div>
        
        <div style={{ flex:1, padding:24, overflowY:"auto" }}>
          {page === "dashboard" && <Dashboard students={students} payments={payments} attendance={attendance} teacher={teacher} setPage={setPage} />}
          {page === "students" && <Students students={students} setStudents={setStudents} />}
          {page === "attendance" && <Attendance students={students} attendance={attendance} setAttendance={setAttendance} />}
          {page === "payments" && <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacher} />}
          {page === "reminders" && <Reminders teacher={teacher} />}
        </div>
      </div>
    </div>
  );
}
