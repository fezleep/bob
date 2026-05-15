const stack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Spring Boot", "PostgreSQL"];

const architecture = [
  "Frontend routes are organized by user intent: introduction, workspace, pipeline, leads, and project context.",
  "The backend direction is a modular monolith, keeping the product simple while leaving room for clearer domain boundaries.",
  "Lead data, notes, status changes, and activity history are treated as operational memory rather than separate dashboards.",
];

export default function AboutPage() {
  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_24px_80px_rgb(0_0_0/0.22)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgb(var(--accent)/0.13),transparent_18rem)]" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            About bob
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Quiet software for lead work that needs clarity.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted sm:text-[0.95rem]">
            bob is a small lead management product for teams that want the useful
            parts of a CRM without adopting a heavy operating system too early.
            It exists to make conversations easier to read, maintain, and move
            forward.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Product intent
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Why it exists</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <p>
              Small teams often need relationship memory before they need a large
              sales platform. bob solves that gap by keeping lead status, notes,
              and recent movement close to the actual work.
            </p>
            <p>
              The product is designed to reduce overload: each page has a clear
              purpose, copy stays restrained, and operational detail appears where
              it helps decision-making.
            </p>
          </div>
        </article>

        <aside className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Author
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Felipe Virginio</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Built with modern ai-assisted workflows, focused on clarity,
            consistency, and product thinking.
          </p>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Tech stack
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Modern, direct, maintainable</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-md border border-border/60 bg-elevated/35 px-3 py-2 text-sm text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Architecture
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Organized by product boundaries</h2>
          <div className="mt-5 space-y-3">
            {architecture.map((item) => (
              <p key={item} className="text-sm leading-6 text-muted">
                {item}
              </p>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
