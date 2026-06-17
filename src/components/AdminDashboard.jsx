import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // 📊 متغيرات التشخيص لمعرفة سبب الـ 0
  const [dbError, setDbError] = useState(null);
  const [detectedRoles, setDetectedRoles] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const fetchRequests = async () => {
    setLoading(true);
    setDbError(null);
    try {
      // 1. فحص تشخيصي كلي: كم سطر يراه الأدمن في الجدول وما هي الرتب؟
      const { data: debugData, error: debugError } = await supabase
        .from('profiles')
        .select('role');
      
      if (debugError) {
        setDbError(debugError.message);
      } else if (debugData) {
        setTotalRows(debugData.length);
        // استخراج الرتب الفريدة المتواجدة فعلياً في قاعدتك حالياً
        const roles = [...new Set(debugData.map(item => item.role))];
        setDetectedRoles(roles);
      }

      // 2. الاستعلام الفعلي المحدث لجلب الطلبات
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['pending_manager', 'Pending manager', 'Pending Manager']) 
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (profileId) => {
    setActionLoading(profileId);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'manager' }) 
        .eq('id', profileId);

      if (updateError) throw updateError;
      setPendingRequests(prev => prev.filter(req => req.id !== profileId));
      alert('🎉 تم تفعيل حساب الأكاديمية بنجاح!');
      fetchRequests(); // إعادة تحديث الفحص
    } catch (err) {
      alert('❌ حدث خطأ: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090F17', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* شريط التشخيص الذكي - سيختفي بمجرد حل المشكلة */}
      <div style={{ background: '#1E1B4B', border: '1px solid #4338CA', padding: '15px', borderRadius: '8px', marginBottom: '25px', fontSize: '13px' }}>
        <h4 style={{ color: '#6366F1', margin: '0 0 8px 0', fontSize: '14px' }}>🔍 تقرير فحص قاعدة البيانات المباشر:</h4>
        <ul style={{ margin: 0, paddingRight: '20px', lineHeight: '1.8' }}>
          <li>حالة الاتصال/الأخطاء: {dbError ? <span style={{ color: '#EF4444' }}>❌ {dbError}</span> : <span style={{ color: '#10B981' }}>✔ مستقر وبدون أخطاء حجب</span>}</li>
          <li>إجمالي الحسابات التي يستطيع حسابك رؤيتها الآن: <strong style={{ color: '#C9A84C' }}>{totalRows} حسابات</strong></li>
          <li>الرتب المتواجدة فعلياً في الجدول حالياً: <code style={{ background: '#090F17', padding: '2px 6px', borderRadius: '4px', color: '#10B981' }}>{detectedRoles.length > 0 ? detectedRoles.join(' | ') : 'لا يوجد'}</code></li>
        </ul>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#fff', fontWeight: 'bold', margin: 0 }}>لوحة تحكم السوبر أدمن 👑</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>تسجيل الخروج 🚪</button>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px', maxWidth: '350px', marginBottom: '30px' }}>
        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>الطلبات المعلقة حالياً</span>
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#C9A84C', marginTop: '5px' }}>{loading ? '...' : pendingRequests.length}</div>
      </div>

      <h2 style={{ fontSize: '18px', color: '#C9A84C', marginBottom: '15px' }}>الطلبات الواردة:</h2>

      {loading ? (
        <p style={{ color: '#9CA3AF' }}>جاري تحميل البيانات...</p>
      ) : pendingRequests.length === 0 ? (
        <div style={{ padding: '40px', background: '#111827', borderRadius: '12px', textAlign: 'center', border: '1px dashed #374151' }}>
          <p style={{ color: '#9CA3AF', margin: 0 }}>لا توجد طلبات انضمام معلقة تماثل الشروط الحالية.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {pendingRequests.map((req) => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', border: '1px solid #1E293B', padding: '20px', borderRadius: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#fff', margin: '0 0 5px 0' }}>{req.full_name || 'مسؤول جديد'}</h3>
                <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>الرتبة في الداتابيز: <span style={{ color: '#C9A84C' }}>{req.role}</span></p>
              </div>
              <button disabled={actionLoading !== null} onClick={() => handleApprove(req.id)} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {actionLoading === req.id ? 'جاري التفعيل...' : '✔ قبول وتفعيل'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
