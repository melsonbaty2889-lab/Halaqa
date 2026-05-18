import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════
const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ═══════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════
const DEMO_TEACHER = {
  name: "الشيخ أحمد محمود",
  phone: "01012345678",
  location: "مدينة نصر، القاهرة",
  bio: "حافظ للقرآن الكريم برواية حفص عن عاصم، خبرة ١٥ عامًا في تحفيظ القرآن للأطفال والكبار",
  schedule: "السبت والاثنين والأربعاء — ٤:٠٠ عصرًا",
  fee: 999,
  systemeLink: "https://systeme.io/halqa-register",
  waPhone: "01012345678",
};

const SAMPLE_STUDENTS = [
  { id: 1, name: "أحمد محمد علي", parent: "محمد علي", phone: "01012345678", age: 10, joined: "2024-09-01", paid: true, paidDate: "2025-05-01", surah: "البقرة", memorized: 12, attendance: 90, notes: "" },
  { id: 2, name: "يوسف عبدالرحمن", parent: "عبدالرحمن سالم", phone: "01123456789", age: 9, joined: "2024-10-15", paid: false, paidDate: null, surah: "آل عمران", memorized: 8, attendance: 75, notes: "يحتاج متابعة" },
  { id: 3, name: "عمر خالد حسن", parent: "خالد حسن", phone: "01234567890", age: 11, joined: "2024-08-20", paid: true, paidDate: "2025-05-03", surah: "النساء", memorized: 20, attendance: 95, notes: "" },
  { id: 4, name: "إبراهيم سامي", parent: "سامي إبراهيم", phone: "01098765432", age: 8, joined: "2025-01-10", paid: true, paidDate: "2025-05-01", surah: "الفاتحة", memorized: 3, attendance: 85, notes: "" },
  { id: 5, name: "زياد طارق", parent: "طارق زياد", phone: "01187654321", age: 12, joined: "2024-07-01", paid: false, paidDate: null, surah: "المائدة", memorized: 25, attendance: 60, notes: "غياب متكرر" },
];

const SAMPLE_PAYMENTS = [
  { id: 1, studentId: 1, amount: 999, date: "2025-05-01", month: "مايو 2025" },
  { id: 2, studentId: 3, amount: 999, date: "2025-05-03", month: "مايو 2025" },
  { id: 3, studentId: 4, amount: 999, date: "2025-05-01", month: "مايو 2025" },
  { id: 4, studentId: 1, amount: 999, date: "2025-04-02", month: "أبريل 2025" },
];

const SAMPLE_ATTENDANCE = [
  { id: 1, date: "2025-05-07", present: [1, 3, 4], absent: [2, 5] },
  { id: 2, date: "2025-05-05", present: [1, 2, 3, 4], absent: [5] },
  { id: 3, date: "2025-05-03", present: [1, 3, 5], absent: [2, 4] },
];

const BOT_FLOWS = {
  start: {
    msg: "السلام عليكم 🌙\nأهلًا بك في نظام حلقة القرآن الكريم\n\nاختر من القائمة:",
    options: [
      { label: "📝 تسجيل طالب جديد", next: "register" },
      { label: "💰 دفع الرسوم الشهرية", next: "payment" },
      { label: "📅 مواعيد الحلقة", next: "schedule" },
      { label: "📞 التواصل مع المحفظ", next: "contact" },
    ]
  },
  register: {
    msg: "ممتاز! 📝\n\nلتسجيل طالب جديد، يرجى الضغط على الرابط أدناه لملء استمارة التسجيل وسداد رسوم الاشتراك:",
    options: [{ label: "🔗 فتح رابط التسجيل", next: "registered", link: true }],
  },
  registered: {
    msg: "✅ تم إرسال رابط التسجيل!\n\nبعد الدفع ستصلك رسالة تأكيد خلال ٢٤ ساعة.\n\nهل تحتاج شيء آخر؟",
    options: [{ label: "🏠 القائمة الرئيسية", next: "start" }],
  },
  payment: {
    msg: "💳 لسداد رسوم الاشتراك الشهري (٩٩٩ جنيه)\n\nاضغط على الرابط أدناه للدفع الآمن عبر Systeme:",
    options: [
      { label: "💳 ادفع الآن", next: "paid", link: true },
      { label: "🏠 رجوع", next: "start" },
    ],
  },
  paid: {
    msg: "🎉 شكرًا! تم استلام طلب الدفع.\n\nسيتم تأكيد الاستلام خلال ساعات.\nجزاكم الله خيرًا على الاهتمام بتحفيظ أبنائكم القرآن الكريم 🌟",
    options: [{ label: "🏠 القائمة الرئيسية", next: "start" }],
  },
  schedule: {
    msg: "📅 مواعيد الحلقة:\n\n🕓 السبت والاثنين والأربعاء\n⏰ الساعة ٤:٠٠ عصرًا\n📍 مدينة نصر، القاهرة\n\nيُرجى الحضور قبل الموعد بـ ١٠ دقائق",
    options: [
      { label: "📍 الموقع على الخريطة", next: "location" },
      { label: "🏠 رجوع", next: "start" },
    ],
  },
  location: {
    msg: "📍 موقع الحلقة:\n\nمدينة نصر، شارع عباس العقاد\nبالقرب من مسجد بلال\n\nيمكنك التواصل معنا للحصول على الموقع بالضبط 📌",
    options: [{ label: "🏠 القائمة الرئيسية", next: "start" }],
  },
  contact: {
    msg: "📞 للتواصل مع الأستاذ:\n\n👤 الشيخ أحمد محمود\n📱 ٠١٠١٢٣٤٥٦٧٨\n\nأوقات التواصل: ٨ص — ١٠م",
    options: [{ label: "🏠 رجوع", next: "start" }],
  },
};

// ═══════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════
const C = {
  bg: "#0C1520",
  surface: "#111C2A",
  card: "#162030",
  border: "rgba(201,168,76,0.12)",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  text: "#E4DAC8",
  muted: "rgba(228,218,200,0.4)",
  green: "#34D399",
  red: "#EF4444",
  amber: "#F59E0B",
  blue: "#60A5FA",
  purple: "#A78BFA",
};

const g = {
  gold: "linear-gradient(135deg,#C9A84C,#E8C97A)",
  surface: "linear-gradient(160deg,#111C2A,#0C1520)",
};

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
    green: { background:`${C.green}15`, color:C.green, border:`1px solid ${C.green}30` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontFamily:"'Cairo',sans-serif", fontSize:"0.85rem", fontWeight:600, transition:"opacity 0.15s, transform 0.15s", opacity:disabled?0.5:1, ...styles[variant], ...style }}>
      {children}
    </button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, ...style }}>
    {children}
  </div>
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

const Modal = ({ open, onClose, title, children, maxWidth=480 }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, width:"100%", maxWidth, maxHeight:"92vh", overflow:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:700, color:C.gold, fontSize:"1rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
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
const TD = ({ children, style={} }) => <td style={{ padding:"12px 14px", fontSize:"0.84rem", borderBottom:`1px solid rgba(255,255,255,0.04)`, color:C.text, ...style }}>{children}</td>;

// ═══════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      if ((user === "admin" || user === "محفظ") && pass === "1234") {
        onLogin();
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo',sans-serif", direction:"rtl", padding:20 }}>
      {/* BG pattern */}
      <div style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(ellipse 70% 50% at 50% 0%,rgba(201,168,76,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:400, position:"relative" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:72, height:72, background:g.gold, borderRadius:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 16px", boxShadow:"0 8px 32px rgba(201,168,76,0.35)" }}>🕌</div>
          <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:C.gold, marginBottom:4 }}>الحلقة الذكية</h1>
          <p style={{ fontSize:"0.82rem", color:C.muted }}>نظام إدارة حلقات تحفيظ القرآن الكريم</p>
        </div>

        <Card style={{ padding:32 }}>
          <h3 style={{ fontWeight:700, color:C.text, marginBottom:24, fontSize:"0.95rem" }}>تسجيل الدخول</h3>

          <Input label="اسم المستخدم" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
          <Input label="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="••••" />

          {error && (
            <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, padding:"10px 14px", fontSize:"0.82rem", color:C.red, marginBottom:14 }}>
              ⚠️ {error}
            </div>
          )}

          <Btn onClick={login} style={{ width:"100%", justifyContent:"center", padding:"12px" }} disabled={loading}>
            {loading ? "جارٍ التحقق..." : "دخول →"}
          </Btn>

          <div style={{ marginTop:20, padding:"12px 14px", background:`${C.gold}0A`, border:`1px solid ${C.gold}20`, borderRadius:10, fontSize:"0.78rem", color:C.muted }}>
            💡 للتجربة: المستخدم <span style={{ color:C.gold }}>admin</span> — الباسورد <span style={{ color:C.gold }}>1234</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
const Dashboard = ({ students, payments, attendance, teacher, setPage }) => {
  const total = students.length;
  const paid = students.filter(s => s.paid).length;
  const monthRev = payments.filter(p => p.month === "مايو 2025").reduce((a, p) => a + p.amount, 0);
  const lastAtt = attendance[0];
  const attRate = lastAtt ? Math.round((lastAtt.present.length / total) * 100) : 0;
  const top = [...students].sort((a, b) => b.memorized - a.memorized).slice(0, 3);
  const unpaid = students.filter(s => !s.paid);

  const stats = [
    { label:"إجمالي الطلاب", v:total, sub:"طالب مسجل", color:C.blue, icon:"👨‍🎓" },
    { label:"دفعوا هذا الشهر", v:paid, sub:`من ${total}`, color:C.green, icon:"✅" },
    { label:"لم يدفعوا", v:total-paid, sub:"يحتاجون تذكير", color:C.amber, icon:"⏳" },
    { label:"إيرادات مايو", v:`${monthRev.toLocaleString()} ج`, sub:"جنيه مصري", color:C.gold, icon:"💰" },
  ];

  return (
    <div>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.gold }}>السلام عليكم، {teacher.name} 👋</h1>
        <p style={{ fontSize:"0.82rem", color:C.muted, marginTop:3 }}>ملخص حلقتك — مايو ٢٠٢٥</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:14, marginBottom:20 }}>
        {stats.map((s,i) => (
          <div key={i} style={{ background:C.card, border:`1px solid ${s.color}22`, borderRadius:16, padding:"18px 20px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-10, left:-10, fontSize:60, opacity:0.06 }}>{s.icon}</div>
            <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:"1.9rem", fontWeight:900, color:s.color, lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:"0.82rem", color:C.text, fontWeight:600, marginTop:5 }}>{s.label}</div>
            <div style={{ fontSize:"0.72rem", color:C.muted, marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Last attendance */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ fontSize:"0.9rem", fontWeight:700 }}>📋 آخر جلسة</h3>
            <Badge color={C.green}>{attRate}% حضور</Badge>
          </div>
          {lastAtt && students.map(s => (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:`${C.gold}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>👤</div>
              <span style={{ flex:1, fontSize:"0.84rem" }}>{s.name}</span>
              <Badge color={lastAtt.present.includes(s.id) ? C.green : C.red}>
                {lastAtt.present.includes(s.id) ? "حاضر" : "غائب"}
              </Badge>
            </div>
          ))}
        </Card>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Top memorizers */}
          <Card>
            <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>🏆 أفضل الحفاظ</h3>
            {top.map((s,i) => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:i===0?"#C9A84C":i===1?"#9CA3AF":"#CD7F32", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.72rem", fontWeight:700, color:"#000", flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.83rem", fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:"0.72rem", color:C.muted }}>سورة {s.surah}</div>
                </div>
                <span style={{ color:C.gold, fontWeight:800, fontSize:"0.9rem" }}>{s.memorized}<span style={{ fontSize:"0.7rem", color:C.muted, fontWeight:400 }}> ص</span></span>
              </div>
            ))}
          </Card>

          {/* Unpaid alert */}
          {unpaid.length > 0 && (
            <div style={{ background:`${C.amber}0A`, border:`1px solid ${C.amber}25`, borderRadius:14, padding:16 }}>
              <div style={{ fontSize:"0.82rem", color:C.amber, fontWeight:700, marginBottom:10 }}>⚠️ لم يسددوا رسوم مايو</div>
              {unpaid.map(s => (
                <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:"0.82rem", fontWeight:600 }}>{s.name}</div>
                    <div style={{ fontSize:"0.72rem", color:C.muted }}>{s.phone}</div>
                  </div>
                  <a href={`https://wa.me/2${s.phone}?text=${encodeURIComponent("السلام عليكم، نذكركم بسداد رسوم الاشتراك الشهري جزاكم الله خيرًا 🌙")}`} target="_blank" rel="noreferrer" style={{ fontSize:"0.75rem", color:C.green, textDecoration:"none", fontWeight:600 }}>📲 واتساب</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <Card style={{ marginTop:16 }}>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>⚡ إجراءات سريعة</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Btn variant="secondary" onClick={() => setPage("attendance")}>📋 تسجيل حضور اليوم</Btn>
          <Btn variant="secondary" onClick={() => setPage("reminders")}>🔔 إرسال تذكير</Btn>
          <Btn variant="secondary" onClick={() => setPage("students")}>➕ إضافة طالب</Btn>
          <Btn variant="secondary" onClick={() => setPage("reports")}>📊 عرض التقرير</Btn>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════
const Students = ({ students, setStudents }) => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const empty = { name:"", parent:"", phone:"", age:"", surah:"", memorized:"", notes:"" };
  const [form, setForm] = useState(empty);

  const filtered = students.filter(s => s.name.includes(search) || s.parent.includes(search) || s.phone.includes(search));

  const openAdd = () => { setForm(empty); setModal("add"); };
  const openEdit = s => { setForm({ name:s.name, parent:s.parent, phone:s.phone, age:s.age, surah:s.surah, memorized:s.memorized, notes:s.notes }); setModal(s); };

  const doSave = () => {
    if (!form.name || !form.phone) return;
    if (modal === "add") {
      setStudents(p => [...p, { id:Date.now(), ...form, age:+form.age||0, memorized:+form.memorized||0, joined:new Date().toISOString().split("T")[0], paid:false, paidDate:null, attendance:100 }]);
    } else {
      setStudents(p => p.map(s => s.id===modal.id ? { ...s, ...form, age:+form.age||0, memorized:+form.memorized||0 } : s));
    }
    setModal(null);
  };

  const del = id => { if (confirm("تأكيد حذف الطالب؟")) setStudents(p => p.filter(s => s.id !== id)); };

  const F = ({ label, field, type="text" }) => (
    <Input label={label} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]:e.target.value }))} type={type} />
  );

  return (
    <div>
      <PageHeader
        title="الطلاب"
        sub={`${students.length} طالب مسجل`}
        action={<Btn onClick={openAdd}>＋ طالب جديد</Btn>}
      />

      <Card style={{ marginBottom:14 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 بحث بالاسم أو الهاتف..." style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.88rem", outline:"none" }} />
      </Card>

      <Card>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{["الطالب","ولي الأمر","الهاتف","السورة","الحفظ","الحضور","الرسوم",""].map(h => <TH key={h}>{h}</TH>)}</tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <TD><div style={{ fontWeight:700 }}>{s.name}</div><div style={{ fontSize:"0.72rem", color:C.muted }}>انضم {s.joined}</div></TD>
                  <TD>{s.parent}</TD>
                  <TD><span style={{ direction:"ltr", display:"inline-block" }}>{s.phone}</span></TD>
                  <TD>{s.surah}</TD>
                  <TD><span style={{ color:C.gold, fontWeight:700 }}>{s.memorized}</span> <span style={{ fontSize:"0.72rem", color:C.muted }}>ص</span></TD>
                  <TD><Badge color={s.attendance>=80?C.green:C.amber}>{s.attendance}%</Badge></TD>
                  <TD><Badge color={s.paid?C.green:C.amber}>{s.paid?"✓ دفع":"⏳ لم يدفع"}</Badge></TD>
                  <TD>
                    <div style={{ display:"flex", gap:6 }}>
                      <Btn variant="secondary" style={{ padding:"5px 10px", fontSize:"0.75rem" }} onClick={() => openEdit(s)}>✎</Btn>
                      <Btn variant="danger" style={{ padding:"5px 10px", fontSize:"0.75rem" }} onClick={() => del(s.id)}>×</Btn>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal==="add" ? "إضافة طالب جديد" : "تعديل بيانات الطالب"}>
        <F label="اسم الطالب *" field="name" />
        <F label="اسم ولي الأمر *" field="parent" />
        <F label="رقم الهاتف *" field="phone" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <F label="السن" field="age" type="number" />
          <F label="الصفحات المحفوظة" field="memorized" type="number" />
        </div>
        <F label="السورة الحالية" field="surah" />
        <Input label="ملاحظات" value={form.notes} onChange={e => setForm(p => ({ ...p, notes:e.target.value }))} as="textarea" />
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>إلغاء</Btn>
          <Btn onClick={doSave}>حفظ</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════
const Payments = ({ students, payments, setPayments, setStudents, teacher }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId:"", amount:teacher.fee, month:"مايو 2025" });

  const monthRev = payments.filter(p => p.month === "مايو 2025").reduce((a, p) => a + p.amount, 0);

  const doSave = () => {
    if (!form.studentId) return;
    setPayments(p => [...p, { id:Date.now(), studentId:+form.studentId, amount:+form.amount, date:new Date().toISOString().split("T")[0], month:form.month }]);
    setStudents(p => p.map(s => s.id===+form.studentId ? { ...s, paid:true, paidDate:new Date().toISOString().split("T")[0] } : s));
    setModal(false);
  };

  return (
    <div>
      <PageHeader title="المدفوعات" sub={`إيرادات مايو: ${monthRev.toLocaleString()} ج.م`} action={<Btn onClick={() => setModal(true)}>＋ تسجيل دفعة</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:16 }}>
        {[
          { label:"دفعوا", v:students.filter(s=>s.paid).length, color:C.green },
          { label:"لم يدفعوا", v:students.filter(s=>!s.paid).length, color:C.amber },
          { label:"إجمالي الشهر", v:`${monthRev.toLocaleString()} ج`, color:C.gold },
        ].map((x,i) => (
          <Card key={i} style={{ textAlign:"center", padding:"16px 10px" }}>
            <div style={{ fontSize:"1.6rem", fontWeight:900, color:x.color }}>{x.v}</div>
            <div style={{ fontSize:"0.78rem", color:C.muted, marginTop:4 }}>{x.label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom:14 }}>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>حالة الدفع — مايو ٢٠٢٥</h3>
        {students.map(s => (
          <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:`${C.gold}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>👤</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.86rem", fontWeight:600 }}>{s.name}</div>
              <div style={{ fontSize:"0.73rem", color:C.muted }}>{s.parent} · {s.phone}</div>
            </div>
            <Badge color={s.paid ? C.green : C.amber}>{s.paid ? `✓ ${s.paidDate}` : "⏳ لم يدفع"}</Badge>
            {!s.paid && (
              <a href={`https://wa.me/2${s.phone}?text=${encodeURIComponent("السلام عليكم، نذكركم بسداد رسوم الاشتراك الشهري (٩٩٩ جنيه) جزاكم الله خيرًا 🌙")}`} target="_blank" rel="noreferrer" style={{ fontSize:"0.75rem", color:C.green, textDecoration:"none", fontWeight:600, whiteSpace:"nowrap" }}>📲 تذكير</a>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>سجل المدفوعات</h3>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["الطالب","المبلغ","الشهر","التاريخ"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {payments.map(p => {
              const st = students.find(s => s.id === p.studentId);
              return (
                <tr key={p.id}>
                  <TD>{st?.name||"—"}</TD>
                  <TD style={{ color:C.gold, fontWeight:700 }}>{p.amount.toLocaleString()} ج.م</TD>
                  <TD>{p.month}</TD>
                  <TD>{p.date}</TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="تسجيل دفعة جديدة">
        <Select label="الطالب" value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId:e.target.value }))} options={[{ value:"", label:"اختر الطالب..." }, ...students.map(s => ({ value:s.id, label:s.name }))]} />
        <Input label="المبلغ (ج.م)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount:e.target.value }))} type="number" />
        <Input label="الشهر" value={form.month} onChange={e => setForm(p => ({ ...p, month:e.target.value }))} />
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
          <Btn variant="ghost" onClick={() => setModal(false)}>إلغاء</Btn>
          <Btn onClick={doSave} disabled={!form.studentId}>✓ تأكيد الدفع</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════
const Attendance = ({ students, attendance, setAttendance }) => {
  const [selected, setSelected] = useState(new Set(students.map(s => s.id)));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [flash, setFlash] = useState(false);

  const toggle = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const all = () => setSelected(new Set(students.map(s => s.id)));
  const none = () => setSelected(new Set());

  const doSave = () => {
    setAttendance(p => [{ id:Date.now(), date, present:[...selected], absent:students.filter(s => !selected.has(s.id)).map(s=>s.id) }, ...p]);
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  };

  return (
    <div>
      <PageHeader title="الحضور والغياب" sub="سجّل حضور جلسة اليوم" />

      <Card style={{ marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18, flexWrap:"wrap" }}>
          <div>
            <label style={{ fontSize:"0.75rem", color:C.muted, display:"block", marginBottom:5, fontWeight:600 }}>تاريخ الجلسة</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text, fontFamily:"'Cairo',sans-serif", outline:"none" }} />
          </div>
          <div style={{ display:"flex", gap:12, marginTop:20 }}>
            <div style={{ textAlign:"center", padding:"8px 18px", background:`${C.green}12`, borderRadius:10 }}>
              <div style={{ fontSize:"1.4rem", fontWeight:800, color:C.green }}>{selected.size}</div>
              <div style={{ fontSize:"0.72rem", color:C.muted }}>حاضر</div>
            </div>
            <div style={{ textAlign:"center", padding:"8px 18px", background:`${C.red}10`, borderRadius:10 }}>
              <div style={{ fontSize:"1.4rem", fontWeight:800, color:C.red }}>{students.length - selected.size}</div>
              <div style={{ fontSize:"0.72rem", color:C.muted }}>غائب</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:20 }}>
            <Btn variant="ghost" style={{ padding:"6px 12px", fontSize:"0.75rem" }} onClick={all}>الكل حاضر</Btn>
            <Btn variant="ghost" style={{ padding:"6px 12px", fontSize:"0.75rem" }} onClick={none}>الكل غائب</Btn>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
          {students.map(s => {
            const present = selected.has(s.id);
            return (
              <div key={s.id} onClick={() => toggle(s.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, cursor:"pointer", background:present?`${C.green}0A`:`${C.red}08`, border:`1px solid ${present?`${C.green}22`:`${C.red}1A`}`, transition:"all 0.18s" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${present?C.green:C.red}`, display:"flex", alignItems:"center", justifyContent:"center", color:present?C.green:C.red, fontSize:13, flexShrink:0 }}>
                  {present ? "✓" : "×"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.88rem", fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:"0.73rem", color:C.muted }}>سورة {s.surah} · {s.memorized} صفحة</div>
                </div>
                <Badge color={present?C.green:C.red}>{present?"حاضر":"غائب"}</Badge>
              </div>
            );
          })}
        </div>

        <Btn onClick={doSave} style={{ width:"100%", justifyContent:"center", padding:13 }}>
          {flash ? "✓ تم الحفظ!" : "💾 حفظ الحضور"}
        </Btn>
      </Card>

      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>سجل الجلسات السابقة</h3>
        {attendance.slice(0,6).map(a => (
          <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
            <span style={{ fontSize:"0.86rem", fontWeight:600 }}>📅 {a.date}</span>
            <div style={{ display:"flex", gap:8 }}>
              <Badge color={C.green}>{a.present.length} حاضر</Badge>
              <Badge color={C.red}>{a.absent.length} غائب</Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// REMINDERS
// ═══════════════════════════════════════════════
const Reminders = ({ students, teacher }) => {
  const [sent, setSent] = useState({});
  const flash = key => { setSent(p => ({ ...p, [key]:true })); setTimeout(() => setSent(p => ({ ...p, [key]:false })), 2000); };

  const unpaid = students.filter(s => !s.paid);

  const sessionMsg = `السلام عليكم ورحمة الله 🌙\nنذكركم بموعد حلقة التحفيظ القادمة:\n📅 غدًا — ${teacher.schedule}\n📍 ${teacher.location}\nالحضور في الموعد يسعدنا 🌟`;

  const autoReminders = [
    { label:"تذكير موعد الحلقة", target:"جميع الأهالي", when:"قبل الحلقة بساعة", active:true },
    { label:"تأخر الرسوم الشهرية", target:"الأهالي المتأخرين", when:"كل أول الشهر", active:true },
    { label:"تهنئة إتمام السورة", target:"الطالب وولي أمره", when:"عند إتمام الحفظ", active:true },
    { label:"تقرير الحضور الأسبوعي", target:"جميع الأهالي", when:"كل جمعة", active:false },
  ];

  return (
    <div>
      <PageHeader title="التذكيرات" sub="إرسال رسائل واتساب تلقائية وفورية" />

      <Card style={{ marginBottom:14 }}>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>🤖 التذكيرات التلقائية</h3>
        {autoReminders.map((r, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.86rem", fontWeight:600 }}>{r.label}</div>
              <div style={{ fontSize:"0.73rem", color:C.muted }}>{r.target} · {r.when}</div>
            </div>
            <Badge color={r.active?C.green:C.muted}>{r.active?"● نشط":"○ متوقف"}</Badge>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom:14 }}>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:6 }}>📢 تذكير موعد الحلقة</h3>
        <p style={{ fontSize:"0.78rem", color:C.muted, marginBottom:12 }}>إرسال لجميع أهالي الطلاب ({students.length} أهالي)</p>
        <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)`, borderRadius:10, padding:14, marginBottom:14, fontSize:"0.83rem", color:"rgba(228,218,200,0.7)", lineHeight:1.9, whiteSpace:"pre-line" }}>
          {sessionMsg}
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <a href={`https://wa.me/?text=${encodeURIComponent(sessionMsg)}`} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
            <Btn variant="green" onClick={() => flash("session")}>{sent["session"] ? "✓ تم!" : "📲 إرسال واتساب لجميع الأهالي"}</Btn>
          </a>
        </div>
      </Card>

      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:6 }}>💳 تذكير الرسوم المتأخرة</h3>
        <p style={{ fontSize:"0.78rem", color:C.muted, marginBottom:14 }}>{unpaid.length} طلاب لم يسددوا رسوم هذا الشهر</p>
        {unpaid.length === 0
          ? <div style={{ textAlign:"center", padding:20, color:C.muted, fontSize:"0.85rem" }}>✅ جميع الطلاب سددوا الرسوم</div>
          : unpaid.map(s => {
              const msg = `السلام عليكم ${s.parent}،\nنذكركم بسداد رسوم اشتراك ${s.name} الشهري (${teacher.fee} ج.م)\nرابط الدفع: ${teacher.systemeLink}\nجزاكم الله خيرًا 🌙`;
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.85rem", fontWeight:600 }}>{s.name}</div>
                    <div style={{ fontSize:"0.73rem", color:C.muted }}>{s.parent} · {s.phone}</div>
                  </div>
                  <a href={`https://wa.me/2${s.phone}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                    <Btn variant="green" style={{ padding:"6px 14px", fontSize:"0.78rem" }} onClick={() => flash(`pay-${s.id}`)}>
                      {sent[`pay-${s.id}`] ? "✓ أُرسل" : "📲 إرسال"}
                    </Btn>
                  </a>
                </div>
              );
            })}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════
const Reports = ({ students, payments, attendance }) => {
  const monthRev = payments.filter(p => p.month==="مايو 2025").reduce((a,p) => a+p.amount, 0);
  const paid = students.filter(s => s.paid).length;
  const avgMem = students.length ? Math.round(students.reduce((a,s) => a+s.memorized, 0)/students.length) : 0;
  const avgAtt = students.length ? Math.round(students.reduce((a,s) => a+s.attendance, 0)/students.length) : 0;

  return (
    <div>
      <PageHeader title="التقارير" sub="مايو ٢٠٢٥" action={<Btn variant="secondary">⬇ تصدير</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:16 }}>
        {[
          { label:"إجمالي الطلاب", v:students.length, color:C.blue, icon:"👥" },
          { label:"نسبة الدفع", v:`${paid?Math.round(paid/students.length*100):0}%`, color:C.green, icon:"💳" },
          { label:"إيرادات الشهر", v:`${monthRev.toLocaleString()} ج`, color:C.gold, icon:"💰" },
          { label:"متوسط الحفظ", v:`${avgMem} ص`, color:C.purple, icon:"📖" },
          { label:"متوسط الحضور", v:`${avgAtt}%`, color:"#F472B6", icon:"📋" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"16px", textAlign:"center" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:"1.4rem", fontWeight:900, color:s.color }}>{s.v}</div>
            <div style={{ fontSize:"0.73rem", color:C.muted, marginTop:3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>تفصيل كل طالب</h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["الطالب","السورة","الحفظ","الحضور","الرسوم"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <TD><div style={{ fontWeight:700 }}>{s.name}</div><div style={{ fontSize:"0.72rem", color:C.muted }}>{s.notes}</div></TD>
                  <TD>{s.surah}</TD>
                  <TD>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, minWidth:60, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min((s.memorized/30)*100,100)}%`, background:C.gold, borderRadius:3 }} />
                      </div>
                      <span style={{ color:C.gold, fontWeight:700, fontSize:"0.82rem", minWidth:36 }}>{s.memorized} ص</span>
                    </div>
                  </TD>
                  <TD><Badge color={s.attendance>=80?C.green:C.amber}>{s.attendance}%</Badge></TD>
                  <TD><Badge color={s.paid?C.green:C.red}>{s.paid?"✓ مدفوع":"✗ متأخر"}</Badge></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// SYSTEME INTEGRATION PAGE
// ═══════════════════════════════════════════════
const SystemePage = ({ teacher, setTeacher }) => {
  const [form, setForm] = useState({ link: teacher.systemeLink, fee: teacher.fee });
  const [saved, setSaved] = useState(false);

  const doSave = () => {
    setTeacher(p => ({ ...p, systemeLink: form.link, fee: +form.fee }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const regLink = `${form.link}?ref=halqa`;
  const payLink = `${form.link}/pay`;

  return (
    <div>
      <PageHeader title="ربط Systeme.io" sub="إدارة روابط التسجيل والدفع الأونلاين" />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card style={{ borderColor:`${C.green}30` }}>
          <div style={{ fontSize:28, marginBottom:10 }}>📝</div>
          <h3 style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:6 }}>رابط تسجيل الطلاب</h3>
          <p style={{ fontSize:"0.78rem", color:C.muted, marginBottom:12 }}>الأهالي يدخلون بياناتهم ويسجلون عبر هذا الرابط</p>
          <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:"0.75rem", color:C.muted, wordBreak:"break-all", marginBottom:10, direction:"ltr", textAlign:"left" }}>
            {regLink}
          </div>
          <a href={regLink} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
            <Btn variant="secondary" style={{ fontSize:"0.78rem", padding:"6px 14px" }}>🔗 فتح الرابط</Btn>
          </a>
        </Card>

        <Card style={{ borderColor:`${C.gold}30` }}>
          <div style={{ fontSize:28, marginBottom:10 }}>💳</div>
          <h3 style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:6 }}>رابط الدفع الشهري</h3>
          <p style={{ fontSize:"0.78rem", color:C.muted, marginBottom:12 }}>لاستقبال رسوم الاشتراك والتبرعات أونلاين بشكل آمن</p>
          <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:"0.75rem", color:C.muted, wordBreak:"break-all", marginBottom:10, direction:"ltr", textAlign:"left" }}>
            {payLink}
          </div>
          <a href={payLink} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
            <Btn variant="secondary" style={{ fontSize:"0.78rem", padding:"6px 14px" }}>💳 صفحة الدفع</Btn>
          </a>
        </Card>
      </div>

      <Card style={{ marginBottom:16 }}>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>⚙️ إعدادات الربط</h3>
        <Input label="رابط Systeme الرئيسي" value={form.link} onChange={e => setForm(p => ({ ...p, link:e.target.value }))} />
        <Input label="قيمة الاشتراك الشهري (ج.م)" value={form.fee} onChange={e => setForm(p => ({ ...p, fee:e.target.value }))} type="number" />
        <Btn onClick={doSave}>{saved ? "✓ تم الحفظ!" : "💾 حفظ الإعدادات"}</Btn>
      </Card>

      <Card>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>📋 كيفية الربط مع Systeme</h3>
        {[
          { n:"١", t:"أنشئ فانل في Systeme.io", d:"اذهب إلى Funnels → New Funnel → أضف صفحة تسجيل وصفحة دفع" },
          { n:"٢", t:"فعّل Stripe أو PayPal", d:"من الإعدادات أضف بوابة الدفع المناسبة لاستقبال المدفوعات أونلاين" },
          { n:"٣", t:"انسخ الرابط هنا", d:"بعد نشر الفانل، انسخ الرابط العام وضعه في الخانة أعلاه" },
          { n:"٤", t:"فعّل Webhook (اختياري)", d:"لإضافة الطلاب تلقائيًا بعد الدفع — تواصل معنا لإعداده" },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", gap:14, padding:"12px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${C.gold}`, color:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.78rem", fontWeight:700, flexShrink:0 }}>{s.n}</div>
            <div>
              <div style={{ fontSize:"0.86rem", fontWeight:700 }}>{s.t}</div>
              <div style={{ fontSize:"0.77rem", color:C.muted, marginTop:3 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// WHATSAPP BOT
// ═══════════════════════════════════════════════
const WhatsAppBot = ({ teacher }) => {
  const [msgs, setMsgs] = useState([{ from:"bot", text:BOT_FLOWS.start.msg, opts:BOT_FLOWS.start.options }]);
  const [current, setCurrent] = useState("start");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const choose = (opt) => {
    setMsgs(p => [...p, { from:"user", text:opt.label }]);
    setTyping(true);
    setTimeout(() => {
      const flow = BOT_FLOWS[opt.next];
      if (flow) {
        setMsgs(p => [...p, { from:"bot", text:flow.msg, opts:flow.options }]);
        setCurrent(opt.next);
      }
      setTyping(false);
    }, 900);
  };

  const reset = () => { setMsgs([{ from:"bot", text:BOT_FLOWS.start.msg, opts:BOT_FLOWS.start.options }]); setCurrent("start"); };

  return (
    <div>
      <PageHeader title="بوت واتساب" sub="محاكاة تجربة الأهالي مع البوت الآلي" />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Preview */}
        <div>
          <div style={{ background:"#075E54", borderRadius:"20px 20px 0 0", padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🕌</div>
            <div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:"0.88rem" }}>حلقة {teacher.name}</div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.72rem" }}>● متصل الآن</div>
            </div>
            <div style={{ marginRight:"auto" }}>
              <Btn variant="ghost" style={{ padding:"4px 10px", fontSize:"0.72rem" }} onClick={reset}>↺ إعادة</Btn>
            </div>
          </div>

          <div style={{ background:"#ECE5DD", backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(0,0,0,0.03)'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E\")", padding:16, height:440, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, borderRadius:"0 0 20px 20px" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.from==="bot"?"flex-start":"flex-end" }}>
                <div style={{ maxWidth:"82%", background:m.from==="bot"?"#fff":"#DCF8C6", borderRadius:m.from==="bot"?"4px 14px 14px 14px":"14px 4px 14px 14px", padding:"10px 14px", boxShadow:"0 1px 2px rgba(0,0,0,0.12)", fontSize:"0.83rem", color:"#1A1A1A", whiteSpace:"pre-line", lineHeight:1.7, direction:"rtl", textAlign:"right" }}>
                  {m.text}
                </div>
                {m.opts && i === msgs.length - 1 && !typing && (
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:6, alignItems:"flex-start", width:"82%" }}>
                    {m.opts.map((o, j) => (
                      <button key={j} onClick={() => choose(o)} style={{ background:"#fff", border:"1px solid #128C7E", borderRadius:20, padding:"7px 16px", color:"#128C7E", fontFamily:"'Cairo',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", textAlign:"right", width:"100%" }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex", alignItems:"flex-start" }}>
                <div style={{ background:"#fff", borderRadius:"4px 14px 14px 14px", padding:"10px 16px", boxShadow:"0 1px 2px rgba(0,0,0,0.1)" }}>
                  <div style={{ display:"flex", gap:4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#9CA3AF", animation:`bounce 1s ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Setup guide */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>⚙️ إعداد البوت الحقيقي</h3>
            {[
              { icon:"1️⃣", t:"Meta Business Suite", d:"اربط رقمك على WhatsApp Business API من meta.com" },
              { icon:"2️⃣", t:"اختر منصة البوت", d:"iBots أو Botpress أو ManyChat — كلهم يدعمون العربية" },
              { icon:"3️⃣", t:"انسخ ردود البوت", d:"نفس الردود الظاهرة في المحاكاة — جاهزة للرفع مباشرة" },
              { icon:"4️⃣", t:"اربط Systeme", d:"رابط التسجيل والدفع يُدرج تلقائيًا في ردود البوت" },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:14 }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize:"0.85rem", fontWeight:700 }}>{s.t}</div>
                  <div style={{ fontSize:"0.77rem", color:C.muted, marginTop:2 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:12 }}>📊 إحصائيات البوت</h3>
            {[
              { label:"محادثات هذا الشهر", v:"٢٤", color:C.blue },
              { label:"تسجيلات عبر البوت", v:"٣", color:C.green },
              { label:"معدل الرد التلقائي", v:"١٠٠%", color:C.gold },
              { label:"متوسط وقت الرد", v:"< ١ ث", color:C.purple },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize:"0.84rem", color:C.muted }}>{s.label}</span>
                <span style={{ fontSize:"0.95rem", fontWeight:800, color:s.color }}>{s.v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════
// PUBLIC PROFILE PAGE
// ═══════════════════════════════════════════════
const PublicProfile = ({ teacher, setTeacher }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...teacher });
  const [preview, setPreview] = useState(false);

  const doSave = () => { setTeacher(form); setEditing(false); };

  if (preview) {
    return (
      <div>
        <div style={{ marginBottom:14 }}>
          <Btn variant="ghost" onClick={() => setPreview(false)}>‹ رجوع للإعدادات</Btn>
        </div>
        {/* Public page preview */}
        <div style={{ background:"#FAF5E8", borderRadius:20, overflow:"hidden", fontFamily:"'Cairo',sans-serif", direction:"rtl", color:"#3B2D1A" }}>
          <div style={{ background:"#1A1208", padding:"50px 30px", textAlign:"center", position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%,rgba(201,168,76,0.2),transparent 70%)" }} />
            <div style={{ position:"relative" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#E8C97A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(201,168,76,0.4)" }}>🕌</div>
              <h1 style={{ fontFamily:"'Amiri',serif", fontSize:"2rem", color:"#fff", marginBottom:8 }}>{teacher.name}</h1>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.9rem", marginBottom:16 }}>{teacher.location}</p>
              <a href={teacher.systemeLink} target="_blank" rel="noreferrer" style={{ display:"inline-block", background:"linear-gradient(135deg,#C9A84C,#E8C97A)", color:"#1A1208", fontWeight:700, padding:"12px 28px", borderRadius:12, textDecoration:"none", fontSize:"0.9rem" }}>📝 سجّل طفلك الآن</a>
            </div>
          </div>
          <div style={{ padding:"30px 24px" }}>
            <p style={{ fontSize:"1rem", lineHeight:1.9, marginBottom:24, textAlign:"center" }}>{teacher.bio}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
              {[{ icon:"📅", label:"المواعيد", v:teacher.schedule }, { icon:"💰", label:"رسوم الاشتراك", v:`${teacher.fee} جنيه شهريًا` }, { icon:"📍", label:"الموقع", v:teacher.location }, { icon:"📱", label:"للتواصل", v:teacher.phone }].map((x,i) => (
                <div key={i} style={{ background:"#fff", borderRadius:14, padding:"16px", border:"1px solid rgba(201,168,76,0.2)", textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{x.icon}</div>
                  <div style={{ fontSize:"0.75rem", color:"#9A7B4F", fontWeight:600, marginBottom:4 }}>{x.label}</div>
                  <div style={{ fontSize:"0.88rem", fontWeight:700, color:"#3B2D1A" }}>{x.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <a href={teacher.systemeLink} target="_blank" rel="noreferrer" style={{ background:"linear-gradient(135deg,#C9A84C,#E8C97A)", color:"#1A1208", fontWeight:700, padding:"13px 28px", borderRadius:12, textDecoration:"none", fontSize:"0.9rem" }}>📝 تسجيل الآن</a>
              <a href={`https://wa.me/2${teacher.phone}`} target="_blank" rel="noreferrer" style={{ background:"#075E54", color:"#fff", fontWeight:700, padding:"13px 28px", borderRadius:12, textDecoration:"none", fontSize:"0.9rem" }}>📲 واتساب</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="الصفحة التعريفية"
        sub="صفحتك العامة التي يراها الأهالي"
        action={
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="secondary" onClick={() => setPreview(true)}>👁 معاينة</Btn>
            {editing ? <Btn onClick={doSave}>💾 حفظ</Btn> : <Btn variant="secondary" onClick={() => setEditing(true)}>✎ تعديل</Btn>}
          </div>
        }
      />

      <Card>
        {editing ? (
          <>
            <Input label="اسم المحفظ" value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} />
            <Input label="رقم الواتساب" value={form.phone} onChange={e => setForm(p => ({ ...p, phone:e.target.value }))} />
            <Input label="الموقع" value={form.location} onChange={e => setForm(p => ({ ...p, location:e.target.value }))} />
            <Input label="المواعيد" value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule:e.target.value }))} />
            <Input label="نبذة عنك" value={form.bio} onChange={e => setForm(p => ({ ...p, bio:e.target.value }))} as="textarea" />
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn variant="ghost" onClick={() => setEditing(false)}>إلغاء</Btn>
              <Btn onClick={doSave}>حفظ</Btn>
            </div>
          </>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[
              { label:"الاسم", v:teacher.name },
              { label:"الهاتف", v:teacher.phone },
              { label:"الموقع", v:teacher.location },
              { label:"المواعيد", v:teacher.schedule },
              { label:"رسوم الاشتراك", v:`${teacher.fee} ج.م` },
              { label:"رابط Systeme", v:teacher.systemeLink },
            ].map((x,i) => (
              <div key={i}>
                <div style={{ fontSize:"0.73rem", color:C.muted, marginBottom:4, fontWeight:600 }}>{x.label}</div>
                <div style={{ fontSize:"0.88rem", fontWeight:600, wordBreak:"break-all" }}>{x.v}</div>
              </div>
            ))}
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ fontSize:"0.73rem", color:C.muted, marginBottom:4, fontWeight:600 }}>النبذة</div>
              <div style={{ fontSize:"0.88rem", lineHeight:1.8, color:"rgba(228,218,200,0.8)" }}>{teacher.bio}</div>
            </div>
          </div>
        )}
      </Card>

      <div style={{ marginTop:14, padding:16, background:`${C.gold}08`, border:`1px solid ${C.gold}20`, borderRadius:14 }}>
        <div style={{ fontSize:"0.82rem", color:C.gold, fontWeight:700, marginBottom:6 }}>💡 رابط صفحتك العامة</div>
        <div style={{ fontSize:"0.78rem", color:C.muted, marginBottom:8 }}>شارك هذا الرابط مع الأهالي أو في إعلانات الفيسبوك</div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:"0.75rem", color:C.muted, direction:"ltr", textAlign:"left" }}>
          https://halqa.smart/{teacher.name.replace(/\s/g,"-")}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════
const Settings = ({ teacher, setTeacher, onLogout }) => {
  const [pass, setPass] = useState({ old:"", new1:"", new2:"" });
  const [passMsg, setPassMsg] = useState("");

  const changePass = () => {
    if (pass.old !== "1234") { setPassMsg("كلمة المرور الحالية غير صحيحة"); return; }
    if (pass.new1 !== pass.new2) { setPassMsg("كلمة المرور الجديدة غير متطابقة"); return; }
    if (pass.new1.length < 4) { setPassMsg("كلمة المرور يجب أن تكون ٤ أحرف على الأقل"); return; }
    setPassMsg("✅ تم تغيير كلمة المرور");
    setPass({ old:"", new1:"", new2:"" });
  };

  return (
    <div>
      <PageHeader title="الإعدادات" />

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>🔐 تغيير كلمة المرور</h3>
          <Input label="كلمة المرور الحالية" value={pass.old} onChange={e => setPass(p => ({ ...p, old:e.target.value }))} type="password" />
          <Input label="كلمة المرور الجديدة" value={pass.new1} onChange={e => setPass(p => ({ ...p, new1:e.target.value }))} type="password" />
          <Input label="تأكيد كلمة المرور" value={pass.new2} onChange={e => setPass(p => ({ ...p, new2:e.target.value }))} type="password" />
          {passMsg && <div style={{ fontSize:"0.82rem", color:passMsg.includes("✅")?C.green:C.red, marginBottom:10 }}>{passMsg}</div>}
          <Btn onClick={changePass}>تغيير كلمة المرور</Btn>
        </Card>

        <Card>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:14 }}>📱 إعدادات النظام</h3>
          {[
            { label:"تذكير قبل الحلقة", desc:"إرسال تذكير تلقائي قبل الجلسة بساعة", on:true },
            { label:"تنبيه تأخر الرسوم", desc:"تنبيه عند تأخر الدفع عن اليوم الخامس", on:true },
            { label:"تقرير أسبوعي", desc:"تقرير ملخص كل جمعة", on:false },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
              <div>
                <div style={{ fontSize:"0.86rem", fontWeight:600 }}>{s.label}</div>
                <div style={{ fontSize:"0.75rem", color:C.muted }}>{s.desc}</div>
              </div>
              <div style={{ width:42, height:24, borderRadius:12, background:s.on?C.green:"rgba(255,255,255,0.1)", position:"relative", cursor:"pointer" }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, transition:"right 0.2s", right:s.on?3:21 }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, marginBottom:6, color:C.red }}>⚠️ منطقة الخطر</h3>
          <p style={{ fontSize:"0.8rem", color:C.muted, marginBottom:14 }}>هذه الإجراءات لا يمكن التراجع عنها</p>
          <Btn variant="danger" onClick={onLogout}>تسجيل الخروج</Btn>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════
const NAV = [
  { id:"dashboard", label:"الرئيسية", icon:"⊞" },
  { id:"students", label:"الطلاب", icon:"👥" },
  { id:"payments", label:"المدفوعات", icon:"💰" },
  { id:"attendance", label:"الحضور", icon:"📋" },
  { id:"reminders", label:"التذكيرات", icon:"🔔" },
  { id:"reports", label:"التقارير", icon:"📊" },
  { id:"bot", label:"بوت واتساب", icon:"🤖" },
  { id:"systeme", label:"Systeme", icon:"🔗" },
  { id:"profile", label:"الصفحة التعريفية", icon:"🌐" },
  { id:"settings", label:"الإعدادات", icon:"⚙️" },
];

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);
  const [teacher, setTeacherState] = useState(() => LS.get("halqa_teacher", DEMO_TEACHER));
  const [students, setStudentsState] = useState(() => LS.get("halqa_students", SAMPLE_STUDENTS));
  const [payments, setPaymentsState] = useState(() => LS.get("halqa_payments", SAMPLE_PAYMENTS));
  const [attendance, setAttendanceState] = useState(() => LS.get("halqa_attendance", SAMPLE_ATTENDANCE));

  const persist = (key, setter) => fn => setter(prev => {
    const next = typeof fn === "function" ? fn(prev) : fn;
    LS.set(key, next);
    return next;
  });

  const setTeacher = persist("halqa_teacher", setTeacherState);
  const setStudents = persist("halqa_students", setStudentsState);
  const setPayments = persist("halqa_payments", setPaymentsState);
  const setAttendance = persist("halqa_attendance", setAttendanceState);

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  const unpaidCount = students.filter(s => !s.paid).length;

  const pages = {
    dashboard: <Dashboard students={students} payments={payments} attendance={attendance} teacher={teacher} setPage={setPage} />,
    students: <Students students={students} setStudents={setStudents} />,
    payments: <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacher} />,
    attendance: <Attendance students={students} attendance={attendance} setAttendance={setAttendance} />,
    reminders: <Reminders students={students} teacher={teacher} />,
    reports: <Reports students={students} payments={payments} attendance={attendance} />,
    bot: <WhatsAppBot teacher={teacher} />,
    systeme: <SystemePage teacher={teacher} setTeacher={setTeacher} />,
    profile: <PublicProfile teacher={teacher} setTeacher={setTeacher} />,
    settings: <Settings teacher={teacher} setTeacher={setTeacher} onLogout={() => setLoggedIn(false)} />,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, fontFamily:"'Cairo',sans-serif", direction:"rtl", color:C.text }}>
      {/* Sidebar */}
      <div style={{ width:sideOpen?240:64, background:"#080F18", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transition:"width 0.28s", overflow:"hidden", flexShrink:0 }}>
        {/* Logo */}
        <div onClick={() => setSideOpen(p => !p)} style={{ padding:"20px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, cursor:"pointer", userSelect:"none" }}>
          <div style={{ width:36, height:36, background:g.gold, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, boxShadow:"0 4px 12px rgba(201,168,76,0.35)" }}>🕌</div>
          {sideOpen && <span style={{ color:C.gold, fontWeight:800, fontSize:"0.9rem", whiteSpace:"nowrap" }}>الحلقة الذكية</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:3, overflowY:"auto" }}>
          {NAV.map(n => {
            const active = page === n.id;
            const badge = n.id === "payments" && unpaidCount > 0;
            return (
              <div key={n.id} onClick={() => setPage(n.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 10px", borderRadius:10, cursor:"pointer", background:active?"rgba(201,168,76,0.1)":"transparent", borderRight:active?`3px solid ${C.gold}`:"3px solid transparent", color:active?C.gold:"rgba(228,218,200,0.45)", transition:"all 0.18s", fontWeight:active?700:400, whiteSpace:"nowrap", fontSize:"0.84rem", position:"relative" }}>
                <span style={{ fontSize:17, flexShrink:0 }}>{n.icon}</span>
                {sideOpen && <span>{n.label}</span>}
                {badge && sideOpen && <span style={{ marginRight:"auto", background:C.amber, color:"#000", borderRadius:20, padding:"1px 7px", fontSize:"0.68rem", fontWeight:700 }}>{unpaidCount}</span>}
              </div>
            );
          })}
        </nav>

        {/* User */}
        {sideOpen && (
          <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`${C.gold}20`, border:`1px solid ${C.gold}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>👤</div>
              <div style={{ flex:1, overflow:"hidden" }}>
                <div style={{ fontSize:"0.8rem", fontWeight:700, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{teacher.name}</div>
                <div style={{ fontSize:"0.68rem", color:C.muted }}>محفظ · مسؤول</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ height:58, background:"#080F18", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 22px", gap:14, flexShrink:0 }}>
          <button onClick={() => setSideOpen(p => !p)} style={{ background:"none", border:"none", color:C.gold, fontSize:20, cursor:"pointer", padding:4 }}>☰</button>
          <span style={{ fontSize:"0.84rem", color:C.muted }}>{NAV.find(n => n.id===page)?.label}</span>
          <div style={{ marginRight:"auto", display:"flex", alignItems:"center", gap:10 }}>
            <Badge color={C.green}>● النظام يعمل</Badge>
            {unpaidCount > 0 && <Badge color={C.amber}>⚠️ {unpaidCount} لم يدفعوا</Badge>}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflow:"auto", padding:22 }}>
          {pages[page]}
        </div>
      </div>
    </div>
  );
}
