import { useState } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';

export default function SignUpPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      return setError('Please fill in all required fields');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      // 2. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // 3. Sign in immediately to get a valid session for RLS
      // If "Confirm Email" is OFF in Supabase, this will succeed
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });
      
      // Ignore "Email not confirmed" error, but throw others
      if (signInError && !signInError.message.includes('Email not confirmed')) {
        throw signInError;
      }

      // 4. Insert into staff table - now auth.uid() exists
      const { error: staffError } = await supabase
        .from('staff')
        .insert([{
          user_id: authData.user.id,
          name: name.trim(),
          role: 'teacher',
          academy_id: null
        }]);

      if (staffError) {
        console.error("Staff Insert Error:", staffError);
        throw new Error("Account created, but failed to link teacher data");
      }

      alert("✅ Account created successfully! You can now log in.");
      onSwitchToLogin();
      
    } catch (err) {
      console.error("SignUp Error:", err);
      setError(err.message || "An unexpected error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Cairo', sans-serif", direction: "rtl",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>🕌</span>
          <h1 style={{ color: C.gold, margin: "16px 0 8px" }}>Create Teacher Account</h1>
        </div>

        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text }} 
          />

          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, direction: 'ltr', textAlign: 'left' }} 
          />

          <input 
            type="password" 
            placeholder="Password - min 6 characters" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
            style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, direction: 'ltr', textAlign: 'left' }} 
          />

          {error && <p style={{ color: "#EF4444", textAlign: "center", fontSize: '0.9rem', margin: 0 }}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              padding: "14px", background: C.gold, color: "#1A1208", border: "none",
              borderRadius: 8, fontSize: "1.1rem", fontWeight: 700, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: C.muted }}>
          Already have an account? 
          <button 
            onClick={onSwitchToLogin} 
            style={{color: C.gold, border: "none", background: "none", cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', marginLeft: 4}}
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
