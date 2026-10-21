import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface QuickLookModalProps {
  isOpen: boolean;
  pages: string[];
  pageIndex: number;
  onChangePageIndex: (idx: number) => void;
  onClose: () => void;
  onRotateActiveItem?: () => void;
  activeItemName?: string;
}

export const QuickLookModal: React.FC<QuickLookModalProps> = ({
  isOpen,
  pages,
  pageIndex,
  onChangePageIndex,
  onClose,
  onRotateActiveItem,
  activeItemName,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  if (!isOpen || pages.length === 0) return null;

  const safeIdx = Math.min(Math.max(0, pageIndex), Math.max(0, pages.length - 1));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quicklook-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[1px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white border border-zinc-300 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[86vh]"
      >
        {/* Compact Quick-Look Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-100 border-b border-zinc-200">
          <div className="flex items-center gap-2 min-w-0">
            <h2
              id="quicklook-modal-title"
              className="text-xs font-bold text-zinc-900 truncate"
            >
              Quick-Look Sheet Inspector
            </h2>
            {activeItemName && (
              <>
                <span className="text-zinc-400" aria-hidden="true">·</span>
                <span className="text-xs font-mono text-zinc-600 truncate">
                  {activeItemName}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-zinc-300 rounded px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 25))}
                aria-label="Zoom out sheet"
                className="p-0.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="font-mono text-[11px] text-zinc-700 w-10 text-center tabular-nums">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(200, z + 25))}
                aria-label="Zoom in sheet"
                className="p-0.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {onRotateActiveItem && (
              <button
                type="button"
                onClick={onRotateActiveItem}
                aria-label="Rotate active item 90 degrees"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Rotate 90°</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Quick-Look Inspector"
              className="p-1 text-zinc-500 hover:text-zinc-900 rounded cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Sheet Canvas Viewport */}
        <div className="flex-1 bg-zinc-200/80 p-5 overflow-auto flex items-center justify-center min-h-[360px]">
          <img
            src={pages[safeIdx]}
            alt={`Zoomed sheet ${safeIdx + 1} of ${pages.length}`}
            referrerPolicy="no-referrer"
            style={{
              width: `${Math.round((zoom / 100) * 420)}px`,
              maxWidth: 'none',
            }}
            className="bg-white shadow-md border border-zinc-300 transition-transform duration-150"
          />
        </div>

        {/* Bottom Sheet Navigation Bar */}
        <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs">
          <span className="font-mono text-zinc-600 tabular-nums">
            Compiled Sheet {safeIdx + 1} of {pages.length}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangePageIndex(Math.max(0, safeIdx - 1))}
              disabled={safeIdx <= 0}
              aria-label="Previous sheet in Quick-Look"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-zinc-300 rounded text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePageIndex(Math.min(pages.length - 1, safeIdx + 1))}
              disabled={safeIdx >= pages.length - 1}
              aria-label="Next sheet in Quick-Look"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-zinc-300 rounded text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
