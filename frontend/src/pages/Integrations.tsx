import React from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSEmptyState } from '@/components/ui/CSEmptyState';
import { Plug } from 'lucide-react';

const Integrations: React.FC = () => (
  <WorkspaceShell maxWidth={640}>
    <h1 className="text-[28px] font-semibold mb-8" style={{ color: 'var(--cs-text-primary)' }}>Integrations</h1>
    <CSEmptyState
      icon={Plug}
      title="Coming soon"
      description="Connect Claude Scope to your development tools and CI/CD pipelines."
    />
  </WorkspaceShell>
);

export default Integrations;
