import { CreateLeadForm } from "@/components/create-lead-form";
import { LeadList } from "@/components/lead-list";
import { StatusPill } from "@/components/status-pill";
import { getLeads, statuses } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads } = await getLeads();

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        {leads.length > 0 ? (
          <LeadList leads={leads} />
        ) : (
          <div className="quiet-panel rounded-lg px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-border/70 bg-elevated text-sm font-medium text-muted">
              0
            </div>
            <h2 className="mt-5 text-base font-medium text-ink">Start the pipeline</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Create the first lead to track contact details, notes, and status
              changes in one quiet workspace.
            </p>
          </div>
        )}

        <div className="xl:sticky xl:top-20">
          <CreateLeadForm />
        </div>
      </div>
    </div>
  );
}
