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

## Checks

```bash
npm run lint
npm run build
```

## Current Scope

- App shell with sidebar, top bar, and main content area
- Initial routes for `/`, `/leads`, and `/leads/[id]`
- Lead list and detail data loaded from the backend API
- Dark-first CSS variable tokens in `app/globals.css`

The frontend does not include authentication yet.
