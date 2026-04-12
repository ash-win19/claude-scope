import React from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { CSButton } from '@/components/ui/CSButton';
import { ExternalLink } from 'lucide-react';

const DOCS_URL = 'https://claudescope.mintlify.app/';

const Docs: React.FC = () => (
  <WorkspaceShell maxWidth={1200}>
    <PageHeader title="Documentation" subtitle="Claude Scope guides, API reference, and tutorials.">
      <CSButton
        variant="secondary"
        size="sm"
        iconLeft={<ExternalLink size={14} />}
        onClick={() => window.open(DOCS_URL, '_blank', 'noopener')}
      >
        Open in new tab
      </CSButton>
    </PageHeader>

    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--cs-border-subtle)', height: 'calc(100vh - 180px)' }}
    >
      <iframe
        src={DOCS_URL}
        title="Claude Scope Documentation"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        loading="lazy"
      />
    </div>
  </WorkspaceShell>
);

export default Docs;
