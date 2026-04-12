import React from 'react';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';

interface PageSectionProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({ label, children, className = '' }) => (
  <section className={`mb-10 ${className}`}>
    {label && <CSMonoLabel>{label}</CSMonoLabel>}
    <div className={label ? 'mt-4' : ''}>{children}</div>
  </section>
);
