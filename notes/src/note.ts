export type Note = {
  id: string
  body: string
  updatedAt: number
}

// Drop the markdown markers the editor hides or styles, so lists show plain text.
const plain = (line: string) => line
  .replace(/^\s*(?:#{1,6}\s+|#{1,6}$|>\s*)/, '')
  .replace(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/, '')
  .replace(/(\*\*|__|~~)(?=\S)(.+?)\1/g, '$2')
  .replace(/\*(?=\S)(.+?)\*/g, '$1')
  .replace(/(?<!\w)_(?=\S)(.+?)_(?!\w)/g, '$1')
  .trim()

export const title = (note: Note) => plain(note.body.split('\n')[0] ?? '') || 'Note'

export const snippet = (note: Note) =>
  note.body.split('\n').slice(1).map(plain).join(' ').trim() || 'No additional text'
