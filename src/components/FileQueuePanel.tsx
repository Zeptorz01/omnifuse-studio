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
      className={`flex flex-col bg-white border border-zinc-200 rounded-lg transition-colors ${
        isDraggingOver ? 'border-zinc-900 bg-zinc-50' : ''
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

      {/* Compact Desktop Queue Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-50 border-b border-zinc-200 rounded-t-lg">
        <div>
          <h1 className="text-sm font-bold text-zinc-900 balance-text">
            Source Document & Image Queue
          </h1>
          <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
            <span>{items.length} queued files</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>PDF, JPG, PNG, WebP, SVG, Markdown, TXT, CSV</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Files</span>
          </button>

          <button
            type="button"
            onClick={onOpenNoteModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Text Page</span>
          </button>

          <button
            type="button"
            onClick={onLoadSampleBundle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Sample Bundle</span>
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-white border-b border-zinc-200">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[220px]">
          <div className="relative flex-1 max-w-xs">
            <Search
              className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter queue by filename or format..."
              aria-label="Filter queue by filename or format"
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-zinc-50 border border-zinc-300 rounded text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900"
            />
          </div>

          <div
            role="group"
            aria-label="Filter files by category"
            className="flex items-center gap-0.5 p-0.5 bg-zinc-200/75 rounded"
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
                className={`px-2 py-0.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-queue-select" className="text-xs text-zinc-500 whitespace-nowrap">
            Sort:
          </label>
          <select
            id="sort-queue-select"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value as 'name' | 'size' | 'type' | 'pages';
              if (val) onSortQueue(val);
            }}
            className="px-2 py-1 text-xs bg-zinc-50 border border-zinc-300 rounded text-zinc-700 focus:outline-none focus:border-zinc-900"
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
            className="flex items-center gap-0.5 p-0.5 bg-zinc-200/75 rounded"
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Table list view"
              className={`p-1 rounded-xs transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <List className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Thumbnail grid view"
              className={`p-1 rounded-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-6 py-12">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 mb-3">
            <FileText className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Drop PDFs, JPEGs, PNGs, or text files here to combine
          </h2>
          <p className="text-xs text-zinc-500 max-w-md mt-1 leading-relaxed">
            Arrange files in any sequence, slice specific page ranges, rotate scans, and compile everything into one unified document.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Browse Local Files
            </button>
            <button
              type="button"
              onClick={onLoadSampleBundle}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 rounded transition-colors cursor-pointer"
            >
              Load 4 Sample Files
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-xs font-medium text-zinc-700">No queued files match your filter.</p>
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onCategoryFilterChange('all');
            }}
            className="mt-2.5 px-3 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* Compact Desktop Table List View */
        <div className="divide-y divide-zinc-200">
          {filteredItems.map((item) => {
            const masterIndex = items.findIndex((x) => x.id === item.id);
            const activePages = parsePageRange(item.pageRange, item.pageCount);
            const isSelected = selectedItemId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-4 py-2.5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-zinc-100/90' : 'hover:bg-zinc-50'
                }`}
              >
                {/* Left: Sequence Index + Thumbnail + Unboxed Metadata */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-xs font-semibold text-zinc-400 w-5 text-right tabular-nums shrink-0">
                    {String(masterIndex + 1).padStart(2, '0')}
                  </span>

                  <div className="w-9 h-12 bg-zinc-100 border border-zinc-200 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                    {item.thumbnailDataUrl ? (
                      <img
                        src={item.thumbnailDataUrl}
                        alt={`Thumbnail of ${item.name}`}
                        referrerPolicy="no-referrer"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                        className="w-full h-full object-cover transition-transform duration-150"
                      />
                    ) : (
                      <span className="font-mono text-[10px] font-semibold text-zinc-500">
                        {item.extension}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 font-mono tabular-nums mt-0.5">
                      <span className="font-semibold text-zinc-700">{item.extension}</span>
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
                          <span className="text-zinc-900 font-medium">Rotated {item.rotation}°</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Per-File Controls */}
                <div
                  className="flex flex-wrap items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.pageCount > 1 && (
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor={`range-${item.id}`}
                        className="text-[11px] text-zinc-500 whitespace-nowrap"
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
                        className="w-16 px-1.5 py-0.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-800 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  )}

                  {item.category === 'image' && (
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor={`fit-${item.id}`}
                        className="text-[11px] text-zinc-500 whitespace-nowrap"
                      >
                        Scaling:
                      </label>
                      <select
                        id={`fit-${item.id}`}
                        value={item.fitMode}
                        onChange={(e) => onUpdateFitMode(item.id, e.target.value as ImageFitMode)}
                        aria-label={`Scaling mode for ${item.name}`}
                        className="px-1.5 py-0.5 text-xs bg-white border border-zinc-300 rounded text-zinc-700 focus:outline-none focus:border-zinc-900"
                      >
                        <option value="contain">Fit Page</option>
                        <option value="cover">Fill Page</option>
                        <option value="original">Original Ratio</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-0.5 border-l border-zinc-200 pl-2">
                    <button
                      type="button"
                      onClick={() => onMoveItem(masterIndex, 'up')}
                      disabled={masterIndex <= 0}
                      aria-label={`Move '${item.name}' up`}
                      className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 disabled:opacity-30 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveItem(masterIndex, 'down')}
                      disabled={masterIndex >= items.length - 1}
                      aria-label={`Move '${item.name}' down`}
                      className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 disabled:opacity-30 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRotateItem(item.id)}
                      aria-label={`Rotate '${item.name}' 90 degrees`}
                      className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateItem(item.id)}
                      aria-label={`Duplicate '${item.name}'`}
                      className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Delete '${item.name}'`}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
          {filteredItems.map((item) => {
            const masterIndex = items.findIndex((x) => x.id === item.id);
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`flex flex-col border rounded-md overflow-hidden transition-colors cursor-pointer ${
                  isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="h-36 bg-zinc-100 border-b border-zinc-200 flex items-center justify-center p-2.5 overflow-hidden">
                  <img
                    src={item.thumbnailDataUrl}
                    alt={`Preview of ${item.name}`}
                    referrerPolicy="no-referrer"
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                    className="max-h-full max-w-full object-contain shadow-2xs transition-transform duration-150"
                  />
                </div>
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                        #{String(masterIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-600 tabular-nums">
                        {item.extension} · {item.pageCount}p · {formatFileSize(item.sizeBytes)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5">
                      {item.name}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between pt-1.5 border-t border-zinc-200/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onMoveItem(masterIndex, 'up')}
                        disabled={masterIndex <= 0}
                        aria-label={`Move '${item.name}' up`}
                        className="p-1 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 rounded"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveItem(masterIndex, 'down')}
                        disabled={masterIndex >= items.length - 1}
                        aria-label={`Move '${item.name}' down`}
                        className="p-1 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 rounded"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRotateItem(item.id)}
                        aria-label={`Rotate '${item.name}' 90 degrees`}
                        className="p-1 text-zinc-600 hover:text-zinc-900 rounded"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Delete '${item.name}'`}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
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

      {/* Compact Desktop Footer Drop Bar */}
      {items.length > 0 && (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 rounded-b-lg">
          <span>Drop additional PDF, JPG, PNG, or Markdown files anywhere in this queue.</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-semibold text-zinc-900 hover:underline cursor-pointer"
          >
            + Append More Files
          </button>
        </div>
      )}
    </section>
  );
};
