/**
 * @file Input.tsx
 * @description Implements components/ui/Input.tsx for The Obsolete Human Museum.
 */
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, id, type = 'text', ...props },
    ref
  ) => {
    const inputId =
      id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-sans font-medium text-museum-text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            [errorId, helperId].filter(Boolean).join(' ') || undefined
          }
          className={cn(
            'h-10 w-full rounded-lg border bg-museum-bg px-4 py-2 font-sans text-sm text-museum-text placeholder:text-museum-text-muted/50 transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-accent focus-visible:ring-offset-1 focus-visible:ring-offset-museum-bg',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-museum-danger focus-visible:ring-museum-danger'
              : 'border-museum-border hover:border-museum-border-hover',
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="text-xs text-museum-danger font-sans"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-museum-text-muted font-sans">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
