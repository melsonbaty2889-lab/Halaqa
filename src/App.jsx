// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';

const MainApp = lazy(() => import('@/components/Main/MainApp'));

export default function App() {
  const context = useAcademy();

  // في حال لم يكتمل الـ Context أو كان يحمل البيانات
  if (!context) {
    return (
      <div className="min-h-screen bg-[#070C14] flex items-center justify-center text-white font-['Cairo',sans-serif]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { 
    isOffline, 
    updateAvailable, 
    handleReload,
    isUpgradeModalOpen,
    closeUpgradeModal,
    academy,
    tierConfig,
    navigateToSubscription 
  } = context;

  return (
    <GlobalErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#070C14] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
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
          {/* مسار التطبيق الرئيسي */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* التوجيه للمسار الرئيسي */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  );
}
