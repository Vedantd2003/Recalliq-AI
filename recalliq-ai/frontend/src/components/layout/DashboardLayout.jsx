import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, LayoutDashboard, FileText, Plus, BarChart3, 
  User, LogOut, ChevronLeft, ChevronRight, Zap, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/meetings', label: 'Meetings', icon: FileText },
  { to: '/dashboard/meetings/new', label: 'New Analysis', icon: Plus },
  { to: '/dashboard/usage', label: 'Usage', icon: BarChart3 },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const creditPct = Math.min(100, ((user?.credits || 0) / 100) * 100);

  return (
    <div className="flex h-screen bg-void overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 flex flex-col
          bg-surface border-r border-border
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-glow-sm">
              <Brain size={16} className="text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-display font-bold text-text-primary text-sm leading-none">
                  RecallIQ
                </div>
                <div className="text-neural-cyan text-xs font-mono mt-0.5">AI</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex btn-ghost p-1.5 text-text-muted hover:text-text-primary"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 
                 cursor-pointer group
                 ${isActive
                  ? 'text-text-primary bg-accent-glow border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="font-body font-medium text-sm truncate">
                  {item.label}
                </span>
              )}
              {!collapsed && item.to === '/dashboard/meetings/new' && (
                <span className="ml-auto text-xs bg-accent/20 text-accent-light px-1.5 py-0.5 rounded font-mono">
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Credits display */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <div className="card p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-neural-amber" />
                  <span className="text-xs font-mono text-text-muted">CREDITS</span>
                </div>
                <span className="text-sm font-display font-bold text-text-primary">
                  {user?.credits ?? 0}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${creditPct}%`,
                    background: creditPct > 50
                      ? 'linear-gradient(90deg, #7c6aff, #00d4ff)'
                      : creditPct > 20
                        ? 'linear-gradient(90deg, #ffb800, #ff8800)'
                        : 'linear-gradient(90deg, #ff4444, #ff4ddb)',
                  }}
                />
              </div>
              <div className="text-xs text-text-muted mt-1.5 capitalize">{user?.plan} Plan</div>
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                <span className="text-xs font-display font-bold text-accent-light">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{user?.name}</div>
                <div className="text-xs text-text-muted truncate">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-text-muted hover:text-neural-red transition-colors rounded"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Collapsed user */}
        {collapsed && (
          <div className="p-3 border-t border-border flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <span className="text-xs font-bold text-accent-light">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-text-muted hover:text-neural-red transition-colors rounded"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm">
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-text-primary text-sm">RecallIQ AI</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div
            className="min-h-full"
            style={{
              background: 'bg-grid-pattern bg-grid',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
