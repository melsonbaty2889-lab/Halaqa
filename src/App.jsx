import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════
// 🔒 SECURITY & STORAGE
// ═══════════════════════════════════════════════
const SECURITY_CONFIG = { allowedHost: "smart-halaqa.vercel.app", watermark: "Licensed to The Win Route © 2026", demoDaysLimit: 14 };
const CRYPTO = { encrypt: (str) => btoa(encodeURIComponent(str)), decrypt: (str) => { try { return decodeURIComponent(atob(str)); } catch { return null; } } };
const LS = {
  get: (k, d) => { try { const enc = localStorage.getItem(k); if (!enc) return d; const dec = CRYPTO.decrypt(enc); return dec ? JSON.parse(dec) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, CRYPTO.encrypt(JSON.stringify(v))); } catch{} }
};

const C = { bg: "#0C1520", surface: "#111C2A", card: "#162030", border: "rgba(201,168,76,0.12)", gold: "#C9A84C", text: "#E4DAC8", muted: "rgba(228,218,200,0.4)", green: "#34D399", red: "#EF4444", blue: "#60A5FA", purple: "#A78BFA" };
const g = { gold: "linear-gradient(135deg, #C9A84C, #E8C97A)" };

// ═══════════════════════════════════════════════
// COMPONENTS (BTN, BADGE, PAGEHEADER)
// ═══════════════════════════════════════════════
const Btn = ({ children, onClick, variant="primary", style={} }) => {
  const styles = {
    primary: { background: g.gold, color:"#1A1208" },
    secondary: { background:`${C.gold}15`, color:C.gold, border:`1px solid ${C.gold}30` },
    danger: { background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30` }
  };
  return <button onClick={onClick} style={{ padding:"8px 14px", borderRadius:10, border:"none", cursor:"pointer", fontSize:"0.8rem", fontWeight:600, ...styles[variant], ...style }}>{children}</button>;
};

const PageHeader = ({ title, sub, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
    <div><h2 style={{ color:C.gold }}>{title}</h2>{sub && <p style={{ color:C.muted, fontSize:"0.75rem" }}>{sub}</p>}</div>
    <div style={{ display:"flex", gap:8 }}>{action}</div>
  </div>
);

// ═══════════════════════════════════════════════
// STUDENTS COMPONENT (مع دالة التصدير)
// ═══════════════════════════════════════════════
const Students = ({ students, setStudents }) => {
  const exportStudents = (type) => {
    const data = type === "paid" ? students.filter(s => s.paid) : students;
    const csv = ["اسم الطالب,ولي الأمر,الهاتف,الحالة", ...data.map(s => `"${s.name}","${s.parent}","${s.phone}","${s.paid ? "مسدد" : "معلق"}"`)].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Students_${type}_${new Date().toLocaleDateString('ar-EG')}.csv`;
    link.click();
  };

  return (
    <div>
      <PageHeader title="دليل الطلاب" action={
        <>
          <Btn variant="secondary" onClick={() => exportStudents("all")}>📥 الكل</Btn>
          <Btn variant="secondary" onClick={() => exportStudents("paid")}>💰 المسددون</Btn>
        </>
      } />
      {/* ... بقية الجدول ... */}
    </div>
  );
};

// ═══════════════════════════════════════════════
// ATTENDANCE COMPONENT (مع دالة التقرير)
// ═══════════════════════════════════════════════
const Attendance = ({ students, attendance }) => {
  const exportMonthlyReport = () => {
    const allDates = [...new Set(attendance.map(a => a.date))].sort();
    const rows = students.map(s => [s.name, ...allDates.map(d => {
      const rec = attendance.find(a => a.date === d);
      return rec ? (rec.present.includes(s.id) ? "حاضر" : "غائب") : "—";
    })].join(",")).join("\n");
    const csv = [["اسم الطالب", ...allDates].join(","), rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Monthly_Attendance_Report.csv";
    link.click();
  };

  return (
    <div>
      <PageHeader title="سجل الحضور" action={<Btn variant="secondary" onClick={exportMonthlyReport}>📊 تصدير التقرير الشهري</Btn>} />
      {/* ... بقية الجدول ... */}
    </div>
  );
};

// ═══════════════════════════════════════════════
// APP (المكون الرئيسي)
// ═══════════════════════════════════════════════
export default function App() {
  const [students, setStudents] = useState(() => LS.get("halqa_v_students", []));
  const [attendance, setAttendance] = useState(() => LS.get("halqa_v_attendance", []));
  // ... باقي المنطق الأصلي (Dashboard, Payments, etc)
  return <div style={{ background:C.bg, color:C.text, minHeight:"100vh", direction:"rtl", fontFamily:"'Cairo'" }}>
     {/* ضع هنا استدعاء المكونات Students و Attendance و غيرها */}
  </div>;
}
