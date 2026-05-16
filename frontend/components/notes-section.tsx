import { formatLeadDate, type LeadNote } from "@/lib/leads";

export function NotesSection({
  notes,
  momentumRead,
}: {
  notes: LeadNote[];
  momentumRead: string;
}) {
  return (
    <section className="quiet-panel rounded-lg p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Notes
          </p>
          <h2 className="mt-2 text-base font-medium text-ink">
            Conversation memory
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Keep the human context close to the work. The strongest note should
            make the next move obvious.
          </p>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="mt-6 space-y-3">
          {notes.map((note, index) => (
            <article
              key={note.id}
              className="group rounded-lg border border-border/45 bg-elevated/[0.24] p-4 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset] transition duration-200 hover:border-border/75 hover:bg-elevated/[0.38]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    {index === 0 ? "Latest note" : "Note"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">
                    {index === 0 ? momentumRead : "Stored context"}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-faint">
                  {formatLeadDate(note.createdAt)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted transition duration-200 group-hover:text-ink/80">
                {note.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-elevated/[0.14] p-8 text-center">
          <div className="mx-auto size-8 rounded-md border border-border/55 bg-panel/70 shadow-[0_1px_0_rgb(255_255_255/0.025)_inset]" />
          <h3 className="mt-4 text-sm font-medium text-ink">No notes yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            Add the first useful signal before the next conversation.
          </p>
        </div>
      )}
    </section>
  );
}
