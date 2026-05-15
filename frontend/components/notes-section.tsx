import { formatTemporalPhrase, type LeadNote } from "@/lib/leads";

export function NotesSection({ notes }: { notes: LeadNote[] }) {
  return (
    <section className="quiet-panel rounded-lg p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Context
          </p>
          <h2 className="mt-2 text-sm font-medium text-ink">Notes</h2>
        </div>
        <button className="focus-ring h-8 rounded-md border border-border/75 bg-elevated/70 px-3 text-sm text-ink transition duration-200 hover:border-border hover:bg-white/[0.075] active:scale-[0.98]">
          Add note
        </button>
      </div>

      {notes.length > 0 ? (
        <div className="mt-5 space-y-3">
          {notes.map((note, index) => (
            <article
              key={note.id}
              className="motion-fade group rounded-lg border border-border/55 bg-elevated/[0.3] p-4 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] transition duration-200 hover:border-border/80 hover:bg-elevated/[0.4]"
              style={{ animationDelay: `${index * 54}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">Note</p>
                <p className="text-xs text-faint transition duration-200 group-hover:text-muted">
                  {formatTemporalPhrase(note.createdAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{note.content}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-border/70 bg-elevated/[0.18] p-8 text-center">
          <div className="mx-auto size-8 rounded-md border border-border/65 bg-panel/70 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]" />
          <h3 className="mt-4 text-sm font-medium text-ink">No notes yet</h3>
          <p className="mt-2 text-sm text-muted">
            Capture context before the next conversation.
          </p>
        </div>
      )}
    </section>
  );
}
