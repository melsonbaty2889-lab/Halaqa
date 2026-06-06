import { useState, useEffect } from "react";
import { C } from './constants/colors';
import { supabase } from './lib/supabase';

import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

import { Card } from "./components/UI";

const SECURITY_CONFIG = {
  allowedHostSuffix: "vercel.app",
  watermark: "Licensed to The Win Route © 2026",
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSignUp, setShowSignUp] = useState(false);

  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState({ name: "جاري المزامنة...", phone: "" });
  const [academyId, setAcademyId] = useState(null);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load Academy Data + Real-time Students Subscription
  useEffect(() => {
    if (!session?.user) return;

    const loadAcademyData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('academy_id, name, phone')
          .eq('user_id', session.user.id)
          .single();

        if (staffError) throw staffError;

        if (staffData) {
          setAcademyId(staffData.academy_id);
          setTeacher({
            name: staffData.name || "معلم",
            phone: staffData.phone || "",
          });

          // Initial load
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', staffData.academy_id)
            .order('created_at', { ascending: false });

          if (studentsError) throw studentsError;
          setStudents(studentsData || []);
        }
      } catch (err) {
        console.error("Error syncing cloud data:", err);
        setError("حدث خطأ أثناء تحميل البيانات. يرجى إعادة المحاولة.");
      } finally {
        setLoading(false);
      }
    };

    loadAcademyData();

    // Real-time subscription
    if (!academyId) return;

    const channel = supabase
      .channel(`students:${academyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students',
          filter: `academy_id=eq.${academyId}`,
        },
        () => {
          loadAcademyData(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, academyId]);

  // Security Check
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    const isAllowed =
      hostname === "localhost" ||
      hostname.endsWith(SECURITY_CONFIG.allowedHostSuffix);

    if (!isAllowed) {
      document.body.innerHTML = `
        <div style="background:#0C1520;color:#EF4444;text-align:center;padding:100px;font-family:'Cairo';direction:rtl;">
          <h2>⚠️ خطأ في ترخيص النظام</h2>
          <p>هذه النسخة غير مصرح لها بالعمل خارج النطاق الرسمي.</p>
          <p style="margin-top:20px;font-size:0.9rem;">يرجى التواصل مع المطور.</p>
        </div>`;
    }
  }, []);

  const sendWhatsAppReminder = (student) => {
    const message = `السلام عليكم ورحمة الله، نذكركم بموعد سداد اشتراك الحلقة للابن الكريم: *${student.name}*\nشاكرين لكم حرصكم الدائم.`;
    window.open(`https://wa.me/2\( {student.parent_phone}?text= \){encodeURIComponent(message)}`, "_blank");
  };

  // Loading Screen
  if (loading) {
    return (
      <div style={{
        color: C.gold,
        textAlign: 'center',
        marginTop: '20%',
        fontFamily: "'Cairo'",
        fontSize: '1.2rem'
      }}>
        جاري تشغيل نظام الحلقة السحابي ومزامنة البيانات... ⏳
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div style={{
        color: '#EF4444',
        textAlign: 'center',
        marginTop: '20%',
        fontFamily: "'Cairo'",
        padding: '20px'
      }}>
        <h3>⚠️ {error}</h3>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            padding: "10px 20px",
            background: C.gold,
            color: "#1A1208",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Not Authenticated
  if (!session) {
    return showSignUp 
      ? <SignUpPage onSwitchToLogin={() => setShowSignUp(false)} />
      : <LoginPage onSwitchToSignUp={() => setShowSignUp(true)} />;
  }

  const Settings = () => (
    <div style={{ padding: 24 }}>
      <Card>
        <h3 style={{ color: C.gold, margin: '0 0 16px 0' }}>⚙️ إعدادات الأكاديمية</h3>
        <p style={{ color: C.text, marginBottom: 8 }}>
          مرحباً: <strong>{teacher.name}</strong>
        </p>
        <p style={{ color: C.muted, fontSize: '0.85rem' }}>
          {SECURITY_CONFIG.watermark}
        </p>
      </Card>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Cairo', sans-serif",
      direction: "rtl",
      display: "flex"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: C.surface,
        borderLeft: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 20
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
            <span style={{ fontSize: 28 }}>🕌</span>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.gold, lineHeight: 1 }}>
                الحلقة الذكية
              </h2>
              <span style={{ fontSize: "0.7rem", color: C.muted }}>منصة SaaS السحابية</span>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { id: "dashboard", label: "لوحة التحكم الرئيسية", icon: "📊" },
              { id: "students",  label: "دليل الطلاب والحفظ",   icon: "👥" },
              { id: "attendance",label: "الحضور والغياب اليومي", icon: "📝" },
              { id: "payments",  label: "الخزينة والمالية",      icon: "💰" },
              { id: "settings",  label: "الإعدادات",             icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: activeTab === tab.id ? C.gold : "transparent",
                  color: activeTab === tab.id ? "#1A1208" : C.text,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  textAlign: "right",
                  transition: "all 0.2s ease"
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <div style={{ fontSize: "0.8rem", color: C.muted, marginBottom: 12, textAlign: "center" }}>
            {teacher.name}
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              width: '100%',
              padding: '11px',
              background: 'rgba(239,68,68,0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            🚪 تسجيل الخروج
          </button>
          <div style={{
            fontSize: "0.68rem",
            color: C.muted,
            textAlign: "center",
            marginTop: 16,
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`
          }}>
            {SECURITY_CONFIG.watermark}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: 32,
        boxSizing: "border-box",
        overflowY: "auto",
        maxHeight: "100vh"
      }}>
        {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {activeTab === "students" && (
          <Students
            students={students}
            setStudents={setStudents}
            academyId={academyId}
            onSendReminder={sendWhatsAppReminder}
          />
        )}
        {activeTab === "attendance" && <Attendance students={students} academyId={academyId} />}
        {activeTab === "payments" && <Payments students={students} academyId={academyId} />}
        {activeTab === "settings" && <Settings />}
      </main>
    </div>
  );
}
