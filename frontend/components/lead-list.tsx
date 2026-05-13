import Link from "next/link";
import { formatLeadDate, type Lead } from "@/lib/leads";
import { StatusPill } from "@/components/status-pill";

export function LeadList({ leads }: { leads: Lead[] }) {
  return (
    <div className="quiet-panel overflow-hidden rounded-lg">
      <div className="hidden grid-cols-[1.3fr_0.8fr_0.8fr] border-b border-border/60 bg-elevated/[0.18] px-4 py-3 text-xs font-medium text-faint md:grid">
        <span>Company</span>
        <span>Status</span>
        <span className="text-right">Updated</span>
      </div>

      <div className="divide-y divide-border/60">
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/leads/${lead.id}`}
            className="focus-ring grid gap-3 border border-transparent px-4 py-4 transition duration-200 hover:bg-elevated/42 hover:shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] md:grid-cols-[1.3fr_0.8fr_0.8fr] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3 md:block">
                <p className="truncate text-sm font-medium text-ink">
                  {lead.company || lead.name}
                </p>
                <div className="md:hidden">
                  <StatusPill status={lead.status} />
                </div>
              </div>
              <p className="mt-1 truncate text-sm leading-5 text-muted">
                {lead.name}
                {lead.email ? ` · ${lead.email}` : ""}
              </p>
            </div>
            <div className="hidden md:block">
              <StatusPill status={lead.status} />
            </div>
            <p className="text-sm text-muted md:text-right">{formatLeadDate(lead.updatedAt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
