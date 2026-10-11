import React from 'react';

export type NavTab = 'home' | 'match' | 'learn' | 'profile';

export interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: {
    match?: number;
    learn?: number;
  };
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  unreadCount,
  className = ''
}) => {
  const tabs: { id: NavTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => (
        <svg
          className="w-5 h-5"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      )
    },
    {
      id: 'match',
      label: 'Match',
      icon: (active) => (
        <svg
          className="w-5 h-5"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: (active) => (
        <svg
          className="w-5 h-5"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (active) => (
        <svg
          className="w-5 h-5"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )
    }
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F3] px-4 py-2 sm:py-3 max-w-md mx-auto sm:max-w-xl transition-all ${className}`}
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const badgeCount =
            tab.id === 'match'
              ? unreadCount?.match
              : tab.id === 'learn'
              ? unreadCount?.learn
              : undefined;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-[#2F5BFF] focus:ring-offset-2 rounded-xl ${
                isActive ? 'text-[#2F5BFF]' : 'text-[#64748B] hover:text-[#0F1B3D]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                {tab.icon(isActive)}
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-[#E5484D] text-white text-[9px] font-bold leading-tight">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium mt-1 leading-tight ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
