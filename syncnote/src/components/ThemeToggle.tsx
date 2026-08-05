import { useTheme } from '../hooks/useTheme'
import { MoonIcon, SunIcon } from './icons'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  const label = theme === 'light' ? 'Switch to dark' : 'Switch to light'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="-mr-1 grid size-[30px] flex-none place-items-center rounded-r1 text-ink-3 hover:bg-sel hover:text-ink"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
