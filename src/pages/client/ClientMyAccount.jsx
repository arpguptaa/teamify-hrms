import { useState, useRef } from 'react';
import { Sun, Moon, KeyRound, Save, Lock, Receipt, CalendarSync, IndianRupee, FileText, UploadCloud, X, Bell, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import PasswordField from '../../components/PasswordField';
import GoogleDriveCard from '../../components/GoogleDriveCard';
import PaymentQR from '../../components/PaymentQR';
import { isPasswordValid } from '../../lib/validation';
import { BILLING_CYCLES, formatDate, formatINR, monthlyPriceForClient, DEFAULT_NOTIFICATION_TEMPLATES } from '../../lib/constants';

export default function ClientMyAccount() {
  const { currentClient } = useAuth();
  const { theme, setTheme } = useTheme();
  const {
    updateClientPassword, setClientDrive, disconnectClientDrive, plans, requestBillingCycleChange,
    addPaymentProof, addCompanyDocument, removeCompanyDocument, updateNotificationTemplates,
  } = useData();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');
  const [cycleChoice, setCycleChoice] = useState(currentClient.billingCycleMonths || 1);
  const [showPay, setShowPay] = useState(false);
  const docRef = useRef(null);
  const [templates, setTemplates] = useState({ ...DEFAULT_NOTIFICATION_TEMPLATES, ...(currentClient.notificationTemplates || {}) });
  const [tplMsg, setTplMsg] = useState('');

  const plan = plans.find((p) => p.id === currentClient.planId);
  const amount = monthlyPriceForClient(currentClient, plans);

  const saveCredentials = (e) => {
    e.preventDefault();
    if (currentPw.trim() !== currentClient.password) { setMsg('error:Current password is incorrect.'); return; }
    if (!isPasswordValid(newPw)) { setMsg('error:New password must include an uppercase letter, lowercase letter, number, and special character.'); return; }
    updateClientPassword(currentClient.id, newPw.trim());
    setCurrentPw(''); setNewPw('');
    setMsg('ok:Password updated.');
    setTimeout(() => setMsg(''), 2200);
  };

  const submitCycleRequest = () => {
    requestBillingCycleChange(currentClient.id, cycleChoice);
  };

  const onDocFiles = (e) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => addCompanyDocument(currentClient.id, { name: file.name, dataUrl: reader.result });
      reader.readAsDataURL(file);
    });
  };

  const saveTemplates = () => {
    updateNotificationTemplates(currentClient.id, templates);
    setTplMsg('Saved — new celebration messages will be used from the next match.');
    setTimeout(() => setTplMsg(''), 2500);
  };

  const pendingProofs = (currentClient.paymentProofs || []).filter((p) => !p.approved);
  const approvedProofs = (currentClient.paymentProofs || []).filter((p) => p.approved);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">My Account</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Appearance, login details, billing and storage for {currentClient.companyName}.</p>
      </div>

      <section className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
        <h2 className="font-semibold text-ink dark:text-ink-dark mb-1">Appearance</h2>
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-4">Choose how your workspace looks on this device.</p>
        <div className="flex gap-3">
          <ThemeOption active={theme === 'light'} icon={Sun} label="Light" onClick={() => setTheme('light')} />
          <ThemeOption active={theme === 'dark'} icon={Moon} label="Dark" onClick={() => setTheme('dark')} />
        </div>
      </section>

      <section className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
        <h2 className="font-semibold text-ink dark:text-ink-dark mb-1 inline-flex items-center gap-2"><KeyRound size={16} /> Login details</h2>
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-4">Your user ID is permanent. You can update your password anytime.</p>

        <div className="mb-4">
          <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">User ID</label>
          <div className="relative">
            <input value={currentClient.userId} disabled className="w-full rounded-xl border border-line dark:border-line-dark bg-surface-soft dark:bg-surface-dark-soft px-4 py-3 text-sm text-ink-faint cursor-not-allowed" />
            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          </div>
        </div>

        <form onSubmit={saveCredentials} className="space-y-3">
          <PasswordField label="Current password" value={currentPw} onChange={setCurrentPw} showRules={false} required />
          <PasswordField label="New password" value={newPw} onChange={setNewPw} required />
          {msg && (
            <p className={`text-sm rounded-lg px-3 py-2 ${msg.startsWith('ok') ? 'text-brand-purple dark:text-brand-coral bg-brand-purple/10' : 'text-brand-coral bg-brand-coral/10'}`}>
              {msg.split(':')[1]}
            </p>
          )}
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition">
            <Save size={15} /> Update password
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
        <h2 className="font-semibold text-ink dark:text-ink-dark mb-1 inline-flex items-center gap-2"><Receipt size={16} /> Billing</h2>
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-4">Your current plan and billing cycle.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-ink-faint mb-0.5">Plan</p>
            <p className="text-sm font-medium text-ink dark:text-ink-dark">{plan?.label || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-0.5">Amount</p>
            <p className="text-sm font-medium text-ink dark:text-ink-dark">{formatINR(amount)}/mo</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-0.5">Next billing date</p>
            <p className="text-sm font-medium text-ink dark:text-ink-dark">{formatDate(currentClient.nextBillingDate)}</p>
          </div>
        </div>

        <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-4 mb-4">
          <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-2.5 inline-flex items-center gap-1.5"><CalendarSync size={13} /> Change billing cycle</p>
          {currentClient.billingCycleChangeRequest ? (
            <p className="text-sm text-brand-purple dark:text-brand-coral">
              Request for a {currentClient.billingCycleChangeRequest.months}-month cycle sent — awaiting Teamify's confirmation.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <select value={cycleChoice} onChange={(e) => setCycleChoice(Number(e.target.value))} className="rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none">
                {BILLING_CYCLES.map((b) => <option key={b.months} value={b.months}>{b.label}</option>)}
              </select>
              <button
                onClick={submitCycleRequest}
                disabled={cycleChoice === (currentClient.billingCycleMonths || 1)}
                className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Request change
              </button>
            </div>
          )}
          <p className="text-[11px] text-ink-faint mt-2.5">
            Moving cycles is pro-rated for the days difference, and Teamify will confirm the exact amount before applying it.
          </p>
        </div>

        <div className="rounded-xl bg-surface-soft dark:bg-surface-dark-soft p-4">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark inline-flex items-center gap-1.5"><IndianRupee size={13} /> Make a payment</p>
            {!showPay && <button onClick={() => setShowPay(true)} className="text-xs font-medium text-brand-purple dark:text-brand-coral hover:underline">Pay now</button>}
          </div>
          <p className="text-[11px] text-ink-faint mb-3">
            Scan the QR, pay {formatINR(amount)}, and upload proof. Your subscription only extends once Teamify verifies the payment from the master console.
          </p>
          {showPay && (
            <PaymentQR
              amount={amount}
              note={`For ${plan?.label || 'your plan'} — 1 month`}
              onSubmitProof={(proof) => addPaymentProof(currentClient.id, { ...proof, type: 'recurring', amount })}
            />
          )}
          {pendingProofs.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {pendingProofs.map((p) => (
                <p key={p.id} className="text-xs text-amber-600 dark:text-amber-400 inline-flex items-center gap-1.5">
                  <Clock size={12} /> Payment from {formatDate(p.submittedAt)} awaiting verification.
                </p>
              ))}
            </div>
          )}
          {approvedProofs.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[11px] font-medium text-ink-faint">Payment history</p>
              {approvedProofs.map((p) => (
                <p key={p.id} className="text-xs text-ink-soft dark:text-ink-soft-dark inline-flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Verified {formatDate(p.approvedAt)} {p.amount ? `· ${formatINR(p.amount)}` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
        <h2 className="font-semibold text-ink dark:text-ink-dark mb-1 inline-flex items-center gap-2"><FileText size={16} /> Company documents</h2>
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-4">Certificate of incorporation, agreements or any records Teamify should keep on file.</p>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <button type="button" onClick={() => docRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line dark:border-line-dark px-4 py-2.5 text-sm text-ink-soft dark:text-ink-soft-dark hover:border-brand-purple/50 hover:text-brand-purple transition">
            <UploadCloud size={15} /> Upload document
          </button>
          <input ref={docRef} type="file" multiple className="hidden" onChange={onDocFiles} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(currentClient.companyDocuments || []).map((d) => (
            <span key={d.id} className="inline-flex items-center gap-1.5 text-xs bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
              <FileText size={12} /> {d.name}
              <button type="button" onClick={() => removeCompanyDocument(currentClient.id, d.id)} className="text-ink-faint hover:text-brand-coral"><X size={12} /></button>
            </span>
          ))}
          {(currentClient.companyDocuments || []).length === 0 && <p className="text-xs text-ink-faint">No documents uploaded yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
        <h2 className="font-semibold text-ink dark:text-ink-dark mb-1 inline-flex items-center gap-2"><Bell size={16} /> Celebration messages</h2>
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-4">
          Edit the birthday, work-anniversary and marriage-anniversary notifications sent to your team. Use <code className="font-mono">{'{name}'}</code>, <code className="font-mono">{'{years}'}</code> and <code className="font-mono">{'{company}'}</code>.
        </p>
        <div className="space-y-3">
          <TemplateField label="🎉 Birthday" value={templates.birthday} onChange={(v) => setTemplates((t) => ({ ...t, birthday: v }))} />
          <TemplateField label="🎊 Work anniversary" value={templates.workAnniversary} onChange={(v) => setTemplates((t) => ({ ...t, workAnniversary: v }))} />
          <TemplateField label="💐 Marriage anniversary" value={templates.marriageAnniversary} onChange={(v) => setTemplates((t) => ({ ...t, marriageAnniversary: v }))} />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={saveTemplates} className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 transition">
            <Save size={14} /> Save messages
          </button>
          {tplMsg && <p className="text-xs text-brand-purple dark:text-brand-coral">{tplMsg}</p>}
        </div>
      </section>

      <GoogleDriveCard
        config={currentClient.driveConfig}
        onConnect={(folder) => setClientDrive(currentClient.id, folder)}
        onDisconnect={() => disconnectClientDrive(currentClient.id)}
        description="Choose the Drive folder where your organisation's HR data will be kept in sync. You can change this later."
      />
    </div>
  );
}

function ThemeOption({ active, icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-2 rounded-xl border py-5 transition ${active ? 'border-brand-purple bg-brand-purple/5' : 'border-line dark:border-line-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft'}`}>
      <Icon size={20} className={active ? 'text-brand-purple dark:text-brand-coral' : 'text-ink-soft dark:text-ink-soft-dark'} />
      <span className={`text-sm font-medium ${active ? 'text-brand-purple dark:text-brand-coral' : 'text-ink-soft dark:text-ink-soft-dark'}`}>{label}</span>
    </button>
  );
}

function TemplateField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 resize-none"
      />
    </div>
  );
}
