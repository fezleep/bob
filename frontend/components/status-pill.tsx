import { formatLeadStatus, type LeadStatus } from "@/lib/leads";

const statusStyles: Record<LeadStatus, string> = {
  NEW: "border-border/80 bg-elevated/65 text-muted",
  CONTACTED: "border-white/15 bg-white/[0.075] text-ink",
  QUALIFIED: "border-accent/35 bg-accent/[0.085] text-ink",
  CLOSED: "border-border/60 bg-transparent text-faint",
  LOST: "border-border/60 bg-transparent text-faint",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] ${statusStyles[status]}`}
    >
      {formatLeadStatus(status)}
    </span>
  );
}
