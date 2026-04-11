import React from 'react';
import { TopNav } from './TopNav';

interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const AppShell: React.FC<AppShellProps> = ({ children, maxWidth = 960 }) => (
  <div className="min-h-screen" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
    <TopNav />
    <main className="mx-auto py-10 px-6" style={{ maxWidth }}>
      {children}
    </main>
  </div>
);
