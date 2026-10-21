import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  FilePlus2,
  FolderOpen,
  Layers,
  Maximize2,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { ActiveTab, TopBar } from './components/TopBar';
import { FileQueuePanel } from './components/FileQueuePanel';
import { SettingsAndPreviewPanel } from './components/SettingsAndPreviewPanel';
import { NoteComposerModal } from './components/NoteComposerModal';
import { ExportResultModal } from './components/ExportResultModal';
import { QuickLookModal } from './components/QuickLookModal';
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
  const [activePreviewPageIndex, setActivePreviewPageIndex] = useState<number>(0);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isQuickLookOpen, setIsQuickLookOpen] = useState(false);
  const [latestExportResult, setLatestExportResult] = useState<ExportHistoryItem | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [statusBanner, setStatusBanner] = useState<string>('');

  const handleLoadSampleBundle = useCallback(async () => {
    const sampleItems = await createSampleBundle();
    setItems(sampleItems);
    setSelectedItemId(sampleItems[0]?.id ?? null);
    setActivePreviewPageIndex(0);
    setStatusBanner('Loaded 4 sample files into queue.');
  }, []);

  useEffect(() => {
    handleLoadSampleBundle();
  }, [handleLoadSampleBundle]);

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

  // Compute starting preview page index for a given item ID
  const getPreviewPageIndexForItem = useCallback(
    (targetId: string): number => {
      if (
        settings.outputFormat === 'stitched-png' ||
        settings.outputFormat === 'stitched-jpeg'
      ) {
        return 0;
      }
      let pageOffset = settings.includeTableOfContents ? 1 : 0;
      for (const item of items) {
        if (item.id === targetId) {
          return pageOffset;
        }
        const selectedPages = parsePageRange(item.pageRange, item.pageCount);
        pageOffset += Math.min(selectedPages.length, 3);
      }
      return 0;
    },
    [items, settings.outputFormat, settings.includeTableOfContents]
  );

  const handleSelectItem = useCallback(
    (id: string) => {
      setSelectedItemId(id);
      const sheetIdx = getPreviewPageIndexForItem(id);
      setActivePreviewPageIndex(sheetIdx);
    },
    [getPreviewPageIndexForItem]
  );

  const handleOpenQuickLookForItem = useCallback(
    (id: string) => {
      setSelectedItemId(id);
      const sheetIdx = getPreviewPageIndexForItem(id);
      setActivePreviewPageIndex(sheetIdx);
      setIsQuickLookOpen(true);
    },
    [getPreviewPageIndexForItem]
  );

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

  const handleReorderByIndex = useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => moveQueueItem(prev, fromIndex, toIndex));
    setStatusBanner(`Moved file from position #${fromIndex + 1} to #${toIndex + 1}.`);
  }, []);

  const handleRotateItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: rotateClockwise(item.rotation) } : item
      )
    );
  }, []);

  const handleRenameItem = useCallback((id: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
    setStatusBanner(`Renamed file to "${newName}".`);
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
    setStatusBanner(`Applied "${preset.name}" preset.`);
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

  // Desktop keyboard shortcuts (R to rotate selected file)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey && selectedItemId) {
        e.preventDefault();
        handleRotateItem(selectedItemId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedItemId, handleRotateItem]);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId),
    [items, selectedItemId]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F5] text-zinc-900">
      {/* 3-Zone Top Bar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTriggerMerge={handleExecuteMerge}
        canMerge={items.length > 0}
        isMerging={isMerging}
        fileCount={items.length}
      />

      {/* Compact Desktop Summary Strip */}
      <div
        role="region"
        aria-label="Workspace Summary Metrics"
        className="bg-white border-b border-zinc-200"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 font-mono tabular-nums">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-zinc-900">
              {metrics.totalFiles} {metrics.totalFiles === 1 ? 'File' : 'Files'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {metrics.categoryCounts.pdf} PDF, {metrics.categoryCounts.image} IMG,{' '}
              {metrics.categoryCounts.text} TXT
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-zinc-900">
              {settings.outputFormat === 'stitched-png' ||
              settings.outputFormat === 'stitched-jpeg'
                ? '1 Continuous Strip'
                : `${metrics.totalSelectedPages} Output Sheets`}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatFileSize(metrics.totalSizeBytes)}</span>
            <span aria-hidden="true">·</span>
            <span>
              Target: {settings.outputFormat.toUpperCase()} ({settings.pageSize.toUpperCase()})
            </span>
          </div>

          <span className="font-sans text-zinc-500 truncate max-w-md">
            {statusBanner || 'Ready to combine documents and images'}
          </span>
        </div>
      </div>

      {/* Main Desktop Workspace Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-5 py-4">
        {activeTab === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8">
              <FileQueuePanel
                items={items}
                filteredItems={filteredItems}
                selectedItemId={selectedItemId}
                onSelectItem={handleSelectItem}
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
                onReorderByIndex={handleReorderByIndex}
                onRotateItem={handleRotateItem}
                onDuplicateItem={handleDuplicateItem}
                onRemoveItem={handleRemoveItem}
                onRenameItem={handleRenameItem}
                onUpdatePageRange={handleUpdatePageRange}
                onUpdateFitMode={handleUpdateFitMode}
                onSortQueue={handleSortQueue}
                onOpenQuickLook={handleOpenQuickLookForItem}
              />
            </div>

            <div className="lg:col-span-4">
              <SettingsAndPreviewPanel
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                previewPages={previewPages}
                activePreviewPageIndex={activePreviewPageIndex}
                onChangePreviewPageIndex={setActivePreviewPageIndex}
                onOpenQuickLookAtCurrentPage={() => setIsQuickLookOpen(true)}
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
            className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3.5">
              <div>
                <h1 className="text-sm font-bold text-zinc-900">
                  Visual Page Composer & Sheet Lightbox
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Inspect all {previewPages.length} compiled output sheets side-by-side and fine-tune item orientation or order before exporting.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded cursor-pointer"
                >
                  <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Insert Text Page</span>
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMerge}
                  disabled={items.length === 0 || isMerging}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Export Unified File</span>
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center">
                <Layers className="w-7 h-7 text-zinc-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-xs font-medium text-zinc-700">
                  No files in the composer queue
                </p>
                <button
                  type="button"
                  onClick={handleLoadSampleBundle}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded cursor-pointer"
                >
                  Load Sample Bundle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item, idx) => {
                  const selectedPages = parsePageRange(item.pageRange, item.pageCount);
                  return (
                    <div
                      key={item.id}
                      className="border border-zinc-200 rounded-md overflow-hidden flex flex-col bg-zinc-50/50"
                    >
                      <div className="h-44 bg-zinc-100 border-b border-zinc-200 flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={item.thumbnailDataUrl}
                          alt={`Sheet preview for ${item.name}`}
                          referrerPolicy="no-referrer"
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                          className="max-h-full max-w-full object-contain bg-white shadow-2xs transition-transform duration-150"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5 bg-white">
                        <div>
                          <p className="text-[11px] font-mono text-zinc-500 tabular-nums">
                            Sequence #{String(idx + 1).padStart(2, '0')} · {item.extension} ·{' '}
                            {selectedPages.length}p
                          </p>
                          <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5">
                            {item.name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickLookForItem(item.id)}
                              aria-label={`Inspect '${item.name}' in Quick-Look`}
                              className="p-1 text-zinc-600 hover:text-zinc-900 rounded cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(idx, 'up')}
                              disabled={idx <= 0}
                              aria-label={`Move '${item.name}' earlier`}
                              className="p-1 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(idx, 'down')}
                              disabled={idx >= items.length - 1}
                              aria-label={`Move '${item.name}' later`}
                              className="p-1 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRotateItem(item.id)}
                              aria-label={`Rotate '${item.name}' 90 degrees`}
                              className="p-1 text-zinc-600 hover:text-zinc-900 rounded cursor-pointer"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label={`Remove '${item.name}'`}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
            className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4"
          >
            <div className="border-b border-zinc-200 pb-3.5">
              <h1 className="text-sm font-bold text-zinc-900">
                One-Click Conversion & Packaging Presets
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Select a domain workflow profile to configure target format, page geometry, margins, cover index, and watermarks automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WORKSPACE_PRESETS.map((preset, idx) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`flex flex-col justify-between p-4 border rounded-lg transition-colors ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-50/80'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-zinc-500 tabular-nums">
                          0{idx + 1}. {preset.settings.outputFormat?.toUpperCase() || 'PDF'}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            Active Profile
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-bold text-zinc-900 mt-1">
                        {preset.name}
                      </h2>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-500 mt-2.5">
                        Best for: {preset.targetUse}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyPreset(preset);
                          setActiveTab('workspace');
                        }}
                        className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
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
            className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3.5">
              <div>
                <h1 className="text-sm font-bold text-zinc-900">
                  Compiled Document Export History
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Re-download or inspect any unified PDF, stitched image, or ZIP bundle compiled during this session.
                </p>
              </div>
              {exportHistory.length === 0 && items.length > 0 && (
                <button
                  type="button"
                  onClick={handleExecuteMerge}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded cursor-pointer"
                >
                  Compile Current Queue Now
                </button>
              )}
            </div>

            {exportHistory.length === 0 ? (
              <div className="py-10 text-center">
                <FolderOpen className="w-7 h-7 text-zinc-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-xs font-semibold text-zinc-800">
                  No compiled exports yet
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Click "Merge Files" in the top bar or workspace inspector to generate your first unified output file.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {exportHistory.map((exp) => (
                  <div
                    key={exp.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900 font-mono">
                        {exp.filename}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono tabular-nums mt-0.5">
                        {exp.outputFormat.toUpperCase()} · {exp.totalFiles} source files ·{' '}
                        {exp.totalPages} {exp.totalPages === 1 ? 'page' : 'pages'} ·{' '}
                        {formatFileSize(exp.sizeBytes)} · Compiled at {exp.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLatestExportResult(exp)}
                        className="px-2.5 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded cursor-pointer"
                      >
                        Inspect
                      </button>
                      <a
                        href={exp.downloadUrl}
                        download={exp.filename}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Save File</span>
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

      <QuickLookModal
        isOpen={isQuickLookOpen}
        pages={previewPages}
        pageIndex={activePreviewPageIndex}
        onChangePageIndex={setActivePreviewPageIndex}
        onClose={() => setIsQuickLookOpen(false)}
        onRotateActiveItem={
          selectedItem ? () => handleRotateItem(selectedItem.id) : undefined
        }
        activeItemName={selectedItem?.name}
      />

      <ExportResultModal
        result={latestExportResult}
        onClose={() => setLatestExportResult(null)}
      />
    </div>
  );
}
