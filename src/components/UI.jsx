import { C, g } from "../constants/colors";

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
