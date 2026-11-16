export type NoteSegment = { text: string; href?: string }

const punctuation = '.,!?;:'
const emphasisMarkers = '*_~'

// A wrapped URL (emphasis marker directly before it) also loses trailing emphasis markers.
function trimPunctuation(candidate: string, wrapped: boolean) {
  const trailing = new RegExp(`[${wrapped ? punctuation + emphasisMarkers : punctuation}]+$`)
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
    const wrapped = match.index > 0 && emphasisMarkers.includes(body[match.index - 1])
    const text = trimPunctuation(match[0], wrapped)
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
