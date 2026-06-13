import { useState } from "react";
import { supabase } from '../lib/supabase';
import { FaSignOutAlt } from "react-icons/fa";

export default function MainApp({ session }) {
  // هذا الكود بسيط جداً لنختبر هل المشكلة في المكونات أم في التصميم
  return (
    <div style={{ padding: '50px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h1>يعمل التطبيق!</h1>
      <p>أنت مسجل دخولك بنجاح.</p>
      <button onClick={() => supabase.auth.signOut()} style={{ padding: '10px', background: 'red', color: 'white' }}>
        <FaSignOutAlt /> تسجيل الخروج
      </button>
    </div>
  );
}
