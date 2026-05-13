export const statuses = ["New", "Qualified", "Proposal", "Closed"] as const;

export type LeadStatus = (typeof statuses)[number];

export type LeadNote = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type LeadActivity = {
  id: string;
  label: string;
  detail: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  company: string;
  contact: string;
  email: string;
  status: LeadStatus;
  owner: string;
  value: string;
  lastTouch: string;
  summary: string;
  notes: LeadNote[];
  activities: LeadActivity[];
};

const leads: Lead[] = [
  {
    id: "northstar",
    company: "Northstar Studio",
    contact: "Maya Chen",
    email: "maya@northstar.example",
    status: "Qualified",
    owner: "Fehao",
    value: "$48k",
    lastTouch: "2h ago",
    summary:
      "Design-led software team evaluating bob for a small partner pipeline. They care about fast context, low setup, and clean handoff between founders.",
    notes: [
      {
        id: "n1",
        author: "Fehao",
        body: "Maya wants a single place to capture why a deal is warm before the next call.",
        createdAt: "Today, 10:24",
      },
      {
        id: "n2",
        author: "Ana",
        body: "Send a compact follow-up with pricing assumptions and migration notes.",
        createdAt: "Yesterday, 16:10",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "Status changed",
        detail: "Moved from New to Qualified",
        createdAt: "Today",
      },
      {
        id: "a2",
        label: "Note added",
        detail: "Discovery call summary captured",
        createdAt: "Yesterday",
      },
      {
        id: "a3",
        label: "Lead created",
        detail: "Imported from founder referral",
        createdAt: "May 9",
      },
    ],
  },
  {
    id: "fieldkit",
    company: "Fieldkit",
    contact: "Jon Bell",
    email: "jon@fieldkit.example",
    status: "Proposal",
    owner: "Ana",
    value: "$72k",
    lastTouch: "1d ago",
    summary:
      "Operations platform with a mature sales motion. Looking for a calmer CRM layer for expansion accounts and partner introductions.",
    notes: [
      {
        id: "n3",
        author: "Ana",
        body: "Proposal should focus on visibility across long-running conversations.",
        createdAt: "Yesterday, 12:42",
      },
    ],
    activities: [
      {
        id: "a4",
        label: "Proposal sent",
        detail: "Shared a phased rollout option",
        createdAt: "Yesterday",
      },
      {
        id: "a5",
        label: "Call completed",
        detail: "Reviewed current lead tracking workflow",
        createdAt: "May 8",
      },
    ],
  },
  {
    id: "quietworks",
    company: "Quietworks",
    contact: "Noah Park",
    email: "noah@quietworks.example",
    status: "New",
    owner: "Fehao",
    value: "$24k",
    lastTouch: "3d ago",
    summary:
      "Small consultancy replacing spreadsheets. Needs basic lead capture, notes, and a clear timeline before anything more advanced.",
    notes: [],
    activities: [
      {
        id: "a6",
        label: "Lead created",
        detail: "Manual entry from website inquiry",
        createdAt: "May 6",
      },
    ],
  },
  {
    id: "arcadia-labs",
    company: "Arcadia Labs",
    contact: "Iris Morgan",
    email: "iris@arcadia.example",
    status: "Qualified",
    owner: "Lina",
    value: "$40k",
    lastTouch: "4d ago",
    summary:
      "Product lab with recurring client work. Interested in keeping decisions and next steps attached to each relationship.",
    notes: [
      {
        id: "n4",
        author: "Lina",
        body: "They asked for a simple way to review stale leads every Friday.",
        createdAt: "May 5, 09:30",
      },
    ],
    activities: [
      {
        id: "a7",
        label: "Status changed",
        detail: "Qualified after intro call",
        createdAt: "May 5",
      },
      {
        id: "a8",
        label: "Lead created",
        detail: "Added from partner channel",
        createdAt: "May 3",
      },
    ],
  },
  {
    id: "blackline",
    company: "Blackline Systems",
    contact: "Sam Rivera",
    email: "sam@blackline.example",
    status: "Closed",
    owner: "Fehao",
    value: "$18k",
    lastTouch: "1w ago",
    summary:
      "Completed trial for a lightweight internal pipeline. Good reference for teams that want less ceremony.",
    notes: [
      {
        id: "n5",
        author: "Fehao",
        body: "Closed as a small pilot. Revisit in Q3 if the team expands.",
        createdAt: "May 1, 14:12",
      },
    ],
    activities: [
      {
        id: "a9",
        label: "Closed",
        detail: "Pilot agreement signed",
        createdAt: "May 1",
      },
    ],
  },
];

export function getLeads() {
  return leads;
}

export function getLeadById(id: string) {
  return leads.find((lead) => lead.id === id);
}
