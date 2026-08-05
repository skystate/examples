import { useEffect, useRef, useState } from 'react'

type NoteEditorProps = {
  body: string
  /** Bumped on desktop select and on create; 0 means "leave focus alone". */
  focusTick: number
  onChange: (body: string) => void
}

export default function NoteEditor({ body, focusTick, onChange }: NoteEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState(body)

  // Adopting the stored body mid-typing would fight the keystroke that just
  // produced it. Only take it while the textarea is unfocused, which is
  // exactly the sketch's `render()` rule.
  useEffect(() => {
    if (document.activeElement !== ref.current) setDraft(body)
  }, [body])

  // Focus is driven by an explicit signal rather than by mounting: this
  // remounts on every note switch, including the ones the user did not ask to
  // type into (delete, auto-selection on load), and on mobile it sits mounted
  // behind the list where a focus would pop the keyboard over nothing.
  useEffect(() => {
    const el = ref.current
    if (focusTick === 0 || el === null) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [focusTick])

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-y-auto">
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(e.target.value)
        }}
        spellCheck={false}
        aria-label="Note body"
        placeholder="Start typing. The first line becomes the title."
        // The oversized bottom padding keeps the caret away from the screen edge.
        className="w-full resize-none border-0 bg-transparent px-8 pt-8 pb-[320px] font-serif text-[17px] leading-[1.72] text-ink caret-accent outline-none placeholder:text-ink-3 placeholder:italic @min-mobile/app:@max-mid/app:px-6 @min-mobile/app:@max-mid/app:pt-6 @max-mobile/app:px-5 @max-mobile/app:pt-6 @max-mobile/app:pb-[50%] @max-mobile/app:leading-[1.7]"
      />
    </div>
  )
}
