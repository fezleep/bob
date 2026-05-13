export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="quiet-panel rounded-lg p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
