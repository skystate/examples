import type { Note } from '../hooks/useNotes'
import type { UserStateSyncStatus as SyncStatus } from '@skystate/react'
import { formatDate, formatRelative } from '../format'
import SyncIndicator from './SyncIndicator'
import { ChevronLeftIcon, TrashIcon } from './icons'

type EditorHeaderProps = {
  note: Note
  syncStatus: SyncStatus
  onDelete: () => void
  onBack: () => void
}

export default function EditorHeader({ note, syncStatus, onDelete, onBack }: EditorHeaderProps) {
  return (
    <div className="flex h-[44px] flex-none items-center gap-3 border-b border-line-2 px-6 @max-mobile/app:h-[56px] @max-mobile/app:border-line @max-mobile/app:px-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to notes"
        className="-ml-2.5 hidden h-[44px] flex-none items-center gap-[5px] rounded-r1 px-2.5 text-[15px] text-ink-2 active:bg-sel @max-mobile/app:flex"
      >
        <ChevronLeftIcon className="h-[18px] w-[18px]" />
        Notes
      </button>

      {/* No title here. The first line of the body is the title, and it is
          already on screen, so the chrome only carries the timestamp. */}
      <div className="mr-auto min-w-0 overflow-hidden text-[12.5px] text-ellipsis whitespace-nowrap text-ink-3 @max-mobile/app:hidden">
        {`created ${formatDate(note.createdAt)} · edited ${formatRelative(note.updatedAt)}`}
      </div>

      <div className="flex flex-none items-center @max-mobile/app:ml-auto">
        <SyncIndicator status={syncStatus} />
      </div>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete note"
        className="grid h-[30px] w-[30px] flex-none place-items-center rounded-r1 text-ink-3 hover:bg-bad/10 hover:text-bad active:text-bad @max-mobile/app:-mr-2.5 @max-mobile/app:h-[44px] @max-mobile/app:w-[44px] @max-mobile/app:active:bg-sel"
      >
        <TrashIcon className="h-[17px] w-[17px]" />
      </button>
    </div>
  )
}
