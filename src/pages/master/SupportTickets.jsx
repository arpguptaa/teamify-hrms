import { useState, useRef } from 'react';
import { Mail, Phone, Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate, TICKET_STATUSES, MAX_ATTACHMENT_BYTES, ALLOWED_ATTACHMENT_TYPES } from '../../lib/constants';
import ExportButton from '../../components/ExportButton';

const STATUS_STYLE = {
  open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  closed: 'bg-ink-faint/15 text-ink-faint',
};

export default function SupportTickets() {
  const { tickets, clients, markTicketRead, addTicketMessage, setTicketStatus } = useData();
  const [active, setActive] = useState(tickets[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reply, setReply] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachError, setAttachError] = useState('');
  const fileRef = useRef(null);

  const clientName = (id) => clients.find((c) => c.id === id)?.companyName;
  const filteredTickets = tickets.filter((t) => statusFilter === 'all' || t.status === statusFilter);
  const activeTicket = tickets.find((t) => t.id === active);

  const open = (t) => {
    setActive(t.id);
    if (!t.read) markTicketRead(t.id);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) { setAttachError('Only PDF, JPG, JPEG or PNG files are allowed.'); return; }
    if (file.size > MAX_ATTACHMENT_BYTES) { setAttachError('File must be under 10MB.'); return; }
    setAttachError('');
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, type: file.type, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim() && !attachment) return;
    addTicketMessage(activeTicket.id, 'master', reply.trim(), attachment);
    setReply('');
    setAttachment(null);
  };

  const exportRows = tickets.map((t) => ({
    Name: t.name, Company: clientName(t.clientId) || 'Website visitor', Email: t.email, Phone: t.phone,
    Status: TICKET_STATUSES.find((s) => s.id === t.status)?.label || t.status, Messages: t.messages.length, Created: formatDate(t.createdAt),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Support Tickets</h1>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Messages from the login-page chat and client helpdesk.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-2.5 text-sm outline-none">
            <option value="all">All status</option>
            {TICKET_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <ExportButton filename="teamify-support-tickets" rows={exportRows} sheetName="Tickets" />
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center text-sm text-ink-faint py-20 border border-dashed border-line dark:border-line-dark rounded-2xl">
          No messages yet.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4 rounded-2xl border border-line dark:border-line-dark overflow-hidden bg-surface dark:bg-surface-dark">
          <div className="border-r border-line dark:border-line-dark divide-y divide-line dark:divide-line-dark max-h-[75vh] overflow-y-auto">
            {filteredTickets.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <button key={t.id} onClick={() => open(t)} className={`w-full text-left px-4 py-3.5 transition ${active === t.id ? 'bg-brand-purple/5' : 'hover:bg-surface-soft dark:hover:bg-surface-dark-soft'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">{t.name || t.email || 'Guest'}</p>
                    {!t.read && <span className="h-2 w-2 rounded-full brand-gradient shrink-0" />}
                  </div>
                  <p className="text-xs text-ink-faint truncate">{clientName(t.clientId) || 'Website visitor'}</p>
                  <p className="text-xs text-ink-soft dark:text-ink-soft-dark truncate mt-1">{last?.text || '(attachment)'}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>{TICKET_STATUSES.find((s) => s.id === t.status)?.label}</span>
                    <span className="text-[11px] text-ink-faint">{formatDate(t.createdAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-6 flex flex-col max-h-[75vh]">
            {activeTicket ? (
              <>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-line dark:border-line-dark">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full brand-gradient flex items-center justify-center text-white font-semibold">
                      {(activeTicket.name || 'G')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-ink dark:text-ink-dark">{activeTicket.name || 'Guest'}</p>
                      <p className="text-xs text-ink-faint">{clientName(activeTicket.clientId) || 'Website visitor'} · {formatDate(activeTicket.createdAt)}</p>
                      <div className="flex flex-wrap gap-3 text-xs mt-1.5">
                        {activeTicket.email && <span className="inline-flex items-center gap-1.5 text-ink-soft dark:text-ink-soft-dark"><Mail size={12} /> {activeTicket.email}</span>}
                        {activeTicket.phone && <span className="inline-flex items-center gap-1.5 text-ink-soft dark:text-ink-soft-dark"><Phone size={12} /> {activeTicket.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <select value={activeTicket.status} onChange={(e) => setTicketStatus(activeTicket.id, e.target.value)} className="rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-2.5 py-1.5 text-xs outline-none shrink-0">
                    {TICKET_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {activeTicket.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'master' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === 'master' ? 'brand-gradient text-white' : 'bg-surface-soft dark:bg-surface-dark-soft text-ink dark:text-ink-dark'}`}>
                        {m.text && <p className="leading-relaxed">{m.text}</p>}
                        {m.attachment && (
                          <a href={m.attachment.dataUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 mt-1.5 text-xs rounded-lg px-2.5 py-1.5 ${m.sender === 'master' ? 'bg-white/15' : 'bg-surface dark:bg-surface-dark'}`}>
                            {m.attachment.type === 'application/pdf' ? <FileText size={12} /> : <ImageIcon size={12} />} {m.attachment.name}
                          </a>
                        )}
                        <p className={`text-[10px] mt-1 ${m.sender === 'master' ? 'text-white/70' : 'text-ink-faint'}`}>{formatDate(m.createdAt)}</p>
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
                  {attachError && <p className="text-xs text-brand-coral">{attachError}</p>}
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
              <p className="text-sm text-ink-faint">Select a message to read it.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
