import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm text-grind-black">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 bg-grind-white border border-grind-border rounded-lg',
              'text-grind-black placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-grind-blue focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-grind-danger focus:ring-grind-danger',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-grind-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
