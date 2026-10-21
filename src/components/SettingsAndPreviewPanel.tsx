import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Layers,
  Sliders,
} from 'lucide-react';
import {
  MarginPreset,
  MergeSettings,
  OutputFormat,
  PageOrientation,
  PageSizePreset,
  StitchDirection,
} from '../types/merger';
import { formatFileSize } from '../utils/mergeLogic';

interface SettingsAndPreviewPanelProps {
  settings: MergeSettings;
  onUpdateSettings: (patch: Partial<MergeSettings>) => void;
  previewPages: string[];
  isRenderingPreview: boolean;
  totalFiles: number;
  totalSelectedPages: number;
  totalSizeBytes: number;
  onExecuteMerge: () => void;
  isMerging: boolean;
}

export const SettingsAndPreviewPanel: React.FC<SettingsAndPreviewPanelProps> = ({
  settings,
  onUpdateSettings,
  previewPages,
  isRenderingPreview,
  totalFiles,
  totalSelectedPages,
  totalSizeBytes,
  onExecuteMerge,
  isMerging,
}) => {
  const [activePreviewPageIndex, setActivePreviewPageIndex] = useState(0);
  const [inspectorSection, setInspectorSection] = useState<'preview' | 'settings'>('preview');

  const safePageIdx = Math.min(
    Math.max(0, activePreviewPageIndex),
    Math.max(0, previewPages.length - 1)
  );

  const isStitchedMode =
    settings.outputFormat === 'stitched-png' || settings.outputFormat === 'stitched-jpeg';

  const outputFormatLabels: Record<OutputFormat, string> = {
    pdf: 'Unified PDF Document (.pdf)',
    'stitched-png': 'Continuous Stitched Image (.png)',
    'stitched-jpeg': 'Stitched Proof Sheet (.jpg)',
    'zip-bundle': 'Indexed ZIP Archive (.zip)',
  };

  return (
    <aside
      aria-label="Output Settings and Live Document Inspector"
      className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Top Segmented Mode Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div
          role="group"
          aria-label="Inspector panel mode"
          className="grid grid-cols-2 gap-1 p-1 bg-slate-200/75 rounded-lg"
        >
          <button
            type="button"
            onClick={() => setInspectorSection('preview')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              inspectorSection === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Live Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setInspectorSection('settings')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              inspectorSection === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Output Parameters</span>
          </button>
        </div>
      </div>

      {/* Target Output Format Selector (Always Visible) */}
      <div className="p-5 border-b border-slate-200 space-y-3">
        <div>
          <label
            htmlFor="target-output-format"
            className="block text-xs font-semibold text-slate-900 mb-1.5"
          >
            Unified Target Format
          </label>
          <select
            id="target-output-format"
            value={settings.outputFormat}
            onChange={(e) => {
              onUpdateSettings({ outputFormat: e.target.value as OutputFormat });
              setActivePreviewPageIndex(0);
            }}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
          >
            {(Object.keys(outputFormatLabels) as OutputFormat[]).map((fmt) => (
              <option key={fmt} value={fmt}>
                {outputFormatLabels[fmt]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="output-filename-input"
            className="block text-xs font-semibold text-slate-900 mb-1.5"
          >
            Output Filename
          </label>
          <input
            id="output-filename-input"
            type="text"
            value={settings.outputFilename}
            onChange={(e) => onUpdateSettings({ outputFilename: e.target.value })}
            placeholder="unified-document-package"
            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {inspectorSection === 'preview' ? (
        /* Live Page Preview Canvas Area */
        <div className="p-5 flex flex-col items-center justify-between flex-1 bg-slate-100/70">
          {previewPages.length === 0 ? (
            <div className="py-16 text-center">
              <Layers className="w-7 h-7 text-slate-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs font-medium text-slate-600">
                Add files to inspect the live merged document preview
              </p>
            </div>
          ) : (
            <>
              <div className="w-full flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-slate-600 tabular-nums">
                  {isStitchedMode
                    ? 'Continuous Stitched Canvas'
                    : `Sheet ${safePageIdx + 1} of ${previewPages.length}`}
                </span>

                {!isStitchedMode && previewPages.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActivePreviewPageIndex((p) => Math.max(0, p - 1))}
                      disabled={safePageIdx <= 0}
                      aria-label="Previous preview page"
                      className="p-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreviewPageIndex((p) =>
                          Math.min(previewPages.length - 1, p + 1)
                        )
                      }
                      disabled={safePageIdx >= previewPages.length - 1}
                      aria-label="Next preview page"
                      className="p-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full h-80 bg-slate-200/70 border border-slate-300/80 rounded-lg flex items-center justify-center p-3 overflow-auto">
                {isRenderingPreview ? (
                  <p className="text-xs font-mono text-slate-500">Rendering page layout...</p>
                ) : (
                  <img
                    src={previewPages[safePageIdx]}
                    alt={`Merged document page ${safePageIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain bg-white shadow-sm"
                  />
                )}
              </div>

              {/* Quick Toggles Under Preview */}
              <div className="w-full mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                {!isStitchedMode ? (
                  <>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.includePageNumbers}
                        onChange={(e) =>
                          onUpdateSettings({ includePageNumbers: e.target.checked })
                        }
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>Stamp Page Numbers</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.includeTableOfContents}
                        onChange={(e) =>
                          onUpdateSettings({ includeTableOfContents: e.target.checked })
                        }
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>Include Cover Index</span>
                    </label>
                  </>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <span className="text-slate-600">Stitch Direction:</span>
                    <select
                      aria-label="Stitch direction"
                      value={settings.stitchDirection}
                      onChange={(e) =>
                        onUpdateSettings({
                          stitchDirection: e.target.value as StitchDirection,
                        })
                      }
                      className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    >
                      <option value="vertical">Vertical Roll</option>
                      <option value="horizontal">Horizontal Filmstrip</option>
                      <option value="grid-2col">2-Column Proof Grid</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Detailed Output Settings Form */
        <div className="p-5 space-y-4 flex-1">
          {!isStitchedMode ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="page-size-select"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Page Dimensions
                  </label>
                  <select
                    id="page-size-select"
                    value={settings.pageSize}
                    onChange={(e) =>
                      onUpdateSettings({ pageSize: e.target.value as PageSizePreset })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="a4">ISO A4 (210×297mm)</option>
                    <option value="letter">US Letter (8.5×11in)</option>
                    <option value="legal">US Legal (8.5×14in)</option>
                    <option value="auto">Match Source Dimensions</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="page-orientation-select"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Orientation
                  </label>
                  <select
                    id="page-orientation-select"
                    value={settings.orientation}
                    onChange={(e) =>
                      onUpdateSettings({ orientation: e.target.value as PageOrientation })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="auto">Auto-Detect</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="page-margin-select"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Page Margin
                  </label>
                  <select
                    id="page-margin-select"
                    value={settings.margin}
                    onChange={(e) =>
                      onUpdateSettings({ margin: e.target.value as MarginPreset })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="none">Full Bleed (0 pt)</option>
                    <option value="compact">Compact (18 pt)</option>
                    <option value="standard">Standard (40 pt)</option>
                    <option value="wide">Generous (64 pt)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="watermark-input"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Watermark Stamp
                  </label>
                  <input
                    id="watermark-input"
                    type="text"
                    value={settings.watermarkText}
                    onChange={(e) => onUpdateSettings({ watermarkText: e.target.value })}
                    placeholder="e.g. CONFIDENTIAL"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="doc-title-input"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Document Metadata Title
                  </label>
                  <input
                    id="doc-title-input"
                    type="text"
                    value={settings.documentTitle}
                    onChange={(e) => onUpdateSettings({ documentTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="doc-author-input"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Author / Department
                  </label>
                  <input
                    id="doc-author-input"
                    type="text"
                    value={settings.documentAuthor}
                    onChange={(e) => onUpdateSettings({ documentAuthor: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="stitch-direction-select"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Stitch Arrangement
                </label>
                <select
                  id="stitch-direction-select"
                  value={settings.stitchDirection}
                  onChange={(e) =>
                    onUpdateSettings({ stitchDirection: e.target.value as StitchDirection })
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="vertical">Vertical Continuous Strip</option>
                  <option value="horizontal">Horizontal Panorama Strip</option>
                  <option value="grid-2col">2-Column Contact Sheet</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="stitch-spacing-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Gutter Spacing ({settings.stitchSpacingPx} px)
                </label>
                <input
                  id="stitch-spacing-input"
                  type="range"
                  min={0}
                  max={48}
                  step={4}
                  value={settings.stitchSpacingPx}
                  onChange={(e) =>
                    onUpdateSettings({ stitchSpacingPx: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary Bottom Export CTA */}
      <div className="p-5 bg-white border-t border-slate-200">
        <button
          type="button"
          onClick={onExecuteMerge}
          disabled={totalFiles === 0 || isMerging}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>
            {isMerging
              ? 'Merging Files...'
              : `Compile & Download ${
                  settings.outputFormat === 'pdf'
                    ? 'Unified PDF'
                    : settings.outputFormat === 'zip-bundle'
                    ? 'ZIP Archive'
                    : 'Stitched Image'
                }`}
          </span>
        </button>
      </div>
    </aside>
  );
};
