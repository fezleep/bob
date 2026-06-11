import Link from "next/link";

const attentionItems = [
  {
    name: "Avery Brooks",
    company: "Northstar Clinics",
    signal: "Overdue follow-up",
    reason: "Asked for rollout timing, then went quiet after pricing.",
    next: "Send a concise implementation note today.",
  },
  {
    name: "Mina Santos",
    company: "Cedar Supply",
    signal: "Due today",
    reason: "Qualified buyer with a procurement window opening this week.",
    next: "Confirm decision criteria and schedule technical review.",
  },
  {
    name: "Jon Bell",
    company: "Harbor Studio",
    signal: "Stale",
    reason: "Strong fit, but no movement since the discovery note.",
    next: "Restart with the last known pain point.",
  },
];

const followUps = [
  { label: "Overdue", value: "1", helper: "Needs action before more pipeline work" },
  { label: "Due today", value: "2", helper: "Ready for a focused follow-up block" },
  { label: "Scheduled", value: "4", helper: "Tracked without crowding the queue" },
];

const pipeline = [
  { label: "New", count: 3, width: "38%" },
  { label: "Contacted", count: 5, width: "64%" },
  { label: "Qualified", count: 2, width: "30%" },
  { label: "Closed", count: 1, width: "18%" },
  { label: "Lost", count: 1, width: "18%" },
];

const capabilities = [
  ["Spring Boot API", "Implemented"],
  ["PostgreSQL persistence", "Implemented"],
  ["JWT auth", "Implemented"],
  ["AI insights", "Implemented"],
  ["Follow-up engine", "Implemented"],
  ["Attention queue", "Implemented"],
  ["Production diagnostics", "Implemented"],
  ["OpenAPI", "Planned"],
  ["Redis or async jobs", "Roadmap"],
];

export default function DemoWorkspacePage() {
  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_28px_90px_rgb(0_0_0/0.26)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgb(var(--accent)/0.14),transparent_18rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Demo workspace
            </p>
            <h1 className="mt-3 break-words text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              See what needs attention now.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted sm:text-[0.95rem]">
              This frontend-only demo uses sample data and does not require login.
              It shows how Bob turns records into priorities, context, and next
              actions when the backend is unavailable.
            </p>
          </div>
          <div className="rounded-lg border border-accent/18 bg-black/[0.14] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Backend status
            </p>
            <p className="mt-3 text-sm font-medium text-ink">Not required for demo mode</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              The live workspace still uses the API. This page is a public product
              showcase with static sample data.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <div className="quiet-panel rounded-lg p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
                Attention queue
              </p>
              <h2 className="mt-2 text-base font-medium text-ink">
                Prioritized from follow-up timing and activity.
              </h2>
            </div>
            <span className="rounded-full border border-accent/28 bg-accent/[0.08] px-3 py-1 text-xs font-medium text-[rgb(var(--champagne))]">
              3 active signals
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {attentionItems.map((item) => (
              <article
                key={item.name}
                className="rounded-lg border border-border/60 bg-elevated/[0.2] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.company}</p>
                    <p className="mt-1 text-xs text-faint">{item.name}</p>
                  </div>
                  <span className="w-fit rounded-full border border-accent/25 bg-accent/[0.08] px-2.5 py-1 text-xs text-[rgb(var(--champagne))]">
                    {item.signal}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">{item.reason}</p>
                <div className="mt-4 rounded-md border border-border/50 bg-black/[0.14] px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    Next follow-up
                  </p>
                  <p className="mt-1 text-sm text-ink">{item.next}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          {followUps.map((item) => (
            <div key={item.label} className="quiet-panel rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.helper}</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums text-ink">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Bob read
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            AI-style operational insight.
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-muted">
            <p>
              The workspace has one urgent risk: Northstar is qualified, but the
              conversation is slipping because implementation timing is unanswered.
            </p>
            <p>
              Cedar Supply is the best near-term opportunity. The next action is
              not another generic check-in; it is confirming the buying criteria
              before the technical review.
            </p>
            <p className="rounded-lg border border-accent/20 bg-accent/[0.06] p-4 text-[rgb(var(--champagne))]">
              Recommended focus: clear overdue follow-up first, then protect the
              qualified Cedar window.
            </p>
          </div>
        </article>

        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Pipeline snapshot
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Simple flow without dashboard noise.
          </h2>
          <div className="mt-6 space-y-4">
            {pipeline.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">{stage.label}</span>
                  <span className="tabular-nums text-muted">{stage.count}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/28">
                  <div
                    className="pipeline-bar h-full rounded-full bg-[rgb(var(--accent))]"
                    style={{ width: stage.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="quiet-panel rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              System capabilities
            </p>
            <h2 className="mt-2 text-base font-medium text-ink">
              What the demo maps to in the real app.
            </h2>
          </div>
          <Link
            href="/workspace"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-border/65 bg-elevated/30 px-3 text-sm font-medium text-muted transition duration-200 hover:border-accent/34 hover:bg-elevated/55 hover:text-ink"
          >
            Open live workspace
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(([label, state]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/55 bg-elevated/[0.2] px-4 py-3"
            >
              <span className="text-sm font-medium text-ink">{label}</span>
              <span
                className={[
                  "shrink-0 rounded-full border px-2 py-1 text-[0.7rem] font-medium uppercase tracking-[0.08em]",
                  state === "Implemented"
                    ? "border-accent/30 bg-accent/[0.08] text-[rgb(var(--champagne))]"
                    : "border-border/60 bg-black/20 text-faint",
                ].join(" ")}
              >
                {state}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
