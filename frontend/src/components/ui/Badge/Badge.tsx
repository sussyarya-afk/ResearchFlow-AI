import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  return (
    <span className={`rf-badge rf-badge--${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
