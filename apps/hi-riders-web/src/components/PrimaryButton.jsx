import React from 'react';
import { Loader2 } from 'lucide-react';

export const PrimaryButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = true,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : 'w-auto'}
        py-3.5 px-6
        rounded-2xl
        font-bold text-white text-base
        bg-gradient-to-r from-[#FF7900] to-[#F4510B]
        hover:from-[#ff881a] hover:to-[#fa5c1b]
        active:scale-[0.98]
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        shadow-[0_4px_24px_rgba(255,121,0,0.35)]
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#FF7900] focus:ring-offset-2 focus:ring-offset-black
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Authenticating...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

