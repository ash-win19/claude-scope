import React from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { useSidebarStore } from '@/store/sidebarStore';

interface WorkspaceShellProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({ children, maxWidth = 960 }) => {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
      <WorkspaceSidebar />
      <main
        className={`py-10 px-8 transition-[margin-left] duration-200 ${collapsed ? 'workspace-main-collapsed' : 'workspace-main-expanded'}`}
        style={{ maxWidth: maxWidth + 64 }}
      >
        {children}
      </main>
    </div>
  );
};
