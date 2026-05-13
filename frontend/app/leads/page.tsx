import { LeadList } from "@/components/lead-list";
import { StatusPill } from "@/components/status-pill";
import { getLeads, statuses } from "@/lib/leads";

export default function LeadsPage() {
  const leads = getLeads();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Pipeline</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Leads</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
      </section>

      {leads.length > 0 ? (
        <LeadList leads={leads} />
      ) : (
        <div className="quiet-panel rounded-lg p-10 text-center">
          <h2 className="text-sm font-medium text-ink">No leads yet</h2>
          <p className="mt-2 text-sm text-muted">
            New leads will appear here once the pipeline has activity.
          </p>
        </div>
      )}
    </div>
  );
}
