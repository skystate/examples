import { useEffect, useId, useRef, useState } from 'react'

type AccountMenuProps = {
  name: string
  email: string | null
  onSettings: () => void
  onSignOut: () => void
}

export default function AccountMenu({ name, email, onSettings, onSignOut }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const initialItem = useRef(0)
  const id = useId()

  useEffect(() => {
    if (!open) return
    itemsRef.current[initialItem.current]?.focus()
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="account" ref={rootRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        className="account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => { initialItem.current = 0; setOpen(!open) }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          initialItem.current = event.key === 'ArrowUp' ? 1 : 0
          setOpen(true)
        }}
      >
        <span className="account-name">{name}</span>
        <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {open && (
        <div className="account-dropdown">
          <div className="account-identity">
            <strong>{name}</strong>
            {email && <span>{email}</span>}
          </div>
          <div id={id} role="menu" aria-labelledby={`${id}-trigger`} onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              close()
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End', 's', 'S'].includes(event.key)) {
              event.preventDefault()
              const index = itemsRef.current.indexOf(document.activeElement as HTMLButtonElement)
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1
                : (index + (event.key === 'ArrowUp' ? -1 : 1) + 2) % 2
              itemsRef.current[next]?.focus()
            }
          }}>
            <button ref={(node) => { itemsRef.current[0] = node }} type="button" role="menuitem" tabIndex={-1}
              onClick={() => { close(); onSettings() }}>Settings</button>
            <div role="separator" className="account-divider" />
            <button ref={(node) => { itemsRef.current[1] = node }} type="button" role="menuitem" tabIndex={-1}
              onClick={() => { close(); onSignOut() }}>Sign out</button>
          </div>
        </div>
      )}
    </div>
  )
}
