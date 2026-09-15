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
          {/* 1. مسار الأكاديمية بالـ Slug */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* 2. المسار الرئيسي: التوجيه لأكاديمية المستخدم إن وجدت أو صفحة اختيار الأكاديمية */}
          <Route
            path="/"
            element={
              academy?.slug ? (
                <Navigate to={`/${academy.slug}`} replace />
              ) : (
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              )
            }
          />

          {/* 3. أي مسار غير معروف يتم إعادة توجيهه للرئيسية */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  );
}
