import React, { useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X,
  Trash2,
  LogOut,
  RefreshCw,
} from 'lucide-react';

const dialogVariants = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-rose-100 text-rose-600',
    headerGlow: 'from-rose-500/10 to-transparent',
    confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 text-amber-600',
    headerGlow: 'from-amber-500/10 to-transparent',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  info: {
    icon: HelpCircle,
    iconBg: 'bg-[#F4E3D5] text-[#8C5E3C]',
    headerGlow: 'from-[#8C5E3C]/10 to-transparent',
    confirmBtn: 'bg-[#8C5E3C] hover:bg-[#744B2E] text-white shadow-[#8C5E3C]/20',
    badge: 'bg-[#FDF8F3] text-[#8C5E3C] border-[#E8D7C8]',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100 text-emerald-600',
    headerGlow: 'from-emerald-500/10 to-transparent',
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export default function ConfirmDialog({
  isOpen,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'warning',
  icon: CustomIcon,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel?.();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  const variant = dialogVariants[type] || dialogVariants.warning;
  const IconComponent = CustomIcon || variant.icon;

  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={isLoading ? undefined : onCancel}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 z-10 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Top Decorative Gradient */}
        <div className={`h-2 bg-gradient-to-r ${variant.headerGlow}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Main Icon */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${variant.iconBg}`}
            >
              <IconComponent size={24} strokeWidth={2.2} />
            </div>

            {/* Header & Description */}
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-dialog-title"
                className="text-base sm:text-lg font-bold text-stone-900 leading-snug"
              >
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close Button */}
            {!isLoading && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1 -mr-1 -mt-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 rounded-b-3xl">
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 active:bg-stone-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${variant.confirmBtn}`}
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
