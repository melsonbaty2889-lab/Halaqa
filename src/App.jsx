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
        <Input label="الشهر" value={form.month} onChange={e => setForm(p => ({ ...p, month:form.month }))} />
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

  const toggle = id => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const all = () => setSelected(new Set(students.map(s => s.id)));
  const none = () => setSelected(new Set());

  const doSave = () => {
    setAttendance(p => [{ id:Date.now(), date, present:[...selected], absent:students.filter(s => !selected.has(s.id)).map(s=>s.id) }, ...p]);
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  };

  return (
    <div>
      <PageHeader title="دفتر الحضور والغياب" sub="قم بتحديد الطلاب الحاضرين لجلسة اليوم" action={<Btn onClick={doSave}>✓ حفظ الحضور</Btn>} />

      <Card style={{ marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant="ghost" style={{ padding:"6px 12px", fontSize:"0.78rem" }} onClick={all}>تحديد الكل</Btn>
          <Btn variant="ghost" style={{ padding:"6px 12px", fontSize:"0.78rem" }} onClick={none}>إلغاء تحديد الكل</Btn>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", color:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.82rem", outline:"none" }} />
      </Card>

      {flash && (
        <div style={{ background:`${C.green}15`, border:`1px solid ${C.green}30`, borderRadius:10, padding:"12px 16px", color:C.green, fontSize:"0.85rem", marginBottom:14 }}>
          ✅ تم حفظ سجل حضور تاريخ {date} بنجاح!
        </div>
      )}

      <Card>
        {students.map(s => {
          const isPresent = selected.has(s.id);
          return (
            <div key={s.id} onClick={() => toggle(s.id)} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:`1px solid rgba(255,255,255,0.03)`, cursor:"pointer", transition:"background 0.2s" }}>
              <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${isPresent?C.green:C.muted}`, background:isPresent?C.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#111" }}>
                {isPresent && "✓"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.88rem", fontWeight:600, color:isPresent?C.text:C.muted }}>{s.name}</div>
                <div style={{ fontSize:"0.72rem", color:C.muted }}>{s.parent}</div>
              </div>
              <Badge color={isPresent?C.green:C.red}>{isPresent?"حاضر":"غائب"}</Badge>
            </div>
          );
        })}
      </Card>

      <Card style={{ marginTop:14 }}>
        <h4 style={{ fontSize:"0.85rem", fontWeight:700, marginBottom:10, color:C.gold }}>السجلات السابقة</h4>
        {attendance.map(a => (
          <div key={a.id} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.8rem", padding:"6px 0", color:C.text, borderBottom:"1px solid rgba(255,255,255,0.02)" }}>
            <span>📅 جلسة {a.date}</span>
            <span style={{ color:C.green }}>حضور: {a.present.length}</span>
            <span style={{ color:C.red }}>غياب: {a.absent.length}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// REMINDERS & CHATBOT
// ═══════════════════════════════════════════════
const Reminders = ({ students, teacher }) => {
  const [botState, setBotState] = useState("start");
  const currentBot = BOT_FLOWS[botState] || BOT_FLOWS.start;

  const sendAllUnpaid = () => {
    const unpaid = students.filter(s => !s.paid);
    if (unpaid.length === 0) return alert("كل الطلاب قاموا بالسداد! 🎉");
    if (confirm(`هل تود فتح رابط تذكير لـ ${unpaid.length} طلاب عبر الواتساب؟`)) {
      unpaid.forEach((s, idx) => {
        setTimeout(() => {
          const msg = encodeURIComponent(`السلام عليكم ورحمة الله وبركاته، نذكركم بلطف بسداد رسوم حلقة التحفيظ لشهر مايو بقيمة ${teacher.fee} ج.م. جزاكم الله خيراً 🌙`);
          window.open(`https://wa.me/2${s.phone}?text=${msg}`, "_blank");
        }, idx * 600);
      });
    }
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>
      {/* Notifications Management */}
      <Card>
        <PageHeader title="نظام التذكيرات الآلي" sub="أرسل رسائل المتابعة والتذكير بنقرة واحدة" />
        <p style={{ fontSize:"0.82rem", color:C.text, marginBottom:16, lineHeight:1.5 }}>
          يمكنك إرسال رسائل دورية لأولياء الأمور لتنبيههم بحالة السداد أو لمتابعة مستوى الحفظ والغياب.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Btn onClick={sendAllUnpaid} variant="primary" style={{ justifyContent:"center" }}>
            🔔 إرسال تذكير جماعي للمتأخرين عن السداد
          </Btn>
          <div style={{ height:"1px", background:C.border, margin:"8px 0" }} />
          <h4 style={{ fontSize:"0.8rem", color:C.gold, fontWeight:700 }}>تذكيرات فردية سريعة:</h4>
          {students.map(s => (
            <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.02)", padding:"8px 12px", borderRadius:8 }}>
              <span style={{ fontSize:"0.8rem" }}>{s.name}</span>
              <div style={{ display:"flex", gap:6 }}>
                <Btn variant="secondary" style={{ padding:"4px 8px", fontSize:"0.72rem" }} onClick={() => window.open(`https://wa.me/2${s.phone}?text=${encodeURIComponent(`السلام عليكم، نود إعلامكم أن ابننا ${s.name} قد وصل اليوم إلى سورة ${s.surah} بحفظ ممتاز تبارك الله 🌟`)}`, "_blank")}>⭐ تقرير تميز</Btn>
                <Btn variant="danger" style={{ padding:"4px 8px", fontSize:"0.72rem" }} onClick={() => window.open(`https://wa.me/2${s.phone}?text=${encodeURIComponent(`السلام عليكم، نود الاطمئنان على سبب غياب الطالب ${s.name} عن جلسة تحفيظ القرآن الكريم اليوم.`)}`, "_blank")}>⚠️ غياب</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chatbot Preview */}
      <Card style={{ display:"flex", flexDirection:"column", minHeight:400 }}>
        <div style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:12, marginBottom:14 }}>
          <Badge color={C.purple}>🤖 محاكاة شات بوت iBots</Badge>
          <h3 style={{ fontSize:"0.95rem", fontWeight:700, color:C.text, marginTop:5 }}>شاشة العميل (واتساب)</h3>
        </div>

        {/* Chat Box Bubble */}
        <div style={{ flex:1, background:"#080F18", borderRadius:12, padding:14, marginBottom:14, display:"flex", flexDirection:"column", justifyContent:"flex-start" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:"10px 14px", borderRadius:"12px 12px 0 12px", maxWidth:"85%", alignSelf:"flex-start", marginBottom:12, whiteSpace:"pre-line", fontSize:"0.82rem", color:C.text, lineHeight:1.5 }}>
            {currentBot.msg}
          </div>

          {/* Render Link option inside message block if any */}
          {currentBot.options.map((o, i) => o.link && (
            <a key={i} href={o.next === "registered" ? teacher.systemeLink : "#"} target="_blank" rel="noreferrer" style={{ display:"inline-block", background:g.gold, color:"#111", padding:"8px 12px", borderRadius:8, fontSize:"0.78rem", fontWeight:700, textDecoration:"none", alignSelf:"flex-start", marginBottom:10 }}>
              {o.label}
            </a>
          ))}
        </div>

        {/* User choices buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {currentBot.options.map((o, i) => !o.link && (
            <button key={i} onClick={() => setBotState(o.next)} style={{ width:"100%", background:C.surface, border:`1px solid ${C.gold}40`, color:C.gold, padding:"8px", borderRadius:8, fontFamily:"'Cairo',sans-serif", fontSize:"0.8rem", cursor:"pointer", textAlign:"right", paddingRight:14, transition:"background 0.2s" }}>
              🔹 {o.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════
const Reports = ({ students, payments }) => {
  const totalStudents = students.length;
  const paidStudents = students.filter(s => s.paid).length;
  const unpaidStudents = totalStudents - paidStudents;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <PageHeader title="التقارير والإحصائيات" sub="نظرة عامة على أداء الحلقة المالي والتعليمي" />
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <h3 style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:12, color:C.gold }}>📈 التحليل المالي</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:"0.84rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>إجمالي الاشتراكات المستلمة:</span>
              <span style={{ color:C.green, fontWeight:700 }}>{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>نسبة السداد الشهرية:</span>
              <span style={{ color:C.blue, fontWeight:700 }}>{Math.round((paidStudents/totalStudents)*100)}%</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>المبالغ المتبقية في ذمة أولياء الأمور:</span>
              <span style={{ color:C.amber, fontWeight:700 }}>{(unpaidStudents * 999).toLocaleString()} ج.م</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:12, color:C.gold }}>🎓 التحليل التعليمي</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:"0.84rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>متوسط عدد الصفحات المحفوظة للطلاب:</span>
              <span style={{ color:C.gold, fontWeight:700 }}>{Math.round(students.reduce((a,b)=>a+b.memorized, 0)/totalStudents)} صفحة</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>نسبة الحضور العام للحلقة:</span>
              <span style={{ color:C.green, fontWeight:700 }}>{Math.round(students.reduce((a,b)=>a+b.attendance, 0)/totalStudents)}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN APPLICATION WRAPPER
// ═══════════════════════════════════════════════
export default function App() {
  const [isLogged, setIsLogged] = useState(() => LS.get("halqa_logged", false));
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  // States with LocalStorage synchronization
  const [teacher, setTeacher] = useState(() => LS.get("halqa_teacher", DEMO_TEACHER));
  const [students, setStudents] = useState(() => LS.get("halqa_students", SAMPLE_STUDENTS));
  const [payments, setPayments] = useState(() => LS.get("halqa_payments", SAMPLE_PAYMENTS));
  const [attendance, setAttendance] = useState(() => LS.get("halqa_attendance", SAMPLE_ATTENDANCE));

  useEffect(() => { LS.set("halqa_logged", isLogged); }, [isLogged]);
  useEffect(() => { LS.set("halqa_teacher", teacher); }, [teacher]);
  useEffect(() => { LS.set("halqa_students", students); }, [students]);
  useEffect(() => { LS.set("halqa_payments", payments); }, [payments]);
  useEffect(() => { LS.set("halqa_attendance", attendance); }, [attendance]);

  if (!isLogged) {
    return <LoginPage onLogin={() => setIsLogged(true)} />;
  }

  const unpaidCount = students.filter(s => !s.paid).length;

  const NAV = [
    { id: "dashboard", label: "لوحة التحكم", icon: "📊" },
    { id: "students", label: "إدارة الطلاب", icon: "👨‍🎓" },
    { id: "attendance", label: "الحضور والغياب", icon: "📋" },
    { id: "payments", label: "الحسابات والمدفوعات", icon: "💰" },
    { id: "reminders", label: "نظام التذكيرات والشات بوت", icon: "🔔" },
    { id: "reports", label: "التقارير", icon: "📈" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Cairo',sans-serif", display:"flex", direction:"rtl" }}>
      {/* Sidebar */}
      <div style={{ width:sideOpen?240:0, background:C.surface, borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.2s ease", flexShrink:0 }}>
        <div style={{ height:58, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 18px", gap:10, flexShrink:0 }}>
          <span style={{ fontSize:22 }}>🕌</span>
          <span style={{ fontWeight:800, fontSize:"0.95rem", color:C.gold, whiteSpace:"nowrap" }}>الحلقة الذكية v1.0</span>
        </div>

        {/* Navigation Items */}
        <div style={{ flex:1, padding:"14px 10px", display:"flex", flexDirection:"column", gap:4 }}>
          {NAV.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => setPage(n.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, border:"none", background:active?`rgba(201,168,76,0.08)`:"transparent", color:active?C.gold:C.text, fontFamily:"'Cairo',sans-serif", fontSize:"0.84rem", fontWeight:active?700:500, cursor:"pointer", transition:"all 0.15s", textAlign:"right" }}>
                <span style={{ fontSize:15, opacity:active?1:0.6 }}>{n.icon}</span>
                <span style={{ whiteSpace:"nowrap" }}>{n.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logged Teacher Info Profile */}
        {sideOpen && (
          <div style={{ padding:14, borderTop:`1px solid ${C.border}`, background:"rgba(0,0,0,0.12)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`rgba(201,168,76,0.15)`, border:`1px solid ${C.gold}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>👤</div>
              <div style={{ flex:1, overflow:"hidden" }}>
                <div style={{ fontSize:"0.8rem", fontWeight:700, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{teacher.name}</div>
                <div style={{ fontSize:"0.68rem", color:C.muted }}>محفظ · مسؤول</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main View Container */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ height:58, background:"#080F18", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 22px", gap:14, flexShrink:0 }}>
          <button onClick={() => setSideOpen(p => !p)} style={{ background:"none", border:"none", color:C.gold, fontSize:20, cursor:"pointer", padding:4 }}>☰</button>
          <span style={{ fontSize:"0.84rem", color:C.muted }}>{NAV.find(n => n.id===page)?.label}</span>
          <div style={{ marginRight:"auto", display:"flex", alignItems:"center", gap:10 }}>
            <Badge color={C.green}>● النظام يعمل</Badge>
            {unpaidCount > 0 && <Badge color={C.amber}>⚠️ {unpaidCount} لم يدفعوا</Badge>}
            <button onClick={() => { if(confirm("تسجيل الخروج؟")) setIsLogged(false); }} style={{ background:"transparent", border:`1px solid ${C.red}33`, color:C.red, fontSize:"0.75rem", padding:"4px 10px", borderRadius:6, cursor:"pointer", fontFamily:"'Cairo',sans-serif" }}>خروج</button>
          </div>
        </div>

        {/* Workspace Pages Body Router */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
          {page === "dashboard" && <Dashboard students={students} payments={payments} attendance={attendance} teacher={teacher} setPage={setPage} />}
          {page === "students" && <Students students={students} setStudents={setStudents} />}
          {page === "payments" && <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacher} />}
          {page === "attendance" && <Attendance students={students} attendance={attendance} setAttendance={setAttendance} />}
          {page === "reminders" && <Reminders students={students} teacher={teacher} />}
          {page === "reports" && <Reports students={students} payments={payments} />}
        </div>
      </div>
    </div>
  );
}
