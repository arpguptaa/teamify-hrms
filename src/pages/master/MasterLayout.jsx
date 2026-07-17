import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Database, Layers, LifeBuoy, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from '../../components/Logo';
import NotificationBell from '../../components/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const NAV = [
  { to: '/master/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/master/setup-client', label: 'Setup Client Account', icon: UserPlus },
  { to: '/master/clients', label: 'Client Database & Subscription', icon: Database },
  { to: '/master/plans', label: 'Plan Management', icon: Layers },
  { to: '/master/support', label: 'Support Tickets', icon: LifeBuoy },
  { to: '/master/account', label: 'My Account', icon: Settings },
];

export default function MasterLayout() {
  const { logout } = useAuth();
  const { tickets, activity, markActivityRead } = useData();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = tickets.filter((t) => !t.read).length;
  const masterActivity = activity.filter((a) => a.scope === 'master');

  const doLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line dark:border-line-dark bg-surface dark:bg-surface-dark">
        <div className="px-5 py-6"><Logo size="sm" /></div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} badge={item.to === '/master/support' ? unread : 0} />
          ))}
        </nav>
        <div className="p-3">
          <button onClick={doLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition">
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      {/* Sidebar - mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <aside className="w-72 h-full bg-surface dark:bg-surface-dark flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-6 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {NAV.map((item) => (
                <NavItem key={item.to} item={item} onClick={() => setMobileOpen(false)} badge={item.to === '/master/support' ? unread : 0} />
              ))}
            </nav>
            <div className="p-3">
              <button onClick={doLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition">
                <LogOut size={17} /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-line dark:border-line-dark bg-surface dark:bg-surface-dark flex items-center justify-between px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div className="hidden lg:block text-sm text-ink-soft dark:text-ink-soft-dark">Owner Console</div>
          <div className="flex items-center gap-3">
            <NotificationBell items={masterActivity} onMarkAllRead={() => markActivityRead((scope) => scope === 'master')} />
            <div className="flex items-center gap-2 text-xs font-medium text-ink-soft dark:text-ink-soft-dark bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
              <span className="h-2 w-2 rounded-full brand-gradient" /> Master Account
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, onClick, badge }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          isActive
            ? 'bg-brand-purple/10 text-brand-purple dark:text-brand-coral font-medium'
            : 'text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft'
        }`
      }
    >
      <span className="flex items-center gap-3"><Icon size={17} /> {item.label}</span>
      {badge > 0 && <span className="text-[10px] font-semibold bg-brand-coral text-white rounded-full h-5 min-w-5 px-1 flex items-center justify-center">{badge}</span>}
    </NavLink>
  );
}
