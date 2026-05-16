"use client";

import { useDeferredValue, useEffect, useId, useState } from "react";
import { LeadList } from "@/components/lead-list";
import {
  getLeadFilterCounts,
  leadFilterMeta,
  leadFilterOrder,
  matchesLeadFilter,
  matchesLeadSearch,
  type LeadFilterId,
} from "@/lib/lead-filters";
import type { Lead } from "@/lib/leads";

type LeadWorkspaceProps = {
  leads: Lead[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyBody: string;
};

export function LeadWorkspace({
  leads,
  title,
  description,
  emptyTitle,
  emptyBody,
}: LeadWorkspaceProps) {
  const [activeFilter, setActiveFilter] = useState<LeadFilterId>("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const searchId = useId();
  const filterCounts = getLeadFilterCounts(leads);
  const filteredLeads = leads.filter(
    (lead) =>
      matchesLeadFilter(lead, activeFilter) &&
      matchesLeadSearch(lead, deferredSearch)
  );
  const hasQuery = deferredSearch.trim().length > 0;
  const activeMeta = leadFilterMeta[activeFilter];

  useEffect(() => {
    if (filterCounts[activeFilter] > 0 || activeFilter === "all") {
      return;
    }

    setActiveFilter("all");
  }, [activeFilter, filterCounts]);

  return (
    <section className="quiet-panel overflow-hidden rounded-lg">
      <div className="border-b border-border/55 p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
                Workspace view
              </p>
              <h2 className="mt-2 text-base font-medium text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
            <div className="sm:w-[22rem]">
              <label htmlFor={searchId} className="sr-only">
                Search leads
              </label>
              <div className="group rounded-md border border-border/65 bg-elevated/[0.22] px-3 py-2.5 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] transition duration-200 focus-within:border-accent/32 focus-within:bg-elevated/[0.3]">
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-faint">
                  Search
                </span>
                <input
                  id={searchId}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, email, or company"
                  className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-ink placeholder:text-faint focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {leadFilterOrder.map((filter) => {
              const isActive = filter === activeFilter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition duration-200 ${
                    isActive
                      ? "border-accent/38 bg-accent/[0.1] text-ink shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_10px_30px_rgb(var(--accent)/0.08)]"
                      : "border-border/65 bg-elevated/[0.18] text-muted hover:border-border hover:bg-elevated/[0.32] hover:text-ink"
                  }`}
                >
                  <span>{leadFilterMeta[filter].label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[0.72rem] tabular-nums ${
                      isActive ? "bg-black/20 text-ink" : "bg-black/18 text-faint"
                    }`}
                  >
                    {filterCounts[filter]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-black/[0.12] p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                Showing
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {filteredLeads.length} of {leads.length} lead{leads.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">{activeMeta.helper}</p>
            </div>
            {hasQuery ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="focus-ring inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border/65 bg-elevated/30 px-3 text-sm text-muted transition duration-200 hover:border-border hover:bg-elevated/55 hover:text-ink"
              >
                Clear search
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {filteredLeads.length > 0 ? (
          <LeadList leads={filteredLeads} embedded />
        ) : (
          <EmptyLeadResults
            title={hasQuery ? "No lead matches that search" : emptyTitle}
            body={
              hasQuery
                ? "Try a different person, company, or email. bob keeps the rest of the workspace quiet until the right match appears."
                : emptyBody
            }
            hint={
              hasQuery
                ? `Search checks name, email, and company across the ${leadFilterMeta[activeFilter].label.toLowerCase()} view.`
                : `${leadFilterMeta[activeFilter].label} stays available here whenever that signal appears.`
            }
          />
        )}
      </div>
    </section>
  );
}

function EmptyLeadResults({
  title,
  body,
  hint,
}: {
  title: string;
  body: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-elevated/[0.16] px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-border/65 bg-panel/70 shadow-[0_1px_0_rgb(255_255_255/0.03)_inset]">
        <span className="size-1.5 rounded-full bg-accent/80" />
      </div>
      <h3 className="mt-5 text-base font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{body}</p>
      <p className="mx-auto mt-4 max-w-md text-xs uppercase tracking-[0.14em] text-faint">
        {hint}
      </p>
    </div>
  );
}
