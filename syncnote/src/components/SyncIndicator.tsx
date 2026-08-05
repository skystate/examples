import type { ReactNode } from 'react'
import type { UserStateSyncStatus as SyncStatus } from '@skystate/react'

type SyncIndicatorProps = {
  status: SyncStatus
}

const PIP: Record<SyncStatus, string> = {
  unset: 'bg-ink-3',
  syncing: 'bg-warn animate-[sync-pulse_900ms_infinite]',
  synced: 'bg-ok',
}

// Reports the account's write queue, not the note's. Mobile keeps the pip and
// drops the word: the header has no room, and the colour carries the state.
export default function SyncIndicator({ status }: SyncIndicatorProps) {
  return (
    <div
      className={`flex flex-none items-center justify-end gap-[7px] text-[12.5px] tabular-nums ${
        status === 'unset' ? 'text-ink-3' : 'text-ink-2'
      }`}
    >
      <span className={`size-1.5 flex-none rounded-full ${PIP[status]}`} />
    </div>
  )
}
