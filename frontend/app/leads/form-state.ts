import type { LeadStatus } from "@/lib/leads";

export type CreateLeadFormState = {
  fields: {
    name?: string;
    email?: string;
    company?: string;
    status: LeadStatus;
  };
  errors: Partial<Record<"name" | "email" | "company" | "status", string>>;
  message?: string;
};

export const initialCreateLeadFormState: CreateLeadFormState = {
  fields: {
    status: "NEW",
  },
  errors: {},
};
