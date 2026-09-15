// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';

// تحميل المكون الرئيسي بشكل كسول (Lazy Loading)
const MainApp = lazy(() => import('@/components/Main/MainApp'));

export default function App() {
  const { 
    isOffline, 
    updateAvailable, 
    handleReload,
    isUpgradeModalOpen,
    closeUpgradeModal,
    academy,
    tierConfig,
    navigateToSubscription 
  } = useAcademy();

  return (
    <GlobalErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#070C14] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        {/* شريط حالة الاتصال والتحديثات */}
        <OfflineAndUpdateBanner
          isOffline={isOffline}
          updateAvailable={updateAvailable}
          onReload={handleReload}
        />

        {/* نافذة الترقية المنبثقة */}
        <InlineUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          academyName={academy?.name}
          tierConfig={tierConfig}
          onNavigateSubscription={navigateToSubscription}
        />

        {/* إدارة المسارات */}
        <Routes>
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          {/* تحويل المسار الرئيسي تلقائياً إلى MainApp أو معالجته عبر ProtectedRoute */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  );
}
