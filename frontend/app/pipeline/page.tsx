import Link from "next/link";
import { PipelineBoard } from "@/components/pipeline-board";
import { getAllLeads, statuses } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await getAllLeads({
    sort: "updatedAt",
    direction: "desc",
  });
  const openLeads = leads.filter((lead) => !["CLOSED", "LOST"].includes(lead.status));

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-border/70 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_28px_90px_rgb(0_0_0/0.24)] sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgb(var(--accent)/0.13),transparent_17rem),radial-gradient(circle_at_86%_0%,rgb(255_255_255/0.065),transparent_18rem)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Pipeline
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Every lead, placed where the work actually is.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-[0.95rem]">
              A calm board for scanning new conversations, qualified momentum, and
              clean outcomes without turning bob into a noisy command center.
            </p>
          </div>

          <div className="grid min-w-56 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <PipelineStat label="Total leads" value={leads.length} />
            <PipelineStat label="Open work" value={openLeads.length} />
            <Link
              href="/leads"
              className="focus-ring inline-flex h-12 items-center justify-center rounded-md border border-border/70 bg-elevated/50 px-4 text-sm font-medium text-ink transition duration-200 hover:border-border hover:bg-elevated/80 sm:col-span-1"
            >
              Manage leads
            </Link>
          </div>
        </div>
      </section>

      {leads.length > 0 ? (
        <PipelineBoard leads={leads} />
      ) : (
        <section className="quiet-panel rounded-lg px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-border/70 bg-elevated/60 text-sm font-medium text-muted shadow-[0_1px_0_rgb(255_255_255/0.035)_inset]">
            0
          </div>
          <h2 className="mt-5 text-base font-medium text-ink">The board is ready</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Add the first lead and bob will give every status a place to breathe.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {statuses.map((status) => (
              <span
                key={status}
                className="h-2 w-10 rounded-full border border-border/60 bg-elevated/50"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PipelineStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/65 bg-surface/45 p-3 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
