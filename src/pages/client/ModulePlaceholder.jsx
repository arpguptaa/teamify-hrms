import { useParams, Navigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Hammer, LayoutGrid } from 'lucide-react';
import { CLIENT_MODULES } from '../../lib/constants';

export default function ModulePlaceholder() {
  const { moduleId } = useParams();
  const mod = CLIENT_MODULES.find((m) => m.id === moduleId);

  if (!mod) return <Navigate to="/client/dashboard" replace />;

  const Icon = Icons[mod.icon] || LayoutGrid;

  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="h-16 w-16 rounded-2xl brand-gradient mx-auto flex items-center justify-center mb-6">
        <Icon size={26} className="text-white" />
      </div>
      <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark mb-2">{mod.label}</h1>
      <p className="text-sm text-ink-soft dark:text-ink-soft-dark mb-8">{mod.blurb}</p>
      <div className="inline-flex items-center gap-2 rounded-full bg-surface-soft dark:bg-surface-dark-soft px-4 py-2 text-xs font-medium text-ink-soft dark:text-ink-soft-dark">
        <Hammer size={13} /> Work under progress — this module is coming soon
      </div>
    </div>
  );
}
