# Render + Neon Deployment

This guide deploys Bob without requiring a credit card:

- Frontend on Vercel
- Spring Boot backend as a Render Web Service
- PostgreSQL on Neon Free

The existing Oracle deployment foundation remains valid. Use this path when you want a managed backend host and a managed Postgres database without putting secrets in the repository.

## What Already Exists

The backend already has a Dockerfile at `backend/Dockerfile`.

Important details:

- Java 21 is used for build and runtime.
- The container exposes port `8080`.
- Spring reads `SERVER_PORT`, defaulting to `8080`.
- Flyway runs automatically on startup.
- OpenAPI docs are available through springdoc.

Do not commit real Render, Neon, Vercel, JWT, or OpenAI secrets.

## Neon Setup

1. Create a Neon account and project.
2. Create or use the default Postgres database for Bob.
3. Copy the database connection string from Neon.
4. Keep the username, password, host, and database name secret.

Neon usually shows a connection string like:

```text
postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

Spring Boot needs a JDBC URL:

```text
jdbc:postgresql://<host>/<database>?sslmode=require
```

Set the username and password separately in Render:

```text
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
```

If Neon gives you both pooled and direct connection strings, start with the pooled connection string for the application. If Flyway or startup logs show connection or prepared-statement issues, retry with the direct connection string.

## Render Setup

You can deploy manually from the Render dashboard or use the optional `render.yaml` blueprint in this repository.

### Option A: Manual Web Service

1. Create a new Render Web Service.
2. Connect the GitHub repository.
3. Select Docker as the runtime.
4. Set the Dockerfile path to:

```text
backend/Dockerfile
```

5. Set the Docker build context/root directory to `backend` if Render asks for it.
6. Set the health check path to:

```text
/actuator/health
```

7. Add the required environment variables below.
8. Deploy the service.

### Option B: Blueprint

The repository includes a minimal `render.yaml`.

It defines one Docker web service for the backend and marks secret values with `sync: false`. After creating the Blueprint in Render, fill in the secret values in the Render dashboard before relying on the deployment.

## Required Render Environment Variables

Set these on the Render backend service:

| Variable | Required | Notes |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | yes | Neon JDBC URL, for example `jdbc:postgresql://<host>/<database>?sslmode=require`. |
| `SPRING_DATASOURCE_USERNAME` | yes | Neon database username. |
| `SPRING_DATASOURCE_PASSWORD` | yes | Neon database password. Keep secret. |
| `BOB_AUTH_JWT_SECRET` | yes | Long stable JWT signing secret. Changing it logs users out. |
| `BOB_AUTH_JWT_EXPIRATION_MINUTES` | recommended | Session lifetime in minutes. `480` is the local default. |
| `BOB_APP_VERSION` | recommended | Version label returned by `/api/status`, for example `0.1.0`. |
| `SERVER_PORT` | recommended | Set to `8080` for this Dockerfile unless you intentionally change the app port. |

Render may also provide a platform `PORT` variable. Bob's Spring config reads `SERVER_PORT`, and the Dockerfile exposes `8080`, so this guide keeps `SERVER_PORT=8080`. If Render reports that no open port was detected, set the service port to `8080` in Render or set `SERVER_PORT` to the port Render expects and redeploy.

Optional AI variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `BOB_AI_ENABLED` | no | Keep `false` unless Bob read generation is configured. |
| `BOB_AI_MODEL` | only for AI | Model available to the backend environment's OpenAI account. |
| `OPENAI_API_KEY` | only for AI | Backend-only secret. Never expose through Vercel `NEXT_PUBLIC_*` variables. |

Do not set `OPENAI_API_KEY` in Vercel.

## Verify Backend

After Render deploys the backend, open these URLs using the Render backend origin:

```text
https://<render-backend-origin>/actuator/health
https://<render-backend-origin>/api/status
https://<render-backend-origin>/swagger-ui/index.html
```

Expected results:

- `/actuator/health` returns HTTP 200 with status `UP`.
- `/api/status` returns HTTP 200 with Bob's app name, status, and version.
- Swagger UI loads the backend API documentation.

If health is down, check Render logs before changing application code.

## Vercel Frontend Update

In the Vercel frontend project, set:

```text
NEXT_PUBLIC_API_BASE_URL=https://<render-backend-origin>
```

Do not include a trailing path. Redeploy the frontend after changing the variable.

The frontend also supports:

```text
BOB_AUTH_COOKIE_DOMAIN=
```

Leave it unset unless you intentionally share auth across a custom root domain and subdomains.

## Troubleshooting

### Backend Sleeps Or Cold Starts

Render free services can sleep when idle. The first request after sleep can be slow or fail while the backend starts.

Check these first:

```text
https://<render-backend-origin>/actuator/health
https://<render-backend-origin>/api/status
```

If the backend was asleep, wait for it to become healthy and retry login.

### Database Connection String Issues

- Confirm `SPRING_DATASOURCE_URL` starts with `jdbc:postgresql://`.
- Confirm the URL includes the Neon host, database name, and `sslmode=require`.
- Do not paste the full `postgresql://user:password@...` URL into `SPRING_DATASOURCE_URL`.
- Confirm username and password are set separately.
- Check Render startup logs for PostgreSQL authentication or SSL errors.

### Flyway Migration Failure

- Read the first Flyway error in Render logs.
- Confirm the Neon database is the intended Bob database.
- Do not edit existing Flyway migration files to recover production data.
- If this is a fresh Neon database and no data matters yet, it is usually safer to create a new clean Neon database than to manually patch migration history.

### Auth Appears Broken

If login or protected pages fail, first confirm the backend is awake and healthy:

```text
https://<render-backend-origin>/actuator/health
https://<render-backend-origin>/api/status
```

If either endpoint is down, fix Render or Neon availability before changing auth code.

Keep `BOB_AUTH_JWT_SECRET` stable across redeploys. Changing it invalidates existing sessions.

### Frontend Points To The Wrong Backend

- Confirm Vercel `NEXT_PUBLIC_API_BASE_URL` is the Render backend origin.
- Confirm it uses `https://`.
- Confirm it does not point to localhost, Railway, Oracle, the frontend origin, or a URL with an extra path.
- Redeploy Vercel after changing the variable.

### CORS Or Browser Request Issues

Bob's frontend should call the backend origin configured in `NEXT_PUBLIC_API_BASE_URL`. If browser requests fail:

- Confirm the URL is the backend origin only.
- Confirm Render health and status endpoints work directly in the browser.
- Check the browser Network tab for the failing backend URL and status code.
- If custom domains are added later, verify both Vercel and Render domains use HTTPS.

## Manual Deployment Checklist

1. Neon project created.
2. Neon JDBC URL prepared with `sslmode=require`.
3. Render Docker Web Service created from `backend/Dockerfile`.
4. Render environment variables set.
5. Render backend deploy is healthy.
6. `/actuator/health` returns 200.
7. `/api/status` returns 200.
8. `/swagger-ui/index.html` loads.
9. Vercel `NEXT_PUBLIC_API_BASE_URL` points to the Render backend origin.
10. Vercel frontend redeployed.
11. Register or log in through the deployed frontend.
