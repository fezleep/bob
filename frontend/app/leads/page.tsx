import { CreateLeadForm } from "@/components/create-lead-form";
import { LeadWorkspace } from "@/components/lead-workspace";
import { StatusPill } from "@/components/status-pill";
import { getAllLeads, statuses } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getAllLeads({
    sort: "updatedAt",
    direction: "desc",
  });
  const openLeads = leads.filter((lead) => !["CLOSED", "LOST"].includes(lead.status));
  const quietCopy =
    leads.length > 0
      ? "Search and filter instantly, scan the relationship in preview, then step into the full page only when the work needs depth."
      : "Create the first lead and bob will start turning conversations into a readable operating rhythm.";

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_24px_80px_rgb(0_0_0/0.22)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgb(var(--accent)/0.12),transparent_18rem)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Conversations
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">
              Leads without the hard cut.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">{quietCopy}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <LeadStat label="Total" value={leads.length} />
            <LeadStat label="Open" value={openLeads.length} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border/55 bg-black/[0.12] p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Status map
          </p>
          <h2 className="mt-2 text-sm font-medium text-ink">
            A calm structure for scanning the full conversation set
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Filters keep the list focused. The status language stays visible here,
            but the detail only opens when you need it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <LeadWorkspace
          leads={leads}
          title="Lead index"
          description="Everything is organized for fast operational scanning first. Search by person, company, or email, then narrow the room with status-aware views."
          emptyTitle="Start the workspace"
          emptyBody="Create the first lead to give bob a conversation, a signal, and a place to collect operational memory."
        />

        <div className="xl:sticky xl:top-20">
          <CreateLeadForm />
        </div>
      </div>
    </div>
  );
}

function LeadStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/55 bg-black/[0.12] p-3">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
