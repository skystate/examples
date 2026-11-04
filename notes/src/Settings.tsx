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
      <div className="settings-content">
        <h1 ref={headingRef} id="settings-title" tabIndex={-1}>Settings</h1>
        <p className="settings-description">Your preferences sync across devices. Changes save automatically.</p>
        <section className="settings-section" aria-labelledby="appearance-heading">
          <h2 id="appearance-heading">Appearance</h2>
          <div className="setting-row">
            <div>
              <label htmlFor="theme">Theme</label>
              <p id="theme-description">Choose light or dark, or match your device.</p>
            </div>
            <select id="theme" value={preference ?? 'system'} disabled={disabled}
              aria-describedby="theme-description"
              onChange={(event) => onThemeChange(event.target.value === 'system' ? null : event.target.value as ThemePreference)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </section>
      </div>
    </section>
  )
}
