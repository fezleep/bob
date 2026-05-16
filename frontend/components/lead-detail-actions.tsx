"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  addLeadNoteAction,
  changeLeadStatusAction,
  updateLeadAction,
} from "@/app/leads/[id]/actions";
import {
  createInitialLeadNoteFormState,
  createInitialLeadStatusFormState,
  createInitialLeadUpdateFormState,
} from "@/app/leads/[id]/form-state";
import { formatLeadStatus, statuses, type LeadStatus } from "@/lib/leads";

type LeadDetailActionsProps = {
  lead: {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    status: LeadStatus;
  };
};

export function LeadDetailActions({ lead }: LeadDetailActionsProps) {
  const router = useRouter();
  const noteFormRef = useRef<HTMLFormElement>(null);

  const [updateState, updateFormAction] = useActionState(
    updateLeadAction,
    createInitialLeadUpdateFormState({
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      status: lead.status,
    })
  );
  const [statusState, statusFormAction] = useActionState(
    changeLeadStatusAction,
    createInitialLeadStatusFormState({
      leadId: lead.id,
      status: lead.status,
    })
  );
  const [noteState, noteFormAction] = useActionState(
    addLeadNoteAction,
    createInitialLeadNoteFormState(lead.id)
  );

  useEffect(() => {
    if (updateState.success || statusState.success || noteState.success) {
      router.refresh();
    }
  }, [noteState.success, router, statusState.success, updateState.success]);

  useEffect(() => {
    if (noteState.success) {
      noteFormRef.current?.reset();
    }
  }, [noteState.success]);

  return (
    <section className="quiet-panel rounded-lg p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Actions
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Operate the lead</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Keep updates deliberate. Save profile changes, move status, or add the
            next useful note without leaving the page.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <form
          action={updateFormAction}
          className="rounded-lg border border-border/50 bg-elevated/[0.22] p-4 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]"
        >
          <input type="hidden" name="leadId" value={lead.id} />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Edit details</p>
            <InlineMessage message={updateState.message} success={updateState.success} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FormField
              label="Name"
              name="name"
              autoComplete="name"
              defaultValue={updateState.fields.name}
              error={updateState.errors.name}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={updateState.fields.email}
              error={updateState.errors.email}
            />
            <FormField
              label="Company"
              name="company"
              autoComplete="organization"
              defaultValue={updateState.fields.company}
              error={updateState.errors.company}
            />
            <SelectField
              label="Status"
              name="status"
              idSuffix="edit"
              defaultValue={updateState.fields.status}
              error={updateState.errors.status}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <SubmitButton idleLabel="Save details" pendingLabel="Saving..." />
          </div>
        </form>

        <form
          action={statusFormAction}
          className="rounded-lg border border-border/50 bg-elevated/[0.18] p-4 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]"
        >
          <input type="hidden" name="leadId" value={lead.id} />
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Quick status change</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Move the lead without reopening the full edit form.
              </p>
            </div>
            <InlineMessage message={statusState.message} success={statusState.success} />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <SelectField
                label="Status"
                name="status"
                idSuffix="quick"
                defaultValue={statusState.fields.status}
                error={statusState.errors.status}
              />
            </div>
            <div className="sm:pt-6">
              <SubmitButton idleLabel="Update status" pendingLabel="Updating..." />
            </div>
          </div>
        </form>

        <details className="group rounded-lg border border-border/50 bg-elevated/[0.16] p-4 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Add note</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Capture the next useful piece of context.
              </p>
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-faint transition duration-200 group-open:text-muted">
              Expand
            </span>
          </summary>

          <form ref={noteFormRef} action={noteFormAction} className="mt-4">
            <input type="hidden" name="leadId" value={lead.id} />
            <div>
              <label htmlFor="lead-note-content" className="text-xs font-medium text-muted">
                Note
              </label>
              <textarea
                id="lead-note-content"
                name="content"
                rows={4}
                defaultValue={noteState.fields.content}
                aria-invalid={Boolean(noteState.errors.content)}
                aria-describedby={
                  noteState.errors.content ? "lead-note-content-error" : undefined
                }
                className={[
                  "focus-ring mt-2 w-full rounded-md border bg-elevated/70 px-3 py-2.5 text-sm leading-6 text-ink transition duration-200 placeholder:text-faint hover:border-border",
                  noteState.errors.content
                    ? "border-red-400/55 focus-visible:border-red-300 focus-visible:shadow-[0_0_0_1px_rgb(252_165_165/0.22),0_0_0_4px_rgb(248_113_113/0.1)]"
                    : "border-border/75",
                ].join(" ")}
                placeholder="Add a concise note about the last conversation, risk, or next move."
              />
              {noteState.errors.content ? (
                <p id="lead-note-content-error" className="mt-2 text-xs text-red-300">
                  {noteState.errors.content}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <InlineMessage message={noteState.message} success={noteState.success} />
              <SubmitButton idleLabel="Save note" pendingLabel="Saving..." />
            </div>
          </form>
        </details>
      </div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  name: "name" | "email" | "company";
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
};

function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  error,
  required,
}: FormFieldProps) {
  const inputId = `lead-action-${name}`;

  return (
    <div>
      <label htmlFor={inputId} className="text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={[
          "focus-ring mt-2 h-10 w-full rounded-md border bg-elevated/70 px-3 text-sm text-ink transition duration-200 placeholder:text-faint hover:border-border",
          error
            ? "border-red-400/55 focus-visible:border-red-300 focus-visible:shadow-[0_0_0_1px_rgb(252_165_165/0.22),0_0_0_4px_rgb(248_113_113/0.1)]"
            : "border-border/75",
        ].join(" ")}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  idSuffix,
  defaultValue,
  error,
}: {
  label: string;
  name: "status";
  idSuffix: string;
  defaultValue: LeadStatus;
  error?: string;
}) {
  const inputId = `lead-action-${name}-${idSuffix}`;

  return (
    <div>
      <label htmlFor={inputId} className="text-xs font-medium text-muted">
        {label}
      </label>
      <select
        id={inputId}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={[
          "focus-ring mt-2 h-10 w-full rounded-md border bg-elevated/70 px-3 text-sm text-ink transition duration-200 hover:border-border",
          error
            ? "border-red-400/55 focus-visible:border-red-300 focus-visible:shadow-[0_0_0_1px_rgb(252_165_165/0.22),0_0_0_4px_rgb(248_113_113/0.1)]"
            : "border-border/75",
        ].join(" ")}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {formatLeadStatus(status)}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${inputId}-error`} className="mt-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function InlineMessage({
  message,
  success,
}: {
  message?: string;
  success?: boolean;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className={success ? "text-xs text-emerald-200" : "text-xs text-red-300"}>
      {message}
    </p>
  );
}

function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring h-10 rounded-md border border-accent/32 bg-accent/[0.14] px-3 text-sm font-medium text-ink transition duration-200 hover:border-accent/45 hover:bg-accent/[0.19] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
