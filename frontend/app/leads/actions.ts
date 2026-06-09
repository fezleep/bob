"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import type { CreateLeadFormState } from "@/app/leads/form-state";
import { createLead, statuses, type LeadStatus } from "@/lib/leads";
import { requireAuthToken } from "@/lib/server-auth";

const fieldNames = new Set(["name", "email", "company", "status", "nextFollowUpAt"]);

function resolveDateTimeLocal(value: string, timezoneOffsetValue: string) {
  if (!value) {
    return null;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) {
    return undefined;
  }

  const [, year, month, day, hour, minute, second = "0"] = match;
  const timezoneOffset = Number(timezoneOffsetValue);

  if (!Number.isFinite(timezoneOffset)) {
    return undefined;
  }

  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    ) +
      timezoneOffset * 60_000
  );

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export async function createLeadAction(
  _previousState: CreateLeadFormState,
  formData: FormData
): Promise<CreateLeadFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const statusValue = String(formData.get("status") || "NEW");
  const nextFollowUpAtValue = String(formData.get("nextFollowUpAt") || "").trim();
  const timezoneOffset = String(formData.get("timezoneOffset") || "").trim();
  const status = statuses.includes(statusValue as LeadStatus)
    ? (statusValue as LeadStatus)
    : "NEW";
  const nextFollowUpAt = resolveDateTimeLocal(nextFollowUpAtValue, timezoneOffset);

  const fields = { name, email, company, status, nextFollowUpAt: nextFollowUpAtValue };
  const errors: CreateLeadFormState["errors"] = {};

  if (!name) {
    errors.name = "Name is required.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (nextFollowUpAt === undefined) {
    errors.nextFollowUpAt = "Enter a valid follow-up date.";
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
    const authToken = await requireAuthToken();
    const lead = await createLead({
      name,
      email: email || null,
      company: company || null,
      status,
      nextFollowUpAt,
    }, authToken);
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
