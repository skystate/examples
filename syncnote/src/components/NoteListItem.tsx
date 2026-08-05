import type { MouseEvent } from 'react'
import type { Note } from '../hooks/useNotes'
import { deriveTitle, deriveSnippet, formatRelative } from '../format'
import { TrashIcon, ChevronRightIcon } from './icons'

type NoteListItemProps = {
  note: Note
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}

export default function NoteListItem({ note, selected, onSelect, onDelete }: NoteListItemProps) {
  const title = deriveTitle(note.body)
  // deriveTitle is the only source of the fallback, so comparing against it is
  // how we know to render the muted italic variant.
  const untitled = title === 'Untitled'

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onClick={onSelect}
      className={[
        'group relative block w-full cursor-pointer px-3 py-[11px] text-left hover:bg-sel/60',
        '@max-mobile/app:min-h-[44px] @max-mobile/app:py-[13px] @max-mobile/app:active:bg-sel',
        // Selection is dropped on mobile: the editor takes over the screen, so
        // there is no list left to point at.
        selected
          ? "bg-sel before:absolute before:top-3 before:bottom-3 before:-left-1.5 before:w-[2px] before:rounded-[2px] before:bg-ink before:content-[''] @max-mobile/app:bg-transparent @max-mobile/app:before:hidden"
          : '',
      ].join(' ')}
    >
      <div className="pr-10 @max-mobile/app:pr-8">
        <div
          className={[
            'flex min-w-0 items-baseline gap-2 text-[13.5px] @max-mobile/app:text-[15px]',
            untitled ? 'font-normal text-ink-3 italic' : 'font-medium text-ink',
          ].join(' ')}
        >
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{title}</span>
          <span aria-hidden="true" className="shrink-0 text-[12px] font-normal not-italic text-ink-3">
            ·
          </span>
          <span className="shrink-0 text-[12px] font-normal not-italic text-ink-3 @max-mobile/app:text-[13px]">
            {formatRelative(note.updatedAt)}
          </span>
        </div>

        <div className="mt-0.5 overflow-hidden text-[12px] text-ellipsis whitespace-nowrap text-ink-3 @max-mobile/app:mt-[3px] @max-mobile/app:text-[13px]">
          <span>{deriveSnippet(note.body)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete note"
        className="absolute inset-y-0 right-0 grid place-items-center px-3 text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-bad/10 hover:text-bad focus-visible:opacity-100 @max-mobile/app:hidden"
      >
        <TrashIcon className="h-[15px] w-[15px]" />
      </button>

      <span
        aria-hidden="true"
        className="absolute right-[10px] top-1/2 -mt-[7px] hidden text-ink-3 opacity-50 @max-mobile/app:block"
      >
        <ChevronRightIcon className="h-[14px] w-[14px]" />
      </span>
    </div>
  )
}
