import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LayoutGrid, LogOut, Menu, X, Lock, Network, Settings, Cloud } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import NotificationBell from '../../components/NotificationBell';
import GoogleDriveCard from '../../components/GoogleDriveCard';
import { CLIENT_MODULES, daysUntil } from '../../lib/constants';

export default function ClientLayout() {
  const { currentClient, logout } = useAuth();
  const { activity, markActivityRead, setClientDrive } = useData();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [driveSkipped, setDriveSkipped] = useState(false);

  const doLogout = () => { logout(); navigate('/login'); };

  if (!currentClient) return null;

  const locked = (
    currentClient.status === 'locked' ||
    currentClient.status === 'paused' ||
    currentClient.status === 'cancelled' ||
    (currentClient.status === 'active' && currentClient.nextBillingDate && daysUntil(currentClient.nextBillingDate) < 0)
  );

  const needsDriveSetup = !locked && !currentClient.driveConfig?.connected && !driveSkipped;
  const clientActivity = activity.filter((a) => a.scope === currentClient.id);

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line dark:border-line-dark bg-surface dark:bg-surface-dark">
        <ClientBrand client={currentClient} />
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          <SidebarLink to="/client/dashboard" label="Home" icon={LayoutGrid} />
          <SidebarLink to="/client/organisation" label="Overview & Genealogy" icon={Network} />
          <div className="h-px bg-line dark:bg-line-dark my-2 mx-3" />
          {CLIENT_MODULES.map((m) => (
            <SidebarLink key={m.id} to={`/client/module/${m.id}`} label={m.label} icon={Icons[m.icon] || LayoutGrid} />
          ))}
          <div className="h-px bg-line dark:bg-line-dark my-2 mx-3" />
          <SidebarLink to="/client/account" label="My Account" icon={Settings} />
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
              <ClientBrand client={currentClient} />
              <button onClick={() => setMobileOpen(false)} className="mr-3"><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
              <SidebarLink to="/client/dashboard" label="Home" icon={LayoutGrid} onClick={() => setMobileOpen(false)} />
              <SidebarLink to="/client/organisation" label="Overview & Genealogy" icon={Network} onClick={() => setMobileOpen(false)} />
              <div className="h-px bg-line dark:bg-line-dark my-2 mx-3" />
              {CLIENT_MODULES.map((m) => (
                <SidebarLink key={m.id} to={`/client/module/${m.id}`} label={m.label} icon={Icons[m.icon] || LayoutGrid} onClick={() => setMobileOpen(false)} />
              ))}
              <div className="h-px bg-line dark:bg-line-dark my-2 mx-3" />
              <SidebarLink to="/client/account" label="My Account" icon={Settings} onClick={() => setMobileOpen(false)} />
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
          <div className="flex items-center gap-3">
            <NotificationBell items={clientActivity} onMarkAllRead={() => markActivityRead((scope) => scope === currentClient.id)} />
            <div className="flex items-center gap-2 text-xs font-medium text-ink-soft dark:text-ink-soft-dark bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
              <span className="h-2 w-2 rounded-full brand-gradient" /> {currentClient.clientName}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {locked ? (
            <LockedScreen client={currentClient} />
          ) : needsDriveSetup ? (
            <DriveSetupGate client={currentClient} onConnect={(folder) => setClientDrive(currentClient.id, folder)} onSkip={() => setDriveSkipped(true)} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

function ClientBrand({ client }) {
  return (
    <div className="px-5 py-6 flex items-center gap-3">
      <div className="relative shrink-0">
        {client.logo ? (
          <img src={client.logo} alt={client.companyName} className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-lg brand-gradient flex items-center justify-center text-white font-semibold">
            {client.companyName?.[0] || 'C'}
          </div>
        )}
        <img src="/teamify-logo.png" alt="Teamify" title="Powered by Teamify" className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full ring-2 ring-surface dark:ring-surface-dark object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink dark:text-ink-dark truncate">{client.companyName}</p>
        <p className="text-[11px] text-ink-faint">Powered by Teamify</p>
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

function DriveSetupGate({ client, onConnect, onSkip }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-6">
      <div className="mx-auto h-16 w-16 rounded-full brand-gradient flex items-center justify-center">
        <Cloud className="text-white" size={26} />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-ink dark:text-ink-dark mb-2">Connect Google Drive to continue</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark">
          Before you start, choose a Google Drive folder where {client.companyName}'s HR data will be
          stored. You can change this folder anytime later from My Account.
        </p>
      </div>
      <div className="text-left">
        <GoogleDriveCard
          config={client.driveConfig}
          onConnect={onConnect}
          onDisconnect={() => {}}
          description=""
        />
      </div>
      <button onClick={onSkip} className="text-xs text-ink-faint hover:text-ink-soft dark:hover:text-ink-soft-dark underline">
        Skip for now — set this up later from My Account
      </button>
    </div>
  );
}

function LockedScreen({ client }) {
  const reason = client.status === 'paused' ? 'paused' : client.status === 'cancelled' ? 'cancelled' : 'expired';
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="mx-auto h-16 w-16 rounded-full bg-brand-coral/10 flex items-center justify-center mb-6">
        <Lock className="text-brand-coral" size={26} />
      </div>
      <h1 className="text-xl font-semibold text-ink dark:text-ink-dark mb-2">
        {reason === 'paused' ? 'Your account is paused' : reason === 'cancelled' ? 'Your subscription was cancelled' : 'Your subscription has expired'}
      </h1>
      <p className="text-sm text-ink-soft dark:text-ink-soft-dark mb-8">
        {reason === 'paused'
          ? "Your workspace is temporarily on hold. Reach out to Teamify support to resume."
          : "Buy a subscription to unlock your Teamify workspace again."}
      </p>
      <a href="mailto:agroup108@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient text-white font-medium py-3 px-8 hover:opacity-90 transition">
        Contact Teamify to renew
      </a>
    </div>
  );
}
