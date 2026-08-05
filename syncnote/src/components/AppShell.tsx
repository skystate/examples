import type { Note } from '../hooks/useNotes'
import type { SkyStateHealth, UserStateSyncStatus as SyncStatus } from '@skystate/react'
import EditorPane from './EditorPane'
import ErrorBanner from './ErrorBanner'
import NewNoteFab from './NewNoteFab'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export type AppShellProps = {
  health: SkyStateHealth['status']
  userInitials: string
  mobileView: 'list' | 'editor'
  notes: Note[]
  selectedId: string | null
  syncStatus: SyncStatus
  focusTick: number
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onBack: () => void
  onChangeBody: (body: string) => void
  onSignOut: () => void
}

export default function AppShell({
  health,
  userInitials,
  mobileView,
  notes,
  selectedId,
  syncStatus,
  focusTick,
  onSelect,
  onCreate,
  onDelete,
  onBack,
  onChangeBody,
  onSignOut,
}: AppShellProps) {
  const selected = notes.find((n) => n.id === selectedId) ?? null

  // Until the first load resolves, an empty list means "unknown", not "no
  // notes": render the chrome only, never the empty state, or every reload
  // flashes "Nothing here yet" before the data lands.
  const loading = health === 'loading'

  // The wrappers use `display: contents` so they vanish on desktop and only
  // carry the mobile-only positioning rules the sketch puts on .topbar/.editor.
  const topBarClass =
    mobileView === 'editor' ? 'contents @max-mobile/app:hidden' : 'contents'
  const editorClass =
    mobileView === 'editor'
      ? 'contents @max-mobile/app:absolute @max-mobile/app:inset-0 @max-mobile/app:z-[38] @max-mobile/app:flex'
      : 'contents @max-mobile/app:hidden'

  return (
    <div className="@container/app flex h-dvh flex-col overflow-hidden bg-bg">
      {health === 'error' && <ErrorBanner />}

      <div className={topBarClass}>
        <TopBar userInitials={userInitials} onSignOut={onSignOut} />
      </div>

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          loading={loading}
          notes={notes}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreate={onCreate}
          onDelete={onDelete}
        />

        <div className={editorClass}>
          <EditorPane
            note={selected}
            isEmpty={!loading && notes.length === 0}
            syncStatus={syncStatus}
            focusTick={focusTick}
            onChangeBody={onChangeBody}
            onDelete={onDelete}
            onBack={onBack}
            onCreate={onCreate}
          />
        </div>

        {/* Mobile only; NewNoteFab carries that rule itself. Hidden with an
            empty list, where the empty state already offers a New note button. */}
        {notes.length > 0 && <NewNoteFab onCreate={onCreate} />}
      </div>
    </div>
  )
}
