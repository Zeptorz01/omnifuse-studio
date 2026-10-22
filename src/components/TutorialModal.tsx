import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Moon,
  Palette,
  Pencil,
  RotateCw,
  Scissors,
  Settings,
  Sliders,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { ThemeIcon } from './ThemeIcon';
import {
  MAX_QUEUE_FILES,
  STUDIO_THEMES,
  WORKSPACE_PRESETS,
  calculateImageFitRect,
  calculatePageDimensions,
  getMarginPoints,
  parsePageRange,
  rotateClockwise,
} from '../utils/mergeLogic';
import {
  ImageFitMode,
  MarginPreset,
  OutputFormat,
  PageOrientation,
  PageSizePreset,
  RotationAngle,
  StudioAppPreferences,
  StudioThemeId,
  WorkspacePreset,
} from '../types/merger';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onLoadExtendedBatch: () => void;
  onLoadSampleBundle: () => void;
  onTriggerMerge: () => void;
  onSwitchToComposer: () => void;
  onApplyPreset: (preset: WorkspacePreset) => void;
  preferences: StudioAppPreferences;
  onUpdatePreferences: (patch: Partial<StudioAppPreferences>) => void;
  currentFileCount: number;
  currentTotalPages: number;
}

interface FormatSpec {
  id: string;
  ext: string;
  category: string;
  title: string;
  pipeline: string;
  pageLimit: string;
  resolution: string;
  details: string;
}

const FORMAT_SPECS: FormatSpec[] = [
  {
    id: 'pdf',
    ext: '.PDF',
    category: 'Vector & Multi-Page Document',
    title: 'Native PDF Stream Parser (pdf-lib)',
    pipeline: 'Direct vector page extraction & lossless sheet embedding',
    pageLimit: 'Unlimited pages per PDF file (1 to 500+ pages)',
    resolution: 'Vector native (72–300 DPI preserved)',
    details:
      'Extracts every page (or your custom sliced range like "1-4, 7" or "odd") without rasterizing vector text, then stamps optional page numbers and watermarks.',
  },
  {
    id: 'raster',
    ext: '.JPG / .PNG / .WEBP',
    category: 'High-Resolution Raster Scans & Photos',
    title: 'Adaptive Aspect-Ratio Canvas Engine',
    pipeline: 'EXIF-aware rotation + Fit/Fill/Original bounding box placement',
    pageLimit: '1 sheet per image (up to 50 files per batch)',
    resolution: 'Up to 4K source dimensions preserved',
    details:
      'Automatically centers photos, receipts, and blueprints inside your target page margins using Contain (Fit Page), Cover (Fill Page), or 1:1 Original Ratio.',
  },
  {
    id: 'text',
    ext: '.MD / .TXT / .LOG',
    category: 'Formatted Notes & Documentation',
    title: 'Automated Typesetting & Pagination Engine',
    pipeline: 'Monospace & editorial line-wrapping across multi-page sheets',
    pageLimit: 'Unlimited auto-paginated sheets',
    resolution: 'Crisp vector typography',
    details:
      'Converts Markdown notes, handover checklists, and logs into clean, bordered document pages—or lets you author new divider pages directly in the studio.',
  },
  {
    id: 'data',
    ext: '.CSV / .JSON / .SVG',
    category: 'Structured Tables & Vector Diagrams',
    title: 'Structured Data & Vector Sheet Renderer',
    pipeline: 'Tabular grid alignment & scalable vector rasterization',
    pageLimit: 'Unlimited rows / pages',
    resolution: 'Lossless vector & tabular alignment',
    details:
      'Formats structured CSV rows, JSON payloads, and SVG schematics into readable technical sheets ready to bind alongside PDFs and images.',
  },
];

interface DemoQueueRow {
  id: string;
  name: string;
  ext: string;
  totalPages: number;
  pageRange: string;
  sizeLabel: string;
  rotation: RotationAngle;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onLoadExtendedBatch,
  onLoadSampleBundle,
  onTriggerMerge,
  onSwitchToComposer,
  onApplyPreset,
  preferences,
  onUpdatePreferences,
  currentFileCount,
  currentTotalPages,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);

  // Step 1 Interactive State: Format Inspector & Simulated Queue Counter
  const [selectedFormatId, setSelectedFormatId] = useState<string>('pdf');
  const [simulatedFileCount, setSimulatedFileCount] = useState<number>(currentFileCount || 12);

  // Step 2 Interactive State: Replica Queue Rows with Reorder, Rename & Page Slicing
  const [demoRows, setDemoRows] = useState<DemoQueueRow[]>([
    {
      id: 'd1',
      name: '01_Master_Service_Contract.pdf',
      ext: 'PDF',
      totalPages: 8,
      pageRange: '1-3, 5, 8',
      sizeLabel: '412.4 KB',
      rotation: 0,
    },
    {
      id: 'd2',
      name: '02_Cleanroom_Floorplan_RevC.jpg',
      ext: 'JPG',
      totalPages: 1,
      pageRange: 'all',
      sizeLabel: '184.0 KB',
      rotation: 0,
    },
    {
      id: 'd3',
      name: '03_ISO_Audit_Addendum.pdf',
      ext: 'PDF',
      totalPages: 6,
      pageRange: 'all',
      sizeLabel: '295.8 KB',
      rotation: 0,
    },
  ]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowName, setEditingRowName] = useState<string>('');

  // Step 3 Interactive State: Rotation, Image Fit, Page Size, Orientation & Margins
  const [sandboxRotation, setSandboxRotation] = useState<RotationAngle>(0);
  const [sandboxFit, setSandboxFit] = useState<ImageFitMode>('contain');
  const [sandboxPageSize, setSandboxPageSize] = useState<PageSizePreset>('a4');
  const [sandboxOrientation, setSandboxOrientation] = useState<PageOrientation>('portrait');
  const [sandboxMargin, setSandboxMargin] = useState<MarginPreset>('standard');

  // Step 4 Interactive State: Live Preview Inspector Replica (TOC, Page Numbers, Watermark)
  const [sandboxIncludeToc, setSandboxIncludeToc] = useState<boolean>(true);
  const [sandboxPageNumbers, setSandboxPageNumbers] = useState<boolean>(true);
  const [sandboxWatermark, setSandboxWatermark] = useState<string>('CONFIDENTIAL AUDIT');
  const [sandboxSheetIdx, setSandboxSheetIdx] = useState<number>(0);

  // Step 5 Interactive State: Output Format & Preset Explorer
  const [sandboxOutputFormat, setSandboxOutputFormat] = useState<OutputFormat>('pdf');

  useEffect(() => {
    setSimulatedFileCount(currentFileCount || 12);
  }, [currentFileCount]);

  const goToStep = (idx: number) => {
    const clamped = Math.max(0, Math.min(5, idx));
    setActiveStepIndex(clamped);
    setVisitedSteps((prev) => (prev.includes(clamped) ? prev : [...prev, clamped]));
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') onClose();
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToStep(activeStepIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToStep(activeStepIndex - 1);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setSandboxRotation((prev) => rotateClockwise(prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeStepIndex]);

  if (!isOpen) return null;

  const chapters = [
    {
      number: '01',
      title: 'Multi-Format Ingest & Capacity',
      subtitle: `2 to ${MAX_QUEUE_FILES} files · Unlimited pages per file`,
    },
    {
      number: '02',
      title: 'Queue Reorder, Rename & Page Slicing',
      subtitle: 'Interactive row controls & custom page ranges',
    },
    {
      number: '03',
      title: '90° Rotation, Scaling & Page Geometry',
      subtitle: 'Fit/Fill modes, margins & orientation',
    },
    {
      number: '04',
      title: 'Live Sheet Inspector & Watermarks',
      subtitle: 'Cover index, page stamps & Quick-Look zoom',
    },
    {
      number: '05',
      title: 'Export Formats & Workflow Presets',
      subtitle: 'PDF, Stitched PNG/JPG & Indexed ZIP',
    },
    {
      number: '06',
      title: `Dark Mode, ${STUDIO_THEMES.length} Themes & Studio Shortcuts`,
      subtitle: `${STUDIO_THEMES.length} custom-icon themes & keyboard hotkeys`,
    },
  ];

  const activeFormatSpec =
    FORMAT_SPECS.find((f) => f.id === selectedFormatId) || FORMAT_SPECS[0];

  const primaryDemoRow = demoRows[0];
  const parsedDemoPages = parsePageRange(
    primaryDemoRow.pageRange,
    primaryDemoRow.totalPages
  );

  const toggleDemoPageTile = (pageNumber1Based: number) => {
    const zeroIdx = pageNumber1Based - 1;
    const currentSet = new Set(parsedDemoPages);
    if (currentSet.has(zeroIdx) && currentSet.size > 1) {
      currentSet.delete(zeroIdx);
    } else {
      currentSet.add(zeroIdx);
    }
    const sorted = Array.from(currentSet)
      .sort((a, b) => a - b)
      .map((i) => i + 1);
    const newRange =
      sorted.length === primaryDemoRow.totalPages ? 'all' : sorted.join(', ');
    setDemoRows((prev) =>
      prev.map((row, i) => (i === 0 ? { ...row, pageRange: newRange } : row))
    );
  };

  const moveDemoRow = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= demoRows.length) return;
    setDemoRows((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const pageDims = calculatePageDimensions(sandboxPageSize, sandboxOrientation);
  const marginPts = getMarginPoints(sandboxMargin);
  const fitRect = calculateImageFitRect(
    sandboxRotation % 180 !== 0 ? 680 : 960,
    sandboxRotation % 180 !== 0 ? 960 : 680,
    Math.max(50, pageDims.width - marginPts * 2),
    Math.max(50, pageDims.height - marginPts * 2),
    sandboxFit
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Matches the exact native desktop studio look & active theme */}
      <div
        className="bg-white border border-zinc-300 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Native Studio Header Matching App TopBar */}
        <div className="bg-zinc-100 border-b border-zinc-200 px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandIcon className="w-6 h-6 shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="tutorial-modal-title"
                  className="text-sm font-bold tracking-tight text-zinc-900 truncate"
                >
                  OmniFuse Studio — Interactive Operations & Mastery Guide
                </h2>
                <span className="font-mono text-[11px] font-semibold text-emerald-700 tabular-nums">
                  · Chapter {activeStepIndex + 1} of {chapters.length} ({visitedSteps.length}/{chapters.length} Explored)
                </span>
              </div>
              <p className="text-xs text-zinc-600 truncate">
                Hands-on interactive replicas of every studio control — click, type, reorder, slice pages, and test themes live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => goToStep(5)}
              title={`Jump to ${STUDIO_THEMES.length} Studio Themes & Dark Mode in Guide`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-800 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ThemeIcon themeId={preferences.themeId} className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{STUDIO_THEMES.length} Themes</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdatePreferences({ darkMode: !preferences.darkMode })}
              title="Toggle Light / Dark Mode live"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              {preferences.darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-700" aria-hidden="true" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Open Corner Studio Settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-800 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-700" aria-hidden="true" />
              <span className="hidden md:inline">Settings</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close tutorial guide"
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="h-1 w-full bg-zinc-200">
          <div
            className="h-full transition-all duration-300 studio-accent-btn"
            style={{ width: `${((activeStepIndex + 1) / chapters.length) * 100}%` }}
          />
        </div>

        {/* Main 12-Column Studio Layout (Matches Workspace 4/8 Split) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto bg-white">
          {/* Left Chapter Rail (4 Columns) */}
          <div className="lg:col-span-4 bg-zinc-50 border-b lg:border-b-0 lg:border-r border-zinc-200 p-4 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Interactive Chapters
                </span>
                <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                  {visitedSteps.length} / {chapters.length}
                </span>
              </div>

              {chapters.map((chap, idx) => {
                const isCurrent = idx === activeStepIndex;
                const isVisited = visitedSteps.includes(idx) && !isCurrent;
                return (
                  <button
                    key={chap.number}
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 flex items-start gap-2.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-white border-zinc-900 shadow-xs'
                        : 'border-transparent hover:bg-zinc-200/60 text-zinc-700'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold tabular-nums mt-0.5 shrink-0 flex items-center justify-center w-4 h-4 ${
                        isCurrent
                          ? 'text-emerald-700'
                          : isVisited
                          ? 'text-emerald-600'
                          : 'text-zinc-400'
                      }`}
                    >
                      {isVisited ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                      ) : (
                        chap.number
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-900 leading-snug">
                        {chap.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {chap.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Studio Keyboard Reference Box (Same Surface Style as App Panels) */}
            <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Global Studio Hotkeys
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Rotate selected file 90°</span>
                  <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-zinc-100 border border-zinc-300 rounded text-zinc-800">
                    R
                  </kbd>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Inline rename file</span>
                  <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-zinc-100 border border-zinc-300 rounded text-zinc-800">
                    Double-Click
                  </kbd>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Switch tutorial chapter</span>
                  <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-zinc-100 border border-zinc-300 rounded text-zinc-800">
                    Left / Right
                  </kbd>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Toggle guide anywhere</span>
                  <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-zinc-100 border border-zinc-300 rounded text-zinc-800">
                    ? or Esc
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Studio Lab (8 Columns) */}
          <div className="lg:col-span-8 p-5 flex flex-col justify-between gap-5 bg-white">
            {/* CHAPTER 01: INGEST & CAPACITY */}
            {activeStepIndex === 0 && (
              <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                      <span>CHAPTER 01</span>
                      <span aria-hidden="true">·</span>
                      <span>MULTI-FORMAT INGEST ENGINE</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mt-1">
                      Combine Up to {MAX_QUEUE_FILES} Mixed Files into 1 Document — With Zero Page Limit Per File
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      OmniFuse Studio ingests PDFs, high-resolution images, and text documents in a single unified queue. You can load between 2 and {MAX_QUEUE_FILES} files at once, and each individual PDF or text file can contain unlimited pages.
                    </p>
                  </div>

                  {/* Interactive Replica of App Queue Header & Capacity Meter */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-200">
                      <div className="flex items-center gap-2">
                        <BrandIcon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold text-zinc-900">
                          Interactive Capacity Simulator:
                        </span>
                        <span className="font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                          {simulatedFileCount} / {MAX_QUEUE_FILES} files
                        </span>
                        <span className="text-xs text-zinc-400">·</span>
                        <span className="text-xs text-zinc-600">Unlimited pages/file</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSimulatedFileCount((c) => Math.min(MAX_QUEUE_FILES, c + 5))
                          }
                          disabled={simulatedFileCount >= MAX_QUEUE_FILES}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-zinc-300 rounded text-zinc-800 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
                        >
                          + Simulate Adding 5 Files
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimulatedFileCount(12)}
                          className="px-2 py-1 text-xs font-mono text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          Reset (12)
                        </button>
                      </div>
                    </div>

                    {/* Visual 50-Slot Queue Capacity Bar */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-10 sm:grid-cols-25 gap-1">
                        {Array.from({ length: MAX_QUEUE_FILES }, (_, idx) => {
                          const isFilled = idx < simulatedFileCount;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSimulatedFileCount(idx + 1)}
                              title={`Set simulated queue to ${idx + 1} files`}
                              className={`h-4 rounded-xs font-mono text-[9px] font-semibold transition-all cursor-pointer ${
                                isFilled
                                  ? 'studio-accent-btn'
                                  : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {simulatedFileCount >= MAX_QUEUE_FILES
                          ? `Maximum capacity reached (${MAX_QUEUE_FILES}/${MAX_QUEUE_FILES} files). "Add Files" and "Duplicate" automatically lock at ${MAX_QUEUE_FILES} files to guarantee fast browser compilation.`
                          : `Click any slot (1–${MAX_QUEUE_FILES}) above to test the queue capacity limiter. Currently ${MAX_QUEUE_FILES - simulatedFileCount} slots remaining.`}
                      </p>
                    </div>
                  </div>

                {/* Interactive Format Specification Explorer */}
                <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                  <div className="bg-zinc-100 border-b border-zinc-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-800">
                      Click a Format Below to Inspect Engine Processing Rules:
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {FORMAT_SPECS.map((spec) => (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setSelectedFormatId(spec.id)}
                          className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors cursor-pointer ${
                            selectedFormatId === spec.id
                              ? 'studio-accent-btn'
                              : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          {spec.ext}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-emerald-700 font-semibold">
                          {activeFormatSpec.category}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900">
                          {activeFormatSpec.title}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200">
                        {activeFormatSpec.pageLimit}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {activeFormatSpec.details}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-mono">
                      <div className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded">
                        <span className="text-zinc-500 block text-[10px]">PIPELINE</span>
                        <span className="text-zinc-800 font-medium">{activeFormatSpec.pipeline}</span>
                      </div>
                      <div className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded">
                        <span className="text-zinc-500 block text-[10px]">RESOLUTION FIDELITY</span>
                        <span className="text-zinc-800 font-medium">{activeFormatSpec.resolution}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Workspace Actions */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-zinc-700 font-medium">
                    Test loading sample batches directly into your active workspace:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={onLoadExtendedBatch}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer studio-accent-btn"
                    >
                      <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Load 12-File Batch (27 Pages)</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLoadSampleBundle}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                    >
                      <span>Load 4-File Sample</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 02: REORDER, INLINE RENAME & PAGE SLICING */}
            {activeStepIndex === 1 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                    <span>CHAPTER 02</span>
                    <span aria-hidden="true">·</span>
                    <span>INTERACTIVE QUEUE & PAGE SLICER LAB</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mt-1">
                    Reorder Rows, Rename Files Inline, and Cherry-Pick Exact Page Ranges
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Below is a live working replica of the studio queue. Try moving rows up/down, clicking the pencil icon to rename a file, or typing expressions like <code className="font-mono font-semibold text-zinc-900">1-3, 5</code>, <code className="font-mono font-semibold text-zinc-900">odd</code>, <code className="font-mono font-semibold text-zinc-900">even</code>, or <code className="font-mono font-semibold text-zinc-900">all</code>.
                  </p>
                </div>

                {/* Live Interactive Queue Replica Matching FileQueuePanel */}
                <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white divide-y divide-zinc-200">
                  <div className="px-3.5 py-2 bg-zinc-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800">
                      Interactive Queue Row Replica (Try the controls on each row)
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      Double-click title or click Pencil to rename
                    </span>
                  </div>

                  {demoRows.map((row, idx) => {
                    const activePages = parsePageRange(row.pageRange, row.totalPages);
                    return (
                      <div
                        key={row.id}
                        className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-zinc-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-mono text-xs font-semibold text-zinc-400 w-5 text-right tabular-nums shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>

                          <div className="min-w-0 flex-1">
                            {editingRowId === row.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingRowName}
                                  onChange={(e) => setEditingRowName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editingRowName.trim()) {
                                      setDemoRows((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, name: editingRowName.trim() }
                                            : r
                                        )
                                      );
                                      setEditingRowId(null);
                                    }
                                    if (e.key === 'Escape') setEditingRowId(null);
                                  }}
                                  autoFocus
                                  className="px-2 py-0.5 text-xs font-semibold bg-white border border-zinc-900 rounded text-zinc-900 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingRowName.trim()) {
                                      setDemoRows((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, name: editingRowName.trim() }
                                            : r
                                        )
                                      );
                                    }
                                    setEditingRowId(null);
                                  }}
                                  className="p-1 rounded studio-accent-btn cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <p
                                  onDoubleClick={() => {
                                    setEditingRowId(row.id);
                                    setEditingRowName(row.name);
                                  }}
                                  className="text-xs font-semibold text-zinc-900 truncate cursor-pointer"
                                >
                                  {row.name}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRowId(row.id);
                                    setEditingRowName(row.name);
                                  }}
                                  aria-label={`Rename ${row.name}`}
                                  className="p-0.5 text-zinc-400 hover:text-zinc-900 rounded cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono tabular-nums mt-0.5">
                              <span className="font-semibold text-zinc-700">{row.ext}</span>
                              <span>·</span>
                              <span className="text-emerald-700 font-semibold">
                                {activePages.length} of {row.totalPages} pages active
                              </span>
                              <span>·</span>
                              <span>{row.sizeLabel}</span>
                              {row.rotation !== 0 && (
                                <>
                                  <span>·</span>
                                  <span className="text-zinc-900 font-semibold">
                                    Rotated {row.rotation}°
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {row.totalPages > 1 && (
                            <div className="flex items-center gap-1">
                              <label className="text-[11px] text-zinc-500">Pages:</label>
                              <input
                                type="text"
                                value={row.pageRange}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDemoRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, pageRange: val } : r
                                    )
                                  );
                                }}
                                className="w-20 px-1.5 py-0.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-900 focus:outline-none focus:border-zinc-900"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-0.5 border-l border-zinc-200 pl-2">
                            <button
                              type="button"
                              onClick={() => moveDemoRow(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveDemoRow(idx, 'down')}
                              disabled={idx === demoRows.length - 1}
                              className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDemoRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, rotation: rotateClockwise(r.rotation) }
                                      : r
                                  )
                                )
                              }
                              className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded cursor-pointer"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive 8-Page Slicer Grid for Row #1 */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Interactive Sheet Slicer for "{primaryDemoRow.name}" ({parsedDemoPages.length}/{primaryDemoRow.totalPages} sheets)
                      </span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {[
                        { label: 'All Pages', expr: 'all' },
                        { label: 'Odd Only', expr: 'odd' },
                        { label: 'Even Only', expr: 'even' },
                        { label: '1-3, 8', expr: '1-3, 8' },
                      ].map((preset) => (
                        <button
                          key={preset.expr}
                          type="button"
                          onClick={() =>
                            setDemoRows((prev) =>
                              prev.map((r, i) =>
                                i === 0 ? { ...r, pageRange: preset.expr } : r
                              )
                            )
                          }
                          className="px-2 py-0.5 text-[11px] font-mono bg-white border border-zinc-300 hover:bg-zinc-100 rounded text-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-600">
                    Click any page sheet below to toggle it on/off, or click the quick range expressions above:
                  </p>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {Array.from({ length: primaryDemoRow.totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      const isIncluded = parsedDemoPages.includes(i);
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => toggleDemoPageTile(pageNum)}
                          className={`p-2 rounded border text-center transition-all cursor-pointer ${
                            isIncluded
                              ? 'bg-white border-zinc-900 text-zinc-900 shadow-2xs'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-400 opacity-60'
                          }`}
                        >
                          <span className="font-mono text-xs font-bold block">
                            P.{pageNum}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                            {isIncluded ? 'Keep' : 'Skip'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 03: ROTATION, SCALING & PAGE GEOMETRY */}
            {activeStepIndex === 2 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                    <span>CHAPTER 03</span>
                    <span aria-hidden="true">·</span>
                    <span>GEOMETRY, SCALING & 90° SCAN ROTATION</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mt-1">
                    Standardize Mixed Aspect Ratios, Fix Sideways Scans & Configure Margins
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Use the controls below to test how OmniFuse maps images and scans onto your target PDF sheet. Press <kbd className="px-1 py-0.5 font-mono bg-zinc-100 border border-zinc-300 rounded">R</kbd> or click Rotate to spin the sheet in 90° increments.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                  {/* Live Proportioned Sheet Preview */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center bg-zinc-200/70 border border-zinc-300 rounded-lg p-4 h-52">
                    <div
                      style={{
                        width: sandboxOrientation === 'landscape' ? '156px' : '112px',
                        height: sandboxOrientation === 'landscape' ? '112px' : '156px',
                        padding:
                          sandboxMargin === 'none'
                            ? '0px'
                            : sandboxMargin === 'compact'
                            ? '6px'
                            : sandboxMargin === 'standard'
                            ? '12px'
                            : '20px',
                      }}
                      className="bg-white border border-zinc-400 shadow-sm flex items-center justify-center overflow-hidden transition-all duration-200 relative"
                    >
                      <div
                        style={{ transform: `rotate(${sandboxRotation}deg)` }}
                        className={`bg-zinc-100 border border-zinc-400 flex flex-col items-center justify-center transition-all duration-200 ${
                          sandboxFit === 'cover'
                            ? 'w-full h-full'
                            : sandboxFit === 'contain'
                            ? 'w-full h-3/4'
                            : 'w-3/4 h-2/3'
                        }`}
                      >
                        <BrandIcon className="w-5 h-5" />
                        <span className="font-mono text-[10px] font-bold text-zinc-800 mt-1">
                          {sandboxRotation}° · {sandboxFit.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-600 mt-2 tabular-nums">
                      Sheet: {Math.round(pageDims.width)}×{Math.round(pageDims.height)} pt · Margin: {marginPts}pt
                    </span>
                  </div>

                  {/* Replica Studio Geometry Controls */}
                  <div className="sm:col-span-7 space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          Image Scaling Mode
                        </label>
                        <select
                          value={sandboxFit}
                          onChange={(e) => setSandboxFit(e.target.value as ImageFitMode)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded text-zinc-900"
                        >
                          <option value="contain">Fit Page (No Cropping)</option>
                          <option value="cover">Fill Page (Full Bleed)</option>
                          <option value="original">Original Aspect Ratio</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          Target Page Size
                        </label>
                        <select
                          value={sandboxPageSize}
                          onChange={(e) => setSandboxPageSize(e.target.value as PageSizePreset)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded text-zinc-900"
                        >
                          <option value="a4">ISO A4 (595×842 pt)</option>
                          <option value="letter">US Letter (612×792 pt)</option>
                          <option value="legal">US Legal (612×1008 pt)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          Page Orientation
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          {(['portrait', 'landscape'] as PageOrientation[]).map((ori) => (
                            <button
                              key={ori}
                              type="button"
                              onClick={() => setSandboxOrientation(ori)}
                              className={`py-1 text-xs font-medium rounded border capitalize cursor-pointer ${
                                sandboxOrientation === ori
                                  ? 'studio-accent-btn border-transparent'
                                  : 'bg-white text-zinc-700 border-zinc-300'
                              }`}
                            >
                              {ori}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          Sheet Margins
                        </label>
                        <select
                          value={sandboxMargin}
                          onChange={(e) => setSandboxMargin(e.target.value as MarginPreset)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded text-zinc-900"
                        >
                          <option value="none">None (0 pt Full Bleed)</option>
                          <option value="compact">Compact (18 pt)</option>
                          <option value="standard">Standard (40 pt)</option>
                          <option value="wide">Wide Archival (64 pt)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSandboxRotation((r) => rotateClockwise(r))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded cursor-pointer studio-accent-btn"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rotate 90° Clockwise ({sandboxRotation}°)</span>
                      </button>

                      <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                        Computed Box: {Math.round(fitRect.width)}×{Math.round(fitRect.height)} pt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 04: LIVE SHEET INSPECTOR, TOC & WATERMARKS */}
            {activeStepIndex === 3 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                    <span>CHAPTER 04</span>
                    <span aria-hidden="true">·</span>
                    <span>LIVE SHEET INSPECTOR, TABLE OF CONTENTS & WATERMARKS</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mt-1">
                    Preview Compiled Sheets, Prepend an Executive Cover Index & Stamp Watermarks
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Toggle the checkboxes and edit the watermark text below to see how the Live Preview Inspector renders your Table of Contents cover sheet, diagonal watermark, and page numbers in real time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-zinc-50 border border-zinc-200 rounded-lg p-4 items-center">
                  {/* Simulated Compiled Sheet */}
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div className="w-44 h-56 bg-white border border-zinc-300 shadow-sm rounded-xs p-3 flex flex-col justify-between relative overflow-hidden">
                      {/* Diagonal Watermark Overlay */}
                      {sandboxWatermark.trim() && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="font-mono text-[11px] font-bold text-zinc-300/90 -rotate-35 uppercase tracking-widest text-center px-2 select-none">
                            {sandboxWatermark}
                          </span>
                        </div>
                      )}

                      <div className="relative z-10 space-y-1.5">
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                          <span className="font-mono text-[8px] text-zinc-500 uppercase">
                            OmniFuse Studio Binder
                          </span>
                          <span className="font-mono text-[8px] text-emerald-700 font-bold">
                            A4
                          </span>
                        </div>

                        {sandboxIncludeToc && sandboxSheetIdx === 0 ? (
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] font-bold text-zinc-900">
                              TABLE OF CONTENTS
                            </p>
                            <p className="text-[8px] font-mono text-zinc-500">
                              12 Files · 27 Total Sheets
                            </p>
                            <div className="space-y-1 pt-1 font-mono text-[8px] text-zinc-700">
                              <div className="flex justify-between border-b border-dotted border-zinc-200">
                                <span>01. Service_Agreement.pdf</span>
                                <span>P.2</span>
                              </div>
                              <div className="flex justify-between border-b border-dotted border-zinc-200">
                                <span>02. Floorplan_RevB.jpg</span>
                                <span>P.4</span>
                              </div>
                              <div className="flex justify-between border-b border-dotted border-zinc-200">
                                <span>03. Equipment_Invoice.png</span>
                                <span>P.5</span>
                              </div>
                              <div className="flex justify-between border-b border-dotted border-zinc-200">
                                <span>04. Handover_Notes.md</span>
                                <span>P.6</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] font-bold text-zinc-900">
                              01_Service_Agreement.pdf
                            </p>
                            <div className="h-2 bg-zinc-200 rounded-xs w-5/6" />
                            <div className="h-2 bg-zinc-200 rounded-xs w-full" />
                            <div className="h-2 bg-zinc-200 rounded-xs w-4/6" />
                            <div className="h-16 bg-zinc-100 border border-zinc-200 rounded-xs mt-2 flex items-center justify-center font-mono text-[8px] text-zinc-500">
                              Vector PDF Content Stream
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Page Stamp */}
                      <div className="relative z-10 border-t border-zinc-200 pt-1 flex items-center justify-between font-mono text-[8px] text-zinc-500">
                        <span>unified-document-package.pdf</span>
                        {sandboxPageNumbers && (
                          <span className="font-bold text-zinc-800">
                            Page {sandboxSheetIdx + 1} of {sandboxIncludeToc ? 27 : 26}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Inspector Controls */}
                  <div className="sm:col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">
                        Simulated Sheet Navigation:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSandboxSheetIdx(0)}
                          className={`px-2.5 py-1 text-xs font-mono rounded border cursor-pointer ${
                            sandboxSheetIdx === 0
                              ? 'studio-accent-btn border-transparent'
                              : 'bg-white text-zinc-700 border-zinc-300'
                          }`}
                        >
                          Sheet 1 ({sandboxIncludeToc ? 'Cover Index' : 'Doc 1'})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSandboxSheetIdx(1)}
                          className={`px-2.5 py-1 text-xs font-mono rounded border cursor-pointer ${
                            sandboxSheetIdx === 1
                              ? 'studio-accent-btn border-transparent'
                              : 'bg-white text-zinc-700 border-zinc-300'
                          }`}
                        >
                          Sheet 2 (Agreement)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sandboxIncludeToc}
                          onChange={(e) => {
                            setSandboxIncludeToc(e.target.checked);
                            if (e.target.checked) setSandboxSheetIdx(0);
                          }}
                          className="rounded accent-zinc-900"
                        />
                        <span>Include Cover Index (Executive Table of Contents on Sheet 1)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sandboxPageNumbers}
                          onChange={(e) => setSandboxPageNumbers(e.target.checked)}
                          className="rounded accent-zinc-900"
                        />
                        <span>Stamp Footer Page Numbers ("Page X of Y")</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Diagonal Security Watermark Text (Try typing below):
                      </label>
                      <input
                        type="text"
                        value={sandboxWatermark}
                        onChange={(e) => setSandboxWatermark(e.target.value)}
                        placeholder="e.g. CONFIDENTIAL, DRAFT, APPROVED"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-900"
                      />
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onSwitchToComposer();
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Open Full Visual Page Composer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 05: EXPORT FORMATS & WORKFLOW PRESETS */}
            {activeStepIndex === 4 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                    <span>CHAPTER 05</span>
                    <span aria-hidden="true">·</span>
                    <span>UNIFIED COMPILATION & WORKFLOW PRESETS</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mt-1">
                    Export to Unified PDF, Stitched High-DPI Image Strip, or Indexed ZIP Archive
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Click any output format or preset profile below to inspect its packaging architecture, or apply it directly to your active studio workspace.
                  </p>
                </div>

                {/* Interactive Format Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'pdf' as OutputFormat,
                      ext: '.PDF',
                      name: 'Unified PDF Binder',
                      desc: 'Standardized multi-page document',
                    },
                    {
                      id: 'stitched-png' as OutputFormat,
                      ext: '.PNG',
                      name: 'Lossless Strip',
                      desc: 'Vertical/Grid stitched image',
                    },
                    {
                      id: 'stitched-jpeg' as OutputFormat,
                      ext: '.JPG',
                      name: 'Proof Sheet',
                      desc: 'Compressed visual contact sheet',
                    },
                    {
                      id: 'zip-bundle' as OutputFormat,
                      ext: '.ZIP',
                      name: 'Indexed Archive',
                      desc: 'Source files + PDF + Manifest',
                    },
                  ].map((fmt) => {
                    const isSelected = sandboxOutputFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSandboxOutputFormat(fmt.id)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-100/90 shadow-2xs'
                            : 'border-zinc-200 bg-white hover:border-zinc-400'
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {fmt.ext}
                        </span>
                        <p className="text-xs font-bold text-zinc-900 mt-1">{fmt.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{fmt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* One-Click Presets Launcher */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-2.5">
                  <span className="text-xs font-bold text-zinc-900 block">
                    Click Any Preset to Apply It Directly to Your Workspace:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {WORKSPACE_PRESETS.slice(0, 4).map((preset) => (
                      <div
                        key={preset.id}
                        className="p-2.5 bg-white border border-zinc-200 rounded flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {preset.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {preset.targetUse}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onApplyPreset(preset);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded shrink-0 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-800">
                    Ready to compile your active queue ({currentFileCount} files, {currentTotalPages} sheets)?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTriggerMerge();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded cursor-pointer studio-accent-btn"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Merge {currentFileCount} Files Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* CHAPTER 06: DARK MODE, 10 CUSTOM-ICON THEMES & STUDIO SHORTCUTS */}
            {activeStepIndex === 5 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                      <span>CHAPTER 06</span>
                      <span aria-hidden="true">·</span>
                      <span>APPEARANCE ENGINE, DARK MODE & 10 ICONIC THEMES</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mt-1">
                      Customize Your Studio with Dark Mode and 10 Custom-Icon Architectural Themes
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      Switch between Light and Dark Mode or click any of the 10 custom-icon studio themes below — both this How-to-Use guide and the entire OmniFuse workspace transform immediately.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-md cursor-pointer shrink-0"
                  >
                    <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Open Corner Settings</span>
                  </button>
                </div>

                {/* Interactive Dark Mode Switcher */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      Live Dark Mode Switcher
                    </p>
                    <p className="text-[11px] text-zinc-600">
                      Currently active: <strong>{preferences.darkMode ? 'Dark Studio Mode' : 'Light Studio Mode'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdatePreferences({ darkMode: false })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border cursor-pointer ${
                        !preferences.darkMode
                          ? 'studio-accent-btn border-transparent'
                          : 'bg-white text-zinc-700 border-zinc-300'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdatePreferences({ darkMode: true })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border cursor-pointer ${
                        preferences.darkMode
                          ? 'studio-accent-btn border-transparent'
                          : 'bg-white text-zinc-700 border-zinc-300'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark Mode</span>
                    </button>
                  </div>
                </div>

                {/* Interactive 10 Custom-Icon Themes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STUDIO_THEMES.map((theme) => {
                    const isSelected = preferences.themeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          onUpdatePreferences({
                            themeId: theme.id as StudioThemeId,
                            ...(theme.recommendedDark !== undefined
                              ? { darkMode: theme.recommendedDark }
                              : {}),
                          })
                        }
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-100/90 shadow-2xs'
                            : 'border-zinc-200 bg-white hover:border-zinc-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <ThemeIcon themeId={theme.id} className="w-7 h-7 shrink-0" />
                            {isSelected ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-700">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                Active
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-zinc-400">
                                {theme.recommendedDark ? 'DARK' : 'LIGHT'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-zinc-900 leading-tight truncate">
                            {theme.name}
                          </p>
                          <p className="text-[10px] font-mono text-emerald-700 truncate mt-0.5">
                            {theme.iconLabel}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200/70">
                          <div className="flex items-center gap-1">
                            <span
                              style={{ backgroundColor: theme.swatches.canvas }}
                              className="w-3 h-3 rounded-full border border-zinc-300"
                            />
                            <span
                              style={{ backgroundColor: theme.swatches.surface }}
                              className="w-3 h-3 rounded-full border border-zinc-300"
                            />
                            <span
                              style={{ backgroundColor: theme.swatches.accent }}
                              className="w-3 h-3 rounded-full border border-zinc-300"
                            />
                          </div>
                          <span className="text-[9px] font-mono text-zinc-400">
                            Apply
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Step Navigation Footer */}
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStep(activeStepIndex - 1)}
                disabled={activeStepIndex === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 disabled:opacity-40 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Previous Guide</span>
              </button>

              <div className="flex items-center gap-1.5">
                {chapters.map((c, idx) => (
                  <button
                    key={c.number}
                    type="button"
                    onClick={() => goToStep(idx)}
                    aria-label={`Go to guide chapter ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === activeStepIndex
                        ? 'w-6 studio-accent-btn'
                        : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>

              {activeStepIndex < chapters.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep(activeStepIndex + 1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer studio-accent-btn"
                >
                  <span>Next Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer studio-accent-btn"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Finish & Return to Studio</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
