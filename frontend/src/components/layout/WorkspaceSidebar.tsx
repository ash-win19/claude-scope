import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, CircleDot, Plug, Key, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { CSBadge } from '@/components/ui/CSBadge';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, badge }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
    style={{
      backgroundColor: active ? 'var(--cs-accent-muted)' : 'transparent',
      color: active ? 'var(--cs-text-primary)' : 'var(--cs-text-secondary)',
    }}
  >
    {icon}
    <span className="flex-1">{label}</span>
    {badge && <CSBadge variant="default">{badge}</CSBadge>}
  </Link>
);

export const WorkspaceSidebar: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isActive = (path: string) => {
    if (path === '/workspace') return location.pathname === '/workspace';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 w-56 flex flex-col border-r z-40"
      style={{
        backgroundColor: 'var(--cs-bg-surface)',
        borderColor: 'var(--cs-border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b" style={{ borderColor: 'var(--cs-border-subtle)' }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        <NavItem to="/workspace" icon={<LayoutDashboard size={16} />} label="Dashboard" active={isActive('/workspace') && !location.pathname.startsWith('/workspace/')} />
        <NavItem to="/workspace/sessions" icon={<FolderOpen size={16} />} label="Sessions" active={isActive('/workspace/sessions')} />
        <NavItem to="/workspace/record/new" icon={<CircleDot size={16} />} label="New Recording" active={isActive('/workspace/record')} />

        {/* Divider */}
        <div className="h-px my-3" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />

        <NavItem to="/workspace/integrations" icon={<Plug size={16} />} label="Integrations" active={isActive('/workspace/integrations')} badge="Soon" />
        <NavItem to="/workspace/model-access" icon={<Key size={16} />} label="Model Access" active={isActive('/workspace/model-access')} badge="Soon" />
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t flex flex-col gap-1" style={{ borderColor: 'var(--cs-border-subtle)' }}>
        <NavItem to="/workspace/settings" icon={<Settings size={16} />} label="Settings" active={isActive('/workspace/settings')} />
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: 'var(--cs-bg-overlay)', color: 'var(--cs-accent)' }}
              >
                {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <span className="text-xs truncate" style={{ color: 'var(--cs-text-secondary)' }}>{user.name}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
