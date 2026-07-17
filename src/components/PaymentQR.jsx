import { useRef, useState } from 'react';
import { UploadCloud, FileImage, CheckCircle2, X } from 'lucide-react';
import qrImage from '../assets/payment-qr.png';
import { formatINR } from '../lib/constants';

export default function PaymentQR({ amount, note, onSubmitProof, submitLabel = "I've paid — submit proof" }) {
  const fileRef = useRef(null);
  const [proof, setProof] = useState(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Please upload the payment screenshot as PNG, JPG or JPEG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is larger than 10MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setProof({ name: file.name, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!proof) { setError('Please upload proof of payment before submitting.'); return; }
    onSubmitProof(proof);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 text-center">
        <CheckCircle2 className="mx-auto text-brand-purple dark:text-brand-coral mb-2" size={28} />
        <p className="text-sm font-medium text-ink dark:text-ink-dark">Proof of payment submitted</p>
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mt-1">Teamify will verify and confirm shortly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 space-y-5">
      <div className="text-center">
        <p className="text-xs text-ink-soft dark:text-ink-soft-dark mb-1">Amount to pay</p>
        <p className="text-3xl font-semibold brand-gradient-text">{formatINR(amount)}</p>
        {note && <p className="text-xs text-ink-faint mt-1">{note}</p>}
      </div>

      <img src={qrImage} alt="Teamify UPI QR code" className="mx-auto rounded-xl border border-line dark:border-line-dark w-56" />

      <div>
        <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Upload proof of payment</label>
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line dark:border-line-dark px-4 py-2.5 text-sm text-ink-soft dark:text-ink-soft-dark hover:border-brand-purple/50 hover:text-brand-purple transition">
            <UploadCloud size={15} /> PNG, JPG or JPEG
          </button>
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={onFile} />
          {proof && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
              <FileImage size={12} /> {proof.name}
              <button type="button" onClick={() => setProof(null)}><X size={12} className="text-ink-faint hover:text-brand-coral" /></button>
            </span>
          )}
        </div>
        {error && <p className="text-xs text-brand-coral mt-2">{error}</p>}
      </div>

      <button onClick={submit} className="w-full inline-flex items-center justify-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium py-3 hover:opacity-90 transition">
        {submitLabel}
      </button>
    </div>
  );
}
