import { useEffect, useState, useSyncExternalStore } from 'react'
import { client } from './skystate'

// True once the signed-in user's private state has loaded from the server.
function privateStateLoaded() {
  const { load } = client.getSnapshot().userState.private
  return load.status === 'ready' || (load.status === 'error' && load.data !== null)
}

// An empty fallback is not proof that a user's first read completed, and health can
// be ok before that read starts. Wait for the private state itself to load; an initial
// error must not reveal empty-state actions either. Once loaded, keep the notes
// visible during retries.
export function useNotesReadiness(identity: string | null) {
  const loaded = useSyncExternalStore(client.subscribe, privateStateLoaded)
  const [loadedIdentity, setLoadedIdentity] = useState<string | null>(null)

  useEffect(() => {
    if (identity === null) {
      setLoadedIdentity(null)
    } else if (loaded) {
      setLoadedIdentity(identity)
    }
  }, [loaded, identity])

  return identity !== null && loadedIdentity === identity
}
