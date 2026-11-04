import { useEffect, useRef, useState } from 'react'
import type { Note } from './note'
import { title } from './note'
import { noteLinks } from './noteLinks'
import './editor.css'

type EditorProps = {
  note: Note | null
  loading?: boolean
  onBack: () => void
  onChange: (body: string) => void
  onCreate: () => void
}

export default function Editor({ note, loading = false, onBack, onChange, onCreate }: EditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [preview, setPreview] = useState(false)
  const noteId = note?.id ?? null

  useEffect(() => {
    const editor = editorRef.current
    if (noteId === null || editor === null) return
    editor.focus()
    editor.setSelectionRange(editor.value.length, editor.value.length)
  }, [noteId, preview])

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
        <button
          type="button"
          className="preview-toggle"
          aria-pressed={preview}
          onClick={() => setPreview((current) => !current)}
        >
          {preview ? 'Edit note' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div className="note-preview" aria-label="Note preview">
          {note.body.length === 0 ? <span className="preview-placeholder">This note is empty.</span> : (
            noteLinks(note.body).map((segment, index) => segment.href ? (
              <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer">
                {segment.text}
              </a>
            ) : segment.text)
          )}
        </div>
      ) : (
        <textarea
          ref={editorRef}
          aria-label="Note body"
          placeholder="Start typing. The first line becomes the title."
          value={note.body}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </section>
  )
}
