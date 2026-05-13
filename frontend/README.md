# bob frontend

Next.js frontend for bob, built with TypeScript, Tailwind, and the App Router.

## Run Locally

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Checks

```bash
npm run lint
npm run build
```

## Current Scope

- App shell with sidebar, top bar, and main content area
- Initial routes for `/`, `/leads`, and `/leads/[id]`
- Mock lead data only
- Dark-first CSS variable tokens in `app/globals.css`

The frontend does not connect to the backend yet and does not include authentication.
