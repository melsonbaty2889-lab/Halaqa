import React, { forwardRef } from 'react';

const getCardBg = () => 'var(--color-surface-card)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';

const Card = forwardRef(({ children, style = {}, className = "", hoverable = false, ...props }, ref) => (
  <div 
    ref={ref}
    className={`ui-card ${className}`}
    style={{ 
      background: getCardBg(), 
      border: `1px solid ${getBorder()}`, 
      borderRadius: 16, 
      padding: 20, 
      width: "100%", 
      boxSizing: "border-box", 
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      color: getTextTitle(),
      textAlign: "start",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      transition: hoverable ? "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease" : "none",
      cursor: hoverable ? "pointer" : "default",
      ...style 
    }}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

const CardHeader = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div ref={ref} className={`ui-card-header ${className}`} style={{ borderBottom: `1px solid ${getBorder()}`, paddingBottom: 12, marginBottom: 16, textAlign: "start", ...style }} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'Card.Header';

const CardBody = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div ref={ref} className={`ui-card-body ${className}`} style={{ textAlign: "start", ...style }} {...props}>
    {children}
  </div>
));
CardBody.displayName = 'Card.Body';

const CardFooter = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div ref={ref} className={`ui-card-footer ${className}`} style={{ borderTop: `1px solid ${getBorder()}`, paddingTop: 12, marginTop: 16, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, ...style }} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'Card.Footer';

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { CardHeader, CardBody, CardFooter };
export default Card;
