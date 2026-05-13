import Link from "next/link";
import type { Lead } from "@/lib/leads";
import { StatusPill } from "@/components/status-pill";

export function LeadList({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-panel/[0.72] shadow-quiet">
      <div className="hidden grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr] border-b border-border/70 px-4 py-3 text-xs text-faint md:grid">
        <span>Company</span>
        <span>Status</span>
        <span>Owner</span>
        <span className="text-right">Value</span>
      </div>

      <div className="divide-y divide-border/60">
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/leads/${lead.id}`}
            className="grid gap-3 px-4 py-4 transition hover:bg-elevated/55 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3 md:block">
                <p className="truncate text-sm font-medium text-ink">{lead.company}</p>
                <div className="md:hidden">
                  <StatusPill status={lead.status} />
                </div>
              </div>
              <p className="mt-1 truncate text-sm text-muted">
                {lead.contact} · {lead.email}
              </p>
            </div>
            <div className="hidden md:block">
              <StatusPill status={lead.status} />
            </div>
            <p className="text-sm text-muted">{lead.owner}</p>
            <div className="flex items-center justify-between gap-3 md:block md:text-right">
              <p className="text-sm font-medium text-ink">{lead.value}</p>
              <p className="text-xs text-faint md:mt-1">{lead.lastTouch}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
