import { ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'md', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

  const variantStyles = {
    primary: 'bg-primary-100 text-primary-700 border border-primary-200',
    success: 'bg-success-100 text-success-700 border border-success-200',
    warning: 'bg-warning-100 text-warning-700 border border-warning-200',
    error: 'bg-error-100 text-error-700 border border-error-200',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
