import { useEffect } from 'react'
import { suppressSaveShortcut } from './saveShortcut'

// Notes already save as the user types; acknowledge the familiar shortcut
// without opening the browser's Save Page dialog.
export function useSaveShortcut(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    window.addEventListener('keydown', suppressSaveShortcut)
    return () => window.removeEventListener('keydown', suppressSaveShortcut)
  }, [enabled])
}
