import React from 'react';
import { Loader2 } from 'lucide-react';

interface CSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: 'cs-btn-primary',
  secondary: 'cs-btn-secondary',
  ghost: 'cs-btn-ghost',
  danger: 'cs-btn-danger',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
};

export const CSButton = React.forwardRef<HTMLButtonElement, CSButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, iconLeft, iconRight, children, className = '', style, ...props }, ref) => {
    const isDisabled = disabled || loading;

    const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap select-none';

    const variantClasses: Record<string, { base: string; focusRing: string }> = {
      primary: {
        base: '',
        focusRing: 'focus:ring-[var(--cs-accent)] focus:ring-offset-[var(--cs-bg-base)]',
      },
      secondary: {
        base: 'border border-[var(--cs-border-default)] bg-transparent hover:bg-[var(--cs-bg-overlay)]',
        focusRing: 'focus:ring-[var(--cs-accent)] focus:ring-offset-[var(--cs-bg-base)]',
      },
      ghost: {
        base: 'border-none bg-transparent hover:text-[var(--cs-text-primary)]',
        focusRing: 'focus:ring-[var(--cs-accent)] focus:ring-offset-[var(--cs-bg-base)]',
      },
      danger: {
        base: 'border border-[var(--cs-danger)]',
        focusRing: 'focus:ring-[var(--cs-danger)] focus:ring-offset-[var(--cs-bg-base)]',
      },
    };

    const vc = variantClasses[variant];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseClasses} ${sizeStyles[size]} ${vc.base} ${vc.focusRing} disabled:opacity-50 disabled:pointer-events-none ${className}`}
        style={{
          ...(variant === 'primary' ? {
            backgroundColor: 'var(--cs-accent)',
            color: 'var(--cs-on-accent)',
          } : {}),
          ...(variant === 'ghost' ? {
            color: 'var(--cs-text-secondary)',
          } : {}),
          ...(variant === 'danger' ? {
            backgroundColor: 'var(--cs-danger-muted)',
            color: 'var(--cs-danger)',
          } : {}),
          ...(variant === 'secondary' ? {
            color: 'var(--cs-text-primary)',
          } : {}),
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === 'sm' ? 12 : 16} className="animate-cs-spin" />
        ) : iconLeft ? (
          iconLeft
        ) : null}
        {children}
        {iconRight && !loading ? iconRight : null}
      </button>
    );
  }
);

CSButton.displayName = 'CSButton';
