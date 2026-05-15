"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatLeadDate,
  formatLeadStatus,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { StatusPill } from "@/components/status-pill";

const leadReads: Record<LeadStatus, string> = {
  NEW: "bob noticed something worth revisiting.",
  CONTACTED: "A conversation is open and waiting for shape.",
  QUALIFIED: "One conversation is warming up.",
  CLOSED: "This outcome is settled and kept for memory.",
  LOST: "The loop is closed, but the context remains useful.",
};

export function LeadList({ leads }: { leads: Lead[] }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!selectedLead) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedLead(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedLead]);

  return (
    <>
      <div className="quiet-panel overflow-hidden rounded-lg">
        <div className="hidden grid-cols-[1.3fr_0.8fr_0.8fr_6.5rem] border-b border-border/55 bg-elevated/[0.14] px-4 py-3 text-xs font-medium text-faint md:grid">
          <span>Conversation</span>
          <span>Status</span>
          <span className="text-right">Updated</span>
          <span className="text-right">Preview</span>
        </div>

        <div className="divide-y divide-border/50">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="grid gap-3 border border-transparent px-4 py-4 transition duration-200 hover:bg-elevated/36 hover:shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] md:grid-cols-[1.3fr_0.8fr_0.8fr_6.5rem] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3 md:block">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className="focus-ring max-w-full truncate rounded-md text-left text-sm font-medium text-ink transition duration-200 hover:text-accent"
                  >
                    {lead.company || lead.name}
                  </button>
                  <div className="md:hidden">
                    <StatusPill status={lead.status} />
                  </div>
                </div>
                <p className="mt-1 truncate text-sm leading-5 text-muted">
                  {lead.name}
                  {lead.email ? ` - ${lead.email}` : ""}
                </p>
              </div>
              <div className="hidden md:block">
                <StatusPill status={lead.status} />
              </div>
              <p className="text-sm text-muted md:text-right">
                {formatLeadDate(lead.updatedAt)}
              </p>
              <button
                type="button"
                onClick={() => setSelectedLead(lead)}
                className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-border/55 bg-elevated/30 px-3 text-sm text-muted transition duration-200 hover:border-accent/30 hover:bg-elevated/55 hover:text-ink md:justify-self-end"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedLead ? (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setSelectedLead(null)}
        >
          <aside
            className="drawer-enter absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border/65 bg-panel/95 shadow-[-28px_0_90px_rgb(0_0_0/0.38)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
                    Lead preview
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink">
                    {selectedLead.company || selectedLead.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="focus-ring flex size-8 items-center justify-center rounded-md border border-border/60 bg-elevated/40 text-sm text-muted transition duration-200 hover:border-border hover:text-ink"
                  aria-label="Close lead preview"
                >
                  x
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusPill status={selectedLead.status} />
                <span className="rounded-full border border-accent/20 bg-accent/[0.07] px-2.5 py-1 text-xs font-medium text-muted">
                  {formatLeadStatus(selectedLead.status)}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <section className="rounded-lg border border-accent/16 bg-elevated/[0.28] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                  bob read
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {leadReads[selectedLead.status]}
                </p>
              </section>

              <section className="grid gap-3">
                <DrawerFact label="Contact" value={selectedLead.name} />
                <DrawerFact label="Email" value={selectedLead.email || "No email yet"} />
                <DrawerFact label="Created" value={formatLeadDate(selectedLead.createdAt)} />
                <DrawerFact label="Updated" value={formatLeadDate(selectedLead.updatedAt)} />
              </section>

              <details className="disclosure-panel rounded-lg p-4 transition duration-200">
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium text-ink">
                  View details
                  <span className="text-xs text-faint">What this status means</span>
                </summary>
                <p className="mt-4 text-sm leading-6 text-muted">
                  This preview is for quick scanning. Open the full lead page for notes,
                  activity history, and deeper context.
                </p>
              </details>
            </div>

            <div className="border-t border-border/60 p-5">
              <Link
                href={`/leads/${selectedLead.id}`}
                className="focus-ring warm-button inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium transition duration-200 active:scale-[0.99]"
              >
                Open full lead
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function DrawerFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-black/[0.12] p-3">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className="mt-1 truncate text-sm text-ink">{value}</p>
    </div>
  );
}
