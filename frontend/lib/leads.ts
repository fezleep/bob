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

export type UpdateLeadInput = {
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

export async function updateLead(id: string, input: UpdateLeadInput) {
  return apiFetch<Lead>(`/api/leads/${id}`, {
    method: "PUT",
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

export async function changeLeadStatus(id: string, status: LeadStatus) {
  return apiFetch<Lead>(`/api/leads/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

export async function addLeadNote(id: string, content: string) {
  return apiFetch<LeadNote>(`/api/leads/${id}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
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
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
