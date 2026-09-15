// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';
import MainApp from '@/components/Main/MainApp';

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
          {/* مسار الأكاديمية بالأصالة */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* المسار الرئيسي */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* أي مسار آخر يتم توجيهه للرئيسية مباشرة دون شاشة سوداء */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GlobalErrorBoundary>
  );
}
