if (!profile?.academyName) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
        <h3 style={{ color: C.text }}>أهلاً بك يا {profile?.name || 'مستخدم'}!</h3>
        <p style={{ color: C.muted }}>لم يتم ربط حسابك بأي أكاديمية بعد.</p>
        <button 
           onClick={() => setActiveTab('create-academy')} // قمت بتعديلها لتغيير التبويب لصفحة الإنشاء
           style={{ padding: '12px 24px', backgroundColor: C.gold, color: C.bg, borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          إنشاء أكاديميتك الأولى الآن 🚀
        </button>
      </div>
    );
  }
