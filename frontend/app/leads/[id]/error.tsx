"use client";

import Link from "next/link";

export default function LeadDetailError({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-6">
      <Link href="/leads" className="focus-ring inline-flex rounded-md text-sm text-muted transition duration-200 hover:text-ink">
        Back to leads
      </Link>
      <div className="quiet-panel rounded-lg p-10 text-center">
        <h1 className="text-sm font-medium text-ink">Unable to load this lead</h1>
        <p className="mt-2 text-sm text-muted">
          Check that the backend is running and try again.
        </p>
        <button
          onClick={reset}
          className="focus-ring mt-5 h-9 rounded-md border border-border/75 bg-elevated/70 px-3 text-sm text-ink transition duration-200 hover:border-border hover:bg-white/[0.075] active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
