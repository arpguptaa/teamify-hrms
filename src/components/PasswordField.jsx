import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { passwordRules } from '../lib/validation';

export default function PasswordField({ label, value, onChange, showRules = true, ...props }) {
  const [show, setShow] = useState(false);
  const rules = passwordRules(value);
  const touched = value.length > 0;

  return (
    <div>
      {label && <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
          {...props}
        />
        <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showRules && touched && (
        <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
          {rules.map((r) => (
            <li key={r.id} className={`text-[11px] flex items-center gap-1.5 ${r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-faint'}`}>
              {r.ok ? <Check size={12} /> : <X size={12} />} {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
