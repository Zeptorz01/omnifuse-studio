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
    <header className="bg-zinc-100 border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-5 py-2.5">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('workspace');
          }}
          className="text-sm font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          OmniFuse Studio
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
                  isActive
                    ? 'border-zinc-900 text-zinc-900 font-semibold'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
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
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-md hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            {isMerging
              ? 'Compiling...'
              : fileCount > 0
              ? `Merge ${fileCount} ${fileCount === 1 ? 'File' : 'Files'}`
              : 'Merge & Export'}
          </button>
        </div>
      </div>

      {/* Mobile-only navigation bar */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-around border-t border-zinc-200 px-3 py-1.5 bg-zinc-50 overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-2.5 py-1 text-xs rounded whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
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
