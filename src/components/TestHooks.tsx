import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAnalytics } from '../hooks/useAnalytics';

export function TestHooks() {
  const { notifications, unreadCount } = useNotifications();
  const { dashboardStats, loadingStats } = useAnalytics('اكتب-id-الأكاديمية-هنا');

  return (
    <div style={{ padding: '20px', direction: 'rtl', color: '#fff', backgroundColor: '#0C1520', minHeight: '100vh' }}>
      <h1>🧪 صفحة اختبار الـ Hooks</h1>
      
      <div style={{ margin: '15px 0', padding: '10px', border: '1px solid #C9A84C' }}>
        <h3>🔔 الإشعارات:</h3>
        <p>عدد الإشعارات غير المقروءة: <strong>{unreadCount}</strong></p>
      </div>

      <div style={{ margin: '15px 0', padding: '10px', border: '1px solid #C9A84C' }}>
        <h3>📊 الإحصائيات:</h3>
        {loadingStats ? <p>جاري التحميل...</p> : (
          <p>عدد الطلاب النشطين: <strong>{dashboardStats?.active_students_count || 0}</strong></p>
        )}
      </div>
    </div>
  );
}

export default TestHooks;
