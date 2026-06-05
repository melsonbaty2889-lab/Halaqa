import { useState, useEffect } from "react";
import { C, g } from './constants/colors';
import { supabase } from './lib/supabase';

import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

import {
  Badge,
  Btn,
  Card,
  Input,
  Select,
  Modal,
  PageHeader,
  TH,
  TD
} from "./components/UI";

const SECURITY_CONFIG = {
  allowedHostSuffix: "vercel.app",
  watermark: "Licensed to The Win Route © 2026",
  demoDaysLimit: 14
};

const QURAN_JUZS = Array.from({ length: 30 }, (_, i) => "الجزء " + (i + 1));
const QURAN_SURAS = ["الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"];

const Settings = ({ teacher, setTeacher }) => { 
  return (
    <div style={{padding: 24}}>
      <Card>
        <h3>إعدادات الأكاديمية وحفظ البيانات ⚙️</h3>
        <p style={{color: C.muted, marginTop: 8}}>إعدادات ترخيص النظام، وتحديث بيانات السداد الحالية لمعلم الحلقة.</p>
      </Card>
    </div>
  ); 
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isFullyActivated, setIsFullyActivated] = useState(true);

  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState({ name: "جاري المزامنة...", phone: "" });
  const [academyId, setAcademyId] = useState(null);

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

  useEffect(() => {
    if (!session?.user) return;

    const loadCloudAcademyData = async () => {
      setLoading(true);
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('academy_id, full_name, phone')
          .eq('user_id', session.user.id)
          .single();

        if (staffError) throw staffError;

        if (staffData) {
          setAcademyId(staffData.academy_id);
          setTeacher({
            name: staffData.full_name,
            phone: staffData.phone || "",
            fee: 999
          });

          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', staffData.academy_id)
            .order('created_at', { ascending: false });

          if (studentsError) throw studentsError;
          setStudents(studentsData || []);
        }
      } catch (err) {
        console.error("Error sync cloud data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCloudAcademyData();
  }, [session]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && !hostname.endsWith(SECURITY_CONFIG.allowedHostSuffix)) {
        document.body.innerHTML = `<div style="background:#0C1520;color:#EF4444;text-align:center;padding:100px;font-family:'Cairo';direction:rtl;"><h2>⚠️ خطأ في ترخيص النظام ومصداقية البناء</h2><p>هذه النسخة البرمجية غير مصرح لها بالعمل خارج النطاق الرسمي للتطبيق. يرجى مراجعة المهندس المطور لتعديل مسار الإطلاق.</p></div>`;
      }
    }
  }, []);

  const sendWhatsAppReminder = (student) => {
    const message = `السلام عليكم ورحمة الله وبركاته، نود تذكيركم بموعد سداد اشتراك الحلقة المخصص للابن الكريم: *${student.name}* \nشاكرين لكم عونكم وحرصكم الدائم.`;
    window.open(`https://wa.me/2${student.phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) return <div style={{ color: C.gold, textAlign: 'center', marginTop: '20%', fontFamily: "'Cairo'", fontSize: '1.2rem' }}>جاري تشغيل نظام الحلقة السحابي الذكي ومزامنة البيانات السيرفر... ⏳</div>;

  if (!session) return <LoginPage />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Cairo', sans-serif", direction: "rtl", display: "flex" }}>
      
      {/* Sidebar - القائمة الجانبية */}
      <aside style={{ width: 260, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
            <span style={{ fontSize: 24 }}>🕌</span>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: C.gold, lineHeight: 1 }}>الحلقة الذكية</h2>
              <span style={{ fontSize: "0.68rem", color: C.muted }}>منصة الـ SaaS السحابية</span>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "dashboard", label: "لوحة التحكم الرئيسية", icon: "📊" },
              { id: "students", label: "دليل الطلاب والحفظ", icon: "👥" },
              { id: "attendance", label: "الحضور والغياب اليومي", icon: "📝" },
              { id: "payments", label: "الخزينة والمالية والعوائد", icon: "💰" },
              { id: "settings", label: "إعدادات الأكاديمية المعلم", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", borderRadius: 12, border: "none",
                  background: activeTab === tab.id ? g.gold : "transparent",
                  color: activeTab === tab.id ? "#1A1208" : C.text,
                  cursor: "pointer", fontFamily: "'Cairo'", fontSize: "0.85rem", fontWeight: activeTab === tab.id ? 700 : 500, textAlign: "right",
                  transition: "all 0.2s"
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div style={{ fontSize: "0.7rem", color: C.muted, textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div>{SECURITY_CONFIG.watermark}</div>
        </div>
      </aside>

      {/* منطقة العرض الديناميكي المصفاة والنظيفة من التكرار */}
      <main style={{ flex: 1, padding: 32, boxSizing: "border-box", overflowY: "auto", maxHeight: "100vh" }}>
        
        {activeTab === "dashboard" && (
          <Dashboard session={session} setActiveTab={setActiveTab} />
        )}
        
        {activeTab === "students" && (
          <Students 
            students={students} 
            setStudents={setStudents} 
            onSendReminder={sendWhatsAppReminder} 
            isFullyActivated={isFullyActivated} 
            teacherPhone={teacher.phone}
            academyId={academyId} 
          />
        )}

        {activeTab === "attendance" && (
          <Attendance 
            students={students} 
            academyId={academyId} 
          />
        )}

        {activeTab === "payments" && (
          <Payments 
            students={students} 
            academyId={academyId} 
          />
        )}

        {activeTab === "settings" && (
          <Settings teacher={teacher} setTeacher={setTeacher} />
        )}

      </main>
    </div>
  );
}
