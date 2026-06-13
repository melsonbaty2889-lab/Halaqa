import { useState } from "react";
import { supabase } from '../lib/supabase';
import { FaSignOutAlt } from "react-icons/fa";
// أضفنا Dashboard فقط
import Dashboard from './Dashboard.jsx'; 

export default function MainApp({ session }) {
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Dashboard Test</h1>
      <Dashboard session={session} />
      <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '20px', padding: '10px', background: 'red' }}>
        <FaSignOutAlt /> تسجيل الخروج
      </button>
    </div>
  );
}
