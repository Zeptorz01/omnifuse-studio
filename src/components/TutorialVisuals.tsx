import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  RotateCw,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { MAX_QUEUE_FILES, STUDIO_THEMES } from '../utils/mergeLogic';

export type StickerVariant =
  | 'drop-50'
  | 'unlimited-pages'
  | 'duplicate-guard'
  | 'page-slicer'
  | 'rotate-fit'
  | 'unified-export';

interface TutorialStickerProps {
  variant: StickerVariant;
  className?: string;
  onClick?: () => void;
}

/**
 * Die-cut glossy vinyl sticker with thick white peel border, subtle drop shadow,
 * multi-layered vector illustration, and friendly everyday language for Ratan.
 */
export const TutorialSticker: React.FC<TutorialStickerProps> = ({
  variant,
  className = '',
  onClick,
}) => {
  const interactiveClass = onClick
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] transition-all'
    : 'transition-all';

  switch (variant) {
    case 'drop-50':
      return (
        <div
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={
            onClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                  }
                }
              : undefined
          }
          className={`inline-flex items-center gap-3 px-3.5 py-2.5 bg-emerald-50/90 border-2 border-white ring-2 ring-emerald-500/80 rounded-2xl shadow-sm ${interactiveClass} ${className}`}
        >
          <svg viewBox="0 0 52 52" className="w-12 h-12 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="48" height="48" rx="14" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
            {/* Illustrated Folder Back */}
            <path
              d="M9 20C9 18.3431 10.3431 17 12 17H20L23 20H40C41.6569 20 43 21.3431 43 23V38C43 39.6569 41.6569 41 40 41H12C10.3431 41 9 39.6569 9 38V20Z"
              fill="#10B981"
            />
            {/* Illustrated PDF & Photo Cards Dropping In */}
            <g transform="rotate(-10 14 9)">
              <rect x="12" y="8" width="12" height="15" rx="2" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
              <text x="18" y="17.5" textAnchor="middle" fill="#1D4ED8" fontSize="5.5" fontWeight="800">
                PDF
              </text>
            </g>
            <g transform="rotate(9 26 8)">
              <rect x="26" y="7" width="12" height="15" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="30" cy="12" r="1.5" fill="#F59E0B" />
              <path d="M27.5 19L30.5 15L33 17.5L35 15.5L36.5 19H27.5Z" fill="#D97706" />
            </g>
            {/* Die-cut 50 Files Badge */}
            <rect x="15" y="25" width="22" height="11" rx="5.5" fill="#FFFFFF" stroke="#047857" strokeWidth="1.2" />
            <text x="26" y="32.5" textAnchor="middle" fill="#065F46" fontSize="7.2" fontWeight="800">
              50 FILES
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 block">
              Sticker #1 · Big Batch
            </span>
            <span className="text-xs font-extrabold text-zinc-900 block leading-snug">
              Combine Up to {MAX_QUEUE_FILES} Files
            </span>
            <span className="text-[11px] text-zinc-600 block mt-0.5">
              Mix PDFs, photos, receipts & notes
            </span>
          </div>
        </div>
      );

    case 'unlimited-pages':
      return (
        <div
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          className={`inline-flex items-center gap-3 px-3.5 py-2.5 bg-sky-50/90 border-2 border-white ring-2 ring-sky-500/80 rounded-2xl shadow-sm ${interactiveClass} ${className}`}
        >
          <svg viewBox="0 0 52 52" className="w-12 h-12 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="48" height="48" rx="14" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
            {/* Layered Book Pages */}
            <rect x="11" y="9" width="18" height="24" rx="2.5" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.4" />
            <rect x="15" y="12" width="18" height="24" rx="2.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.4" />
            <rect x="19" y="15" width="18" height="24" rx="2.5" fill="#FFFFFF" stroke="#0369A1" strokeWidth="1.6" />
            <path d="M23 21H33M23 25H33M23 29H29" stroke="#0284C7" strokeWidth="1.6" strokeLinecap="round" />
            {/* Infinity Badge */}
            <circle cx="37" cy="36" r="8" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
            <text x="37" y="39.5" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
              ∞
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-sky-700 block">
              Sticker #2 · Zero Page Cap
            </span>
            <span className="text-xs font-extrabold text-zinc-900 block leading-snug">
              Unlimited Pages Per File
            </span>
            <span className="text-[11px] text-zinc-600 block mt-0.5">
              1 page or 500+ pages—every page kept
            </span>
          </div>
        </div>
      );

    case 'duplicate-guard':
      return (
        <div
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          className={`inline-flex items-center gap-3 px-3.5 py-2.5 bg-amber-50/90 border-2 border-white ring-2 ring-amber-500/80 rounded-2xl shadow-sm ${interactiveClass} ${className}`}
        >
          <svg viewBox="0 0 52 52" className="w-12 h-12 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="48" height="48" rx="14" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
            {/* Twin Identical Pages */}
            <rect x="9" y="11" width="15" height="20" rx="2.5" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.5" />
            <text x="16.5" y="23" textAnchor="middle" fill="#B45309" fontSize="6" fontWeight="800">
              COPY 1
            </text>
            <rect x="19" y="16" width="15" height="20" rx="2.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" />
            <text x="26.5" y="28" textAnchor="middle" fill="#92400E" fontSize="6" fontWeight="800">
              COPY 2
            </text>
            {/* Friendly Guard Shield */}
            <path
              d="M37 20L43 22.5V29C43 33.5 40.3 36.8 37 38C33.7 36.8 31 33.5 31 29V22.5L37 20Z"
              fill="#D97706"
              stroke="#FFFFFF"
              strokeWidth="1.8"
            />
            <path d="M34.5 29L36.5 31L40 27" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800 block">
              Sticker #3 · Safety Alert
            </span>
            <span className="text-xs font-extrabold text-zinc-900 block leading-snug">
              Duplicate File Catcher
            </span>
            <span className="text-[11px] text-zinc-600 block mt-0.5">
              Asks: Replace First or Add Again
            </span>
          </div>
        </div>
      );

    case 'page-slicer':
      return (
        <div
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          className={`inline-flex items-center gap-3 px-3.5 py-2.5 bg-violet-50/90 border-2 border-white ring-2 ring-violet-500/80 rounded-2xl shadow-sm ${interactiveClass} ${className}`}
        >
          <svg viewBox="0 0 52 52" className="w-12 h-12 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="48" height="48" rx="14" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2" />
            <rect x="8" y="10" width="10" height="14" rx="2" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
            <text x="13" y="19" textAnchor="middle" fill="#065F46" fontSize="6" fontWeight="800">P.1</text>
            <rect x="21" y="10" width="10" height="14" rx="2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 1.5" />
            <text x="26" y="19" textAnchor="middle" fill="#64748B" fontSize="5.5" fontWeight="700">Skip</text>
            <rect x="34" y="10" width="10" height="14" rx="2" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
            <text x="39" y="19" textAnchor="middle" fill="#065F46" fontSize="6" fontWeight="800">P.3</text>
            <rect x="10" y="29" width="32" height="11" rx="5.5" fill="#7C3AED" />
            <text x="26" y="36.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.8" fontWeight="800">
              PICK PAGES 1, 3
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-violet-700 block">
              Sticker #4 · Page Picker
            </span>
            <span className="text-xs font-extrabold text-zinc-900 block leading-snug">
              Keep Only Pages You Need
            </span>
            <span className="text-[11px] text-zinc-600 block mt-0.5">
              Click pages to keep or skip easily
            </span>
          </div>
        </div>
      );

    case 'rotate-fit':
      return (
        <div
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          className={`inline-flex items-center gap-3 px-3.5 py-2.5 bg-rose-50/90 border-2 border-white ring-2 ring-rose-500/80 rounded-2xl shadow-sm ${interactiveClass} ${className}`}
        >
          <svg viewBox="0 0 52 52" className="w-12 h-12 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="48" height="48" rx="14" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
            <rect x="15" y="10" width="22" height="30" rx="3" fill="#FFF1F2" stroke="#E11D48" strokeWidth="1.6" />
            <path d="M20 25C20 21.6863 22.6863 19 26 19C29.3137 19 32 21.6863 32 25" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <path d="M29.5 22.5L32.2 25.5L35 22.5" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <text x="26" y="34" textAnchor="middle" fill="#BE123C" fontSize="6.8" fontWeight="800">
              90° TURN
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-rose-700 block">
              Sticker #5 · Photo Fixer
            </span>
            <span className="text-xs font-extrabold text-zinc-900 block leading-snug">
              Turn Sideways Scans Upright
            </span>
            <span className="text-[11px] text-zinc-600 block mt-0.5">
              1-click 90° spin & auto page fit
            </span>
          </div>
        </div>
      );

    case 'unified-export':
    default:
      return (
        <div
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          className={`inline-flex items-center gap-3 px-3.5 py-2.5 bg-teal-50/90 border-2 border-white ring-2 ring-teal-500/80 rounded-2xl shadow-sm ${interactiveClass} ${className}`}
        >
          <svg viewBox="0 0 52 52" className="w-12 h-12 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="48" height="48" rx="14" fill="#FFFFFF" stroke="#14B8A6" strokeWidth="2" />
            <rect x="14" y="8" width="24" height="32" rx="3" fill="#FFFFFF" stroke="#0F766E" strokeWidth="1.8" />
            <rect x="14" y="8" width="5.5" height="32" rx="1.5" fill="#0D9488" />
            <circle cx="28" cy="21" r="5.5" fill="#10B981" />
            <path d="M25.5 21L27.3 22.8L31 19" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <text x="28" y="34" textAnchor="middle" fill="#0F766E" fontSize="6.5" fontWeight="800">
              1 BINDER
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-teal-700 block">
              Sticker #6 · Instant Book
            </span>
            <span className="text-xs font-extrabold text-zinc-900 block leading-snug">
              1-Click Ready Download
            </span>
            <span className="text-[11px] text-zinc-600 block mt-0.5">
              Save as PDF Book, Long Image or ZIP
            </span>
          </div>
        </div>
      );
  }
};

/**
 * Ratan's Interactive Illustrated Storyboard & Sticker Playground
 * Lets Ratan see AND interact with large, self-explanatory visual cartoons/diagrams
 * without reading paragraphs of technical text.
 */
export const RatanInteractiveStoryboard: React.FC<{
  onJumpToChapter: (idx: number) => void;
  onTriggerLoadBatch: () => void;
}> = ({ onJumpToChapter, onTriggerLoadBatch }) => {
  // Interactive visual states for the 4 illustrated picture cards
  const [isMergedAnim, setIsMergedAnim] = useState(false);
  const [dupChoice, setDupChoice] = useState<'replace' | 'both'>('replace');
  const [keptPages, setKeptPages] = useState<number[]>([1, 2, 4]);
  const [receiptAngle, setReceiptAngle] = useState<number>(90);

  const toggleStoryPage = (p: number) => {
    setKeptPages((prev) => {
      if (prev.includes(p)) {
        return prev.length > 1 ? prev.filter((x) => x !== p) : prev;
      }
      return [...prev, p].sort((a, b) => a - b);
    });
  };

  return (
    <div className="p-5 space-y-5 bg-white">
      {/* Friendly Welcome Banner for Ratan */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-sky-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Ratan&apos;s Easy Picture & Sticker Guide — Zero Confusing Jargon</span>
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">
            Understand Every Feature in Seconds Using Interactive Pictures & Stickers
          </h3>
          <p className="text-xs text-zinc-700 leading-relaxed">
            Click the buttons inside the <strong>4 Picture Cards</strong> below to watch how OmniFuse combines files, catches duplicates, picks pages, and fixes sideways photos—or click any <strong>Sticker</strong> at the bottom to jump to its practice lab.
          </p>
        </div>

        <button
          type="button"
          onClick={onTriggerLoadBatch}
          className="px-4 py-2 text-xs font-bold rounded-xl shadow-xs cursor-pointer studio-accent-btn shrink-0"
        >
          Load 12 Sample Files into App
        </button>
      </div>

      {/* 4 Large Interactive Illustrated Picture Storyboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PICTURE CARD 1: Combine Mixed Files into One Book */}
        <div className="border-2 border-emerald-200 rounded-2xl p-4 bg-emerald-50/30 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-extrabold bg-emerald-600 text-white rounded-full">
                Picture 1 · Combine Files
              </span>
              <h4 className="text-sm font-extrabold text-zinc-900 mt-1.5">
                Drop Up to {MAX_QUEUE_FILES} Files → Get 1 Neat Book
              </h4>
              <p className="text-xs text-zinc-600 mt-0.5">
                Put PDF contracts, house photos, receipts, and text notes together in one list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMergedAnim((v) => !v)}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-emerald-400 text-emerald-800 hover:bg-emerald-100 rounded-xl shadow-2xs cursor-pointer shrink-0"
            >
              {isMergedAnim ? 'Show Separate Files' : '▶ Watch Merge Picture'}
            </button>
          </div>

          {/* Illustrated Scene */}
          <div className="bg-white border border-emerald-200 rounded-xl p-3.5">
            <svg
              viewBox="0 0 420 135"
              className="w-full h-auto"
              fill="none"
              role="img"
              aria-label="Illustrated picture showing separate PDF, JPG photo, and TXT note combining into one green book"
            >
              {/* Left: Separate Files Stack */}
              <g opacity={isMergedAnim ? '0.45' : '1'}>
                <rect x="10" y="14" width="66" height="82" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                <rect x="18" y="24" width="32" height="12" rx="3" fill="#2563EB" />
                <text x="34" y="32.5" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="800">PDF</text>
                <path d="M18 46H64M18 56H58M18 66H62" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" />
                <text x="43" y="86" textAnchor="middle" fill="#1E40AF" fontSize="8" fontWeight="700">Contract</text>

                <rect x="86" y="20" width="66" height="82" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
                <rect x="94" y="30" width="32" height="12" rx="3" fill="#D97706" />
                <text x="110" y="38.5" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="800">PHOTO</text>
                <circle cx="106" cy="55" r="5" fill="#F59E0B" />
                <path d="M94 76L110 58L124 71L134 61L144 76H94Z" fill="#F59E0B" />
                <text x="119" y="92" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="700">Floorplan</text>

                <rect x="162" y="14" width="66" height="82" rx="6" fill="#F3E8FF" stroke="#8B5CF6" strokeWidth="2" />
                <rect x="170" y="24" width="32" height="12" rx="3" fill="#7C3AED" />
                <text x="186" y="32.5" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="800">NOTE</text>
                <path d="M170 46H216M170 56H210M170 66H204" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" />
                <text x="195" y="86" textAnchor="middle" fill="#5B21B6" fontSize="8" fontWeight="700">Summary</text>
              </g>

              {/* Center Funnel Arrow */}
              <circle cx="264" cy="58" r="18" fill="#10B981" />
              <path d="M256 58H272M272 58L266 52M272 58L266 64" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="264" y="92" textAnchor="middle" fill="#047857" fontSize="8.5" fontWeight="800">
                1-Click Merge
              </text>

              {/* Right: Combined Book */}
              <g transform={isMergedAnim ? 'scale(1.04) translate(-8, -3)' : ''}>
                <rect x="304" y="10" width="102" height="96" rx="8" fill="#ECFDF5" stroke="#059669" strokeWidth="2.5" />
                <rect x="304" y="10" width="14" height="96" rx="4" fill="#059669" />
                <text x="361" y="32" textAnchor="middle" fill="#065F46" fontSize="9.5" fontWeight="800">
                  COMPLETE BOOK
                </text>
                <rect x="326" y="40" width="68" height="13" rx="3" fill="#FFFFFF" stroke="#10B981" />
                <text x="360" y="49" textAnchor="middle" fill="#047857" fontSize="7.5" fontWeight="700">1. Contract (P.1-2)</text>
                <rect x="326" y="57" width="68" height="13" rx="3" fill="#FFFFFF" stroke="#10B981" />
                <text x="360" y="66" textAnchor="middle" fill="#047857" fontSize="7.5" fontWeight="700">2. Floorplan (P.3)</text>
                <rect x="326" y="74" width="68" height="13" rx="3" fill="#FFFFFF" stroke="#10B981" />
                <text x="360" y="83" textAnchor="middle" fill="#047857" fontSize="7.5" fontWeight="700">3. Summary (P.4)</text>
              </g>

              {/* Bottom Caption */}
              <rect x="10" y="112" width="400" height="19" rx="9.5" fill="#F0FDF4" />
              <text x="210" y="124.5" textAnchor="middle" fill="#065F46" fontSize="9" fontWeight="700">
                {isMergedAnim
                  ? '✓ Merged! All 3 files are now bound together with continuous page numbers (Page 1 to 4).'
                  : 'Up to 50 files can be dropped together — with unlimited pages inside each PDF!'}
              </text>
            </svg>
          </div>
        </div>

        {/* PICTURE CARD 2: Smart Duplicate File Catcher */}
        <div className="border-2 border-amber-200 rounded-2xl p-4 bg-amber-50/30 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-extrabold bg-amber-600 text-white rounded-full">
                Picture 2 · Duplicate Catcher
              </span>
              <h4 className="text-sm font-extrabold text-zinc-900 mt-1.5">
                Added the Same File Twice? OmniFuse Asks You!
              </h4>
              <p className="text-xs text-zinc-600 mt-0.5">
                If you accidentally drop the same file again, a friendly popup lets you choose:
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setDupChoice('replace')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                  dupChoice === 'replace'
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-700 border-amber-300'
                }`}
              >
                Replace 1st
              </button>
              <button
                type="button"
                onClick={() => setDupChoice('both')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                  dupChoice === 'both'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-zinc-700 border-amber-300'
                }`}
              >
                Add Again
              </button>
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-xl p-3.5">
            <svg
              viewBox="0 0 420 135"
              className="w-full h-auto"
              fill="none"
              role="img"
              aria-label="Illustrated diagram showing Duplicate File Detector with Replace First vs Add Again"
            >
              {/* Incoming Same File */}
              <rect x="12" y="14" width="118" height="86" rx="8" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2" />
              <text x="71" y="32" textAnchor="middle" fill="#92400E" fontSize="8.5" fontWeight="800">
                SAME FILE ADDED TWICE!
              </text>
              <rect x="24" y="40" width="94" height="22" rx="4" fill="#FFFFFF" stroke="#D97706" />
              <text x="71" y="54" textAnchor="middle" fill="#B45309" fontSize="8" fontWeight="700">
                Service Agreement.pdf
              </text>
              <rect x="24" y="68" width="94" height="22" rx="4" fill="#FEF3C7" stroke="#D97706" />
              <text x="71" y="82" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="800">
                + Service Agreement.pdf
              </text>

              {/* Arrow */}
              <path d="M138 56H168M168 56L161 50M168 56L161 62" stroke="#D97706" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

              {/* Outcome Box */}
              <rect x="176" y="14" width="232" height="86" rx="8" fill={dupChoice === 'replace' ? '#F8FAFC' : '#ECFDF5'} stroke={dupChoice === 'replace' ? '#0F172A' : '#059669'} strokeWidth="2" />
              <text x="292" y="33" textAnchor="middle" fill="#0F172A" fontSize="9.5" fontWeight="800">
                {dupChoice === 'replace'
                  ? 'Option 1: Remove First & Add This One'
                  : 'Option 2: Add This Same File Again'}
              </text>

              {dupChoice === 'replace' ? (
                <g>
                  <rect x="192" y="44" width="92" height="42" rx="5" fill="#FEE2E2" stroke="#EF4444" strokeDasharray="3 2" />
                  <text x="238" y="63" textAnchor="middle" fill="#B91C1C" fontSize="8" fontWeight="700">
                    Old Copy Removed
                  </text>
                  <text x="238" y="76" textAnchor="middle" fill="#DC2626" fontSize="7.5">
                    (No accidental double)
                  </text>
                  <rect x="298" y="44" width="96" height="42" rx="5" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
                  <text x="346" y="63" textAnchor="middle" fill="#15803D" fontSize="8" fontWeight="800">
                    ✓ Fresh Copy Kept!
                  </text>
                  <text x="346" y="76" textAnchor="middle" fill="#166534" fontSize="7.5">
                    1 clean copy in list
                  </text>
                </g>
              ) : (
                <g>
                  <rect x="192" y="44" width="92" height="42" rx="5" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
                  <text x="238" y="63" textAnchor="middle" fill="#15803D" fontSize="8" fontWeight="800">
                    ✓ Copy #1 Kept
                  </text>
                  <text x="238" y="76" textAnchor="middle" fill="#166534" fontSize="7.5">
                    Service Agreement
                  </text>
                  <rect x="298" y="44" width="96" height="42" rx="5" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
                  <text x="346" y="63" textAnchor="middle" fill="#15803D" fontSize="8" fontWeight="800">
                    ✓ Copy #2 Added!
                  </text>
                  <text x="346" y="76" textAnchor="middle" fill="#166534" fontSize="7.5">
                    Both merged in book
                  </text>
                </g>
              )}

              <rect x="12" y="112" width="396" height="19" rx="9.5" fill="#FEF3C7" />
              <text x="210" y="124.5" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="700">
                Tip: Click the Copy button on any file row in the workspace to see this detector live!
              </text>
            </svg>
          </div>
        </div>

        {/* PICTURE CARD 3: Pick Only the Pages You Want */}
        <div className="border-2 border-violet-200 rounded-2xl p-4 bg-violet-50/30 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-extrabold bg-violet-600 text-white rounded-full">
                Picture 3 · Page Picker
              </span>
              <h4 className="text-sm font-extrabold text-zinc-900 mt-1.5">
                Click Any Page Below to Keep or Skip It!
              </h4>
              <p className="text-xs text-zinc-600 mt-0.5">
                Don&apos;t need all 5 pages of a PDF? Just pick the exact pages you want:
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-extrabold bg-white border border-violet-300 text-violet-900 rounded-xl">
              Kept: {keptPages.map((p) => `P.${p}`).join(', ')}
            </span>
          </div>

          <div className="bg-white border border-violet-200 rounded-xl p-3.5 space-y-2.5">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((p) => {
                const isKept = keptPages.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleStoryPage(p)}
                    className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isKept
                        ? 'bg-emerald-50 border-emerald-600 shadow-2xs scale-[1.02]'
                        : 'bg-zinc-100 border-zinc-300 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div
                      className={`w-8 h-10 rounded border flex items-center justify-center text-xs font-extrabold ${
                        isKept
                          ? 'bg-white border-emerald-500 text-emerald-800'
                          : 'bg-zinc-200 border-zinc-400 text-zinc-500 line-through'
                      }`}
                    >
                      P.{p}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isKept ? 'bg-emerald-600 text-white' : 'bg-zinc-300 text-zinc-700'
                      }`}
                    >
                      {isKept ? '✓ KEEP' : 'SKIP'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-bold text-violet-900 text-center bg-violet-100/80 py-1.5 px-3 rounded-lg">
              👆 Click any mini-page above! Only the green &ldquo;KEEP&rdquo; pages ({keptPages.length} of 5) go into your final PDF book.
            </p>
          </div>
        </div>

        {/* PICTURE CARD 4: Turn Sideways Photos Upright */}
        <div className="border-2 border-rose-200 rounded-2xl p-4 bg-rose-50/30 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-extrabold bg-rose-600 text-white rounded-full">
                Picture 4 · Photo Fixer
              </span>
              <h4 className="text-sm font-extrabold text-zinc-900 mt-1.5">
                Sideways Receipt or Photo? Spin It Upright!
              </h4>
              <p className="text-xs text-zinc-600 mt-0.5">
                Click the spin button below to turn the sideways receipt upright onto the A4 page:
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReceiptAngle((a) => (a + 90) % 360)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl shadow-2xs cursor-pointer shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Spin 90° ({receiptAngle}°)</span>
            </button>
          </div>

          <div className="bg-white border border-rose-200 rounded-xl p-3.5 flex items-center justify-around gap-4">
            {/* Illustrated A4 Page with Rotating Receipt */}
            <div className="w-28 h-32 bg-zinc-100 border-2 border-zinc-300 rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner">
              <div
                style={{ transform: `rotate(${receiptAngle}deg)` }}
                className="w-16 h-24 bg-amber-50 border-2 border-amber-500 rounded shadow-xs flex flex-col items-center justify-center p-1.5 transition-transform duration-300"
              >
                <span className="text-[8px] font-extrabold text-amber-900">RECEIPT</span>
                <div className="w-full h-1 bg-amber-300 rounded my-1" />
                <div className="w-3/4 h-1 bg-amber-300 rounded mb-1" />
                <span className="text-[8px] font-extrabold text-emerald-700">$150.00</span>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  receiptAngle === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {receiptAngle === 0
                  ? '✓ Awesome! Receipt is now standing upright (0°) and fits cleanly inside the page!'
                  : `Currently tilted at ${receiptAngle}°. Click "Spin 90°" until it stands upright at 0°!`}
              </div>
              <p className="text-[11px] text-zinc-600">
                Shortcut: You can also press the <kbd className="px-1.5 py-0.5 font-bold bg-zinc-100 border border-zinc-300 rounded">R</kbd> key on your keyboard anytime!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Die-Cut Sticker Collection Wall (Click any sticker to open its detailed chapter) */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-zinc-900">
            Ratan&apos;s Quick Feature Stickers (Click any sticker to open its hands-on chapter)
          </span>
          <span className="text-[11px] font-semibold text-zinc-600">
            6 Visual Stickers · Plain Everyday English
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <TutorialSticker variant="drop-50" onClick={() => onJumpToChapter(0)} />
          <TutorialSticker variant="unlimited-pages" onClick={() => onJumpToChapter(0)} />
          <TutorialSticker variant="duplicate-guard" onClick={() => onJumpToChapter(0)} />
          <TutorialSticker variant="page-slicer" onClick={() => onJumpToChapter(1)} />
          <TutorialSticker variant="rotate-fit" onClick={() => onJumpToChapter(2)} />
          <TutorialSticker variant="unified-export" onClick={() => onJumpToChapter(4)} />
        </div>
      </div>
    </div>
  );
};

/**
 * Top Visual Flowchart Strip ("Ratan's Easy 3-Step Visual Guide")
 */
export const RatanVisualOverviewBanner: React.FC<{
  activeStepIndex: number;
  onSelectStep: (idx: number) => void;
}> = ({ activeStepIndex, onSelectStep }) => {
  return (
    <div
      aria-label="Visual Workflow Diagram and Sticker Overview"
      className="bg-zinc-50 border-b border-zinc-200 px-5 py-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-11 gap-2 items-center">
        {/* Stage 1 Node */}
        <button
          type="button"
          onClick={() => onSelectStep(0)}
          className={`md:col-span-3 p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
            activeStepIndex === 0
              ? 'bg-white border-emerald-600 shadow-xs'
              : 'bg-white/90 border-zinc-200 hover:border-zinc-400'
          }`}
        >
          <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="44" height="44" rx="10" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
            <rect x="8" y="10" width="11" height="14" rx="1.5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.2" />
            <text x="13.5" y="19" textAnchor="middle" fill="#059669" fontSize="5.2" fontWeight="800">PDF</text>
            <rect x="18" y="13" width="11" height="14" rx="1.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
            <text x="23.5" y="22" textAnchor="middle" fill="#B45309" fontSize="5.2" fontWeight="800">JPG</text>
            <rect x="28" y="10" width="11" height="14" rx="1.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
            <text x="33.5" y="19" textAnchor="middle" fill="#0369A1" fontSize="5.2" fontWeight="800">TXT</text>
            <rect x="9" y="29" width="30" height="10" rx="5" fill="#059669" />
            <text x="24" y="35.8" textAnchor="middle" fill="#FFFFFF" fontSize="6.2" fontWeight="800">
              1. ADD FILES
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-emerald-800 block">
              STEP 1 · ADD FILES
            </span>
            <p className="text-xs font-bold text-zinc-900 truncate">
              Drop Up to {MAX_QUEUE_FILES} Files
            </p>
            <p className="text-[11px] text-zinc-600 truncate">
              Unlimited pages + Duplicate catcher
            </p>
          </div>
        </button>

        {/* Connector Arrow 1 -> 2 */}
        <div className="hidden md:flex md:col-span-1 items-center justify-center">
          <svg viewBox="0 0 36 20" className="w-8 h-5 text-emerald-600" fill="none" aria-hidden="true">
            <path d="M2 10H30M30 10L23 4M30 10L23 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Stage 2 Node */}
        <button
          type="button"
          onClick={() => onSelectStep(1)}
          className={`md:col-span-3 p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
            activeStepIndex === 1 || activeStepIndex === 2
              ? 'bg-white border-emerald-600 shadow-xs'
              : 'bg-white/90 border-zinc-200 hover:border-zinc-400'
          }`}
        >
          <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="44" height="44" rx="10" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="1.5" />
            <rect x="9" y="9" width="13" height="16" rx="2" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1.3" />
            <path d="M12 14H19M12 17.5H17" stroke="#7C3AED" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="33" cy="17" r="7" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.3" />
            <path d="M30 17L32.5 14.5M30 17L32.5 19.5M30 17H36" stroke="#6D28D9" strokeWidth="1.4" strokeLinecap="round" />
            <rect x="9" y="29" width="30" height="10" rx="5" fill="#7C3AED" />
            <text x="24" y="35.8" textAnchor="middle" fill="#FFFFFF" fontSize="6.2" fontWeight="800">
              2. ARRANGE & FIX
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-violet-800 block">
              STEP 2 · ARRANGE & FIX
            </span>
            <p className="text-xs font-bold text-zinc-900 truncate">
              Pick Pages & Turn Photos
            </p>
            <p className="text-[11px] text-zinc-600 truncate">
              Keep exact pages & fix sideways scans
            </p>
          </div>
        </button>

        {/* Connector Arrow 2 -> 3 */}
        <div className="hidden md:flex md:col-span-1 items-center justify-center">
          <svg viewBox="0 0 36 20" className="w-8 h-5 text-emerald-600" fill="none" aria-hidden="true">
            <path d="M2 10H30M30 10L23 4M30 10L23 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Stage 3 Node */}
        <button
          type="button"
          onClick={() => onSelectStep(4)}
          className={`md:col-span-3 p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
            activeStepIndex === 3 || activeStepIndex === 4
              ? 'bg-white border-emerald-600 shadow-xs'
              : 'bg-white/90 border-zinc-200 hover:border-zinc-400'
          }`}
        >
          <svg viewBox="0 0 48 48" className="w-11 h-11 shrink-0" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="44" height="44" rx="10" fill="#F0FDFA" stroke="#0D9488" strokeWidth="1.5" />
            <rect x="14" y="7" width="20" height="19" rx="2" fill="#FFFFFF" stroke="#0F766E" strokeWidth="1.4" />
            <circle cx="24" cy="16.5" r="4" fill="#10B981" />
            <path d="M22.2 16.5L23.5 17.8L26 15.2" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="9" y="29" width="30" height="10" rx="5" fill="#0F766E" />
            <text x="24" y="35.8" textAnchor="middle" fill="#FFFFFF" fontSize="6.2" fontWeight="800">
              3. SAVE 1 BOOK
            </text>
          </svg>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-teal-800 block">
              STEP 3 · SAVE 1 BOOK
            </span>
            <p className="text-xs font-bold text-zinc-900 truncate">
              Preview & Download 1 File
            </p>
            <p className="text-[11px] text-zinc-600 truncate">
              Save as PDF Binder, Long Image or ZIP
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

/**
 * Per-Chapter Illustrated Diagram explaining the exact mechanism visually
 * with clear diagrams, arrows, and stickers.
 */
export const ChapterVisualDiagram: React.FC<{ stepIndex: number }> = ({ stepIndex }) => {
  if (stepIndex === 0) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-900">
            Picture Diagram · Adding Mixed Files & Catching Accidental Duplicates
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Up to {MAX_QUEUE_FILES} Files · Unlimited Pages
          </span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 overflow-x-auto">
          <svg
            viewBox="0 0 680 116"
            className="w-full min-w-[520px] h-auto"
            fill="none"
            role="img"
            aria-label="Diagram showing PDF, JPG, PNG, and Notes passing through the Duplicate File Catcher into the 50-file list"
          >
            {/* Box 1: Source Files */}
            <rect x="8" y="12" width="175" height="92" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="95" y="31" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="700">
              1. Drop Any Mixed Files
            </text>
            <rect x="20" y="42" width="44" height="24" rx="5" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.2" />
            <text x="42" y="57" textAnchor="middle" fill="#1D4ED8" fontSize="9.5" fontWeight="700">PDF</text>
            <rect x="72" y="42" width="46" height="24" rx="5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.2" />
            <text x="95" y="57" textAnchor="middle" fill="#B45309" fontSize="9.5" fontWeight="700">Photos</text>
            <rect x="126" y="42" width="45" height="24" rx="5" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.2" />
            <text x="148" y="57" textAnchor="middle" fill="#047857" fontSize="9.5" fontWeight="700">Notes</text>
            <text x="95" y="86" textAnchor="middle" fill="#475569" fontSize="9.5" fontWeight="600">
              1 page to 500+ pages per file
            </text>

            {/* Arrow 1 */}
            <path d="M190 58H228M228 58L220 51M228 58L220 65" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Box 2: Smart Duplicate Detector */}
            <rect x="236" y="12" width="205" height="92" rx="10" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="338" y="31" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="700">
              2. Duplicate File Catcher
            </text>
            <rect x="250" y="41" width="177" height="24" rx="5" fill="#FFFFFF" stroke="#FCD34D" strokeWidth="1.2" />
            <text x="338" y="56" textAnchor="middle" fill="#B45309" fontSize="9.2" fontWeight="700">
              Added same file twice? You choose:
            </text>
            <rect x="250" y="71" width="85" height="22" rx="4" fill="#0F172A" />
            <text x="292" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700">
              Replace First File
            </text>
            <rect x="342" y="71" width="85" height="22" rx="4" fill="#059669" />
            <text x="384" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="700">
              Add File Again
            </text>

            {/* Arrow 2 */}
            <path d="M449 58H487M487 58L479 51M487 58L479 65" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Box 3: Unified Queue */}
            <rect x="495" y="12" width="177" height="92" rx="10" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
            <text x="583" y="31" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700">
              3. Ready to Combine
            </text>
            <rect x="512" y="42" width="142" height="26" rx="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.3" />
            <text x="583" y="59" textAnchor="middle" fill="#047857" fontSize="10.5" fontWeight="800">
              Up to 50 Files → 1 Book
            </text>
            <text x="583" y="86" textAnchor="middle" fill="#065F46" fontSize="9.5" fontWeight="600">
              Fast, Private & Easy
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <TutorialSticker variant="drop-50" />
          <TutorialSticker variant="unlimited-pages" />
          <TutorialSticker variant="duplicate-guard" />
        </div>
      </div>
    );
  }

  if (stepIndex === 1) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-900">
            Picture Diagram · How Picking Specific Pages Works
          </span>
          <span className="text-[11px] font-semibold text-violet-800 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
            Examples: all · odd · even · 1-3, 5
          </span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-3 overflow-x-auto">
          <svg
            viewBox="0 0 680 110"
            className="w-full min-w-[520px] h-auto"
            fill="none"
            role="img"
            aria-label="Diagram showing a 6-page PDF filtered with range 1-2, 5 so only selected pages enter the merged document"
          >
            <rect x="10" y="12" width="215" height="86" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="117" y="30" textAnchor="middle" fill="#0F172A" fontSize="10.5" fontWeight="700">
              Original PDF (6 Pages Total)
            </text>
            {[1, 2, 3, 4, 5, 6].map((p, i) => {
              const keep = p === 1 || p === 2 || p === 5;
              const x = 22 + i * 31;
              return (
                <g key={p}>
                  <rect
                    x={x}
                    y="40"
                    width="26"
                    height="36"
                    rx="3"
                    fill={keep ? '#ECFDF5' : '#F1F5F9'}
                    stroke={keep ? '#059669' : '#CBD5E1'}
                    strokeWidth="1.3"
                  />
                  <text x={x + 13} y="58" textAnchor="middle" fill={keep ? '#065F46' : '#94A3B8'} fontSize="9" fontWeight="700">
                    P.{p}
                  </text>
                  <text x={x + 13} y="70" textAnchor="middle" fill={keep ? '#059669' : '#94A3B8'} fontSize="7.5" fontWeight="700">
                    {keep ? '✓' : 'Skip'}
                  </text>
                </g>
              );
            })}

            <path d="M233 55H273M273 55L265 48M273 55L265 62" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            <rect x="282" y="18" width="155" height="74" rx="10" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="1.5" />
            <text x="359" y="38" textAnchor="middle" fill="#5B21B6" fontSize="10" fontWeight="700">
              Your Page Selection
            </text>
            <rect x="302" y="46" width="115" height="26" rx="5" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1.4" />
            <text x="359" y="63" textAnchor="middle" fill="#4C1D95" fontSize="11" fontWeight="800">
              Pages: 1-2, 5
            </text>

            <path d="M445 55H485M485 55L477 48M485 55L477 62" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            <rect x="494" y="12" width="176" height="86" rx="10" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
            <text x="582" y="30" textAnchor="middle" fill="#065F46" fontSize="10.5" fontWeight="700">
              Pages Kept in Final Book (3)
            </text>
            {[1, 2, 5].map((p, i) => {
              const x = 518 + i * 46;
              return (
                <g key={p}>
                  <rect x={x} y="40" width="36" height="44" rx="4" fill="#FFFFFF" stroke="#059669" strokeWidth="1.4" />
                  <text x={x + 18} y="62" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="800">
                    P.{p}
                  </text>
                  <text x={x + 18} y="76" textAnchor="middle" fill="#10B981" fontSize="7.5" fontWeight="700">
                    KEPT
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  if (stepIndex === 2) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-900">
            Picture Diagram · Turning Sideways Photos Upright & Fitting Them on a Page
          </span>
          <TutorialSticker variant="rotate-fit" className="py-1.5 px-3" />
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3 overflow-x-auto">
          <svg
            viewBox="0 0 680 104"
            className="w-full min-w-[520px] h-auto"
            fill="none"
            role="img"
            aria-label="Diagram comparing 90-degree scan rotation, Fit Page, Fill Page, and Original Size"
          >
            <rect x="10" y="10" width="195" height="84" rx="9" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="1.4" />
            <text x="107" y="27" textAnchor="middle" fill="#9F1239" fontSize="10" fontWeight="700">
              Turn Sideways Photo (Press R)
            </text>
            <rect x="28" y="44" width="52" height="34" rx="3" fill="#FFFFFF" stroke="#E11D48" strokeWidth="1.3" />
            <text x="54" y="64" textAnchor="middle" fill="#BE123C" fontSize="8.5" fontWeight="700">Sideways</text>
            <path d="M90 60H118M118 60L112 54M118 60L112 66" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            <rect x="132" y="35" width="36" height="48" rx="3" fill="#FFFFFF" stroke="#059669" strokeWidth="1.4" />
            <text x="150" y="62" textAnchor="middle" fill="#047857" fontSize="8.5" fontWeight="700">Upright</text>

            <rect x="220" y="10" width="142" height="84" rx="9" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.4" />
            <text x="291" y="27" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
              Fit Page (Whole Photo)
            </text>
            <rect x="266" y="34" width="50" height="52" rx="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2" />
            <rect x="272" y="45" width="38" height="30" rx="2" fill="#A7F3D0" stroke="#059669" strokeWidth="1.2" />

            <rect x="374" y="10" width="142" height="84" rx="9" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.4" />
            <text x="445" y="27" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
              Fill Page (Edge to Edge)
            </text>
            <rect x="420" y="34" width="50" height="52" rx="3" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.4" />

            <rect x="528" y="10" width="142" height="84" rx="9" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.4" />
            <text x="599" y="27" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
              Original Photo Size
            </text>
            <rect x="574" y="34" width="50" height="52" rx="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2" />
            <rect x="584" y="46" width="30" height="28" rx="2" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
    );
  }

  if (stepIndex === 3) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-900">
            Picture Diagram · Adding a Cover Contents Page, Watermark & Page Numbers
          </span>
          <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
            Live Page Preview
          </span>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3 overflow-x-auto">
          <svg
            viewBox="0 0 680 96"
            className="w-full min-w-[520px] h-auto"
            fill="none"
            role="img"
            aria-label="Diagram showing Cover Contents Page, Diagonal Watermark Stamp, and Bottom Page Numbers"
          >
            <rect x="10" y="12" width="195" height="72" rx="9" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="1.4" />
            <text x="107" y="34" textAnchor="middle" fill="#0369A1" fontSize="10.5" fontWeight="700">
              1 · Cover Contents Page
            </text>
            <text x="107" y="54" textAnchor="middle" fill="#334155" fontSize="9.5">
              Lists every file & starting page
            </text>
            <text x="107" y="70" textAnchor="middle" fill="#0284C7" fontSize="9" fontWeight="700">
              Added automatically as Page 1
            </text>

            <text x="223" y="53" textAnchor="middle" fill="#059669" fontSize="18" fontWeight="800">+</text>

            <rect x="242" y="12" width="195" height="72" rx="9" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1.4" />
            <text x="339" y="34" textAnchor="middle" fill="#B45309" fontSize="10.5" fontWeight="700">
              2 · Diagonal Watermark
            </text>
            <text x="339" y="54" textAnchor="middle" fill="#334155" fontSize="9.5">
              Stamps words like CONFIDENTIAL
            </text>
            <text x="339" y="70" textAnchor="middle" fill="#D97706" fontSize="9" fontWeight="700">
              Appears lightly across every page
            </text>

            <text x="455" y="53" textAnchor="middle" fill="#059669" fontSize="18" fontWeight="800">+</text>

            <rect x="474" y="12" width="196" height="72" rx="9" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.4" />
            <text x="572" y="34" textAnchor="middle" fill="#047857" fontSize="10.5" fontWeight="700">
              3 · Bottom Page Numbers
            </text>
            <text x="572" y="54" textAnchor="middle" fill="#334155" fontSize="9.5">
              Stamps &ldquo;Page 1 of 27&rdquo; at the bottom
            </text>
            <text x="572" y="70" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="700">
              Keeps your whole book organized
            </text>
          </svg>
        </div>
      </div>
    );
  }

  if (stepIndex === 4) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-900">
            Picture Diagram · 4 Easy Ways to Save Your Combined Files
          </span>
          <TutorialSticker variant="unified-export" className="py-1.5 px-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <span className="text-xs font-bold text-zinc-900 block">
          Picture Diagram · {STUDIO_THEMES.length} Color Themes + Separate App Logo Selector
        </span>
        <span className="text-xs text-zinc-600">
          Switching a theme changes workspace colors and section icons while keeping your top-left App Logo fixed!
        </span>
      </div>
      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
        {STUDIO_THEMES.length} Themes + Custom App Icons
      </span>
    </div>
  );
};
