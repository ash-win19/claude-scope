import React from 'react';

interface CSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'compact' | 'default' | 'spacious';
}

const paddingMap = {
  compact: 'p-4',
  default: 'p-5',
  spacious: 'p-6',
};

export const CSCard = React.forwardRef<HTMLDivElement, CSCardProps>(
  ({ padding = 'default', className = '', style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-xl border ${paddingMap[padding]} ${className}`}
      style={{
        backgroundColor: 'var(--cs-bg-surface)',
        borderColor: 'var(--cs-border-subtle)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

CSCard.displayName = 'CSCard';
