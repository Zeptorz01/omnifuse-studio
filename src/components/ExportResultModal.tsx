import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
} from 'lucide-react';
import { ExportHistoryItem } from '../types/merger';
import { formatFileSize } from '../utils/mergeLogic';

interface ExportResultModalProps {
  result: ExportHistoryItem | null;
  onClose: () => void;
}

export const ExportResultModal: React.FC<ExportResultModalProps> = ({
  result,
  onClose,
}) => {
  const [pageIdx, setPageIdx] = useState(0);

  if (!result) return null;

  const safeIdx = Math.min(
    Math.max(0, pageIdx),
    Math.max(0, result.previewPages.length - 1)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 p-4"
    >
      <div className="w-full max-w-sm bg-white border border-zinc-300 rounded-lg shadow-xl overflow-hidden">
        {/* Compact Native Dialog Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <h2 id="export-complete-title" className="text-xs font-semibold text-zinc-900">
              Unified File Ready
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="p-1 text-zinc-500 hover:text-zinc-900 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Compact File Summary + Mini Thumbnail Row */}
        <div className="p-4 flex items-center gap-3.5">
          {result.previewPages.length > 0 && (
            <div className="relative w-16 h-20 bg-zinc-100 border border-zinc-200 rounded flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src={result.previewPages[safeIdx]}
                alt={`Compiled output sheet ${safeIdx + 1}`}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain bg-white shadow-2xs"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-900 font-mono truncate">
              {result.filename}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono tabular-nums mt-1">
              {result.totalFiles} files · {result.totalPages}{' '}
              {result.totalPages === 1 ? 'page' : 'pages'} · {formatFileSize(result.sizeBytes)}
            </p>

            {result.previewPages.length > 1 && (
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                  disabled={safeIdx <= 0}
                  aria-label="Previous compiled sheet"
                  className="p-0.5 bg-zinc-100 border border-zinc-200 rounded text-zinc-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                </button>
                <span className="font-mono text-[11px] text-zinc-600 tabular-nums">
                  Page {safeIdx + 1}/{result.previewPages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPageIdx((p) =>
                      Math.min(result.previewPages.length - 1, p + 1)
                    )
                  }
                  disabled={safeIdx >= result.previewPages.length - 1}
                  aria-label="Next compiled sheet"
                  className="p-0.5 bg-zinc-100 border border-zinc-200 rounded text-zinc-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Compact Action Footer */}
        <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded cursor-pointer"
          >
            Done
          </button>
          <a
            href={result.downloadUrl}
            download={result.filename}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save File</span>
          </a>
        </div>
      </div>
    </div>
  );
};
