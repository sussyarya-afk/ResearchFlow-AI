import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    'rf-btn',
    `rf-btn--${variant}`,
    `rf-btn--${size}`,
    fullWidth ? 'rf-btn--full' : '',
    isLoading ? 'rf-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="rf-btn__spinner" aria-hidden="true" />
      )}
      {!isLoading && leftIcon && (
        <span className="rf-btn__icon rf-btn__icon--left">{leftIcon}</span>
      )}
      <span className="rf-btn__label">{children}</span>
      {!isLoading && rightIcon && (
        <span className="rf-btn__icon rf-btn__icon--right">{rightIcon}</span>
      )}
    </button>
  );
}
