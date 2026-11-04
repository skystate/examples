import { useEffect, useState } from 'react'
import { useUserState } from '@skystate/react'

export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | null

export function useTheme() {
  // A null preference follows this device rather than syncing its appearance.
  const { value: preference, set: setPreference, syncStatus } =
    useUserState<ThemePreference>('theme', null)
  const [systemTheme, setSystemTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const updateTheme = () => setSystemTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', updateTheme)
    updateTheme()
    return () => media.removeEventListener('change', updateTheme)
  }, [])

  const theme = preference ?? systemTheme

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return { theme, preference, setPreference, syncStatus }
}
