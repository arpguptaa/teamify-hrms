import { FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../lib/export';

export default function ExportButton({ filename, rows, sheetName, label = 'Export to Excel' }) {
  return (
    <button
      onClick={() => exportToExcel(filename, rows, sheetName)}
      className="inline-flex items-center gap-2 rounded-xl border border-line dark:border-line-dark text-sm font-medium px-4 py-2.5 text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft transition"
    >
      <FileSpreadsheet size={15} /> {label}
    </button>
  );
}
