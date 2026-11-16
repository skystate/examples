import { lazy, Suspense } from 'react'
import type { Note } from './note'
import './editor.css'

const NoteBody = lazy(() => import('./NoteBody'))

type EditorProps = {
  note: Note | null
  loading?: boolean
  onChange: (body: string) => void
  onCreate: () => void
}

export default function Editor({ note, loading = false, onChange, onCreate }: EditorProps) {
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
      <Suspense fallback={<div className="note-body" aria-label="Loading editor" aria-busy="true" />}>
        <NoteBody key={note.id} body={note.body} onChange={onChange} />
      </Suspense>
    </section>
  )
}
