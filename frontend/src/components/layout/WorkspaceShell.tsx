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
      <div
        className={`transition-[margin-left] duration-200 ${collapsed ? 'workspace-main-collapsed' : 'workspace-main-expanded'}`}
      >
        <main
          className="mx-auto w-full py-10 px-6 sm:px-8 lg:px-10"
          style={{ maxWidth: maxWidth + 80 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
