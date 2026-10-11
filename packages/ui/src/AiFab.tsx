import React from 'react';

export interface AiFabProps {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
}

export const AiFab: React.FC<AiFabProps> = ({
  onClick,
  isOpen = false,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-20 right-4 sm:right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(91,75,234,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#7C5CFF]/30 select-none ${
        isOpen
          ? 'bg-[#0F1B3D] rotate-90'
          : 'bg-gradient-to-tr from-[#5B4BEA] to-[#7C5CFF]'
      } ${className}`}
      aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <div className="flex items-center justify-center font-bold text-sm tracking-tight">
          <svg className="w-4 h-4 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
          </svg>
          <span>AI</span>
        </div>
      )}
    </button>
  );
};
