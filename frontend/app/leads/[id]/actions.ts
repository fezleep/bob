"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import {
  addLeadNote,
  statuses,
  changeLeadStatus,
  updateLead,
  type LeadStatus,
} from "@/lib/leads";
import type {
  LeadNoteFormState,
  LeadStatusFormState,
  LeadUpdateFormState,
} from "@/app/leads/[id]/form-state";

const updateFieldNames = new Set(["name", "email", "company", "status"]);
const statusFieldNames = new Set(["status"]);
const noteFieldNames = new Set(["content"]);

function resolveLeadStatus(value: FormDataEntryValue | null) {
  return statuses.includes(value as LeadStatus) ? (value as LeadStatus) : null;
}

export async function updateLeadAction(
  _previousState: LeadUpdateFormState,
  formData: FormData
): Promise<LeadUpdateFormState> {
  const leadId = String(formData.get("leadId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const status = resolveLeadStatus(formData.get("status"));
  const fields = { leadId, name, email, company, status };
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
    const lead = await updateLead(leadId, {
      name,
      email: email || null,
      company: company || null,
      status,
    });

    revalidatePath(`/leads/${leadId}`);

    return {
      fields: {
        leadId,
        name: lead.name,
        email: lead.email ?? "",
        company: lead.company ?? "",
        status: lead.status,
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
    const lead = await changeLeadStatus(leadId, status);

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
    await addLeadNote(leadId, content);

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
