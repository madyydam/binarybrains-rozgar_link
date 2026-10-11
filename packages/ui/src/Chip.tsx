import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'ok' | 'fail' | 'warn' | 'ai' | 'tint';
  children: React.ReactNode;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  variant = 'default',
  children,
  icon,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#F3F6FF] text-[#1B2438] border border-[#E2E8F3]',
    tint: 'bg-[#EAF0FF] text-[#2F5BFF] border border-[#2F5BFF]/20',
    ok: 'bg-[#12AE85]/10 text-[#12AE85] border border-[#12AE85]/30',
    fail: 'bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/30',
    warn: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30',
    ai: 'bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/30 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-xs font-medium transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label="Remove"
        >
          &times;
        </button>
      )}
    </span>
  );
};
