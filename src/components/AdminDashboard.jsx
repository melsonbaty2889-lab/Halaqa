import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // جلب الطلبات المعلقة من قاعدة البيانات
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['pending_manager', 'Pending manager', 'Pending Manager']) 
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // دالة قبول وتفعيل الحساب وتحويل رتبته إلى manager
  const handleApprove = async (profileId) => {
    setActionLoading(profileId);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'manager' }) 
        .eq('id', profileId);

      if (updateError) throw updateError;
      
      // تحديث الواجهة محلياً بحذف الحساب المفعّل فوراً لتحديث العداد تلقائياً
      setPendingRequests(prev => prev.filter(req => req.id !== profileId));
      alert('🎉 تم تفعيل حساب الأكاديمية بنجاح!');
    } catch (err) {
      alert('❌ حدث خطأ أثناء التفعيل: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090F17', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* الشريط العلوي للوحة التحكم */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#fff', fontWeight: 'bold', margin: 0 }}>لوحة تحكم السوبر أدمن 👑</h1>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}
          onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          تسجيل الخروج 🚪
        </button>
      </div>

      {/* بطاقة إحصائيات الطلبات المعلقة */}
      <div style={{ background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px', maxWidth: '350px', marginBottom: '30px' }}>
        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>الطلبات المعلقة حالياً</span>
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#C9A84C', marginTop: '5px' }}>
          {loading ? '...' : pendingRequests.length}
        </div>
      </div>

      <h2 style={{ fontSize: '18px', color: '#C9A84C', marginBottom: '15px' }}>الطلبات الواردة:</h2>

      {loading ? (
        <p style={{ color: '#9CA3AF' }}>جاري تحميل البيانات...</p>
      ) : pendingRequests.length === 0 ? (
        // في حال عدم وجود طلبات معلقة
        <div style={{ padding: '40px', background: '#111827', borderRadius: '12px', textAlign: 'center', border: '1px dashed #374151' }}>
          <p style={{ color: '#9CA3AF', margin: 0 }}>لا توجد طلبات انضمام معلقة حالياً. جاري انتظار طلبات جديدة! ✨</p>
        </div>
      ) : (
        // عرض قائمة الطلبات المعلقة
        <div style={{ display: 'grid', gap: '15px' }}>
          {pendingRequests.map((req) => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#fff', margin: '0 0 5px 0' }}>{req.full_name || 'مسؤول جديد'}</h3>
                <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>البريد الإلكتروني للطلب: <span style={{ color: '#fff' }}>{req.email || 'غير متوفر'}</span></p>
              </div>
              <button 
                disabled={actionLoading !== null} 
                onClick={() => handleApprove(req.id)} 
                style={{ 
                  background: actionLoading === req.id ? '#065F46' : '#10B981', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 22px', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                  transition: '0.2s'
                }}
              >
                {actionLoading === req.id ? 'جاري التفعيل...' : '✔ قبول وتفعيل'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
