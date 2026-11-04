import { useEffect, useState } from 'react'
import type { SkyStateHealth } from '@skystate/react'

// An empty fallback is not proof that a user's first read completed. Health stays
// loading until authenticated user state loads; an initial error must not reveal
// empty-state actions either. Once loaded, keep the notes visible during retries.
export function useNotesReadiness(health: SkyStateHealth, identity: string | null) {
  const [loadedIdentity, setLoadedIdentity] = useState<string | null>(null)

  useEffect(() => {
    if (identity === null) {
      setLoadedIdentity(null)
    } else if (health.status === 'ok') {
      setLoadedIdentity(identity)
    }
  }, [health.status, identity])

  return identity !== null && loadedIdentity === identity
}
