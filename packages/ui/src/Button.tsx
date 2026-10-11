import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const variantStyles = {
    primary:
      'bg-[#2F5BFF] text-white hover:bg-[#1E3FCC] active:bg-[#1E3FCC] shadow-sm disabled:bg-[#2F5BFF]/50',
    secondary:
      'bg-[#F3F6FF] text-[#0F1B3D] hover:bg-[#EAF0FF] active:bg-[#E2E8F3] disabled:opacity-50',
    outline:
      'border border-[#E2E8F3] bg-white text-[#0F1B3D] hover:bg-[#F3F6FF] active:bg-[#E2E8F3] disabled:opacity-50',
    danger:
      'bg-[#E5484D] text-white hover:bg-[#D03B40] active:bg-[#B82F33] disabled:opacity-50',
    ghost:
      'bg-transparent text-[#64748B] hover:text-[#0F1B3D] hover:bg-[#F3F6FF] disabled:opacity-50'
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 select-none min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-[#2F5BFF] focus:ring-offset-2 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
};
