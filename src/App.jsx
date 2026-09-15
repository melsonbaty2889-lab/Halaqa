// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';

// تحميل المكون الرئيسي
const MainApp = lazy(() => import('@/components/Main/MainApp'));

// مكون بسيط للتعامل مع التحويل في المسار الرئيسي بدون كسر ProtectedRoute
function IndexRedirect() {
  const { academy, appState } = useAcademy();

  if (appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#070C14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // إذا كانت الأكاديمية موجودة يحول إلى slug الأكاديمية، وإلا يتجه إلى اختيار الأكاديمية
  if (academy?.slug) {
    return <Navigate to={`/${academy.slug}`} replace />;
  }

  return <Navigate to="/select-role" replace />;
}

export default function App() {
  const context = useAcademy();

  const { 
    isOffline = false, 
    updateAvailable = false, 
    handleReload,
    isUpgradeModalOpen = false,
    closeUpgradeModal,
    academy,
    tierConfig,
    navigateToSubscription 
  } = context || {};

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
          {/* 1. المسار الرئيسي المعتمد على الـ slug */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* 2. جذر الموقع / يحيلك إلى slug الأكاديمية بدلاً من كسر ProtectedRoute */}
          <Route path="/" element={<IndexRedirect />} />

          {/* 3. إعادة التوجيه للرئيسية لأي مسار غير معرّف */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  );
}
