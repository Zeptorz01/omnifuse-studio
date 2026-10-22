import React, { useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  HelpCircle,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Sliders,
  Sun,
  X,
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { ThemeIcon, ThemeIconPackStrip } from './ThemeIcon';
import {
  MergeSettings,
  PageSizePreset,
  StudioAppIconId,
  StudioAppPreferences,
  StudioThemeId,
} from '../types/merger';
import {
  DEFAULT_STUDIO_PREFERENCES,
  MAX_QUEUE_FILES,
  STUDIO_APP_ICONS,
  STUDIO_THEMES,
  getStudioAppIconById,
} from '../utils/mergeLogic';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorial: () => void;
  preferences: StudioAppPreferences;
  onUpdatePreferences: (patch: Partial<StudioAppPreferences>) => void;
  mergeSettings: MergeSettings;
  onUpdateMergeSettings: (patch: Partial<MergeSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenTutorial,
  preferences,
  onUpdatePreferences,
  mergeSettings,
  onUpdateMergeSettings,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeAppIcon = getStudioAppIconById(preferences.appIconId);

  const handleSelectTheme = (themeId: StudioThemeId, recommendedDark?: boolean) => {
    // Switching themes strictly preserves preferences.appIconId so the app logo stays the same
    if (recommendedDark !== undefined) {
      onUpdatePreferences({
        themeId,
        darkMode: recommendedDark,
        appIconId: preferences.appIconId,
      });
    } else {
      onUpdatePreferences({
        themeId,
        appIconId: preferences.appIconId,
      });
    }
  };

  const handleSelectAppIcon = (appIconId: StudioAppIconId) => {
    onUpdatePreferences({ appIconId });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white border border-zinc-300 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Native Studio Header */}
        <div className="px-5 py-3.5 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <ThemeIcon
              themeId={preferences.themeId}
              role="settings"
              className="w-6 h-6 shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="studio-settings-title"
                className="text-sm font-bold text-zinc-900 truncate"
              >
                Studio Settings, Dark Mode, {STUDIO_THEMES.length} Themes, App Icon & Interactive Guide
              </h2>
              <p className="text-xs text-zinc-500 truncate">
                Switch Light/Dark mode, apply any of the {STUDIO_THEMES.length} theme & section icon packs (including Original OmniFuse), customize the App Logo, or launch the How-to-Use guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer studio-accent-btn"
            >
              <ThemeIcon
                themeId={preferences.themeId}
                role="guide"
                className="w-3.5 h-3.5 shrink-0"
              />
              <span>How to Use Guide</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close studio settings"
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 rounded-md transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Top Grid: Dark Mode Switcher + Interactive How-to-Use Guide Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Dark Mode Toggle Card (7 Cols) */}
            <section
              aria-label="Dark Mode and Appearance"
              className="lg:col-span-7 bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-800 shrink-0 mt-0.5">
                  {preferences.darkMode ? (
                    <Moon className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                      Dark Mode Switcher
                    </h3>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700">
                      · {preferences.darkMode ? 'Dark Mode On' : 'Light Mode On'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Toggle instant daylight paper chrome or low-glare darkroom carbon surfaces across all panels.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ darkMode: false })}
                  aria-pressed={!preferences.darkMode}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    !preferences.darkMode
                      ? 'studio-accent-btn border-transparent shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ darkMode: true })}
                  aria-pressed={preferences.darkMode}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    preferences.darkMode
                      ? 'studio-accent-btn border-transparent shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dark</span>
                </button>
              </div>
            </section>

            {/* How to Use Interactive Tutorial Launcher Card inside Settings (5 Cols) */}
            <section
              aria-label="Interactive Tutorial Guide Launcher"
              className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ThemeIcon
                      themeId={preferences.themeId}
                      role="guide"
                      className="w-4 h-4 shrink-0"
                    />
                    <span>How to Use OmniFuse</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">6 Live Labs</span>
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  Open the interactive 6-chapter mastery guide to practice page slicing, 90° rotation, watermarks, and themes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTutorial();
                }}
                className="w-full py-1.5 px-3 text-xs font-semibold bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 rounded-md flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Launch Interactive Tutorial & Theme Lab</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </section>
          </div>

          {/* Section 2: 11 Curated Studio Themes + Dedicated App Icon Changer */}
          <section aria-label="Studio Color Themes" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-zinc-700" aria-hidden="true" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  {STUDIO_THEMES.length} Studio Color Themes & Full Section Icon Packs
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Switching a theme updates section icons while keeping your App Logo fixed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {STUDIO_THEMES.map((theme) => {
                const isSelected = preferences.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id, theme.recommendedDark)}
                    aria-pressed={isSelected}
                    className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-100/95 shadow-xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <ThemeIcon
                          themeId={theme.id}
                          role="merge"
                          className="w-7 h-7 shrink-0 shadow-2xs rounded-md"
                        />
                        {isSelected ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-bold text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-400">
                            {theme.iconLabel}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-zinc-900 mt-2 truncate">
                        {theme.name}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug line-clamp-2">
                        {theme.tagline}
                      </p>
                    </div>

                    {/* Theme Icon Pack Preview + Live Color Swatch Strip */}
                    <div className="pt-2 border-t border-zinc-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500">
                          Icon Pack:
                        </span>
                        <ThemeIconPackStrip themeId={theme.id} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span
                            title="Canvas"
                            style={{ backgroundColor: theme.swatches.canvas }}
                            className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                          />
                          <span
                            title="Surface"
                            style={{ backgroundColor: theme.swatches.surface }}
                            className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                          />
                          <span
                            title="Border"
                            style={{ backgroundColor: theme.swatches.border }}
                            className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                          />
                          <span
                            title="Primary Accent"
                            style={{ backgroundColor: theme.swatches.accent }}
                            className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                          />
                        </div>
                        <span
                          style={{ color: theme.swatches.accent }}
                          className="text-[10px] font-mono font-bold uppercase"
                        >
                          Apply
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dedicated Feature to Change the App Icon in the Theme Menu */}
            <div
              aria-label="App Logo and Icon Selector"
              className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <BrandIcon appIconId={preferences.appIconId} className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                      Custom App Icon & Logo Selector
                    </h4>
                    <p className="text-[11px] text-zinc-600">
                      Your app logo stays the same when changing themes. Choose a custom App Icon below whenever you want a new studio emblem:
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-white border border-zinc-200 px-2.5 py-1 rounded">
                  Active App Icon: {activeAppIcon.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {STUDIO_APP_ICONS.map((iconOption) => {
                  const isSelected = preferences.appIconId === iconOption.id;
                  return (
                    <button
                      key={iconOption.id}
                      type="button"
                      onClick={() => handleSelectAppIcon(iconOption.id)}
                      aria-pressed={isSelected}
                      className={`p-2 rounded-md border text-left transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-zinc-900 bg-white shadow-2xs'
                          : 'border-zinc-200 bg-white/70 hover:bg-white hover:border-zinc-400'
                      }`}
                    >
                      <BrandIcon appIconId={iconOption.id} className="w-6 h-6 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-zinc-900 truncate">
                            {iconOption.name}
                          </span>
                          {isSelected && (
                            <Check
                              className="w-3 h-3 text-emerald-700 stroke-[2.5] shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 block truncate">
                          {iconOption.badgeLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3: Workspace & Compiler Preferences */}
          <section aria-label="Workspace and Compiler Preferences" className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-700" aria-hidden="true" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                Workspace Ergonomics & Compiler Defaults
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Row Density */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-zinc-900">Compact Queue Rows</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Dense layout for {MAX_QUEUE_FILES} files.
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label="Compact Queue Rows"
                  checked={preferences.compactRows}
                  onChange={(e) => onUpdatePreferences({ compactRows: e.target.checked })}
                  className="w-4 h-4 rounded accent-zinc-900 cursor-pointer shrink-0"
                />
              </div>

              {/* Auto-Open Export Dialog */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-zinc-900">Auto-Open Save Dialog</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Popup download card on merge.
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label="Auto-Open Download Dialog"
                  checked={preferences.autoOpenExportModal}
                  onChange={(e) =>
                    onUpdatePreferences({ autoOpenExportModal: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-zinc-900 cursor-pointer shrink-0"
                />
              </div>

              {/* Shortcut Hints Bar */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-zinc-900">Shortcut Hints Bar</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Show hotkeys in queue footer.
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label="Show Shortcut Hints Bar"
                  checked={preferences.showKeyboardHints}
                  onChange={(e) =>
                    onUpdatePreferences({ showKeyboardHints: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-zinc-900 cursor-pointer shrink-0"
                />
              </div>

              {/* Default Page Size */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col justify-between gap-1">
                <label
                  htmlFor="settings-default-page-size"
                  className="text-xs font-bold text-zinc-900 block"
                >
                  Default Page Geometry
                </label>
                <select
                  id="settings-default-page-size"
                  value={mergeSettings.pageSize}
                  onChange={(e) =>
                    onUpdateMergeSettings({ pageSize: e.target.value as PageSizePreset })
                  }
                  className="w-full px-2 py-1 text-xs bg-white border border-zinc-300 rounded text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="a4">ISO A4 (210×297mm)</option>
                  <option value="letter">US Letter (8.5×11in)</option>
                  <option value="legal">US Legal (8.5×14in)</option>
                  <option value="auto">Fit to Source</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-100 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onUpdatePreferences(DEFAULT_STUDIO_PREFERENCES)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Appearance to Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer studio-accent-btn"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
