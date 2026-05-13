import type { LeadStatus } from "@/lib/leads";

const statusStyles: Record<LeadStatus, string> = {
  New: "border-border bg-elevated text-muted",
  Qualified: "border-accent/40 bg-accent/10 text-ink",
  Proposal: "border-white/20 bg-white/10 text-ink",
  Closed: "border-border/70 bg-transparent text-faint",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
