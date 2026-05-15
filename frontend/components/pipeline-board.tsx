import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import {
  formatLeadDate,
  formatLeadStatus,
  statuses,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";

const columnCopy: Record<LeadStatus, { title: string; empty: string }> = {
  NEW: {
    title: "New signals",
    empty: "No fresh leads are waiting. The next hand-raise will land here.",
  },
  CONTACTED: {
    title: "In conversation",
    empty: "No open outreach right now. Replies will make this lane feel alive.",
  },
  QUALIFIED: {
    title: "Worth staying close",
    empty: "No qualified opportunities yet. Strong signals will collect here.",
  },
  CLOSED: {
    title: "Won work",
    empty: "Nothing closed yet. This lane keeps the proof of progress.",
  },
  LOST: {
    title: "Closed loops",
    empty: "No lost leads. Clean endings will stay visible without creating noise.",
  },
};

function groupLeadsByStatus(leads: Lead[]) {
  return statuses.reduce(
    (groups, status) => ({
      ...groups,
      [status]: leads.filter((lead) => lead.status === status),
    }),
    {} as Record<LeadStatus, Lead[]>
  );
}

export function PipelineBoard({ leads }: { leads: Lead[] }) {
  const groupedLeads = groupLeadsByStatus(leads);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {statuses.map((status, index) => {
        const columnLeads = groupedLeads[status];

        return (
          <section
            key={status}
            className="quiet-panel motion-rise flex min-h-[21rem] flex-col overflow-hidden rounded-lg"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="border-b border-border/60 bg-elevated/[0.18] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    {formatLeadStatus(status)}
                  </p>
                  <h2 className="mt-2 text-sm font-medium text-ink">
                    {columnCopy[status].title}
                  </h2>
                </div>
                <span className="rounded-full border border-border/65 bg-surface/70 px-2 py-1 text-xs tabular-nums text-muted">
                  {columnLeads.length}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-3">
              {columnLeads.length > 0 ? (
                columnLeads.map((lead) => (
                  <LeadPipelineCard key={lead.id} lead={lead} />
                ))
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-elevated/[0.14] px-4 py-8 text-center">
                  <div className="flex size-8 items-center justify-center rounded-md border border-border/65 bg-panel/70 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]">
                    <span className="size-1.5 rounded-full bg-accent/80" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-ink">Quiet for now</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {columnCopy[status].empty}
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LeadPipelineCard({ lead }: { lead: Lead }) {
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="focus-ring group rounded-lg border border-border/65 bg-panel/72 p-4 shadow-[0_1px_0_rgb(255_255_255/0.035)_inset,0_14px_34px_rgb(0_0_0/0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-elevated/45 hover:shadow-[0_1px_0_rgb(255_255_255/0.045)_inset,0_18px_44px_rgb(0_0_0/0.24)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {lead.company || lead.name}
          </p>
          {lead.company ? (
            <p className="mt-1 truncate text-xs leading-5 text-faint">{lead.name}</p>
          ) : null}
        </div>
        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent/75 transition duration-200 group-hover:bg-accent" />
      </div>

      <p className="mt-3 truncate text-sm leading-5 text-muted">
        {lead.email || "No email on file yet"}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <StatusPill status={lead.status} />
        <div className="flex items-center justify-between gap-3 border-t border-border/55 pt-3">
          <span className="text-xs text-faint">Last updated</span>
          <span className="text-xs font-medium text-muted">
            {formatLeadDate(lead.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
