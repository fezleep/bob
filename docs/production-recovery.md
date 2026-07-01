# Production Recovery

Bob runs as a separated frontend, backend, and PostgreSQL database. If the backend or database is paused, unavailable, or misconfigured, the frontend can look like it is asking for login again even when the real problem is that the API cannot validate the session.

Use this document to distinguish an authentication bug from an infrastructure outage.

## Required Frontend Environment

Set these in the frontend hosting environment:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | yes | Public origin for the deployed backend, with scheme and host. Do not include a trailing path. |
| `BOB_AUTH_COOKIE_DOMAIN` | no | Leave unset for host-only cookies. Set only when intentionally sharing auth across a custom root domain and subdomains, for example `.example.com`. |

The frontend does not connect to PostgreSQL and must not receive backend secrets.

## Required Backend Environment

Set these in the backend hosting environment:

| Variable | Required | Notes |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | yes in production | JDBC URL for the production PostgreSQL database. |
| `SPRING_DATASOURCE_USERNAME` | yes in production | Database username. |
| `SPRING_DATASOURCE_PASSWORD` | yes in production | Database password. |
| `BOB_AUTH_JWT_SECRET` | yes in production | Stable, strong JWT signing secret. Changing it invalidates existing sessions. |
| `BOB_AUTH_JWT_EXPIRATION_MINUTES` | recommended | Positive session duration in minutes. |
| `BOB_APP_VERSION` | recommended | Version label returned by `/api/status`. |
| `BOB_AI_ENABLED` | no | Leave `false` unless Bob read generation is configured. |
| `BOB_AI_MODEL` | required only for AI | Model available to the backend environment's OpenAI account. |
| `OPENAI_API_KEY` | required only for AI | Backend-only secret. Never expose as `NEXT_PUBLIC_*`. |

The backend owns database access, Flyway migration execution, JWT validation, and operational APIs.

## Deployment Alternatives

Bob currently documents two practical deployment paths:

- Oracle Cloud Always Free VM with Dockerized backend and PostgreSQL: [oracle-deployment.md](oracle-deployment.md)
- Render Web Service with Neon Free Postgres: [render-neon-deployment.md](render-neon-deployment.md)

If Oracle account creation is blocked by credit-card requirements, use Render + Neon as the no-credit-card recovery or redeploy path. The frontend still runs on Vercel and still needs `NEXT_PUBLIC_API_BASE_URL` to point at the active backend origin.

## Verify Backend Health

From a terminal or HTTP client, call the deployed backend origin:

```bash
curl -i "$BACKEND_ORIGIN/actuator/health"
curl -i "$BACKEND_ORIGIN/api/status"
```

Expected healthy results:

- `/actuator/health` returns HTTP 200 and `{"status":"UP"}`.
- `/api/status` returns HTTP 200 with Bob's app name, status, version, AI readiness, cache mode, and OpenAPI availability.

If either request times out, cannot resolve DNS, returns a platform pause page, or returns 5xx, treat this as a backend/platform problem before debugging frontend auth.

## Verify Database Availability

In Railway or the current backend host:

1. Confirm the PostgreSQL service is running, not paused, and not over quota.
2. Confirm the backend service is running, not paused, and connected to the expected PostgreSQL service.
3. Inspect backend logs during startup for datasource, connection, or Flyway errors.
4. Confirm `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` match the active database service.

For local checks:

```bash
docker compose ps
docker compose exec postgres pg_isready -U bob -d bob
```

For production, use the database provider's shell or logs. Do not paste production credentials into repo files or docs.

## Verify Frontend-To-Backend Configuration

From the deployed frontend environment:

1. Confirm `NEXT_PUBLIC_API_BASE_URL` is set to the deployed backend origin.
2. Confirm it uses `https://` in production.
3. Confirm it does not point to localhost, a preview backend, an old Railway service, or the frontend origin.
4. Open the frontend in a browser and check the Network tab for `/api/auth/me`.
5. If `/api/auth/me` returns 503 with "The API is unavailable", check backend health and database availability before changing auth code.

## Auth Bug Or Backend Offline

Likely auth/session bug:

- Backend health is 200.
- `/api/status` is 200.
- Login returns 200 from the backend.
- Browser has a `bob_token` cookie on the frontend host.
- `/api/auth/me` returns 401 or 403 even though the cookie exists and the backend is healthy.

Likely backend or database outage:

- `/actuator/health` or `/api/status` does not return 200.
- Railway shows backend or Postgres paused due usage limits.
- Frontend `/api/auth/me` returns 503.
- Login form returns "The API is unavailable. Please try again later."
- Protected pages show backend/API load errors.

## Railway Paused Services

When Railway pauses the backend service, the frontend can still load but server-side API calls cannot reach Bob's backend. Session validation then fails because the frontend cannot ask `/api/auth/me` on the backend whether the JWT is valid.

When Railway pauses Postgres, the backend may fail health checks, fail startup, or return 5xx because it cannot open database connections. This can also surface as login failure or session validation failure in the frontend.

Recovery order:

1. Unpause or upgrade the paused Railway project/services.
2. Confirm Postgres is running and accepting connections.
3. Restart or redeploy the backend after Postgres is available.
4. Confirm backend `/actuator/health` and `/api/status` return 200.
5. Confirm the frontend `NEXT_PUBLIC_API_BASE_URL` points at that backend.
6. Retry login and protected navigation.

## Production Quick Check

Use this short checklist after a production deploy or suspected outage:

1. Confirm the Vercel production deploy is running the latest `main` commit.
2. Confirm the Render backend service is live. Render free tier services can cold start, so allow the first request time to wake the service.
3. Open `$BACKEND_ORIGIN/actuator/health` and confirm HTTP 200.
4. Open `$BACKEND_ORIGIN/api/status` and confirm HTTP 200 with `aiEnabled`, `cacheMode`, and `openApiAvailable`.
5. Open `$BACKEND_ORIGIN/swagger-ui/index.html` and confirm Swagger UI loads.
6. Log in through the deployed frontend.
7. Refresh a protected route and confirm the session remains active.
8. Generate an AI insight from a lead detail page.
9. Reopen or regenerate the same insight and confirm cache metadata appears when the insight is reused.

The AI insight cache is in-process and best-effort. It is not Redis, and cached entries can disappear after backend restarts or platform recycling.
