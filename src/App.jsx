// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';
import MainApp from '@/components/Main/MainApp';
import LoginPage from '@/components/Auth/LoginPage'; 

// مكون ذكي للتحويل عند فتح الرابط الرئيسي /
const RootRedirect = () => {
  const { academy, loading } = useAcademy();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070C14] text-white font-bold">
        جاري جلب بيانات الأكاديمية...
      </div>
    );
  }

  // إذا كانت الأكاديمية معروفة ولديها slug، يحولك تلقائياً لـ /slug
  if (academy?.slug) {
    return <Navigate to={`/${academy.slug}`} replace />;
  }

  // إذا لم تكن معروفة، يعرض التطبيق الرئيسي
  return <MainApp />;
};

export default function App() {
  const context = useAcademy() || {};

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
          {/* مسار صريح لصفحة الدخول */}
          <Route path="/login" element={<LoginPage />} />

          {/* مسار الأكاديمية المخصص باستخدام :slug */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* الرابط الرئيسي / يقوم بالتحويل التلقائي للأكاديمية الصحيحة */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootRedirect />
              </ProtectedRoute>
            }
          />

          {/* أي مسار آخر غير معروف يعاد توجيهه إلى / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GlobalErrorBoundary>
  );
}
