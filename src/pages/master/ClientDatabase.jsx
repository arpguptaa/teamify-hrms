import { useState } from 'react';
import { Search, CalendarPlus, Lock, LockOpen, Pause, Play, XCircle, CheckCircle2, ChevronDown, TrendingUp, Pencil, X, Repeat, FileImage, Users, CalendarClock, FileText, Clock, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import ExportButton from '../../components/ExportButton';
import ClientProfileFields from '../../components/ClientProfileFields';
import { formatINR, formatDate, daysUntil, monthlyPriceForClient, prorateCycleChange, BILLING_CYCLES } from '../../lib/constants';

const STATUS_STYLE = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  locked: 'bg-brand-coral/10 text-brand-coral',
  paused: 'bg-ink-faint/15 text-ink-soft dark:text-ink-soft-dark',
  cancelled: 'bg-ink-faint/15 text-ink-faint',
};

export default function ClientDatabase() {
  const {
    clients, plans, activateClient, extendSubscription, setClientStatus, unlockClient,
    applyUpgrade, setClientPlan, updateClientDetails, setClientDiscount, changeBillingCycle,
    approvePaymentProof, setNextBillingDate,
  } = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const filtered = clients.filter((c) => {
    const matchesQuery = `${c.companyName} ${c.clientName} ${c.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesQuery && matchesFilter;
  });

  const planOf = (id) => plans.find((p) => p.id === id);

  const exportRows = filtered.map((c) => ({
    Company: c.companyName, 'Legal entity': c.legalEntityName, Contact: c.clientName, Designation: c.contactDesignation,
    Phone: c.contactInfo, Email: c.email, Status: c.status, Plan: planOf(c.planId)?.label || '',
    'Monthly (₹)': monthlyPriceForClient(c, plans), 'Billing cycle (months)': c.billingCycleMonths || 1,
    'Next billing': formatDate(c.nextBillingDate), 'Employee accounts (requested)': c.employeeCount,
    'Employee accounts (live)': (c.org?.employees || []).length,
    GST: c.gstNumber, PAN: c.pan, 'Created': formatDate(c.createdAt),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Client Database & Subscription</h1>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Expiry control, locks, and account status in one place.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients…" className="pl-9 pr-3 py-2.5 rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 w-56" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2.5 text-sm outline-none">
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ExportButton filename="teamify-client-database" rows={exportRows} sheetName="Clients" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-sm text-ink-faint py-16 border border-dashed border-line dark:border-line-dark rounded-2xl">No clients match this view.</div>
        )}

        {filtered.map((c) => {
          const plan = planOf(c.planId);
          const isOpen = expanded === c.id;
          const overdue = c.status === 'active' && c.nextBillingDate && daysUntil(c.nextBillingDate) < 0;
          return (
            <div key={c.id} className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : c.id)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  {c.logo ? (
                    <img src={c.logo} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg brand-gradient flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {c.companyName?.[0] || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">{c.companyName}</p>
                    <p className="text-xs text-ink-soft dark:text-ink-soft-dark truncate">{c.clientName} · {c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {c.upgradeRequested && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-brand-purple dark:text-brand-coral">
                      <TrendingUp size={13} /> Upgrade requested
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[overdue ? 'locked' : c.status]}`}>
                    {overdue ? 'expired' : c.status}
                  </span>
                  <ChevronDown size={16} className={`text-ink-faint transition ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-line dark:border-line-dark pt-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="grid sm:grid-cols-5 gap-4 text-sm flex-1">
                      <Info label="Contact" value={c.contactInfo} />
                      <Info label="Employees (requested)" value={c.employeeCount} />
                      <Info label="Employee accounts (live)" value={(c.org?.employees || []).length} icon={Users} />
                      <Info label="Plan" value={plan ? `${plan.label} · ${formatINR(monthlyPriceForClient(c, plans))}/mo` : '—'} />
                      <NextBillingPicker client={c} setNextBillingDate={setNextBillingDate} />
                    </div>
                    <button onClick={() => setEditingClient(c)} className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-line dark:border-line-dark px-3 py-2 text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition shrink-0">
                      <Pencil size={13} /> Edit details
                    </button>
                  </div>

                  {c.billingCycleChangeRequest && (
                    <div className="rounded-xl bg-brand-purple/5 border border-brand-purple/20 p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-ink dark:text-ink-dark">
                        Client requested a <strong>{c.billingCycleChangeRequest.months}-month</strong> billing cycle on {formatDate(c.billingCycleChangeRequest.requestedAt)}.
                      </p>
                      <button
                        onClick={() => {
                          const months = c.billingCycleChangeRequest.months;
                          const prorated = prorateCycleChange(c, plans, months);
                          const msg = prorated > 0
                            ? `Apply ${months}-month cycle? A pro-rated amount of ${formatINR(prorated)} will be due from the client.`
                            : prorated < 0 ? `Apply ${months}-month cycle? A credit of ${formatINR(Math.abs(prorated))} will apply to their next invoice.` : `Apply ${months}-month billing cycle?`;
                          if (confirm(msg)) changeBillingCycle(c.id, months, prorated);
                        }}
                        className="text-xs font-medium rounded-lg border border-brand-purple/30 text-brand-purple dark:text-brand-coral px-2.5 py-1.5 hover:bg-brand-purple/10 transition"
                      >
                        Apply requested cycle
                      </button>
                    </div>
                  )}

                  {c.upgradeRequested && (
                    <div className="rounded-xl bg-brand-purple/5 border border-brand-purple/20 p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-ink dark:text-ink-dark">Client requested a plan upgrade based on their new employee count.</p>
                      <div className="flex gap-2">
                        {plans.filter((p) => p.id !== c.planId).map((p) => (
                          <button key={p.id} onClick={() => applyUpgrade(c.id, p.id)} className="text-xs font-medium rounded-lg border border-brand-purple/30 text-brand-purple dark:text-brand-coral px-2.5 py-1.5 hover:bg-brand-purple/10 transition">
                            Move to {p.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <DocumentsAndPayments client={c} onApprove={approvePaymentProof} />

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs text-ink-faint">Plan:</label>
                    <select
                      value={c.planId}
                      onChange={(e) => setClientPlan(c.id, e.target.value)}
                      className="rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-2.5 py-1.5 text-xs outline-none"
                    >
                      {plans.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>

                    <label className="text-xs text-ink-faint ml-2">Billing cycle:</label>
                    <BillingCycleSelect client={c} plans={plans} changeBillingCycle={changeBillingCycle} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {c.status === 'pending' && (
                      <ActionBtn onClick={() => activateClient(c.id, 1)} icon={CheckCircle2} label="Activate account" primary />
                    )}
                    {c.status !== 'pending' && (
                      <ActionBtn onClick={() => extendSubscription(c.id, 1)} icon={CalendarPlus} label="Extend +1 month" primary />
                    )}
                    {(c.status === 'active' || overdue) && (
                      <ActionBtn onClick={() => setClientStatus(c.id, 'paused')} icon={Pause} label="Pause service" />
                    )}
                    {c.status === 'paused' && (
                      <ActionBtn onClick={() => setClientStatus(c.id, 'active')} icon={Play} label="Resume service" />
                    )}
                    {c.status !== 'cancelled' && c.status !== 'pending' && c.status !== 'locked' && !overdue && (
                      <ActionBtn onClick={() => setClientStatus(c.id, 'locked')} icon={Lock} label="Lock now" />
                    )}
                    {(c.status === 'locked' || overdue) && (
                      <ActionBtn onClick={() => unlockClient(c.id)} icon={LockOpen} label="Unlock" primary />
                    )}
                    {c.status !== 'cancelled' && (
                      <ActionBtn onClick={() => { if (confirm(`Deactivate ${c.companyName}'s account? This cancels their subscription.`)) setClientStatus(c.id, 'cancelled'); }} icon={XCircle} label="Deactivate" danger />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSave={(patch, discount) => {
            updateClientDetails(editingClient.id, patch);
            setClientDiscount(editingClient.id, discount);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}

function BillingCycleSelect({ client, plans, changeBillingCycle }) {
  const current = client.billingCycleMonths || 1;
  const onChange = (e) => {
    const newMonths = Number(e.target.value);
    if (newMonths === current) return;
    const prorated = prorateCycleChange(client, plans, newMonths);
    const msg = prorated > 0
      ? `Moving to a ${newMonths}-month cycle. A pro-rated amount of ${formatINR(prorated)} will be due from the client. Continue?`
      : prorated < 0
      ? `Moving to a ${newMonths}-month cycle. A credit of ${formatINR(Math.abs(prorated))} will apply to their next invoice. Continue?`
      : `Move ${client.companyName} to a ${newMonths}-month billing cycle?`;
    if (confirm(msg)) changeBillingCycle(client.id, newMonths, prorated);
  };
  return (
    <select value={current} onChange={onChange} className="rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-2.5 py-1.5 text-xs outline-none">
      {BILLING_CYCLES.map((b) => <option key={b.months} value={b.months}>{b.label}</option>)}
    </select>
  );
}

function EditClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({ ...client });
  const [discountType, setDiscountType] = useState(client.discount?.type || 'none');
  const [discountValue, setDiscountValue] = useState(client.discount?.value || '');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    onSave(form, discountType === 'none' || !discountValue ? { type: 'none', value: 0 } : { type: discountType, value: Number(discountValue) });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl bg-surface dark:bg-surface-dark rounded-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line dark:border-line-dark">
          <h2 className="font-semibold text-ink dark:text-ink-dark">Edit {client.companyName}</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink dark:hover:text-ink-dark"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <ClientProfileFields values={form} onChange={set} />

          <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-4">
            <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-2.5 inline-flex items-center gap-1.5"><Repeat size={13} /> Discount</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none">
                <option value="none">No discount</option>
                <option value="percent">Percentage off</option>
                <option value="flat">Flat amount off</option>
              </select>
              {discountType !== 'none' && (
                <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === 'percent' ? 'e.g. 10 (%)' : 'e.g. 500 (₹)'} className="rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none" />
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NextBillingPicker({ client, setNextBillingDate }) {
  const value = client.nextBillingDate ? new Date(client.nextBillingDate).toISOString().slice(0, 10) : '';
  return (
    <div>
      <p className="text-xs text-ink-faint mb-0.5 inline-flex items-center gap-1"><CalendarClock size={12} /> Next billing</p>
      <input
        type="date"
        value={value}
        onChange={(e) => {
          if (!e.target.value) return;
          setNextBillingDate(client.id, new Date(e.target.value).toISOString());
        }}
        className="text-sm font-medium text-ink dark:text-ink-dark bg-transparent border-b border-dashed border-line dark:border-line-dark focus:border-brand-purple outline-none py-0.5"
      />
    </div>
  );
}

function DocumentsAndPayments({ client, onApprove }) {
  const proofs = [...(client.paymentProofs || [])].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const pending = proofs.filter((p) => !p.approved);
  const approved = proofs.filter((p) => p.approved);
  const companyDocs = client.companyDocuments || [];

  if (companyDocs.length === 0 && proofs.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-3.5">
        <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-2 inline-flex items-center gap-1.5"><FileText size={13} /> Company documents</p>
        {companyDocs.length === 0 ? (
          <p className="text-xs text-ink-faint">None uploaded yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {companyDocs.map((d) => (
              <a key={d.id} href={d.dataUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs bg-surface dark:bg-surface-dark rounded-full px-3 py-1.5 border border-line dark:border-line-dark hover:border-brand-purple/40">
                <FileText size={12} /> {d.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-3.5">
        <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-2 inline-flex items-center gap-1.5"><FileImage size={13} /> Payment history</p>
        {proofs.length === 0 ? (
          <p className="text-xs text-ink-faint">No payments submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 bg-surface dark:bg-surface-dark rounded-lg px-3 py-2">
                <a href={p.dataUrl} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1.5 text-ink dark:text-ink-dark hover:text-brand-purple min-w-0 truncate">
                  <Clock size={12} className="text-amber-500 shrink-0" /> {p.name} · {formatDate(p.submittedAt)} {p.amount ? `· ${formatINR(p.amount)}` : ''}
                </a>
                <button onClick={() => onApprove(client.id, p.id, 1)} className="text-[11px] font-medium rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 hover:bg-emerald-500/10 transition shrink-0">
                  Approve & extend
                </button>
              </div>
            ))}
            {approved.map((p) => (
              <a key={p.id} href={p.dataUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-ink-soft-dark hover:text-brand-purple px-1">
                <ShieldCheck size={12} className="text-emerald-500 shrink-0" /> {p.name} · verified {formatDate(p.approvedAt)} {p.amount ? `· ${formatINR(p.amount)}` : ''}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-xs text-ink-faint mb-0.5 inline-flex items-center gap-1">{Icon && <Icon size={12} />} {label}</p>
      <p className="text-ink dark:text-ink-dark font-medium">{value ?? '—'}</p>
    </div>
  );
}

function ActionBtn({ onClick, icon: Icon, label, primary, danger }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 transition ${
        primary ? 'brand-gradient text-white hover:opacity-90'
        : danger ? 'border border-brand-coral/30 text-brand-coral hover:bg-brand-coral/10'
        : 'border border-line dark:border-line-dark text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft'
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}
