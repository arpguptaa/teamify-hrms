import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DEFAULT_PLANS, formatINR, planPriceWithDiscount } from '../../lib/constants';
import ExportButton from '../../components/ExportButton';

export default function PlanManagement() {
  const { plans, updatePlans, clients } = useData();
  const [draft, setDraft] = useState(plans);
  const [savedFlash, setSavedFlash] = useState(false);

  const updateField = (id, field, value) => {
    setDraft((prev) => prev.map((p) => p.id === id ? { ...p, [field]: field === 'discountType' ? value : Number(value) } : p));
  };

  const save = () => {
    updatePlans(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const reset = () => setDraft(DEFAULT_PLANS);

  const clientsOnPlan = (id) => clients.filter((c) => c.planId === id && c.status !== 'cancelled').length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Plan Management</h1>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Pricing, packaging and default discounts by employee-count slab.</p>
        </div>
        {savedFlash && <span className="text-xs font-medium text-brand-purple dark:text-brand-coral">Saved ✓</span>}
        <ExportButton filename="teamify-plans" rows={draft.map((p) => ({ Plan: p.label, Min: p.min, Max: p.max, 'Price (₹/mo)': p.price, Discount: p.discountType === 'none' ? '—' : `${p.discountValue}${p.discountType === 'percent' ? '%' : ' ₹ flat'}`, 'Effective price (₹/mo)': planPriceWithDiscount(p), 'Clients on plan': clientsOnPlan(p.id) }))} sheetName="Plans" />
      </div>

      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark divide-y divide-line dark:divide-line-dark">
        {draft.map((p) => (
          <div key={p.id} className="p-5 space-y-4">
            <div className="grid sm:grid-cols-[1fr_auto_auto_auto] items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-ink-dark">{p.label}</p>
                <p className="text-xs text-ink-faint">{clientsOnPlan(p.id)} client{clientsOnPlan(p.id) === 1 ? '' : 's'} on this plan</p>
              </div>
              <SlabInput label="Min" value={p.min} onChange={(v) => updateField(p.id, 'min', v)} />
              <SlabInput label="Max" value={p.max} onChange={(v) => updateField(p.id, 'max', v)} />
              <div>
                <label className="text-[11px] text-ink-faint block mb-1">Price / month</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">₹</span>
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => updateField(p.id, 'price', e.target.value)}
                    className="w-28 rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft pl-6 pr-2 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-soft dark:bg-surface-dark-soft px-4 py-3">
              <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark">Default discount for this plan:</label>
              <select
                value={p.discountType || 'none'}
                onChange={(e) => updateField(p.id, 'discountType', e.target.value)}
                className="rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-2.5 py-1.5 text-xs outline-none"
              >
                <option value="none">No discount</option>
                <option value="percent">Percentage off</option>
                <option value="flat">Flat amount off</option>
              </select>
              {p.discountType && p.discountType !== 'none' && (
                <>
                  <input
                    type="number"
                    min="0"
                    value={p.discountValue || ''}
                    onChange={(e) => updateField(p.id, 'discountValue', e.target.value)}
                    placeholder={p.discountType === 'percent' ? 'e.g. 10' : 'e.g. 500'}
                    className="w-24 rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-2.5 py-1.5 text-xs outline-none"
                  />
                  <span className="text-xs text-ink-faint">
                    → effective {formatINR(planPriceWithDiscount(p))}/mo
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={save} className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition">
          <Save size={15} /> Save changes
        </button>
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-line dark:border-line-dark text-sm font-medium px-5 py-2.5 text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition">
          <RotateCcw size={15} /> Reset to defaults
        </button>
      </div>

      <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-4 text-xs text-ink-soft dark:text-ink-soft-dark">
        Preview: {draft.map((p) => `${p.label} — ${formatINR(planPriceWithDiscount(p))}/mo`).join('  ·  ')}
      </div>
      <p className="text-xs text-ink-faint">
        A client's own discount (set from Client Database & Subscription → Edit details) overrides this plan-level default for that client only.
      </p>
    </div>
  );
}

function SlabInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] text-ink-faint block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
      />
    </div>
  );
}

