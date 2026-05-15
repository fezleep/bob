import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/activity-timeline";
import { NotesSection } from "@/components/notes-section";
import { StatusPill } from "@/components/status-pill";
import { ApiError } from "@/lib/api";
import {
  formatActivityType,
  formatLeadDate,
  formatLeadStatus,
  getLeadDetail,
  type LeadDetail,
} from "@/lib/leads";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

function daysSince(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();

  return Math.max(0, Math.floor(elapsed / 86_400_000));
}

function getMomentumRead(lead: LeadDetail) {
  const lastActivityAt = lead.activities[0]?.createdAt ?? lead.updatedAt;
  const quietDays = daysSince(lastActivityAt);

  if (lead.activities.length >= 3 || lead.notes.length >= 2) {
    return "recent momentum";
  }

  if (quietDays <= 1) {
    return "last meaningful movement yesterday";
  }

  if (quietDays >= 4) {
    return "quiet since monday";
  }

  return "conversation warming up";
}

function getNextBestRead(lead: LeadDetail) {
  if (lead.notes.length === 0) {
    return "No internal note has anchored the story yet.";
  }

  if (daysSince(lead.updatedAt) >= 4) {
    return "The account is calm enough for a deliberate follow-up.";
  }

  return "Context is fresh. Keep the next step precise.";
}

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

  const primaryName = lead.company || lead.name;
  const momentumRead = getMomentumRead(lead);
  const lastMovementAt = lead.activities[0]?.createdAt ?? lead.updatedAt;
  const latestActivity = lead.activities[0];
  const latestNote = lead.notes[0];
  const signalStats = [
    {
      label: "Status",
      value: formatLeadStatus(lead.status),
      helper: momentumRead,
    },
    {
      label: "Last movement",
      value: formatLeadDate(lastMovementAt),
      helper: latestActivity
        ? formatActivityType(latestActivity.type)
        : "Profile updated",
    },
    {
      label: "Notes",
      value: String(lead.notes.length),
      helper: lead.notes.length === 1 ? "one context marker" : "context markers",
    },
  ];

  return (
    <div className="space-y-8">
      <Link
        href="/leads"
        className="focus-ring inline-flex rounded-md text-sm text-muted transition duration-200 hover:text-ink"
      >
        Back to leads
      </Link>

      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_30px_90px_rgb(0_0_0/0.26)] sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgb(var(--accent)/0.13),transparent_18rem),radial-gradient(circle_at_86%_0%,rgb(255_255_255/0.06),transparent_20rem)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill status={lead.status} />
              <span className="rounded-full border border-accent/20 bg-accent/[0.07] px-2.5 py-1 text-xs font-medium text-muted shadow-[0_1px_0_rgb(255_255_255/0.03)_inset]">
                {momentumRead}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[2.65rem]">
              {primaryName}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-[0.95rem]">
              {lead.name}
              {lead.email ? ` - ${lead.email}` : ""}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {signalStats.map((stat) => (
                <DetailStat
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  helper={stat.helper}
                />
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-white/[0.07] bg-black/[0.18] p-4 shadow-[0_1px_0_rgb(255_255_255/0.03)_inset] backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Operational read
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              {getNextBestRead(lead)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <DetailStat label="Created" value={formatLeadDate(lead.createdAt)} />
              <DetailStat label="Updated" value={formatLeadDate(lead.updatedAt)} />
            </div>
          </aside>
        </div>
      </section>

      {latestNote || latestActivity ? (
        <section className="grid gap-3 md:grid-cols-2">
          {latestNote ? (
            <ContextPreview
              label="Latest note"
              title={formatLeadDate(latestNote.createdAt)}
              body={latestNote.content}
            />
          ) : null}
          {latestActivity ? (
            <ContextPreview
              label="Latest movement"
              title={formatActivityType(latestActivity.type)}
              body={latestActivity.description}
            />
          ) : null}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <NotesSection notes={lead.notes} momentumRead={momentumRead} />
        <ActivityTimeline activities={lead.activities} momentumRead={momentumRead} />
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-elevated/[0.32] p-3 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] transition duration-200 hover:border-white/[0.1] hover:bg-elevated/[0.46]">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-4 text-faint">{helper}</p> : null}
    </div>
  );
}

function ContextPreview({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <article className="group rounded-lg border border-border/45 bg-panel/52 p-4 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] transition duration-200 hover:border-border/75 hover:bg-elevated/[0.34]">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium text-ink">{title}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted transition duration-200 group-hover:text-ink/80">
        {body}
      </p>
    </article>
  );
}
