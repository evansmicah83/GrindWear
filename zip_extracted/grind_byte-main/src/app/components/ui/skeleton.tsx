import { HTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ variant = 'rect', width, height, className, ...props }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full'
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variants[variant],
        className
      )}
      style={{
        width: width || (variant === 'circle' ? height : undefined),
        height
      }}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-grind-border rounded-lg p-4">
      <Skeleton variant="rect" className="w-full aspect-square mb-4" />
      <Skeleton variant="text" className="w-3/4 mb-2" />
      <Skeleton variant="text" className="w-1/2 mb-3" />
      <Skeleton variant="text" className="w-1/4" />
    </div>
  );
}
