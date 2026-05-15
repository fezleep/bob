import {
  formatCurrentQuietPhrase,
  formatQuietTemporalPhrase,
  formatTemporalPhrase,
  type Lead,
} from "@/lib/leads";

const dayInMs = 86_400_000;
const inactiveAfterDays = 5;
const recentWithinDays = 3;
const newlyQualifiedWithinDays = 7;

type LeadBadgeTone = "calm" | "attention" | "positive";

export type LeadIntelligenceBadge = {
  label: string;
  detail: string;
  tone: LeadBadgeTone;
};

export type PipelineHealthTone = {
  label: string;
  detail: string;
  tone: LeadBadgeTone;
};

function daysSince(value: string, now = new Date()) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - timestamp) / dayInMs));
}

function isOpenLead(lead: Lead) {
  return lead.status !== "CLOSED" && lead.status !== "LOST";
}

export function getLeadQuietDays(lead: Lead, now = new Date()) {
  return daysSince(lead.updatedAt, now);
}

export function formatLeadQuietDays(days: number) {
  if (days <= 0) {
    return "updated recently";
  }

  return `quiet for ${days} day${days === 1 ? "" : "s"}`;
}

export function isInactiveLead(lead: Lead, now = new Date()) {
  return isOpenLead(lead) && getLeadQuietDays(lead, now) >= inactiveAfterDays;
}

export function isRecentlyUpdatedLead(lead: Lead, now = new Date()) {
  return getLeadQuietDays(lead, now) <= recentWithinDays;
}

export function isNewlyQualifiedLead(lead: Lead, now = new Date()) {
  return (
    lead.status === "QUALIFIED" &&
    daysSince(lead.updatedAt, now) <= newlyQualifiedWithinDays
  );
}

export function isLeadNeedingAttention(lead: Lead, now = new Date()) {
  if (!isOpenLead(lead)) {
    return false;
  }

  if (lead.status === "QUALIFIED") {
    return getLeadQuietDays(lead, now) >= inactiveAfterDays + 2;
  }

  return isInactiveLead(lead, now);
}

export function getLeadIntelligenceBadges(lead: Lead, now = new Date()) {
  const badges: LeadIntelligenceBadge[] = [];

  if (isLeadNeedingAttention(lead, now)) {
    badges.push({
      label: "needs follow-up",
      detail: formatQuietTemporalPhrase(lead.updatedAt, now),
      tone: "attention",
    });
  } else if (isInactiveLead(lead, now)) {
    badges.push({
      label: formatQuietTemporalPhrase(lead.updatedAt, now),
      detail: "worth a light check-in",
      tone: "calm",
    });
  }

  if (isNewlyQualifiedLead(lead, now)) {
    badges.push({
      label: "newly qualified",
      detail: "strong signal, still fresh",
      tone: "positive",
    });
  } else if (isRecentlyUpdatedLead(lead, now)) {
    badges.push({
      label: "recent movement",
      detail: formatTemporalPhrase(lead.updatedAt, now),
      tone: "calm",
    });
  }

  return badges.slice(0, 2);
}

export function getLeadIntelligenceSummary(lead: Lead, now = new Date()) {
  const badges = getLeadIntelligenceBadges(lead, now);

  if (badges.length > 0) {
    return badges[0].detail;
  }

  if (!isOpenLead(lead)) {
    return "closed loop";
  }

  return formatQuietTemporalPhrase(lead.updatedAt, now);
}

export function getPipelineHealthTone(leads: Lead[], now = new Date()): PipelineHealthTone {
  const openLeads = leads.filter(isOpenLead);
  const needingAttention = openLeads.filter((lead) => isLeadNeedingAttention(lead, now));
  const recentMovement = openLeads.filter((lead) => isRecentlyUpdatedLead(lead, now));
  const newlyQualified = openLeads.filter((lead) => isNewlyQualifiedLead(lead, now));

  if (openLeads.length === 0) {
    return {
      label: "pipeline feels quiet",
      detail: "No open work is asking for attention this hour.",
      tone: "calm",
    };
  }

  if (needingAttention.length > Math.max(1, Math.floor(openLeads.length / 3))) {
    return {
      label: "pipeline needs attention",
      detail: `${needingAttention.length} lead${
        needingAttention.length === 1 ? "" : "s"
      } could use follow-up.`,
      tone: "attention",
    };
  }

  if (recentMovement.length > 0 || newlyQualified.length > 0) {
    return {
      label: "pipeline feels steady",
      detail:
        newlyQualified.length > 0
          ? `${newlyQualified.length} newly qualified lead${
              newlyQualified.length === 1 ? "" : "s"
            } in motion.`
          : `${recentMovement.length} lead${
              recentMovement.length === 1 ? "" : "s"
            } showing recent movement.`,
      tone: "positive",
    };
  }

  return {
    label: "pipeline feels steady",
    detail: `Open leads are ${formatCurrentQuietPhrase(now)}, with no sharp follow-up pressure.`,
    tone: "calm",
  };
}

export function getLeadIntelligenceCounts(leads: Lead[], now = new Date()) {
  return {
    inactive: leads.filter((lead) => isInactiveLead(lead, now)).length,
    recentlyUpdated: leads.filter((lead) => isRecentlyUpdatedLead(lead, now)).length,
    newlyQualified: leads.filter((lead) => isNewlyQualifiedLead(lead, now)).length,
    needingAttention: leads.filter((lead) => isLeadNeedingAttention(lead, now)).length,
  };
}
