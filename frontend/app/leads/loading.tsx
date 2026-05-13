export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton mt-3 h-8 w-28 rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-6 w-20 rounded-full" />
          ))}
        </div>
      </section>

      <div className="quiet-panel overflow-hidden rounded-lg">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b border-border/60 px-4 py-4 last:border-b-0">
            <div className="skeleton h-4 w-44 rounded" />
            <div className="skeleton mt-3 h-3 w-64 max-w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
