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

export type LeadInsight = {
  aiAvailable: boolean;
  message: string;
  id: string | null;
  leadId: string | null;
  summary: string | null;
  statusRead: string | null;
  nextAction: string | null;
  attention: string | null;
  model: string | null;
  generatedAt: string | null;
  cached: boolean;
  cachedAt: string | null;
};

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: LeadStatus;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadAttentionSignal =
  | "OVERDUE_FOLLOW_UP"
  | "DUE_TODAY"
  | "STALE";

export type LeadAttentionItem = {
  id: string;
  name: string;
  company: string | null;
  status: LeadStatus;
  signal: LeadAttentionSignal;
  nextFollowUpAt: string;
  relevantAt: string;
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
  authToken?: string;
};

export type LeadDetail = Lead & {
  notes: LeadNote[];
  activities: LeadActivity[];
  insight: LeadInsight;
};

export type CreateLeadInput = {
  name: string;
  email?: string | null;
  company?: string | null;
  status: LeadStatus;
  nextFollowUpAt?: string | null;
};

export type UpdateLeadInput = {
  name: string;
  email?: string | null;
  company?: string | null;
  status: LeadStatus;
  nextFollowUpAt?: string | null;
};

export async function getLeads(options: GetLeadsOptions = {}) {
  const params = new URLSearchParams();
  const { authToken, ...queryOptions } = options;

  Object.entries(queryOptions).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  const query = params.size > 0 ? `?${params.toString()}` : "";

  return apiFetch<LeadListResponse>(`/api/leads${query}`, { authToken });
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

export async function createLead(input: CreateLeadInput, authToken?: string) {
  return apiFetch<Lead>("/api/leads", {
    method: "POST",
    authToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function updateLead(id: string, input: UpdateLeadInput, authToken?: string) {
  return apiFetch<Lead>(`/api/leads/${id}`, {
    method: "PUT",
    authToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function getLeadById(id: string, authToken?: string) {
  return apiFetch<Lead>(`/api/leads/${id}`, { authToken });
}

export async function getLeadAttentionQueue(authToken?: string) {
  return apiFetch<LeadAttentionItem[]>("/api/leads/attention", { authToken });
}

export async function getLeadDetail(id: string, authToken?: string): Promise<LeadDetail> {
  const [lead, notes, activities, insight] = await Promise.all([
    getLeadById(id, authToken),
    apiFetch<LeadNote[]>(`/api/leads/${id}/notes`, { authToken }),
    apiFetch<LeadActivity[]>(`/api/leads/${id}/activities`, { authToken }),
    apiFetch<LeadInsight>(`/api/leads/${id}/insights`, { authToken }),
  ]);

  return {
    ...lead,
    notes,
    activities,
    insight,
  };
}

export async function changeLeadStatus(id: string, status: LeadStatus, authToken?: string) {
  return apiFetch<Lead>(`/api/leads/${id}/status`, {
    method: "PATCH",
    authToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

export async function addLeadNote(id: string, content: string, authToken?: string) {
  return apiFetch<LeadNote>(`/api/leads/${id}/notes`, {
    method: "POST",
    authToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
}

export async function getLeadActivities(id: string, authToken?: string) {
  return apiFetch<LeadActivity[]>(`/api/leads/${id}/activities`, { authToken });
}

export async function generateLeadInsight(
  id: string,
  authToken?: string,
  options: { force?: boolean } = {}
) {
  const query = options.force ? "?force=true" : "";

  return apiFetch<LeadInsight>(`/api/leads/${id}/insights/generate${query}`, {
    method: "POST",
    authToken,
  });
}

function titleizeEnum(value: string | null | undefined, fallback = "Unknown") {
  if (!value) {
    return fallback;
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatLeadStatus(status: LeadStatus | null | undefined) {
  return titleizeEnum(status);
}

export function formatActivityType(type: LeadActivityType | null | undefined) {
  return titleizeEnum(type);
}

export function formatLeadAttentionSignal(
  signal: LeadAttentionSignal | null | undefined
) {
  switch (signal) {
    case "OVERDUE_FOLLOW_UP":
      return "Overdue";
    case "DUE_TODAY":
      return "Due today";
    case "STALE":
      return "Stale";
    default:
      return titleizeEnum(signal);
  }
}

export type LeadFollowUpState = "OVERDUE" | "DUE_TODAY" | "SCHEDULED" | "NONE";

export function getLeadFollowUpState(
  nextFollowUpAt: string | null | undefined,
  now = new Date()
): LeadFollowUpState {
  if (!nextFollowUpAt) {
    return "NONE";
  }

  const followUpAt = new Date(nextFollowUpAt);

  if (followUpAt.getTime() < now.getTime()) {
    return "OVERDUE";
  }

  if (followUpAt.toDateString() === now.toDateString()) {
    return "DUE_TODAY";
  }

  return "SCHEDULED";
}

export function formatLeadFollowUpState(state: LeadFollowUpState) {
  switch (state) {
    case "OVERDUE":
      return "Overdue";
    case "DUE_TODAY":
      return "Due today";
    case "SCHEDULED":
      return "Scheduled";
    case "NONE":
      return "No follow-up scheduled";
  }
}

export function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatLeadDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
