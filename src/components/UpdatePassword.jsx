import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) alert(error.message);
    else alert("تم تغيير كلمة المرور بنجاح!");
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>أدخل كلمة المرور الجديدة</h2>
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleUpdate} disabled={loading}>تحديث</button>
    </div>
  );
}
