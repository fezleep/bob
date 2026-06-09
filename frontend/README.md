# bob frontend

Next.js frontend for bob, built with TypeScript, Tailwind, and the App Router.

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs on `http://localhost:3000` by default.
Set `NEXT_PUBLIC_API_BASE_URL` to the backend origin, for example `http://localhost:8080`.

## Production Auth

Use one canonical frontend domain in production so the `bob_token` auth cookie is set and sent on the same host. By default the cookie is host-only.

Set `BOB_AUTH_COOKIE_DOMAIN` only when using a custom/root domain and intentionally sharing auth across subdomains, for example `.example.com`. Keep `BOB_AUTH_JWT_SECRET` stable across backend deploys, and keep the JWT expiration positive and reasonable.

## Checks

```bash
npm run lint
npm run build
```

On unsupported WSL distros, install system Chromium and run Playwright with its executable path:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="$(which chromium)" npm run test:e2e
```

## Current Scope

- App shell with sidebar, top bar, and main content area
- Initial routes for `/`, `/leads`, and `/leads/[id]`
- Lead list and detail data loaded from the backend API
- Dark-first CSS variable tokens in `app/globals.css`
- JWT authentication persisted in an HTTP-only cookie
