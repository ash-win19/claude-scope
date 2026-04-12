import React from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { CSCard } from '@/components/ui/CSCard';
import { CSBadge } from '@/components/ui/CSBadge';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { Github, Slack, Webhook } from 'lucide-react';

const integrations = [
  { icon: <Github size={20} />, name: 'GitHub', description: 'Auto-create issues from recording sessions.', status: 'Coming soon' },
  { icon: <Slack size={20} />, name: 'Slack', description: 'Post session summaries to a channel.', status: 'Coming soon' },
  { icon: <Webhook size={20} />, name: 'Webhooks', description: 'Send processing events to your endpoints.', status: 'Coming soon' },
];

const Integrations: React.FC = () => (
  <WorkspaceShell maxWidth={640}>
    <PageHeader title="Integrations" subtitle="Connect Claude Scope to your development workflow." />

    <div className="flex flex-col gap-3">
      {integrations.map((item) => (
        <CSCard key={item.name} padding="default">
          <div className="flex items-center gap-4">
            <div style={{ color: 'var(--cs-text-muted)' }}>{item.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--cs-text-primary)' }}>{item.name}</span>
                <CSBadge variant="default">{item.status}</CSBadge>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cs-text-secondary)' }}>{item.description}</p>
            </div>
          </div>
        </CSCard>
      ))}
    </div>
  </WorkspaceShell>
);

export default Integrations;
