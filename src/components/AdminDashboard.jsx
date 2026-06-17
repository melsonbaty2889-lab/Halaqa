import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

  // 2. دالة اتخاذ القرار (قبول، تجربة، رفض) واستدعاء الـ RPC
  const handleAction = async (userId, action) => {
    const { error } = await supabase.rpc('review_user_request', {
      target_user_id: userId,
      review_action: action
    });

    if (error) {
      alert('حدث خطأ أثناء معالجة الطلب: ' + error.message);
    } else {
      alert('تم تحديث حالة المستخدم بنجاح!');
      // تحديث القائمة في الواجهة لحذف الطلب الذي تم البت فيه
      setRequests(requests.filter(req => req.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center font-sans">
        <p className="text-xl animate-pulse">جاري تحميل طلبات الانضمام...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-6 font-sans dir-rtl" dir="rtl">
      {/* رأس الصفحة */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">لوحة تحكم السوبر أدمن 👑</h1>
          <p className="text-gray-400 mt-1">إدارة طلبات تسجيل الأكاديميات والمراكز القرآنية</p>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-400">الطلبات المعلقة: </span>
          <span className="text-lg font-bold text-amber-500">{requests.length}</span>
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
                {/* بيانات صاحب الطلب */}
                <div>
                  <h3 className="text-xl font-semibold text-white">{req.full_name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    تاريخ الطلب: {new Date(req.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* أزرار التحكم والخيارات الثلاثة */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {/* خيار 1: قبول كمدير */}
                  <button
                    onClick={() => handleAction(req.id, 'approve_manager')}
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🟢 قبول كمدير
                  </button>

                  {/* خيار 2: قبول كحساب تجريبي */}
                  <button
                    onClick={() => handleAction(req.id, 'approve_tester')}
                    className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🟡 سماح بالتجربة
                  </button>

                  {/* خيار 3: رفض وحظر الطلب */}
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
