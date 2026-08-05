import { useEffect, useRef, useState } from 'react'
import { useStatus, useUserState } from '@skystate/react'
import type { UserStateSyncStatus } from '@skystate/react'

type Note = {
  id: string
  body: string
  updatedAt: number
}

type Theme = 'light' | 'dark'

const title = (note: Note) => note.body.split('\n')[0]?.trim() || 'Note'

const snippet = (note: Note) =>
  note.body.split('\n').slice(1).join(' ').trim() || 'No additional text'

const initialsFrom = (name: string | null, email: string | null) => {
  const initials = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
  return (initials || email?.[0] || '?').toUpperCase()
}

function Login({ authenticating, onLogin }: { authenticating: boolean; onLogin: () => void }) {
  return (
    <main className="landing">
      <strong className="wordmark">notes</strong>
      <h1>A notepad that remembers.</h1>
      <p>Plain-text notes that follow you across devices.</p>
      <button type="button" disabled={authenticating} onClick={onLogin}>
        {authenticating ? 'Signing in…' : 'Sign in'}
      </button>
    </main>
  )
}

type HeaderProps = {
  initials: string
  theme: Theme
  syncStatus: UserStateSyncStatus
  onToggleTheme: () => void
  onSignOut: () => void
}

function Header({ initials, theme, syncStatus, onToggleTheme, onSignOut }: HeaderProps) {
  const syncLabel =
    syncStatus === 'syncing' ? 'Saving' : syncStatus === 'synced' ? 'Saved' : 'Not saved yet'

  return (
    <header className="topbar">
      <strong className="wordmark">notes</strong>
      <span className={`sync-status ${syncStatus}`}>
        <span className="sync-dot" aria-hidden="true" />
        {syncLabel}
      </span>
      <button
        type="button"
        className="icon-button"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        onClick={onToggleTheme}
      >
        {theme === 'light' ? '☾' : '☀'}
      </button>
      <span className="avatar" aria-hidden="true">
        {initials}
      </span>
      <button type="button" className="text-button" onClick={onSignOut}>
        Sign out
      </button>
    </header>
  )
}

type NoteListProps = {
  loading: boolean
  notes: Note[]
  selectedId: string | null
  onCreate: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function NoteList({ loading, notes, selectedId, onCreate, onSelect, onDelete }: NoteListProps) {
  return (
    <aside className="sidebar">
      <div className="note-list-scroll">
        {loading && notes.length === 0 ? (
          <p className="message">Loading…</p>
        ) : notes.length === 0 ? (
          <div className="empty-list">
            <p>Your notes will follow you between devices.</p>
          </div>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note.id} className={note.id === selectedId ? 'selected' : ''}>
                <button type="button" className="note-link" onClick={() => onSelect(note.id)}>
                  <span className="note-title">{title(note)}</span>
                  <span className="note-snippet">{snippet(note)}</span>
                </button>
                <button
                  type="button"
                  className="delete-button"
                  aria-label={`Delete ${title(note)}`}
                  onClick={() => onDelete(note.id)}
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="M3 4.5h10M6.5 4.5V3.2h3v1.3M4.4 4.5l.5 8.3h6.2l.5-8.3" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="new-note-button" onClick={onCreate}>
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path d="M8 3.5v9M3.5 8h9" />
        </svg>
        <span>New note</span>
      </button>
    </aside>
  )
}

type EditorProps = {
  note: Note | null
  onBack: () => void
  onChange: (body: string) => void
  onCreate: () => void
}

function Editor({ note, onBack, onChange, onCreate }: EditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const noteId = note?.id ?? null

  useEffect(() => {
    const editor = editorRef.current
    if (noteId === null || editor === null) return
    editor.focus()
    editor.setSelectionRange(editor.value.length, editor.value.length)
  }, [noteId])

  if (note === null) {
    return (
      <section className="editor empty-editor">
        <p>Nothing here yet.</p>
        <button type="button" onClick={onCreate}>
          New note
        </button>
      </section>
    )
  }

  return (
    <section className="editor">
      <div className="editor-header">
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
      <textarea
        ref={editorRef}
        aria-label="Note body"
        placeholder="Start typing. The first line becomes the title."
        value={note.body}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}

export default function App() {

  // Ask SkyState for the current auth session and service health so the UI can handle sign-in and connectivity.
  const { auth, health } = useStatus()

  // Keep this user's notes synced through SkyState, starting with an empty list on their first visit.
  const {
    value: notes,
    set: setNotes,
    syncStatus: notesSyncStatus,
  } = useUserState<Note[]>('notes', [])

  // Keep this user's theme preference synced through SkyState, defaulting to their system preference.
  const {
    value: themeValue,
    set: setTheme,
    syncStatus: themeSyncStatus,
  } = useUserState<Theme>(
    'theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const initialSelectionHandled = useRef(false)

  const selectedNote = notes?.find((note) => note.id === selectedId) ?? null
  const theme = themeValue ?? 'light'
  const isSyncing = notesSyncStatus === 'syncing' || themeSyncStatus === 'syncing'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (initialSelectionHandled.current || !notes?.length) return
    initialSelectionHandled.current = true
    if (!window.matchMedia('(max-width: 700px)').matches) {
      setSelectedId((current) => current ?? notes[0].id)
    }
  }, [notes])

  useEffect(() => {
    if (!isSyncing) return
    const preventClose = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = true
    }
    window.addEventListener('beforeunload', preventClose)
    return () => window.removeEventListener('beforeunload', preventClose)
  }, [isSyncing])

  const createNote = () => {
    const now = Date.now()
    const note: Note = {
      id: crypto.randomUUID(),
      body: '',
      updatedAt: now,
    }
    setNotes((current) => [...(current ?? []), note])
    setSelectedId(note.id)
  }

  const updateNote = (body: string) => {
    if (selectedId === null) return
    setNotes((current) =>
      (current ?? []).map((note) =>
        note.id === selectedId ? { ...note, body, updatedAt: Date.now() } : note,
      ),
    )
  }

  const deleteNote = (id: string) => {
    const note = notes?.find((candidate) => candidate.id === id)
    if (note === undefined || !window.confirm(`Delete “${title(note)}”? This cannot be undone.`)) {
      return
    }
    setNotes((current) => (current ?? []).filter((candidate) => candidate.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
    }
  }

  const signOut = () => {
    if (isSyncing && !window.confirm('Changes are still syncing. Sign out anyway?')) return
    void auth.logout()
  }

  if (auth.status !== 'authenticated') {
    return (
      <Login
        authenticating={auth.status === 'authenticating'}
        onLogin={() => void auth.loginWithRedirect()}
      />
    )
  }

  return (
    <main className="app" data-editor-open={selectedId !== null}>
      <Header
        initials={initialsFrom(auth.name, auth.email)}
        theme={theme}
        syncStatus={notesSyncStatus}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onSignOut={signOut}
      />

      {health.status === 'error' && (
        <p className="error" role="alert">
          SkyState is unavailable. Changes will sync after it reconnects.
        </p>
      )}

      <div className="workspace">
        <NoteList
          loading={health.status === 'loading'}
          notes={notes ?? []}
          selectedId={selectedId}
          onCreate={createNote}
          onSelect={setSelectedId}
          onDelete={deleteNote}
        />
        <Editor
          note={selectedNote}
          onBack={() => setSelectedId(null)}
          onChange={updateNote}
          onCreate={createNote}
        />
      </div>
    </main>
  )
}
