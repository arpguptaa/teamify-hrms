import { useState } from 'react';
import { MessageCircle, X, Send, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function ChatWidget() {
  const { addTicket } = useData();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    addTicket({ clientId: null, ...form });
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => { setSent(false); setOpen(false); }, 1800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="brand-gradient px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Chat with Teamify</p>
              <p className="text-white/80 text-xs">We usually reply within a day</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            {sent ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="text-brand-purple" size={32} />
                <p className="text-sm font-medium">Message sent</p>
                <p className="text-xs text-ink-soft dark:text-ink-soft-dark">We'll reach out on your email or number if we're not online.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-2.5">
                <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
                  Not live right now? Drop your email or number and we'll get back to you.
                </p>
                <input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                  />
                  <input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                  />
                </div>
                <textarea
                  required
                  placeholder="How can we help?"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 resize-none"
                />
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg brand-gradient text-white text-sm font-medium py-2.5 hover:opacity-90 transition">
                  Send message <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-13 w-13 h-14 w-14 rounded-full brand-gradient text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition"
        aria-label="Chat with us"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
