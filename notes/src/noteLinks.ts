export type NoteSegment = { text: string; href?: string }

function trimPunctuation(candidate: string) {
  let value = candidate.replace(/[.,!?;:]+$/, '')
  const brackets = [['(', ')'], ['[', ']'], ['{', '}']]
  while (brackets.some(([open, close]) =>
    value.endsWith(close) && value.split(close).length > value.split(open).length,
  )) {
    value = value.slice(0, -1).replace(/[.,!?;:]+$/, '')
  }
  return value
}

// Return text segments rather than HTML so note content is always escaped by React.
export function noteLinks(body: string): NoteSegment[] {
  const segments: NoteSegment[] = []
  const matches = body.matchAll(/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi)
  let offset = 0

  for (const match of matches) {
    const text = trimPunctuation(match[0])
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
