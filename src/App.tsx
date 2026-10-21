import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  FilePlus2,
  FolderOpen,
  Layers,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { ActiveTab, TopBar } from './components/TopBar';
import { FileQueuePanel } from './components/FileQueuePanel';
import { SettingsAndPreviewPanel } from './components/SettingsAndPreviewPanel';
import { NoteComposerModal } from './components/NoteComposerModal';
import { ExportResultModal } from './components/ExportResultModal';
import {
  ExportHistoryItem,
  FileCategory,
  ImageFitMode,
  MergeFileItem,
  MergeSettings,
  WorkspacePreset,
} from './types/merger';
import {
  DEFAULT_MERGE_SETTINGS,
  WORKSPACE_PRESETS,
  calculateQueueMetrics,
  filterQueueItems,
  formatFileSize,
  moveQueueItem,
  parsePageRange,
  rotateClockwise,
  sortQueueItems,
} from './utils/mergeLogic';
import {
  createCustomTextDocumentItem,
  createSampleBundle,
  executeUnifiedMerge,
  parseUploadedFile,
  renderCompositePreviewPages,
} from './utils/documentEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');
  const [items, setItems] = useState<MergeFileItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FileCategory>('all');
  const [settings, setSettings] = useState<MergeSettings>(DEFAULT_MERGE_SETTINGS);
  const [activePresetId, setActivePresetId] = useState<string>('binder-pdf');

  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [latestExportResult, setLatestExportResult] = useState<ExportHistoryItem | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [statusBanner, setStatusBanner] = useState<string>('');

  // Load initial sample bundle on first mount so journeys work out-of-the-box
  const handleLoadSampleBundle = useCallback(async () => {
    const sampleItems = await createSampleBundle();
    setItems(sampleItems);
    setSelectedItemId(sampleItems[0]?.id ?? null);
    setStatusBanner('Loaded 4 sample files (PDF + JPG + PNG + Markdown) into queue.');
  }, []);

  useEffect(() => {
    handleLoadSampleBundle();
  }, [handleLoadSampleBundle]);

  // Re-render live preview pages whenever queue or settings change
  useEffect(() => {
    let cancelled = false;
    if (items.length === 0) {
      setPreviewPages([]);
      return;
    }
    setIsRenderingPreview(true);
    renderCompositePreviewPages(items, settings)
      .then((pages) => {
        if (!cancelled) {
          setPreviewPages(pages);
          setIsRenderingPreview(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsRenderingPreview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [items, settings]);

  const filteredItems = useMemo(
    () => filterQueueItems(items, searchQuery, categoryFilter),
    [items, searchQuery, categoryFilter]
  );

  const metrics = useMemo(
    () => calculateQueueMetrics(items, settings.includeTableOfContents),
    [items, settings.includeTableOfContents]
  );

  const handleUpdateSettings = useCallback((patch: Partial<MergeSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleAddFiles = useCallback(async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    if (arr.length === 0) return;
    const parsed: MergeFileItem[] = [];
    for (const f of arr) {
      try {
        const item = await parseUploadedFile(f);
        parsed.push(item);
      } catch {
        // Ignore unreadable file
      }
    }
    if (parsed.length > 0) {
      setItems((prev) => [...prev, ...parsed]);
      setSelectedItemId(parsed[0].id);
      setStatusBanner(`Added ${parsed.length} ${parsed.length === 1 ? 'file' : 'files'} to queue.`);
    }
  }, []);

  const handleAddCustomNote = useCallback((title: string, content: string) => {
    const newItem = createCustomTextDocumentItem(title, content);
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    setStatusBanner(`Added formatted text page "${newItem.name}" to queue.`);
  }, []);

  const handleMoveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setItems((prev) => moveQueueItem(prev, index, targetIndex));
  }, []);

  const handleRotateItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: rotateClockwise(item.rotation) } : item
      )
    );
  }, []);

  const handleDuplicateItem = useCallback((id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const copy: MergeFileItem = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        name: `Copy_of_${source.name}`,
        addedAt: Date.now(),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemId((prevId) => (prevId === id ? null : prevId));
  }, []);

  const handleUpdatePageRange = useCallback((id: string, pageRange: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pageRange } : item))
    );
  }, []);

  const handleUpdateFitMode = useCallback((id: string, fitMode: ImageFitMode) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, fitMode } : item))
    );
  }, []);

  const handleSortQueue = useCallback((by: 'name' | 'size' | 'type' | 'pages') => {
    setItems((prev) => sortQueueItems(prev, by));
    setStatusBanner(`Sorted queue by ${by}.`);
  }, []);

  const handleApplyPreset = useCallback((preset: WorkspacePreset) => {
    setActivePresetId(preset.id);
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    setStatusBanner(`Applied "${preset.name}" preset configuration.`);
  }, []);

  const handleExecuteMerge = useCallback(async () => {
    if (items.length === 0 || isMerging) return;
    setIsMerging(true);
    try {
      const res = await executeUnifiedMerge(items, settings);
      const historyItem: ExportHistoryItem = {
        id: `exp-${Date.now()}`,
        filename: res.filename,
        outputFormat: settings.outputFormat,
        totalFiles: items.length,
        totalPages: res.totalPages,
        sizeBytes: res.sizeBytes,
        createdAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        downloadUrl: res.downloadUrl,
        previewPages: res.previewPages,
      };
      setExportHistory((prev) => [historyItem, ...prev]);
      setLatestExportResult(historyItem);
      setStatusBanner(
        `Compiled ${items.length} files into "${res.filename}" (${formatFileSize(res.sizeBytes)}).`
      );
    } finally {
      setIsMerging(false);
    }
  }, [items, settings, isMerging]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Bar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTriggerMerge={handleExecuteMerge}
        canMerge={items.length > 0}
        isMerging={isMerging}
        fileCount={items.length}
      />

      {/* Main Desktop Workspace Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 space-y-6">
        {/* Summary Metrics Strip */}
        <section
          aria-label="Workspace Summary Metrics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500">Queued Source Files</p>
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {metrics.totalFiles}
            </p>
            <p className="text-xs text-slate-500 font-mono tabular-nums mt-1">
              {metrics.categoryCounts.pdf} PDF · {metrics.categoryCounts.image} IMG ·{' '}
              {metrics.categoryCounts.text} TXT
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500">Compiled Sheet Count</p>
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {settings.outputFormat === 'stitched-png' ||
              settings.outputFormat === 'stitched-jpeg'
                ? '1 Continuous'
                : `${metrics.totalSelectedPages} Pages`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {settings.includeTableOfContents
                ? 'Includes Table of Contents cover'
                : 'Direct sequential page stream'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500">Combined Input Payload</p>
            <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {formatFileSize(metrics.totalSizeBytes)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              100% local client-side compilation
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500">Target Output Specification</p>
            <p className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1 truncate">
              {settings.outputFormat.toUpperCase()} · {settings.pageSize.toUpperCase()}
            </p>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {statusBanner || 'Ready to combine documents and images'}
            </p>
          </div>
        </section>

        {/* Active Tab Router */}
        {activeTab === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <FileQueuePanel
                items={items}
                filteredItems={filteredItems}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                onAddFiles={handleAddFiles}
                onLoadSampleBundle={handleLoadSampleBundle}
                onOpenNoteModal={() => setIsNoteModalOpen(true)}
                onClearAll={() => {
                  setItems([]);
                  setSelectedItemId(null);
                  setStatusBanner('Cleared all files from queue.');
                }}
                onMoveItem={handleMoveItem}
                onRotateItem={handleRotateItem}
                onDuplicateItem={handleDuplicateItem}
                onRemoveItem={handleRemoveItem}
                onUpdatePageRange={handleUpdatePageRange}
                onUpdateFitMode={handleUpdateFitMode}
                onSortQueue={handleSortQueue}
              />
            </div>

            <div className="lg:col-span-4">
              <SettingsAndPreviewPanel
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                previewPages={previewPages}
                isRenderingPreview={isRenderingPreview}
                totalFiles={metrics.totalFiles}
                totalSelectedPages={metrics.totalSelectedPages}
                totalSizeBytes={metrics.totalSizeBytes}
                onExecuteMerge={handleExecuteMerge}
                isMerging={isMerging}
              />
            </div>
          </div>
        )}

        {activeTab === 'composer' && (
          <section
            aria-label="Visual Page Composer and Sheet Lightbox"
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Visual Page Composer & Sheet Lightbox
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect all {previewPages.length} compiled output sheets side-by-side and fine-tune item orientation or order before exporting.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Insert Text Page</span>
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMerge}
                  disabled={items.length === 0 || isMerging}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Export Unified File</span>
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-16 text-center">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-700">
                  No files in the composer queue
                </p>
                <button
                  type="button"
                  onClick={handleLoadSampleBundle}
                  className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg cursor-pointer"
                >
                  Load Sample Bundle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.map((item, idx) => {
                  const selectedPages = parsePageRange(item.pageRange, item.pageCount);
                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-slate-50/50"
                    >
                      <div className="h-56 bg-slate-100 border-b border-slate-200 flex items-center justify-center p-4 overflow-hidden">
                        <img
                          src={item.thumbnailDataUrl}
                          alt={`Sheet preview for ${item.name}`}
                          referrerPolicy="no-referrer"
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                          className="max-h-full max-w-full object-contain bg-white shadow-xs transition-transform duration-150"
                        />
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 bg-white">
                        <div>
                          <p className="text-xs font-mono text-slate-500 tabular-nums">
                            Sequence #{String(idx + 1).padStart(2, '0')} · {item.extension} ·{' '}
                            {selectedPages.length}p
                          </p>
                          <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                            {item.name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveItem(idx, 'up')}
                              disabled={idx <= 0}
                              aria-label={`Move '${item.name}' earlier`}
                              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(idx, 'down')}
                              disabled={idx >= items.length - 1}
                              aria-label={`Move '${item.name}' later`}
                              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRotateItem(item.id)}
                              aria-label={`Rotate '${item.name}' 90 degrees`}
                              className="p-1.5 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label={`Remove '${item.name}'`}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'presets' && (
          <section
            aria-label="Document Conversion Presets"
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
          >
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-lg font-bold text-slate-900">
                One-Click Conversion & Packaging Presets
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a domain workflow profile to configure target format, page geometry, margins, cover index, and watermarks automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {WORKSPACE_PRESETS.map((preset, idx) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`flex flex-col justify-between p-5 border rounded-xl transition-colors ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50/80'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                          0{idx + 1}. {preset.settings.outputFormat?.toUpperCase() || 'PDF'}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            Active Profile
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-slate-900 mt-1.5">
                        {preset.name}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {preset.description}
                      </p>
                      <p className="text-xs font-mono text-slate-500 mt-3">
                        Best for: {preset.targetUse}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyPreset(preset);
                          setActiveTab('workspace');
                        }}
                        className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Apply Preset & Open Workspace
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section
            aria-label="Session Export History"
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Compiled Document Export History
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Re-download or inspect any unified PDF, stitched image, or ZIP bundle compiled during this session.
                </p>
              </div>
              {exportHistory.length === 0 && items.length > 0 && (
                <button
                  type="button"
                  onClick={handleExecuteMerge}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Compile Current Queue Now
                </button>
              )}
            </div>

            {exportHistory.length === 0 ? (
              <div className="py-14 text-center">
                <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-800">
                  No compiled exports yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Click "Merge Files" in the top bar or workspace inspector to generate your first unified output file.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {exportHistory.map((exp) => (
                  <div
                    key={exp.id}
                    className="py-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {exp.filename}
                      </p>
                      <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                        {exp.outputFormat.toUpperCase()} · {exp.totalFiles} source files ·{' '}
                        {exp.totalPages} {exp.totalPages === 1 ? 'page' : 'pages'} ·{' '}
                        {formatFileSize(exp.sizeBytes)} · Compiled at {exp.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLatestExportResult(exp)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Inspect Sheets
                      </button>
                      <a
                        href={exp.downloadUrl}
                        download={exp.filename}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modals */}
      <NoteComposerModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onAddNote={handleAddCustomNote}
      />

      <ExportResultModal
        result={latestExportResult}
        onClose={() => setLatestExportResult(null)}
      />
    </div>
  );
}
