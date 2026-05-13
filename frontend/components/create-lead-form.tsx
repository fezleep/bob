"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createLeadAction } from "@/app/leads/actions";
import { initialCreateLeadFormState } from "@/app/leads/form-state";
import { formatLeadStatus, statuses } from "@/lib/leads";

export function CreateLeadForm() {
  const [state, formAction] = useActionState(
    createLeadAction,
    initialCreateLeadFormState
  );

  return (
    <form action={formAction} className="quiet-panel rounded-lg p-5">
      <div>
        <p className="text-sm font-medium text-ink">Create lead</p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Add a contact to the pipeline.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <FormField
          label="Name"
          name="name"
          autoComplete="name"
          defaultValue={state.fields.name}
          error={state.errors.name}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.fields.email}
          error={state.errors.email}
        />
        <FormField
          label="Company"
          name="company"
          autoComplete="organization"
          defaultValue={state.fields.company}
          error={state.errors.company}
        />

        <div>
          <label htmlFor="lead-status" className="text-xs font-medium text-muted">
            Status
          </label>
          <select
            id="lead-status"
            name="status"
            defaultValue={state.fields.status}
            className="mt-2 h-10 w-full rounded-md border border-border/80 bg-elevated px-3 text-sm text-ink outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/15"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatLeadStatus(status)}
              </option>
            ))}
          </select>
          {state.errors.status ? (
            <p className="mt-2 text-xs text-red-300">{state.errors.status}</p>
          ) : null}
        </div>
      </div>

      {state.message ? (
        <div className="mt-5 rounded-md border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {state.message}
        </div>
      ) : null}

      <SubmitButton />
    </form>
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
  const inputId = `lead-${name}`;

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
          "mt-2 h-10 w-full rounded-md border bg-elevated px-3 text-sm text-ink outline-none transition placeholder:text-faint focus:ring-2",
          error
            ? "border-red-400/60 focus:border-red-300 focus:ring-red-400/15"
            : "border-border/80 focus:border-accent/70 focus:ring-accent/15",
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 h-10 w-full rounded-md border border-accent/35 bg-accent/16 px-3 text-sm font-medium text-ink transition hover:bg-accent/22 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create lead"}
    </button>
  );
}
