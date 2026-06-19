import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 🛡️ جدار حماية عالمي لالتقاط وعرض أي خطأ برمجى داخل الـ React فوراً على الشاشة
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 الانهيار العالمي:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          color: '#ef4444',
          padding: '25px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          background: '#090F17',
          minHeight: '100vh',
          direction: 'rtl'
        }}>
          <h2 style={{ color: '#f87171', fontSize: '20px', marginBottom: '10px' }}>⚠️ عطل فني منع تشغيل المنصة</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>تفاصيل الخطأ البرمجي المباشر:</p>
          <div style={{
            textAlign: 'left',
            background: '#111827',
            padding: '15px',
            borderRadius: '8px',
            color: '#f3f4f6',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            marginTop: '15px',
            border: '1px solid #1f2937',
            maxHeight: '60vh',
            overflowY: 'auto'
          }}>
            {this.state.error?.toString()}<br/><br/>
            {this.state.error?.stack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  // تفريغ النص القديم تماماً قبل التشغيل
  rootElement.innerHTML = ''; 
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
}
