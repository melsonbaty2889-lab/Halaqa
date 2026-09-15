// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';
import MainApp from '@/components/Main/MainApp';

// مكون لضمان توجيه المستخدم للأكاديمية الصحيحة أو شاشة تسجيل الدخول
function RootRedirect() {
  const { academy, user, appState } = useAcademy();

  // 1. انتهاء التحميل
  if (appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#070C14] flex flex-col items-center justify-center font-['Cairo',sans-serif]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">جاري جلب بيانات الأكاديمية...</p>
      </div>
    );
  }

  // 2. إذا كان المستخدم مسجل الدخول وتوفرت الأكاديمية، وجهه مباشرة للرابط المخصص لها
  if (academy?.slug) {
    return <Navigate to={`/${academy.slug}`} replace />;
  }

  // 3. إذا لم توجد أكاديمية، قم بعرض التطبيق الأساسي مع الحماية
  return <MainApp />;
}

export default function App() {
  const context = useAcademy();

  // في حالة جاري تحميل البيانات الأولية للـ Context
  if (!context || context.appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#070C14] flex items-center justify-center font-['Cairo',sans-serif]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { 
    isOffline = false, 
    updateAvailable = false, 
    handleReload,
    isUpgradeModalOpen = false,
    closeUpgradeModal,
    academy,
    tierConfig,
    navigateToSubscription 
  } = context;

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen bg-[#070C14] text-white font-['Cairo',sans-serif]">
        <OfflineAndUpdateBanner
          isOffline={isOffline}
          updateAvailable={updateAvailable}
          onReload={handleReload}
        />

        <InlineUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          academyName={academy?.name}
          tierConfig={tierConfig}
          onNavigateSubscription={navigateToSubscription}
        />

        <Routes>
          {/* 1. مسار الأكاديمية المباشر المحمي بالـ Slug */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* 2. المسار الرئيسي / يحولك إلى الأكاديمية بالاسم المخصص */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootRedirect />
              </ProtectedRoute>
            }
          />

          {/* 3. التعامل مع أي مسارات غير معروفة */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GlobalErrorBoundary>
  );
}
