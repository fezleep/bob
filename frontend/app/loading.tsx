export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-44 animate-pulse rounded-md bg-elevated" />
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border border-border/60 bg-panel/70"
          />
        ))}
      </div>
    </div>
  );
}
