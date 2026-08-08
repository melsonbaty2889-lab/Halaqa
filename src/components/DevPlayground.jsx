/* src/components/DevPlayground.jsx */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, User, BookOpen, Award, 
  Settings, LogOut, Shield, Bell, Search, Zap, Loader2 
} from 'lucide-react';

export default function DevPlayground() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div style={{ 
      background: '#090F17', 
      minHeight: '100vh', 
      padding: '20px', 
      direction: 'rtl',
      color: '#FFF',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* رأس الصفحة */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#C9A84C', marginBottom: '8px' }}>🎨 مختبر العناصر الشامل</h2>
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>معاينة الألوان، الأيقونات، والأزرار الخاصة بالمنظومة في مكان واحد</p>
        </div>

        {/* 1️⃣ قسم الألوان (Color Palette) */}
        <section style={{ background: '#111C2A', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '16px', color: '#C9A84C', marginBottom: '15px' }}>1. لوحة الألوان الأساسية</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: '#090F17', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ background: '#090F17', height: '30px', borderRadius: '4px', marginBottom: '8px', border: '1px solid #555' }}></div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>الخلفية الداكنة (#090F17)</span>
            </div>
            <div style={{ background: '#111C2A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ background: '#C9A84C', height: '30px', borderRadius: '4px', marginBottom: '8px' }}></div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>لون التميز الذهبي (#C9A84C)</span>
            </div>
            <div style={{ background: '#111C2A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ background: '#10B981', height: '30px', borderRadius: '4px', marginBottom: '8px' }}></div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>لون النجاح (#10B981)</span>
            </div>
            <div style={{ background: '#111C2A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ background: '#EF4444', height: '30px', borderRadius: '4px', marginBottom: '8px' }}></div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>لون التنبيه (#EF4444)</span>
            </div>
          </div>
        </section>

        {/* 2️⃣ قسم الأيقونات (Icons) */}
        <section style={{ background: '#111C2A', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '16px', color: '#C9A84C', marginBottom: '15px' }}>2. مكتبة الأيقونات المستخدمة</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><User size={24} color="#C9A84C" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>مستخدم</span></div>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><BookOpen size={24} color="#C9A84C" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>حلقة</span></div>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><Award size={24} color="#C9A84C" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>شهادة</span></div>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><Shield size={24} color="#C9A84C" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>أمان</span></div>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><Bell size={24} color="#10B981" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>تنبيه</span></div>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><Settings size={24} color="#94A3B8" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>إعدادات</span></div>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><Zap size={24} color="#F59E0B" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>ترقية</span></div>
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}><CheckCircle size={24} color="#10B981" /><span style={{ display: 'block', fontSize: '11px', marginTop: '6px', color: '#94A3B8' }}>تأكيد</span></div>
          </div>
        </section>

        {/* 3️⃣ قسم الأزرار والحالات (Buttons & States) */}
        <section style={{ background: '#111C2A', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '16px', color: '#C9A84C', marginBottom: '15px' }}>3. الأزرار والعناصر التفاعلية</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <button 
              onClick={() => alert("تم النقر على الزر الرئيسي")}
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #9A7B30)',
                color: '#000',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              زر رئيسي (Primary Button)
            </button>

            <button 
              onClick={() => alert("تم النقر على الزر الثانوي")}
              style={{
                background: '#1E293B',
                color: '#FFF',
                border: '1px solid #334155',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              زر ثانوي (Secondary Button)
            </button>

            <button 
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid #EF4444',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} /> زر خروج / خطر (Danger)
            </button>

          </div>
        </section>

      </div>
    </div>
  );
}
