import React from 'react';

const badgeStyles = {
  active: {
    container: 'bg-green-50 text-green-700 border-green-200/70',
    dot: 'bg-green-500',
  },
  inactive: {
    container: 'bg-red-50 text-red-700 border-red-200/70',
    dot: 'bg-red-500',
  },
  pending: {
    container: 'bg-yellow-50 text-yellow-700 border-yellow-200/70',
    dot: 'bg-yellow-500',
  },
  blue: {
    container: 'bg-blue-50 text-blue-700 border-blue-200/70',
    dot: 'bg-blue-500',
  },
  violet: {
    container: 'bg-violet-50 text-violet-700 border-violet-200/70',
    dot: 'bg-violet-500',
  },
  brand: {
    container: 'bg-amber-50 text-amber-700 border-amber-200/70',
    dot: 'bg-amber-500',
  },
  slate: {
    container: 'bg-slate-100 text-slate-700 border-slate-200/70',
    dot: 'bg-slate-400',
  },
};

export default function Badge({
  children,
  status,
  variant,
  showDot = true,
  className = '',
  size = 'sm',
}) {
  // Determine variant key from status string or explicit variant
  let key = 'slate';
  const checkVal = (status || variant || '').toLowerCase();

  if (checkVal.includes('act') || checkVal === 'active' || checkVal === 'aktif') {
    key = 'active';
  } else if (checkVal.includes('inact') || checkVal === 'inactive' || checkVal === 'nonaktif') {
    key = 'inactive';
  } else if (checkVal.includes('pend') || checkVal === 'pending' || checkVal === 'menunggu') {
    key = 'pending';
  } else if (badgeStyles[checkVal]) {
    key = checkVal;
  }

  const style = badgeStyles[key] || badgeStyles.slate;
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${style.container} ${sizeClass} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${style.dot} ${
            key === 'active' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{children || status}</span>
    </span>
  );
}
