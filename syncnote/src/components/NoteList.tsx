import type { Note } from '../hooks/useNotes'
import NoteListItem from './NoteListItem'

type NoteListProps = {
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function NoteList({ notes, selectedId, onSelect, onDelete }: NoteListProps) {
  return (
    // Empty hides rather than unmounts, so the listbox stays put for assistive tech.
    <div
      role="listbox"
      aria-label="Notes"
      className={`min-h-0 flex-1 overflow-y-auto px-3 pb-6 @max-mobile/app:px-2 @max-mobile/app:pb-24 ${notes.length === 0 ? 'hidden' : ''}`}
    >
      {/* Order is useNotes' business: it hands these over already sorted by updatedAt desc. */}
      {notes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          selected={note.id === selectedId}
          onSelect={() => onSelect(note.id)}
          onDelete={() => onDelete(note.id)}
        />
      ))}
    </div>
  )
}
