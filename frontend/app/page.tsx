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
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">bob</p>
          <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            quiet software for modern teams.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted">
            bob is a calm lead workspace for people who need to understand
            where conversations stand, what changed recently, and what should
            happen next.
          </p>
          <p className="max-w-xl text-sm leading-6 text-muted">
            It is built like a real startup product: focused workflows, a
            reliable backend foundation, and a dark-first interface that keeps
            teams close to the work instead of the noise.
          </p>
        </div>
        <Link
          href="/leads"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-white/80 bg-ink px-4 text-sm font-medium text-black transition duration-200 hover:bg-white active:scale-[0.99] sm:self-auto"
        >
          Open leads
        </Link>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Product note
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            For recruiters, tech leads, and non-technical reviewers: bob is a
            fullstack product that manages leads, notes, and activity history in
            one simple workspace. The goal is to show product judgment and
            engineering depth without turning the experience into a generic CRM.
          </p>
        </div>

        <div className="quiet-panel rounded-lg p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#d7bd87]/35 bg-[#d7bd87]/10 text-sm font-semibold text-[#d7bd87] shadow-[0_1px_0_rgb(255_255_255/0.035)_inset]">
              b
            </div>
            <div>
              <p className="text-sm font-medium text-ink">built by Felipe Virginio</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                product engineer / backend-focused builder
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            built with modern ai-assisted workflows, focused on clarity,
            consistency and product thinking.
          </p>
        </div>
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
