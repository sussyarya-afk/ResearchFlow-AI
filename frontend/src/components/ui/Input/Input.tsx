import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `rf-input-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`;
    const hasError = Boolean(error);

    return (
      <div
        className={[
          'rf-input-wrapper',
          fullWidth ? 'rf-input-wrapper--full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label && (
          <label className="rf-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div
          className={[
            'rf-input__field-wrapper',
            hasError ? 'rf-input__field-wrapper--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {leftIcon && (
            <span className="rf-input__icon rf-input__icon--left">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="rf-input__field"
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <span className="rf-input__icon rf-input__icon--right">
              {rightIcon}
            </span>
          )}
        </div>
        {hasError && (
          <span className="rf-input__error" id={`${inputId}-error`} role="alert">
            {error}
          </span>
        )}
        {!hasError && helperText && (
          <span className="rf-input__helper" id={`${inputId}-helper`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
