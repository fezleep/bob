"use client";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="quiet-panel rounded-lg p-10 text-center">
      <h1 className="text-sm font-medium text-ink">Unable to load the workspace</h1>
      <p className="mt-2 text-sm text-muted">
        Check that the backend is running and the API URL is configured.
      </p>
      <button
        onClick={reset}
        className="mt-5 h-9 rounded-md border border-border bg-elevated px-3 text-sm text-ink transition hover:bg-white/10"
      >
        Try again
      </button>
    </div>
  );
}
