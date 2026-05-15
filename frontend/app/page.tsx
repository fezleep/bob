import Image from "next/image";
import Link from "next/link";
import { LeadList } from "@/components/lead-list";
import { StatusPill } from "@/components/status-pill";
import {
  formatActivityType,
  formatLeadDate,
  getLeadActivities,
  getLeads,
  statuses,
  type Lead,
  type LeadActivity,
  type LeadStatus,
} from "@/lib/leads";

export const dynamic = "force-dynamic";

type ActivityWithLead = LeadActivity & {
  leadName: string;
  leadCompany: string | null;
};

const activeStatuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED"];
const attentionStatuses: LeadStatus[] = ["NEW", "CONTACTED"];

const statusCopy: Record<LeadStatus, string> = {
  NEW: "Fresh conversations waiting for a first move.",
  CONTACTED: "People already in motion.",
  QUALIFIED: "Signals are strong enough to stay close.",
  CLOSED: "Work that made it through.",
  LOST: "Closed loops, kept for memory.",
};

function sortByUpdatedAt(leads: Lead[]) {
  return [...leads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function daysSince(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000));
}

async function getRecentActivities(leads: Lead[]) {
  const recentLeads = sortByUpdatedAt(leads).slice(0, 6);
  const activityResults = await Promise.allSettled(
    recentLeads.map(async (lead) => {
      const activities = await getLeadActivities(lead.id);

      return activities.map((activity) => ({
        ...activity,
        leadName: lead.name,
        leadCompany: lead.company,
      }));
    })
  );

  return activityResults
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
}

export default async function Home() {
  const leadList = await getLeads();
  const { leads } = leadList;
  const recentActivities = await getRecentActivities(leads);
  const recentLeads = sortByUpdatedAt(leads).slice(0, 5);
  const activeLeads = leads.filter((lead) => activeStatuses.includes(lead.status));
  const attentionLeads = leads.filter((lead) => attentionStatuses.includes(lead.status));
  const qualifiedLeads = leads.filter((lead) => lead.status === "QUALIFIED");
  const movedRecently = leads.filter((lead) => daysSince(lead.updatedAt) <= 7);
  const totalPipeline = Math.max(leads.length, 1);

  const summaryCards = [
    {
      label: "Needs attention",
      value: attentionLeads.length,
      detail:
        attentionLeads.length > 0
          ? `${attentionLeads[0].company || attentionLeads[0].name} should not sit too long.`
          : "Nothing urgent is waiting for a reply.",
    },
    {
      label: "Qualified leads",
      value: qualifiedLeads.length,
      detail:
        qualifiedLeads.length > 0
          ? "There are warm conversations worth protecting."
          : "No qualified leads yet. The next clear signal will stand out here.",
    },
    {
      label: "Active pipeline",
      value: activeLeads.length,
      detail:
        activeLeads.length > 0
          ? "Open work is still moving before it becomes closed memory."
          : "The board is quiet. Add a lead when the next conversation starts.",
    },
    {
      label: "Recent movement",
      value: movedRecently.length,
      detail:
        movedRecently.length > 0
          ? "Something changed in the last seven days."
          : "No recent movement. A note or status change will wake this up.",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-border/70 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_28px_90px_rgb(0_0_0/0.28)] sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgb(var(--accent)/0.14),transparent_17rem),radial-gradient(circle_at_86%_4%,rgb(255_255_255/0.075),transparent_18rem)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-[#d7bd87]/35 bg-[#d7bd87]/10 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset]">
                <Image
                  src="/branding/bob-logo.png"
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 object-contain"
                  priority
                />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
                  bob overview
                </p>
                <p className="mt-1 text-sm text-muted">Founder pipeline</p>
              </div>
            </div>

            <h1 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[2.6rem]">
              The work in front of you, without the noise.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-[0.95rem]">
              A calm operational read on who needs attention, where the pipeline
              is warming up, and what moved recently.
            </p>
          </div>

          <div className="border-l border-border/70 pl-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Today&apos;s read
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              {attentionLeads.length > 0
                ? `${attentionLeads.length} lead${
                    attentionLeads.length === 1 ? "" : "s"
                  } need a human follow-up.`
                : "No lead is asking for immediate attention."}
            </p>
            <Link
              href="/leads"
              className="focus-ring mt-5 inline-flex h-10 items-center justify-center rounded-md border border-white/80 bg-ink px-4 text-sm font-medium text-black transition duration-200 hover:bg-white active:scale-[0.99]"
            >
              Open leads
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <article
            key={card.label}
            className="quiet-panel subtle-card motion-rise rounded-lg p-4"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
              {card.label}
            </p>
            <p className="mt-4 text-3xl font-semibold tabular-nums text-ink">
              {card.value}
            </p>
            <p className="mt-3 min-h-10 text-sm leading-5 text-muted">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.9fr)]">
        <PipelineOverview leads={leads} totalPipeline={totalPipeline} />
        <RecentActivity activities={recentActivities} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Recent leads
            </p>
            <h2 className="mt-1 text-sm font-medium text-ink">People closest to motion</h2>
          </div>
          <Link
            href="/leads"
            className="focus-ring rounded-md text-sm text-muted transition duration-200 hover:text-ink"
          >
            View all
          </Link>
        </div>

        {recentLeads.length > 0 ? (
          <LeadList leads={recentLeads} />
        ) : (
          <EmptyState
            title="No leads yet"
            body="The overview gets more useful once the first conversation enters the pipeline."
          />
        )}
      </section>
    </div>
  );
}

function PipelineOverview({
  leads,
  totalPipeline,
}: {
  leads: Lead[];
  totalPipeline: number;
}) {
  return (
    <section className="quiet-panel overflow-hidden rounded-lg">
      <div className="border-b border-border/60 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Pipeline overview
            </p>
            <h2 className="mt-2 text-base font-medium text-ink">
              Where conversations sit
            </h2>
          </div>
          <p className="text-sm text-muted">{leads.length} total leads</p>
        </div>
      </div>

      {leads.length > 0 ? (
        <div className="space-y-4 p-5 sm:p-6">
          {statuses.map((status, index) => {
            const count = leads.filter((lead) => lead.status === status).length;
            const width = Math.max((count / totalPipeline) * 100, count > 0 ? 7 : 0);

            return (
              <div key={status} className="group">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatusPill status={status} />
                    <span className="hidden text-sm text-muted sm:inline">
                      {statusCopy[status]}
                    </span>
                  </div>
                  <span className="text-sm tabular-nums text-muted">{count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full border border-border/65 bg-surface/70">
                  <div
                    className="pipeline-bar h-full rounded-full bg-gradient-to-r from-accent/55 via-white/45 to-accent/25 shadow-[0_0_22px_rgb(var(--accent)/0.15)]"
                    style={{
                      width: `${width}%`,
                      animationDelay: `${index * 90}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="The pipeline is clear"
          body="Create a lead and bob will start shaping the overview around real movement."
        />
      )}
    </section>
  );
}

function RecentActivity({ activities }: { activities: ActivityWithLead[] }) {
  return (
    <section className="quiet-panel rounded-lg p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
        Recent activity
      </p>
      <h2 className="mt-2 text-base font-medium text-ink">What changed</h2>

      {activities.length > 0 ? (
        <div className="mt-5 space-y-5">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-5">
              <div className="absolute left-0 top-1.5 size-2 rounded-full bg-accent/85 ring-4 ring-accent/[0.08]" />
              {index < activities.length - 1 ? (
                <div className="absolute bottom-[-1.25rem] left-[3px] top-4 w-px bg-border/75" />
              ) : null}
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-ink">
                    {formatActivityType(activity.type)}
                  </p>
                  <p className="shrink-0 text-xs text-faint">
                    {formatLeadDate(activity.createdAt)}
                  </p>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted">
                  {activity.leadCompany || activity.leadName}
                </p>
                <p className="mt-1 text-sm leading-5 text-faint">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No movement recorded"
          body="Status changes and notes will collect here once the pipeline starts breathing."
          compact
        />
      )}
    </section>
  );
}

function EmptyState({
  title,
  body,
  compact = false,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-dashed border-border/70 bg-elevated/[0.18] text-center ${
        compact ? "mt-5 p-6" : "p-8 sm:p-10"
      }`}
    >
      <div className="mx-auto flex size-9 items-center justify-center rounded-md border border-border/65 bg-panel/70 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]">
        <span className="size-1.5 rounded-full bg-accent/80" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
