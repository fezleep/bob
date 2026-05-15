import { formatActivityType, formatLeadDate, type LeadActivity } from "@/lib/leads";

export function ActivityTimeline({
  activities,
  momentumRead,
}: {
  activities: LeadActivity[];
  momentumRead: string;
}) {
  return (
    <section className="quiet-panel rounded-lg p-5 sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
          Activity
        </p>
        <h2 className="mt-2 text-base font-medium text-ink">Movement trail</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {momentumRead}. Status changes and notes become the visible rhythm here.
        </p>
      </div>

      {activities.length > 0 ? (
        <div className="mt-6 space-y-1">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="group relative rounded-md px-2 py-3 pl-7 transition duration-200 hover:bg-elevated/[0.28]"
            >
              <div className="absolute left-2 top-5 size-2 rounded-full bg-accent/85 ring-4 ring-accent/[0.08] transition duration-200 group-hover:ring-accent/[0.14]" />
              {index < activities.length - 1 ? (
                <div className="absolute bottom-[-0.25rem] left-[11px] top-8 w-px bg-gradient-to-b from-border/80 to-border/20" />
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {formatActivityType(activity.type)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
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
        <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-elevated/[0.14] p-8 text-center">
          <div className="mx-auto size-8 rounded-md border border-border/55 bg-panel/70 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]" />
          <h3 className="mt-4 text-sm font-medium text-ink">No activity yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            The first status change or note will start the movement trail.
          </p>
        </div>
      )}
    </section>
  );
}
