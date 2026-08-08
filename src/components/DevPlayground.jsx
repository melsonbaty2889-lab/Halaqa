import React from 'react';
// استدعِ هنا المكون الذي تريد تجريبه (مثل اللوجو أو زر أو جدول)
import Logo from '@/components/UI/Logo';

export default function DevPlayground() {
  return (
    <div style={{ 
      background: '#090F17', 
      minHeight: '100vh', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      direction: 'rtl',
      color: '#FFF'
    }}>
      {/* 🧪 منطقة التجارب السريعة: ضع المكون أو السطر هنا */}
      
      <Logo size={130} />

    </div>
  );
}
