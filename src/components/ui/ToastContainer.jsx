import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const toastConfig = {
  success: {
    icon: CheckCircle2,
    borderLeft: 'border-l-emerald-500',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    badgeText: 'SUKSES',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    progressBar: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    borderLeft: 'border-l-rose-500',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    badgeText: 'KESALAHAN',
    badgeClass: 'bg-rose-100 text-rose-800',
    progressBar: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    borderLeft: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    badgeText: 'PERHATIAN',
    badgeClass: 'bg-amber-100 text-amber-800',
    progressBar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    borderLeft: 'border-l-[#8C5E3C]',
    iconColor: 'text-[#8C5E3C]',
    iconBg: 'bg-amber-50',
    badgeText: 'INFO',
    badgeClass: 'bg-amber-100 text-[#8C5E3C]',
    progressBar: 'bg-[#8C5E3C]',
  },
};

function ToastItem({ toast, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4000;
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (isPaused || duration <= 0) return;

    const intervalTime = 40;
    const decrement = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onDismiss(toast.id);
          return 0;
        }
        return Math.max(0, prev - decrement);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPaused, duration, onDismiss, toast.id]);

  return (
    <div
      className={`relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-stone-200/90 border-l-4 ${config.borderLeft} p-3.5 flex flex-col gap-1.5 overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 hover:shadow-2xl animate-in slide-in-from-bottom-3`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
    >
      <div className="flex items-start gap-3">
        {/* Toast Icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.iconBg} ${config.iconColor}`}
        >
          <Icon size={18} strokeWidth={2.3} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            {toast.title && (
              <span className="text-xs font-bold text-stone-900 tracking-tight leading-snug">
                {toast.title}
              </span>
            )}
            <span
              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${config.badgeClass}`}
            >
              {config.badgeText}
            </span>
          </div>

          <p className="text-xs text-stone-600 font-medium leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="p-1 -mr-1 -mt-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X size={14} />
        </button>
      </div>

      {/* Auto-dismiss countdown bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-100">
          <div
            className={`h-full transition-all linear ${config.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[10001] flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto px-3 sm:px-0"
      aria-label="Notifikasi Sistem"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
