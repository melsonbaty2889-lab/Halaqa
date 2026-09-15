// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';
import MainApp from '@/components/Main/MainApp';

// مكون التوجيه الذكي للمسار الرئيسي
function RootRedirect() {
  const { academy, user, appState } = useAcademy();

  if (appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#070C14] flex flex-col items-center justify-center font-['Cairo',sans-serif]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400 animate-pulse">جاري جلب بيانات الأكاديمية...</p>
      </div>
    );
  }

  // إذا كان المستخدم غير مسجل الدخول، ProtectedRoute سيتكفل به
  if (academy?.slug) {
    return <Navigate to={`/${academy.slug}`} replace />;
  }

  return <MainApp />;
}

export default function App() {
  const context = useAcademy();

  // 1. شاشة التحميل الأولية حتى تجهيز الـ Context بالكامل
  if (!context || context.appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#070C14] flex flex-col items-center justify-center font-['Cairo',sans-serif]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400 animate-pulse">جاري تحميل المنصة...</p>
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
          {/* 1. مسار التطبيق عند وجود slug في الرابط */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* 2. المسار الرئيسي المباشر / عند فتح الموقع */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootRedirect />
              </ProtectedRoute>
            }
          />

          {/* 3. التعامل مع أي مسارات غير معرّفة لمنع الشاشة السوداء */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </div>
    </GlobalErrorBoundary>
  );
}
