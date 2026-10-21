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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
            <div>
              <h2 id="export-complete-title" className="text-base font-bold text-slate-900">
                Unified Document Compiled Successfully
              </h2>
              <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                {result.filename} · {result.totalFiles} source files merged · {result.totalPages}{' '}
                {result.totalPages === 1 ? 'page' : 'pages'} · {formatFileSize(result.sizeBytes)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 bg-slate-100/80 flex flex-col items-center">
          {result.previewPages.length > 0 && (
            <>
              <div className="w-full flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-slate-600 tabular-nums">
                  Compiled Sheet {safeIdx + 1} of {result.previewPages.length}
                </span>
                {result.previewPages.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                      disabled={safeIdx <= 0}
                      aria-label="Previous compiled sheet"
                      className="p-1.5 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPageIdx((p) =>
                          Math.min(result.previewPages.length - 1, p + 1)
                        )
                      }
                      disabled={safeIdx >= result.previewPages.length - 1}
                      aria-label="Next compiled sheet"
                      className="p-1.5 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full h-80 bg-slate-200/70 border border-slate-300 rounded-lg flex items-center justify-center p-3 overflow-auto">
                <img
                  src={result.previewPages[safeIdx]}
                  alt={`Compiled output sheet ${safeIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain bg-white shadow-sm"
                />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Saved to your session Export History for one-click retrieval.
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Return to Workspace
            </button>
            <a
              href={result.downloadUrl}
              download={result.filename}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download {result.filename}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
