import React from 'react';

interface CSInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const CSInput = React.forwardRef<HTMLInputElement, CSInputProps>(
  ({ label, error, hint, iconLeft, iconRight, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium"
            style={{ color: 'var(--cs-text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span className="absolute left-3 flex items-center" style={{ color: 'var(--cs-text-muted)' }}>
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full h-9 rounded-lg border px-3 text-sm outline-none transition-colors duration-150 ${iconLeft ? 'pl-9' : ''} ${iconRight ? 'pr-9' : ''}`}
            style={{
              backgroundColor: 'var(--cs-bg-raised)',
              borderColor: error ? 'var(--cs-danger)' : 'var(--cs-border-default)',
              color: 'var(--cs-text-primary)',
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = 'var(--cs-accent)';
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              if (!error) e.currentTarget.style.borderColor = 'var(--cs-border-default)';
              props.onBlur?.(e);
            }}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 flex items-center" style={{ color: 'var(--cs-text-muted)' }}>
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <span className="text-xs" style={{ color: 'var(--cs-danger)' }}>{error}</span>
        )}
        {hint && !error && (
          <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>{hint}</span>
        )}
      </div>
    );
  }
);

CSInput.displayName = 'CSInput';
