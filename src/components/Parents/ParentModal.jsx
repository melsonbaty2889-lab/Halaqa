/* src/components/Parents/ParentModal.jsx */
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, User, Phone, Mail, Save, AlertCircle } from 'lucide-react';

export default function ParentModal({ isOpen, onClose, parentToEdit = null, academyId, onSaved }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (parentToEdit) {
      setName(parentToEdit.name || '');
      setPhone(parentToEdit.phone || '');
      setEmail(parentToEdit.email || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
    }
    setErrorMsg('');
  }, [parentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setErrorMsg('يرجى كتابة الاسم ورقم الهاتف على الأقل');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        name: name,
        phone: phone,
        email: email || null,
      };

      if (academyId) payload.academy_id = academyId;

      let result;
      if (parentToEdit?.id) {
        payload.updated_at = new Date().toISOString();
        result = await supabase
          .from('parents')
          .update(payload)
          .eq('id', parentToEdit.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('parents')
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (onSaved) onSaved(result.data);
      onClose();
    } catch (err) {
      console.error('خطأ في حفظ بيانات ولي الأمر:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }} dir="rtl">
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '20px', position: 'relative' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #334155' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#F59E0B', margin: 0 }}>
            {parentToEdit ? 'تعديل بيانات ولي الأمر' : 'إضافة ولي أمر جديد'}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '8px', color: '#EF4444', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>الاسم الكامل</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم ولي الأمر" style={inputStyle} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>رقم الهاتف</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010xxxxxxxx" style={inputStyle} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>البريد الإلكتروني (اختياري)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94A3B8', fontSize: '13px', cursor: 'pointer' }}>إلغاء</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#F59E0B', border: 'none', borderRadius: '8px', color: '#0F172A', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={15} /> {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 34px 10px 10px',
  background: '#0F172A',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#FFF',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box'
};
