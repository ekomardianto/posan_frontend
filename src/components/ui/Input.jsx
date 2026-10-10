import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  prefix,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  id,
  name,
  required = false,
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {prefix && (
          <span className="absolute left-3.5 text-xs font-medium text-slate-400 select-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full h-10 text-xs sm:text-sm bg-white border rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : prefix ? 'pl-12' : 'pl-3.5'
          } pr-3.5 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
