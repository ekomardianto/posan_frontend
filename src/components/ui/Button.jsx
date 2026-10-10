import React from 'react';

const variantClasses = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs focus:ring-brand-500/20 border-transparent',
  secondary: 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 focus:ring-slate-400/20 border-transparent',
  outline: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 focus:ring-brand-500/20 shadow-2xs',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500/20 border-transparent',
  dangerOutline: 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300 focus:ring-rose-500/20',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500/20 border-transparent',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent',
  icon: 'bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800 p-2 border-transparent',
};

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-xs sm:text-sm rounded-xl gap-2',
  lg: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
  icon: 'p-2 rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const isIconButton = variant === 'icon';
  const baseSize = isIconButton ? sizeClasses.icon : sizeClasses[size] || sizeClasses.md;
  const baseVariant = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none ${baseVariant} ${baseSize} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children && <span>{children}</span>}
          {IconRight && <IconRight className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
