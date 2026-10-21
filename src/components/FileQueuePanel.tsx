import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  FilePlus2,
  FolderOpen,
  Grid,
  GripVertical,
  List,
  Maximize2,
  Pencil,
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
import { BrandIcon, FormatCategoryIcon } from './BrandIcon';

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
  onReorderByIndex: (fromIndex: number, toIndex: number) => void;
  onRotateItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  onUpdatePageRange: (id: string, range: string) => void;
  onUpdateFitMode: (id: string, fit: ImageFitMode) => void;
  onSortQueue: (by: 'name' | 'size' | 'type' | 'pages') => void;
  onOpenQuickLook: (itemId: string) => void;
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
  onReorderByIndex,
  onRotateItem,
  onDuplicateItem,
  onRemoveItem,
  onRenameItem,
  onUpdatePageRange,
  onUpdateFitMode,
  onSortQueue,
  onOpenQuickLook,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOverZone, setIsDraggingOverZone] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Interactive Drag-to-Reorder state
  const [draggedMasterIndex, setDraggedMasterIndex] = useState<number | null>(null);
  const [dragOverMasterIndex, setDragOverMasterIndex] = useState<number | null>(null);

  // Interactive Inline Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverZone(false);
    if (draggedMasterIndex !== null) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const startEditingName = (item: MergeFileItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const commitEditingName = (id: string) => {
    if (editingName.trim()) {
      onRenameItem(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <section
      aria-label="Source File Queue"
      onDragOver={(e) => {
        e.preventDefault();
        if (draggedMasterIndex === null) {
          setIsDraggingOverZone(true);
        }
      }}
      onDragLeave={() => setIsDraggingOverZone(false)}
      onDrop={handleDropZone}
      className={`flex flex-col bg-white border border-zinc-200 rounded-lg shadow-2xs transition-colors duration-150 ${
        isDraggingOverZone ? 'border-zinc-900 bg-zinc-50' : ''
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
        <div className="flex items-center gap-2.5">
          <BrandIcon className="w-5 h-5 shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-zinc-900 balance-text leading-tight">
              Source Document & Image Queue
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
              <span>{items.length} queued files</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Drag rows to reorder · Click any row to sync preview</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Files</span>
          </button>

          <button
            type="button"
            onClick={onOpenNoteModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 active:scale-[0.98] rounded transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Text Page</span>
          </button>

          <button
            type="button"
            onClick={onLoadSampleBundle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 active:scale-[0.98] rounded transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Sample Bundle</span>
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
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
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-zinc-50 border border-zinc-300 rounded text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
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
                className={`px-2 py-0.5 text-xs font-medium rounded-xs transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
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
          <BrandIcon className="w-11 h-11 mb-3" />
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
        /* Interactive Drag-and-Drop Table List View */
        <div className="divide-y divide-zinc-200">
          {filteredItems.map((item) => {
            const masterIndex = items.findIndex((x) => x.id === item.id);
            const activePages = parsePageRange(item.pageRange, item.pageCount);
            const isSelected = selectedItemId === item.id;
            const isDragTarget = dragOverMasterIndex === masterIndex && draggedMasterIndex !== masterIndex;

            return (
              <div
                key={item.id}
                draggable={editingId !== item.id}
                onDragStart={(e) => {
                  setDraggedMasterIndex(masterIndex);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedMasterIndex !== null) {
                    setDragOverMasterIndex(masterIndex);
                  }
                }}
                onDragEnd={() => {
                  setDraggedMasterIndex(null);
                  setDragOverMasterIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedMasterIndex !== null && draggedMasterIndex !== masterIndex) {
                    onReorderByIndex(draggedMasterIndex, masterIndex);
                  }
                  setDraggedMasterIndex(null);
                  setDragOverMasterIndex(null);
                }}
                onClick={() => onSelectItem(item.id)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-4 py-2.5 transition-all duration-150 cursor-pointer ${
                  isDragTarget
                    ? 'bg-zinc-200/70'
                    : isSelected
                    ? 'bg-zinc-100/95'
                    : 'hover:bg-zinc-50'
                }`}
              >
                {/* Left: Drag Handle + Index + Interactive Thumbnail + Metadata */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    title="Drag row to reorder"
                    className="text-zinc-300 group-hover:text-zinc-500 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
                    aria-hidden="true"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </span>

                  <span className="font-mono text-xs font-semibold text-zinc-400 w-5 text-right tabular-nums shrink-0">
                    {String(masterIndex + 1).padStart(2, '0')}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item.id);
                      onOpenQuickLook(item.id);
                    }}
                    aria-label={`Quick-Look preview of ${item.name}`}
                    className="relative w-9 h-12 bg-zinc-100 border border-zinc-200 rounded-xs overflow-hidden shrink-0 flex items-center justify-center group/thumb cursor-pointer"
                  >
                    {item.thumbnailDataUrl ? (
                      <img
                        src={item.thumbnailDataUrl}
                        alt={`Thumbnail of ${item.name}`}
                        referrerPolicy="no-referrer"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                        className="w-full h-full object-cover transition-transform duration-150 group-hover/thumb:scale-105"
                      />
                    ) : (
                      <span className="font-mono text-[10px] font-semibold text-zinc-500">
                        {item.extension}
                      </span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {editingId === item.id ? (
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEditingName(item.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          aria-label={`Rename ${item.name}`}
                          className="px-2 py-0.5 text-xs font-semibold bg-white border border-zinc-900 rounded text-zinc-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => commitEditingName(item.id)}
                          aria-label="Save filename"
                          className="p-1 bg-zinc-900 text-white rounded cursor-pointer"
                        >
                          <Check className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <FormatCategoryIcon
                          category={item.category}
                          className="w-3.5 h-3.5 text-zinc-500 shrink-0"
                        />
                        <p
                          onDoubleClick={() => startEditingName(item)}
                          className="text-xs font-semibold text-zinc-900 truncate"
                        >
                          {item.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingName(item);
                          }}
                          aria-label={`Rename '${item.name}'`}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-800 rounded transition-opacity cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    {/* Zero-Pill Metadata Discipline: Clean unboxed text with middot separators */}
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

                {/* Right: Per-File Interactive Controls */}
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
                      onClick={() => onOpenQuickLook(item.id)}
                      aria-label={`Inspect '${item.name}' in Quick-Look`}
                      className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
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
        /* Interactive Thumbnail Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
          {filteredItems.map((item) => {
            const masterIndex = items.findIndex((x) => x.id === item.id);
            const isSelected = selectedItemId === item.id;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedMasterIndex(masterIndex)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedMasterIndex !== null && draggedMasterIndex !== masterIndex) {
                    onReorderByIndex(draggedMasterIndex, masterIndex);
                  }
                  setDraggedMasterIndex(null);
                }}
                onClick={() => onSelectItem(item.id)}
                className={`flex flex-col border rounded-md overflow-hidden transition-all duration-150 cursor-pointer ${
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
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <FormatCategoryIcon
                        category={item.category}
                        className="w-3.5 h-3.5 text-zinc-500 shrink-0"
                      />
                      <p className="text-xs font-semibold text-zinc-900 truncate">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between pt-1.5 border-t border-zinc-200/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onOpenQuickLook(item.id)}
                        aria-label={`Inspect '${item.name}' in Quick-Look`}
                        className="p-1 text-zinc-600 hover:text-zinc-900 rounded cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveItem(masterIndex, 'up')}
                        disabled={masterIndex <= 0}
                        aria-label={`Move '${item.name}' up`}
                        className="p-1 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 rounded cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveItem(masterIndex, 'down')}
                        disabled={masterIndex >= items.length - 1}
                        aria-label={`Move '${item.name}' down`}
                        className="p-1 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 rounded cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRotateItem(item.id)}
                        aria-label={`Rotate '${item.name}' 90 degrees`}
                        className="p-1 text-zinc-600 hover:text-zinc-900 rounded cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Delete '${item.name}'`}
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

      {/* Compact Desktop Footer Drop & Shortcut Bar */}
      {items.length > 0 && (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 rounded-b-lg">
          <span>
            Shortcuts: Press <kbd className="font-mono text-zinc-700">R</kbd> to rotate selected file · Double-click title to rename
          </span>
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
