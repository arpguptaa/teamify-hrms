import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDate } from '../lib/constants';

export default function NotificationBell({ items = [], onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = items.filter((i) => !i.read).length;

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-full flex items-center justify-center text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-coral" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line dark:border-line-dark">
            <p className="text-sm font-semibold text-ink dark:text-ink-dark">Notifications</p>
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-xs text-brand-purple dark:text-brand-coral inline-flex items-center gap-1 hover:underline">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-ink-faint text-center py-10">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-line dark:divide-line-dark">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    {!item.read && <span className="h-1.5 w-1.5 rounded-full brand-gradient mt-1.5 shrink-0" />}
                    <div className={item.read ? 'pl-3.5' : ''}>
                      <p className="text-sm text-ink dark:text-ink-dark leading-snug">{item.message}</p>
                      <p className="text-[11px] text-ink-faint mt-0.5">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
