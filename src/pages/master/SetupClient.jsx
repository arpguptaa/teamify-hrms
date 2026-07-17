import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, UserPlus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isPasswordValid } from '../../lib/validation';
import PasswordField from '../../components/PasswordField';
import ClientProfileFields from '../../components/ClientProfileFields';
import { formatINR } from '../../lib/constants';

const empty = {
  companyName: '', legalEntityName: '', registrationNumber: '', industry: '', website: '',
  clientName: '', contactDesignation: '', contactInfo: '', email: '', department: '', reportingAuthority: '',
  registeredAddress: '', operationalAddress: '',
  gstNumber: '', pan: '', cin: '', billingAddress: '', paymentMethodPref: 'UPI',
  employeeCount: '', fiscalYearStart: 'April', payrollFrequency: 'Monthly', workingDaysPattern: 'Mon–Fri', holidayCalendarNote: '',
  userId: '', password: '',
};

export default function SetupClient() {
  const { addSignupRequest, activateClient, plans } = useData();
  const fileRef = useRef(null);
  const [form, setForm] = useState(empty);
  const [logo, setLogo] = useState('');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectedPlan = (() => {
    const count = Number(form.employeeCount);
    if (!count) return null;
    return plans.find((p) => count >= p.min && count <= p.max) || plans[plans.length - 1];
  })();

  const effectivePrice = (() => {
    if (!selectedPlan) return 0;
    if (discountType === 'percent' && discountValue) return Math.max(0, Math.round(selectedPlan.price * (1 - Number(discountValue) / 100)));
    if (discountType === 'flat' && discountValue) return Math.max(0, selectedPlan.price - Number(discountValue));
    return selectedPlan.price;
  })();

  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!isPasswordValid(form.password)) {
      setError('Password must include an uppercase letter, lowercase letter, number, and special character.');
      return;
    }
    const record = addSignupRequest({
      ...form,
      logo,
      discount: discountType === 'none' || !discountValue ? { type: 'none', value: 0 } : { type: discountType, value: Number(discountValue) },
    });
    activateClient(record.id, 1);
    setDone(true);
    setForm(empty);
    setLogo('');
    setDiscountType('none');
    setDiscountValue('');
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Setup Client Account</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Create and activate a new client workspace directly.</p>
      </div>

      {done && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-purple/10 text-brand-purple dark:text-brand-coral text-sm font-medium px-4 py-3">
          <CheckCircle2 size={16} /> Client account created and activated.
        </div>
      )}

      <form onSubmit={submit} className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-2xl p-6 sm:p-8 space-y-6">
        <ClientProfileFields values={form} onChange={set} />

        <div>
          <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Upload company logo</label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line dark:border-line-dark px-4 py-3 text-sm text-ink-soft dark:text-ink-soft-dark hover:border-brand-purple/50 hover:text-brand-purple transition">
              <UploadCloud size={16} /> PNG, JPG or JPEG
            </button>
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={onLogoChange} />
            {logo && <img src={logo} alt="preview" className="h-12 w-12 rounded-lg object-cover border border-line dark:border-line-dark" />}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Create user ID</label>
            <input value={form.userId} onChange={(e) => set('userId', e.target.value)} placeholder="e.g. acmehr" required className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40" />
            <p className="text-[11px] text-ink-faint mt-1">Choose carefully — this can't be changed later.</p>
          </div>
          <PasswordField label="Password" value={form.password} onChange={(v) => set('password', v)} placeholder="Set a password" required />
        </div>
        {error && <p className="text-sm text-brand-coral bg-brand-coral/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-4">
          <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-2.5">Subscription plan</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {plans.map((p) => (
              <div key={p.id} className={`rounded-lg px-3 py-2.5 text-sm border transition ${selectedPlan?.id === p.id ? 'border-brand-purple bg-brand-purple/5' : 'border-line dark:border-line-dark text-ink-soft dark:text-ink-soft-dark'}`}>
                <div className="flex items-center justify-between">
                  <span>{p.label}</span>
                  <span className="font-semibold">{formatINR(p.price)}/mo</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-line dark:border-line-dark">
            <div>
              <label className="text-[11px] text-ink-faint block mb-1">Discount</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none">
                <option value="none">No discount</option>
                <option value="percent">Percentage off</option>
                <option value="flat">Flat amount off</option>
              </select>
            </div>
            {discountType !== 'none' && (
              <div>
                <label className="text-[11px] text-ink-faint block mb-1">{discountType === 'percent' ? 'Percent (%)' : 'Amount (₹)'}</label>
                <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none" />
              </div>
            )}
            {selectedPlan && (
              <div className="sm:col-span-1">
                <label className="text-[11px] text-ink-faint block mb-1">Effective price / month</label>
                <p className="text-sm font-semibold text-ink dark:text-ink-dark py-2">{formatINR(effectivePrice)}</p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl brand-gradient text-white font-medium py-3.5 hover:opacity-90 active:scale-[0.99] transition">
          <UserPlus size={17} /> Create & activate account
        </button>
      </form>
    </div>
  );
}
