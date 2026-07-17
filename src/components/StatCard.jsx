export default function StatCard({ label, value, icon: Icon, accent = false, sub }) {
  return (
    <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5">{label}</p>
          <p className={`text-2xl font-semibold ${accent ? 'brand-gradient-text' : 'text-ink dark:text-ink-dark'}`}>{value}</p>
          {sub && <p className="text-xs text-ink-faint mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-xl brand-gradient flex items-center justify-center shrink-0">
            <Icon size={18} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
