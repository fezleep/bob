import type { LeadStatus } from "@/lib/leads";

export type LeadUpdateFormState = {
  fields: {
    leadId: string;
    name: string;
    email: string;
    company: string;
    status: LeadStatus;
  };
  errors: Partial<Record<"name" | "email" | "company" | "status", string>>;
  message?: string;
  success?: boolean;
};

export type LeadStatusFormState = {
  fields: {
    leadId: string;
    status: LeadStatus;
  };
  errors: Partial<Record<"status", string>>;
  message?: string;
  success?: boolean;
};

export type LeadNoteFormState = {
  fields: {
    leadId: string;
    content: string;
  };
  errors: Partial<Record<"content", string>>;
  message?: string;
  success?: boolean;
};

export function createInitialLeadUpdateFormState(input: {
  leadId: string;
  name: string;
  email: string | null;
  company: string | null;
  status: LeadStatus;
}): LeadUpdateFormState {
  return {
    fields: {
      leadId: input.leadId,
      name: input.name,
      email: input.email ?? "",
      company: input.company ?? "",
      status: input.status,
    },
    errors: {},
  };
}

export function createInitialLeadStatusFormState(input: {
  leadId: string;
  status: LeadStatus;
}): LeadStatusFormState {
  return {
    fields: input,
    errors: {},
  };
}

export function createInitialLeadNoteFormState(leadId: string): LeadNoteFormState {
  return {
    fields: {
      leadId,
      content: "",
    },
    errors: {},
  };
}
