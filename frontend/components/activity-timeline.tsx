import { formatActivityType, formatLeadDate, type LeadActivity } from "@/lib/leads";

export function ActivityTimeline({
  activities,
}: {
  activities: LeadActivity[];
}) {
  return (
    <section className="quiet-panel rounded-lg p-5">
      <h2 className="text-sm font-medium text-ink">Activity</h2>

      <div className="mt-5 space-y-5">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative pl-5">
            <div className="absolute left-0 top-1.5 size-2 rounded-full bg-accent" />
            {index < activities.length - 1 ? (
              <div className="absolute bottom-[-1.25rem] left-[3px] top-4 w-px bg-border" />
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  {formatActivityType(activity.type)}
                </p>
                <p className="mt-1 text-sm leading-5 text-muted">{activity.description}</p>
              </div>
              <p className="shrink-0 text-xs text-faint">
                {formatLeadDate(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
