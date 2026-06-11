import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-purple-200/80 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          className={`w-full px-4 py-3 bg-purple-950/20 border rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 
            ${error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
              : 'border-purple-800/40 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            } 
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-400 font-medium mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
