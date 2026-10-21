export type FileCategory = 'pdf' | 'image' | 'text';

export type RotationAngle = 0 | 90 | 180 | 270;

export type ImageFitMode = 'contain' | 'cover' | 'original';

export type OutputFormat = 'pdf' | 'stitched-png' | 'stitched-jpeg' | 'zip-bundle';

export type PageSizePreset = 'a4' | 'letter' | 'legal' | 'auto';

export type PageOrientation = 'portrait' | 'landscape' | 'auto';

export type MarginPreset = 'none' | 'compact' | 'standard' | 'wide';

export type StitchDirection = 'vertical' | 'horizontal' | 'grid-2col';

export interface MergeFileItem {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  category: FileCategory;
  extension: string;
  pageCount: number;
  pageRange: string; // e.g., "all" or "1-2"
  rotation: RotationAngle;
  fitMode: ImageFitMode;
  addedAt: number;
  thumbnailDataUrl: string;
  rawBytes?: Uint8Array;
  textContent?: string;
  width?: number;
  height?: number;
  notes?: string;
}

export interface MergeSettings {
  outputFilename: string;
  documentTitle: string;
  documentAuthor: string;
  outputFormat: OutputFormat;
  pageSize: PageSizePreset;
  orientation: PageOrientation;
  margin: MarginPreset;
  includePageNumbers: boolean;
  includeTableOfContents: boolean;
  watermarkText: string;
  imageQuality: number; // 0.5 to 1.0
  stitchDirection: StitchDirection;
  stitchSpacingPx: number;
  backgroundColor: string;
}

export interface ExportHistoryItem {
  id: string;
  filename: string;
  outputFormat: OutputFormat;
  totalFiles: number;
  totalPages: number;
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
  previewPages: string[];
}

export interface WorkspacePreset {
  id: string;
  name: string;
  description: string;
  targetUse: string;
  settings: Partial<MergeSettings>;
}
