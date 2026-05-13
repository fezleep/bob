export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-44 rounded-md" />
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="skeleton h-24 rounded-lg border border-border/60"
          />
        ))}
      </div>
    </div>
  );
}
