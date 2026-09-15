// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';
import MainApp from '@/components/Main/MainApp';
import LoginPage from '@/components/Auth/LoginPage'; // تم إضافة استيراد صفحة الدخول

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
          {/* 1. مسار تسجيل الدخول الصريح لتفادي التعليق عند الخروج */}
          <Route path="/login" element={<LoginPage />} />

          {/* 2. مسار الأكاديمية المخصص مع دعم المسارات الفرعية /* */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* 3. المسار الرئيسي مع دعم المسارات الفرعية /* لتفتح جميع الشاشات */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* 4. التوجيه الاحتياطي */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GlobalErrorBoundary>
  );
}
