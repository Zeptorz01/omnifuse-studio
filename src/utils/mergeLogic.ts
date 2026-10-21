import {
  FileCategory,
  ImageFitMode,
  MarginPreset,
  MergeFileItem,
  MergeSettings,
  PageOrientation,
  PageSizePreset,
  RotationAngle,
  WorkspacePreset,
} from '../types/merger';

export const DEFAULT_MERGE_SETTINGS: MergeSettings = {
  outputFilename: 'unified-document-package',
  documentTitle: 'Unified Document Package',
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
