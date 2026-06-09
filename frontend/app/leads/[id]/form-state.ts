import type { LeadStatus } from "@/lib/leads";

export type LeadUpdateFormState = {
  fields: {
    leadId: string;
    name: string;
    email: string;
    company: string;
    status: LeadStatus;
    nextFollowUpAt: string;
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

export type LeadFollowUpFormState = {
  fields: {
    leadId: string;
    name: string;
    email: string;
    company: string;
    status: LeadStatus;
    nextFollowUpAt: string;
    timezoneOffset: string;
  };
  errors: Partial<Record<"nextFollowUpAt", string>>;
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

export type LeadInsightFormState = {
  fields: {
    leadId: string;
  };
  message?: string;
  success?: boolean;
};

export function createInitialLeadUpdateFormState(input: {
  leadId: string;
  name: string;
  email: string | null;
  company: string | null;
  status: LeadStatus;
  nextFollowUpAt?: string | null;
}): LeadUpdateFormState {
  return {
    fields: {
      leadId: input.leadId,
      name: input.name,
      email: input.email ?? "",
      company: input.company ?? "",
      status: input.status,
      nextFollowUpAt: input.nextFollowUpAt ?? "",
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

export function createInitialLeadFollowUpFormState(input: {
  leadId: string;
  name: string;
  email: string | null;
  company: string | null;
  status: LeadStatus;
  nextFollowUpAt: string | null;
}): LeadFollowUpFormState {
  return {
    fields: {
      leadId: input.leadId,
      name: input.name,
      email: input.email ?? "",
      company: input.company ?? "",
      status: input.status,
      nextFollowUpAt: input.nextFollowUpAt
        ? formatDateTimeLocalValue(input.nextFollowUpAt)
        : "",
      timezoneOffset: "",
    },
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

export function createInitialLeadInsightFormState(leadId: string): LeadInsightFormState {
  return {
    fields: {
      leadId,
    },
  };
}

function formatDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return offsetDate.toISOString().slice(0, 16);
}
