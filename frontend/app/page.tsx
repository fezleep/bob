import Image from "next/image";
import Link from "next/link";

const primaryActions = [
  {
    href: "/workspace",
    label: "Open workspace",
    primary: true,
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
    title: "Lead work, organized",
    body: "Keep people, companies, status, notes, and recent movement in one quiet place.",
  },
  {
    title: "Built around intent",
    body: "Use the workspace for daily rhythm, the pipeline for flow, and lead pages for depth.",
  },
  {
    title: "Calm by default",
    body: "bob keeps operational signal visible without filling the screen with charts or noise.",
  },
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
                <p className="mt-1 text-sm text-muted">Quiet lead operations</p>
              </div>
            </div>

            <h1 className="mt-8 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[2.72rem]">
              A calm workspace for managing leads without the CRM weight.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-[0.95rem]">
              bob helps small teams understand who is in motion, what needs care,
              and where each conversation belongs. It is intentionally minimal,
              warm, and organized around daily work.
            </p>
          </div>

          <div className="rounded-lg border border-accent/18 bg-black/[0.14] p-4 shadow-[0_1px_0_rgb(255_255_255/0.03)_inset] backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Product shape
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              Workspace, pipeline, leads, and context each have their own room.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Start with the workspace when you want the current operating read.
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
            How to use bob
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Pick the page that matches the job.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The home page introduces the product. Workspace is for the daily
            operating read. Pipeline is for status flow. Leads is for creating,
            scanning, and opening full lead context.
          </p>
        </div>
      </section>
    </div>
  );
}
