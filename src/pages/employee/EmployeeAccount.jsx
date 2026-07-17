import { useState } from 'react';
import { Sun, Moon, KeyRound, Save, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import PasswordField from '../../components/PasswordField';
import { isPasswordValid } from '../../lib/validation';

export default function EmployeeAccount() {
  const { currentClient, currentEmployee: me } = useAuth();
  const { theme, setTheme } = useTheme();
  const { changeOwnEmployeePassword } = useData();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (currentPw.trim() !== me.password) { setMsg('error:Current password is incorrect.'); return; }
    if (!isPasswordValid(newPw)) { setMsg('error:New password must include an uppercase letter, lowercase letter, number, and special character.'); return; }
    changeOwnEmployeePassword(currentClient.id, me.id, newPw.trim());
    setCurrentPw(''); setNewPw('');
    setMsg('ok:Password updated.');
    setTimeout(() => setMsg(''), 2200);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">My Account</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Appearance and login details.</p>
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
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-4">
          Your Employee ID is permanent. Your password defaulted to your PAN — set a new one below.
        </p>

        <div className="mb-4">
          <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Employee ID</label>
          <div className="relative">
            <input value={me.employeeId} disabled className="w-full rounded-xl border border-line dark:border-line-dark bg-surface-soft dark:bg-surface-dark-soft px-4 py-3 text-sm text-ink-faint cursor-not-allowed font-mono" />
            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
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
