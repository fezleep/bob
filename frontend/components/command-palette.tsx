"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api";
import { formatLeadStatus, getAllLeads, type Lead } from "@/lib/leads";

const navigationItems = [
  { label: "Home", href: "/", helper: "Return to the product overview" },
  { label: "Demo workspace", href: "/demo", helper: "View Bob with sample data" },
  {
    label: "Capabilities",
    href: "/capabilities",
    helper: "See implemented, prepared, and planned system capabilities",
  },
  { label: "Workspace", href: "/workspace", helper: "Open the operating workspace" },
  { label: "Pipeline", href: "/pipeline", helper: "Review the active pipeline" },
  { label: "Leads", href: "/leads", helper: "Search and manage leads" },
  { label: "About", href: "/about", helper: "Read the product story" },
];

function normalizeSearchValue(value: string | null | undefined) {
  return value ?? "";
}

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const input = inputRef.current;
    const focusTimer = window.setTimeout(() => input?.focus(), 40);

    return () => window.clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => {
    if (!open || leads.length > 0 || loadingLeads) {
      return;
    }

    let cancelled = false;
    setLoadingLeads(true);
    setLeadError(null);

    getAllLeads({ sort: "updatedAt", direction: "desc" })
      .then((items) => {
        if (!cancelled) {
          setLeads(items);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLeadError(
            error instanceof ApiError
              ? error.message
              : "Lead search is temporarily unavailable."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingLeads(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [leads.length, loadingLeads, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const normalizedQuery = normalizeSearchValue(query).trim().toLowerCase();
  const filteredNavigation = useMemo(() => {
    if (!normalizedQuery) {
      return navigationItems;
    }

    return navigationItems.filter((item) =>
      `${normalizeSearchValue(item.label)} ${normalizeSearchValue(item.helper)}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredLeads = useMemo(() => {
    const searchableLeads = normalizedQuery
      ? leads.filter((lead) =>
          [lead.name, lead.email, lead.company]
            .map(normalizeSearchValue)
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      : leads.slice(0, 6);

    return searchableLeads.slice(0, 8);
  }, [leads, normalizedQuery]);

  const runCommand = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const hasResults = filteredNavigation.length > 0 || filteredLeads.length > 0;

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgb(6_5_4)] px-3 py-4 text-ink sm:px-6 sm:py-16"
      aria-labelledby="command-palette-title"
      aria-modal="true"
      role="dialog"
      onMouseDown={(event) => {
        if (!panelRef.current?.contains(event.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="motion-rise flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-accent/22 bg-[rgb(15_13_11)] shadow-[0_1px_0_rgb(255_255_255/0.045)_inset,0_32px_100px_rgb(0_0_0/0.62)] sm:max-h-[calc(100vh-8rem)]"
      >
        <div className="border-b border-border/70 bg-[rgb(20_17_14)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/[0.11] text-sm font-semibold text-[rgb(var(--champagne))]">
              K
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="command-palette-title" className="text-sm font-semibold text-ink">
                Command palette
              </h2>
              <p className="text-xs text-faint">Navigate Bob and open lead records.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-md border border-border/70 px-2 py-1 text-xs font-medium text-faint transition hover:border-accent/35 hover:text-ink"
            >
              Esc
            </button>
          </div>
        </div>

        <div className="border-b border-border/60 bg-[rgb(12_10_8)] px-4 py-3 sm:px-5">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search navigation, leads, companies, emails..."
            className="h-12 w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[rgb(13_11_9)] p-2">
          {filteredNavigation.length > 0 ? (
            <CommandSection title="Quick navigation">
              {filteredNavigation.map((item) => (
                <CommandButton
                  key={item.href}
                  title={item.label}
                  eyebrow="Go to"
                  helper={item.helper}
                  onSelect={() => runCommand(item.href)}
                />
              ))}
            </CommandSection>
          ) : null}

          {loadingLeads ? (
            <p className="px-3 py-4 text-sm text-muted">Loading lead search...</p>
          ) : null}

          {leadError ? (
            <p className="rounded-md border border-border/65 bg-black/30 px-3 py-3 text-sm text-muted">
              {leadError}
            </p>
          ) : null}

          {filteredLeads.length > 0 ? (
            <CommandSection title="Leads">
              {filteredLeads.map((lead) => (
                <CommandButton
                  key={lead.id}
                  title={normalizeSearchValue(lead.name) || "Untitled lead"}
                  eyebrow={formatLeadStatus(lead.status)}
                  helper={[lead.company, lead.email].map(normalizeSearchValue).filter(Boolean).join(" - ")}
                  onSelect={() => runCommand(`/leads/${lead.id}`)}
                />
              ))}
            </CommandSection>
          ) : null}

          {!loadingLeads && !leadError && !hasResults ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-medium text-ink">No command found</p>
              <p className="mt-1 text-sm text-faint">
                Try a page name, lead name, email, or company.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/65 bg-[rgb(20_17_14)] px-4 py-3 text-xs leading-5 text-faint sm:px-5">
          <span>Ctrl/Cmd K opens Bob from anywhere.</span>
          <span>Ctrl+Shift+K fallback</span>
        </div>
      </div>
    </div>
  );
}

function CommandSection({
  title,
  children,
}: {
  title: string | null | undefined;
  children: ReactNode;
}) {
  return (
    <section className="py-1">
      <p className="px-3 pb-1 pt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-faint">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function CommandButton({
  title,
  eyebrow,
  helper,
  onSelect,
}: {
  title: string;
  eyebrow: string;
  helper: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="focus-ring group flex w-full min-w-0 items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition duration-150 hover:border-accent/24 hover:bg-elevated/68 focus-visible:border-accent/45 focus-visible:bg-elevated/72"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-black/28 text-xs font-semibold text-muted transition group-hover:border-accent/28 group-hover:text-[rgb(var(--champagne))]">
        {normalizeSearchValue(title).charAt(0).toUpperCase() || "?"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="truncate text-sm font-medium text-ink">
            {normalizeSearchValue(title) || "Untitled"}
          </span>
          <span className="max-w-full truncate text-[0.68rem] font-medium uppercase tracking-[0.12em] text-faint sm:shrink-0">
            {eyebrow}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted">{helper}</span>
      </span>
    </button>
  );
}
