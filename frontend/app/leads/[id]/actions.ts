"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import {
  addLeadNote,
  statuses,
  changeLeadStatus,
  generateLeadInsight,
  updateLead,
  type LeadStatus,
} from "@/lib/leads";
import { requireAuthToken } from "@/lib/server-auth";
import type {
  LeadNoteFormState,
  LeadFollowUpFormState,
  LeadInsightFormState,
  LeadStatusFormState,
  LeadUpdateFormState,
} from "@/app/leads/[id]/form-state";

const updateFieldNames = new Set([
  "name",
  "email",
  "company",
  "status",
  "nextFollowUpAt",
]);
const followUpFieldNames = new Set(["nextFollowUpAt"]);
const statusFieldNames = new Set(["status"]);
const noteFieldNames = new Set(["content"]);

function resolveLeadStatus(value: FormDataEntryValue | null) {
  return statuses.includes(value as LeadStatus) ? (value as LeadStatus) : null;
}

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

  const timestamp =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    ) +
    timezoneOffset * 60_000;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export async function updateLeadAction(
  _previousState: LeadUpdateFormState,
  formData: FormData
): Promise<LeadUpdateFormState> {
  const leadId = String(formData.get("leadId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const nextFollowUpAt = String(formData.get("nextFollowUpAt") || "").trim() || null;
  const status = resolveLeadStatus(formData.get("status"));
  const fields = { leadId, name, email, company, status, nextFollowUpAt: nextFollowUpAt ?? "" };
  const errors: LeadUpdateFormState["errors"] = {};

  if (!name) {
    errors.name = "Name is required.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!status) {
    errors.status = "Choose a valid status.";
  }

  if (Object.keys(errors).length > 0 || !status) {
    return {
      fields: {
        ...fields,
        status: status ?? "NEW",
      },
      errors,
      message: "Fix the highlighted fields.",
      success: false,
    };
  }

  try {
    const authToken = await requireAuthToken();
    const lead = await updateLead(leadId, {
      name,
      email: email || null,
      company: company || null,
      status,
      nextFollowUpAt,
    }, authToken);

    revalidatePath(`/leads/${leadId}`);

    return {
      fields: {
        leadId,
        name: lead.name,
        email: lead.email ?? "",
        company: lead.company ?? "",
        status: lead.status,
        nextFollowUpAt: lead.nextFollowUpAt ?? "",
      },
      errors: {},
      message: "Lead saved.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const apiErrors: LeadUpdateFormState["errors"] = {};

      for (const fieldError of error.fields) {
        if (updateFieldNames.has(fieldError.field)) {
          apiErrors[fieldError.field as keyof LeadUpdateFormState["errors"]] =
            fieldError.message;
        }
      }

      return {
        fields: {
          ...fields,
          status: status ?? "NEW",
        },
        errors: apiErrors,
        message: error.message,
        success: false,
      };
    }

    return {
      fields: {
        ...fields,
        status: status ?? "NEW",
      },
      errors: {},
      message: "Unable to save the lead right now.",
      success: false,
    };
  }
}

export async function updateLeadFollowUpAction(
  _previousState: LeadFollowUpFormState,
  formData: FormData
): Promise<LeadFollowUpFormState> {
  const leadId = String(formData.get("leadId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const status = resolveLeadStatus(formData.get("status"));
  const nextFollowUpAtValue = String(formData.get("nextFollowUpAt") || "").trim();
  const timezoneOffset = String(formData.get("timezoneOffset") || "").trim();
  const nextFollowUpAt = resolveDateTimeLocal(nextFollowUpAtValue, timezoneOffset);
  const fields = {
    leadId,
    name,
    email,
    company,
    status: status ?? "NEW",
    nextFollowUpAt: nextFollowUpAtValue,
    timezoneOffset,
  };

  if (!status || nextFollowUpAt === undefined) {
    return {
      fields,
      errors: nextFollowUpAt === undefined
        ? { nextFollowUpAt: "Enter a valid follow-up date." }
        : {},
      message: "Fix the highlighted fields.",
      success: false,
    };
  }

  try {
    const authToken = await requireAuthToken();
    const lead = await updateLead(leadId, {
      name,
      email: email || null,
      company: company || null,
      status,
      nextFollowUpAt,
    }, authToken);

    revalidatePath("/workspace");
    revalidatePath("/pipeline");
    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);

    return {
      fields: {
        leadId,
        name: lead.name,
        email: lead.email ?? "",
        company: lead.company ?? "",
        status: lead.status,
        nextFollowUpAt: lead.nextFollowUpAt
          ? String(formData.get("nextFollowUpAt") || "").trim()
          : "",
        timezoneOffset,
      },
      errors: {},
      message: lead.nextFollowUpAt ? "Follow-up updated." : "Follow-up cleared.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const apiErrors: LeadFollowUpFormState["errors"] = {};

      for (const fieldError of error.fields) {
        if (followUpFieldNames.has(fieldError.field)) {
          apiErrors[fieldError.field as keyof LeadFollowUpFormState["errors"]] =
            fieldError.message;
        }
      }

      return {
        fields,
        errors: apiErrors,
        message: error.message,
        success: false,
      };
    }

    return {
      fields,
      errors: {},
      message: "Unable to update the follow-up right now.",
      success: false,
    };
  }
}

export async function changeLeadStatusAction(
  _previousState: LeadStatusFormState,
  formData: FormData
): Promise<LeadStatusFormState> {
  const leadId = String(formData.get("leadId") || "").trim();
  const status = resolveLeadStatus(formData.get("status"));
  const fields = { leadId, status: status ?? "NEW" };

  if (!status) {
    return {
      fields,
      errors: {
        status: "Choose a valid status.",
      },
      message: "Fix the highlighted fields.",
      success: false,
    };
  }

  try {
    const authToken = await requireAuthToken();
    const lead = await changeLeadStatus(leadId, status, authToken);

    revalidatePath(`/leads/${leadId}`);

    return {
      fields: {
        leadId,
        status: lead.status,
      },
      errors: {},
      message: "Status updated.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const apiErrors: LeadStatusFormState["errors"] = {};

      for (const fieldError of error.fields) {
        if (statusFieldNames.has(fieldError.field)) {
          apiErrors[fieldError.field as keyof LeadStatusFormState["errors"]] =
            fieldError.message;
        }
      }

      return {
        fields,
        errors: apiErrors,
        message: error.message,
        success: false,
      };
    }

    return {
      fields,
      errors: {},
      message: "Unable to update the status right now.",
      success: false,
    };
  }
}

export async function addLeadNoteAction(
  _previousState: LeadNoteFormState,
  formData: FormData
): Promise<LeadNoteFormState> {
  const leadId = String(formData.get("leadId") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const fields = { leadId, content };
  const errors: LeadNoteFormState["errors"] = {};

  if (!content) {
    errors.content = "Add a note before saving.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      fields,
      errors,
      message: "Fix the highlighted fields.",
      success: false,
    };
  }

  try {
    const authToken = await requireAuthToken();
    await addLeadNote(leadId, content, authToken);

    revalidatePath(`/leads/${leadId}`);

    return {
      fields: {
        leadId,
        content: "",
      },
      errors: {},
      message: "Note added.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const apiErrors: LeadNoteFormState["errors"] = {};

      for (const fieldError of error.fields) {
        if (noteFieldNames.has(fieldError.field)) {
          apiErrors[fieldError.field as keyof LeadNoteFormState["errors"]] =
            fieldError.message;
        }
      }

      return {
        fields,
        errors: apiErrors,
        message: error.message,
        success: false,
      };
    }

    return {
      fields,
      errors: {},
      message: "Unable to add the note right now.",
      success: false,
    };
  }
}

export async function generateLeadInsightAction(
  _previousState: LeadInsightFormState,
  formData: FormData
): Promise<LeadInsightFormState> {
  const leadId = String(formData.get("leadId") || "").trim();
  const force = String(formData.get("force") || "").trim() === "true";

  try {
    const authToken = await requireAuthToken();
    const insight = await generateLeadInsight(leadId, authToken, { force });

    revalidatePath(`/leads/${leadId}`);

    if (!insight.aiAvailable || !insight.summary) {
      return {
        fields: { leadId, force },
        message: insight.message,
        success: false,
      };
    }

    return {
      fields: { leadId, force },
      message: insight.cached
        ? "Cached Bob read reused."
        : force
          ? "Bob read regenerated."
          : "Bob read generated.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 502) {
        return {
          fields: { leadId, force },
          message: "Bob read generation failed. Try again in a moment.",
          success: false,
        };
      }

      return {
        fields: { leadId, force },
        message: error.message,
        success: false,
      };
    }

    return {
      fields: { leadId, force },
      message: "Unable to generate a Bob read right now.",
      success: false,
    };
  }
}
