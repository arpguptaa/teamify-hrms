import { Link } from 'react-router-dom';
import { IndianRupee, Users, Clock, TriangleAlert, ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ExportButton from '../../components/ExportButton';
import { formatINR, formatDate, daysUntil, monthlyPriceForClient } from '../../lib/constants';

export default function Dashboard() {
  const { clients, plans, tickets } = useData();
  const { master } = useAuth();

  const active = clients.filter((c) => c.status === 'active');
  const pending = clients.filter((c) => c.status === 'pending');
  const locked = clients.filter((c) => c.status === 'locked');
  const monthlyEarnings = active.reduce((sum, c) => sum + monthlyPriceForClient(c, plans), 0);
  const upgradeRequests = clients.filter((c) => c.upgradeRequested);
  const expiringSoon = active.filter((c) => c.nextBillingDate && daysUntil(c.nextBillingDate) <= 5);
  const unreadTickets = tickets.filter((t) => !t.read).length;

  const exportRows = clients.map((c) => ({
    Company: c.companyName, Contact: c.clientName, Email: c.email, Status: c.status,
    Plan: plans.find((p) => p.id === c.planId)?.label || '', 'Monthly (₹)': monthlyPriceForClient(c, plans),
    'Next billing': formatDate(c.nextBillingDate),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Hi, {master.name || master.userId} 👋</h1>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Quick overview of earnings and active clients.</p>
        </div>
        <ExportButton filename="teamify-dashboard-overview" rows={exportRows} sheetName="Overview" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Monthly recurring revenue" value={formatINR(monthlyEarnings)} accent sub={`from ${active.length} active client${active.length === 1 ? '' : 's'}`} />
        <StatCard icon={Users} label="Active clients" value={active.length} sub={`${clients.length} total accounts`} />
        <StatCard icon={Clock} label="Pending activation" value={pending.length} sub="awaiting review" />
        <StatCard icon={TriangleAlert} label="Locked / expired" value={locked.length} sub="subscription lapsed" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink dark:text-ink-dark">Expiring soon</h2>
            <Link to="/master/clients" className="text-xs text-brand-purple dark:text-brand-coral inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-ink-faint py-6 text-center">No subscriptions expiring in the next 5 days.</p>
          ) : (
            <div className="space-y-2">
              {expiringSoon.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-surface-soft dark:bg-surface-dark-soft">
                  <div>
                    <p className="text-sm font-medium text-ink dark:text-ink-dark">{c.companyName}</p>
                    <p className="text-xs text-ink-soft dark:text-ink-soft-dark">{c.clientName}</p>
                  </div>
                  <span className="text-xs font-medium text-brand-coral">{daysUntil(c.nextBillingDate)}d left · {formatDate(c.nextBillingDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5 space-y-4">
          <h2 className="font-semibold text-ink dark:text-ink-dark">Needs attention</h2>
          <Row label="Pending activations" value={pending.length} to="/master/clients" />
          <Row label="Plan upgrade requests" value={upgradeRequests.length} to="/master/clients" />
          <Row label="Unread support messages" value={unreadTickets} to="/master/support" />
        </div>
      </div>

      {pending.length > 0 && (
        <div className="rounded-2xl border border-dashed border-brand-purple/30 bg-brand-purple/5 p-5">
          <p className="text-sm font-medium text-ink dark:text-ink-dark mb-3">New signup requests waiting for activation</p>
          <div className="space-y-2">
            {pending.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-ink dark:text-ink-dark">{c.companyName} <span className="text-ink-faint">· {c.clientName}</span></span>
                <Link to="/master/clients" className="text-brand-purple dark:text-brand-coral hover:underline">Review →</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }) {
  const Icon = icon;
  return (
    <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5">{label}</p>
          <p className={`text-2xl font-semibold ${accent ? 'brand-gradient-text' : 'text-ink dark:text-ink-dark'}`}>{value}</p>
          {sub && <p className="text-xs text-ink-faint mt-1">{sub}</p>}
        </div>
        <div className="h-10 w-10 rounded-xl brand-gradient flex items-center justify-center shrink-0">
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, to }) {
  return (
    <Link to={to} className="flex items-center justify-between text-sm group">
      <span className="text-ink-soft dark:text-ink-soft-dark group-hover:text-ink dark:group-hover:text-ink-dark transition">{label}</span>
      <span className="font-semibold text-ink dark:text-ink-dark">{value}</span>
    </Link>
  );
}
