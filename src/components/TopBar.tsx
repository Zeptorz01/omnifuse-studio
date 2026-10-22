import React from 'react';
import { BrandIcon } from './BrandIcon';
import { ThemeIcon, ThemeIconRole } from './ThemeIcon';
import { StudioAppIconId, StudioThemeId } from '../types/merger';

export type WorkspaceTab = 'workspace' | 'composer' | 'presets' | 'history';
export type ActiveTab = WorkspaceTab;

interface TopBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onTriggerMerge: () => void;
  onOpenSettings: () => void;
  activeThemeId: StudioThemeId;
  appIconId: StudioAppIconId;
  canMerge: boolean;
  isMerging: boolean;
  fileCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onTriggerMerge,
  onOpenSettings,
  activeThemeId,
  appIconId,
  canMerge,
  isMerging,
  fileCount,
}) => {
  const navItems: { id: WorkspaceTab; label: string; role: ThemeIconRole }[] = [
    { id: 'workspace', label: 'Merge Queue', role: 'queue' },
    { id: 'composer', label: 'Page Composer', role: 'composer' },
    { id: 'presets', label: 'Presets', role: 'presets' },
    { id: 'history', label: 'Export History', role: 'history' },
  ];

  return (
    <header className="sticky top-0 z-40 h-13 bg-white border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-5 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Identity with Fixed App Icon (Changeable in Theme Menu) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <BrandIcon appIconId={appIconId} className="w-6 h-6 shrink-0" />
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-900">
              OmniFuse Studio
            </span>
            <span className="hidden lg:inline text-xs text-zinc-500">
              Document & Image Merger
            </span>
          </div>
        </div>

        {/* Zone 2: Section Navigation with Theme-Reactive Section Icons */}
        <nav
          aria-label="Primary Workspace Navigation"
          className="flex items-center gap-1 p-0.5 bg-zinc-200/75 rounded-md overflow-x-auto max-w-full"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ThemeIcon
                  themeId={activeThemeId}
                  role={item.role}
                  className="w-3.5 h-3.5 shrink-0"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Merge CTA + Corner Settings Button (Both with Theme-Reactive Icon Designs) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onTriggerMerge}
            disabled={!canMerge || isMerging}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md active:scale-[0.98] disabled:bg-zinc-200 disabled:text-zinc-500 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed studio-accent-btn"
          >
            <ThemeIcon
              themeId={activeThemeId}
              role="merge"
              className="w-4 h-4 shrink-0"
            />
            <span>
              {isMerging
                ? 'Merging...'
                : fileCount > 0
                ? `Merge ${fileCount} ${fileCount === 1 ? 'File' : 'Files'}`
                : 'Merge Files'}
            </span>
          </button>

          {/* Corner Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open Studio Settings, Dark Mode, Themes and How to Use Guide"
            title="Settings, Themes, Dark Mode & How to Use Guide"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ThemeIcon
              themeId={activeThemeId}
              role="settings"
              className="w-4 h-4 shrink-0"
            />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
