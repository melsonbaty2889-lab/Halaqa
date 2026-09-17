import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { C } from '@/theme/colors';

export default class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Global App Crash:", error, errorInfo);
  }

  handleReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      });
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.toString() || 'حدث خطأ غير متوقع في النظام';
      return (
        <div style={{
          minHeight: '100vh',
          background: C.dark.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Cairo', system-ui, sans-serif",
          color: C.text.main
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: C.dark.card,
            border: `1px solid ${C.border.card}`,
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-main)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Glow Accent */}
            <div style={{
              position: 'absolute',
              insetBlockStart: '-60px',
              insetInlineStart: '50%',
              transform: 'translateX(-50%)',
              width: '180px',
              height: '180px',
              background: C.error,
              filter: 'blur(90px)',
              opacity: 0.25,
              pointerEvents: 'none'
            }} />

            {/* Icon Wrapper */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${C.error}`,
              color: C.error,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <AlertTriangle size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBlockEnd: '8px', color: C.text.main }}>
              عذراً، حدث خطأ تقني غير متوقع
            </h2>
            <p style={{ fontSize: '0.875rem', color: C.text.sub, marginBlockEnd: '24px', lineHeight: '1.6' }}>
              واجه النظام مشكلة أثناء تحميل هذه الصفحة. حاول تفريغ الذاكرة المؤقتة وإعادة التحديث.
            </p>

            {/* Error Log Box */}
            <div style={{
              background: C.dark.input,
              border: `1px solid ${C.border.card}`,
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'start',
              marginBlockEnd: '28px'
            }}>
              <div style={{ fontSize: '0.75rem', color: C.text.sub, marginBlockEnd: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>تفاصيل الخطأ:</span>
                <span style={{ color: C.error }}>CRASH_REPORT</span>
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: C.error,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '110px',
                overflowY: 'auto'
              }}>
                {errorMessage}
              </p>
            </div>

            {/* Reload Button */}
            <button
              onClick={this.handleReload}
              aria-label="إعادة تحميل الصفحة"
              title="إعادة تحميل الصفحة"
              style={{
                width: '100%',
                padding: '12px 20px',
                minHeight: '44px',
                background: `linear-gradient(180deg, ${C.primary.btnStart} 0%, ${C.primary.btnEnd} 100%)`,
                color: C.text.main,
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 14px ${C.primary.glow}`
              }}
            >
              <RefreshCw size={18} />
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
