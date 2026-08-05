import { useRef, useState } from 'react'
import type { Note } from '../hooks/useNotes'
import NoteList from './NoteList'
import EmptyState from './EmptyState'
import { PlusIcon } from './icons'

const WIDTH_KEY = 'syncnote:sidebar-width'
const DEFAULT_WIDTH = 300
const MIN_WIDTH = 220
const MAX_WIDTH = 480

const clampWidth = (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w))

function initialWidth(): number {
  const stored = Number(localStorage.getItem(WIDTH_KEY))
  return Number.isFinite(stored) && stored > 0 ? clampWidth(stored) : DEFAULT_WIDTH
}

type SidebarProps = {
  loading: boolean
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export default function Sidebar({ loading, notes, selectedId, onSelect, onCreate, onDelete }: SidebarProps) {
  const [width, setWidth] = useState(initialWidth)
  // Drag math lives in a ref so pointermove never closes over stale state.
  const drag = useRef({ startX: 0, startWidth: 0 })

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { startX: e.clientX, startWidth: width }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    setWidth(clampWidth(drag.current.startWidth + e.clientX - drag.current.startX))
  }

  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    setWidth((w) => {
      localStorage.setItem(WIDTH_KEY, String(w))
      return w
    })
  }

  const resetWidth = () => {
    setWidth(DEFAULT_WIDTH)
    localStorage.removeItem(WIDTH_KEY)
  }

  return (
    <aside
      style={{ '--sidebar-w': `${width}px` } as React.CSSProperties}
      className="relative flex min-h-0 w-[var(--sidebar-w)] flex-none flex-col border-r border-line bg-panel-2 @max-mobile/app:w-full @max-mobile/app:border-r-0 @max-mobile/app:bg-panel"
    >
      <div className="flex flex-none items-center gap-3 pt-4 pr-4 pb-3 pl-6 @max-mobile/app:pb-2 @max-mobile/app:pl-4">
        <h2 className="mr-auto text-[11px] font-semibold tracking-[.1em] uppercase text-ink-3">Notes</h2>
        {/* The FAB owns note creation on mobile, so this button steps aside there. */}
        <button
          type="button"
          onClick={onCreate}
          aria-label="New note"
          title="New note (⌘N)"
          className="grid h-[26px] w-[26px] flex-none place-items-center rounded-r1 text-ink-2 hover:bg-sel hover:text-ink @max-mobile/app:hidden"
        >
          <PlusIcon className="h-[15px] w-[15px]" />
        </button>
      </div>

      <NoteList notes={notes} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} />

      {!loading && notes.length === 0 ? (
        <>
          <div className="px-6 py-4 text-[12.5px] text-ink-3 @max-mobile/app:hidden">No notes yet.</div>
          {/* Only mobile gets the full card: on desktop the editor pane already carries one. */}
          <div className="hidden min-h-0 flex-1 @max-mobile/app:flex">
            <EmptyState onCreate={onCreate} className="@max-mobile/app:pb-[15%]" />
          </div>
        </>
      ) : null}

      {/* Straddles the border so the hit area is comfortable while the divider
          stays a hairline. Double-click restores the default width. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onDoubleClick={resetWidth}
        className="group/resize absolute inset-y-0 -right-[7px] z-10 w-[14px] cursor-col-resize touch-none select-none @max-mobile/app:hidden"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-9 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-3/50 transition-colors group-hover/resize:bg-ink-3 group-active/resize:bg-ink-2"
        />
      </div>
    </aside>
  )
}
