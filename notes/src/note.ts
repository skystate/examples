export type Note = {
  id: string
  body: string
  updatedAt: number
}

// One heading "#" run, bullet (with optional checkbox) or quote ">" at the line start.
const blockPrefix = /^\s*(?:#{1,6}(?:\s+|$)|[-*+]\s+(?:\[[ xX]\]\s+)?|>\s*)/
// A matched marker pair hugging non-space text; "_" pairs only at word boundaries.
const starOrTildePair = /(\*\*|~~|\*)(?=\S)(.+?)(?<=\S)\1/g
const underscorePair = /(?<!\w)(__|_)(?=\S)(.+?)(?<=\S)\1(?!\w)/g
const codeSpan = /(`[^`]*`)/

const withoutEmphasis = (text: string) =>
  text.replace(starOrTildePair, '$2').replace(underscorePair, '$2')

// Drop one block prefix, then paired emphasis markers outside backticks.
function plain(line: string) {
  const parts = line.replace(blockPrefix, '').split(codeSpan)
  // The capture group puts each code span at an odd index.
  const stripped = parts.map((part, index) => (index % 2 === 1 ? part : withoutEmphasis(part)))
  return stripped.join('').trim()
}

export const title = (note: Note) => plain(note.body.split('\n')[0] ?? '') || 'Note'

export const snippet = (note: Note) =>
  note.body.split('\n').slice(1).map(plain).join(' ').trim() || 'No additional text'
