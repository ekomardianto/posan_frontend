import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const alertStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    titleColor: 'text-emerald-950',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-900',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
    titleColor: 'text-rose-950',
    icon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    titleColor: 'text-amber-950',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-[#FDF8F3] border-[#E8D7C8] text-[#5C3B24]',
    iconColor: 'text-[#8C5E3C]',
    iconBg: 'bg-[#F4E3D5]',
    titleColor: 'text-[#3E2514]',
    icon: Info,
  },
};

/**
 * Modern Inline Alert Component for Admin & Super Admin Views
 */
export default function Alert({
  type = 'info',
  title,
  message,
  children,
  onClose,
  action,
  className = '',
  size = 'md',
}) {
  const style = alertStyles[type] || alertStyles.info;
  const IconComponent = style.icon;

  return (
    <div
      role="alert"
      className={`relative w-full rounded-xl border p-3.5 sm:p-4 flex items-start gap-3 transition-all animate-in fade-in-50 duration-200 ${style.bg} ${className}`}
    >
      {/* Leading Icon */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.iconBg} ${style.iconColor}`}
      >
        <IconComponent size={size === 'sm' ? 15 : 18} strokeWidth={2.2} />
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0 pr-2">
        {title && (
          <h4
            className={`text-xs sm:text-sm font-bold leading-snug mb-0.5 ${style.titleColor}`}
          >
            {title}
          </h4>
        )}
        {(message || children) && (
          <div className="text-xs sm:text-[13px] leading-relaxed opacity-90 font-medium">
            {message && <p>{message}</p>}
            {children}
          </div>
        )}

        {/* Action Button */}
        {action && (
          <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center gap-2">
            {action}
          </div>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 rounded-lg text-black/40 hover:text-black/70 hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Tutup pemberitahuan"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
