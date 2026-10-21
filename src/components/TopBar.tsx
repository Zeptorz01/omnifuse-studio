import React from 'react';

export type ActiveTab = 'workspace' | 'composer' | 'presets' | 'history';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onTriggerMerge: () => void;
  canMerge: boolean;
  isMerging: boolean;
  fileCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onTriggerMerge,
  canMerge,
  isMerging,
  fileCount,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'composer', label: 'Page Composer' },
    { id: 'presets', label: 'Presets' },
    { id: 'history', label: 'Export History' },
  ];

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('workspace');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          OmniFuse Studio
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                  isActive
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTriggerMerge}
            disabled={!canMerge || isMerging}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            {isMerging
              ? 'Compiling Output...'
              : fileCount > 0
              ? `Merge ${fileCount} ${fileCount === 1 ? 'File' : 'Files'}`
              : 'Merge & Export'}
          </button>
        </div>
      </div>

      {/* Mobile-only navigation bar so mobile viewports never clip nav buttons */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-around border-t border-slate-100 px-3 py-2 bg-slate-50/60 overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
