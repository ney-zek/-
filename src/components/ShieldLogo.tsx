import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({
  className = '',
  size = 'md',
  showGlow = true,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const iconDimensions = {
    sm: 28,
    md: 40,
    lg: 56,
    xl: 80,
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-teal-500/25 blur-xl -z-10 animate-pulse pointer-events-none" />
      )}
      <svg
        width={iconDimensions[size]}
        height={iconDimensions[size]}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-teal-400 drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]"
      >
        {/* Outer Shield Outline */}
        <path
          d="M24 4L8 10V22C8 32.8 14.8 42.4 24 45C33.2 42.4 40 32.8 40 22V10L24 4Z"
          fill="url(#shield-grad)"
          stroke="#2dd4bf"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Security Check and Lock accent */}
        <path
          d="M17 23.5L22 28.5L31 19.5"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small subtle stars for protection */}
        <circle cx="24" cy="14" r="1.5" fill="#5eead4" />
        <defs>
          <linearGradient
            id="shield-grad"
            x1="8"
            y1="4"
            x2="38"
            y2="44"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0f766e" stopOpacity="0.8" />
            <stop offset="0.6" stopColor="#115e59" stopOpacity="0.6" />
            <stop offset="1" stopColor="#042f2e" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
