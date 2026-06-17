import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // تأكيد المسار الصحيح المربوط بـ lib

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب الطلبات المعلقة من قاعدة البيانات
  const fetchPendingRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('role', 'pending_manager')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('خطأ في جلب البيانات:', error.message);
    } else {
      setRequests(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // 2. دالة اتخاذ القرار (قبول، تجربة، رفض)
  const handleAction = async (userId, action) => {
    const { error } = await supabase.rpc('review_user_request', {
      target_user_id: userId,
      review_action: action
    });

    if (error) {
      alert('حدث خطأ أثناء معالجة الطلب: ' + error.message);
    } else {
      alert('تم تحديث حالة المستخدم بنجاح!');
      setRequests(requests.filter(req => req.id !== userId));
    }
  };

  // 🚪 3. دالة تسجيل الخروج الآمن والعودة لشاشة الدخول تلقائياً
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('خطأ أثناء تسجيل الخروج:', error.message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center font-sans">
        <p className="text-xl animate-pulse">جاري تحميل طلبات الانضمام...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-6 font-sans" dir="rtl">
      {/* رأس الصفحة المطور */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-gray-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">لوحة تحكم السوبر أدمن 👑</h1>
          <p className="text-gray-400 mt-1">إدارة طلبات تسجيل الأكاديميات والمراكز القرآنية</p>
        </div>
        
        {/* أزرار الحالة وتسجيل الخروج */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800 text-sm">
            <span className="text-gray-400">الطلبات المعلقة: </span>
            <span className="font-bold text-amber-500">{requests.length}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-rose-950/40 text-rose-400 border border-gray-700 hover:border-rose-900 px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2"
          >
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>

      {/* عرض الطلبات */}
      <div className="max-w-6xl mx-auto">
        {requests.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">لا توجد طلبات انضمام معلقة حالياً. جاري انتظار طلبات جديدة! ✨</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-1">
            {requests.map((req) => (
              <div 
                key={req.id} 
                className="bg-gray-900 border border-gray-800 hover:border-amber-500/30 transition-all rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white">{req.full_name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    تاريخ الطلب: {new Date(req.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleAction(req.id, 'approve_manager')}
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🟢 قبول كمدير
                  </button>

                  <button
                    onClick={() => handleAction(req.id, 'approve_tester')}
                    className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🟡 سماح بالتجربة
                  </button>

                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🔴 رفض الطلب
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
