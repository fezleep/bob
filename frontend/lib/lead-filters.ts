import type { Lead, LeadStatus } from "@/lib/leads";

export const leadFilterOrder = [
  "all",
  "new",
  "contacted",
  "qualified",
  "closed",
  "lost",
  "needs-attention",
  "quiet",
  "recent",
] as const;

export type LeadFilterId = (typeof leadFilterOrder)[number];

const dayInMs = 86_400_000;
const recentDays = 7;
const quietDays = 12;

const statusFilterMap: Partial<Record<LeadFilterId, LeadStatus>> = {
  new: "NEW",
  contacted: "CONTACTED",
  qualified: "QUALIFIED",
  closed: "CLOSED",
  lost: "LOST",
};

const attentionThresholds: Partial<Record<LeadStatus, number>> = {
  NEW: 2,
  CONTACTED: 4,
  QUALIFIED: 6,
};

export const leadFilterMeta: Record<
  LeadFilterId,
  { label: string; helper: string }
> = {
  all: {
    label: "All",
    helper: "Everything in the workspace.",
  },
  new: {
    label: "New",
    helper: "Fresh conversations waiting for the first move.",
  },
  contacted: {
    label: "Contacted",
    helper: "Leads already in motion.",
  },
  qualified: {
    label: "Qualified",
    helper: "Signals worth protecting.",
  },
  closed: {
    label: "Closed",
    helper: "Work that made it through.",
  },
  lost: {
    label: "Lost",
    helper: "Closed loops kept for memory.",
  },
  "needs-attention": {
    label: "Needs attention",
    helper: "Open leads that have waited longer than they should.",
  },
  quiet: {
    label: "Quiet",
    helper: "Open leads with no movement for a while.",
  },
  recent: {
    label: "Recent",
    helper: "Fresh movement in the last week.",
  },
};

function getDaysSince(value: string, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(value).getTime()) / dayInMs));
}

function isOpenLead(status: LeadStatus) {
  return status !== "CLOSED" && status !== "LOST";
}

export function isRecentLead(lead: Lead, now = Date.now()) {
  return (
    getDaysSince(lead.createdAt, now) <= recentDays ||
    getDaysSince(lead.updatedAt, now) <= recentDays
  );
}

export function isQuietLead(lead: Lead, now = Date.now()) {
  return isOpenLead(lead.status) && getDaysSince(lead.updatedAt, now) >= quietDays;
}

export function isNeedsAttentionLead(lead: Lead, now = Date.now()) {
  const threshold = attentionThresholds[lead.status];

  if (!threshold) {
    return false;
  }

  return getDaysSince(lead.updatedAt, now) >= threshold;
}

export function matchesLeadFilter(
  lead: Lead,
  filter: LeadFilterId,
  now = Date.now()
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "needs-attention") {
    return isNeedsAttentionLead(lead, now);
  }

  if (filter === "quiet") {
    return isQuietLead(lead, now);
  }

  if (filter === "recent") {
    return isRecentLead(lead, now);
  }

  return lead.status === statusFilterMap[filter];
}

export function matchesLeadSearch(lead: Lead, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [lead.name, lead.email, lead.company]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return normalizedQuery
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

export function getLeadFilterCounts(leads: Lead[], now = Date.now()) {
  return leadFilterOrder.reduce(
    (counts, filter) => ({
      ...counts,
      [filter]: leads.filter((lead) => matchesLeadFilter(lead, filter, now)).length,
    }),
    {} as Record<LeadFilterId, number>
  );
}
