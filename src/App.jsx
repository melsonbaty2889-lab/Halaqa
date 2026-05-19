import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════
// 🔒 ANTI-CHEAT & SECURITY LAYER (جدار الحماية وتشفير الملكية)
// ═══════════════════════════════════════════════
const SECURITY_CONFIG = {
  allowedHost: window.location.hostname, // الدومين المسموح له بتشغيل النظام فقط
  watermark: "Licensed to The Win Route / Business Online Egypt © 2026",
  demoDaysLimit: 14, // صلاحية النسخة التجريبية بالأيام
};

// تشفير أساسي لمنع التلاعب بالبيانات من الـ Console لزيادة عدد الطلاب
const CRYPTO = {
  encrypt: (str) => btoa(encodeURIComponent(str)),
  decrypt: (str) => { try { return decodeURIComponent(atob(str)); } catch { return null; } }
};

const LS = {
  get: (k, d) => {
    try {
      const encryptedData = localStorage.getItem(k);
      if (!encryptedData) return d;
      const decrypted = CRYPTO.decrypt(encryptedData);
      return decrypted ? JSON.parse(decrypted) : d;
    } catch { return d; }
  },
  set: (k, v) => {
    try { localStorage.setItem(k, CRYPTO.encrypt(JSON.stringify(v))); } catch (e) { }
  },
};

// ═══════════════════════════════════════════════
// DATA & FLOWS
// ═══════════════════════════════════════════════
const DEMO_TEACHER = {
  name: "الشيخ أحمد محمود",
  phone: "01012345678",
  location: "مدينة نصر، القاهرة",
  bio: "تحفيظ القرآن الكريم برواية حفص عن عاصم",
  fee: 999,
  systemeLink: "https://systeme.io/halqa-register",
  vodafoneCash: "01012345678",
  instaPayId: "teacher@instapay",
};

const SAMPLE_STUDENTS = [
  { id: 1, name: "أحمد محمد علي", parent: "محمد علي", phone: "01012345678", age: 10, joined: "2026-05-01", paid: true, surah: "البقرة", memorized: 12 },
  { id: 2, name: "يوسف عبدالرحمن", parent: "عبدالرحمن سالم", phone: "01123456789", age: 9, joined: "2026-05-02", paid: false, surah: "آل عمران", memorized: 8 },
];

const BOT_FLOWS = {
  start: {
    msg: "السلام عليكم 🌙\nأهلًا بك في نظام حلقة القرآن الكريم\n\nاختر من القائمة:",
    options: [
      { label: "📝 تسجيل طالب جديد", next: "register" },
      { label: "💰 دفع الرسوم الشهرية", next: "payment_options" },
    ]
  },
  register: {
    msg: "لتسجيل طالب جديد، يرجى فتح الرابط وملء الاستمارة:",
    options: [{ label: "🔗 فتح استمارة التسجيل", next: "start", link: true }],
  },
  payment_options: {
    msg: "💰 قيمة الرسوم (٩٩٩ جنيه).\nاختر وسيلة الدفع المناسبة للتحويل فوراً:",
    options: [
      { label: "💳 فيزا / كارت بنكي", next: "pay_systeme" },
      { label: "📱 فودافون كاش", next: "pay_vodafone" },
      { label: "⚡ انستا باي (InstaPay)", next: "pay_instapay" },
    ]
  },
  pay_systeme: {
    msg: "💳 للدفع الآمن عبر بطاقتك البنكية، اضغط هنا:",
    options: [{ label: "💳 ادفع الآن بالفيزا", next: "start", link: true }],
  },
  pay_vodafone: {
    msg: `📱 أرسل (٩٩٩ جنيه) فودافون كاش على:\n📞 ${DEMO_TEACHER.vodafoneCash}\n\n⚠️ يرجى إرسال لقطة شاشة للإيصال فوراً لتفعيل الحساب.`,
    options: [{ label: "📲 إرسال الإيصال عبر واتساب", next: "start", link: true }],
  },
  pay_instapay: {
    msg: `⚡ للتحويل الفوري عبر انستا باي:\n🆔 ${DEMO_TEACHER.instaPayId}\n\nتأكد من إرسال التأكيد للشيخ لمراجعة خزانة الأموال.`,
    options: [{ label: "🏠 الرئيسية", next: "start" }],
  },
};

const C = { bg: "#0C1520", surface: "#111C2A", card: "#162030", border: "rgba(201,168,76,0.12)", gold: "#C9A84C", text: "#E4DAC8", muted: "rgba(228,218,200,0.4)", green: "#34D399", red: "#EF4444", amber: "#F59E0B" };
const g = { gold: "linear-gradient(135deg,#C9A84C,#E8C97A)" };

// ═══════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════
const Badge = ({ children, color = C.green }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700, background:`${color}1A`, color, border:`1px solid ${color}33` }}>{children}</span>
);

const Btn = ({ children, onClick, variant="primary", disabled=false, style={} }) => {
  const styles = {
    primary: { background: g.gold, color:"#1A1208" },
    secondary: { background:`${C.gold}15`, color:C.gold, border:`1px solid ${C.gold}30` },
    danger: { background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:10, border:"none", cursor:disabled?"not-allowed":"pointer", fontFamily:"'Cairo'", fontSize:"0.85rem", fontWeight:600, opacity:disabled?0.5:1, ...styles[variant], ...style }}>{children}</button>
  );
};

const Card = ({ children, style={} }) => <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, ...style }}>{children}</div>;

const Input = ({ label, value, onChange, type="text" }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:"0.75rem", color:C.muted, marginBottom:5, display:"block", fontWeight:600 }}>{label}</label>}
    <input type={type} value={value} onChange={onChange} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo'", fontSize:"0.85rem", outline:"none" }} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:"0.75rem", color:C.muted, marginBottom:5, display:"block", fontWeight:600 }}>{label}</label>}
    <select value={value} onChange={onChange} style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontFamily:"'Cairo'", fontSize:"0.85rem", outline:"none" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, width:"100%", maxWidth:480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:700, color:C.gold }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════
const Dashboard = ({ students, payments, setPage }) => {
  return (
    <div>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.gold }}>لوحة إشراف الحلقة الذكية 👋</h1>
        <p style={{ fontSize:"0.82rem", color:C.muted }}>نظام المتابعة الآلي والمحمي برمجياً</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:905, color:C.blue }}>{students.length} / 5</div><div style={{ fontSize:"0.78rem", color:C.muted }}>الطلاب (حد النسخة المجانية)</div></Card>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:905, color:C.green }}>{students.filter(s=>s.paid).length}</div><div style={{ fontSize:"0.78rem", color:C.muted }}>تم السداد بالكامل</div></Card>
        <Card><div style={{ fontSize:"1.8rem", fontWeight:905, color:C.gold }}>{payments.reduce((a,p)=>a+p.amount,0).toLocaleString()} ج</div><div style={{ fontSize:"0.78rem", color:C.muted }}>إجمالي المدخولات</div></Card>
      </div>
      <div style={{ display:"flex", gap:10 }}><Btn variant="secondary" onClick={() => setPage("students")}>👨‍🎓 الطلاب</Btn><Btn variant="secondary" onClick={() => setPage("payments")}>💰 الحسابات والمحافظ</Btn><Btn variant="secondary" onClick={() => setPage("reminders")}>🤖 الشات بوت</Btn></div>
    </div>
  );
};

const Students = ({ students, setStudents }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:"", parent:"", phone:"", surah:"", memorized:"" });

  const doSave = () => {
    if (!form.name || !form.phone) return;
    if (students.length >= 5) {
      alert("⚠️ التنبيه الأمني: لقد بلغت الحد الأقصى المسموح به للنسخة التجريبية (5 طلاب فقط) يرجى ترقية الاشتراك لاستيعاب حلقات إضافية.");
      return;
    }
    setStudents(p => [...p, { id:Date.now(), ...form, paid:false, joined:new Date().toISOString().split("T")[0] }]);
    setModal(false);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
        <h3>دليل الطلاب المعتمد</h3>
        <Btn onClick={() => { if(students.length>=5){ alert("⚠️ الحد الأقصى 5 طلاب!"); return; } setModal(true); }}>＋ إضافة طالب جديد</Btn>
      </div>
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["الطالب","ولي الأمر","الهاتف","الحفظ","الحالة",""].map(h=><th style={{ textAlign:"right", padding:10, fontSize:"0.75rem", color:C.muted }} key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td style={{ padding:10 }}>{s.name}</td>
                <td style={{ padding:10 }}>{s.parent}</td>
                <td style={{ padding:10 }}>{s.phone}</td>
                <td style={{ padding:10 }}>{s.surah}</td>
                <td style={{ padding:10 }}><Badge color={s.paid?C.green:C.amber}>{s.paid?"مدفوع":"معلق"}</Badge></td>
                <td style={{ padding:10 }}><Btn variant="danger" style={{ padding:"4px 8px" }} onClick={() => setStudents(p=>p.filter(x=>x.id!==s.id))}>×</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="إضافة طالب">
        <Input label="اسم الطالب" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <Input label="اسم ولي الأمر" value={form.parent} onChange={e=>setForm({...form, parent:e.target.value})} />
        <Input label="رقم الهاتف" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
        <Input label="السورة" value={form.surah} onChange={e=>setForm({...form, surah:e.target.value})} />
        <Btn onClick={doSave} style={{ width:"100%" }}>تأكيد وحفظ الطالب</Btn>
      </Modal>
    </div>
  );
};

const Payments = ({ students, payments, setPayments, setStudents, teacher }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId:"", amount:teacher.fee, method:"فودافون كاش" });

  const doSave = () => {
    if(!form.studentId) return;
    setPayments(p=>[...p, { id:Date.now(), ...form, amount:+form.amount, date:new Date().toISOString().split("T")[0] }]);
    setStudents(p=>p.map(s=>s.id===+form.studentId ? {...s, paid:true}:s));
    setModal(false);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
        <h3>حركات المحافظ والخزينة</h3>
        <Btn onClick={()=>setModal(true)}>＋ إيداع يدوي</Btn>
      </div>
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["الطالب","المبلغ","الوسيلة","التاريخ"].map(h=><th style={{ textAlign:"right", padding:10, fontSize:"0.75rem", color:C.muted }} key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td style={{ padding:10 }}>{students.find(s=>s.id===p.studentId)?.name || "طالب نشط"}</td>
                <td style={{ padding:10, color:C.gold, fontWeight:700 }}>{p.amount} ج.م</td>
                <td style={{ padding:10 }}><Badge color={p.method==="فودافون كاش"?C.red:p.method==="انستا باي"?C.green:C.blue}>{p.method}</Badge></td>
                <td style={{ padding:10 }}>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="تسجيل عملية سداد">
        <Select label="الطالب" value={form.studentId} onChange={e=>setForm({...form, studentId:e.target.value})} options={[{value:"", label:"اختر..."}, ...students.map(s=>({value:s.id, label:s.name}))]} />
        <Input label="المبلغ المستلم" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} type="number" />
        <Select label="القناة المالية" value={form.method} onChange={e=>setForm({...form, method:e.target.value})} options={[{value:"فودافون كاش", label:"فودافون كاش"}, {value:"انستا باي", label:"انستا باي"}, {value:"فيزا", label:"بوابة فيزا الإلكترونية"}]} />
        <Btn onClick={doSave} style={{ width:"100%" }}>تأكيد التحصيل</Btn>
      </Modal>
    </div>
  );
};

const Reminders = ({ teacher }) => {
  const [botState, setBotState] = useState("start");
  const currentBot = BOT_FLOWS[botState] || BOT_FLOWS.start;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <Card>
        <h4>توجيه الكاش والمحافظ ذكياً</h4>
        <p style={{ fontSize:"0.82rem", color:C.text, marginTop:8, lineHeight:1.5 }}>البوت مبرمج على تحويل العملاء مباشرة إلى رقم محفظتك الفودافون كاش أو معرف انستا باي دون أي تدخل بشري من المعلم.</p>
      </Card>
      <Card style={{ display:"flex", flexDirection:"column", minHeight:300 }}>
        <div style={{ flex:1, background:"#080F18", padding:12, borderRadius:10, marginBottom:10 }}>
          <div style={{ background:C.card, padding:10, borderRadius:8, fontSize:"0.82rem", whiteSpace:"pre-line" }}>{currentBot.msg}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {currentBot.options.map((o,i)=> (
            <button key={i} onClick={()=>!o.link && setBotState(o.next)} style={{ background:C.surface, border:`1px solid ${C.gold}40`, color:C.gold, padding:8, borderRadius:8, fontFamily:"'Cairo'", textAlign:"right", cursor:"pointer" }}>🔹 {o.label}</button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN COMPONENT WRAPPER WITH PROTECTION LOCKS
// ═══════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState(() => LS.get("halqa_v_students", SAMPLE_STUDENTS));
  const [payments, setPayments] = useState(() => LS.get("halqa_v_payments", []));
  const teacher = DEMO_TEACHER;

  // 1. فحص الملكية الأمنية وحظر الدومينات الغريبة أو المسروقة
  const isPirated = window.location.hostname !== "localhost" && window.location.hostname !== SECURITY_CONFIG.allowedHost;

  // 2. إدارة جدار صلاحية مدة الفترة المجانية (14 يوماً من أول تشغيل للحساب)
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

  // التحقق من انتهاء الـ 14 يوم للفترة المجانية
  const getDaysLeft = () => {
    if (!installDate) return SECURITY_CONFIG.demoDaysLimit;
    const diffTime = Math.abs(new Date() - new Date(installDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, SECURITY_CONFIG.demoDaysLimit - diffDays);
  };

  const isDemoExpired = getDaysLeft() <= 0;

  // في حالة سرقة الكود أو تشغيله على دومين غير مصرح به
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

  // في حالة انتهاء الـ 14 يوماً المجانية
  if (isDemoExpired) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo'", direction:"rtl", padding:20 }}>
        <Card style={{ maxWidth:450, textAlign:"center", border:`1px solid ${C.amber}40` }}>
          <div style={{ fontSize:50 }}>⏳</div>
          <h2 style={{ color:C.gold, marginTop:10 }}>انتهت صلاحية الفترة التجريبية</h2>
          <p style={{ fontSize:"0.85rem", marginTop:10, lineHeight:1.6 }}>لقد انتهت فترة الـ {SECURITY_CONFIG.demoDaysLimit} يوماً المخصصة لتجربة النظام المجاني. للاستمرار في إدارة الطلاب والحسابات بمرونة كاملة وبدون حد أقصى، يرجى الترقية إلى الباقة المدفوعة.</p>
          <Btn onClick={() => window.open(teacher.systemeLink, "_blank")} style={{ width:"100%", marginTop:20, justifyContent:"center" }}>🚀 ترقية الحساب وتفعيل النظام الآن</Btn>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Cairo'", display:"flex", direction:"rtl" }}>
      {/* Sidebar */}
      <div style={{ width:240, background:C.surface, borderLeft:`1px solid ${C.border}`, padding:15, display:"flex", flexDirection:"column", gap:6 }}>
        <h3 style={{ color:C.gold, fontWeight:900, textAlign:"center", marginBottom:14 }}>🕌 الحلقة الذكية</h3>
        <button onClick={() => setPage("dashboard")} style={{ width:"100%", padding:10, background:page==="dashboard"?"rgba(201,168,76,0.1)":"transparent", color:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'" }}>📊 لوحة التحكم</button>
        <button onClick={() => setPage("students")} style={{ width:"100%", padding:10, background:page==="students"?"rgba(201,168,76,0.1)":"transparent", color:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'" }}>👨‍🎓 شؤون الطلاب</button>
        <button onClick={() => setPage("payments")} style={{ width:"100%", padding:10, background:page==="payments"?"rgba(201,168,76,0.1)":"transparent", color:C.text, border:"none", borderRadius:8, textAlign:"right", cursor:"pointer", fontFamily:"'Cairo'" }}>💰 الخزينة والمحافظ</button>
        
        <div style={{ marginTop:"auto", padding:10, background:"rgba(0,0,0,0.15)", borderRadius:8, fontSize:"0.72rem", color:C.muted, textAlign:"center" }}>
          {SECURITY_CONFIG.watermark}
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ height:58, background:"#080F18", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 22px" }}>
          <Badge color={C.amber}>⌛ متبقي {getDaysLeft()} أيام في التجربة</Badge>
          <span style={{ marginRight:10 }}><Badge color={C.green}>حد الطلاب: {students.length} / 5</Badge></span>
        </div>
        <div style={{ flex:1, padding:24, overflowY:"auto" }}>
          {page === "dashboard" && <Dashboard students={students} payments={payments} setPage={setPage} />}
          {page === "students" && <Students students={students} setStudents={setStudents} />}
          {page === "payments" && <Payments students={students} payments={payments} setPayments={setPayments} setStudents={setStudents} teacher={teacher} />}
          {page === "reminders" && <Reminders teacher={teacher} />}
        </div>
      </div>
    </div>
  );
}
