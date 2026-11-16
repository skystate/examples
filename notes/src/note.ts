export type Note = {
  id: string
  body: string
  updatedAt: number
}

// One heading "#" run at the line start.
const headingPrefix = /^\s*#{1,6}(?:\s+|$)/
// A heading's closing "#" run, with a space before it.
const headingClosing = /\s+#+\s*$/
// One bullet (with optional checkbox) or quote ">" at the line start.
const blockPrefix = /^\s*(?:[-*+]\s+(?:\[[ xX]\]\s+)?|>\s*)/
// A matched marker pair hugging non-space text; "_" pairs only at word boundaries.
const starOrTildePair = /(\*\*|~~|\*)(?=\S)(.+?)(?<=\S)\1/g
const underscorePair = /(?<!\w)(__|_)(?=\S)(.+?)(?<=\S)\1(?!\w)/g
const codeSpan = /(`[^`]*`)/

function withoutBlockMarkers(line: string) {
  if (headingPrefix.test(line)) {
    return line.replace(headingPrefix, '').replace(headingClosing, '')
  }
  return line.replace(blockPrefix, '')
}

// Each pass drops one level of pairs, so repeat until nested pairs are gone.
function withoutEmphasis(text: string) {
  let current = text
  let previous = ''
  while (current !== previous) {
    previous = current
    current = current.replace(starOrTildePair, '$2').replace(underscorePair, '$2')
  }
  return current
}

// Drop block markers, then paired emphasis markers outside backticks.
function plain(line: string) {
  const parts = withoutBlockMarkers(line).split(codeSpan)
  // The capture group puts each code span at an odd index.
  const stripped = parts.map((part, index) => (index % 2 === 1 ? part : withoutEmphasis(part)))
  return stripped.join('').trim()
}

export const title = (note: Note) => plain(note.body.split('\n')[0] ?? '') || 'Note'

export const snippet = (note: Note) =>
  note.body.split('\n').slice(1).map(plain).join(' ').trim() || 'No additional text'
