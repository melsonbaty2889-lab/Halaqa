import React from 'react';
import { CreditCard, MessageSquare, Sparkles, Building2, Target, Banknote, RotateCcw, Save, Send } from 'lucide-react';

// نافذة التحصيل وقبض الاشتراك
export function CollectModal({ isOpen, onClose, student, amount, setAmount, method, setMethod, notes, setNotes, onConfirm, currencySymbol, C }) {
  if (!isOpen || !student) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#121824', borderRadius: '16px', width: '100%', maxWidth: '420px',
        border: '1px solid #1e293b', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CreditCard style={{ color: C?.gold || '#f59e0b' }} size={20} />
          <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '700' }}>تسجيل وتحصيل الاشتراك</h3>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
          الطالب: <span style={{ color: '#fff', fontWeight: '700' }}>{student.name}</span>
        </p>

        {/* حقل المبلغ */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>
            المبلغ المستلم ({currencySymbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%', background: '#0b0f17', border: '1px solid #334155',
              borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '18px',
              outline: 'none', fontWeight: '700', textAlign: 'center', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* طريقة الدفع */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>طريقة الدفع</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'cash', label: 'نقدي' },
              { id: 'bank', label: 'تحويل بنكي' },
              { id: 'wallet', label: 'محفظة إلكترونية' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: '8px', border: '1px solid #334155',
                  background: method === m.id ? (C?.gold || '#f59e0b') : '#0b0f17',
                  color: method === m.id ? '#000' : '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ملاحظات */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>ملاحظات (مثل: خصم إخوة / كفالة)</label>
          <input
            type="text"
            placeholder="أدخل أي ملاحظات إن وجدت..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%', background: '#0b0f17', border: '1px solid #334155',
              borderRadius: '10px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* أزرار سريعة */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setAmount(student.expectedAmount)}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#10b981', fontSize: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Banknote size={14} /> كامل المبلغ
          </button>
          <button
            type="button"
            onClick={() => setAmount('0')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <RotateCcw size={14} /> تصفير السداد
          </button>
        </div>

        {/* أزرار التحكم */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>إلغاء</button>
          <button onClick={onConfirm} style={{ background: C?.gold || '#f59e0b', border: 'none', color: '#000', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Save size={14} /> حفظ التحصيل
          </button>
        </div>
      </div>
    </div>
  );
}

// نافذة الواتساب والنبرات
export function WhatsAppModal({ isOpen, onClose, message, setMessage, tone, onToneChange, onSend }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#121824', borderRadius: '16px', width: '100%', maxWidth: '480px',
        border: '1px solid #1e293b', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <MessageSquare style={{ color: '#10b981' }} size={20} />
          <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '700' }}>مراجعة رسالة التذكير</h3>
        </div>

        {/* اختيار النبرة */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'encouraging', label: 'ودية تشجيعية', icon: Sparkles },
            { id: 'official', label: 'رسمية', icon: Building2 },
            { id: 'direct', label: 'مباشرة (للكبار)', icon: Target }
          ].map(t => {
            const Icon = t.icon;
            const active = tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToneChange(t.id)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid #334155',
                  background: active ? '#10b981' : '#0b0f17', color: active ? '#fff' : '#94a3b8',
                  fontSize: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* نص الرسالة - نص أبيض واضح للتغلب على مشكلة التباين */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          style={{
            width: '100%', background: '#0b0f17', border: '1px solid #334155',
            borderRadius: '10px', padding: '12px', color: '#f8fafc', fontSize: '13px',
            fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: '1.6', boxSizing: 'border-box'
          }}
        />

        {/* أزرار الإجراءات */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>إلغاء</button>
          <button onClick={onSend} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> فتح الواتساب والإرسال
          </button>
        </div>
      </div>
    </div>
  );
}
