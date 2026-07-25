import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

type CardVariant = 'default' | 'glass' | 'outlined' | 'elevated';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  variant = 'glass',
  padding = 'md',
  hoverable = false,
  header,
  footer,
  children,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    'rf-card',
    `rf-card--${variant}`,
    `rf-card--pad-${padding}`,
    hoverable ? 'rf-card--hoverable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {header && <div className="rf-card__header">{header}</div>}
      <div className="rf-card__body">{children}</div>
      {footer && <div className="rf-card__footer">{footer}</div>}
    </div>
  );
}
