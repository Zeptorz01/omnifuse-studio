import React, { useEffect } from 'react';
import { AlertTriangle, CopyPlus, RefreshCw, X } from 'lucide-react';
import { DuplicateFileConflict, MergeFileItem, StudioThemeId } from '../types/merger';
import { formatFileSize } from '../utils/mergeLogic';
import { FormatCategoryIcon } from './BrandIcon';

interface DuplicateFileModalProps {
  isOpen: boolean;
  conflicts: DuplicateFileConflict[];
  incomingItems: MergeFileItem[];
  activeThemeId?: StudioThemeId;
  onRemoveFirstAndAddThisOne: () => void;
  onAddSameFileAgain: () => void;
  onCancel: () => void;
}

export const DuplicateFileModal: React.FC<DuplicateFileModalProps> = ({
  isOpen,
  conflicts,
  incomingItems,
  activeThemeId = 'classic-layers',
  onRemoveFirstAndAddThisOne,
  onAddSameFileAgain,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || conflicts.length === 0) return null;

  const primaryConflict = conflicts[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-detector-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-zinc-300 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 block">
                Duplicate File Detector
              </span>
              <h2
                id="duplicate-detector-title"
                className="text-sm font-bold text-zinc-900 leading-snug"
              >
                You have added the same file twice
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close duplicate file detector menu"
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-600 leading-relaxed">
            OmniFuse File Detector noticed that{' '}
            <strong className="font-semibold text-zinc-900">
              {conflicts.length === 1
                ? `"${primaryConflict.incomingItem.name}"`
                : `${conflicts.length} incoming files`}
            </strong>{' '}
            already {conflicts.length === 1 ? 'exists' : 'exist'} in your active merge queue. Choose how you would like to handle this duplicate file:
          </p>

          {/* Detected Duplicate File Card(s) */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg divide-y divide-zinc-200 max-h-44 overflow-y-auto">
            {conflicts.map((conflict) => (
              <div
                key={`${conflict.existingItem.id}-${conflict.incomingItem.id}`}
                className="p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FormatCategoryIcon
                    category={conflict.incomingItem.category}
                    themeId={activeThemeId}
                    className="w-4 h-4 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {conflict.incomingItem.name}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500 tabular-nums">
                      Already in Queue at Slot #{String(conflict.existingIndex + 1).padStart(2, '0')} ·{' '}
                      {conflict.incomingItem.extension} · {conflict.incomingItem.pageCount}{' '}
                      {conflict.incomingItem.pageCount === 1 ? 'page' : 'pages'} ·{' '}
                      {formatFileSize(conflict.incomingItem.sizeBytes)}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300 rounded-xs shrink-0">
                  Duplicate
                </span>
              </div>
            ))}
          </div>

          {incomingItems.length > conflicts.length && (
            <p className="text-[11px] font-mono text-zinc-500">
              Note: {incomingItems.length - conflicts.length} other non-duplicate{' '}
              {incomingItems.length - conflicts.length === 1 ? 'file' : 'files'} in this selection will also be added.
            </p>
          )}

          {/* Action Menu Options */}
          <div className="space-y-2 pt-1" role="menu" aria-label="Duplicate file resolution menu">
            <button
              type="button"
              role="menuitem"
              onClick={onRemoveFirstAndAddThisOne}
              className="w-full p-3 text-left rounded-lg border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center justify-between gap-3 cursor-pointer studio-accent-btn"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-xs font-bold block">
                    Remove the first file and add this one
                  </span>
                  <span className="text-[11px] opacity-85 block mt-0.5">
                    Deletes the earlier copy at Slot #{String(primaryConflict.existingIndex + 1).padStart(2, '0')} and adds this newly selected file
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={onAddSameFileAgain}
              className="w-full p-3 text-left rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 transition-colors flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CopyPlus className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-xs font-bold block">
                    Add this same file again
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    Keeps the first file in the queue and appends this duplicate file as an additional entry
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono text-[11px]">
            Active File Detector: Prevents accidental duplicate merges
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/60 rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
