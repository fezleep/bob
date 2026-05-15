import { CreateLeadForm } from "@/components/create-lead-form";
import { LeadList } from "@/components/lead-list";
import { StatusPill } from "@/components/status-pill";
import { formatCurrentQuietPhrase, getLeads, statuses } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads } = await getLeads();

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Pipeline
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-ink">Leads</h1>
          <p className="mt-2 text-sm text-muted">
            A calm read on what is moving, waiting, and {formatCurrentQuietPhrase()}.
          </p>
        </div>
        <details className="group sm:max-w-sm">
          <summary className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-md text-sm text-faint transition duration-200 hover:text-muted sm:justify-end">
            <span className="size-1.5 rounded-full bg-accent/55" />
            Status key
          </summary>
          <div className="disclosure-panel mt-3">
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <StatusPill key={status} status={status} />
              ))}
            </div>
          </div>
        </details>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        {leads.length > 0 ? (
          <LeadList leads={leads} />
        ) : (
          <div className="quiet-panel rounded-lg px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-border/70 bg-elevated/60 text-sm font-medium text-muted shadow-[0_1px_0_rgb(255_255_255/0.035)_inset]">
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
