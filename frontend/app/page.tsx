import Image from "next/image";
import Link from "next/link";

const primaryActions = [
  {
    href: "/demo",
    label: "View demo workspace",
    primary: true,
  },
  {
    href: "/capabilities",
    label: "System capabilities",
  },
  {
    href: "/workspace",
    label: "Open workspace",
  },
  {
    href: "/pipeline",
    label: "View pipeline",
  },
  {
    href: "/leads",
    label: "View leads",
  },
  {
    href: "/about",
    label: "About this project",
  },
];

const productNotes = [
  {
    title: "See what needs attention now",
    body: "Bob turns records, follow-ups, and stale conversations into a short operating queue.",
  },
  {
    title: "Understand why it matters",
    body: "Lead status, notes, activity, and AI-style reads stay close to the next decision.",
  },
  {
    title: "Move with a next action",
    body: "Follow-up timing and pipeline context make the next useful step visible without CRM weight.",
  },
];

const workflowSteps = [
  "Capture the record and current relationship state.",
  "Read the attention queue for overdue, due, or stale work.",
  "Use the AI operational read to summarize context and risk.",
  "Move the lead through the pipeline when the next action changes.",
];

const capabilities = [
  { label: "Spring Boot API", state: "Implemented" },
  { label: "PostgreSQL persistence", state: "Implemented" },
  { label: "JWT auth", state: "Implemented" },
  { label: "AI insights", state: "Implemented" },
  { label: "Follow-up engine", state: "Implemented" },
  { label: "Attention queue", state: "Implemented" },
  { label: "Production diagnostics", state: "Implemented" },
  { label: "OpenAPI docs", state: "Implemented" },
  { label: "Render + Neon deployment", state: "Prepared" },
  { label: "Oracle VM deployment", state: "Prepared" },
  { label: "Redis or async jobs", state: "Roadmap" },
];

export default function Home() {
  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_28px_90px_rgb(0_0_0/0.26)] sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgb(var(--accent)/0.16),transparent_18rem),radial-gradient(circle_at_82%_8%,rgb(var(--champagne)/0.07),transparent_19rem)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center overflow-hidden rounded-md border border-accent/30 bg-accent/10 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset]">
                <Image
                  src="/branding/bob-logo.png"
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 object-contain"
                  priority
                />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
                  bob
                </p>
                <p className="mt-1 text-sm text-muted">AI-powered operational workspace</p>
              </div>
            </div>

            <h1 className="mt-8 max-w-2xl break-words text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[2.72rem]">
              Turn scattered records into clear priorities, context, and next actions.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-[0.95rem]">
              Bob helps small teams see what needs attention, why it matters, and
              what to do next. Follow-up, context, and an AI-style operational read
              live in one calm workspace.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="focus-ring warm-button inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium"
              >
                View demo workspace
              </Link>
              <Link
                href="/capabilities"
                className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-border/65 bg-elevated/30 px-4 text-sm font-medium text-muted transition duration-200 hover:border-accent/34 hover:bg-elevated/55 hover:text-ink"
              >
                System capabilities
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-accent/18 bg-black/[0.14] p-4 shadow-[0_1px_0_rgb(255_255_255/0.03)_inset] backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Demo mode
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              Sample data, no login, no backend dependency.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Recruiters and reviewers can open the demo even if the production
              API or database provider is paused.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={[
              "focus-ring subtle-card rounded-lg px-4 py-4 text-sm font-medium transition duration-200",
              action.primary
                ? "warm-button"
                : "border border-border/60 bg-elevated/35 text-ink hover:border-accent/30 hover:bg-elevated/55",
            ].join(" ")}
          >
            {action.label}
          </Link>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {productNotes.map((note) => (
          <article key={note.title} className="quiet-panel subtle-card rounded-lg p-5">
            <h2 className="text-sm font-medium text-ink">{note.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{note.body}</p>
          </article>
        ))}
      </section>

      <section className="quiet-panel rounded-lg p-5 sm:p-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            How Bob works
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Records become an operating read.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Bob is not just lead CRUD. It combines pipeline state, follow-up timing,
            activity history, notes, and AI insight so a reviewer can understand
            the current work in one pass.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step}
              className="rounded-lg border border-border/55 bg-elevated/[0.2] p-4"
            >
              <p className="text-xs font-medium tabular-nums text-faint">
                0{index + 1}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="quiet-panel rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Technical capabilities
            </p>
            <h2 className="mt-2 text-base font-medium text-ink">
              Small product, real system shape.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted">
            Implemented items map to the current app. Prepared deployment paths are
            documented, and roadmap items are labeled separately.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <div
              key={capability.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/55 bg-elevated/[0.2] px-4 py-3"
            >
              <span className="text-sm font-medium text-ink">{capability.label}</span>
              <span
                className={[
                  "shrink-0 rounded-full border px-2 py-1 text-[0.7rem] font-medium uppercase tracking-[0.08em]",
                  capability.state === "Implemented"
                    ? "border-accent/30 bg-accent/[0.08] text-[rgb(var(--champagne))]"
                    : capability.state === "Prepared"
                      ? "border-[rgb(var(--champagne)/0.28)] bg-[rgb(var(--champagne)/0.08)] text-[rgb(var(--champagne))]"
                      : "border-border/60 bg-black/20 text-faint",
                ].join(" ")}
              >
                {capability.state}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
