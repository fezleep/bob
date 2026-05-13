import { formatLeadDate, type LeadNote } from "@/lib/leads";

export function NotesSection({ notes }: { notes: LeadNote[] }) {
  return (
    <section className="quiet-panel rounded-lg p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink">Notes</h2>
        <button className="h-8 rounded-md border border-border bg-elevated px-3 text-sm text-ink transition hover:bg-white/10">
          Add note
        </button>
      </div>

      {notes.length > 0 ? (
        <div className="mt-5 space-y-3">
          {notes.map((note) => (
            <article key={note.id} className="rounded-lg border border-border/60 bg-elevated/45 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">Note</p>
                <p className="text-xs text-faint">{formatLeadDate(note.createdAt)}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{note.content}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-border/80 p-8 text-center">
          <h3 className="text-sm font-medium text-ink">No notes yet</h3>
          <p className="mt-2 text-sm text-muted">
            Capture context before the next conversation.
          </p>
        </div>
      )}
    </section>
  );
}
