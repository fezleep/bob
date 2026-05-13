export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="quiet-panel subtle-card rounded-lg p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
