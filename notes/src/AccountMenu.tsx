import { useEffect, useId, useRef, useState } from 'react'
import type { ThemePreference } from './useTheme'

type AccountMenuProps = {
  name: string
  email: string | null
  preference: ThemePreference
  onThemeChange: (preference: ThemePreference) => void
  onSignOut: () => void
}

const themes = [
  { value: null, label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const

export default function AccountMenu({ name, email, preference, onThemeChange, onSignOut }: AccountMenuProps) {
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
        onClick={() => { initialItem.current = themes.findIndex((theme) => theme.value === preference); setOpen(!open) }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          initialItem.current = event.key === 'ArrowUp' ? 3 : 0
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
            } else if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault()
              const index = itemsRef.current.indexOf(document.activeElement as HTMLButtonElement)
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3
                : (index + (event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1) + 4) % 4
              itemsRef.current[next]?.focus()
            }
          }}>
            <div className="account-theme" role="group" aria-label="Theme">
              <span aria-hidden="true">Theme</span>
              <div className="theme-options">
                {themes.map((theme, index) => (
                  <button
                    key={theme.label}
                    ref={(node) => { itemsRef.current[index] = node }}
                    type="button"
                    className="icon-button"
                    role="menuitemradio"
                    aria-label={theme.label}
                    aria-checked={preference === theme.value}
                    title={theme.label === 'System' ? 'Use device theme' : `${theme.label} theme`}
                    tabIndex={-1}
                    onClick={() => onThemeChange(theme.value)}
                  >
                    {theme.value === null ? (
                      <svg aria-hidden="true" viewBox="0 0 20 20">
                        <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" />
                        <path d="M10 13.5v3M6.5 16.5h7" />
                      </svg>
                    ) : <span aria-hidden="true">{theme.value === 'light' ? '☀' : '☾'}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div role="separator" className="account-divider" />
            <button ref={(node) => { itemsRef.current[3] = node }} type="button" role="menuitem" tabIndex={-1}
              onClick={() => { close(); onSignOut() }}>Sign out</button>
          </div>
        </div>
      )}
    </div>
  )
}
