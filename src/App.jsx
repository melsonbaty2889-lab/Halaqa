// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';

// استدعاء MainApp مباشرة لضمان السرعة ومنع مشاكل الـ Lazy Load
import MainApp from '@/components/Main/MainApp';

export default function App() {
  const context = useAcademy();

  // 1. في حالة عدم تجهيز الـ Context أو جاري التحميل
  if (!context || context.appState === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#070C14] flex items-center justify-center font-['Cairo',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">جاري تحميل البيانات...</p>
        </div>
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
        {/* شريط الاتصال والتحديثات */}
        <OfflineAndUpdateBanner
          isOffline={isOffline}
          updateAvailable={updateAvailable}
          onReload={handleReload}
        />

        {/* نافذة الترقية */}
        <InlineUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          academyName={academy?.name}
          tierConfig={tierConfig}
          onNavigateSubscription={navigateToSubscription}
        />

        {/* المسارات المباشرة مع الحماية وإعادة التوجيه إلى Slug الأكاديمية */}
        <Routes>
          {/* 1. مسار الأكاديمية بالـ Slug المباشر */}
          <Route
            path="/:slug/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* 2. المسار الرئيسي / يقوم بالتحويل إلى رابط الأكاديمية الخاص بك تلقائياً */}
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

          {/* 3. إعادة التوجيه للرئيسية عند كتابة مسار خاطئ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GlobalErrorBoundary>
  );
}
