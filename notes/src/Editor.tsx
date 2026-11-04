import { lazy, Suspense } from 'react'
import type { Note } from './note'
import { title } from './note'
import './editor.css'

const NoteBody = lazy(() => import('./NoteBody'))

type EditorProps = {
  note: Note | null
  loading?: boolean
  onBack: () => void
  onChange: (body: string) => void
  onCreate: () => void
}

export default function Editor({ note, loading = false, onBack, onChange, onCreate }: EditorProps) {
  if (note === null) {
    return (
      <section className="editor empty-editor" aria-busy={loading}>
        {loading ? <p role="status">Loading notes…</p> : (
          <>
            <p>Nothing here yet.</p>
            <button type="button" onClick={onCreate}>New note</button>
          </>
        )}
      </section>
    )
  }

  return (
    <section className="editor">
      <div className="note-toolbar">
        <button
          type="button"
          className="editor-back"
          aria-label="Back to notes"
          onClick={onBack}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M12 4.5 6.5 10l5.5 5.5" />
          </svg>
        </button>
        <span className="editor-title">{title(note)}</span>
      </div>
      <Suspense fallback={<div className="note-body" aria-label="Loading editor" aria-busy="true" />}>
        <NoteBody key={note.id} body={note.body} onChange={onChange} />
      </Suspense>
    </section>
  )
}
