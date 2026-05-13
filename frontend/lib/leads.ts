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

export async function getLeads() {
  return apiFetch<LeadListResponse>("/api/leads");
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
