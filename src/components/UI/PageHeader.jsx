import React, { forwardRef } from 'react';

const getPrimary = () => 'var(--color-action-primary)';
const getTextSub = () => 'var(--color-text-secondary)';

export const PageHeader = forwardRef(({ title, sub, action, className = "", style = {} }, ref) => (
  <div 
    ref={ref}
    className={`ui-pageheader ${className}`}
    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24, ...style }}
  >
    <div style={{ textAlign: "start" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: getPrimary(), margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "0.85rem", color: getTextSub(), marginTop: 4, margin: 0 }}>{sub}</p>}
    </div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>{action}</div>
  </div>
));

PageHeader.displayName = 'PageHeader';
export default PageHeader;
