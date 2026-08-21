import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FaTimes, FaUserTie, FaSpinner } from 'react-icons/fa';

export default function AddStaffModal({ isOpen, onClose, onSuccess, academyId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('teacher');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم المعلم / المدير');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('teachers')
        .insert([
          {
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            role: role,
            academy_id: academyId || null
          }
        ]);

      if (error) throw error;

      setName('');
      setEmail('');
      setPhone('');
      setRole('teacher');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("🚨 خطأ أثناء إضافة المعلم:", err);
      setErrorMsg(err.message || "حدث خطأ أثناء إضافة الكادر التعليمي");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: '#111C2A',
        border: '1px solid #334155',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        fontFamily: "'Cairo', system-ui, sans-serif",
        color: '#FFF'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUserTie /> إضافة معلم / مدير جديد
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
          >
            <FaTimes />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>الاسم الكامل *</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: د. أحمد المحمود"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#FFF',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>البريد الإلكتروني</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#FFF',
                outline: 'none',
                boxSizing: 'border-box',
                direction: 'ltr'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>رقم الهاتف</label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+201000000000"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#FFF',
                outline: 'none',
                boxSizing: 'border-box',
                direction: 'ltr'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>الدور / الصلاحية</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#FFF',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="teacher">مقرئ / معلم</option>
              <option value="admin">مدير أكاديمية</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #C9A84C, #A88934)',
                color: '#0F172A',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? <FaSpinner className="fa-spin" /> : 'إضافة الكادر'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#1E293B',
                color: '#94A3B8',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
