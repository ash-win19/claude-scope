import React from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSEmptyState } from '@/components/ui/CSEmptyState';
import { Key } from 'lucide-react';

const ModelAccess: React.FC = () => (
  <WorkspaceShell maxWidth={640}>
    <h1 className="text-[28px] font-semibold mb-8" style={{ color: 'var(--cs-text-primary)' }}>Model Access</h1>
    <CSEmptyState
      icon={Key}
      title="Coming soon"
      description="Configure API keys for Anthropic and other AI providers."
    />
  </WorkspaceShell>
);

export default ModelAccess;
