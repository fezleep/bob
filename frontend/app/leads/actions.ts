"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import type { CreateLeadFormState } from "@/app/leads/form-state";
import { createLead, statuses, type LeadStatus } from "@/lib/leads";

const fieldNames = new Set(["name", "email", "company", "status"]);

export async function createLeadAction(
  _previousState: CreateLeadFormState,
  formData: FormData
): Promise<CreateLeadFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const statusValue = String(formData.get("status") || "NEW");
  const status = statuses.includes(statusValue as LeadStatus)
    ? (statusValue as LeadStatus)
    : "NEW";

  const fields = { name, email, company, status };
  const errors: CreateLeadFormState["errors"] = {};

  if (!name) {
    errors.name = "Name is required.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      fields,
      errors,
      message: "Fix the highlighted fields.",
    };
  }

  let leadId: string;

  try {
    const lead = await createLead({
      name,
      email: email || null,
      company: company || null,
      status,
    });
    leadId = lead.id;
  } catch (error) {
    if (error instanceof ApiError) {
      const apiErrors: CreateLeadFormState["errors"] = {};

      for (const fieldError of error.fields) {
        if (fieldNames.has(fieldError.field)) {
          apiErrors[fieldError.field as keyof CreateLeadFormState["errors"]] =
            fieldError.message;
        }
      }

      return {
        fields,
        errors: apiErrors,
        message: error.message,
      };
    }

    return {
      fields,
      errors: {},
      message: "Unable to create the lead right now.",
    };
  }

  redirect(`/leads/${leadId}`);
}
