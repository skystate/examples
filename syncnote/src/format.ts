const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

// The title is derived, never stored. There is no title field on Note, so a
// rename is just editing the first line, which is the thing you were already
// doing.
export function deriveTitle(body: string): string {
  return (body.split('\n')[0] ?? '').trim() || 'Untitled'
}

export function deriveSnippet(body: string): string {
  return body.split('\n').slice(1).join(' ').trim() || 'No additional text'
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelative(ts: number, now: number = Date.now()): string {
  const delta = now - ts
  if (delta < MINUTE) return 'just now'
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`
  if (delta < WEEK) return `${Math.floor(delta / DAY)}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
