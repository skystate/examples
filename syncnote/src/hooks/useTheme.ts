import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useUserState } from '@skystate/react'

export type Theme = 'light' | 'dark'

// Module-level so `subscribe` keeps a stable identity and the store is
// subscribed to once for the life of the tab, not once per render.
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function subscribe(onChange: () => void) {
  darkQuery.addEventListener('change', onChange)
  return () => darkQuery.removeEventListener('change', onChange)
}

const getSystemTheme = (): Theme => (darkQuery.matches ? 'dark' : 'light')

// The sole owner of the `theme` key. Nothing else in the app may call
// useUserState('theme').
//
// null is the point of the type. It means "no stored preference", which is a
// different thing from having chosen light. Only null follows the OS, and it
// keeps following it live, so flipping the system theme with the app open moves
// the app with it. Toggling writes a real value, which pins the theme and,
// because it round-trips through the account, pins it on every device.
export function useTheme(): { theme: Theme; toggle: () => void } {
  const { value: stored, set } = useUserState<Theme | null>('theme', null)
  const system = useSyncExternalStore(subscribe, getSystemTheme)
  const theme = stored ?? system

  // index.html has already set this attribute from the OS before first paint.
  // This effect is what lets a stored preference take over afterwards, once the
  // account has loaded.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    // Read the token back instead of repeating the hex here. The line above has
    // already been applied, so this is the colour the app is actually painting
    // and it cannot drift from the palette in index.css.
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
  }, [theme])

  // Toggling off the system default writes the opposite of what is on screen,
  // which is what the button appears to promise.
  const toggle = useCallback(() => set(theme === 'dark' ? 'light' : 'dark'), [set, theme])

  return { theme, toggle }
}
