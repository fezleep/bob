"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { generateLeadInsightAction } from "@/app/leads/[id]/actions";
import { createInitialLeadInsightFormState } from "@/app/leads/[id]/form-state";
import { formatLeadDate, type LeadInsight } from "@/lib/leads";

export function LeadInsightSection({
  leadId,
  insight,
}: {
  leadId: string;
  insight: LeadInsight;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    generateLeadInsightAction,
    createInitialLeadInsightFormState(leadId)
  );
  const hasInsight = Boolean(insight.summary && insight.statusRead && insight.nextAction);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <section className="quiet-panel rounded-lg p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Bob read
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Lead summary and next move
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            A short operational read from the lead profile, notes, and recent activity.
          </p>
        </div>

        <form action={formAction} className="shrink-0">
          <input type="hidden" name="leadId" value={leadId} />
          <GenerateButton
            disabled={!insight.aiAvailable}
            label={hasInsight ? "Regenerate" : "Generate Bob read"}
          />
        </form>
      </div>

      {hasInsight ? (
        <div className="mt-6 space-y-3">
          <InsightRow label="Summary" value={insight.summary} />
          <InsightRow label="Operational read" value={insight.statusRead} />
          <InsightRow label="Next action" value={insight.nextAction} emphasis />
          {insight.attention ? (
            <InsightRow label="Attention" value={insight.attention} attention />
          ) : null}
          {insight.generatedAt ? (
            <p className="pt-1 text-xs text-faint">
              Generated {formatLeadDate(insight.generatedAt)}
              {insight.model ? ` with ${insight.model}` : ""}
            </p>
          ) : null}
          {!insight.aiAvailable ? (
            <p className="text-xs leading-5 text-faint">{insight.message}</p>
          ) : null}
        </div>
      ) : !insight.aiAvailable ? (
        <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-elevated/[0.14] p-5">
          <p className="text-sm font-medium text-ink">AI is unavailable</p>
          <p className="mt-2 text-sm leading-6 text-muted">{insight.message}</p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-elevated/[0.14] p-5">
          <p className="text-sm font-medium text-ink">No Bob read yet</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Generate one when the lead has enough context to make the next action clearer.
          </p>
        </div>
      )}

      {state.message ? (
        <p className={state.success ? "mt-4 text-xs text-emerald-200" : "mt-4 text-xs text-red-300"}>
          {state.message}
        </p>
      ) : null}
    </section>
  );
}

function InsightRow({
  label,
  value,
  emphasis,
  attention,
}: {
  label: string;
  value: string | null;
  emphasis?: boolean;
  attention?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border p-4 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]",
        attention
          ? "border-amber-300/25 bg-amber-300/[0.07]"
          : "border-border/45 bg-elevated/[0.22]",
      ].join(" ")}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p
        className={[
          "mt-2 text-sm leading-6",
          emphasis ? "font-medium text-ink" : "text-muted",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function GenerateButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="focus-ring h-10 w-full rounded-md border border-accent/32 bg-accent/[0.14] px-3 text-sm font-medium text-ink transition duration-200 hover:border-accent/45 hover:bg-accent/[0.19] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 sm:w-auto"
    >
      {pending ? "Reading..." : label}
    </button>
  );
}
