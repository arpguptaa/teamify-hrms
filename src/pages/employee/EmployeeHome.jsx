import { Cake, PartyPopper, Heart, Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSameMonthDay, yearsSince, statusMeta, formatDate } from '../../lib/constants';

export default function EmployeeHome() {
  const { currentClient, currentEmployee: me } = useAuth();
  const employees = currentClient.org?.employees || [];
  const status = statusMeta(me.status);

  const today = employees.flatMap((e) => {
    const items = [];
    if (isSameMonthDay(e.dob)) items.push({ e, icon: Cake, label: `${e.name}'s birthday 🎉` });
    if (isSameMonthDay(e.doj) && yearsSince(e.doj) >= 1) items.push({ e, icon: PartyPopper, label: `${e.name} completes ${yearsSince(e.doj)} year(s) at ${currentClient.companyName} 🎊` });
    if (isSameMonthDay(e.marriageAnniversary)) items.push({ e, icon: Heart, label: `${e.name}'s wedding anniversary 💐` });
    return items;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Welcome, {me.name.split(' ')[0]}</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Your profile at {currentClient.companyName}.</p>
      </div>

      {today.length > 0 && (
        <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/5 p-5">
          <p className="text-sm font-semibold text-ink dark:text-ink-dark mb-3">🎈 Today's celebrations</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {today.map(({ e, icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-surface dark:bg-surface-dark px-4 py-3">
                <span className="h-10 w-10 rounded-full overflow-hidden brand-gradient flex items-center justify-center text-white font-semibold shrink-0">
                  {e.photo ? <img src={e.photo} alt="" className="h-full w-full object-cover" /> : e.name?.[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink dark:text-ink-dark truncate">{label}</p>
                </div>
                <Icon size={16} className="text-brand-purple dark:text-brand-coral ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="h-16 w-16 rounded-full overflow-hidden brand-gradient flex items-center justify-center text-white text-xl font-semibold shrink-0">
            {me.photo ? <img src={me.photo} alt="" className="h-full w-full object-cover" /> : me.name?.[0]}
          </span>
          <div>
            <p className="text-lg font-semibold text-ink dark:text-ink-dark">{me.name}</p>
            <p className="text-sm text-ink-faint">{me.designation || '—'} {me.department ? `· ${me.department}` : ''}</p>
            <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${status.chip}`}>{status.label}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Info icon={Briefcase} label="Employee ID" value={me.employeeId} />
          <Info icon={Briefcase} label="Date of joining" value={formatDate(me.doj)} />
          <Info icon={Mail} label="Work email" value={me.email} />
          <Info icon={Phone} label="Work phone" value={me.phone} />
          <Info icon={MapPin} label="Work location" value={me.workLocation} />
          <Info icon={Briefcase} label="Employment type" value={me.employmentType} />
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-ink-faint mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-ink-faint">{label}</p>
        <p className="text-ink dark:text-ink-dark font-medium truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
