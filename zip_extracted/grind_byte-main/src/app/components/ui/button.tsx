import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-grind-black text-grind-white hover:bg-grind-black/90 active:scale-[0.98]',
    secondary: 'bg-grind-white text-grind-black border-2 border-grind-border hover:bg-grind-background active:scale-[0.98]',
    outline: 'bg-transparent border-2 border-grind-black text-grind-black hover:bg-grind-black hover:text-grind-white active:scale-[0.98]',
    ghost: 'bg-transparent text-grind-black hover:bg-grind-background',
    danger: 'bg-grind-danger text-grind-white hover:bg-grind-danger/90 active:scale-[0.98]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-5 py-2.5 text-base rounded-lg',
    lg: 'px-7 py-3.5 text-lg rounded-lg'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
