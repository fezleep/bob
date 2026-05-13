export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-4 w-20 rounded bg-elevated" />
          <div className="mt-3 h-8 w-28 rounded bg-elevated" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-6 w-20 rounded-full bg-elevated" />
          ))}
        </div>
      </section>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-panel/[0.72] shadow-quiet">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b border-border/60 px-4 py-4 last:border-b-0">
            <div className="h-4 w-44 rounded bg-elevated" />
            <div className="mt-3 h-3 w-64 max-w-full rounded bg-elevated/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
