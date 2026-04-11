import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const TopNav: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const links = [
    { to: '/app', label: 'Dashboard' },
    { to: '/app/sessions', label: 'Sessions' },
  ];

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="sticky top-0 z-50 h-14 flex items-center px-6 border-b"
      style={{
        backgroundColor: 'var(--cs-bg-surface)',
        borderColor: 'var(--cs-border-subtle)',
      }}
    >
      <Link to="/app" className="flex items-center gap-2 mr-8">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
          Claude Scope
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="px-3 py-1.5 text-sm transition-colors duration-150"
            style={{
              color: isActive(link.to) ? 'var(--cs-text-primary)' : 'var(--cs-text-secondary)',
              borderBottom: isActive(link.to) ? '2px solid var(--cs-accent)' : '2px solid transparent',
            }}
          >
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link
          to="/app/settings"
          className="p-1.5 rounded-md transition-colors duration-150"
          style={{ color: 'var(--cs-text-secondary)' }}
        >
          <Settings size={18} />
        </Link>
        {user && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
            style={{
              backgroundColor: 'var(--cs-bg-overlay)',
              color: 'var(--cs-accent)',
            }}
          >
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        )}
      </div>
    </nav>
  );
};
