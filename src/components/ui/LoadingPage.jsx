import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Premium Loading Page & State Components for POSAN Admin
 */

// 1. Full Screen / Major Page Loader
export default function LoadingPage({
  title = 'Memuat aplikasi...',
  fullScreen = true,
}) {
  return (
    <>
      <div
        className={`${fullScreen ? 'fixed top-0 left-0 z-[9999]' : 'relative'} h-1 w-full overflow-hidden pointer-events-none`}
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-live="polite"
      >
        <div className="h-full w-[35%] rounded-full bg-[#D4A373]" style={{ animation: 'posanProgress 1.4s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes posanProgress {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </>
  );
}

// 2. Page / Tab Inline Section Loader
export function PageLoader({
  message = 'Memuat data...',
  height = 'auto',
  compact = false,
}) {
  return (
    <div className={`w-full ${compact ? 'py-2' : 'py-4'}`} style={{ minHeight: height }} role="status" aria-label={message}>
      <div className="h-1 w-full overflow-hidden rounded-full">
        <div className="h-full w-[35%] rounded-full bg-[#D4A373] animate-pulse" />
      </div>
    </div>
  );
}

// 3. Full-Screen Blocking Action Overlay (Saving, Exporting, Importing)
export function LoadingOverlay({
  isOpen = false,
  title = 'Sedang Memproses...',
  message = 'Mohon tunggu sebentar, permintaan Anda sedang diproses.',
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#1E1713] text-[#FAF6F0] border border-amber-900/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8C5E3C] to-[#D4A373] flex items-center justify-center text-white shadow-lg mb-4 ring-4 ring-white/10">
          <RefreshCw size={24} className="animate-spin" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-[#D4A373] leading-relaxed mb-4">{message}</p>
        <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-[#D4A373] rounded-full animate-pulse w-3/4 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// 4. Skeleton Row & Card Placeholders
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-24 h-4 bg-stone-200 rounded-md"></div>
        <div className="w-8 h-8 bg-stone-200 rounded-xl"></div>
      </div>
      <div className="w-32 h-7 bg-stone-300 rounded-lg mb-2"></div>
      <div className="w-20 h-3 bg-stone-200 rounded-md"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs animate-pulse">
      <div className="h-12 bg-stone-100 border-b border-stone-200 px-6 flex items-center gap-4">
        <div className="w-28 h-4 bg-stone-300 rounded"></div>
        <div className="w-36 h-4 bg-stone-300 rounded"></div>
        <div className="w-20 h-4 bg-stone-300 rounded ml-auto"></div>
      </div>
      <div className="divide-y divide-stone-100 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-3.5 px-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-stone-200 shrink-0"></div>
            <div className="space-y-1.5 flex-1">
              <div className="w-1/3 h-3.5 bg-stone-200 rounded"></div>
              <div className="w-1/4 h-2.5 bg-stone-100 rounded"></div>
            </div>
            <div className="w-16 h-6 bg-stone-200 rounded-full"></div>
            <div className="w-20 h-4 bg-stone-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
