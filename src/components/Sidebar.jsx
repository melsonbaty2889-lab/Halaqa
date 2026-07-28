import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaTachometerAlt,
  FaHistory,
  FaComments,
  FaChartBar,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaQuran,
  FaClipboardCheck,
  FaGraduationCap,
  FaUsers,
  FaMedal,
  FaCreditCard,
  FaFolder,
  FaShareAlt,
  FaCogs,
  FaUser
} from 'react-icons/fa';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  // عناصر الملاحة مع الأيقونات والمفاتيح المعتمدة في ملفات الترجمة
  const navSections = [
    {
      titleKey: 'sidebar.sections.ops',
      items: [
        { key: 'dashboard', path: '/dashboard', icon: FaTachometerAlt },
        { key: 'realtime-audit', path: '/realtime-audit', icon: FaHistory },
        { key: 'communication-hub', path: '/communication-hub', icon: FaComments },
        { key: 'reports', path: '/reports', icon: FaChartBar },
      ],
    },
    {
      titleKey: 'sidebar.sections.academic',
      items: [
        { key: 'students', path: '/students', icon: FaUserGrad },
        { key: 'teachers', path: '/teachers', icon: FaChalkboardTeacher },
        { key: 'halaqas', path: '/halaqas', icon: FaQuran },
        { key: 'attendance', path: '/attendance', icon: FaClipboardCheck },
        { key: 'exams', path: '/exams', icon: FaGraduationCap },
      ],
    },
    {
      titleKey: 'sidebar.sections.community',
      items: [
        { key: 'guardian-portal', path: '/guardian-portal', icon: FaUsers },
        { key: 'gamification-streaks', path: '/gamification-streaks', icon: FaMedal },
        { key: 'referrals', path: '/referrals', icon: FaShareAlt },
      ],
    },
    {
      titleKey: 'sidebar.sections.governance',
      items: [
        { key: 'payments', path: '/payments', icon: FaCreditCard },
        { key: 'asset-management', path: '/asset-management', icon: FaFolder },
        { key: 'settings', path: '/settings', icon: FaCogs },
        { key: 'profile', path: '/profile', icon: FaUser },
      ],
    },
  ];

  return (
    <>
      {/* خلفية معتمة للهواتف عند فتح السايدبار */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        style={{
          backgroundColor: '#0b1329',
          borderLeft: isAr ? '1px solid #1e293b' : 'none',
          borderRight: !isAr ? '1px solid #1e293b' : 'none',
        }}
        className={`fixed top-0 bottom-0 z-50 flex w-64 flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isAr
            ? sidebarOpen ? 'right-0 translate-x-0' : 'right-0 translate-x-full'
            : sidebarOpen ? 'left-0 translate-x-0' : 'left-0 -translate-x-full'
        }`}
      >
        {/* الشعار وعنوان الأكاديمية */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold text-xl border border-amber-500/20">
              🕌
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {t('brand.title', 'Smart Halaqa')}
              </h2>
              <p className="text-[10px] text-slate-400">
                {t('brand.subtitle', 'Halaqas Management')}
              </p>
            </div>
          </div>
        </div>

        {/* قائمة الأقسام والصفحات */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* عنوان القسم */}
              <h3 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {t(section.titleKey)}
              </h3>

              {/* عناصر القسم */}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{t(`nav.${item.key}`)}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* أسفل السايدبار (حالة المزامنة والاشتراك) */}
        <div className="border-t border-slate-800 p-3">
          <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-300">
                {t('sidebar.cloudSync', 'Cloud Synchronized')}
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
              v2.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
