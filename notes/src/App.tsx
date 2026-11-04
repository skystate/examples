import { useEffect, useRef, useState } from 'react'
import { useStatus, useUserState } from '@skystate/react'
import type { UserStateSyncStatus } from '@skystate/react'

import Editor from './Editor'
import AccountMenu from './AccountMenu'
import { SyncStatus, useBrowserOnline } from './SyncStatus'
import { useNotesReadiness } from './useNotesReadiness'
import { useSaveShortcut } from './useSaveShortcut'
import { useTheme } from './useTheme'
import type { ThemePreference } from './useTheme'
import type { Note } from './note'
import { title, snippet } from './note'

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
  name: string
  email: string | null
  health: ReturnType<typeof useStatus>['health']
  online: boolean
  syncStatus: UserStateSyncStatus
  preference: ThemePreference
  onThemeChange: (preference: ThemePreference) => void
  onSignOut: () => void
}

function Header({ name, email, health, online, syncStatus, preference, onThemeChange, onSignOut }: HeaderProps) {
  return (
    <header className="topbar">
      <strong className="wordmark">notes</strong>
      <SyncStatus health={health} syncStatus={syncStatus} online={online} />
      <AccountMenu
        name={name}
        email={email}
        preference={preference}
        onThemeChange={onThemeChange}
        onSignOut={onSignOut}
      />
    </header>
  )
}

type NoteListProps = {
  notes: Note[]
  selectedId: string | null
  onCreate: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function NoteList({ notes, selectedId, onCreate, onSelect, onDelete }: NoteListProps) {
  return (
    <aside className="sidebar">
      <div className="note-list-scroll">
        {notes.length === 0 ? (
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

export default function App() {
  // Ask SkyState for the current auth session and service health so the UI can handle sign-in and connectivity.
  const { auth, health } = useStatus()

  // Keep this user's notes synced through SkyState, starting with an empty list on their first visit.
  const {
    value: notes,
    set: setNotes,
    syncStatus: notesSyncStatus,
  } = useUserState<Note[]>('notes', [])

  const { preference, setPreference, syncStatus: themeSyncStatus } = useTheme()
  const online = useBrowserOnline()
  const identity = auth.status === 'authenticated' ? String(auth.claims.sub) : null
  const notesReady = useNotesReadiness(health, identity)
  useSaveShortcut(auth.status === 'authenticated')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const initialSelectionHandled = useRef(false)

  const selectedNote = notes?.find((note) => note.id === selectedId) ?? null
  const isSyncing = notesSyncStatus === 'syncing' || themeSyncStatus === 'syncing'

  useEffect(() => {
    setSelectedId(null)
    initialSelectionHandled.current = false
  }, [identity])

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
    if (!notesReady) return
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
        name={auth.name || auth.email || 'Account'}
        email={auth.email}
        health={health}
        online={online}
        syncStatus={isSyncing ? 'syncing' : notesSyncStatus}
        preference={preference}
        onThemeChange={setPreference}
        onSignOut={signOut}
      />

      {health.status === 'error' && (
        <p className="error" role="alert">
          {health.error.code === 'no_response' || health.error.code === 'server_unavailable'
            ? 'Cannot connect to SkyState. Keep this page open while it retries.'
            : 'Sync is unavailable. Keep this page open while the problem is resolved.'}
          {' '}Error: {health.error.message} ({health.error.code}).
        </p>
      )}

      {!notesReady ? (
        <p className="message" aria-live="polite">
          {!online ? 'Waiting to connect before loading your notes…'
            : health.status === 'error' ? 'Unable to load your notes. Keep this page open while SkyState retries.'
            : 'Loading…'}
        </p>
      ) : (
        <div className="workspace">
          <NoteList
            notes={notes ?? []}
            selectedId={selectedId}
            onCreate={createNote}
            onSelect={setSelectedId}
            onDelete={deleteNote}
          />
          <Editor
            key={selectedId}
            note={selectedNote}
            onBack={() => setSelectedId(null)}
            onChange={updateNote}
            onCreate={createNote}
          />
        </div>
      )}
    </main>
  )
}
