import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/activity-timeline";
import { NotesSection } from "@/components/notes-section";
import { StatusPill } from "@/components/status-pill";
import { ApiError } from "@/lib/api";
import { formatLeadDate, getLeadDetail } from "@/lib/leads";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  let lead;

  try {
    lead = await getLeadDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/leads" className="focus-ring inline-flex rounded-md text-sm text-muted transition duration-200 hover:text-ink">
        Back to leads
      </Link>

      <section className="quiet-panel rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold leading-tight text-ink">
                {lead.company || lead.name}
              </h1>
              <StatusPill status={lead.status} />
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              {lead.name}
              {lead.email ? ` · ${lead.email}` : ""}
            </p>
          </div>
          <div className="grid min-w-56 grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
            <DetailStat label="Created" value={formatLeadDate(lead.createdAt)} />
            <DetailStat label="Updated" value={formatLeadDate(lead.updatedAt)} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <NotesSection notes={lead.notes} />
        <ActivityTimeline activities={lead.activities} />
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-elevated/[0.42] p-3 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
