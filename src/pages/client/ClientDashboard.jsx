import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LayoutGrid, CalendarClock, Users, TrendingUp, Cake, PartyPopper, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CLIENT_MODULES, formatDate, daysUntil, formatINR, monthlyPriceForClient, isSameMonthDay, yearsSince } from '../../lib/constants';

export default function ClientDashboard() {
  const { currentClient } = useAuth();
  const { plans, requestUpgrade } = useData();
  const plan = plans.find((p) => p.id === currentClient.planId);
  const remaining = currentClient.nextBillingDate ? daysUntil(currentClient.nextBillingDate) : null;
  const nearLimit = plan && currentClient.employeeCount >= plan.max;

  const employees = currentClient.org?.employees || [];
  const today = employees.flatMap((e) => {
    const items = [];
    if (isSameMonthDay(e.dob)) items.push({ e, icon: Cake, label: `${e.name}'s birthday` });
    if (isSameMonthDay(e.doj) && yearsSince(e.doj) >= 1) items.push({ e, icon: PartyPopper, label: `${e.name} · ${yearsSince(e.doj)} year(s) work anniversary` });
    if (isSameMonthDay(e.marriageAnniversary)) items.push({ e, icon: Heart, label: `${e.name}'s wedding anniversary` });
    return items;
  });

  return (
    <div className="space-y-8">
      <div className="rounded-2xl brand-gradient p-6 sm:p-8 text-white flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {currentClient.logo ? (
            <img src={currentClient.logo} alt={currentClient.companyName} className="h-16 w-16 rounded-2xl object-cover bg-white/10" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-semibold">
              {currentClient.companyName?.[0]}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Hi, {currentClient.clientName?.split(' ')[0] || 'there'} 👋</p>
            <h1 className="text-2xl font-semibold">{currentClient.companyName}</h1>
            <p className="text-white/80 text-sm">{currentClient.clientName}</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <InfoCard icon={Users} label="Employee accounts" value={`${currentClient.employeeCount} / ${plan?.max ?? '—'}`} />
        <InfoCard icon={LayoutGrid} label="Current plan" value={plan?.label || '—'} sub={plan ? `${formatINR(monthlyPriceForClient(currentClient, plans))}/month` : ''} />
        <InfoCard icon={CalendarClock} label="Next billing date" value={formatDate(currentClient.nextBillingDate)} sub={remaining != null ? `${remaining} day${remaining === 1 ? '' : 's'} remaining` : ''} />
      </div>

      {today.length > 0 && (
        <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/5 p-5">
          <p className="text-sm font-semibold text-ink dark:text-ink-dark mb-3">🎈 Today's celebrations</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {today.map(({ e, icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-surface dark:bg-surface-dark px-4 py-3">
                <span className="h-9 w-9 rounded-full overflow-hidden brand-gradient flex items-center justify-center text-white font-semibold shrink-0">
                  {e.photo ? <img src={e.photo} alt="" className="h-full w-full object-cover" /> : e.name?.[0]}
                </span>
                <p className="text-sm text-ink dark:text-ink-dark min-w-0 truncate">{label}</p>
                <Icon size={15} className="text-brand-purple dark:text-brand-coral ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {nearLimit && (
        <div className="rounded-2xl border border-dashed border-brand-purple/30 bg-brand-purple/5 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink dark:text-ink-dark">You've reached your plan's employee limit</p>
            <p className="text-xs text-ink-soft dark:text-ink-soft-dark mt-0.5">Upgrade your plan to add more employee accounts.</p>
          </div>
          {currentClient.upgradeRequested ? (
            <span className="text-xs font-medium text-brand-purple dark:text-brand-coral">Upgrade request sent ✓</span>
          ) : (
            <button onClick={() => requestUpgrade(currentClient.id)} className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 transition">
              <TrendingUp size={15} /> Upgrade your plan
            </button>
          )}
        </div>
      )}

      <div>
        <h2 className="font-semibold text-ink dark:text-ink-dark mb-4">HR modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CLIENT_MODULES.map((m) => {
            const Icon = Icons[m.icon] || LayoutGrid;
            return (
              <Link key={m.id} to={`/client/module/${m.id}`} className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4 hover:border-brand-purple/40 hover:shadow-sm transition group">
                <div className="h-9 w-9 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-3 group-hover:brand-gradient transition">
                  <Icon size={16} className="text-brand-purple dark:text-brand-coral group-hover:text-white transition" />
                </div>
                <p className="text-sm font-medium text-ink dark:text-ink-dark">{m.label}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5">{label}</p>
          <p className="text-xl font-semibold text-ink dark:text-ink-dark">{value}</p>
          {sub && <p className="text-xs text-ink-faint mt-1">{sub}</p>}
        </div>
        <div className="h-9 w-9 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-brand-purple dark:text-brand-coral" />
        </div>
      </div>
    </div>
  );
}
