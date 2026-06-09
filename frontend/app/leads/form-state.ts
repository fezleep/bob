import type { LeadStatus } from "@/lib/leads";

export type CreateLeadFormState = {
  fields: {
    name?: string;
    email?: string;
    company?: string;
    status: LeadStatus;
    nextFollowUpAt?: string;
  };
  errors: Partial<
    Record<"name" | "email" | "company" | "status" | "nextFollowUpAt", string>
  >;
  message?: string;
};

export const initialCreateLeadFormState: CreateLeadFormState = {
  fields: {
    status: "NEW",
  },
  errors: {},
};
