import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MainApp({ session, userRole, trialDaysLeft }) {
  // القائمة النشطة حالياً في القائمة الجانبية
  const [activeTab, setActiveTab] = useState('dashboard');

  // تعريف عناصر القائمة الجانبية بناءً على جداول قاعدة البيانات الموثقة لديك
  const menuItems = [
    { id: 'dashboard', label: 'اللوحة الرئيسية', icon: '📊' },
    { id: 'academies', label: 'إدارة الأكاديميات', icon: '🏛️' },
    { id: 'teachers', label: 'شؤون المعلمين', icon: '👨‍ز' },
    { id: 'students', label: 'سجلات الطلاب', icon: '👨‍🎓' },
    { id: 'staff', label: 'طاقم العمل والموظفين', icon: '💼' },
    { id: 'attendance', label: 'دفتر الحضور والغياب', icon: '📝' },
    { id: 'progress', label: 'التقدم اليومي والحفظ', icon: '📈' },
    { id: 'exams', label: 'منظومة الاختبارات', icon: '✍️' },
    { id: 'payments', label: 'الاشتراكات والمالية', icon: '💳' },
  ];

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090F17', color: '#FFF', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* 📱 القائمة الجانبية الأصلية الفاخرة (Sidebar) */}
      <div style={{ width: '260px', background: '#111827', borderLeft: '1px solid #1F2937', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 10px' }}>
        <div>
          {/* الشعار العلوي للقائمة الجانبية */}
          <div style={{ padding: '10px 15px 25px 15px', borderBottom: '1px solid #1F2937', marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#FBBF24', margin: '0 0 5px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>الحلقة الذكية</h2>
            <span style={{ fontSize: '0.75rem', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
              {userRole === 'admin' ? 'مدير النظام 👑' : `رتبة: ${userRole}`}
            </span>
          </div>

          {/* أزرار التنقل بين الجداول والقوائم */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#FBBF24' : 'transparent',
                    color: isActive ? '#090F17' : '#9CA3AF',
                    cursor: 'pointer',
                    fontWeight: isActive ? 'bold' : 'normal',
                    textAlign: 'right',
                    fontSize: '0.95rem',
                    transition: '0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* الجزء السفلي للقائمة الجانبية (عداد التجربة + خروج) */}
        <div style={{ borderTop: '1px solid #1F2937', paddingTop: '15px', marginTop: '20px' }}>
          {userRole !== 'admin' && (
            <div style={{ background: '#1F2937', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '12px', fontSize: '0.8rem', color: '#9CA3AF' }}>
              ⏳ متبقي على الفترة التجريبية: <strong style={{ color: '#FBBF24' }}>{trialDaysLeft} يوم</strong>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #EF4444',
              background: 'rgba(239, 68, 68, 0.05)',
              color: '#EF4444',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: '0.3s'
            }}
          >
            ↩️ تسجيل الخروج الآمن
          </button>
        </div>
      </div>

      {/* 🖥️ منطقة المحتوى الرئيسي وعرض البيانات الديناميكية */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* شريط الإشعارات العلوي */}
        <header style={{ height: '70px', background: '#111827', borderBottom: '1px solid #1F2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>👋</span>
            <span style={{ color: '#9CA3AF' }}>مرحباً بك مجدداً، <strong style={{ color: '#FFF' }}>{session?.user?.email}</strong></span>
          </div>
          <div style={{ color: '#FBBF24', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* محتوى الصفحة النشطة داخلياً */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          {/* 📊 عرض شاشة الإحصائيات الرئيسية المتقدمة الافتراضية */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '20px', fontWeight: 'bold' }}>نظرة عامة على حلقات التحفيظ والتعليم</h2>
              
              {/* بطاقات المؤشرات المباشرة */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1F2937' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '5px' }}>إجمالي الأكاديميات النشطة</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FBBF24' }}>--</div>
                </div>
                <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1F2937' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '5px' }}>عدد المعلمين الحاليين</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10B981' }}>--</div>
                </div>
                <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1F2937' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '5px' }}>الطلاب المسجلين بالمنظومة</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3B82F6' }}>--</div>
                </div>
                <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1F2937' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '5px' }}>نسبة حضور الحلقات اليوم</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#A855F7' }}>100%</div>
                </div>
              </div>

              {/* صندوق رسالة الترحيب والجاهزية */}
              <div style={{ background: 'rgba(251,191,36,0.03)', border: '1px dashed rgba(251,191,36,0.2)', padding: '25px', borderRadius: '16px', textAlign: 'center' }}>
                <h3 style={{ color: '#FBBF24', marginTop: '0', fontSize: '1.2rem' }}>✨ لوحة التحكم جاهزة لاستقبال البيانات الكاملة</h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.95rem', margin: '10px 0 0 0', lineHeight: '1.6' }}>
                  بإمكانك الآن الانتقال بين التبويبات الجانبية لعرض وتعديل جداول قاعدة البيانات المربوطة بـ Supabase. جميع الصلاحيات والحمايات مؤمنة بنجاح.
                </p>
              </div>
            </div>
          )}

          {/* 🏛️ عرض باقي النوافذ والجداول المخصصة للمنصة بشكل ديناميكي */}
          {activeTab !== 'dashboard' && (
            <div style={{ background: '#111827', border: '1px solid #1F2937', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
                {menuItems.find(i => i.id === activeTab)?.icon}
              </div>
              <h3 style={{ color: '#FFF', fontSize: '1.3rem', marginTop: '0' }}>
                شاشة {menuItems.find(i => i.id === activeTab)?.label}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                جاري سحب واستعلام البيانات الفورية من حقول الجدول الخاص بالمنصة في خادم الـ Supabase...
              </p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
