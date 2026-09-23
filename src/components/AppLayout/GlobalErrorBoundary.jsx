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
    if (typeof window !== 'undefined' && 'caches' in window) {
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
          background: C.semantic.bgPage,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Cairo', system-ui, sans-serif",
          color: C.semantic.textPrimary
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: C.semantic.surfaceCard,
            border: `1px solid ${C.semantic.borderCard}`,
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
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
              background: C.semantic.danger,
              filter: 'blur(90px)',
              opacity: 0.25,
              pointerEvents: 'none'
            }} />

            {/* Icon Wrapper */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: C.semantic.dangerBg,
              border: `1px solid ${C.semantic.danger}`,
              color: C.semantic.danger,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <AlertTriangle size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBlockEnd: '8px', color: C.semantic.textPrimary }}>
              عذراً، حدث خطأ تقني غير متوقع
            </h2>
            <p style={{ fontSize: '0.875rem', color: C.semantic.textSecondary, marginBlockEnd: '24px', lineHeight: '1.6' }}>
              واجه النظام مشكلة أثناء تحميل هذه الصفحة. حاول تفريغ الذاكرة المؤقتة وإعادة التحديث.
            </p>

            {/* Error Log Box */}
            <div style={{
              background: C.semantic.surfaceInput,
              border: `1px solid ${C.semantic.borderInput}`,
              borderRadius: '12px',
              padding: '14px 16px',
              textAlign: 'start',
              marginBlockEnd: '28px'
            }}>
              <div style={{ fontSize: '0.75rem', color: C.semantic.textSecondary, marginBlockEnd: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>تفاصيل الخطأ:</span>
                <span style={{ color: C.semantic.danger, fontWeight: '600' }}>CRASH_REPORT</span>
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: C.semantic.danger,
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
                background: C.semantic.actionPrimary,
                color: C.semantic.textPrimary,
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 14px ${C.semantic.actionPrimaryGlow}`,
                transition: 'all 0.2s ease'
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
