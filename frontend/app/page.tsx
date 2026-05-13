import Link from "next/link";
import { LeadList } from "@/components/lead-list";
import { MetricCard } from "@/components/metric-card";
import { getLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function Home() {
  const leadList = await getLeads();
  const { leads } = leadList;
  const activeLeads = leads.filter((lead) => !["CLOSED", "LOST"].includes(lead.status)).length;
  const warmLeads = leads.filter((lead) => lead.status === "QUALIFIED").length;

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">Today</p>
          <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            A quieter view of the pipeline.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted">
            Track the leads that need attention, keep notes close, and move the
            next conversation forward without dashboard noise.
          </p>
        </div>
        <Link
          href="/leads"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-white/80 bg-ink px-4 text-sm font-medium text-black transition duration-200 hover:bg-white active:scale-[0.99] sm:self-auto"
        >
          Open leads
        </Link>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Open leads" value={activeLeads.toString()} />
        <MetricCard label="Qualified" value={warmLeads.toString()} />
        <MetricCard label="Total" value={leadList.totalElements.toString()} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-ink">Recent leads</h2>
          <Link href="/leads" className="focus-ring rounded-md text-sm text-muted transition duration-200 hover:text-ink">
            View all
          </Link>
        </div>
        <LeadList leads={leads.slice(0, 4)} />
      </section>
    </div>
  );
}
