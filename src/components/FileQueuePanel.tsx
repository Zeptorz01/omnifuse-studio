import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  FilePlus2,
  FileText,
  FolderOpen,
  Grid,
  List,
  RotateCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  FileCategory,
  ImageFitMode,
  MergeFileItem,
} from '../types/merger';
import { formatFileSize, parsePageRange } from '../utils/mergeLogic';

interface FileQueuePanelProps {
  items: MergeFileItem[];
  filteredItems: MergeFileItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: 'all' | FileCategory;
  onCategoryFilterChange: (cat: 'all' | FileCategory) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onLoadSampleBundle: () => void;
  onOpenNoteModal: () => void;
  onClearAll: () => void;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onRotateItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePageRange: (id: string, range: string) => void;
  onUpdateFitMode: (id: string, fit: ImageFitMode) => void;
  onSortQueue: (by: 'name' | 'size' | 'type' | 'pages') => void;
}

export const FileQueuePanel: React.FC<FileQueuePanelProps> = ({
  items,
  filteredItems,
  selectedItemId,
  onSelectItem,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  onAddFiles,
  onLoadSampleBundle,
  onOpenNoteModal,
  onClearAll,
  onMoveItem,
  onRotateItem,
  onDuplicateItem,
  onRemoveItem,
  onUpdatePageRange,
  onUpdateFitMode,
  onSortQueue,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  return (
    <section
      aria-label="Source File Queue"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col bg-white border border-slate-200 rounded-xl transition-colors ${
        isDraggingOver ? 'border-slate-900 bg-slate-50' : ''
      }`}
    >
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.txt,.md,.csv,.json,.log"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
        className="sr-only"
        aria-label="Upload files to merge"
      />

      {/* Queue Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 balance-text">
            Source Document & Image Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            <span>{items.length} queued files</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Supports PDF, JPG, PNG, WebP, SVG, Markdown, TXT, CSV</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Files</span>
          </button>

          <button
            type="button"
            onClick={onOpenNoteModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Text Page</span>
          </button>

          <button
            type="button"
            onClick={onLoadSampleBundle}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Sample Bundle</span>
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/70 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-xs">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter queue by filename or format..."
              aria-label="Filter queue by filename or format"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Interactive Filter Controls (Functional Segmented Buttons) */}
          <div
            role="group"
            aria-label="Filter files by category"
            className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
          >
            {(
              [
                { id: 'all', label: 'All Formats' },
                { id: 'pdf', label: 'PDF' },
                { id: 'image', label: 'Images' },
                { id: 'text', label: 'Text & Notes' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onCategoryFilterChange(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-queue-select" className="text-xs text-slate-500 whitespace-nowrap">
            Sort:
          </label>
          <select
            id="sort-queue-select"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value as 'name' | 'size' | 'type' | 'pages';
              if (val) onSortQueue(val);
            }}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-900"
          >
            <option value="" disabled>
              Custom Queue Order
            </option>
            <option value="name">Filename (A–Z)</option>
            <option value="type">Format Type</option>
            <option value="pages">Page Count</option>
            <option value="size">File Size</option>
          </select>

          <div
            role="group"
            aria-label="Queue layout view"
            className="flex items-center gap-0.5 p-1 bg-slate-200/70 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Table list view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Thumbnail grid view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
            <FileText className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Drop PDFs, JPEGs, PNGs, or text files here to combine
          </h2>
          <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
            Arrange files in any sequence, slice specific page ranges, rotate scans, and compile everything into a single unified PDF, stitched long image, or indexed ZIP bundle.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Browse Local Files
            </button>
            <button
              type="button"
              onClick={onLoadSampleBundle}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Load 4 Sample Files (PDF + JPG + PNG + MD)
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">No queued files match your filter.</p>
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onCategoryFilterChange('all');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* High-Density Table List View */
        <div className="divide-y divide-slate-200">
          {filteredItems.map((item) => {
            const masterIndex = items.findIndex((x) => x.id === item.id);
            const activePages = parsePageRange(item.pageRange, item.pageCount);
            const isSelected = selectedItemId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 px-5 py-3.5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                }`}
              >
                {/* Left: Sequence Index + Thumbnail + Unboxed Metadata */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="font-mono text-xs font-semibold text-slate-400 w-6 text-right tabular-nums shrink-0">
                    {String(masterIndex + 1).padStart(2, '0')}
                  </span>

                  <div className="w-11 h-14 bg-slate-100 border border-slate-200 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                    {item.thumbnailDataUrl ? (
                      <img
                        src={item.thumbnailDataUrl}
                        alt={`Thumbnail of ${item.name}`}
                        referrerPolicy="no-referrer"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                        className="w-full h-full object-cover transition-transform duration-150"
                      />
                    ) : (
                      <span className="font-mono text-[10px] font-semibold text-slate-500">
                        {item.extension}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {item.name}
                      </p>
                    </div>
                    {/* Zero-Pill Metadata Discipline: Clean unboxed text with middot separators */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                      <span className="font-semibold text-slate-700">{item.extension}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {activePages.length} of {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatFileSize(item.sizeBytes)}</span>
                      {item.width && item.height && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {item.width}×{item.height}
                          </span>
                        </>
                      )}
                      {item.rotation !== 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-800 font-medium">Rotated {item.rotation}°</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Per-File Controls (Page Range, Fit Mode, Reorder, Rotate, Duplicate, Delete) */}
                <div
                  className="flex flex-wrap items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.pageCount > 1 && (
                    <div className="flex items-center gap-1.5">
                      <label
                        htmlFor={`range-${item.id}`}
                        className="text-xs text-slate-500 whitespace-nowrap"
                      >
                        Pages:
                      </label>
                      <input
                        id={`range-${item.id}`}
                        type="text"
                        value={item.pageRange}
                        onChange={(e) => onUpdatePageRange(item.id, e.target.value)}
                        placeholder="all or 1-2"
                        aria-label={`Page range for ${item.name}`}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  )}

                  {item.category === 'image' && (
                    <div className="flex items-center gap-1.5">
                      <label
                        htmlFor={`fit-${item.id}`}
                        className="text-xs text-slate-500 whitespace-nowrap"
                      >
                        Scaling:
                      </label>
                      <select
                        id={`fit-${item.id}`}
                        value={item.fitMode}
                        onChange={(e) => onUpdateFitMode(item.id, e.target.value as ImageFitMode)}
                        aria-label={`Scaling mode for ${item.name}`}
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-slate-900"
                      >
                        <option value="contain">Fit Page</option>
                        <option value="cover">Fill Page</option>
                        <option value="original">Original Ratio</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                    <button
                      type="button"
                      onClick={() => onMoveItem(masterIndex, 'up')}
                      disabled={masterIndex <= 0}
                      aria-label={`Move '${item.name}' up`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveItem(masterIndex, 'down')}
                      disabled={masterIndex >= items.length - 1}
                      aria-label={`Move '${item.name}' down`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRotateItem(item.id)}
                      aria-label={`Rotate '${item.name}' 90 degrees`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateItem(item.id)}
                      aria-label={`Duplicate '${item.name}'`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Delete '${item.name}'`}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Thumbnail Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {filteredItems.map((item) => {
            const masterIndex = items.findIndex((x) => x.id === item.id);
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`flex flex-col border rounded-lg overflow-hidden transition-colors cursor-pointer ${
                  isSelected ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="h-44 bg-slate-100 border-b border-slate-200 flex items-center justify-center p-3 overflow-hidden">
                  <img
                    src={item.thumbnailDataUrl}
                    alt={`Preview of ${item.name}`}
                    referrerPolicy="no-referrer"
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                    className="max-h-full max-w-full object-contain shadow-xs transition-transform duration-150"
                  />
                </div>
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-400 tabular-nums">
                        #{String(masterIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-xs text-slate-600 tabular-nums">
                        {item.extension} · {item.pageCount}p · {formatFileSize(item.sizeBytes)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate mt-1">
                      {item.name}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between pt-2 border-t border-slate-200/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onMoveItem(masterIndex, 'up')}
                        disabled={masterIndex <= 0}
                        aria-label={`Move '${item.name}' up`}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveItem(masterIndex, 'down')}
                        disabled={masterIndex >= items.length - 1}
                        aria-label={`Move '${item.name}' down`}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRotateItem(item.id)}
                        aria-label={`Rotate '${item.name}' 90 degrees`}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Delete '${item.name}'`}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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

      {/* Footer Drop Hint */}
      {items.length > 0 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 rounded-b-xl">
          <span>Drag and drop additional PDF, JPG, PNG, or Markdown files anywhere in this panel.</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-semibold text-slate-900 hover:underline cursor-pointer"
          >
            + Append More Files
          </button>
        </div>
      )}
    </section>
  );
};
