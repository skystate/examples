export type Note = {
  id: string
  body: string
  updatedAt: number
}

export const title = (note: Note) => note.body.split('\n')[0]?.trim() || 'Note'

export const snippet = (note: Note) =>
  note.body.split('\n').slice(1).join(' ').trim() || 'No additional text'
