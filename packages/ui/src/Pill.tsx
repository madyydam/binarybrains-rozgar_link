import React from 'react';

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
  count?: number;
  className?: string;
}

export const Pill: React.FC<PillProps> = ({
  active = false,
  children,
  count,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 px-4 h-8 rounded-full text-xs font-medium transition-all duration-150 select-none whitespace-nowrap min-w-[44px] min-h-[32px] focus:outline-none focus:ring-2 focus:ring-[#2F5BFF] focus:ring-offset-2 ${
        active
          ? 'bg-[#2F5BFF] text-white shadow-sm'
          : 'bg-[#F3F6FF] text-[#64748B] hover:bg-[#EAF0FF] hover:text-[#0F1B3D]'
      } ${className}`}
      {...props}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
            active ? 'bg-white/20 text-white' : 'bg-[#E2E8F3] text-[#0F1B3D]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
