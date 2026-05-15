import { apiFetch } from "@/lib/api";

export const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "LOST"] as const;

export type LeadStatus = (typeof statuses)[number];

export type LeadNote = {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
};

export type LeadActivityType = "LEAD_CREATED" | "STATUS_CHANGED" | "NOTE_ADDED";

export type LeadActivity = {
  id: string;
  leadId: string;
  type: LeadActivityType;
  description: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

type LeadListResponse = {
  leads: Lead[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type GetLeadsOptions = {
  page?: number;
  size?: number;
  sort?: "createdAt" | "updatedAt" | "name" | "status" | "company";
  direction?: "asc" | "desc";
  status?: LeadStatus;
};

export type LeadDetail = Lead & {
  notes: LeadNote[];
  activities: LeadActivity[];
};

export type CreateLeadInput = {
  name: string;
  email?: string | null;
  company?: string | null;
  status: LeadStatus;
};

export async function getLeads(options: GetLeadsOptions = {}) {
  const params = new URLSearchParams();

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  const query = params.size > 0 ? `?${params.toString()}` : "";

  return apiFetch<LeadListResponse>(`/api/leads${query}`);
}

export async function getAllLeads(options: Omit<GetLeadsOptions, "page" | "size"> = {}) {
  const firstPage = await getLeads({ ...options, page: 0, size: 100 });

  if (firstPage.totalPages <= 1) {
    return firstPage.leads;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getLeads({ ...options, page: index + 1, size: 100 })
    )
  );

  return [
    ...firstPage.leads,
    ...remainingPages.flatMap((page) => page.leads),
  ];
}

export async function createLead(input: CreateLeadInput) {
  return apiFetch<Lead>("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function getLeadById(id: string) {
  return apiFetch<Lead>(`/api/leads/${id}`);
}

export async function getLeadDetail(id: string): Promise<LeadDetail> {
  const [lead, notes, activities] = await Promise.all([
    getLeadById(id),
    apiFetch<LeadNote[]>(`/api/leads/${id}/notes`),
    apiFetch<LeadActivity[]>(`/api/leads/${id}/activities`),
  ]);

  return {
    ...lead,
    notes,
    activities,
  };
}

export async function getLeadActivities(id: string) {
  return apiFetch<LeadActivity[]>(`/api/leads/${id}/activities`);
}

export function formatLeadStatus(status: LeadStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatActivityType(type: LeadActivityType) {
  const labels: Record<LeadActivityType, string> = {
    LEAD_CREATED: "Conversation opened",
    STATUS_CHANGED: "Status shifted",
    NOTE_ADDED: "Note captured",
  };

  return labels[type];
}

export function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getHourPeriod(date: Date) {
  const hour = date.getHours();

  if (hour < 12) {
    return "this morning";
  }

  if (hour < 18) {
    return "this afternoon";
  }

  return "this evening";
}

function formatRelativeAmount(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

export function formatTemporalPhrase(value: string, now = new Date()) {
  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return "movement recorded";
  }

  const elapsedMs = Math.max(0, now.getTime() - timestamp);
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  const elapsedHours = Math.floor(elapsedMs / 3_600_000);
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  if (elapsedMinutes < 8) {
    return "updated recently";
  }

  if (elapsedHours < 1) {
    return "last movement within the hour";
  }

  if (elapsedHours < 6) {
    return `last movement ${formatRelativeAmount(elapsedHours, "hour")}`;
  }

  if (elapsedDays < 1) {
    return `active ${getHourPeriod(date)}`;
  }

  if (elapsedDays === 1) {
    return "last movement yesterday";
  }

  if (elapsedDays < 7) {
    return `last movement ${formatRelativeAmount(elapsedDays, "day")}`;
  }

  return `quiet since ${formatLeadDate(value)}`;
}

export function formatQuietTemporalPhrase(value: string, now = new Date()) {
  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return "quiet for now";
  }

  const elapsedMs = Math.max(0, now.getTime() - timestamp);
  const elapsedHours = Math.floor(elapsedMs / 3_600_000);
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  if (elapsedHours < 1) {
    return "updated recently";
  }

  if (elapsedDays < 1) {
    return `quiet ${getHourPeriod(now)}`;
  }

  if (elapsedDays < 7) {
    return `quiet for ${elapsedDays} day${elapsedDays === 1 ? "" : "s"}`;
  }

  return `quiet since ${formatLeadDate(value)}`;
}

export function formatCurrentQuietPhrase(now = new Date()) {
  return `quiet ${getHourPeriod(now)}`;
}

export function formatCurrentPeriod(now = new Date()) {
  return getHourPeriod(now);
}

export function formatActivityDescription(activity: LeadActivity) {
  if (activity.type === "LEAD_CREATED") {
    return "A new conversation entered the room.";
  }

  if (activity.type === "NOTE_ADDED") {
    return "Context was added for the next move.";
  }

  if (activity.type === "STATUS_CHANGED") {
    return activity.description
      .replace("Status changed from", "Moved from")
      .replace(" to ", " into ");
  }

  return activity.description;
}
