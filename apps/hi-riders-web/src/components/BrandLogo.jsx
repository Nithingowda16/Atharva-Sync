import React from 'react';
import logoImg from '../assets/logo/logo.png';

export const BrandLogo = ({ showTagline = true, size = 'default' }) => {
  const isLarge = size === 'large';

  return (
    <div className="flex flex-col items-center text-center select-none">
      {/* Glowing App Logo Badge */}
      <div className="relative mb-3 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
        <div className={`relative ${isLarge ? 'w-20 h-20' : 'w-16 h-16'} rounded-2xl bg-[#0D0F14] border border-neutral-800 flex items-center justify-center p-2 shadow-2xl`}>
          <img
            src={logoImg}
            alt="HI RIDERS"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Brand Title */}
      <div className="flex items-center gap-1.5 font-extrabold tracking-tight">
        <span className="text-white text-2xl tracking-wide font-black">HI</span>
        <span className="text-[#FF7900] text-2xl tracking-wide font-black">RIDERS</span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-neutral-700"></div>
          <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
            Enterprise Transport Mobility
          </p>
          <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-neutral-700"></div>
        </div>
      )}
    </div>
  );
};

