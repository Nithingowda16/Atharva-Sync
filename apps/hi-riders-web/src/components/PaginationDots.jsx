import React from 'react';

export const PaginationDots = ({ total = 3, current = 0 }) => {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        return (
          <div
            key={index}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              isActive
                ? 'w-6 bg-[#FF7900] shadow-[0_0_10px_rgba(255,121,0,0.5)]'
                : 'w-1.5 bg-[#292929]'
            }`}
          />
        );
      })}
    </div>
  );
};

