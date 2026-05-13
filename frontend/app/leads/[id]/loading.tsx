export default function LeadDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-24 rounded bg-elevated" />

      <section className="quiet-panel rounded-lg p-5 sm:p-6">
        <div className="h-7 w-56 rounded bg-elevated" />
        <div className="mt-4 h-4 w-96 max-w-full rounded bg-elevated/70" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="quiet-panel rounded-lg p-5">
          <div className="h-4 w-16 rounded bg-elevated" />
          <div className="mt-5 h-24 rounded border border-border/60 bg-elevated/45" />
        </div>
        <div className="quiet-panel rounded-lg p-5">
          <div className="h-4 w-20 rounded bg-elevated" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-elevated/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
