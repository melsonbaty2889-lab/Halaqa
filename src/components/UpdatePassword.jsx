import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    setLoading(true);
    
    // هذه الدالة هي التي ستحدث كلمة السر باستخدام التوكين الموجود في الرابط
    const { error } = await supabase.auth.updateUser({ 
      password: password 
    });

    if (error) {
      alert("خطأ: " + error.message);
    } else {
      alert("تم تغيير كلمة المرور بنجاح!");
      window.location.href = '/'; // العودة لصفحة الدخول
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', direction: 'rtl' }}>
      <h2>أدخل كلمة المرور الجديدة</h2>
      {/* استخدام onSubmit هنا أفضل للممارسات الجيدة */}
      <form onSubmit={handleUpdate}>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="كلمة المرور الجديدة"
          style={{ padding: '10px', marginBottom: '10px', width: '100%', maxWidth: '300px' }}
          required
        />
        <br />
        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'جاري التحديث...' : 'تحديث'}
        </button>
      </form>
    </div>
  );
}
