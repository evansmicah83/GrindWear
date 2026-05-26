import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, hover = false, padding = 'md', className, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={cn(
        'bg-grind-card-bg border border-grind-border rounded-lg',
        'transition-all duration-200',
        hover && 'hover:shadow-lg hover:border-grind-black/20 cursor-pointer',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-semibold text-grind-black', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-grind-border', className)} {...props}>
      {children}
    </div>
  );
}
