import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle2, Info } from 'lucide-react';
import Logo from '../components/Logo';
import PasswordField from '../components/PasswordField';
import PaymentQR from '../components/PaymentQR';
import { useData } from '../context/DataContext';
import { DEFAULT_PLANS, formatINR, planPriceWithDiscount } from '../lib/constants';
import { isPasswordValid } from '../lib/validation';

const empty = { companyName: '', clientName: '', contactInfo: '', email: '', userId: '', password: '', employeeCount: '' };

export default function PublicSignup() {
  const { addSignupRequest, plans } = useData();
  const fileRef = useRef(null);
  const [step, setStep] = useState('details'); // details -> payment -> done
  const [form, setForm] = useState(empty);
  const [logo, setLogo] = useState('');
  const [pwError, setPwError] = useState('');
  const planList = plans?.length ? plans : DEFAULT_PLANS;

  const selectedPlan = (() => {
    const count = Number(form.employeeCount);
    if (!count) return null;
    return planList.find((p) => count >= p.min && count <= p.max) || planList[planList.length - 1];
  })();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const goToPayment = (e) => {
    e.preventDefault();
    if (!isPasswordValid(form.password)) {
      setPwError('Password must include an uppercase letter, a lowercase letter, a number, and a special character.');
      return;
    }
    setPwError('');
    setStep('payment');
  };

  const finish = (proof) => {
    addSignupRequest({ ...form, logo, paymentProof: proof, amountPaid: selectedPlan ? planPriceWithDiscount(selectedPlan) : 0 });
    setStep('done');
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 rounded-full brand-gradient flex items-center justify-center mb-6">
            <CheckCircle2 className="text-white" size={30} />
          </div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark mb-2">Request received</h1>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mb-8">
            Your details and payment proof have been sent to the Teamify team. Once verified and
            activated, you'll be able to log in with the user ID and password you set here.
          </p>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl brand-gradient text-white font-medium py-3 px-8 hover:opacity-90 transition">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-ink-soft dark:text-ink-soft-dark hover:text-ink dark:hover:text-ink-dark mb-8">
          <ArrowLeft size={15} /> Back to login
        </Link>

        <div className="mb-8">
          <Logo size="md" />
        </div>

        <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark mb-1">Set up your HRMS account</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark mb-4">
          Tell us about your company. We'll review and activate your workspace shortly.
        </p>
        <div className="flex items-start gap-2 rounded-xl bg-brand-purple/5 border border-brand-purple/20 px-4 py-3 mb-8">
          <Info size={15} className="text-brand-purple dark:text-brand-coral shrink-0 mt-0.5" />
          <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
            This signup is only for business owners, founders, or authorized representatives setting up
            an HRMS workspace for their organisation — not for individual employees. Employees get access
            once their organisation's account is active.
          </p>
        </div>

        {step === 'details' && (
          <form onSubmit={goToPayment} className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company name" value={form.companyName} onChange={set('companyName')} placeholder="Acme Pvt. Ltd." required />
              <Field label="Your full name" value={form.clientName} onChange={set('clientName')} placeholder="Your full name" required />
              <Field label="Contact info" value={form.contactInfo} onChange={set('contactInfo')} placeholder="+91 98765 43210" required />
              <Field label="Email ID" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Upload your company logo</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-line dark:border-line-dark px-4 py-3 text-sm text-ink-soft dark:text-ink-soft-dark hover:border-brand-purple/50 hover:text-brand-purple transition"
                >
                  <UploadCloud size={16} /> PNG, JPG or JPEG
                </button>
                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={onLogoChange} />
                {logo && <img src={logo} alt="logo preview" className="h-12 w-12 rounded-lg object-cover border border-line dark:border-line-dark" />}
              </div>
              <p className="text-xs text-ink-faint mt-1.5">This appears on your home page once your account is active.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Field label="Create user ID" value={form.userId} onChange={set('userId')} placeholder="e.g. acmehr" required />
                <p className="text-[11px] text-ink-faint mt-1.5">Choose carefully — this can't be changed later.</p>
              </div>
              <PasswordField label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Choose a password" required />
            </div>
            {pwError && <p className="text-sm text-brand-coral bg-brand-coral/10 rounded-lg px-3 py-2">{pwError}</p>}

            <div>
              <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Number of employee accounts needed</label>
              <input
                type="number"
                min="1"
                value={form.employeeCount}
                onChange={set('employeeCount')}
                placeholder="e.g. 45"
                required
                className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
              />
            </div>

            <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-4">
              <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-2.5">Subscription plan</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {planList.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-lg px-3 py-2.5 text-sm border transition ${
                      selectedPlan?.id === p.id
                        ? 'border-brand-purple bg-brand-purple/5 text-ink dark:text-ink-dark'
                        : 'border-line dark:border-line-dark text-ink-soft dark:text-ink-soft-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{p.label}</span>
                      <span className="font-semibold">
                        {p.discountType && p.discountType !== 'none' && p.discountValue ? (
                          <>
                            <span className="line-through text-ink-faint mr-1.5">{formatINR(p.price)}</span>
                            {formatINR(planPriceWithDiscount(p))}/mo
                          </>
                        ) : `${formatINR(p.price)}/mo`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {selectedPlan && (
                <p className="text-xs text-brand-purple dark:text-brand-coral mt-3">
                  Based on {form.employeeCount} employees, you'll be on the <strong>{selectedPlan.label}</strong> plan at {formatINR(planPriceWithDiscount(selectedPlan))}/month.
                </p>
              )}
            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl brand-gradient text-white font-medium py-3.5 hover:opacity-90 active:scale-[0.99] transition">
              Continue to payment
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <button onClick={() => setStep('details')} className="text-xs text-ink-faint hover:text-ink-soft dark:hover:text-ink-soft-dark inline-flex items-center gap-1">
              <ArrowLeft size={12} /> Back to details
            </button>
            <PaymentQR
              amount={selectedPlan ? planPriceWithDiscount(selectedPlan) : 0}
              note="First month's subscription — pay via UPI and upload your payment screenshot."
              onSubmitProof={finish}
              submitLabel="Submit for activation"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
      />
    </div>
  );
}
