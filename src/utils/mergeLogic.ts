import {
  DuplicateFileConflict,
  FileCategory,
  ImageFitMode,
  MarginPreset,
  MergeFileItem,
  MergeSettings,
  PageOrientation,
  PageSizePreset,
  RotationAngle,
  StudioAppIconId,
  StudioAppIconOption,
  StudioAppPreferences,
  StudioTheme,
  StudioThemeId,
  WorkspacePreset,
} from '../types/merger';

export const MAX_QUEUE_FILES = 50;
export const DEFAULT_BATCH_SIZE = 12;

export const DEFAULT_STUDIO_PREFERENCES: StudioAppPreferences = {
  darkMode: false,
  themeId: 'classic-layers',
  appIconId: 'classic-layers',
  batchSize: DEFAULT_BATCH_SIZE,
  compactRows: false,
  autoOpenExportModal: true,
  showKeyboardHints: true,
};

export const STUDIO_APP_ICONS: StudioAppIconOption[] = [
  {
    id: 'classic-layers',
    name: 'Original OmniFuse Stack',
    badgeLabel: 'Default Logo',
    description: 'Classic isometric document stack with emerald fusion badge',
  },
  {
    id: 'swiss-zinc',
    name: 'Isometric Prism',
    badgeLabel: 'Swiss Zinc',
    description: 'Monochrome slate squircle with precision layered prism',
  },
  {
    id: 'midnight-carbon',
    name: 'Cyber Crescent',
    badgeLabel: 'Carbon',
    description: 'Obsidian octagon emblem with electric emerald core',
  },
  {
    id: 'nordic-frost',
    name: 'Arctic Crystal',
    badgeLabel: 'Nordic CAD',
    description: 'Hexagonal blueprint crystal with cobalt sapphire frame',
  },
  {
    id: 'amber-darkroom',
    name: 'Solar Aperture',
    badgeLabel: 'Darkroom',
    description: 'Circular optical lens emblem with warm amber rings',
  },
  {
    id: 'emerald-terminal',
    name: 'Origami Leaf',
    badgeLabel: 'Botanical',
    description: 'Organic forest-emerald badge with folded vector leaf',
  },
  {
    id: 'amethyst-pro',
    name: 'Faceted Gem',
    badgeLabel: 'Amethyst',
    description: 'Diamond-cut royal violet jewel with luminous core',
  },
  {
    id: 'crimson-velvet',
    name: 'Ruby Flame',
    badgeLabel: 'Crimson',
    description: 'Crested ruby-crimson shield with high-contrast core',
  },
  {
    id: 'ocean-abyss',
    name: 'Nautilus Compass',
    badgeLabel: 'Lagoon',
    description: 'Deep-sea cyan porthole with cardinal compass crosshairs',
  },
  {
    id: 'cyber-gold',
    name: 'Solar Astrolabe',
    badgeLabel: '24K Gold',
    description: 'Beveled 24K gold medallion on obsidian-bronze crest',
  },
  {
    id: 'sakura-neon',
    name: 'Sakura Bloom',
    badgeLabel: 'Sakura',
    description: 'Magenta-rose blossom badge with crisp studio geometry',
  },
];

export function getStudioAppIconById(iconId: StudioAppIconId): StudioAppIconOption {
  return STUDIO_APP_ICONS.find((i) => i.id === iconId) || STUDIO_APP_ICONS[0];
}

/**
 * Updates the active studio theme (and optional dark mode) while strictly preserving
 * the user's current `appIconId` so the app logo never changes when switching themes.
 */
export function applyThemeWithoutChangingAppIcon(
  current: StudioAppPreferences,
  themeId: StudioThemeId,
  recommendedDark?: boolean
): StudioAppPreferences {
  return {
    ...current,
    themeId,
    darkMode: recommendedDark !== undefined ? recommendedDark : current.darkMode,
    appIconId: current.appIconId,
  };
}

export function clampBatchCount(count: number, maxFiles = MAX_QUEUE_FILES): number {
  if (!Number.isFinite(count)) return DEFAULT_BATCH_SIZE;
  return Math.max(1, Math.min(maxFiles, Math.round(count)));
}

export function stepBatchCount(
  currentCount: number,
  delta: number,
  maxFiles = MAX_QUEUE_FILES
): number {
  return clampBatchCount(currentCount + delta, maxFiles);
}

export function cycleBatchPresetCount(
  currentCount: number,
  maxFiles = MAX_QUEUE_FILES
): number {
  const tiers = [4, 12, 20, 35, maxFiles];
  for (const tier of tiers) {
    if (currentCount < tier) {
      return tier;
    }
  }
  return tiers[0];
}

export const STUDIO_THEMES: StudioTheme[] = [
  {
    id: 'classic-layers',
    name: 'Original OmniFuse',
    iconLabel: 'Classic Stack',
    tagline: 'Original studio slate & emerald fusion workspace with classic layer icons',
    swatches: {
      canvas: '#F4F4F5',
      surface: '#FFFFFF',
      accent: '#059669',
      border: '#D4D4D8',
    },
  },
  {
    id: 'swiss-zinc',
    name: 'Swiss Zinc',
    iconLabel: 'Isometric Prism',
    tagline: 'Architectural monochrome slate with crisp studio contrast',
    swatches: {
      canvas: '#F4F4F5',
      surface: '#FFFFFF',
      accent: '#18181B',
      border: '#E4E4E7',
    },
  },
  {
    id: 'midnight-carbon',
    name: 'Midnight Carbon',
    iconLabel: 'Cyber Crescent',
    tagline: 'Deep obsidian carbon console with electric emerald highlights',
    recommendedDark: true,
    swatches: {
      canvas: '#09090B',
      surface: '#121316',
      accent: '#10B981',
      border: '#27272A',
    },
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost CAD',
    iconLabel: 'Arctic Crystal',
    tagline: 'Arctic blueprint slate with precision cobalt sapphire controls',
    swatches: {
      canvas: '#EBF3FA',
      surface: '#FFFFFF',
      accent: '#2563EB',
      border: '#BFDBFE',
    },
  },
  {
    id: 'amber-darkroom',
    name: 'Solar Darkroom',
    iconLabel: 'Solar Aperture',
    tagline: 'Warm titanium hardware with international orange-amber accents',
    swatches: {
      canvas: '#F6F2EA',
      surface: '#FFFFFF',
      accent: '#EA580C',
      border: '#FED7AA',
    },
  },
  {
    id: 'emerald-terminal',
    name: 'Botanical Lab',
    iconLabel: 'Origami Leaf',
    tagline: 'Mineral sage workspace with deep forest emerald actions',
    swatches: {
      canvas: '#EAF5EF',
      surface: '#FFFFFF',
      accent: '#059669',
      border: '#A7F3D0',
    },
  },
  {
    id: 'amethyst-pro',
    name: 'Royal Amethyst',
    iconLabel: 'Faceted Gem',
    tagline: 'Precision lavender quartz with royal violet CAD accents',
    swatches: {
      canvas: '#F2EEFA',
      surface: '#FFFFFF',
      accent: '#7C3AED',
      border: '#DDD6FE',
    },
  },
  {
    id: 'crimson-velvet',
    name: 'Crimson Forge',
    iconLabel: 'Ruby Flame',
    tagline: 'Warm rose-ivory studio with striking ruby-crimson highlights',
    swatches: {
      canvas: '#FAF0F2',
      surface: '#FFFFFF',
      accent: '#E11D48',
      border: '#FECDD3',
    },
  },
  {
    id: 'ocean-abyss',
    name: 'Pacific Lagoon',
    iconLabel: 'Nautilus Compass',
    tagline: 'Seafoam aqua drafting table with deep cyan-teal controls',
    swatches: {
      canvas: '#E8F6F8',
      surface: '#FFFFFF',
      accent: '#0891B2',
      border: '#A5F3FC',
    },
  },
  {
    id: 'cyber-gold',
    name: 'Aurelia Gold Luxe',
    iconLabel: 'Solar Astrolabe',
    tagline: 'Obsidian-bronze console with luminous 24K amber-gold accents',
    recommendedDark: true,
    swatches: {
      canvas: '#12100B',
      surface: '#1C1914',
      accent: '#F59E0B',
      border: '#78350F',
    },
  },
  {
    id: 'sakura-neon',
    name: 'Sakura Horizon',
    iconLabel: 'Sakura Bloom',
    tagline: 'Soft blush pearl workspace with vibrant magenta-rose accents',
    swatches: {
      canvas: '#FAF0F7',
      surface: '#FFFFFF',
      accent: '#DB2777',
      border: '#FBCFE8',
    },
  },
];

export function getStudioThemeById(themeId: StudioThemeId): StudioTheme {
  return STUDIO_THEMES.find((t) => t.id === themeId) || STUDIO_THEMES[0];
}

export const DEFAULT_MERGE_SETTINGS: MergeSettings = {
  outputFilename: 'Complete Merged Binder',
  documentTitle: 'Complete Merged Binder',
  documentAuthor: 'OmniFuse Studio',
  outputFormat: 'pdf',
  pageSize: 'a4',
  orientation: 'portrait',
  margin: 'standard',
  includePageNumbers: true,
  includeTableOfContents: false,
  watermarkText: '',
  imageQuality: 0.92,
  stitchDirection: 'vertical',
  stitchSpacingPx: 16,
  backgroundColor: '#FFFFFF',
};

export const WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: 'binder-pdf',
    name: 'Executive PDF Binder',
    description: 'Combines PDFs, photos, and text notes onto standardized A4 pages with page numbering and cover table of contents.',
    targetUse: 'Contracts, reports, client handoffs',
    settings: {
      outputFormat: 'pdf',
      pageSize: 'a4',
      orientation: 'portrait',
      margin: 'standard',
      includePageNumbers: true,
      includeTableOfContents: true,
      watermarkText: '',
    },
  },
  {
    id: 'receipt-roll',
    name: 'Continuous Vertical Stitch',
    description: 'Stitches screenshots, receipts, and JPEGs into a single continuous vertical high-resolution PNG strip.',
    targetUse: 'Expense receipts, chat logs, long captures',
    settings: {
      outputFormat: 'stitched-png',
      stitchDirection: 'vertical',
      stitchSpacingPx: 12,
      backgroundColor: '#F8FAFC',
    },
  },
  {
    id: 'contact-sheet',
    name: '2-Column Proof Grid',
    description: 'Arranges multiple images and document pages side-by-side in a balanced 2-column visual proof sheet.',
    targetUse: 'Design boards, photo comparisons, inspections',
    settings: {
      outputFormat: 'stitched-jpeg',
      stitchDirection: 'grid-2col',
      stitchSpacingPx: 20,
      imageQuality: 0.9,
      backgroundColor: '#FFFFFF',
    },
  },
  {
    id: 'compliance-archive',
    name: 'Watermarked Compliance PDF',
    description: 'US Letter format with generous margins, page numbers, and a diagonal confidential watermark across all pages.',
    targetUse: 'Legal filings, internal audits, medical records',
    settings: {
      outputFormat: 'pdf',
      pageSize: 'letter',
      orientation: 'portrait',
      margin: 'wide',
      includePageNumbers: true,
      includeTableOfContents: true,
      watermarkText: 'CONFIDENTIAL',
    },
  },
  {
    id: 'zip-archive',
    name: 'Indexed ZIP Package',
    description: 'Packages all source files plus a unified PDF and a Markdown manifest index into one portable ZIP archive.',
    targetUse: 'Project backups, multi-format deliverables',
    settings: {
      outputFormat: 'zip-bundle',
      includeTableOfContents: true,
    },
  },
];

export function classifyFileKind(filename: string, mimeType: string): {
  category: FileCategory;
  extension: string;
} {
  const lower = filename.trim().toLowerCase();
  const parts = lower.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : '';

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return { category: 'pdf', extension: 'PDF' };
  }

  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif'];
  if (mimeType.startsWith('image/') || imageExts.includes(ext)) {
    const normalizedExt = ext === 'jpeg' ? 'JPG' : (ext || 'IMG').toUpperCase();
    return { category: 'image', extension: normalizedExt };
  }

  const textExts = ['txt', 'md', 'csv', 'json', 'log', 'html', 'xml', 'yml', 'yaml', 'ts', 'js', 'py'];
  if (mimeType.startsWith('text/') || mimeType === 'application/json' || textExts.includes(ext)) {
    return { category: 'text', extension: (ext || 'TXT').toUpperCase() };
  }

  return { category: 'text', extension: (ext || 'DOC').toUpperCase() };
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Parses a 1-based page range string (e.g. "all", "", "1-3, 5") into sorted 0-based page indices.
 */
export function parsePageRange(rangeInput: string, totalPages: number): number[] {
  const safeTotal = Math.max(1, Math.floor(totalPages));
  const trimmed = (rangeInput || '').trim().toLowerCase();
  if (!trimmed || trimmed === 'all' || trimmed === '*') {
    return Array.from({ length: safeTotal }, (_, i) => i);
  }
  if (trimmed === 'odd') {
    return Array.from({ length: safeTotal }, (_, i) => i).filter((i) => (i + 1) % 2 === 1);
  }
  if (trimmed === 'even') {
    const evens = Array.from({ length: safeTotal }, (_, i) => i).filter((i) => (i + 1) % 2 === 0);
    return evens.length > 0 ? evens : [0];
  }

  const selected = new Set<number>();
  const segments = trimmed.split(',').map((s) => s.trim()).filter(Boolean);

  for (const seg of segments) {
    if (seg.includes('-')) {
      const [startStr, endStr] = seg.split('-').map((s) => s.trim());
      const start = Number.parseInt(startStr, 10);
      const end = Number.parseInt(endStr, 10);
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        const low = Math.max(1, Math.min(start, end));
        const high = Math.min(safeTotal, Math.max(start, end));
        for (let p = low; p <= high; p++) {
          selected.add(p - 1);
        }
      }
    } else {
      const pageNum = Number.parseInt(seg, 10);
      if (!Number.isNaN(pageNum) && pageNum >= 1 && pageNum <= safeTotal) {
        selected.add(pageNum - 1);
      }
    }
  }

  if (selected.size === 0) {
    return Array.from({ length: safeTotal }, (_, i) => i);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

export function rotateClockwise(current: RotationAngle): RotationAngle {
  const next = (current + 90) % 360;
  return next as RotationAngle;
}

export function getMarginPoints(margin: MarginPreset): number {
  switch (margin) {
    case 'none':
      return 0;
    case 'compact':
      return 18;
    case 'standard':
      return 40;
    case 'wide':
      return 64;
  }
}

export function calculatePageDimensions(
  preset: PageSizePreset,
  orientation: PageOrientation,
  intrinsicWidth = 595.28,
  intrinsicHeight = 841.89
): { width: number; height: number } {
  let baseW = 595.28; // A4 width in PDF points
  let baseH = 841.89; // A4 height in PDF points

  if (preset === 'letter') {
    baseW = 612;
    baseH = 792;
  } else if (preset === 'legal') {
    baseW = 612;
    baseH = 1008;
  } else if (preset === 'auto') {
    baseW = Math.max(200, intrinsicWidth);
    baseH = Math.max(200, intrinsicHeight);
  }

  if (orientation === 'landscape') {
    return {
      width: Math.max(baseW, baseH),
      height: Math.min(baseW, baseH),
    };
  }
  if (orientation === 'portrait') {
    return {
      width: Math.min(baseW, baseH),
      height: Math.max(baseW, baseH),
    };
  }

  return { width: baseW, height: baseH };
}

export function calculateImageFitRect(
  imgWidth: number,
  imgHeight: number,
  boxWidth: number,
  boxHeight: number,
  fitMode: ImageFitMode
): { x: number; y: number; width: number; height: number } {
  const safeImgW = Math.max(1, imgWidth);
  const safeImgH = Math.max(1, imgHeight);
  const safeBoxW = Math.max(1, boxWidth);
  const safeBoxH = Math.max(1, boxHeight);

  if (fitMode === 'original') {
    const scale = Math.min(1, safeBoxW / safeImgW, safeBoxH / safeImgH);
    const width = safeImgW * scale;
    const height = safeImgH * scale;
    return {
      x: (safeBoxW - width) / 2,
      y: (safeBoxH - height) / 2,
      width,
      height,
    };
  }

  const ratioW = safeBoxW / safeImgW;
  const ratioH = safeBoxH / safeImgH;
  const scale = fitMode === 'cover' ? Math.max(ratioW, ratioH) : Math.min(ratioW, ratioH);

  const width = safeImgW * scale;
  const height = safeImgH * scale;

  return {
    x: (safeBoxW - width) / 2,
    y: (safeBoxH - height) / 2,
    width,
    height,
  };
}

export function moveQueueItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }
  const clone = [...items];
  const [moved] = clone.splice(fromIndex, 1);
  clone.splice(toIndex, 0, moved);
  return clone;
}

export function filterQueueItems(
  items: MergeFileItem[],
  searchQuery: string,
  categoryFilter: 'all' | FileCategory
): MergeFileItem[] {
  const q = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.extension.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });
}

export function sortQueueItems(
  items: MergeFileItem[],
  sortBy: 'name' | 'size' | 'type' | 'pages'
): MergeFileItem[] {
  const clone = [...items];
  clone.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
    if (sortBy === 'type') return a.extension.localeCompare(b.extension);
    if (sortBy === 'pages') return b.pageCount - a.pageCount;
    return 0;
  });
  return clone;
}

export function calculateQueueMetrics(
  items: MergeFileItem[],
  includeTableOfContents = false
): {
  totalFiles: number;
  totalSelectedPages: number;
  totalSizeBytes: number;
  categoryCounts: Record<FileCategory, number>;
} {
  const categoryCounts: Record<FileCategory, number> = {
    pdf: 0,
    image: 0,
    text: 0,
  };
  let totalSelectedPages = includeTableOfContents && items.length > 0 ? 1 : 0;
  let totalSizeBytes = 0;

  for (const item of items) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    totalSizeBytes += item.sizeBytes;
    const activePages = parsePageRange(item.pageRange, item.pageCount);
    totalSelectedPages += activePages.length;
  }

  return {
    totalFiles: items.length,
    totalSelectedPages,
    totalSizeBytes,
    categoryCounts,
  };
}

export function enforceQueueLimit<T>(
  currentItems: T[],
  incomingItems: T[],
  maxFiles = MAX_QUEUE_FILES
): {
  nextItems: T[];
  addedCount: number;
  rejectedCount: number;
  limitReached: boolean;
} {
  const remainingSlots = Math.max(0, maxFiles - currentItems.length);
  const accepted = incomingItems.slice(0, remainingSlots);
  const nextItems = [...currentItems, ...accepted];
  const rejectedCount = Math.max(0, incomingItems.length - accepted.length);

  return {
    nextItems,
    addedCount: accepted.length,
    rejectedCount,
    limitReached: nextItems.length >= maxFiles || rejectedCount > 0,
  };
}

function normalizeFileKey(name: string): string {
  return (name || '').trim().toLowerCase();
}

/**
 * Detects if any incoming files have the same filename as files already in the queue
 * (or appear twice within the incoming batch itself).
 */
export function findDuplicateQueueConflicts(
  existingItems: MergeFileItem[],
  incomingItems: MergeFileItem[]
): {
  conflicts: DuplicateFileConflict[];
  hasDuplicates: boolean;
} {
  const conflicts: DuplicateFileConflict[] = [];
  for (const inc of incomingItems) {
    const key = normalizeFileKey(inc.name);
    const existingIndex = existingItems.findIndex(
      (item) => normalizeFileKey(item.name) === key
    );
    if (existingIndex !== -1) {
      conflicts.push({
        existingItem: existingItems[existingIndex],
        existingIndex,
        incomingItem: inc,
      });
    }
  }

  return {
    conflicts,
    hasDuplicates: conflicts.length > 0,
  };
}

/**
 * Option 1: "Remove the first file and add this one"
 * Removes the first matching occurrence of each duplicate filename from the existing queue
 * and appends the newly added file(s), respecting the maximum file limit.
 */
export function resolveDuplicateRemoveFirstAndAdd(
  existingItems: MergeFileItem[],
  incomingItems: MergeFileItem[],
  maxFiles = MAX_QUEUE_FILES
): {
  nextItems: MergeFileItem[];
  removedFirstCount: number;
  addedCount: number;
  rejectedCount: number;
} {
  const remainingExisting = [...existingItems];
  let removedFirstCount = 0;

  for (const inc of incomingItems) {
    const key = normalizeFileKey(inc.name);
    const firstMatchIdx = remainingExisting.findIndex(
      (item) => normalizeFileKey(item.name) === key
    );
    if (firstMatchIdx !== -1) {
      remainingExisting.splice(firstMatchIdx, 1);
      removedFirstCount++;
    }
  }

  const { nextItems, addedCount, rejectedCount } = enforceQueueLimit(
    remainingExisting,
    incomingItems,
    maxFiles
  );

  return {
    nextItems,
    removedFirstCount,
    addedCount,
    rejectedCount,
  };
}

/**
 * Option 2: "Add this same file again"
 * Keeps the existing file(s) in the queue and appends the same file(s) again
 * with distinct item IDs so both instances can be merged into one output.
 */
export function resolveDuplicateAddAgain(
  existingItems: MergeFileItem[],
  incomingItems: MergeFileItem[],
  maxFiles = MAX_QUEUE_FILES
): {
  nextItems: MergeFileItem[];
  addedCount: number;
  rejectedCount: number;
  limitReached: boolean;
} {
  const now = Date.now();
  const clonedIncoming = incomingItems.map((item, idx) => ({
    ...item,
    id: `${item.id}-dup-${now}-${idx}`,
    addedAt: now + idx,
  }));

  return enforceQueueLimit(existingItems, clonedIncoming, maxFiles);
}


