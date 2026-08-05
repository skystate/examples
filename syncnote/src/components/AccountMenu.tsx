type AccountMenuProps = {
  initials: string
  onSignOut: () => void
}

export default function AccountMenu({ initials, onSignOut }: AccountMenuProps) {
  return (
    <div className="flex items-center gap-3 border-l border-line pl-4 @max-mobile/app:pl-3">
      <div
        aria-hidden="true"
        className="grid size-[32px] flex-none place-items-center rounded-full border border-line bg-sel text-[11px] font-semibold text-ink-2"
      >
        {initials}
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="text-[13px] text-ink-3 hover:text-ink @max-mobile/app:hidden"
      >
        Sign out
      </button>
    </div>
  )
}
