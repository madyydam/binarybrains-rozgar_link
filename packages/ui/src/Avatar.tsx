import React from 'react';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg'; // sm: 36, md: 48, lg: 72
  online?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  online = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { container: 'w-9 h-9 text-xs', dot: 'w-2.5 h-2.5 ring-1' },
    md: { container: 'w-12 h-12 text-sm', dot: 'w-3 h-3 ring-2' },
    lg: { container: 'w-18 h-18 w-[72px] h-[72px] text-lg', dot: 'w-4 h-4 ring-2' }
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`rounded-full flex items-center justify-center font-bold overflow-hidden select-none bg-gradient-to-tr from-[#2F5BFF] to-[#5B4BEA] text-white shadow-sm ${sizeMap[size].container}`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {online && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-[#12AE85] ring-white ${sizeMap[size].dot}`}
          title="Online / Active"
        />
      )}
    </div>
  );
};
