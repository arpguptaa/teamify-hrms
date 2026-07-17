import { useState } from 'react';
import { Cloud, CheckCircle2, RefreshCw, Unlink } from 'lucide-react';
import { isGoogleConfigured, connectGoogleDriveFolder } from '../lib/googleDrive';

export default function GoogleDriveCard({ config, onConnect, onDisconnect, description }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const configured = isGoogleConfigured();

  const connect = async () => {
    setError('');
    if (!configured) {
      setError("Google Drive isn't configured on this deployment yet — add your Google Cloud credentials (see README) to turn this on.");
      return;
    }
    setLoading(true);
    try {
      const folder = await connectGoogleDriveFolder();
      if (folder) onConnect(folder);
    } catch {
      setError('Could not connect to Google Drive. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
      <h2 className="font-semibold text-ink dark:text-ink-dark mb-1 inline-flex items-center gap-2">
        <Cloud size={16} /> Google Drive storage
      </h2>
      <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-4">{description}</p>

      {config?.connected ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-purple/5 border border-brand-purple/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-ink dark:text-ink-dark">
            <CheckCircle2 size={16} className="text-brand-purple dark:text-brand-coral shrink-0" />
            Connected to <strong className="break-all">{config.folderName}</strong>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={connect} disabled={loading} className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-line dark:border-line-dark px-3 py-1.5 hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition">
              <RefreshCw size={13} /> Change folder
            </button>
            <button onClick={onDisconnect} className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-brand-coral/30 text-brand-coral px-3 py-1.5 hover:bg-brand-coral/10 transition">
              <Unlink size={13} /> Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button onClick={connect} disabled={loading} className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition disabled:opacity-60">
          <Cloud size={15} /> {loading ? 'Connecting…' : 'Connect Google Drive'}
        </button>
      )}

      {error && <p className="text-xs text-brand-coral mt-3">{error}</p>}
      {!configured && !error && (
        <p className="text-xs text-ink-faint mt-3">
          Not configured yet — add <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> and <code className="font-mono">VITE_GOOGLE_API_KEY</code> (see README) to turn this on.
        </p>
      )}
    </section>
  );
}
