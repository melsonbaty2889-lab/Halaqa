import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // تأكد من صحة مسار ملف السوبابيز لديك

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // 1️⃣ جلب الطلبات المعلقة بشكل ذكي (يدعم الطريقتين في قاعدة البيانات)
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['pending_manager', 'Pending manager', 'Pending Manager']) // حزام الأمان للمطابقة
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (err) {
      console.error('Error fetching pending requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2️⃣ إجراء الموافقة وتفعيل الحساب (ترقية الرتبة إلى manager)
  const handleApprove = async (profileId) => {
    setActionLoading(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .select('role') // خطوة تأكيدية للأمان
        .eq('id', profileId);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'manager' }) // تحويله إلى مدير معتمد
        .eq('id', profileId);

      if (updateError) throw updateError;
      
      // تحديث القائمة في الواجهة فوراً بعد النجاح
      setPendingRequests(prev => prev.filter(req => req.id !== profileId));
      alert('🎉 تم الموافقة على طلب الأكاديمية وتفعيل الحساب بنجاح!');
    } catch (err) {
      alert('❌ حدث خطأ أثناء معالجة الطلب: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 3️⃣ إجراء الرفض
  const handleReject = async (profileId) => {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    setActionLoading(profileId);
    try {
      // يمكنك تعديل هذا الإجراء ليصبح حذفاً أو تحويلاً لرتبة أخرى مثل rejected
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'rejected' })
        .eq('id', profileId);

      if (error) throw error;
      setPendingRequests(prev => prev.filter(req => req.id !== profileId));
    } catch (err) {
      alert('❌ حدث خطأ أثناء رفض الطلب: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090F17', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* الرأس السفلي للوحة الصلاحيات */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#fff', fontWeight: 'bold', margin: 0 }}>
            لوحة تحكم السوبر أدمن 👑
          </h1>
          <p style={{ color: '#9CA3AF', marginTop: '5px', fontSize: '14px' }}>
            إدارة طلبات تسجيل الأكاديميات والمراكز القرآنية
          </p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          تسجيل الخروج 🚪
        </button>
      </div>

      {/* كارت العداد الإحصائي الكلي */}
      <div style={{ background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px', maxWidth: '350px', marginBottom: '30px' }}>
        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>الطلبات المعلقة حالياً</span>
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#C9A84C', marginTop: '5px' }}>
          {loading ? '...' : pendingRequests.length}
        </div>
      </div>

      {/* عرض قائمة الطلبات */}
      <h2 style={{ fontSize: '18px', color: '#C9A84C', marginBottom: '15px' }}>الطلبات الواردة:</h2>

      {loading ? (
        <p style={{ color: '#9CA3AF' }}>جاري تحميل الطلبات بنبضات آمنة...</p>
      ) : pendingRequests.length === 0 ? (
        <div style={{ padding: '40px', background: '#111827', borderRadius: '12px', textAlign: 'center', border: '1px dashed #374151' }}>
          <span style={{ fontSize: '24px' }}>✨</span>
          <p style={{ color: '#9CA3AF', marginTop: '10px' }}>لا توجد طلبات انضمام معلقة حالياً. جاري انتظار طلبات جديدة!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {pendingRequests.map((req) => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#fff', margin: '0 0 5px 0' }}>{req.full_name || 'مسؤول غير مسمى'}</h3>
                <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>🆔 المعرّف الفريد: <code style={{ color: '#C9A84C' }}>{req.id}</code></p>
                <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '5px' }}>تاريخ الطلب: {new Date(req.created_at).toLocaleDateString('ar-EG')}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  disabled={actionLoading !== null}
                  onClick={() => handleApprove(req.id)}
                  style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading ? 0.6 : 1 }}
                >
                  {actionLoading === req.id ? 'جاري التفعيل...' : '✔ قبول وتفعيل'}
                </button>
                <button
                  disabled={actionLoading !== null}
                  onClick={() => handleReject(req.id)}
                  style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading ? 0.6 : 1 }}
                >
                  رفض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
