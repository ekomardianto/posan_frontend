import React from 'react';
import { Coffee, RefreshCw, Sparkles, Loader2, Database } from 'lucide-react';
import posanLogo from '../../assets/posan-logo.jpg';

/**
 * Premium Loading Page & State Components for POSAN Admin
 */

// 1. Full Screen / Major Page Loader
export default function LoadingPage({
  title = 'Memuat POSAN Backoffice...',
  message = 'Menghubungkan ke PostgreSQL Cloud posan_db & menyinkronkan data...',
  tip = 'Kelola pesanan, katalog menu, dan laporan kasir secara realtime.',
  fullScreen = true,
  transparent = false,
  showLogo = true,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 transition-all duration-300 ${
        fullScreen
          ? 'fixed inset-0 z-[9999] min-h-screen'
          : 'w-full min-h-[380px] rounded-2xl my-4'
      }`}
      style={{
        backgroundColor: transparent
          ? 'rgba(18, 14, 12, 0.75)'
          : '#120E0C',
        backdropFilter: transparent ? 'blur(12px)' : 'none',
        color: '#FAF6F0',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Ambient glowing radial light */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(140, 94, 60, 0.35) 0%, rgba(212, 163, 115, 0.08) 50%, transparent 70%)',
          filter: 'blur(30px)',
          animation: 'pulseGlow 3s infinite ease-in-out',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-4">
        {/* Animated Brand Logo with Warm Halo */}
        {showLogo && (
          <div className="relative mb-6">
            {/* Outer Spinning Ring */}
            <div
              className="absolute -inset-2.5 rounded-3xl opacity-70 animate-spin"
              style={{
                border: '2px dashed #D4A373',
                animationDuration: '12s',
              }}
            />

            {/* Logo Container */}
            <div
              className="relative w-20 h-20 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 12px 35px rgba(140, 94, 60, 0.5), 0 0 20px rgba(212, 163, 115, 0.3)',
                border: '2px solid rgba(212, 163, 115, 0.5)',
              }}
            >
              <img
                src={posanLogo}
                alt="POSAN Cafe Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Coffee Steam Icon Floating Pill */}
            <div
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#8C5E3C] border-2 border-[#120E0C] text-[#FAF6F0] flex items-center justify-center shadow-md animate-bounce"
              style={{ animationDuration: '2s' }}
            >
              <Coffee size={13} strokeWidth={2.4} />
            </div>
          </div>
        )}

        {/* Title */}
        <h2
          className="text-base sm:text-lg font-bold tracking-tight mb-2 flex items-center justify-center gap-2"
          style={{ color: '#FAF6F0' }}
        >
          <Sparkles size={16} className="text-[#D4A373] animate-pulse" />
          <span>{title}</span>
        </h2>

        {/* Dynamic Progress Bar */}
        <div className="w-56 h-1.5 bg-stone-800/80 rounded-full overflow-hidden my-3 border border-stone-700/40 relative">
          <div
            className="h-full bg-gradient-to-r from-[#8C5E3C] via-[#D4A373] to-[#E5A93C] rounded-full"
            style={{
              width: '45%',
              animation: 'posanShimmerBar 1.8s infinite ease-in-out',
            }}
          />
        </div>

        {/* Message */}
        <p
          className="text-xs leading-relaxed max-w-xs mb-3 font-medium"
          style={{ color: '#D4A373' }}
        >
          {message}
        </p>

        {/* Tip / Subtext Footer */}
        {tip && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono mt-2"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 163, 115, 0.2)',
              color: '#A89F91',
            }}
          >
            <Database size={11} className="text-emerald-400 shrink-0" />
            <span className="truncate max-w-[240px]">{tip}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes posanShimmerBar {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(250%); width: 30%; }
        }
      `}</style>
    </div>
  );
}

// 2. Page / Tab Inline Section Loader
export function PageLoader({
  message = 'Memuat data...',
  height = '320px',
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2.5 py-4 text-xs font-semibold text-[#8C5E3C]">
        <Loader2 size={16} className="animate-spin text-[#8C5E3C]" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-8 bg-white/70 border border-stone-200/80 rounded-2xl shadow-xs"
      style={{ minHeight: height }}
    >
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 text-[#8C5E3C] flex items-center justify-center shadow-xs">
          <Coffee size={22} className="animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#8C5E3C] text-white flex items-center justify-center">
          <Loader2 size={11} className="animate-spin" />
        </div>
      </div>
      <p className="text-xs font-bold text-stone-700">{message}</p>
      <p className="text-[11px] text-stone-400 mt-0.5">Menyinkronkan dengan database posan_db...</p>
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
