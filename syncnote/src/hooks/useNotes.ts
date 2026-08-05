import { useCallback, useMemo } from 'react'
import { useUserState } from '@skystate/react'
import type { UserStateSyncStatus } from '@skystate/react'

export type Note = { id: string; body: string; createdAt: number; updatedAt: number }

export type UseNotesResult = {
  notes: Note[]
  syncStatus: UserStateSyncStatus
  create: () => string
  update: (id: string, body: string) => void
  remove: (id: string) => void
}

// Module-level so the fallback keeps a stable identity across renders and the
// sort memo below can actually hold.
const NO_NOTES: Note[] = []

// The sole owner of the `notes` key. Nothing else in the app may call
// useUserState('notes').
export function useNotes(): UseNotesResult {
  const { value, set, syncStatus } = useUserState<Note[]>('notes', NO_NOTES)
  // The SDK types value as nullable because clear() reverts a key to null. This
  // hook never calls clear(), so null can only mean "nothing stored yet".
  // Notes written before createdAt existed lack the field; the best available
  // stand-in is their last edit time.
  const stored = useMemo(
    () => (value ?? NO_NOTES).map((n) => (n.createdAt ? n : { ...n, createdAt: n.updatedAt })),
    [value],
  )

  const notes = useMemo(() => [...stored].sort((a, b) => b.updatedAt - a.updatedAt), [stored])

  // Every mutation is a whole-array rewrite. One key means create-and-update is
  // a single atomic write, so the list can never desync from the bodies. The
  // cost is that each save resends every note, which is bounded at this size.
  const create = useCallback(() => {
    const now = Date.now()
    const note: Note = { id: crypto.randomUUID(), body: '', createdAt: now, updatedAt: now }
    set([...stored, note])
    return note.id
  }, [set, stored])

  const update = useCallback(
    (id: string, body: string) => {
      set(stored.map((n) => (n.id === id ? { ...n, body, updatedAt: Date.now() } : n)))
    },
    [set, stored],
  )

  const remove = useCallback(
    (id: string) => {
      set(stored.filter((n) => n.id !== id))
    },
    [set, stored],
  )

  return { notes, syncStatus, create, update, remove }
}
