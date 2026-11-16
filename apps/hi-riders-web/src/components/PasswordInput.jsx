import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const PasswordInput = ({
  id = 'password',
  name = 'password',
  label = 'Password / PIN',
  placeholder = 'Enter your security password',
  value,
  onChange,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 ml-1"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left Lock Icon */}
        <div className="absolute left-4 pointer-events-none text-neutral-400">
          <Lock className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="current-password"
          className={`
            w-full
            pl-12 pr-12 py-3.5
            bg-[#14171F]
            border ${error ? 'border-red-500/80 focus:border-red-500' : 'border-[#292929] focus:border-[#FF7900]'}
            rounded-2xl
            text-white text-sm md:text-base font-medium
            placeholder:text-neutral-500
            transition-all duration-200
            focus:outline-none focus:ring-1 focus:ring-[#FF7900]/40
            shadow-inner
          `}
        />

        {/* Visibility Toggle Button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 p-1 text-neutral-400 hover:text-white transition-colors focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

