import React from 'react';

export type StatusType = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO' | 'PASS' | 'FAIL' | 'UNKNOWN';

export interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const configs = {
    ELIGIBLE: {
      label: 'Eligible',
      bg: 'bg-[#12AE85]/10',
      text: 'text-[#12AE85]',
      border: 'border-[#12AE85]/30',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    PASS: {
      label: 'PASS',
      bg: 'bg-[#12AE85]/10',
      text: 'text-[#12AE85]',
      border: 'border-[#12AE85]/30',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    NOT_ELIGIBLE: {
      label: 'Not eligible',
      bg: 'bg-[#E5484D]/10',
      text: 'text-[#E5484D]',
      border: 'border-[#E5484D]/30',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    FAIL: {
      label: 'FAIL',
      bg: 'bg-[#E5484D]/10',
      text: 'text-[#E5484D]',
      border: 'border-[#E5484D]/30',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    NEEDS_INFO: {
      label: 'Need info',
      bg: 'bg-[#F59E0B]/10',
      text: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]/30',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor" />
          <path strokeLinecap="round" strokeWidth="2" d="M12 7v5l3 3" />
        </svg>
      )
    },
    UNKNOWN: {
      label: 'UNKNOWN',
      bg: 'bg-[#F59E0B]/10',
      text: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]/30',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor" />
          <path strokeLinecap="round" strokeWidth="2" d="M12 7v5l3 3" />
        </svg>
      )
    }
  };

  const current = configs[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${current.bg} ${current.text} ${current.border} ${sizeClass} ${className}`}
    >
      {showIcon && <span className="flex-shrink-0">{current.icon}</span>}
      <span>{current.label}</span>
    </span>
  );
};
