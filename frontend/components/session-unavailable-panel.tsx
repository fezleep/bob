export function SessionUnavailablePanel({ retryHref = "/workspace" }: { retryHref?: string }) {
  return (
    <div className="quiet-panel rounded-lg p-10 text-center">
      <h1 className="text-sm font-medium text-ink">Session validation is temporarily unavailable</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        Bob could not reach the backend to validate this session. Your browser session has not
        been cleared.
      </p>
      <a
        href={retryHref}
        className="focus-ring mt-5 inline-flex h-9 items-center rounded-md border border-border/75 bg-elevated/70 px-3 text-sm text-ink transition duration-200 hover:border-border hover:bg-white/[0.075] active:scale-[0.98]"
      >
        Try again
      </a>
    </div>
  );
}
