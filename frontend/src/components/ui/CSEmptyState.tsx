import React from 'react';
import { CSButton } from './CSButton';
import { LucideIcon } from 'lucide-react';

interface CSEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: () => void;
}

export const CSEmptyState: React.FC<CSEmptyStateProps> = ({ icon: Icon, title, description, ctaLabel, ctaAction }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <Icon size={40} style={{ color: 'var(--cs-text-muted)' }} strokeWidth={1.5} />
    <h3 className="text-base font-semibold mt-4" style={{ color: 'var(--cs-text-primary)' }}>{title}</h3>
    <p className="text-sm mt-1.5 max-w-xs" style={{ color: 'var(--cs-text-secondary)' }}>{description}</p>
    {ctaLabel && ctaAction && (
      <CSButton variant="secondary" size="md" onClick={ctaAction} className="mt-4">
        {ctaLabel}
      </CSButton>
    )}
  </div>
);
