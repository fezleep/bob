export default function LeadDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-4 w-24 rounded" />

      <section className="quiet-panel rounded-lg p-5 sm:p-6">
        <div className="skeleton h-7 w-56 rounded" />
        <div className="skeleton mt-4 h-4 w-96 max-w-full rounded" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="quiet-panel rounded-lg p-5">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton mt-5 h-24 rounded border border-border/60" />
        </div>
        <div className="quiet-panel rounded-lg p-5">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-10 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
