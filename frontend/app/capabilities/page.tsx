import Link from "next/link";

export const dynamic = "force-dynamic";

type CapabilityState = "Implemented" | "Prepared" | "Planned";

type Capability = {
  title: string;
  state: CapabilityState;
  body: string;
  dependsOnBackend?: boolean;
  meta?: string;
};

type BackendAvailability =
  | {
      state: "online";
      label: "Backend online";
      detail: string;
      version?: string;
    }
  | {
      state: "unavailable";
      label: "Backend unavailable";
      detail: string;
    }
  | {
      state: "not-configured";
      label: "Backend not configured";
      detail: string;
    };

const implementedCapabilities: Capability[] = [
  {
    title: "Demo mode",
    state: "Implemented",
    body: "Public sample workspace that shows Bob's operating model without login or backend access.",
  },
  {
    title: "Spring Boot API",
    state: "Implemented",
    body: "Backend service for auth, lead records, notes, activity, attention signals, and system status.",
    dependsOnBackend: true,
  },
  {
    title: "PostgreSQL persistence",
    state: "Implemented",
    body: "Relational storage for users, leads, notes, activities, follow-up timing, and AI insights.",
    dependsOnBackend: true,
  },
  {
    title: "JWT auth",
    state: "Implemented",
    body: "Stateless authentication protects the live workspace while keeping public pages open.",
    dependsOnBackend: true,
  },
  {
    title: "Follow-up engine",
    state: "Implemented",
    body: "Lead timing is turned into overdue, due, scheduled, and stale operating signals.",
    dependsOnBackend: true,
  },
  {
    title: "Attention queue",
    state: "Implemented",
    body: "A focused queue shows which records need action before more pipeline work.",
    dependsOnBackend: true,
  },
  {
    title: "AI operational read",
    state: "Implemented",
    body: "Stored insights summarize context, risk, and next action when AI configuration is available.",
    dependsOnBackend: true,
  },
  {
    title: "AI insight cache",
    state: "Implemented",
    body: "Repeated Bob read requests can reuse a cached result when the lead context hash has not changed.",
    dependsOnBackend: true,
  },
  {
    title: "OpenAPI/Swagger docs",
    state: "Implemented",
    body: "The backend exposes Swagger UI and OpenAPI JSON for API review and integration work.",
    dependsOnBackend: true,
  },
  {
    title: "Production diagnostics",
    state: "Implemented",
    body: "Public status and health endpoints support deployment checks and recovery runbooks.",
    dependsOnBackend: true,
  },
];

const preparedCapabilities: Capability[] = [
  {
    title: "Render + Neon deployment path",
    state: "Prepared",
    body: "Repository docs describe deploying the Spring Boot backend on Render with managed PostgreSQL on Neon.",
    meta: "Documented deployment path",
  },
  {
    title: "Oracle VM deployment foundation",
    state: "Prepared",
    body: "Repository docs describe a direct Oracle Always Free VM deployment path for the backend.",
    meta: "Documented deployment path",
  },
  {
    title: "Docker Compose backend/Postgres setup",
    state: "Prepared",
    body: "Local infrastructure supports running the backend with PostgreSQL without extra platform services.",
    meta: "Local infrastructure",
  },
];

const plannedCapabilities: Capability[] = [
  {
    title: "External Redis AI cache",
    state: "Planned",
    body: "Roadmap candidate if cache sharing across backend instances becomes necessary. Redis is not required today.",
  },
  {
    title: "RabbitMQ async AI jobs",
    state: "Planned",
    body: "Roadmap candidate for background AI work. Current AI insight work remains direct and simple.",
  },
  {
    title: "Observability dashboard",
    state: "Planned",
    body: "Roadmap candidate for traces, metrics, and production visibility beyond health checks.",
  },
  {
    title: "Kubernetes/deployment story",
    state: "Planned",
    body: "Roadmap candidate only if orchestration needs outgrow the prepared Render, Neon, and Oracle paths.",
  },
];

const references = [
  {
    label: "Demo workspace",
    href: "/demo",
    body: "Public sample data experience.",
    link: true,
  },
  {
    label: "Swagger UI",
    href: "/swagger-ui/index.html",
    body: "Backend path for interactive API docs.",
  },
  {
    label: "OpenAPI JSON",
    href: "/v3/api-docs",
    body: "Backend path for the generated API document.",
  },
  {
    label: "Production recovery",
    href: "docs/production-recovery.md",
    body: "Repository runbook for health checks, recovery steps, and redeploy choices.",
  },
  {
    label: "Render + Neon deployment",
    href: "docs/render-neon-deployment.md",
    body: "Repository guide for the prepared managed deployment path.",
  },
  {
    label: "Oracle deployment",
    href: "docs/oracle-deployment.md",
    body: "Repository guide for the prepared VM deployment path.",
  },
];

function getStateClass(state: CapabilityState) {
  if (state === "Implemented") {
    return "border-accent/30 bg-accent/[0.08] text-[rgb(var(--champagne))]";
  }

  if (state === "Prepared") {
    return "border-[rgb(var(--champagne)/0.28)] bg-[rgb(var(--champagne)/0.08)] text-[rgb(var(--champagne))]";
  }

  return "border-border/60 bg-black/20 text-faint";
}

function getBackendStateClass(state: BackendAvailability["state"]) {
  if (state === "online") {
    return "border-accent/30 bg-accent/[0.08] text-[rgb(var(--champagne))]";
  }

  if (state === "unavailable") {
    return "border-[rgb(196_124_89/0.34)] bg-[rgb(196_124_89/0.08)] text-[rgb(232_178_145)]";
  }

  return "border-border/60 bg-black/20 text-faint";
}

async function getBackendAvailability(): Promise<BackendAvailability> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!apiBaseUrl) {
    return {
      state: "not-configured",
      label: "Backend not configured",
      detail: "Set NEXT_PUBLIC_API_BASE_URL to let this page check /api/status.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/status`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        state: "unavailable",
        label: "Backend unavailable",
        detail: `/api/status returned HTTP ${response.status}.`,
      };
    }

    const body = (await response.json()) as {
      appName?: string;
      status?: string;
      version?: string;
    };

    return {
      state: "online",
      label: "Backend online",
      detail: `${body.appName || "Bob API"} returned status ${body.status || "ok"}.`,
      version: body.version,
    };
  } catch {
    return {
      state: "unavailable",
      label: "Backend unavailable",
      detail: "The configured backend did not answer /api/status.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function CapabilityGrid({ items }: { items: Capability[] }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className="flex min-h-44 flex-col rounded-lg border border-border/55 bg-elevated/[0.2] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium text-ink">{item.title}</h3>
            <span
              className={[
                "shrink-0 rounded-full border px-2 py-1 text-[0.66rem] font-medium uppercase tracking-[0.08em]",
                getStateClass(item.state),
              ].join(" ")}
            >
              {item.state}
            </span>
          </div>
          <p className="mt-3 flex-1 text-sm leading-6 text-muted">{item.body}</p>
          <p className="mt-4 text-xs font-medium text-faint">
            {item.meta || (item.dependsOnBackend ? "Uses live backend" : "Works publicly")}
          </p>
        </article>
      ))}
    </div>
  );
}

export default async function CapabilitiesPage() {
  const backend = await getBackendAvailability();

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-panel/80 p-5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_28px_90px_rgb(0_0_0/0.26)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgb(var(--accent)/0.14),transparent_18rem),radial-gradient(circle_at_82%_0%,rgb(var(--champagne)/0.06),transparent_18rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              System capabilities
            </p>
            <h1 className="mt-3 break-words text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              What Bob can do today, and what is still planned.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted sm:text-[0.95rem]">
              Bob is an AI-powered operational workspace that turns scattered
              records into priorities, context, and next actions. This page keeps
              the showcase honest: live capabilities, prepared foundations, and
              roadmap ideas are labeled separately.
            </p>
          </div>

          <aside className="rounded-lg border border-accent/18 bg-black/[0.14] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Backend availability
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{backend.label}</p>
              <span
                className={[
                  "shrink-0 rounded-full border px-2 py-1 text-[0.66rem] font-medium uppercase tracking-[0.08em]",
                  getBackendStateClass(backend.state),
                ].join(" ")}
              >
                {backend.state === "online"
                  ? "Online"
                  : backend.state === "unavailable"
                    ? "Unavailable"
                    : "Not configured"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{backend.detail}</p>
            {backend.state === "online" && backend.version ? (
              <p className="mt-3 text-xs text-faint">Version: {backend.version}</p>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Public
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Works without login</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The homepage, demo mode, about page, and this capabilities page are
            public. They stay useful even when the backend is paused.
          </p>
        </article>
        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Live app
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Uses backend state</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Workspace, pipeline, leads, auth, notes, activity, and AI insight
            features depend on the Spring Boot API and PostgreSQL.
          </p>
        </article>
        <article className="quiet-panel rounded-lg p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Diagnostics
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">Check the backend directly</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Backend health is verified with <code>/api/status</code> and
            <code> /actuator/health</code> on the configured backend origin.
          </p>
        </article>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Implemented
            </p>
            <h2 className="mt-2 text-base font-medium text-ink">
              Product and platform capabilities in this branch.
            </h2>
          </div>
          <Link
            href="/demo"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-border/65 bg-elevated/30 px-3 text-sm font-medium text-muted transition duration-200 hover:border-accent/34 hover:bg-elevated/55 hover:text-ink"
          >
            Open demo
          </Link>
        </div>
        <CapabilityGrid items={implementedCapabilities} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Prepared
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Deployment paths and local foundations that are documented.
          </h2>
          <CapabilityGrid items={preparedCapabilities} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Planned
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Roadmap ideas, not current implementation.
          </h2>
          <CapabilityGrid items={plannedCapabilities} />
        </div>
      </section>

      <section>
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            References
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Where to inspect the real system.
          </h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {references.map((reference) => (
            <div
              key={reference.label}
              className="rounded-lg border border-border/55 bg-elevated/[0.2] p-4"
            >
              <p className="text-sm font-medium text-ink">{reference.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{reference.body}</p>
              {reference.link ? (
                <Link
                  href={reference.href}
                  className="focus-ring mt-4 inline-flex h-9 items-center rounded-md border border-border/65 bg-elevated/30 px-3 text-sm font-medium text-muted transition duration-200 hover:border-accent/34 hover:bg-elevated/55 hover:text-ink"
                >
                  Open
                </Link>
              ) : (
                <p className="mt-4 break-words rounded-md border border-border/55 bg-black/20 px-3 py-2 text-xs text-faint">
                  {reference.href}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
