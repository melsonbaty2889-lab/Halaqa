// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import GlobalErrorBoundary from '@/components/UI/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/UI/OfflineAndUpdateBanner';
import InlineUpgradeModal from '@/components/Modals/InlineUpgradeModal';
import { useAcademy } from '@/context/AcademyContext';

// استدعاء مباشر بدلاً من lazy للقطع بالإيجاب في سلامة المسار
import MainApp from '@/components/Main/MainApp';

export default function App() {
  const academyData = useAcademy() || {};

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen bg-[#070C14] text-white font-['Cairo',sans-serif]">
        <OfflineAndUpdateBanner
          isOffline={academyData.isOffline}
          updateAvailable={academyData.updateAvailable}
          onReload={academyData.handleReload}
        />

        <InlineUpgradeModal
          isOpen={academyData.isUpgradeModalOpen}
          onClose={academyData.closeUpgradeModal}
          academyName={academyData.academy?.name}
          tierConfig={academyData.tierConfig}
          onNavigateSubscription={academyData.navigateToSubscription}
        />

        <Routes>
          {/* عرض MainApp مباشرة للتأكد من تحميل الصفحة دون اعتراض من ProtectedRoute */}
          <Route path="/:slug/*" element={<MainApp />} />
          <Route path="/" element={<MainApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GlobalErrorBoundary>
  );
}
