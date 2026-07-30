import React, { useState } from 'react';
import AddStaffModal from './AddStaffModal';

export default function Teachers() {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  return (
    <div style={{ padding: '20px', color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
      {/* هيدر الصفحة */}
      <div style={{ 
        background: '#1e293b', 
        padding: '20px', 
        borderRadius: '16px', 
        border: '1px solid #334155',
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>
          👨‍🏫 الكادر التعليمي والمقرئين
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
          إجمالي المقرئين النشطين: 0
        </p>
      </div>

      {/* زر إضافة معلم جديد المربوط بالمودال */}
      <button 
        onClick={() => setIsAddStaffOpen(true)}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: '#C9A84C', // اللون الذهبي
          color: '#0f172a',
          fontWeight: 'bold',
          fontSize: '15px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)'
        }}
      >
        ➕ إضافة معلم / مدير جديد
      </button>

      {/* مودال إنشـاء الحسـاب */}
      <AddStaffModal 
        isOpen={isAddStaffOpen} 
        onClose={() => setIsAddStaffOpen(false)} 
        onSuccess={() => {
          // جلب قائمة المعلمين بعد الإضافة
        }}
      />
    </div>
  );
}
