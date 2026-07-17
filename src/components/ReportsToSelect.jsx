import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Building2 } from 'lucide-react';

export default function ReportsToSelect({ employees, value, onChange, excludeId }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const options = useMemo(
    () => employees.filter((e) => e.id !== excludeId),
    [employees, excludeId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((e) => `${e.name} ${e.designation || ''} ${e.employeeId || ''}`.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((e) => e.id === value);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pick = (id) => { onChange(id); setOpen(false); setQuery(''); };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 text-left"
      >
        <span className={`truncate ${selected ? 'text-ink dark:text-ink-dark' : 'text-ink-faint'}`}>
          {selected ? `${selected.name}${selected.designation ? ` — ${selected.designation}` : ''}` : 'Top of the organisation'}
        </span>
        <ChevronDown size={15} className={`shrink-0 text-ink-faint transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark shadow-xl overflow-hidden">
          <div className="p-2 border-b border-line dark:border-line-dark">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, designation or ID…"
                className="w-full pl-8 pr-2 py-2 rounded-lg bg-surface-soft dark:bg-surface-dark-soft text-xs outline-none"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => pick('')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition"
            >
              <Building2 size={14} className="text-ink-faint shrink-0" />
              <span className="flex-1 text-ink dark:text-ink-dark">Top of the organisation</span>
              {!value && <Check size={14} className="text-brand-purple dark:text-brand-coral" />}
            </button>
            {filtered.length === 0 && <p className="text-xs text-ink-faint text-center py-4">No matches.</p>}
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => pick(e.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition"
              >
                <span className="h-6 w-6 rounded-full brand-gradient shrink-0 flex items-center justify-center text-[10px] text-white font-semibold overflow-hidden">
                  {e.photo ? <img src={e.photo} alt="" className="h-full w-full object-cover" /> : e.name?.[0]?.toUpperCase()}
                </span>
                <span className="flex-1 min-w-0 truncate text-ink dark:text-ink-dark">
                  {e.name}{e.designation ? <span className="text-ink-faint"> — {e.designation}</span> : ''}
                </span>
                {value === e.id && <Check size={14} className="text-brand-purple dark:text-brand-coral shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
