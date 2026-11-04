import { useEffect, useRef } from 'react'
import type { ThemePreference } from './useTheme'
import './theme.css'

type SettingsProps = {
  preference: ThemePreference
  onThemeChange: (preference: ThemePreference) => void
  onBack: () => void
  disabled?: boolean
}

export default function Settings({
  preference,
  onThemeChange,
  onBack,
  disabled = false,
}: SettingsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="settings" aria-labelledby="settings-title">
      <button type="button" className="settings-back" onClick={onBack}>
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M12 4.5 6.5 10l5.5 5.5" />
        </svg>
        Back to notes
      </button>
      <h1 ref={headingRef} id="settings-title" tabIndex={-1}>Settings</h1>
      <fieldset className="theme-options" disabled={disabled} aria-describedby="theme-description">
        <legend>Appearance</legend>
        <p id="theme-description">Choose a theme. System follows this device’s appearance.</p>
        {([
          { value: null, label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ] as const).map(({ value, label }) => (
          <label key={label} className="theme-option">
            <input
              type="radio"
              name="theme"
              value={value ?? 'system'}
              checked={preference === value}
              onChange={() => onThemeChange(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </section>
  )
}
