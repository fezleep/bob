import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/activity-timeline";
import { LeadIntelligenceBadgeView } from "@/components/lead-intelligence-badge";
import { NotesSection } from "@/components/notes-section";
import { StatusPill } from "@/components/status-pill";
import { ApiError } from "@/lib/api";
import {
  getLeadIntelligenceBadges,
  getLeadIntelligenceSummary,
  getLeadQuietDays,
} from "@/lib/lead-intelligence";
import {
  formatLeadDate,
  formatQuietTemporalPhrase,
  formatTemporalPhrase,
  getLeadDetail,
} from "@/lib/leads";

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

  const intelligenceBadges = getLeadIntelligenceBadges(lead);
  const intelligenceSummary = getLeadIntelligenceSummary(lead);
  const quietDays = getLeadQuietDays(lead);

  return (
    <div className="space-y-6">
      <Link href="/leads" className="focus-ring inline-flex rounded-md text-sm text-muted transition duration-200 hover:text-ink">
        Back to leads
      </Link>

      <section className="premium-card rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold leading-tight text-ink">
                {lead.company || lead.name}
              </h1>
              <StatusPill status={lead.status} />
              {intelligenceBadges.map((badge) => (
                <LeadIntelligenceBadgeView key={badge.label} badge={badge} />
              ))}
              <span className="inline-flex items-center gap-2 rounded-full border border-border/65 bg-elevated/45 px-2.5 py-1 text-xs text-muted">
                <span className="rhythm-dot size-1.5 rounded-full bg-accent/80" />
                {formatTemporalPhrase(lead.updatedAt)}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              {lead.name}
              {lead.email ? ` · ${lead.email}` : ""}
            </p>
            <details className="group max-w-2xl">
              <summary className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-md text-sm text-faint transition duration-200 hover:text-muted">
                <span className="size-1.5 rounded-full bg-accent/55" />
                Signal summary
              </summary>
              <div className="disclosure-panel mt-2">
                <p className="text-sm leading-6 text-faint">{intelligenceSummary}</p>
              </div>
            </details>
          </div>
          <div className="grid min-w-56 grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
            <DetailStat label="Created" value={formatLeadDate(lead.createdAt)} />
            <DetailStat label="Last movement" value={formatTemporalPhrase(lead.updatedAt)} />
            <DetailStat
              label="Signal"
              value={
                quietDays > 0
                  ? formatQuietTemporalPhrase(lead.updatedAt)
                  : "updated recently"
              }
            />
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
    <div className="rounded-md border border-border/55 bg-elevated/[0.32] p-3 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
