import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Bell, Globe, User } from 'lucide-react';

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // خريطة الربط بين المسار ومفتاح الترجمات
  const pathToTranslationKey = {
    '/dashboard': 'nav.dashboard',
    '/realtime-audit': 'nav.realtime-audit',
    '/omnichannel-hub': 'nav.omnichannel-hub',
    '/reports': 'nav.reports',
    '/students': 'nav.students',
    '/teachers': 'nav.teachers',
    '/halaqas': 'nav.halaqas',
    '/attendance': 'nav.attendance',
    '/exams': 'nav.exams',
    '/guardian-portal': 'nav.guardian-portal',
    '/gamification-streaks': 'nav.gamification-streaks',
    '/payments': 'nav.payments',
    '/asset-management': 'nav.asset-management',
    '/referrals': 'nav.referrals',
    '/settings': 'nav.settings',
    '/profile': 'nav.profile',
  };

  // إيجاد المفتاح المترجم مع احتياطي افتراضي
  const currentKey = pathToTranslationKey[location.pathname] || 'nav.dashboard';
  const pageTitle = t(currentKey);

  // دالة التبديل بين اللغات
  const toggleLanguage = () => {
    const nextLng = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* 1. Page Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">
          {pageTitle}
        </h2>
      </div>

      {/* 2. Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar - استخدام الخصائص المنطقية للاتجاهات تلقائياً */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-700 text-xs rounded-lg py-2 ps-9 pe-3 border border-transparent focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
          title="Switch Language / تغيير اللغة"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          title={t('notifications.title')}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-start">
            <div className="text-xs font-bold text-slate-800">د. محمد</div>
            <div className="text-[10px] text-slate-400">{t('header.admin')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
