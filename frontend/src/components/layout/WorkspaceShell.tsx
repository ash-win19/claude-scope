import React from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';

interface WorkspaceShellProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({ children, maxWidth = 960 }) => (
  <div className="min-h-screen" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
    <WorkspaceSidebar />
    <main className="ml-56 py-10 px-8" style={{ maxWidth: maxWidth + 64 }}>
      {children}
    </main>
  </div>
);
