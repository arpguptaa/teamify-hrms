import { useState, useRef } from 'react';
import { Plus, Send, Paperclip, X, FileText, Image as ImageIcon, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate, TICKET_STATUSES, MAX_ATTACHMENT_BYTES, ALLOWED_ATTACHMENT_TYPES } from '../../lib/constants';

const STATUS_STYLE = {
  open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  closed: 'bg-ink-faint/15 text-ink-faint',
};

export default function ClientHelpdesk() {
  const { currentClient } = useAuth();
  const { tickets, addTicket, addTicketMessage } = useData();
  const myTickets = tickets.filter((t) => t.clientId === currentClient.id);

  const [active, setActive] = useState(myTickets[0]?.id || null);
  const [newOpen, setNewOpen] = useState(myTickets.length === 0);
  const [newMessage, setNewMessage] = useState('');
  const [reply, setReply] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const activeTicket = myTickets.find((t) => t.id === active);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) { setError('Only PDF, JPG, JPEG or PNG files are allowed.'); return; }
    if (file.size > MAX_ATTACHMENT_BYTES) { setError('File must be under 10MB.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, type: file.type, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const raiseTicket = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const record = addTicket({
      clientId: currentClient.id, name: currentClient.clientName, email: currentClient.email,
      phone: currentClient.contactInfo, message: newMessage.trim(), attachment,
    });
    setNewMessage(''); setAttachment(null); setNewOpen(false);
    setActive(record.id);
  };

  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim() && !attachment) return;
    addTicketMessage(activeTicket.id, 'client', reply.trim(), attachment);
    setReply(''); setAttachment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Helpdesk / Ticketing</h1>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Raise a support ticket and chat directly with the Teamify team.</p>
        </div>
        <button onClick={() => { setNewOpen(true); setActive(null); }} className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 transition">
          <Plus size={15} /> Raise a ticket
        </button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4 rounded-2xl border border-line dark:border-line-dark overflow-hidden bg-surface dark:bg-surface-dark min-h-[60vh]">
        <div className="border-r border-line dark:border-line-dark divide-y divide-line dark:divide-line-dark max-h-[70vh] overflow-y-auto">
          {myTickets.length === 0 && !newOpen && (
            <p className="text-sm text-ink-faint text-center py-12 px-4">No tickets yet. Raise one to get help from the Teamify team.</p>
          )}
          {myTickets.map((t) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <button key={t.id} onClick={() => { setActive(t.id); setNewOpen(false); }} className={`w-full text-left px-4 py-3.5 transition ${active === t.id && !newOpen ? 'bg-brand-purple/5' : 'hover:bg-surface-soft dark:hover:bg-surface-dark-soft'}`}>
                <p className="text-xs text-ink-soft dark:text-ink-soft-dark truncate">{last?.text || '(attachment)'}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>{TICKET_STATUSES.find((s) => s.id === t.status)?.label}</span>
                  <span className="text-[11px] text-ink-faint">{formatDate(t.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-6 flex flex-col max-h-[70vh]">
          {newOpen ? (
            <form onSubmit={raiseTicket} className="space-y-3 max-w-lg">
              <div className="flex items-center gap-2 text-ink dark:text-ink-dark mb-2">
                <LifeBuoy size={18} /> <p className="font-medium">New ticket</p>
              </div>
              <textarea required rows={5} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Describe your issue…" className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 resize-none" />
              {attachment && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
                  <Paperclip size={12} /> {attachment.name}
                  <button type="button" onClick={() => setAttachment(null)}><X size={12} className="text-ink-faint hover:text-brand-coral" /></button>
                </span>
              )}
              {error && <p className="text-xs text-brand-coral">{error}</p>}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line dark:border-line-dark px-3 py-2 text-xs text-ink-soft dark:text-ink-soft-dark hover:border-brand-purple/50 hover:text-brand-purple transition">
                  <Paperclip size={13} /> Attach file (PDF/JPG/PNG, max 10MB)
                </button>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onFile} />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition">
                <Send size={15} /> Submit ticket
              </button>
            </form>
          ) : activeTicket ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-line dark:border-line-dark">
                <p className="text-sm font-medium text-ink dark:text-ink-dark">Ticket</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[activeTicket.status]}`}>{TICKET_STATUSES.find((s) => s.id === activeTicket.status)?.label}</span>
              </div>
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {activeTicket.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === 'client' ? 'brand-gradient text-white' : 'bg-surface-soft dark:bg-surface-dark-soft text-ink dark:text-ink-dark'}`}>
                      {m.text && <p className="leading-relaxed">{m.text}</p>}
                      {m.attachment && (
                        <a href={m.attachment.dataUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 mt-1.5 text-xs rounded-lg px-2.5 py-1.5 ${m.sender === 'client' ? 'bg-white/15' : 'bg-surface dark:bg-surface-dark'}`}>
                          {m.attachment.type === 'application/pdf' ? <FileText size={12} /> : <ImageIcon size={12} />} {m.attachment.name}
                        </a>
                      )}
                      <p className={`text-[10px] mt-1 ${m.sender === 'client' ? 'text-white/70' : 'text-ink-faint'}`}>{formatDate(m.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="pt-3 border-t border-line dark:border-line-dark space-y-2">
                {attachment && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
                    <Paperclip size={12} /> {attachment.name}
                    <button type="button" onClick={() => setAttachment(null)}><X size={12} className="text-ink-faint hover:text-brand-coral" /></button>
                  </span>
                )}
                {error && <p className="text-xs text-brand-coral">{error}</p>}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="shrink-0 h-10 w-10 rounded-xl border border-line dark:border-line-dark flex items-center justify-center text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition">
                    <Paperclip size={16} />
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onFile} />
                  <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" className="flex-1 rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40" />
                  <button type="submit" className="shrink-0 h-10 w-10 rounded-xl brand-gradient text-white flex items-center justify-center hover:opacity-90 transition">
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-sm text-ink-faint">Select a ticket, or raise a new one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
