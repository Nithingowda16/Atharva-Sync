import React from 'react';
import { User, AlertCircle } from 'lucide-react';

export const TextInput = ({
  id = 'identifier',
  name = 'identifier',
  label = 'Employee ID / Email',
  placeholder = 'e.g. EMP-1048 or corporate email',
  value,
  onChange,
  error,
  autoComplete = 'username',
  autoFocus = false,
}) => {
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
        {/* Left User Icon */}
        <div className="absolute left-4 pointer-events-none text-neutral-400">
          <User className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`
            w-full
            pl-12 pr-4 py-3.5
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

