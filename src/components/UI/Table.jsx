import React, { forwardRef } from 'react';

const getPrimary = () => 'var(--color-action-primary)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';

export const Table = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div style={{ width: "100%", overflowX: "auto" }}>
    <table ref={ref} className={`ui-table ${className}`} style={{ width: "100%", borderCollapse: "collapse", ...style }} {...props}>
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

export const THead = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <thead ref={ref} className={className} style={style} {...props}>{children}</thead>
));
THead.displayName = 'THead';

export const TBody = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <tbody ref={ref} className={className} style={style} {...props}>{children}</tbody>
));
TBody.displayName = 'TBody';

export const TR = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <tr ref={ref} className={className} style={style} {...props}>{children}</tr>
));
TR.displayName = 'TR';

export const TH = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <th 
    ref={ref}
    className={`ui-th ${className}`}
    style={{ 
      padding: "14px 12px", 
      textAlign: "start", 
      fontSize: "0.75rem", 
      color: getPrimary(), 
      fontWeight: 700, 
      borderBottom: `2px solid ${getBorder()}`, 
      whiteSpace: "nowrap", 
      ...style 
    }}
    {...props}
  >
    {children}
  </th>
));
TH.displayName = 'TH';

export const TD = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <td 
    ref={ref}
    className={`ui-td ${className}`}
    style={{ 
      padding: "14px 12px", 
      fontSize: "0.875rem", 
      borderBottom: `1px solid ${getBorder()}`, 
      color: getTextTitle(), 
      whiteSpace: "nowrap", 
      textAlign: "start", 
      ...style 
    }}
    {...props}
  >
    {children}
  </td>
));
TD.displayName = 'TD';

export default Table;
