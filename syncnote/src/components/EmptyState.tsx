const KBD =
  'rounded-[5px] border border-b-2 border-line bg-panel px-[5px] py-[2px] font-mono text-[11px] text-ink-2'

type EmptyStateProps = {
  onCreate: () => void
  showShortcut?: boolean
  /** Extra rules for the outer box. The sidebar uses it for its mobile padding. */
  className?: string
}

export default function EmptyState({ onCreate, showShortcut, className = '' }: EmptyStateProps) {
  return (
    <div className={`grid flex-1 place-items-center p-8 @max-mobile/app:p-6 ${className}`}>
      <div className="max-w-[320px] text-center">
        <h3 className="mb-1.5 font-serif text-[19px] font-normal">Nothing here yet</h3>
        <p className="mb-6 text-[13.5px] leading-[1.6] text-ink-3">
          Your notes live in one place and follow you between devices.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-r2 bg-ink px-6 text-[13.5px] font-medium text-panel hover:opacity-[.86] active:translate-y-px"
        >
          New note
        </button>
        {showShortcut ? (
          <p className="mt-6 text-[12px] text-ink-3 @max-mobile/app:hidden">
            or press <span className={KBD}>⌘</span> <span className={KBD}>N</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
