import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, CircleDot, Plug, Key, PanelLeftClose, PanelLeft, X, Menu, Coffee } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { CSBadge } from '@/components/ui/CSBadge';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, collapsed, badge, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`flex items-center gap-3 rounded-lg text-sm transition-colors duration-150 ${collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}`}
    style={{
      backgroundColor: active ? 'var(--cs-accent-muted)' : 'transparent',
      color: active ? 'var(--cs-text-primary)' : 'var(--cs-text-secondary)',
    }}
  >
    {icon}
    {!collapsed && <span className="flex-1 truncate">{label}</span>}
    {!collapsed && badge && <CSBadge variant="default">{badge}</CSBadge>}
  </Link>
);

export const SIDEBAR_WIDTH_EXPANDED = 224;
export const SIDEBAR_WIDTH_COLLAPSED = 64;

export const WorkspaceSidebar: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/workspace') return location.pathname === '/workspace';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (isCollapsed: boolean, closeMobile?: () => void) => (
    <>
      <div className={`h-14 flex items-center border-b ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-4'}`} style={{ borderColor: 'var(--cs-border-subtle)' }}>
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--cs-accent)' }} />
        {!isCollapsed && <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>}
        {closeMobile && !isCollapsed && (
          <button onClick={closeMobile} className="ml-auto p-1" style={{ color: 'var(--cs-text-muted)' }}>
            <X size={16} />
          </button>
        )}
        {!closeMobile && (
          <button
            onClick={toggle}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto p-1 rounded transition-colors duration-150"
            style={{ color: 'var(--cs-text-muted)' }}
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
        <NavItem to="/workspace" icon={<LayoutDashboard size={16} />} label="Dashboard" active={isActive('/workspace') && !location.pathname.startsWith('/workspace/')} collapsed={isCollapsed} onClick={closeMobile} />
        <NavItem to="/workspace/sessions" icon={<FolderOpen size={16} />} label="Sessions" active={isActive('/workspace/sessions')} collapsed={isCollapsed} onClick={closeMobile} />
        <NavItem to="/workspace/record/new" icon={<CircleDot size={16} />} label="New Recording" active={isActive('/workspace/record')} collapsed={isCollapsed} onClick={closeMobile} />
        <div className="h-px my-3" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />
        <NavItem to="/workspace/integrations" icon={<Plug size={16} />} label="Integrations" active={isActive('/workspace/integrations')} collapsed={isCollapsed} badge="Soon" onClick={closeMobile} />
        <NavItem to="/workspace/model-access" icon={<Key size={16} />} label="Model Access" active={isActive('/workspace/model-access')} collapsed={isCollapsed} onClick={closeMobile} />
      </nav>

      <div className="px-2 pb-2">
        <a
          href="https://buymeacoffee.com/ashwinshanmugam"
          target="_blank"
          rel="noopener noreferrer"
          title={isCollapsed ? 'Buy me a coffee' : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm transition-colors duration-150 hover:brightness-110 ${isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}`}
          style={{
            color: 'var(--cs-warning)',
          }}
        >
          <Coffee size={16} />
          {!isCollapsed && <span className="flex-1 truncate">Buy me a coffee</span>}
        </a>
      </div>

      <div className="px-2 py-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--cs-border-subtle)' }}>
        {user && !isCollapsed && (
          <Link
            to="/workspace/profile"
            onClick={closeMobile}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150"
            style={{
              backgroundColor: isActive('/workspace/profile') ? 'var(--cs-accent-muted)' : 'transparent',
              color: isActive('/workspace/profile') ? 'var(--cs-text-primary)' : 'var(--cs-text-secondary)',
            }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--cs-bg-overlay)', color: 'var(--cs-accent)' }}>
                {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <span className="text-xs truncate">{user.name}</span>
          </Link>
        )}
        {user && isCollapsed && (
          <Link
            to="/workspace/profile"
            onClick={closeMobile}
            title="Profile"
            className="flex justify-center py-2 rounded-lg transition-colors duration-150"
            style={{
              backgroundColor: isActive('/workspace/profile') ? 'var(--cs-accent-muted)' : 'transparent',
            }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--cs-bg-overlay)', color: 'var(--cs-accent)' }}>
                {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        className="fixed top-0 left-0 bottom-0 flex-col border-r z-40 transition-[width] duration-200 hidden md:flex"
        style={{
          width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
          backgroundColor: 'var(--cs-bg-surface)',
          borderColor: 'var(--cs-border-subtle)',
        }}
      >
        {sidebarContent(collapsed)}
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg md:hidden"
        style={{ backgroundColor: 'var(--cs-bg-surface)', color: 'var(--cs-text-secondary)' }}
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
          <aside
            className="fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r md:hidden"
            style={{ width: SIDEBAR_WIDTH_EXPANDED, backgroundColor: 'var(--cs-bg-surface)', borderColor: 'var(--cs-border-subtle)' }}
          >
            {sidebarContent(false, () => setMobileOpen(false))}
          </aside>
        </>
      )}
    </>
  );
};
