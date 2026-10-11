import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F3] shadow-[0_4px_16px_rgba(15,27,61,0.06)] p-4 sm:p-5 transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-[0_8px_24px_rgba(15,27,61,0.1)] hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
