import type { Note } from '../hooks/useNotes'
import type { UserStateSyncStatus as SyncStatus } from '@skystate/react'
import EditorHeader from './EditorHeader'
import NoteEditor from './NoteEditor'
import EmptyState from './EmptyState'

type EditorPaneProps = {
  note: Note | null
  isEmpty: boolean
  syncStatus: SyncStatus
  focusTick: number
  onChangeBody: (body: string) => void
  onDelete: (id: string) => void
  onBack: () => void
  onCreate: () => void
}

export default function EditorPane({
  note,
  isEmpty,
  syncStatus,
  focusTick,
  onChangeBody,
  onDelete,
  onBack,
  onCreate,
}: EditorPaneProps) {
  // AppShell decides where this column sits (on mobile it is pushed over the
  // list); here it is only ever a flex column filling whatever it is given.
  //
  // The empty state is driven by having no notes at all, not by having nothing
  // selected: notes with none selected is a transient (a delete, or the tick
  // before the auto-selection lands) and it should render nothing rather than
  // offer to start over.
  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-panel">
      {isEmpty ? (
        <EmptyState onCreate={onCreate} showShortcut />
      ) : note === null ? null : (
        <>
          <EditorHeader
            note={note}
            syncStatus={syncStatus}
            onDelete={() => onDelete(note.id)}
            onBack={onBack}
          />
          {/* The key is load-bearing: NoteEditor holds a local draft, so
              switching notes must remount it rather than let a stale draft
              refuse the new body. */}
          <NoteEditor
            key={note.id}
            body={note.body}
            focusTick={focusTick}
            onChange={onChangeBody}
          />
        </>
      )}
    </div>
  )
}
