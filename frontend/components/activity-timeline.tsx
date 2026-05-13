import { formatActivityType, formatLeadDate, type LeadActivity } from "@/lib/leads";

export function ActivityTimeline({
  activities,
}: {
  activities: LeadActivity[];
}) {
  return (
    <section className="quiet-panel rounded-lg p-5 sm:p-6">
      <h2 className="text-sm font-medium text-ink">Activity</h2>

      {activities.length > 0 ? (
        <div className="mt-5 space-y-5">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-5">
              <div className="absolute left-0 top-1.5 size-2 rounded-full bg-accent/85 ring-4 ring-accent/[0.08]" />
              {index < activities.length - 1 ? (
                <div className="absolute bottom-[-1.25rem] left-[3px] top-4 w-px bg-border/80" />
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {formatActivityType(activity.type)}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-muted">
                    {activity.description}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-faint">
                  {formatLeadDate(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-border/70 bg-elevated/[0.18] p-8 text-center">
          <div className="mx-auto size-8 rounded-md border border-border/65 bg-panel/70 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]" />
          <h3 className="mt-4 text-sm font-medium text-ink">No activity yet</h3>
          <p className="mt-2 text-sm text-muted">Status changes will appear here.</p>
        </div>
      )}
    </section>
  );
}
