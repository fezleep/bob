import type { LeadIntelligenceBadge } from "@/lib/lead-intelligence";

const badgeToneStyles: Record<LeadIntelligenceBadge["tone"], string> = {
  attention: "border-[#d7bd87]/30 bg-[#d7bd87]/10 text-[#e5d4aa]",
  calm: "border-border/70 bg-elevated/45 text-muted",
  positive: "border-accent/30 bg-accent/[0.09] text-[#d9e5db]",
};

export function LeadIntelligenceBadgeView({
  badge,
  compact = false,
}: {
  badge: LeadIntelligenceBadge;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium lowercase tracking-normal ${
        compact ? "px-2 py-1 text-[0.68rem]" : "px-2.5 py-1 text-xs"
      } ${badgeToneStyles[badge.tone]}`}
      title={badge.detail}
    >
      {badge.label}
    </span>
  );
}
