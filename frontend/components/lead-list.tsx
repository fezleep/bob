import Link from "next/link";
import { LeadIntelligenceBadgeView } from "@/components/lead-intelligence-badge";
import { getLeadIntelligenceBadges } from "@/lib/lead-intelligence";
import { formatTemporalPhrase, type Lead } from "@/lib/leads";
import { StatusPill } from "@/components/status-pill";

export function LeadList({ leads }: { leads: Lead[] }) {
  return (
    <div className="quiet-panel overflow-hidden rounded-lg">
      <div className="hidden grid-cols-[1.35fr_0.72fr_0.7fr] border-b border-border/55 bg-elevated/[0.13] px-4 py-3 text-xs font-medium text-faint md:grid">
        <span>Company</span>
        <span>Status</span>
        <span className="text-right">Movement</span>
      </div>

      <div className="divide-y divide-border/60">
        {leads.map((lead, index) => {
          const badges = getLeadIntelligenceBadges(lead);

          return (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="focus-ring soft-row group motion-fade grid gap-3 border border-transparent px-4 py-4 md:grid-cols-[1.35fr_0.72fr_0.7fr] md:items-center"
              style={{ animationDelay: `${index * 42}ms` }}
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
                <p className="mt-1 truncate text-sm leading-5 text-faint transition duration-200 group-hover:text-muted">
                  {lead.name}
                </p>
                <div className="disclosure-panel mt-2">
                  <div>
                    {lead.email ? (
                      <p className="truncate text-xs text-faint">{lead.email}</p>
                    ) : null}
                    {badges.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {badges.map((badge) => (
                          <LeadIntelligenceBadgeView
                            key={badge.label}
                            badge={badge}
                            compact
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <StatusPill status={lead.status} />
              </div>
              <p className="text-sm text-faint transition duration-200 group-hover:text-muted md:text-right">
                {formatTemporalPhrase(lead.updatedAt)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
