import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Sparkles, Network, ShieldCheck, Wallet, CalendarDays } from 'lucide-react';
import Logo from '../components/Logo';
import ChatWidget from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Network, label: 'Live org charts & reporting lines' },
  { icon: Wallet, label: 'Payroll, expenses & compliance' },
  { icon: CalendarDays, label: 'Attendance, leave & celebrations' },
  { icon: ShieldCheck, label: 'Role-based access, built in' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(userId.trim(), password);
    if (!res.ok) { setError(res.error); return; }
    navigate(res.role === 'master' ? '/master/dashboard' : res.role === 'client' ? '/client/dashboard' : '/employee/home');
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden brand-gradient">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)',
        }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

        <div className="relative z-10 flex flex-col justify-between p-14 text-white w-full">
          <div className="flex items-center gap-3">
            <img src="/teamify-logo.png" alt="Teamify" className="h-11 w-11 rounded-xl bg-white/10 p-0.5 ring-1 ring-white/20" />
            <span className="text-xl font-bold tracking-tight">TEAMIFY</span>
          </div>

          <div className="max-w-md">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/70 mb-4">
              <Sparkles size={14} /> One login, every team
            </p>
            <h1 className="text-4xl font-semibold leading-tight mb-4">
              HR, subscriptions, and your whole team — in one place.
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-8">
              Whether you run Teamify, manage HR for your organisation, or you're part
              of a team using it day to day — sign in here with your ID to get to
              your workspace.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur-sm px-3.5 py-3 ring-1 ring-white/15">
                  <f.icon size={16} className="shrink-0 text-white/90" />
                  <span className="text-xs text-white/90 leading-snug">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/60 text-xs">© {new Date().getFullYear()} Teamify. Connect &amp; Empower.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          <h2 className="text-2xl font-semibold text-ink dark:text-ink-dark">Welcome back</h2>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1 mb-8">
            Sign in with your owner, employee, or client user ID.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">User ID / Employee ID</label>
              <input
                autoFocus
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. ORBIT01 or your user ID"
                className="w-full rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 transition"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-brand-coral bg-brand-coral/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl brand-gradient text-white font-medium py-3 hover:opacity-90 active:scale-[0.99] transition shadow-lg shadow-brand-purple/20">
              Login <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-[11px] text-ink-faint mt-3 text-center">
            Employees: your login is the Employee ID given by HR (e.g. ORBIT01). First-time password is your PAN number.
          </p>

          <div className="mt-8 pt-6 border-t border-line dark:border-line-dark text-center">
            <p className="text-sm text-ink-soft dark:text-ink-soft-dark mb-3">New to Teamify?</p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-brand-purple/30 text-brand-purple dark:text-brand-coral font-medium py-3 text-sm hover:bg-brand-purple/5 transition"
            >
              Create your HRMS account with us
            </Link>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
