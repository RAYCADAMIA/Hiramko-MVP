import React from 'react';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", animate = true }) => {
  return (
    <div className={`relative ${className} select-none`}>
      <img
        src="/logo.png"
        alt="Hriamko Logo"
        className={`w-full h-full object-contain ${animate ? 'transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : ''}`}
      />
    </div>
  );
};

export default Logo;