
import React from 'react';

interface RVLogoProps {
  className?: string;
}

export const RVLogo: React.FC<RVLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="fill-rv-navy">
        <rect x="10" y="30" width="80" height="40" rx="5" />
        <rect x="15" y="50" width="70" height="20" fill="#fff" />
        <circle cx="25" cy="75" r="8" fill="#333" />
        <circle cx="75" cy="75" r="8" fill="#333" />
        <path d="M85 50L90 35H65L60 50H85Z" fill="#8b2332" className="fill-rv-burgundy" />
        <rect x="15" y="35" width="40" height="10" fill="#fff" />
        <rect x="20" y="40" width="5" height="5" fill="#f4d35e" className="fill-rv-gold" />
        <rect x="30" y="40" width="5" height="5" fill="#f4d35e" className="fill-rv-gold" />
        <rect x="40" y="40" width="5" height="5" fill="#f4d35e" className="fill-rv-gold" />
      </svg>
    </div>
  );
};
