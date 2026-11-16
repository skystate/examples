export type NoteSegment = { text: string; href?: string }

const punctuation = '.,!?;:'
const emphasisMarkers = '*_~'

// A trailing emphasis marker is dropped only if the line has the same character before the URL.
function trimPunctuation(candidate: string, lineBefore: string) {
  const usedMarkers = [...emphasisMarkers].filter((marker) => lineBefore.includes(marker))
  const trailing = new RegExp(`[${punctuation}${usedMarkers.join('')}]+$`)
  let value = candidate.replace(trailing, '')
  const brackets = [['(', ')'], ['[', ']'], ['{', '}']]
  while (brackets.some(([open, close]) =>
    value.endsWith(close) && value.split(close).length > value.split(open).length,
  )) {
    value = value.slice(0, -1).replace(trailing, '')
  }
  return value
}

// Return text segments rather than HTML so note content is always escaped by React.
export function noteLinks(body: string): NoteSegment[] {
  const segments: NoteSegment[] = []
  const matches = body.matchAll(/(?<![a-z0-9])(?:https?:\/\/|www\.)[^\s<>"']+/gi)
  let offset = 0

  for (const match of matches) {
    const lineStart = body.lastIndexOf('\n', match.index) + 1
    const lineBefore = body.slice(lineStart, match.index)
    const text = trimPunctuation(match[0], lineBefore)
    const href = /^www\./i.test(text) ? `https://${text}` : text
    try {
      const url = new URL(href)
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) continue
    } catch {
      continue
    }

    if (match.index > offset) segments.push({ text: body.slice(offset, match.index) })
    segments.push({ text, href })
    offset = match.index + text.length
  }

  if (offset < body.length) segments.push({ text: body.slice(offset) })
  return segments
}
