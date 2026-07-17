import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, LogOut, Menu, X, Network, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeLayout() {
  const { currentClient, currentEmployee, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const doLogout = () => { logout(); navigate('/login'); };

  if (!currentClient || !currentEmployee) return null;

  const canManageTeam = currentEmployee.permissions?.['employee-management'] === 'edit';

  const links = [
    { to: '/employee/home', label: 'Home', icon: LayoutGrid },
    { to: '/employee/team', label: 'My Team', icon: Network },
    ...(canManageTeam ? [{ to: '/employee/manage', label: 'Employee Management', icon: Users }] : []),
    { to: '/employee/account', label: 'My Account', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line dark:border-line-dark bg-surface dark:bg-surface-dark">
        <Brand client={currentClient} employee={currentEmployee} />
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {links.map((l) => <SidebarLink key={l.to} {...l} />)}
        </nav>
        <div className="p-3">
          <button onClick={doLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition">
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <aside className="w-72 h-full bg-surface dark:bg-surface-dark flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-2">
              <Brand client={currentClient} employee={currentEmployee} />
              <button onClick={() => setMobileOpen(false)} className="mr-3"><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
              {links.map((l) => <SidebarLink key={l.to} {...l} onClick={() => setMobileOpen(false)} />)}
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
          <div className="hidden lg:block text-sm text-ink-soft dark:text-ink-soft-dark">{currentClient.companyName}</div>
          <div className="flex items-center gap-2 text-xs font-medium text-ink-soft dark:text-ink-soft-dark bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
            <span className="h-2 w-2 rounded-full brand-gradient" /> {currentEmployee.name} · {currentEmployee.employeeId}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand({ client, employee }) {
  return (
    <div className="px-5 py-6 flex items-center gap-3">
      <span className="relative h-10 w-10 rounded-full overflow-hidden brand-gradient flex items-center justify-center text-white font-semibold shrink-0">
        {employee.photo ? <img src={employee.photo} alt="" className="h-full w-full object-cover" /> : employee.name?.[0]?.toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink dark:text-ink-dark truncate">{employee.name}</p>
        <p className="text-[11px] text-ink-faint truncate">{employee.designation || client.companyName}</p>
      </div>
    </div>
  );
}

function SidebarLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          isActive ? 'bg-brand-purple/10 text-brand-purple dark:text-brand-coral font-medium' : 'text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft'
        }`
      }
    >
      <Icon size={17} className="shrink-0" /> <span className="truncate">{label}</span>
    </NavLink>
  );
}
